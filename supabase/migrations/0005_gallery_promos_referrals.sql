-- Gallery of finished orders, discount codes and the referral programme.
create table if not exists public.gallery_items (
  id text primary key default gen_random_uuid()::text,
  slug text not null unique,
  title text not null,
  occasion text not null default '',
  story text not null default '',
  design_slug text,
  images jsonb not null default '[]',
  published boolean not null default true,
  featured boolean not null default false,
  sort int not null default 0,
  made_on date,
  created_at timestamptz not null default now()
);

create table if not exists public.discount_codes (
  id text primary key default gen_random_uuid()::text,
  code text not null unique,
  kind text not null check (kind in ('percent','fixed')),
  value int not null check (value > 0),
  min_total int not null default 0,
  starts_on date,
  ends_on date,
  max_uses int,
  active boolean not null default true,
  note text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.referral_rewards (
  id text primary key default gen_random_uuid()::text,
  referrer_phone text not null,
  referred_phone text not null,
  order_code text not null unique,
  amount int not null,
  status text not null default 'earned' check (status in ('earned','used')),
  used_in text,
  created_at timestamptz not null default now()
);
create index if not exists referral_rewards_referrer_idx on public.referral_rewards (referrer_phone);

alter table public.customers add column if not exists referral_code text unique;
alter table public.orders add column if not exists promo_code text;
alter table public.orders add column if not exists promo_kind text check (promo_kind in ('discount','referral'));
alter table public.orders add column if not exists promo_label text;
alter table public.orders add column if not exists referrer_phone text;

insert into public.gallery_items (slug, title, occasion, story, images, published, featured, sort, made_on)
values ('blush-plum-leaf-gown', 'Blush satin gown with plum leaf appliqué', 'Evening',
  'A strapless blush satin bodice with a corset lace-up back, finished with hand-beaded plum satin leaves that climb from the waist to the neckline. A sheer tulle overskirt falls into a soft train, worn with a matching tulle neck scarf and shawl.',
  '["/gallery/blush-plum-leaf-gown/front.webp","/gallery/blush-plum-leaf-gown/back.webp","/gallery/blush-plum-leaf-gown/side.webp","/gallery/blush-plum-leaf-gown/detail.webp"]',
  true, true, 0, null)
on conflict (slug) do nothing;

alter table public.gallery_items enable row level security;
alter table public.discount_codes enable row level security;
alter table public.referral_rewards enable row level security;
