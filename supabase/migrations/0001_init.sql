-- Nool & Mal schema. Row Level Security is enabled on every table.
-- Browsers only ever READ the public catalogue directly; everything else goes
-- through Next.js server routes using the service role key (which bypasses RLS).


-- ── Catalogue ────────────────────────────────────────────────────────────
create table public.palette_colors (
  id text primary key default gen_random_uuid()::text,
  key text not null unique,
  name text not null,
  hex text not null check (hex ~* '^#[0-9a-f]{6}$'),
  sort int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.fabrics (
  id text primary key default gen_random_uuid()::text,
  key text not null unique,
  name text not null,
  note text not null default '',
  price_modifier int not null default 0,
  available_colors text[],
  sort int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.addon_groups (
  id text primary key default gen_random_uuid()::text,
  key text not null unique,
  name text not null,
  description text not null default '',
  selection text not null default 'single' check (selection in ('single','multi')),
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table public.addon_options (
  id text primary key default gen_random_uuid()::text,
  key text not null unique,
  group_key text not null references public.addon_groups(key) on update cascade,
  name text not null,
  description text not null default '',
  price int not null default 0,
  price_type text not null default 'fixed' check (price_type in ('fixed','per_metre')),
  image_url text,
  layer jsonb,
  sort int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.addon_rules (
  id text primary key default gen_random_uuid()::text,
  option_a text not null references public.addon_options(key) on update cascade on delete cascade,
  option_b text not null references public.addon_options(key) on update cascade on delete cascade,
  reason text not null,
  created_at timestamptz not null default now()
);

create table public.size_options (
  id text primary key default gen_random_uuid()::text,
  key text not null unique,
  label text not null,
  modifier int not null default 0,
  note text not null default '',
  sort int not null default 0,
  created_at timestamptz not null default now()
);

-- Single row (id = 1) holding pricing, capacity, bank and delivery settings
create table public.price_settings (
  id int primary key check (id = 1),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.designs (
  id text primary key default gen_random_uuid()::text,
  slug text not null unique,
  name text not null,
  category text not null,
  occasions text[] not null default '{}',
  description text not null default '',
  base_price int not null,
  fabric_metres numeric not null default 3,
  default_fabric text not null,
  fabric_keys text[] not null default '{}',
  addon_groups text[] not null default '{}',
  default_options text[] not null default '{}',
  images text[] not null default '{}',
  published boolean not null default false,
  featured boolean not null default false,
  sort int not null default 0,
  badge text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.design_regions (
  id text primary key default gen_random_uuid()::text,
  design_id text not null references public.designs(id) on delete cascade,
  key text not null,
  label text not null,
  default_color text not null,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  unique (design_id, key)
);

create table public.design_layers (
  id text primary key default gen_random_uuid()::text,
  design_id text not null references public.designs(id) on delete cascade,
  slot text not null,
  variant text not null default '',
  region_key text not null default '',
  z int not null default 0,
  image_url text,
  opacity numeric not null default 1,
  created_at timestamptz not null default now()
);

-- ── Customers & orders ─────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null default '',
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);

create table public.configurations (
  id text primary key default gen_random_uuid()::text,
  code text not null unique,
  design_id text not null references public.designs(id),
  design_slug text not null,
  guest_id text,
  user_id uuid references auth.users(id) on delete set null,
  selections jsonb not null,
  price_min int not null,
  price_max int not null,
  price_total int not null,
  price_breakdown jsonb not null,
  notes text not null default '',
  needed_by date,
  created_at timestamptz not null default now()
);
create index on public.configurations (guest_id);
create index on public.configurations (user_id);

create table public.custom_requests (
  id text primary key default gen_random_uuid()::text,
  code text not null unique,
  guest_id text,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  phone text not null,
  reference_url text,
  notes text not null default '',
  occasion text not null default '',
  budget text,
  needed_by date,
  size_notes text not null default '',
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table public.request_files (
  id text primary key default gen_random_uuid()::text,
  custom_request_id text not null references public.custom_requests(id) on delete cascade,
  path text not null,
  content_type text not null,
  size int not null,
  created_at timestamptz not null default now()
);

create table public.orders (
  id text primary key default gen_random_uuid()::text,
  code text not null unique,
  access_key text not null,
  kind text not null check (kind in ('design','custom')),
  configuration_id text references public.configurations(id),
  custom_request_id text references public.custom_requests(id),
  guest_id text,
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null default '',
  customer_phone text not null default '',
  status text not null default 'draft' check (status in ('draft','quote_requested','quoted','advance_paid','measurement_booked','measured','cutting','sewing','fitting','ready','delivered','collected','cancelled')),
  status_history jsonb not null default '[]',
  fulfilment text not null default 'pickup' check (fulfilment in ('pickup','delivery')),
  district text,
  delivery_address text,
  internal_notes text not null default '',
  whatsapp_clicked_at timestamptz,
  paid_in_full boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.orders (status);
create index on public.orders (guest_id);
create index on public.orders (user_id);

create table public.quotes (
  id text primary key default gen_random_uuid()::text,
  order_id text not null references public.orders(id) on delete cascade,
  amount int not null,
  advance_percent numeric not null,
  advance_amount int not null,
  delivery_fee int not null default 0,
  valid_until date not null,
  status text not null default 'issued' check (status in ('issued','accepted','superseded')),
  note text not null default '',
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.payments (
  id text primary key default gen_random_uuid()::text,
  order_id text not null references public.orders(id) on delete cascade,
  quote_id text not null references public.quotes(id),
  type text not null check (type in ('advance','final')),
  amount int not null,
  slip_path text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reject_reason text,
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.measurement_slots (
  id text primary key default gen_random_uuid()::text,
  starts_at timestamptz not null,
  mode text not null default 'studio' check (mode in ('studio','home')),
  capacity int not null default 1,
  created_at timestamptz not null default now()
);

create table public.measurement_bookings (
  id text primary key default gen_random_uuid()::text,
  slot_id text not null references public.measurement_slots(id),
  order_id text not null references public.orders(id) on delete cascade,
  mode text not null check (mode in ('studio','home')),
  address text,
  status text not null default 'booked' check (status in ('booked','cancelled')),
  created_at timestamptz not null default now()
);

create table public.events (
  id text primary key default gen_random_uuid()::text,
  type text not null,
  code text,
  guest_id text,
  meta jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index on public.events (code);

create table public.admin_audit_log (
  id text primary key default gen_random_uuid()::text,
  actor text not null,
  action text not null,
  entity text not null,
  entity_id text,
  detail jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- ── Row Level Security ───────────────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array['palette_colors','fabrics','addon_groups','addon_options','addon_rules','size_options','price_settings',
    'designs','design_regions','design_layers','profiles','configurations','custom_requests','request_files','orders','quotes',
    'payments','measurement_slots','measurement_bookings','events','admin_audit_log']
  loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- Public, read-only catalogue (anon + authenticated). No write policies: writes use the service role.
create policy "catalog read" on public.palette_colors for select using (active);
create policy "catalog read" on public.fabrics for select using (active);
create policy "catalog read" on public.addon_groups for select using (true);
create policy "catalog read" on public.addon_options for select using (active);
create policy "catalog read" on public.addon_rules for select using (true);
create policy "catalog read" on public.size_options for select using (true);
create policy "designs read" on public.designs for select using (published);
create policy "regions read" on public.design_regions for select using (exists (select 1 from public.designs d where d.id = design_id and d.published));
create policy "layers read" on public.design_layers for select using (exists (select 1 from public.designs d where d.id = design_id and d.published));

-- Signed-in customers may read their own profile. Orders, quotes, slips etc. have
-- NO client policies at all: guests and users reach them only via server routes
-- that check the unguessable access key, guest cookie or session.
create policy "own profile" on public.profiles for select using (auth.uid() = id);

-- ── Storage ──────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('designs', 'designs', true, 10485760, array['image/webp','image/png','image/jpeg']),
  ('references', 'references', false, 10485760, array['image/webp']),
  ('slips', 'slips', false, 10485760, array['image/webp'])
on conflict (id) do nothing;
-- No storage policies are created for "references" or "slips": they are private and
-- only reachable through short-lived signed URLs minted by the server.
