-- Customers keyed by WhatsApp number, and numbered quotations / invoices.
create table if not exists public.customers (
  id text primary key default gen_random_uuid()::text,
  phone text not null unique,
  name text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.documents (
  id text primary key default gen_random_uuid()::text,
  number text not null unique,
  kind text not null check (kind in ('quote','invoice')),
  order_id text references public.orders(id) on delete set null,
  order_code text,
  customer_phone text not null default '',
  customer_name text not null default '',
  items jsonb not null default '[]',
  subtotal int not null default 0,
  discount int not null default 0,
  delivery_fee int not null default 0,
  total int not null default 0,
  advance_percent numeric not null default 0,
  advance_amount int not null default 0,
  paid int not null default 0,
  notes text not null default '',
  issued_on date not null default current_date,
  due_on date,
  created_by text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists documents_phone_idx on public.documents (customer_phone);
create index if not exists documents_order_idx on public.documents (order_id);

-- existing customers from orders and saved measurements
insert into public.customers (phone, name)
select distinct on (customer_phone) customer_phone, customer_name from public.orders where customer_phone <> '' order by customer_phone, created_at desc
on conflict (phone) do nothing;
insert into public.customers (phone, name) select phone, name from public.customer_measurements on conflict (phone) do nothing;

alter table public.customers enable row level security;
alter table public.documents enable row level security;
