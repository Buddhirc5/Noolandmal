-- Creator programme applications (/creators). Server-only access via the service role.
create table if not exists public.creator_applications (
  id text primary key default gen_random_uuid()::text,
  code text not null unique,
  name text not null,
  phone text not null,
  email text,
  platform text not null,
  followers text not null,
  handle text not null,
  design text,
  video_url text,
  notes text not null default '',
  status text not null default 'new' check (status in ('new', 'approved', 'declined', 'posted')),
  created_at timestamptz not null default now()
);
create index if not exists creator_applications_created_idx on public.creator_applications (created_at desc);
alter table public.creator_applications enable row level security;
