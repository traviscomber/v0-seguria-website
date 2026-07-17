alter table public.property_automations
  add column desired_status text check (desired_status in ('active', 'paused')),
  add column deployment_token uuid,
  add column deployment_requested_at timestamptz,
  add column last_error text;

create unique index property_automations_deployment_token_idx
  on public.property_automations(deployment_token) where deployment_token is not null;
