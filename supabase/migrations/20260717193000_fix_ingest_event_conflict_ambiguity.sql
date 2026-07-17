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
  on conflict on constraint events_gateway_id_external_event_id_key
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

revoke all on function public.ingest_security_event(text, text, text, text, text, text, text, text, text, text, text, text, text, timestamptz, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.ingest_security_event(text, text, text, text, text, text, text, text, text, text, text, text, text, timestamptz, jsonb, jsonb) to service_role;
