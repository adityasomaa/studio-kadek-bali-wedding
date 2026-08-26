# Studio Kadek Bali Wedding

Marketing site for a wedding organizer in Ubud, Bali. Built as a **reusable template**: everything that differs between clients lives in one config file, and nothing else in the codebase hardcodes a client detail.

Live: https://studio-kadek-bali-wedding.onyxcreative.asia

---

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack, React 19) |
| Styling | Tailwind CSS v4, tokens in `src/app/globals.css` |
| Type | Neue Montreal, self-hosted WOFF2 |
| Motion | CSS transitions + Lenis (desktop pointers only) |
| Validation | Zod, on the server |
| Images | Generated SVG only. `images.unoptimized = true` |
| Languages | Indonesian (default) and English, route-prefixed |

---

## Duplicating this project for the next client

Follow these in order. Steps 1 to 6 are all you need for a normal client swap; the rest is deployment.

**1. Copy the project and rename it.**

```bash
cp -r bali-wedding-story <new-client-slug>
cd <new-client-slug>
rm -rf .git node_modules .next
npm install
```

**2. Edit `src/config/client.config.ts`. This is the only file with client data in it.**

```ts
export const client: ClientConfig = {
  name: 'Pratiwi Bali Wedding Organizer',   // wordmark, page titles, OG image
  shortName: 'Pratiwi Bali',                // tight spots
  slug: 'pratiwi-bali-wedding-organizer',   // repo name, Vercel project, subdomain
  origin: 'https://pratiwi-bali-wedding-organizer.onyxcreative.asia',
  city: 'Denpasar',
  region: 'Bali',
  whatsapp: '628xxxxxxxxxx',                // digits only, no + and no spaces
  accent: { chroma: 0.09, hue: 250 },       // OKLCH chroma + hue, see step 3
  unconfirmed: {                            // leave empty until the client confirms
    streetAddress: '',
    postalCode: '',
    openingHours: [],
    email: '',
  },
}
```

Also change the `name` in `package.json` to the new slug.

**3. Pick the accent and prove it is accessible.**

The whole palette is derived from `accent.chroma` and `accent.hue`. Keep chroma between about 0.07 and 0.13; anything higher gets loud, anything lower stops reading as a colour. Then:

```bash
npm run audit:contrast
```

It prints every text and non-text pair with its ratio and exits non-zero if any pair drops below WCAG AA. **Run this every time the accent changes.** Pastel wedding palettes fail here constantly, which is exactly why the check exists.

**4. Regenerate the graphics.**

```bash
npm run graphics
```

Rewrites all 24 gallery SVGs, the hero, the three package marks, and `public/icon.svg` in the new accent. Output is deterministic: same config in, identical bytes out.

**5. Regenerate the fonts (only on a machine that has the licensed TTFs).**

```bash
npm run fonts                              # reads C:/Users/User/Downloads/NEUE MONTREAL
FONT_SRC="/path/to/NEUE MONTREAL" npm run fonts
```

The WOFF2 files are committed, so this is a one-time step per machine, not per client.

**6. Adjust the copy if the client's service differs.**

- `src/config/site.data.ts` — packages, gallery categories, process steps, vendor and venue categories. Written for a non-technical editor, with the editing rules at the top of the file.
- `src/i18n/dictionaries.ts` — all UI strings and page copy, both languages.
- `src/i18n/legal.ts` — privacy policy and terms.

Every string exists twice, `id` and `en`. Change both.

**7. Verify locally.**

```bash
npm run dev
# in another terminal, once it is up:
BASE=http://localhost:3000 npm run audit:layout
BASE=http://localhost:3000 npm run verify
```

**8. Create the repository and deploy.**

Repository name, Vercel project name, and subdomain all use the same slug.

- Create the GitHub repo as `<slug>` and push.
- Create the Vercel project as `<slug>` in the **Onyx Creative Asia** team, framework Next.js.
- **Turn Deployment Protection / Vercel Authentication off.** It defaults to on at team scope, and every URL will demand a login until you do.
- The automatic alias picks up the team suffix (`-onyx-creative-asia`). Claim the short alias `<slug>.vercel.app` explicitly. If it returns **409** it belongs to another account: take the nearest free name, then update `origin` in `client.config.ts` so metadata, canonicals, sitemap, and robots all follow.

**9. Point the subdomain at it.**

The Hostinger integration is read-only for DNS, so the record goes in by hand:

1. hPanel → **Domains → onyxcreative.asia → DNS / Nameservers**.
2. **Choose type `CNAME` first, then fill the fields.** The third column is labelled *Value* until you change the type, at which point it becomes *Target*. Filling it before switching loses the entry.
3. Name `<slug>`, TTL default. For the Target, use the value Vercel actually asks for: add the domain to the project first, then read `recommendedCNAME` from the domain config. This account is issued a per-project host (`<hash>.vercel-dns-017.com`), not the generic `cname.vercel-dns.com`.
4. Add the domain in Vercel under the project's Domains tab before adding the record, so you have that value.
5. The SSL certificate takes roughly four minutes to issue. SSL errors before that are normal. Do not call it done until HTTPS returns 200.

**10. Verify in production, not on localhost.**

