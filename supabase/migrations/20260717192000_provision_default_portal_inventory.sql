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
  entry_space_id uuid;
  interior_space_id uuid;
  perimeter_space_id uuid;
  created_device_count integer := 0;
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
  values (new_organization_id, new_property_id, 'Acceso principal', 'entry', 10)
  returning id into entry_space_id;

  insert into public.spaces (organization_id, property_id, name, kind, sort_order)
  values (new_organization_id, new_property_id, 'Interior', 'interior', 20)
  returning id into interior_space_id;

  insert into public.spaces (organization_id, property_id, name, kind, sort_order)
  values (new_organization_id, new_property_id, 'Perimetro', 'perimeter', 30)
  returning id into perimeter_space_id;

  insert into public.devices (
    organization_id,
    property_id,
    space_id,
    external_id,
    name,
    kind,
    manufacturer,
    model,
    status,
    capabilities,
    metadata
  )
  values
    (
      new_organization_id,
      new_property_id,
      entry_space_id,
      'pending-' || new_property_id::text || '-camera-entry',
      'Camara acceso principal',
      'camera',
      'Equipo conectado',
      'Pendiente de enlace',
      'maintenance',
      '["snapshot", "secure_stream", "motion_reference"]'::jsonb,
      jsonb_build_object(
        'portalGroup', 'camera',
        'onboardingPlaceholder', true,
        'replaceWithGatewayInventory', true,
        'coverage', 'entrada'
      )
    ),
    (
      new_organization_id,
      new_property_id,
      perimeter_space_id,
      'pending-' || new_property_id::text || '-camera-perimeter',
      'Camara perimetro',
      'camera',
      'Equipo conectado',
      'Pendiente de enlace',
      'maintenance',
      '["snapshot", "secure_stream", "perimeter_reference"]'::jsonb,
      jsonb_build_object(
        'portalGroup', 'camera',
        'onboardingPlaceholder', true,
        'replaceWithGatewayInventory', true,
        'coverage', 'perimetro'
      )
    ),
    (
      new_organization_id,
      new_property_id,
      interior_space_id,
      'pending-' || new_property_id::text || '-motion-interior',
      'Sensor movimiento interior',
      'motion',
      'Equipo conectado',
      'Pendiente de enlace',
      'maintenance',
      '["motion", "occupancy"]'::jsonb,
      jsonb_build_object(
        'portalGroup', 'sensor',
        'onboardingPlaceholder', true,
        'replaceWithGatewayInventory', true
      )
    ),
    (
      new_organization_id,
      new_property_id,
      entry_space_id,
      'pending-' || new_property_id::text || '-entry-door',
      'Sensor puerta acceso',
      'entry',
      'Equipo conectado',
      'Pendiente de enlace',
      'maintenance',
      '["open_close", "tamper"]'::jsonb,
      jsonb_build_object(
        'portalGroup', 'sensor',
        'onboardingPlaceholder', true,
        'replaceWithGatewayInventory', true
      )
    );

  get diagnostics created_device_count = row_count;

  insert into public.audit_log (
    organization_id,
    property_id,
    actor_user_id,
    action,
    target_type,
    target_id,
    payload
  )
  values (
    new_organization_id,
    new_property_id,
    target_user_id,
    'client.provisioned',
    'property',
    new_property_id,
    jsonb_build_object(
      'createdBy', 'internal_provision',
      'defaultSpaces', 3,
      'defaultDevices', created_device_count
    )
  );

  return jsonb_build_object(
    'organization_id', new_organization_id,
    'property_id', new_property_id,
    'space_count', 3,
    'device_count', created_device_count
  );
end;
$$;

revoke all on function public.provision_client_account(uuid, text, text, text, text) from public, anon, authenticated;
grant execute on function public.provision_client_account(uuid, text, text, text, text) to service_role;
