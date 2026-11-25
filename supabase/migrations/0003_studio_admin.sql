-- Studio admin: manual orders, WhatsApp-recorded payments, saved measurements, expenses.
alter table public.orders drop constraint if exists orders_kind_check;
alter table public.orders add constraint orders_kind_check check (kind in ('design','custom','manual'));
alter table public.orders add column if not exists title text;
alter table public.orders add column if not exists details text;
alter table public.orders add column if not exists needed_by date;
alter table public.orders add column if not exists received_at timestamptz;

alter table public.payments alter column quote_id drop not null;
alter table public.payments alter column slip_path set default '';
alter table public.payments add column if not exists method text not null default 'slip' check (method in ('slip','whatsapp'));
alter table public.payments add column if not exists paid_on date;

create table if not exists public.customer_measurements (
  id text primary key default gen_random_uuid()::text,
  phone text not null unique,
  name text not null default '',
  values jsonb not null default '{}',
  notes text not null default '',
  taken_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id text primary key default gen_random_uuid()::text,
  spent_on date not null,
  category text not null check (category in ('fabric','accessories','transport','tailoring','packaging','other')),
  amount int not null check (amount >= 0),
  note text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists expenses_spent_on_idx on public.expenses (spent_on);
create index if not exists events_created_idx on public.events (created_at);

alter table public.customer_measurements enable row level security;
alter table public.expenses enable row level security;
