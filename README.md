# Nool & Mal — made-to-order dresses, Sri Lanka

Customers browse designs, change colours, fabric and details, watch the price update live, get a design code (`NM-7K4Q2`) and send it on WhatsApp for a quotation. Custom requests (link or photos) get a `CR-` code. After the quote: advance payment by bank transfer with slip upload, measurement booking, status tracking, balance payment and collection or delivery. Everything works without an account.

**Stack:** Next.js 16 (App Router, TypeScript, Turbopack) · Tailwind CSS v4 · Supabase (Postgres, Auth, Storage) · Zod · React Hook Form · sharp · Vitest.

---

## Quick start (local demo mode — no Supabase needed)

```bash
npm install
cp .env.example .env.local     # optional in demo mode
npm run dev                    # http://localhost:3000
```

Without Supabase variables the app runs in **local demo mode**: data lives in `.data/db.json` (seeded automatically from `data/seed.ts`) and uploads in `.data/storage/`. Admin is at `/admin` with the password from `ADMIN_PASSWORD` (default `admin` in development only).

```bash
npm test             # unit tests: pricing engine, codes, URL encoding, WhatsApp messages
npm run typecheck
npm run seed         # wipe the local demo store (it re-seeds on the next request)
npm run build && npm start
```

## Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | all | Canonical URL, used in links sent on WhatsApp, sitemap, OG images |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | all | Business WhatsApp number, E.164 **without** `+` (e.g. `94771234567`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase mode | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase mode | Anon key — used **only** for Auth in the browser |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase mode, **server only** | All data access goes through server routes with this key |
| `ADMIN_EMAILS` | Supabase mode | Comma-separated emails allowed into `/admin` |
| `ADMIN_PASSWORD` | demo mode | `/admin` password when Supabase isn't configured |
| `SESSION_SECRET` | all (required in production) | Signs the admin cookie and private file links (`openssl rand -hex 32`) |
| `DATA_DIR` | demo mode | Where the local store writes (default `.data`, `/tmp/...` on Vercel) |

Supabase mode switches on when `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are both set. Never commit `.env*` files.

## Supabase setup

1. Create a project at supabase.com (region: Singapore/Mumbai is closest to Sri Lanka).
2. Run the schema: **SQL editor → paste `supabase/migrations/0001_init.sql` → Run**, or with the CLI:
   ```bash
   supabase link --project-ref <ref>
   supabase db push
   ```
   This creates all tables with **Row Level Security enabled on every table**, public read-only policies for the catalogue, and the storage buckets `designs` (public), `references` and `slips` (private).
3. Seed the catalogue: run `supabase/seed.sql` in the SQL editor (or `supabase db reset` locally). Regenerate it after editing `data/seed.ts` with `npm run seed:sql`.
4. **Auth:** Authentication → Providers → enable **Email** (magic link) and **Google** (add your Google OAuth client). Under URL configuration add `https://<your-domain>/auth/callback` (and `http://localhost:3000/auth/callback` for development) to the redirect allowlist.
5. Put your admin email(s) in `ADMIN_EMAILS`, sign in at `/admin/login`.

The product photos in `public/catalog/` ship with the app. Photos you upload in the admin go to the `designs` bucket.

## Deploy to Vercel

1. Push this repository to GitHub and **Import** it in Vercel (framework: Next.js, no build settings to change).
2. Add the environment variables above for Production (and Preview if wanted). Set `NEXT_PUBLIC_SITE_URL` to the final domain.
3. Deploy, then add your domain and update the Supabase Auth redirect URL to match.
4. Check `/robots.txt`, `/sitemap.xml` and `/llms.txt` on the live domain, and submit the sitemap in Google Search Console.

> Without Supabase, a Vercel deployment still works as a **demo**, but data is written to `/tmp` and disappears when the function restarts. Use Supabase for anything real.

## How it fits together

```
app/(site)/         public pages: home, collection, customiser, custom request, quote/order, track, account, content pages
app/admin/          admin panel (server actions in app/admin/actions.ts; every action re-checks the admin session)
app/api/            JSON endpoints used by the browser (save design, uploads, slip, booking, tracking, events)
lib/pricing.ts      the pure pricing + validation function used by browser AND server
lib/figure.ts       the parametric, recolourable dress preview (also used for OG images)
lib/whatsapp.ts     wa.me link + message templates (English and Sinhala)
lib/server/         data layer (Supabase or local JSON), storage, auth, orders/quotes/payments/booking logic
data/seed.ts        seed catalogue (designs, palette, fabrics, add-ons, rules, sizes, settings)
supabase/           SQL migration + generated seed
config/site.ts      business details and PLACEHOLDERS
messages/           UI strings: en (complete), si / ta (draft, falls back to English)
```

**Prices** are computed by `computePrice()` in the browser for instant feedback and again on the server when a design is saved; if the browser's total differs (stale page or tampering) the server answers `409` with the correct figure. All price rules (base prices, fabric/option/size modifiers, range %, rush rules, capacity, delivery fees) live in the database and are editable in **Admin → Catalog & prices**.

**Privacy & access:** guests are identified by an anonymous `nm_guest` cookie. Short codes are references only; private pages (`/q/…`, `/r/…`) additionally require a 128-bit key in the link, the same device, the signed-in owner, or an admin. `/track` swaps code + phone for that link. Reference photos and slips are stored privately and served through 15-minute signed URLs; uploads are decoded and re-encoded server-side (format/size validated, EXIF/GPS removed). Uploads, lookups and form posts are rate-limited.

**Adding a design:** Admin → Designs → New design. Build the preview from parametric parts (bodice, sleeves, skirt, length, textures and extras) or upload real garment layers: transparent PNGs of each part in white/light grey, which the site tints with the chosen colour.

## Before launch — replace the placeholders

All in `config/site.ts`, `data/seed.ts` (or later in Admin → Catalog):

- [ ] Real WhatsApp number (`NEXT_PUBLIC_WHATSAPP_NUMBER`) and display phone
- [ ] Bank account details (Admin → Catalog → Settings)
- [ ] Studio address, map link and opening hours
- [ ] Final garment list and real base prices; fabric and add-on prices
- [ ] Real photos for every design (and remove designs you won't offer)
- [ ] Delivery fee table and weekly order capacity
- [ ] Sinhala and Tamil translations (`messages/si.ts`, `messages/ta.ts`) — reviewed by a native speaker
- [ ] Replace the **sample testimonials** in `config/site.ts` with real customer quotes (with permission)
- [ ] Have the Terms and Privacy pages reviewed
- [ ] Instagram handle and email

## Quality checks done

- `npm test`: 19 unit tests (pricing, rush fees, per-metre lining, ranges, compatibility rules, validation of every seeded design, code generator, URL encoding, WhatsApp messages).
- End-to-end browser runs of: customise → code → WhatsApp message → `/d/<code>` restores the same range; tampered price rejected; custom request with link + photos; private links 404 without the key; forged file signatures rejected; admin quote → customer tracks, accepts, uploads slip → admin approves → slots → booking → status updates visible to the customer; admin price change reflected live.
- The SQL migration and seed were executed against Postgres (PGlite) successfully.
- Lighthouse (mobile, production build): Home 97–99 / 100 / 100 / 100, Collection 90+ / 100 / 100 / 100 (performance / accessibility / best practices / SEO).
