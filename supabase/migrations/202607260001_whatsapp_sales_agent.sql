create table if not exists public.whatsapp_sales_messages (
  id uuid primary key default gen_random_uuid(),
  chat_id text not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  external_message_id text,
  sender_name text,
  created_at timestamptz not null default now()
);

create unique index if not exists whatsapp_sales_messages_external_id_idx
  on public.whatsapp_sales_messages (external_message_id)
  where external_message_id is not null;

create index if not exists whatsapp_sales_messages_chat_created_idx
  on public.whatsapp_sales_messages (chat_id, created_at desc);

create table if not exists public.whatsapp_sales_leads (
  id uuid primary key default gen_random_uuid(),
  chat_id text not null unique,
  sender_name text,
  status text not null default 'new',
  summary text,
  assigned_to text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.whatsapp_sales_messages enable row level security;
alter table public.whatsapp_sales_leads enable row level security;

comment on table public.whatsapp_sales_messages is
  'Server-side WhatsApp sales-agent conversation history. Access through the service role only.';

comment on table public.whatsapp_sales_leads is
  'Leads detected by the SegurIA WhatsApp sales agent. Access through the service role only.';
