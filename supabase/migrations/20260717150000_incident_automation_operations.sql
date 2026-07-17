create table public.incident_actions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  property_id uuid not null,
  incident_id uuid not null,
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  action_type text not null check (action_type in ('comment', 'status_change', 'assignment', 'resolution', 'automation')),
  from_status text,
  to_status text,
  comment text check (comment is null or char_length(comment) between 1 and 2000),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  foreign key (incident_id, property_id, organization_id)
    references public.incidents(id, property_id, organization_id) on delete cascade
);

create table public.automation_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  template_key text not null check (template_key ~ '^[a-z0-9_]+$'),
  name text not null check (char_length(name) between 3 and 120),
  description text not null check (char_length(description) between 3 and 500),
  trigger_kind text not null check (trigger_kind in ('motion', 'entry_open', 'smoke_gas', 'water', 'device_offline', 'battery_low', 'disarm', 'multi_signal')),
  version integer not null default 1 check (version > 0),
  default_config jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, template_key, version),
  unique (id, organization_id)
);

create table public.property_automations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  property_id uuid not null,
  template_id uuid not null,
  name text not null check (char_length(name) between 3 and 120),
  status text not null default 'draft' check (status in ('draft', 'ready', 'active', 'paused', 'error')),
  config jsonb not null default '{}'::jsonb,
  deployed_version integer,
  last_deployed_at timestamptz,
  last_run_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (property_id, template_id),
  unique (id, property_id, organization_id),
  foreign key (property_id, organization_id) references public.properties(id, organization_id) on delete cascade,
  foreign key (template_id, organization_id) references public.automation_templates(id, organization_id) on delete restrict
);

create table public.automation_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  property_id uuid not null,
  automation_id uuid not null,
  incident_id uuid,
  event_id uuid,
  result text not null check (result in ('simulated', 'executed', 'skipped', 'failed')),
  details jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  foreign key (automation_id, property_id, organization_id)
    references public.property_automations(id, property_id, organization_id) on delete cascade,
  foreign key (incident_id, property_id, organization_id)
    references public.incidents(id, property_id, organization_id) on delete set null (incident_id),
  foreign key (event_id, property_id, organization_id)
    references public.events(id, property_id, organization_id) on delete set null (event_id)
);

create index incident_actions_incident_created_idx on public.incident_actions(incident_id, created_at desc);
create index automation_templates_org_key_idx on public.automation_templates(organization_id, template_key, version desc);
create index property_automations_property_status_idx on public.property_automations(property_id, status);
create index automation_runs_automation_started_idx on public.automation_runs(automation_id, started_at desc);

create trigger automation_templates_updated_at before update on public.automation_templates
for each row execute function private.set_updated_at();
create trigger property_automations_updated_at before update on public.property_automations
for each row execute function private.set_updated_at();

alter table public.incident_actions enable row level security;
alter table public.automation_templates enable row level security;
alter table public.property_automations enable row level security;
alter table public.automation_runs enable row level security;

create policy incident_actions_select_member on public.incident_actions for select to authenticated
using ((select private.is_org_member(organization_id)));
create policy incident_actions_insert_operator on public.incident_actions for insert to authenticated
with check (
  actor_user_id = (select auth.uid())
  and (select private.has_org_role(organization_id, array['owner', 'admin', 'operator', 'technician']))
);

create policy automation_templates_select_member on public.automation_templates for select to authenticated
using ((select private.is_org_member(organization_id)));
create policy property_automations_select_member on public.property_automations for select to authenticated
using ((select private.is_org_member(organization_id)));
create policy automation_runs_select_member on public.automation_runs for select to authenticated
using ((select private.is_org_member(organization_id)));

revoke all on public.incident_actions, public.automation_templates, public.property_automations, public.automation_runs
from anon, authenticated;
grant select, insert on public.incident_actions to authenticated;
grant select on public.automation_templates, public.property_automations, public.automation_runs to authenticated;

create or replace function public.manage_incident(
  target_incident_id uuid,
  actor_user_id uuid,
  requested_status text default null,
  requested_assignee uuid default null,
  note text default null
)
returns public.incidents
language plpgsql
security definer
set search_path = public, private, auth, pg_temp
as $$
declare
  current_incident public.incidents%rowtype;
  actor_platform_role text;
  assignee_allowed boolean;
  action_kind text;
  previous_status text;
begin
  select * into current_incident from public.incidents where id = target_incident_id for update;
  if current_incident.id is null then raise exception 'Incident not found'; end if;
  previous_status := current_incident.status;

  select raw_app_meta_data ->> 'platform_role' into actor_platform_role from auth.users where id = actor_user_id;
  if actor_platform_role not in ('admin', 'technician')
    and not private.has_org_role(current_incident.organization_id, array['owner', 'admin', 'operator', 'technician']) then
    raise exception 'Actor is not authorized';
  end if;

  if requested_status is not null and requested_status <> current_incident.status then
    if not (
      (current_incident.status = 'new' and requested_status in ('validating', 'false_alarm')) or
      (current_incident.status = 'validating' and requested_status in ('confirmed', 'resolved', 'false_alarm')) or
      (current_incident.status = 'confirmed' and requested_status in ('responding', 'resolved', 'false_alarm')) or
      (current_incident.status = 'responding' and requested_status in ('resolved', 'false_alarm')) or
      (current_incident.status in ('resolved', 'false_alarm') and requested_status = 'validating')
    ) then raise exception 'Invalid incident transition'; end if;
  end if;

  if requested_assignee is not null then
    select exists (
      select 1 from auth.users u
      where u.id = requested_assignee
        and ((u.raw_app_meta_data ->> 'platform_role') in ('admin', 'technician')
          or exists (select 1 from public.memberships m where m.user_id = u.id and m.organization_id = current_incident.organization_id))
    ) into assignee_allowed;
    if not assignee_allowed then raise exception 'Assignee is not authorized'; end if;
  end if;

  update public.incidents set
    status = coalesce(requested_status, status),
    assigned_to = coalesce(requested_assignee, assigned_to),
    acknowledged_at = case when coalesce(requested_status, status) <> 'new' then coalesce(acknowledged_at, now()) else acknowledged_at end,
    resolved_at = case when coalesce(requested_status, status) in ('resolved', 'false_alarm') then now() when requested_status is not null then null else resolved_at end
  where id = target_incident_id returning * into current_incident;

  action_kind := case
    when requested_status in ('resolved', 'false_alarm') then 'resolution'
    when requested_status is not null then 'status_change'
    when requested_assignee is not null then 'assignment'
    else 'comment'
  end;

  insert into public.incident_actions (
    organization_id, property_id, incident_id, actor_user_id, action_type,
    from_status, to_status, comment, metadata
  ) values (
    current_incident.organization_id, current_incident.property_id, current_incident.id, actor_user_id, action_kind,
    previous_status, coalesce(requested_status, previous_status), nullif(trim(note), ''), jsonb_build_object('assigned_to', requested_assignee)
  );

  insert into public.audit_log (organization_id, property_id, actor_user_id, action, target_type, target_id, payload)
  values (current_incident.organization_id, current_incident.property_id, actor_user_id, 'incident.' || action_kind,
    'incident', current_incident.id::text, jsonb_build_object('status', requested_status, 'assigned_to', requested_assignee));

  return current_incident;
end;
$$;

revoke all on function public.manage_incident(uuid, uuid, text, uuid, text) from public, anon, authenticated;
grant execute on function public.manage_incident(uuid, uuid, text, uuid, text) to service_role;
