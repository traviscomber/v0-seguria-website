-- SegurIA Vision canonical scope: operation_id.
-- organization_id remains a derived compatibility field, synchronized from the
-- single property linked to an operation. Legacy personal rows without an
-- operation remain user-owned until they are explicitly classified.

create unique index if not exists properties_operation_id_uidx
  on public.properties(operation_id)
  where operation_id is not null;

create or replace function private.sync_wildlife_organization_from_operation()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  derived_organization_id uuid;
begin
  if new.operation_id is null then
    return new;
  end if;

  select p.organization_id
    into derived_organization_id
  from public.properties p
  where p.operation_id = new.operation_id;

  if derived_organization_id is not null then
    if new.organization_id is not null and new.organization_id <> derived_organization_id then
      raise exception 'organization_id does not match operation property ownership';
    end if;
    new.organization_id := derived_organization_id;
  end if;

  return new;
end;
$$;

revoke all on function private.sync_wildlife_organization_from_operation() from public, anon, authenticated;

drop trigger if exists wildlife_cameras_sync_operation_organization on public.wildlife_cameras;
create trigger wildlife_cameras_sync_operation_organization
before insert or update of operation_id, organization_id
on public.wildlife_cameras
for each row execute function private.sync_wildlife_organization_from_operation();

drop trigger if exists wildlife_jobs_sync_operation_organization on public.wildlife_inference_jobs;
create trigger wildlife_jobs_sync_operation_organization
before insert or update of operation_id, organization_id
on public.wildlife_inference_jobs
for each row execute function private.sync_wildlife_organization_from_operation();

update public.wildlife_cameras c
set organization_id = p.organization_id
from public.properties p
where c.operation_id = p.operation_id
  and c.operation_id is not null
  and c.organization_id is distinct from p.organization_id;

update public.wildlife_inference_jobs j
set organization_id = p.organization_id
from public.properties p
where j.operation_id = p.operation_id
  and j.operation_id is not null
  and j.organization_id is distinct from p.organization_id;

comment on column public.wildlife_cameras.operation_id is
  'Canonical SegurIA Vision authorization and operational ownership scope.';
comment on column public.wildlife_cameras.organization_id is
  'Derived compatibility scope synchronized from the property linked to operation_id; not canonical ownership.';
comment on column public.wildlife_inference_jobs.operation_id is
  'Canonical SegurIA Vision authorization and operational ownership scope.';
comment on column public.wildlife_inference_jobs.organization_id is
  'Derived compatibility scope synchronized from the property linked to operation_id; not canonical ownership.';

drop policy if exists "Users can read their operation links" on public.user_operations;
create policy user_operations_select_own
on public.user_operations
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Users can read operations they belong to" on public.operations;
create policy operations_select_member
on public.operations
for select
to authenticated
using (
  exists (
    select 1
    from public.user_operations uo
    where uo.user_id = (select auth.uid())
      and uo.operation_id = operations.id
  )
);

drop policy if exists wildlife_cameras_select_own on public.wildlife_cameras;
drop policy if exists wildlife_cameras_insert_own on public.wildlife_cameras;
drop policy if exists wildlife_cameras_update_own on public.wildlife_cameras;

create policy wildlife_cameras_select_scope
on public.wildlife_cameras
for select
to authenticated
using (
  (
    operation_id is not null
    and exists (
      select 1
      from public.user_operations uo
      where uo.user_id = (select auth.uid())
        and uo.operation_id = wildlife_cameras.operation_id
    )
  )
  or (
    operation_id is null
    and created_by_user_id = (select auth.uid())
  )
);

create policy wildlife_cameras_insert_scope
on public.wildlife_cameras
for insert
to authenticated
with check (
  created_by_user_id = (select auth.uid())
  and (
    operation_id is null
    or exists (
      select 1
      from public.user_operations uo
      where uo.user_id = (select auth.uid())
        and uo.operation_id = wildlife_cameras.operation_id
    )
  )
);

create policy wildlife_cameras_update_scope
on public.wildlife_cameras
for update
to authenticated
using (
  created_by_user_id = (select auth.uid())
  and (
    operation_id is null
    or exists (
      select 1
      from public.user_operations uo
      where uo.user_id = (select auth.uid())
        and uo.operation_id = wildlife_cameras.operation_id
    )
  )
)
with check (
  created_by_user_id = (select auth.uid())
  and (
    operation_id is null
    or exists (
      select 1
      from public.user_operations uo
      where uo.user_id = (select auth.uid())
        and uo.operation_id = wildlife_cameras.operation_id
    )
  )
);

drop policy if exists wildlife_inference_jobs_select_own on public.wildlife_inference_jobs;
drop policy if exists wildlife_inference_jobs_insert_own on public.wildlife_inference_jobs;
drop policy if exists wildlife_inference_jobs_update_own on public.wildlife_inference_jobs;

create policy wildlife_inference_jobs_select_scope
on public.wildlife_inference_jobs
for select
to authenticated
using (
  (
    operation_id is not null
    and exists (
      select 1
      from public.user_operations uo
      where uo.user_id = (select auth.uid())
        and uo.operation_id = wildlife_inference_jobs.operation_id
    )
  )
  or (
    operation_id is null
    and submitted_by_user_id = (select auth.uid())
  )
);

create policy wildlife_inference_jobs_insert_scope
on public.wildlife_inference_jobs
for insert
to authenticated
with check (
  submitted_by_user_id = (select auth.uid())
  and (
    operation_id is null
    or exists (
      select 1
      from public.user_operations uo
      where uo.user_id = (select auth.uid())
        and uo.operation_id = wildlife_inference_jobs.operation_id
    )
  )
);

create policy wildlife_inference_jobs_update_scope
on public.wildlife_inference_jobs
for update
to authenticated
using (
  submitted_by_user_id = (select auth.uid())
  and (
    operation_id is null
    or exists (
      select 1
      from public.user_operations uo
      where uo.user_id = (select auth.uid())
        and uo.operation_id = wildlife_inference_jobs.operation_id
    )
  )
)
with check (
  submitted_by_user_id = (select auth.uid())
  and (
    operation_id is null
    or exists (
      select 1
      from public.user_operations uo
      where uo.user_id = (select auth.uid())
        and uo.operation_id = wildlife_inference_jobs.operation_id
    )
  )
);
