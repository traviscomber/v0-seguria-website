create or replace function private.onboard_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  organization_id uuid;
  company_name text;
  site_name text;
  organization_slug text;
begin
  if coalesce((new.raw_user_meta_data ->> 'self_service_signup')::boolean, false) is not true then
    return new;
  end if;

  company_name := left(coalesce(nullif(trim(new.raw_user_meta_data ->> 'company_name'), ''), 'Mi empresa'), 120);
  site_name := left(coalesce(nullif(trim(new.raw_user_meta_data ->> 'site_name'), ''), 'Sitio principal'), 120);
  organization_slug := trim(both '-' from regexp_replace(translate(lower(company_name), 'áéíóúüñ', 'aeiouun'), '[^a-z0-9]+', '-', 'g'))
    || '-' || left(replace(new.id::text, '-', ''), 8);

  insert into public.organizations (name, slug)
  values (company_name, organization_slug)
  returning id into organization_id;

  insert into public.memberships (organization_id, user_id, role)
  values (organization_id, new.id, 'owner');

  insert into public.properties (organization_id, name)
  values (organization_id, site_name);

  return new;
end;
$$;

revoke all on function private.onboard_new_auth_user() from public, anon, authenticated;

drop trigger if exists seguria_onboard_new_auth_user on auth.users;
create trigger seguria_onboard_new_auth_user
after insert on auth.users
for each row execute function private.onboard_new_auth_user();
