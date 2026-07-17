revoke all on all tables in schema public from anon, authenticated;

grant select, update on public.organizations to authenticated;
grant select, insert, update, delete on public.memberships, public.properties, public.spaces,
  public.integrations, public.devices, public.entities to authenticated;
grant select, insert, update on public.incidents to authenticated;
grant select, insert, update, delete on public.incident_events to authenticated;
grant select on public.entity_states, public.events, public.camera_snapshots, public.audit_log to authenticated;
grant select, update on public.leads, public.contact_submissions to authenticated;

grant select (id, organization_id, property_id, public_id, name, status, version, last_seen_at, activated_at, created_at, updated_at)
  on public.gateways to authenticated;
grant insert, update, delete on public.gateways to authenticated;

alter default privileges in schema public revoke all on tables from anon, authenticated;
