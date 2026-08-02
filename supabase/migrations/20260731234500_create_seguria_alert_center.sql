create table if not exists public.seguria_alerts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete set null,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  module text not null default 'vision',
  alert_type text not null,
  severity text not null check (severity in ('info', 'low', 'medium', 'high', 'critical')),
  status text not null default 'open' check (status in ('open', 'acknowledged', 'resolved', 'dismissed')),
  source_type text not null,
  source_id uuid,
  camera_id uuid references public.wildlife_cameras(id) on delete set null,
  fingerprint text not null,
  title text not null check (char_length(title) between 1 and 180),
  summary text not null check (char_length(summary) between 1 and 1000),
  zone_label text,
  detected_at timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  acknowledged_by_user_id uuid references auth.users(id) on delete set null,
  acknowledged_at timestamptz,
  resolved_by_user_id uuid references auth.users(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.seguria_alerts is 'Cross-module operational alerts for SegurIA. Vision is the first producing module.';
comment on column public.seguria_alerts.fingerprint is 'Deterministic owner-scoped key used to prevent duplicate alerts.';
comment on column public.seguria_alerts.payload is 'Module-specific structured context. Sensitive coordinates must not be exposed to unauthorized clients.';

create unique index if not exists seguria_alerts_owner_fingerprint_uidx
  on public.seguria_alerts(owner_user_id, fingerprint);
create index if not exists seguria_alerts_owner_status_detected_idx
  on public.seguria_alerts(owner_user_id, status, detected_at desc);
create index if not exists seguria_alerts_org_status_detected_idx
  on public.seguria_alerts(organization_id, status, detected_at desc)
  where organization_id is not null;
create index if not exists seguria_alerts_camera_detected_idx
  on public.seguria_alerts(camera_id, detected_at desc)
  where camera_id is not null;
create index if not exists seguria_alerts_module_type_idx
  on public.seguria_alerts(module, alert_type, detected_at desc);

create table if not exists public.seguria_alert_activity (
  id uuid primary key default gen_random_uuid(),
  alert_id uuid not null references public.seguria_alerts(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null check (action in ('created', 'acknowledged', 'resolved', 'reopened', 'dismissed', 'auto_resolved')),
  previous_status text check (previous_status is null or previous_status in ('open', 'acknowledged', 'resolved', 'dismissed')),
  new_status text check (new_status is null or new_status in ('open', 'acknowledged', 'resolved', 'dismissed')),
  note text check (note is null or char_length(note) <= 1000),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

comment on table public.seguria_alert_activity is 'Immutable lifecycle log for SegurIA operational alerts.';

create index if not exists seguria_alert_activity_alert_created_idx
  on public.seguria_alert_activity(alert_id, created_at desc);

alter table public.seguria_alerts enable row level security;
alter table public.seguria_alert_activity enable row level security;

revoke all on public.seguria_alerts from anon;
revoke all on public.seguria_alert_activity from anon;
grant select, insert, update on public.seguria_alerts to authenticated;
grant select, insert on public.seguria_alert_activity to authenticated;

drop policy if exists seguria_alerts_select_authorized on public.seguria_alerts;
create policy seguria_alerts_select_authorized
  on public.seguria_alerts
  for select
  to authenticated
  using (
    owner_user_id = auth.uid()
    or (
      organization_id is not null
      and exists (
        select 1
        from public.memberships m
        where m.organization_id = seguria_alerts.organization_id
          and m.user_id = auth.uid()
      )
    )
  );

drop policy if exists seguria_alerts_insert_authorized on public.seguria_alerts;
create policy seguria_alerts_insert_authorized
  on public.seguria_alerts
  for insert
  to authenticated
  with check (
    owner_user_id = auth.uid()
    and (
      organization_id is null
      or exists (
        select 1
        from public.memberships m
        where m.organization_id = seguria_alerts.organization_id
          and m.user_id = auth.uid()
      )
    )
  );

drop policy if exists seguria_alerts_update_authorized on public.seguria_alerts;
create policy seguria_alerts_update_authorized
  on public.seguria_alerts
  for update
  to authenticated
  using (
    owner_user_id = auth.uid()
    or (
      organization_id is not null
      and exists (
        select 1
        from public.memberships m
        where m.organization_id = seguria_alerts.organization_id
          and m.user_id = auth.uid()
          and m.role in ('owner', 'admin', 'manager')
      )
    )
  )
  with check (
    owner_user_id = auth.uid()
    or (
      organization_id is not null
      and exists (
        select 1
        from public.memberships m
        where m.organization_id = seguria_alerts.organization_id
          and m.user_id = auth.uid()
          and m.role in ('owner', 'admin', 'manager')
      )
    )
  );

drop policy if exists seguria_alert_activity_select_authorized on public.seguria_alert_activity;
create policy seguria_alert_activity_select_authorized
  on public.seguria_alert_activity
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.seguria_alerts a
      where a.id = seguria_alert_activity.alert_id
        and (
          a.owner_user_id = auth.uid()
          or (
            a.organization_id is not null
            and exists (
              select 1
              from public.memberships m
              where m.organization_id = a.organization_id
                and m.user_id = auth.uid()
            )
          )
        )
    )
  );

drop policy if exists seguria_alert_activity_insert_authorized on public.seguria_alert_activity;
create policy seguria_alert_activity_insert_authorized
  on public.seguria_alert_activity
  for insert
  to authenticated
  with check (
    (actor_user_id is null or actor_user_id = auth.uid())
    and exists (
      select 1
      from public.seguria_alerts a
      where a.id = seguria_alert_activity.alert_id
        and (
          a.owner_user_id = auth.uid()
          or (
            a.organization_id is not null
            and exists (
              select 1
              from public.memberships m
              where m.organization_id = a.organization_id
                and m.user_id = auth.uid()
                and m.role in ('owner', 'admin', 'manager')
            )
          )
        )
    )
  );

drop trigger if exists seguria_alerts_set_updated_at on public.seguria_alerts;
create trigger seguria_alerts_set_updated_at
  before update on public.seguria_alerts
  for each row execute function public.update_updated_at_column();
