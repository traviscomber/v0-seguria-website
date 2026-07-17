create schema if not exists private;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  status text not null default 'active' check (status in ('active', 'suspended', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memberships (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'operator', 'technician', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  address text,
  timezone text not null default 'America/Santiago',
  status text not null default 'onboarding' check (status in ('onboarding', 'protected', 'attention', 'incident', 'offline', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, organization_id)
);

create table public.spaces (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  property_id uuid not null,
  name text not null check (char_length(name) between 1 and 120),
  kind text not null default 'other',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (property_id, name),
  unique (id, property_id, organization_id),
  foreign key (property_id, organization_id) references public.properties(id, organization_id) on delete cascade
);

create table public.gateways (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  property_id uuid not null,
  public_id text not null unique check (public_id ~ '^gw_[a-zA-Z0-9_-]{12,80}$'),
  name text not null,
  secret_hash text not null,
  status text not null default 'provisioning' check (status in ('provisioning', 'online', 'degraded', 'offline', 'revoked')),
  version text,
  last_seen_at timestamptz,
  activated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, property_id, organization_id),
  unique (id, organization_id),
  foreign key (property_id, organization_id) references public.properties(id, organization_id) on delete cascade
);

create table public.integrations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  property_id uuid,
  gateway_id uuid,
  provider text not null,
  display_name text not null,
  status text not null default 'pending' check (status in ('pending', 'connected', 'degraded', 'offline', 'revoked')),
  endpoint text,
  secret_ref text,
  external_account_ref text,
  last_sync_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique nulls not distinct (organization_id, property_id, provider),
  unique (id, organization_id),
  foreign key (property_id, organization_id) references public.properties(id, organization_id) on delete cascade,
  foreign key (gateway_id, organization_id) references public.gateways(id, organization_id) on delete cascade
);

create table public.devices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  property_id uuid not null,
  space_id uuid,
  gateway_id uuid,
  integration_id uuid,
  external_id text not null,
  name text not null,
  kind text not null check (kind in ('camera', 'motion', 'entry', 'smoke', 'gas', 'water', 'environment', 'alarm', 'siren', 'access', 'gateway', 'other')),
  manufacturer text,
  model text,
  status text not null default 'unknown' check (status in ('online', 'offline', 'alert', 'maintenance', 'unknown')),
  battery_level numeric(5,2) check (battery_level between 0 and 100),
  last_seen_at timestamptz,
  capabilities jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, external_id),
  unique (id, property_id, organization_id),
  foreign key (property_id, organization_id) references public.properties(id, organization_id) on delete cascade,
  foreign key (space_id, property_id, organization_id) references public.spaces(id, property_id, organization_id) on delete set null (space_id),
  foreign key (gateway_id, property_id, organization_id) references public.gateways(id, property_id, organization_id) on delete set null (gateway_id),
  foreign key (integration_id, organization_id) references public.integrations(id, organization_id) on delete set null (integration_id)
);

create table public.entities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  property_id uuid not null,
  device_id uuid not null,
  external_id text not null,
  domain text not null,
  device_class text,
  name text not null,
  unit text,
  writable boolean not null default false,
  enabled boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, external_id),
  unique (id, property_id, organization_id),
  foreign key (property_id, organization_id) references public.properties(id, organization_id) on delete cascade,
  foreign key (device_id, property_id, organization_id) references public.devices(id, property_id, organization_id) on delete cascade
);

