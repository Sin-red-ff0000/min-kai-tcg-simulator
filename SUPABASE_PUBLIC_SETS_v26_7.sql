-- みん会TCG Simulator Ver26.7 公開セット配布
-- Supabase SQL Editorで全文実行してください。

create table if not exists public.minkai_public_sets (
  id uuid primary key default gen_random_uuid(),
  set_name text not null,
  author_name text not null default '',
  description text not null default '',
  card_ids jsonb not null default '[]'::jsonb,
  management_key_hash text not null,
  download_count bigint not null default 0,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.minkai_public_sets enable row level security;

revoke all on table public.minkai_public_sets from anon, authenticated;

create index if not exists minkai_public_sets_public_updated_idx
  on public.minkai_public_sets(is_public, updated_at desc);

create index if not exists minkai_public_sets_management_idx
  on public.minkai_public_sets(management_key_hash, updated_at desc);
