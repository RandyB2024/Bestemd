-- Public Wize website chat: isolated from tenant and Office accounting tables.
-- Apply in the BESTEMD Supabase project after reviewing migration conventions.
create table if not exists public.website_wize_conversations (
 id uuid primary key default gen_random_uuid(),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 status text not null default 'open' check(status in ('open','needs_human','closed')),
 source text not null default 'mijnbestemd.nl',
 visitor_session_hash text not null,
 privacy_notice_version text not null default 'wize-2026-11',
 assigned_to uuid null,
 last_message_at timestamptz not null default now()
);
create table if not exists public.website_wize_messages (
 id uuid primary key default gen_random_uuid(),
 conversation_id uuid not null references public.website_wize_conversations(id) on delete cascade,
 sender text not null check(sender in ('visitor','wize','employee')),
 body text not null check(char_length(body) between 1 and 2000),
 sources jsonb not null default '[]'::jsonb,
 created_at timestamptz not null default now()
);
create index if not exists idx_website_wize_messages_conversation_time on public.website_wize_messages(conversation_id, created_at);
create index if not exists idx_website_wize_conversations_recent on public.website_wize_conversations(last_message_at desc);
alter table public.website_wize_conversations enable row level security;
alter table public.website_wize_messages enable row level security;
-- No anon/authenticated permissions or RLS policies by default. The public chat
-- is write-only through its narrowly scoped Cloudflare Worker service client.
revoke all on public.website_wize_conversations from anon, authenticated;
revoke all on public.website_wize_messages from anon, authenticated;
-- Office must add policies for specific verified staff roles, not all authenticated.
-- Never join public chats directly to customer tenant data based on session IDs.