create table public.entity_states (
  entity_id uuid primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  state text not null,
  severity text not null default 'info' check (severity in ('info', 'warning', 'critical')),
  attributes jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (entity_id, property_id, organization_id) references public.entities(id, property_id, organization_id) on delete cascade
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  property_id uuid not null,
  gateway_id uuid not null,
  device_id uuid,
  entity_id uuid,
  external_event_id text not null,
  event_type text not null,
  severity text not null check (severity in ('info', 'warning', 'critical')),
  state text,
  source text not null,
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  payload_version integer not null default 1 check (payload_version > 0),
  payload jsonb not null default '{}'::jsonb,
  unique (gateway_id, external_event_id),
  unique (id, property_id, organization_id),
  foreign key (property_id, organization_id) references public.properties(id, organization_id) on delete cascade,
  foreign key (gateway_id, property_id, organization_id) references public.gateways(id, property_id, organization_id) on delete restrict,
  foreign key (device_id, property_id, organization_id) references public.devices(id, property_id, organization_id) on delete set null (device_id),
  foreign key (entity_id, property_id, organization_id) references public.entities(id, property_id, organization_id) on delete set null (entity_id)
);

create table public.incidents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  property_id uuid not null,
  primary_event_id uuid,
  assigned_to uuid references auth.users(id) on delete set null,
  title text not null,
  description text,
  severity text not null check (severity in ('warning', 'critical')),
  status text not null default 'new' check (status in ('new', 'validating', 'confirmed', 'responding', 'resolved', 'false_alarm')),
  acknowledged_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, property_id, organization_id),
  foreign key (property_id, organization_id) references public.properties(id, organization_id) on delete cascade,
  foreign key (primary_event_id, property_id, organization_id) references public.events(id, property_id, organization_id) on delete set null (primary_event_id)
);

create table public.camera_snapshots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  property_id uuid not null,
  device_id uuid not null,
  object_path text not null unique,
  mime_type text not null check (mime_type in ('image/jpeg', 'image/webp')),
  size_bytes integer not null check (size_bytes > 0 and size_bytes <= 5242880),
  captured_at timestamptz not null,
  created_at timestamptz not null default now(),
  foreign key (property_id, organization_id) references public.properties(id, organization_id) on delete cascade,
  foreign key (device_id, property_id, organization_id) references public.devices(id, property_id, organization_id) on delete cascade
);

create table public.incident_events (
  incident_id uuid not null,
  event_id uuid not null,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  property_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (incident_id, event_id),
  foreign key (incident_id, property_id, organization_id) references public.incidents(id, property_id, organization_id) on delete cascade,
  foreign key (event_id, property_id, organization_id) references public.events(id, property_id, organization_id) on delete cascade
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  organization_id uuid not null references public.organizations(id) on delete restrict,
  property_id uuid,
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_gateway_id uuid,
  action text not null,
  target_type text not null,
  target_id text,
  ip_address inet,
  user_agent text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (actor_user_id is not null or actor_gateway_id is not null),
  foreign key (property_id, organization_id) references public.properties(id, organization_id) on delete set null (property_id),
  foreign key (actor_gateway_id, organization_id) references public.gateways(id, organization_id) on delete set null (actor_gateway_id)
);

create index memberships_user_id_idx on public.memberships(user_id);
create index properties_organization_id_idx on public.properties(organization_id);
create index spaces_property_id_idx on public.spaces(property_id);
create index gateways_property_id_idx on public.gateways(property_id);
create index integrations_organization_id_idx on public.integrations(organization_id);
create index devices_property_status_idx on public.devices(property_id, status);
create index entities_device_id_idx on public.entities(device_id);
create index entity_states_property_id_idx on public.entity_states(property_id);
create index events_property_received_at_idx on public.events(property_id, received_at desc);
create index events_org_type_occurred_at_idx on public.events(organization_id, event_type, occurred_at desc);
create index incidents_property_status_idx on public.incidents(property_id, status);
create unique index incidents_primary_event_unique_idx on public.incidents(primary_event_id) where primary_event_id is not null;
create index camera_snapshots_device_captured_at_idx on public.camera_snapshots(device_id, captured_at desc);
create index audit_log_org_created_at_idx on public.audit_log(organization_id, created_at desc);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.is_org_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships
    where organization_id = target_organization_id
      and user_id = (select auth.uid())
  );
$$;

create or replace function private.has_org_role(target_organization_id uuid, allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships
    where organization_id = target_organization_id
      and user_id = (select auth.uid())
      and role = any(allowed_roles)
  );
$$;

