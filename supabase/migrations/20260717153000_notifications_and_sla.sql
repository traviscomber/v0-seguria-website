create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  property_id uuid not null,
  incident_id uuid not null,
  recipient_user_id uuid not null references auth.users(id) on delete cascade,
  severity text not null check (severity in ('warning', 'critical')),
  title text not null check (char_length(title) between 3 and 160),
  body text not null check (char_length(body) between 3 and 1000),
  status text not null default 'unread' check (status in ('unread', 'read', 'acknowledged', 'escalated')),
  due_at timestamptz not null,
  read_at timestamptz,
  acknowledged_at timestamptz,
  escalated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (incident_id, recipient_user_id),
  unique (id, organization_id),
  foreign key (property_id, organization_id) references public.properties(id, organization_id) on delete cascade,
  foreign key (incident_id, property_id, organization_id)
    references public.incidents(id, property_id, organization_id) on delete cascade
);

create table public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  notification_id uuid not null,
  channel text not null check (channel in ('in_app', 'email', 'sms', 'push', 'webhook')),
  status text not null default 'pending' check (status in ('pending', 'sent', 'delivered', 'failed')),
  attempts integer not null default 0 check (attempts >= 0),
  next_attempt_at timestamptz,
  delivered_at timestamptz,
  provider_reference text,
  last_error text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (notification_id, channel),
  foreign key (notification_id, organization_id)
    references public.notifications(id, organization_id) on delete cascade
);

create index notifications_recipient_status_created_idx on public.notifications(recipient_user_id, status, created_at desc);
create index notifications_due_unacknowledged_idx on public.notifications(due_at)
  where status in ('unread', 'read');
create index notification_deliveries_pending_idx on public.notification_deliveries(next_attempt_at)
  where status in ('pending', 'failed');

create trigger notifications_updated_at before update on public.notifications
for each row execute function private.set_updated_at();
create trigger notification_deliveries_updated_at before update on public.notification_deliveries
for each row execute function private.set_updated_at();

alter table public.notifications enable row level security;
alter table public.notification_deliveries enable row level security;

create policy notifications_select_recipient on public.notifications for select to authenticated
using (recipient_user_id = (select auth.uid()));
create policy deliveries_select_recipient on public.notification_deliveries for select to authenticated
using (exists (
  select 1 from public.notifications notification
  where notification.id = notification_deliveries.notification_id
    and notification.recipient_user_id = (select auth.uid())
));

revoke all on public.notifications, public.notification_deliveries from anon, authenticated;
grant select on public.notifications, public.notification_deliveries to authenticated;

create or replace function private.enqueue_incident_notifications()
returns trigger
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
begin
  insert into public.notifications (
    organization_id, property_id, incident_id, recipient_user_id,
    severity, title, body, due_at
  )
  select
    new.organization_id, new.property_id, new.id, membership.user_id,
    new.severity, new.title,
    coalesce(nullif(new.description, ''), 'Hay una situación que requiere revisión en uno de tus sitios.'),
    new.created_at + case when new.severity = 'critical' then interval '5 minutes' else interval '30 minutes' end
  from public.memberships membership
  where membership.organization_id = new.organization_id
  on conflict (incident_id, recipient_user_id) do nothing;

  insert into public.notification_deliveries (
    organization_id, notification_id, channel, status, attempts, delivered_at
  )
  select notification.organization_id, notification.id, 'in_app', 'delivered', 1, now()
  from public.notifications notification
  where notification.incident_id = new.id
  on conflict (notification_id, channel) do nothing;

  return new;
end;
$$;

create trigger incidents_enqueue_notifications after insert on public.incidents
for each row execute function private.enqueue_incident_notifications();

create or replace function public.acknowledge_notification(target_notification_id uuid)
returns public.notifications
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  notification_record public.notifications%rowtype;
begin
  update public.notifications
  set status = 'acknowledged', read_at = coalesce(read_at, now()), acknowledged_at = coalesce(acknowledged_at, now())
  where id = target_notification_id and recipient_user_id = auth.uid()
  returning * into notification_record;

  if notification_record.id is null then raise exception 'Notification not found'; end if;

  insert into public.audit_log (
    organization_id, property_id, actor_user_id, action, target_type, target_id, payload
  ) values (
    notification_record.organization_id, notification_record.property_id, auth.uid(),
    'notification.acknowledged', 'notification', notification_record.id::text,
    jsonb_build_object('incident_id', notification_record.incident_id)
  );
  return notification_record;
end;
$$;

revoke all on function public.acknowledge_notification(uuid) from public, anon;
grant execute on function public.acknowledge_notification(uuid) to authenticated;

create or replace function public.escalate_overdue_notifications(check_at timestamptz default now())
returns bigint
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  escalated_count bigint;
begin
  with overdue as (
    update public.notifications
    set status = 'escalated', escalated_at = coalesce(escalated_at, check_at)
    where status in ('unread', 'read') and due_at <= check_at
    returning *
  ), audit_rows as (
    insert into public.audit_log (
      organization_id, property_id, actor_label, action, target_type, target_id, payload
    )
    select organization_id, property_id, 'Monitor SegurIA', 'notification.escalated',
      'notification', id::text, jsonb_build_object('incident_id', incident_id, 'recipient_user_id', recipient_user_id)
    from overdue
    returning 1
  )
  select count(*) into escalated_count from audit_rows;

  return escalated_count;
end;
$$;

revoke all on function public.escalate_overdue_notifications(timestamptz) from public, anon, authenticated;
grant execute on function public.escalate_overdue_notifications(timestamptz) to service_role;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end;
$$;
