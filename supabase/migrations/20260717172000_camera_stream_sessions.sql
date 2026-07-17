create table if not exists public.camera_stream_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  property_id uuid not null,
  device_id uuid not null,
  gateway_id uuid,
  requested_by uuid references auth.users(id) on delete set null,
  status text not null default 'requested' check (status in ('requested', 'active', 'ended', 'expired', 'failed')),
  session_token_hash text not null unique,
  gateway_stream_ref text,
  expires_at timestamptz not null,
  started_at timestamptz,
  ended_at timestamptz,
  last_heartbeat_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, property_id, organization_id),
  foreign key (property_id, organization_id) references public.properties(id, organization_id) on delete cascade,
  foreign key (device_id, property_id, organization_id) references public.devices(id, property_id, organization_id) on delete cascade,
  foreign key (gateway_id, property_id, organization_id) references public.gateways(id, property_id, organization_id) on delete set null (gateway_id)
);

create index if not exists camera_stream_sessions_device_status_idx
  on public.camera_stream_sessions(device_id, status, expires_at desc);

create index if not exists camera_stream_sessions_gateway_requested_idx
  on public.camera_stream_sessions(gateway_id, status, created_at desc)
  where status in ('requested', 'active');

create trigger camera_stream_sessions_updated_at
  before update on public.camera_stream_sessions
  for each row execute function private.set_updated_at();

alter table public.camera_stream_sessions enable row level security;
revoke all on public.camera_stream_sessions from public, anon, authenticated;

create policy camera_stream_sessions_select_member on public.camera_stream_sessions
for select to authenticated
using ((select private.is_org_member(organization_id)));

grant select (
  id,
  organization_id,
  property_id,
  device_id,
  gateway_id,
  requested_by,
  status,
  expires_at,
  started_at,
  ended_at,
  last_heartbeat_at,
  metadata,
  created_at,
  updated_at
) on public.camera_stream_sessions to authenticated;
