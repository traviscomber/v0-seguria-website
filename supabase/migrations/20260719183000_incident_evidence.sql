create table if not exists public.incident_evidence (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  property_id uuid not null,
  incident_id uuid not null,
  snapshot_id uuid not null,
  evidence_kind text not null default 'snapshot' check (evidence_kind in ('snapshot', 'clip', 'document')),
  association text not null default 'operator_pinned' check (association in ('primary', 'correlated', 'operator_pinned', 'time_window')),
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (incident_id, snapshot_id),
  foreign key (incident_id, property_id, organization_id)
    references public.incidents(id, property_id, organization_id) on delete cascade,
  foreign key (snapshot_id) references public.camera_snapshots(id) on delete cascade
);

create index if not exists incident_evidence_incident_created_idx
  on public.incident_evidence(incident_id, created_at desc);
create index if not exists incident_evidence_snapshot_idx
  on public.incident_evidence(snapshot_id);

alter table public.incident_evidence enable row level security;

create or replace function private.validate_incident_evidence_scope()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  incident_scope record;
  snapshot_scope record;
begin
  select organization_id, property_id into incident_scope
  from public.incidents
  where id = new.incident_id;

  select organization_id, property_id into snapshot_scope
  from public.camera_snapshots
  where id = new.snapshot_id;

  if incident_scope.organization_id is null then
    raise exception 'incident_not_found';
  end if;

  if snapshot_scope.organization_id is null then
    raise exception 'snapshot_not_found';
  end if;

  if incident_scope.organization_id <> snapshot_scope.organization_id
    or incident_scope.property_id <> snapshot_scope.property_id then
    raise exception 'incident_evidence_scope_mismatch';
  end if;

  new.organization_id := incident_scope.organization_id;
  new.property_id := incident_scope.property_id;
  return new;
end;
$$;

create trigger incident_evidence_validate_scope
before insert or update on public.incident_evidence
for each row execute function private.validate_incident_evidence_scope();

create policy incident_evidence_select_member
on public.incident_evidence for select to authenticated
using ((select private.is_org_member(organization_id)));

create policy incident_evidence_manage_operator
on public.incident_evidence for all to authenticated
using ((select private.has_org_role(organization_id, array['owner', 'admin', 'operator', 'technician'])))
with check ((select private.has_org_role(organization_id, array['owner', 'admin', 'operator', 'technician'])));

grant select on public.incident_evidence to authenticated;
grant insert, update, delete on public.incident_evidence to authenticated;

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

  if not private.has_org_role(incident_record.organization_id, array['owner', 'admin', 'operator', 'technician']) then
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
    action,
    target_type,
    target_id,
    payload
  )
  values (
    incident_record.organization_id,
    incident_record.property_id,
    auth.uid(),
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
