create or replace function public.attach_incident_snapshot(
  target_incident_id uuid,
  target_snapshot_id uuid,
  requested_association text default 'operator_pinned',
  requested_note text default null
)
returns public.incident_evidence
language plpgsql
security definer
set search_path = public, private
as $$
declare
  incident_record public.incidents%rowtype;
  snapshot_record public.camera_snapshots%rowtype;
  evidence_record public.incident_evidence%rowtype;
begin
  select * into incident_record
  from public.incidents
  where id = target_incident_id;

  if incident_record.id is null then
    raise exception 'incident_not_found';
  end if;

  if not private.has_org_role(incident_record.organization_id, array['owner', 'admin', 'operator', 'technician'])
    and auth.role() <> 'service_role' then
    raise exception 'not_authorized';
  end if;

  select * into snapshot_record
  from public.camera_snapshots
  where id = target_snapshot_id
    and organization_id = incident_record.organization_id
    and property_id = incident_record.property_id;

  if snapshot_record.id is null then
    raise exception 'snapshot_not_found';
  end if;

  insert into public.incident_evidence (
    organization_id,
    property_id,
    incident_id,
    snapshot_id,
    association,
    note,
    created_by
  )
  values (
    incident_record.organization_id,
    incident_record.property_id,
    incident_record.id,
    snapshot_record.id,
    case
      when requested_association in ('primary', 'correlated', 'operator_pinned', 'time_window') then requested_association
      else 'operator_pinned'
    end,
    nullif(trim(requested_note), ''),
    auth.uid()
  )
  on conflict (incident_id, snapshot_id) do update
  set association = excluded.association,
      note = coalesce(excluded.note, public.incident_evidence.note)
  returning * into evidence_record;

  insert into public.audit_log (
    organization_id,
    property_id,
    actor_user_id,
    actor_label,
    action,
    target_type,
    target_id,
    payload
  )
  values (
    incident_record.organization_id,
    incident_record.property_id,
    auth.uid(),
    case when auth.uid() is null then 'SegurIA interno' else null end,
    'incident.evidence_attached',
    'incident_evidence',
    evidence_record.id::text,
    jsonb_build_object(
      'incident_id', incident_record.id,
      'snapshot_id', snapshot_record.id,
      'association', evidence_record.association
    )
  );

  return evidence_record;
end;
$$;

revoke all on function public.attach_incident_snapshot(uuid, uuid, text, text) from public, anon, authenticated;
grant execute on function public.attach_incident_snapshot(uuid, uuid, text, text) to authenticated;
