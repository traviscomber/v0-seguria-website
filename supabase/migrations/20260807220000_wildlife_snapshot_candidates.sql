create table if not exists public.wildlife_snapshot_candidates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  device_id uuid not null references public.devices(id) on delete cascade,
  camera_snapshot_id uuid not null references public.camera_snapshots(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','processing','completed','discarded','failed')),
  source text not null default 'seguria_edge' check (source in ('seguria_edge','manual','adapter')),
  attempt_count integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(camera_snapshot_id)
);

create index if not exists wildlife_snapshot_candidates_pending_idx
  on public.wildlife_snapshot_candidates(status, created_at)
  where status in ('pending','failed');

create index if not exists wildlife_snapshot_candidates_device_idx
  on public.wildlife_snapshot_candidates(device_id, created_at desc);

alter table public.wildlife_snapshot_candidates enable row level security;

comment on table public.wildlife_snapshot_candidates is
  'Canonical queue of camera snapshots eligible for SegurIA Wildlife/Vision analysis. Only cameras with camera_role wildlife or mixed are routed here.';
