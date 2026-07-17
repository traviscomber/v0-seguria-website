create table if not exists public.integration_credentials (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  property_id uuid not null,
  integration_id uuid,
  provider text not null check (provider in ('home_assistant', 'tuya')),
  label text not null check (char_length(label) between 2 and 120),
  account_identifier text,
  credential_kind text not null default 'api_token' check (credential_kind in ('api_token', 'account_password', 'oauth_refresh', 'webhook_secret', 'other')),
  secret_ciphertext text not null,
  secret_hint text,
  config jsonb not null default '{}'::jsonb,
  status text not null default 'stored' check (status in ('stored', 'validated', 'needs_review', 'revoked')),
  last_validated_at timestamptz,
  rotation_due_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, property_id, provider, label),
  unique (id, organization_id),
  foreign key (property_id, organization_id) references public.properties(id, organization_id) on delete cascade,
  foreign key (integration_id, organization_id) references public.integrations(id, organization_id) on delete set null
);

create index if not exists integration_credentials_property_idx
  on public.integration_credentials(property_id, provider, status);

create trigger integration_credentials_updated_at
  before update on public.integration_credentials
  for each row execute function private.set_updated_at();

alter table public.integration_credentials enable row level security;
revoke all on public.integration_credentials from public, anon, authenticated;

create policy integration_credentials_select_staff on public.integration_credentials
for select to authenticated
using ((select private.has_org_role(organization_id, array['owner', 'admin', 'technician'])));

create policy integration_credentials_manage_staff on public.integration_credentials
for all to authenticated
using ((select private.has_org_role(organization_id, array['owner', 'admin', 'technician'])))
with check ((select private.has_org_role(organization_id, array['owner', 'admin', 'technician'])));

grant select (
  id,
  organization_id,
  property_id,
  integration_id,
  provider,
  label,
  account_identifier,
  credential_kind,
  secret_hint,
  config,
  status,
  last_validated_at,
  rotation_due_at,
  created_by,
  updated_by,
  created_at,
  updated_at
) on public.integration_credentials to authenticated;

grant insert (
  organization_id,
  property_id,
  integration_id,
  provider,
  label,
  account_identifier,
  credential_kind,
  secret_ciphertext,
  secret_hint,
  config,
  status,
  rotation_due_at,
  created_by,
  updated_by
) on public.integration_credentials to authenticated;

grant update (
  integration_id,
  label,
  account_identifier,
  credential_kind,
  secret_ciphertext,
  secret_hint,
  config,
  status,
  last_validated_at,
  rotation_due_at,
  updated_by
) on public.integration_credentials to authenticated;
