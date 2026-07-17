alter table public.leads
  add column if not exists ip_hash text,
  add column if not exists user_agent text,
  add column if not exists source_path text,
  add column if not exists consent boolean not null default false;

alter table public.contact_submissions
  add column if not exists ip_hash text,
  add column if not exists user_agent text,
  add column if not exists source_path text,
  add column if not exists consent boolean not null default false;

drop policy if exists "Public can submit leads" on public.leads;
drop policy if exists "Assigned users can view leads" on public.leads;
drop policy if exists "Public can submit contact forms" on public.contact_submissions;

revoke all on public.leads, public.contact_submissions from anon, authenticated;

create policy leads_select_staff on public.leads
for select to authenticated
using ((select auth.jwt()->'app_metadata'->>'platform_role') in ('admin', 'technician'));

create policy leads_update_staff on public.leads
for update to authenticated
using ((select auth.jwt()->'app_metadata'->>'platform_role') in ('admin', 'technician'))
with check ((select auth.jwt()->'app_metadata'->>'platform_role') in ('admin', 'technician'));

create policy contacts_select_staff on public.contact_submissions
for select to authenticated
using ((select auth.jwt()->'app_metadata'->>'platform_role') in ('admin', 'technician'));

create policy contacts_update_staff on public.contact_submissions
for update to authenticated
using ((select auth.jwt()->'app_metadata'->>'platform_role') in ('admin', 'technician'))
with check ((select auth.jwt()->'app_metadata'->>'platform_role') in ('admin', 'technician'));

grant select, update on public.leads, public.contact_submissions to authenticated;

create index if not exists leads_email_created_at_idx on public.leads (lower(email), created_at desc);
create index if not exists contact_submissions_email_created_at_idx on public.contact_submissions (lower(email), created_at desc);
