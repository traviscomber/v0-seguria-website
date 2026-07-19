create table if not exists public.user_notification_preferences (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  channel text not null check (channel in ('email', 'sms', 'push', 'webhook')),
  enabled boolean not null default false,
  target text,
  min_severity text not null default 'warning' check (min_severity in ('warning', 'critical')),
  quiet_hours jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id, channel)
);

create index if not exists user_notification_preferences_user_idx
  on public.user_notification_preferences(user_id, organization_id);

create trigger user_notification_preferences_updated_at before update on public.user_notification_preferences
for each row execute function private.set_updated_at();

alter table public.user_notification_preferences enable row level security;

create policy user_notification_preferences_select_own
on public.user_notification_preferences for select to authenticated
using (user_id = (select auth.uid()));

create policy user_notification_preferences_manage_own
on public.user_notification_preferences for all to authenticated
using (user_id = (select auth.uid()))
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.memberships membership
    where membership.user_id = (select auth.uid())
      and membership.organization_id = user_notification_preferences.organization_id
  )
);

revoke all on public.user_notification_preferences from anon, authenticated;
grant select, insert, update, delete on public.user_notification_preferences to authenticated;

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
    coalesce(nullif(new.description, ''), 'Hay una situacion que requiere revision en uno de tus sitios.'),
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

  insert into public.notification_deliveries (
    organization_id, notification_id, channel, status, attempts, next_attempt_at, metadata
  )
  select
    notification.organization_id,
    notification.id,
    preference.channel,
    'pending',
    0,
    now(),
    jsonb_build_object(
      'target', preference.target,
      'minSeverity', preference.min_severity,
      'source', 'user_preference'
    )
  from public.notifications notification
  join public.user_notification_preferences preference
    on preference.organization_id = notification.organization_id
   and preference.user_id = notification.recipient_user_id
   and preference.enabled = true
   and (
    preference.min_severity = 'warning'
    or notification.severity = 'critical'
   )
  where notification.incident_id = new.id
  on conflict (notification_id, channel) do update
  set status = case when public.notification_deliveries.status = 'delivered' then 'delivered' else 'pending' end,
      next_attempt_at = case when public.notification_deliveries.status = 'delivered' then public.notification_deliveries.next_attempt_at else now() end,
      metadata = excluded.metadata;

  return new;
end;
$$;

create or replace function public.enqueue_notification_deliveries(target_notification_id uuid)
returns integer
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  inserted_count integer;
begin
  insert into public.notification_deliveries (
    organization_id, notification_id, channel, status, attempts, next_attempt_at, metadata
  )
  select
    notification.organization_id,
    notification.id,
    preference.channel,
    'pending',
    0,
    now(),
    jsonb_build_object(
      'target', preference.target,
      'minSeverity', preference.min_severity,
      'source', 'user_preference'
    )
  from public.notifications notification
  join public.user_notification_preferences preference
    on preference.organization_id = notification.organization_id
   and preference.user_id = notification.recipient_user_id
   and preference.enabled = true
   and (
    preference.min_severity = 'warning'
    or notification.severity = 'critical'
   )
  where notification.id = target_notification_id
  on conflict (notification_id, channel) do update
  set status = case when public.notification_deliveries.status = 'delivered' then 'delivered' else 'pending' end,
      next_attempt_at = case when public.notification_deliveries.status = 'delivered' then public.notification_deliveries.next_attempt_at else now() end,
      metadata = excluded.metadata;

  get diagnostics inserted_count = row_count;
  return inserted_count;
end;
$$;

revoke all on function public.enqueue_notification_deliveries(uuid) from public, anon, authenticated;
grant execute on function public.enqueue_notification_deliveries(uuid) to service_role;
