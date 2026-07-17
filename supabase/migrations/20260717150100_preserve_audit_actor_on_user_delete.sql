alter table public.audit_log add column actor_label text;
alter table public.incident_actions add column actor_label text;

update public.audit_log log
set actor_label = coalesce(nullif(trim(user_row.raw_user_meta_data ->> 'full_name'), ''), user_row.email, 'Usuario')
from auth.users user_row
where log.actor_user_id = user_row.id and log.actor_label is null;

update public.incident_actions action
set actor_label = coalesce(nullif(trim(user_row.raw_user_meta_data ->> 'full_name'), ''), user_row.email, 'Usuario')
from auth.users user_row
where action.actor_user_id = user_row.id and action.actor_label is null;

alter table public.audit_log drop constraint if exists audit_log_check;
alter table public.audit_log add constraint audit_log_actor_identity_check
  check (actor_user_id is not null or actor_gateway_id is not null or actor_label is not null);

alter table public.incident_actions alter column actor_user_id drop not null;
alter table public.incident_actions drop constraint if exists incident_actions_actor_user_id_fkey;
alter table public.incident_actions add constraint incident_actions_actor_user_id_fkey
  foreign key (actor_user_id) references auth.users(id) on delete set null;
alter table public.incident_actions add constraint incident_actions_actor_identity_check
  check (actor_user_id is not null or actor_label is not null);

create or replace function private.capture_actor_label()
returns trigger
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
begin
  if new.actor_label is null and new.actor_user_id is not null then
    select coalesce(nullif(trim(raw_user_meta_data ->> 'full_name'), ''), email, 'Usuario')
      into new.actor_label
    from auth.users where id = new.actor_user_id;
  end if;
  return new;
end;
$$;

create trigger audit_log_capture_actor before insert on public.audit_log
for each row execute function private.capture_actor_label();
create trigger incident_actions_capture_actor before insert on public.incident_actions
for each row execute function private.capture_actor_label();
