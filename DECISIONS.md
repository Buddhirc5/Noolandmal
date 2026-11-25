# Decisions & assumptions

Choices made while building, so they're easy to revisit.

## Product & content
- **First catalogue = the 7 lookbook photo sets supplied.** Each 2×2 collage was split into front / back / detail / angle shots (`scripts/split-catalog-images.mjs`). Four extra designs without photos (kids' frock, crochet top, saree blouse, everyday frock) fill the categories from the brief; they use the drawn preview only.
- Design names, descriptions and **all prices are placeholders** I wrote from the photos. Base prices assume the default fabric modifier is added on top (e.g. Noir gown = 32,000 + sequin net 9,000).
- **Testimonials are labelled samples** in `config/site.ts` and must be replaced with real ones before launch.
- The story says Roshini Shyama designs, cuts and sews every piece herself in her Kotte studio (she runs the business alone). Edit `messages/en.ts` to change the wording.
- "Length" options are priced relative to the design as shown ("As designed" = 0; mini −1,500 … train +3,500) so a design's default length never adds a confusing line to the price.
- Default ±8 % estimate range, 21-day lead time, 20 % rush fee (under 21 days), warning under 7 days, 50 % advance, 7-day quote validity, weekly capacity 6 — all editable in admin.

## Look & feel
- **UI follows ceynk.lk** (from the screenshots supplied): floating dark pill navigation with a bright accent button, full-bleed hero with a centred headline and a pill search box, a white sheet with large rounded corners sliding over the hero, small uppercase centred eyebrows, bold geometric-sans headings with *italic serif accent words*, borderless warm-grey cards, a mono "LABEL • 01 / 04" carousel header with round arrows and dark phone mockups, a single large testimonial card with an avatar-pill switcher, and stacked grey FAQ cards. Ceynk's black and lime become Nool & Mal deep green and gold. Ceynk's painted landscape is replaced by a dimmed collage of your lookbook photos.
- Fonts: **Figtree** (UI and headings — close to ceynk's geometric sans), **Instrument Serif** italic for accent words and numerals, **Cormorant Garamond** only for the logo wordmark; Noto Sans/Serif Sinhala and Noto Sans Tamil for other scripts. Accent words are marked with `*asterisks*` in the copy (`messages/en.ts`). This replaces the Cormorant/Poppins pairing from the original brief.
- `--muted` is darkened from `#6B7A75` to `#5F6E69` so small grey text meets WCAG AA on the ivory background. Text on gold buttons uses `--ink` for the same reason.
- The logo is recreated as SVG (`components/brand/Logo.tsx`, variants full / horizontal / icon / mono). Favicons are generated from the same geometry (`npm run brand`).
- shadcn/ui wasn't installed: the handful of primitives needed (buttons, chips, cards, inputs, accordion via `<details>`, `<dialog>` modal) are small Tailwind utilities themed with the brand tokens — fewer dependencies, same result.

## Customiser preview
- **Photos only, no drawings.** The drawn/animated dress model was removed completely (code, data table and admin controls). The customiser shows only photos uploaded by the studio: a chosen **version**'s photos, else photos of the chosen **colour**, else the design photos. If a colour has no photo yet, the page says which colour the photos show.
- **Versions** (`designs.versions`: key, name, price change, photos) cover photographed variations such as ornaments or sleeve styles; they are priced in `computePrice` and named in the WhatsApp message.

## Architecture
- **Two data backends behind one tiny interface** (`lib/server/db.ts`): Supabase in production, a JSON file for local development/demos, so the app runs with zero setup. All business logic is written once against that interface.
- **Browsers never query tables directly.** All reads/writes of customer data go through server routes with the service-role key; RLS is enabled on every table with read-only policies only for the public catalogue. This keeps guest access (codes, cookies, secret links) in one auditable place instead of complex RLS policies.
- `quote_requests` from the brief is merged into **`orders`**: an order row is created when a code is generated (`draft`), moves to `quote_requested` when the customer taps WhatsApp (`whatsapp_clicked_at` + an `events` row with `status: sent_to_whatsapp`). One row per code then carries the whole lifecycle.
- Short codes (5 chars, 32-letter alphabet, ~33 M combinations) are human references, not secrets. Private pages need an additional **128-bit access key** in the link (or the same device / owner / admin). `/d/<code>` is intentionally public (shareable) because it holds only the design; name, phone and the free-text notes are never shown there to anyone except the owner's device/account or an admin.
- Customer-side state uses React state synced to the URL (`?c=…&f=…&o=…`) rather than Zustand: the URL already is the shareable store.
- i18n uses a small dictionary + cookie (`nm_lang`) instead of `next-intl` routing; `?lang=si|ta` sets the cookie (used in hreflang alternates). English is complete; Sinhala/Tamil contain draft strings for navigation and key CTAs and fall back to English. WhatsApp messages are available in English and Sinhala.
- Admin auth: Supabase Auth (Google or magic link) + `ADMIN_EMAILS` allowlist; in demo mode a password with a signed, httpOnly 12-hour cookie. Admin mutations are server actions that re-check the session and write to `admin_audit_log`.
- Rate limiting is an in-memory fixed window per server instance. For multi-region production traffic, swap `lib/server/rate-limit.ts` for Upstash Redis.
- Vercel limits function request bodies to ~4.5 MB, so photos are compressed in the browser (max 1600 px JPEG) before upload and the total is capped at 4 MB; the server still validates every file by decoding it. For larger uploads, switch to Supabase signed upload URLs.
- Measurement capacity: admin generates slots from a weekly template; a week is "fully booked" once bookings reach the weekly capacity, and the customer sees the next available week highlighted.
- Analytics: first-party `events` table (WhatsApp clicks, saves, uploads, bookings). Add Vercel Analytics or GA if you want dashboards.

## Photo-led redesign (latest)
- **Real photography only.** The drawn dress previews and mock UI widgets were removed from the public site. Designs without photos are unpublished until photos are supplied. Open Graph images use the design photo.
- **Photos per colour.** `designs.color_images` maps a palette colour to photos of the design made in that colour. Upload them in Admin → Designs → "Photos by colour". When a customer picks that colour, those photos replace the defaults; otherwise the page says which colour the photos show.
- **Add-ons paused.** `features.addons = false` hides sleeves/embroidery/etc. in the customiser; the data, pricing and admin stay in place for a later update. Included defaults (e.g. lining) are listed as "Includes" in the quote.
- **No emoji or decorative icons**; only functional icons (menu, close, chevrons, plus/minus, checkmarks, WhatsApp logo).
- **Hero** uses the supplied studio photograph (`public/brand/hero-studio.webp`) full-bleed under the floating nav, with the looks fanned at the bottom and a white rounded sheet sliding over it (ceynk.lk pattern). The language switch moved from the nav to the footer and mobile menu.