create or replace function public.provision_client_account(
  target_user_id uuid,
  organization_name text,
  organization_slug text,
  property_name text,
  property_address text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_organization_id uuid;
  new_property_id uuid;
begin
  if not exists (select 1 from auth.users where id = target_user_id) then
    raise exception 'Auth user does not exist';
  end if;

  insert into public.organizations (name, slug)
  values (organization_name, organization_slug)
  returning id into new_organization_id;

  insert into public.memberships (organization_id, user_id, role)
  values (new_organization_id, target_user_id, 'owner');

  insert into public.properties (organization_id, name, address)
  values (new_organization_id, property_name, property_address)
  returning id into new_property_id;

  insert into public.spaces (organization_id, property_id, name, kind, sort_order)
  values
    (new_organization_id, new_property_id, 'Acceso principal', 'entry', 10),
    (new_organization_id, new_property_id, 'Interior', 'interior', 20),
    (new_organization_id, new_property_id, 'Perimetro', 'perimeter', 30);

  return jsonb_build_object(
    'organization_id', new_organization_id,
    'property_id', new_property_id
  );
end;
$$;

create or replace function public.ingest_security_event(
  gateway_public_id text,
  integration_provider text,
  external_event_id text,
  external_device_id text,
  external_entity_id text,
  device_name text,
  device_kind text,
  entity_name text,
  entity_domain text,
  entity_device_class text,
  entity_state text,
  event_type text,
  event_severity text,
  event_occurred_at timestamptz,
  event_payload jsonb default '{}'::jsonb,
  state_attributes jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  gateway_record public.gateways%rowtype;
  integration_record public.integrations%rowtype;
  device_record public.devices%rowtype;
  entity_record public.entities%rowtype;
  event_record public.events%rowtype;
  incident_record public.incidents%rowtype;
begin
  select * into gateway_record
  from public.gateways
  where public_id = gateway_public_id
    and status <> 'revoked'
  for update;

  if gateway_record.id is null then
    raise exception 'Gateway not found or revoked';
  end if;

  insert into public.integrations (
    organization_id,
    property_id,
    gateway_id,
    provider,
    display_name,
    status,
    last_sync_at
  ) values (
    gateway_record.organization_id,
    gateway_record.property_id,
    gateway_record.id,
    integration_provider,
    'Puente operativo',
    'connected',
    now()
  )
  on conflict (organization_id, property_id, provider)
  do update set
    gateway_id = excluded.gateway_id,
    status = 'connected',
    last_sync_at = now(),
    updated_at = now()
  returning * into integration_record;

  insert into public.devices (
    organization_id,
    property_id,
    gateway_id,
    integration_id,
    external_id,
    name,
    kind,
    status,
    last_seen_at
  ) values (
    gateway_record.organization_id,
    gateway_record.property_id,
    gateway_record.id,
    integration_record.id,
    external_device_id,
    device_name,
    device_kind,
    case when entity_state in ('unavailable', 'offline') then 'offline'
         when event_severity = 'critical' then 'alert'
         else 'online' end,
    event_occurred_at
  )
  on conflict (organization_id, external_id)
  do update set
    property_id = excluded.property_id,
    gateway_id = excluded.gateway_id,
    integration_id = excluded.integration_id,
    name = excluded.name,
    kind = excluded.kind,
    status = excluded.status,
    last_seen_at = excluded.last_seen_at,
    updated_at = now()
  returning * into device_record;

  insert into public.entities (
    organization_id,
    property_id,
    device_id,
    external_id,
    domain,
    device_class,
    name
  ) values (
    gateway_record.organization_id,
    gateway_record.property_id,
    device_record.id,
    external_entity_id,
    entity_domain,
    entity_device_class,
    entity_name
  )
  on conflict (organization_id, external_id)
  do update set
    property_id = excluded.property_id,
    device_id = excluded.device_id,
    domain = excluded.domain,
    device_class = excluded.device_class,
    name = excluded.name,
    updated_at = now()
  returning * into entity_record;

  insert into public.entity_states (
    entity_id,
    organization_id,
    property_id,
    state,
    severity,
    attributes,
    occurred_at
  ) values (
    entity_record.id,
    gateway_record.organization_id,
    gateway_record.property_id,
    entity_state,
    event_severity,
    state_attributes,
    event_occurred_at
  )
  on conflict (entity_id)
  do update set
    state = excluded.state,
    severity = excluded.severity,
    attributes = excluded.attributes,
    occurred_at = excluded.occurred_at,
    received_at = now(),
    updated_at = now();

  insert into public.events (
    organization_id,
    property_id,
    gateway_id,
    device_id,
    entity_id,
    external_event_id,
    event_type,
    severity,
    state,
    source,
    occurred_at,
    payload
  ) values (
    gateway_record.organization_id,
    gateway_record.property_id,
    gateway_record.id,
    device_record.id,
    entity_record.id,
    external_event_id,
    event_type,
    event_severity,
    entity_state,
    integration_provider,
    event_occurred_at,
    event_payload
  )
  on conflict (gateway_id, external_event_id)
  do update set
    external_event_id = excluded.external_event_id
  returning * into event_record;

  if event_severity = 'critical' then
    insert into public.incidents (
      organization_id,
      property_id,
      primary_event_id,
      title,
      description,
      severity
    ) values (
      gateway_record.organization_id,
      gateway_record.property_id,
      event_record.id,
      coalesce(nullif(device_name, ''), 'Alerta critica'),
      'Incidente creado automaticamente desde una senal critica.',
      'critical'
    )
    on conflict (primary_event_id) where primary_event_id is not null
    do update set primary_event_id = excluded.primary_event_id
    returning * into incident_record;

    insert into public.incident_events (incident_id, event_id, organization_id, property_id)
    values (incident_record.id, event_record.id, gateway_record.organization_id, gateway_record.property_id)
    on conflict (incident_id, event_id) do nothing;
  end if;

  update public.gateways
  set status = 'online',
      last_seen_at = now(),
      activated_at = coalesce(activated_at, now()),
      updated_at = now()
  where id = gateway_record.id;

  return jsonb_build_object(
    'organization_id', gateway_record.organization_id,
    'property_id', gateway_record.property_id,
    'gateway_id', gateway_record.id,
    'integration_id', integration_record.id,
    'device_id', device_record.id,
    'entity_id', entity_record.id,
    'event_id', event_record.id,
    'incident_id', incident_record.id
  );
end;
$$;

revoke all on function private.is_org_member(uuid) from public;
revoke all on function private.has_org_role(uuid, text[]) from public;
grant execute on function private.is_org_member(uuid) to authenticated;
grant execute on function private.has_org_role(uuid, text[]) to authenticated;
revoke all on function public.provision_client_account(uuid, text, text, text, text) from public, anon, authenticated;
grant execute on function public.provision_client_account(uuid, text, text, text, text) to service_role;
revoke all on function public.ingest_security_event(text, text, text, text, text, text, text, text, text, text, text, text, text, timestamptz, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.ingest_security_event(text, text, text, text, text, text, text, text, text, text, text, text, text, timestamptz, jsonb, jsonb) to service_role;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'events'
  ) then
    alter publication supabase_realtime add table public.events;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'entity_states'
  ) then
    alter publication supabase_realtime add table public.entity_states;
  end if;
end;
$$;

create or replace function public.mark_stale_gateways(stale_before timestamptz default now() - interval '3 minutes')
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  affected_count integer;
begin
  with stale as (
    update public.gateways
    set status = 'offline', updated_at = now()
    where status in ('online', 'degraded')
      and coalesce(last_seen_at, activated_at, created_at) < stale_before
    returning id, organization_id, property_id, public_id
  ), degraded_integrations as (
    update public.integrations integration
    set status = 'degraded', updated_at = now()
    from stale
    where integration.gateway_id = stale.id
    returning integration.id
  ), technical_events as (
    insert into public.events (
      organization_id,
      property_id,
      gateway_id,
      external_event_id,
      event_type,
      severity,
      state,
      source,
      occurred_at,
      payload
    )
    select
      organization_id,
      property_id,
      id,
      'gateway-offline-' || extract(epoch from now())::bigint::text,
      'gateway.offline',
      'warning',
      'offline',
      'seguria_monitor',
      now(),
      jsonb_build_object('gatewayPublicId', public_id)
    from stale
    returning id
  )
  select count(*)::integer into affected_count from stale;

  return affected_count;
end;
$$;

revoke all on function public.mark_stale_gateways(timestamptz) from public, anon, authenticated;
grant execute on function public.mark_stale_gateways(timestamptz) to service_role;

create trigger organizations_updated_at before update on public.organizations for each row execute function private.set_updated_at();
create trigger memberships_updated_at before update on public.memberships for each row execute function private.set_updated_at();
create trigger properties_updated_at before update on public.properties for each row execute function private.set_updated_at();
create trigger spaces_updated_at before update on public.spaces for each row execute function private.set_updated_at();
create trigger gateways_updated_at before update on public.gateways for each row execute function private.set_updated_at();
create trigger integrations_updated_at before update on public.integrations for each row execute function private.set_updated_at();
create trigger devices_updated_at before update on public.devices for each row execute function private.set_updated_at();
create trigger entities_updated_at before update on public.entities for each row execute function private.set_updated_at();
create trigger entity_states_updated_at before update on public.entity_states for each row execute function private.set_updated_at();
create trigger incidents_updated_at before update on public.incidents for each row execute function private.set_updated_at();

alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.properties enable row level security;
alter table public.spaces enable row level security;
alter table public.gateways enable row level security;
alter table public.integrations enable row level security;
alter table public.devices enable row level security;
alter table public.entities enable row level security;
alter table public.entity_states enable row level security;
alter table public.events enable row level security;
alter table public.incidents enable row level security;
alter table public.camera_snapshots enable row level security;
alter table public.incident_events enable row level security;
alter table public.audit_log enable row level security;

revoke all on public.organizations, public.memberships, public.properties, public.spaces, public.gateways,
  public.integrations, public.devices, public.entities, public.entity_states, public.events,
  public.incidents, public.camera_snapshots, public.incident_events, public.audit_log from anon;
revoke all on public.gateways from authenticated;

create policy organizations_select_member on public.organizations for select to authenticated
using ((select private.is_org_member(id)));
create policy organizations_update_admin on public.organizations for update to authenticated
using ((select private.has_org_role(id, array['owner', 'admin'])))
with check ((select private.has_org_role(id, array['owner', 'admin'])));

create policy memberships_select_member on public.memberships for select to authenticated
using ((select private.is_org_member(organization_id)));
create policy memberships_insert_admin on public.memberships for insert to authenticated
with check ((select private.has_org_role(organization_id, array['owner', 'admin'])));
create policy memberships_update_admin on public.memberships for update to authenticated
using ((select private.has_org_role(organization_id, array['owner', 'admin'])))
with check ((select private.has_org_role(organization_id, array['owner', 'admin'])));
create policy memberships_delete_admin on public.memberships for delete to authenticated
using ((select private.has_org_role(organization_id, array['owner', 'admin'])));

create policy properties_select_member on public.properties for select to authenticated
using ((select private.is_org_member(organization_id)));
create policy properties_insert_staff on public.properties for insert to authenticated
with check ((select private.has_org_role(organization_id, array['owner', 'admin', 'technician'])));
create policy properties_update_staff on public.properties for update to authenticated
using ((select private.has_org_role(organization_id, array['owner', 'admin', 'technician'])))
with check ((select private.has_org_role(organization_id, array['owner', 'admin', 'technician'])));
create policy properties_delete_admin on public.properties for delete to authenticated
using ((select private.has_org_role(organization_id, array['owner', 'admin'])));

create policy spaces_select_member on public.spaces for select to authenticated
using ((select private.is_org_member(organization_id)));
create policy spaces_manage_staff on public.spaces for all to authenticated
using ((select private.has_org_role(organization_id, array['owner', 'admin', 'technician'])))
with check ((select private.has_org_role(organization_id, array['owner', 'admin', 'technician'])));

create policy gateways_select_member on public.gateways for select to authenticated
using ((select private.is_org_member(organization_id)));
create policy gateways_manage_staff on public.gateways for all to authenticated
using ((select private.has_org_role(organization_id, array['owner', 'admin', 'technician'])))
with check ((select private.has_org_role(organization_id, array['owner', 'admin', 'technician'])));

create policy integrations_select_staff on public.integrations for select to authenticated
using ((select private.has_org_role(organization_id, array['owner', 'admin', 'operator', 'technician'])));
create policy integrations_manage_staff on public.integrations for all to authenticated
using ((select private.has_org_role(organization_id, array['owner', 'admin', 'technician'])))
with check ((select private.has_org_role(organization_id, array['owner', 'admin', 'technician'])));

create policy devices_select_member on public.devices for select to authenticated
using ((select private.is_org_member(organization_id)));
create policy devices_manage_staff on public.devices for all to authenticated
using ((select private.has_org_role(organization_id, array['owner', 'admin', 'technician'])))
with check ((select private.has_org_role(organization_id, array['owner', 'admin', 'technician'])));

create policy entities_select_member on public.entities for select to authenticated
using ((select private.is_org_member(organization_id)));
create policy entities_manage_staff on public.entities for all to authenticated
using ((select private.has_org_role(organization_id, array['owner', 'admin', 'technician'])))
with check ((select private.has_org_role(organization_id, array['owner', 'admin', 'technician'])));

create policy entity_states_select_member on public.entity_states for select to authenticated
using ((select private.is_org_member(organization_id)));
create policy events_select_member on public.events for select to authenticated
using ((select private.is_org_member(organization_id)));

create policy incidents_select_member on public.incidents for select to authenticated
using ((select private.is_org_member(organization_id)));
create policy camera_snapshots_select_member on public.camera_snapshots for select to authenticated
using ((select private.is_org_member(organization_id)));
create policy incidents_insert_operator on public.incidents for insert to authenticated
with check ((select private.has_org_role(organization_id, array['owner', 'admin', 'operator', 'technician'])));
create policy incidents_update_operator on public.incidents for update to authenticated
using ((select private.has_org_role(organization_id, array['owner', 'admin', 'operator', 'technician'])))
with check ((select private.has_org_role(organization_id, array['owner', 'admin', 'operator', 'technician'])));

create policy incident_events_select_member on public.incident_events for select to authenticated
using (
  exists (
    select 1 from public.incidents
    where incidents.id = incident_events.incident_id
      and (select private.is_org_member(incidents.organization_id))
  )
);
create policy incident_events_manage_operator on public.incident_events for all to authenticated
using ((select private.has_org_role(organization_id, array['owner', 'admin', 'operator', 'technician'])))
with check ((select private.has_org_role(organization_id, array['owner', 'admin', 'operator', 'technician'])));

create policy audit_log_select_staff on public.audit_log for select to authenticated
using ((select private.has_org_role(organization_id, array['owner', 'admin', 'operator', 'technician'])));

grant usage on schema public to authenticated;
grant select on public.organizations, public.memberships, public.properties, public.spaces,
  public.integrations, public.devices, public.entities, public.entity_states, public.events,
  public.incidents, public.camera_snapshots, public.incident_events, public.audit_log to authenticated;
grant select (id, organization_id, property_id, public_id, name, status, version, last_seen_at, activated_at, created_at, updated_at)
  on public.gateways to authenticated;
grant insert, update, delete on public.memberships, public.properties, public.spaces, public.gateways,
  public.integrations, public.devices, public.entities, public.incidents, public.incident_events to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('seguria-evidence', 'seguria-evidence', false, 5242880, array['image/jpeg', 'image/webp'])
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
