-- Remove the empty v0 bootstrap schema only when its legacy shape is detected.
do $$
declare
  legacy_rows bigint;
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'properties'
      and column_name = 'user_id'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'properties'
      and column_name = 'organization_id'
  ) then
    select
      (select count(*) from public.users) +
      (select count(*) from public.properties) +
      (select count(*) from public.devices) +
      (select count(*) from public.integrations) +
      (select count(*) from public.alerts) +
      (select count(*) from public.activity_logs)
    into legacy_rows;

    if legacy_rows <> 0 then
      raise exception 'Legacy schema contains % rows; automatic convergence refused', legacy_rows;
    end if;

    drop table public.activity_logs cascade;
    drop table public.alerts cascade;
    drop table public.devices cascade;
    drop table public.integrations cascade;
    drop table public.properties cascade;
    drop table public.users cascade;
    drop function if exists public.update_updated_at_column() cascade;
  end if;
end;
$$;
