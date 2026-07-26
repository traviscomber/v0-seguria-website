create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid null references public.leads(id) on delete set null,
  title text not null default 'Propuesta comercial',
  client_name text not null default '',
  status text not null default 'draft' check (status in ('draft', 'review', 'approved', 'sent', 'archived')),
  brandbook_version text not null,
  blocks jsonb not null default '[]'::jsonb,
  created_by uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists proposals_lead_id_idx on public.proposals(lead_id);
create index if not exists proposals_updated_at_idx on public.proposals(updated_at desc);

create table if not exists public.proposal_revisions (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  version integer not null,
  snapshot jsonb not null,
  source text not null default 'manual' check (source in ('manual', 'autosave', 'agent')),
  created_by uuid null,
  created_at timestamptz not null default now(),
  unique(proposal_id, version)
);

create index if not exists proposal_revisions_proposal_id_idx on public.proposal_revisions(proposal_id, version desc);

alter table public.proposals enable row level security;
alter table public.proposal_revisions enable row level security;

create policy "admins manage proposals"
on public.proposals
for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'platform_role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'platform_role') = 'admin');

create policy "admins manage proposal revisions"
on public.proposal_revisions
for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'platform_role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'platform_role') = 'admin');