```bash
BASE=https://<slug>.onyxcreative.asia npm run audit:layout
BASE=https://<slug>.onyxcreative.asia npm run verify
```

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run fonts` | TTF → WOFF2 for Neue Montreal |
| `npm run graphics` | Regenerate every SVG from the client accent |
| `npm run audit:contrast` | WCAG AA check on every colour pair |
| `npm run audit:layout` | 14 routes × 3 viewports: overflow, heading line counts, broken images, failed requests, stray z-index |
| `npm run verify` | Browser behaviour checks: i18n, lightbox, mobile menu, calendar, WhatsApp payload, server-side date rejection |
| `npm run audit` | All three of the above in sequence |

`audit:layout` and `verify` take a `BASE` environment variable and default to `http://localhost:3000`.

---

## How it is put together

```
src/
  config/
    client.config.ts     the one file you edit per client
    site.data.ts         packages, gallery categories, process steps
  i18n/
    routes.ts            page keys and per-language URL slugs
    dictionaries.ts      every UI string, both languages
    legal.ts             privacy policy and terms bodies
  app/
    globals.css          colour tokens, z-index scale, typography scale
    components.css       component styles, all inside @layer components
    [locale]/            the root layout lives here, one segment per language
      [slug]/            every non-home page, resolved from routes.ts
    actions/consult.ts   server-side validation of the consultation form
    sitemap.ts robots.ts
  components/
    system/              provider, page curtain, smart link, reveal, Lenis
    form/                custom listbox, custom calendar, portalled layer
    gallery/ packages/ process/
scripts/                 font conversion, graphics generation, the three audits
```

### Decisions worth knowing before you change something

**Pick the accent outside hues 220-290.** The focus ring is a fixed indigo (`--focus`). An accent in that band stops being distinguishable from it, which quietly costs you a visible focus state. Change `--focus` if a client really needs a blue accent.

**One accent, two numbers.** `--accent-c` and `--accent-h` are written onto `<html>` from the client config. Every other colour in `globals.css` is derived from them at fixed lightness steps that have been contrast-checked. Change the two numbers, re-run the contrast audit, done.

**One z-index scale.** Declared once in `globals.css` as tokens and used through utility classes. Order: content → sticky header → mobile menu → lightbox and calendar → cookie banner → transition curtain → skip link. `audit:layout` fails the build if any element computes a z-index outside that scale. The cookie banner sits above the mobile menu in the scale but is *suppressed* while the menu is open, so it can never cover the navigation.

**Overlays are portalled to `<body>`.** The lightbox, the select listbox, and the date calendar all render through `createPortal`. Rendered in place they get cropped by the first ancestor that clips its overflow, which on a 375px screen means half a calendar.

**Scroll lock pins the body.** `overflow: hidden` alone collapses the document height, the browser clamps `scrollY`, and the page has quietly jumped by the time the overlay closes. The body is pinned at its offset instead, and Lenis is told the restored position so it does not animate back to a stale one.

**The header is `position: fixed`, not `sticky`.** Sticky stops working the moment the scroll container changes, which is what the scroll lock does.

**The wordmark absorbs the header's shrink; the controls never do.** `.header-actions` is `flex: none`. Without it the global `* { min-width: 0 }` lets that group collapse below its own min-content and the hamburger spills past the viewport edge, which a long business name is enough to trigger.

**The loader breaks the wordmark where `shortName` says, not where the browser runs out of room.** `wordmarkParts()` splits the name after `shortName` when it is a proper prefix, so a long name reads as two deliberate lines on phone and tablet and sits on one line on desktop. `shortName` equal to `name`, as it is here, keeps the wordmark a single unbroken line at every width.

**The hero display size is banded by name length.** `displayCap()` in the locale layout writes `--display-cap` onto `<html>`. Business names in this set run from 12 to 30-plus characters; one fixed size either wastes the screen or pushes a long name onto a third line. Names up to 20 characters get one line on desktop, longer ones get two balanced lines. `audit:layout` reports two desktop lines as a warning, not a failure: the rule is one line ideally, never more than two on desktop and never four anywhere.

**Transitions never depend on `requestAnimationFrame` alone.** `src/lib/wait.ts` races rAF against `setTimeout`. rAF stops firing in a background tab, and a sequence chained on it alone leaves the curtain covering the page forever.

**No grain, no noise, no film texture.** Depth comes from gradients, line weight, and scale contrast.

**Translucent colours are sRGB.** Translucent `oklch()` / `color-mix()` values did not composite reliably in testing; the lightbox scrim uses element opacity and shadows use plain `rgb(... / a)`.

### Things this site deliberately does not say

No prices, no ratings, no review counts, no number of weddings handled, no year founded, no testimonials, no couple names, no vendor company names, no venue names, no "best" or "most trusted", and no promises about weather, date availability, or outcome.

The images are generated geometric compositions. They do not imitate photographs, venues, or people, and the alt text says so. Reusing someone else's wedding photography is a real problem in this industry, and the site says plainly on the gallery page that the graphics are placeholders.

`client.unconfirmed` holds the fields nobody has confirmed yet. They are empty on purpose. The contact page says the address and hours are not published rather than inventing them, and the LocalBusiness structured data omits them entirely until they are filled in.
