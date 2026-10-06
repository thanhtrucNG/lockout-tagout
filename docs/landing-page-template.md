# Handyman Product Landing Page — Template Specification

**Reference implementation:** HYPERION Marine Safety Signs (reference repository)
**Audience:** AI agents and developers building a sales landing page for another Handyman product
**Status:** Standard v1 — every value in this document is fixed. Where a range is not given, none is allowed.
**Last updated:** 2026-10-03 (second pass) — footer (§10, §3.3: right-aligned links with a "Contact:" label, photo positioned on the waves), payment step and methods (§1.1, §12.3), VAT invoice (§12.1), pricing (§12.2), specs catalogue (§12.4). Latest reference for these parts: the HandyPad site (`handypad-new`). Added the same day: Order Summary product list keeps one height (§6.5.1, §9 rule 12).

---

## 0. How an agent must use this document

1. **Copy, don't redesign.** The layout, components, checkout flow and theme are reused as-is. A new product changes only the *inputs* listed in §2.
2. **Every number is fixed.** Use the exact px values in this document. Do not pick "something between X and Y", do not use `clamp()`, `vw`-based font sizes or ad-hoc values. If a value you need is missing, use the nearest token from §5/§6 and flag it in your hand-off note — do not invent a new one.
3. **MUST / MUST NOT** are hard rules. **SHOULD** allows an exception only with a written reason in the hand-off note.
4. **Only use images supplied for this product** (§4). Never fetch, generate or borrow images.
5. **Before handing off, run the checklist in §15** and report the result of each item.

---

## 1. Page anatomy (fixed section order)

Every product site has exactly these sections, in this order. Do not add, remove or reorder sections without approval.

| # | Section | Background | Purpose (what the user decides here) |
|---|---|---|---|
| 1 | **Header** (sticky) | Light — sky asset | Where to go; language; contact sales |
| 2 | **Hero** | Dark — hero photo + navy overlay | "Is this the product I need?" → start ordering or get catalogue |
| 3 | **Feature section** ("Built for…") — *or its Story variant (§1.2), if the brief chooses it* | Light — misty-sea asset | "Is it good enough / compliant?" |
| 3b | **Product range** strip — *optional*, only if the brief includes it | Light — plain page colour | "What else is in this range?" (auto-sliding strip, §11.2) |
| 4 | **Shop section**: Product search + Configurator steps + Order summary | Light — plain page colour | Find the exact item, configure, pay |
| 5 | **Footer** | Dark — ocean asset | Who is the company; how to reach them |

**Light/dark rhythm rule:** header light → hero dark → feature light → shop light → footer dark. Two dark sections MUST NOT be adjacent. If a product needs a second feature section, it MUST be light and placed between §3 and §4.

### 1.1 Section contents (fixed components)

**Header**
- Left: Handyman logo (`assets/handyman-logo.png`, links to `./`).
- Right, in order: nav links `PRODUCT LOOKUP` (→ `#product-query`), `ORDER` (→ `#find-your-sign`) — both glide per §11.1, `CATALOGUE` (downloads the product PDF) · language switch `EN | VI` · `CONTACT SALES` button — opens a small panel with three direct contact options, each with its app icon: **Call us** (tel:), **WhatsApp** (wa.me), **Zalo** (Zalo on the sales phone number, `corporate.zalo_href` = `https://zalo.me/84347099905`). No contact form. Desktop: dropdown under the button (300px wide). Below 1024px: the options open inline under the menu's `CONTACT SALES` button. Closes on outside click, Escape (focus returns to the button) and after an option is picked. Component: `src/components/contact-options.js`; icons: `assets/icons/{phone,whatsapp,zalo}.png` (shared, 96×96 transparent PNG, shown at 40px).
- Below 1024px: nav links + Contact Sales collapse into a `Menu` button dropdown; language switch stays visible.

**Hero**
- Eyebrow: `<PRODUCT> BY HANDYMAN` (uppercase).
- H1, two lines: line 1 = product category in plain words (white), line 2 = benefit/use case (light blue `#c7ddea`). Max 12 words total.
- Two buttons: primary `FIND YOUR SIGN` → glides to configurator (§11.1); secondary `DOWNLOAD CATALOGUE` → product PDF. Rename "sign" to the product noun (e.g. `FIND YOUR TOOL`). Button text is always uppercase (§5.3).
- No paragraph text, no statistics, no product thumbnails in the hero.
- *Optional:* one **rotating product image** on the right half (desktop/tablet only; hidden below 768px). It shows 3–5 images from the product folder and follows §11.2.

**Product range strip** (*optional*)
- H2 `PRODUCT RANGE` / `DÒNG SẢN PHẨM` + one horizontal strip of product cards (image 1:1, name, one meta line). Cards link to the configurator with that product preselected.
- Motion rules: §11.2.

**Feature section**
- Image column: one product "hero visual" (cut-out or exploded view) — see §4.
- Text column: eyebrow → H2 (max 6 words) → intro (max 30 words) → **exactly 4** feature cards in a 2×2 grid (icon + title max 4 words + body max 14 words) → text link `View Catalogue →`.
- **Story variant** (replaces the whole section above — never both on one page): see §1.2.

**Shop section**
- Left column: Product search card, then configurator heading `FIND YOUR <PRODUCT> <NOUN>` + `Reset selection`, then numbered steps.
- Steps: `1 Choose a product category` → product-specific steps from `configurator.json` → `Contact & Shipping` → `Payment`. The last two are always the final two steps.
- Step 1 categories: 2 per row (1 on phones); only a lone last category spans the full row. Sign and design choices (steps 2–3) sit in a fixed-height scroll box — 420px (400px on phones) for signs, about 2½ rows so the cut-off row shows it scrolls — never "Show more" buttons that lengthen the page. A filter box appears above when there are more than 8 choices; the chosen card stays scrolled into view.
- **Payment step = payment method rows + one pay button.** Orders are always paid **in full**: there is no deposit and no "choose payment option" (Deposit / Pay in full) group. Each method is one row — radio · square app-style icon · name — with nothing on the right and no description (§12.3). Picking a row shows the single red button, labelled `PAY` for every method; it opens that method's pop-up, which shows "Amount due now" = the full order total. Decided 2026-10-01 (the former US$5 / 130.000 ₫ deposit is dropped for every product) — see §12.2.
- Right column (desktop/tablet): sticky Order Summary card. Mobile: bottom bar (hidden until the order has ≥1 item) that opens the summary as a sheet.

**Footer** — fixed copy, see §10.

### 1.2 Story section (Shopify-style "why" section) — Feature section variant

**Reference implementation:** HandyPad "Why HandyPad" section — `handypad-new/src/components/why-handypad.js`, `src/styles/feature-section.css` (approved by the business, 2026-09-29). Inspired by the phrase-and-gallery section of shopify.com.

**What it is:** one short paragraph of **3 sentences**, one per product strength, over a gallery strip. Each sentence owns **one set of 3 photos**. Only one set is visible at a time; the sentence of the visible set is lit. Hovering a photo reveals a slogan picture for it.

```
WHY <PRODUCT>                                                    ← eyebrow (H2, .section-eyebrow)
Sentence one. Sentence two.                                      ← line 1 (forced break after sentence 2)
Sentence three.                                                  ← line 2   · lit = navy · others grey · hover = gradient
[ photo 1 ][   photo 2   ][ photo 3 ]                            ← current set, exactly the page width, no crop
View specs →                                                     ← text link
```

#### A. Content (per-product input)

| Item | Rule |
|---|---|
| Sentences | **Exactly 3**, EN + VI, each a complete sentence ending with a full stop, **≤ 8 words** (VI ≤ 12). One strength per sentence (e.g. material · visibility · durability). |
| Line fit | Sentences 1 + 2 MUST fit on one line at 1200px width in **both languages** (measure at 32px / 700: ≤ 1200px). If the VI pair is too long, shorten the VI copy — never shrink the font. |
| Photos | **Exactly 3 per sentence → 9 tiles.** Real photos from `src/assets/products/<slug>/why/` (§4.1). The same photo may appear in two sets only if the brief lists it twice. |
| Slogan pictures | One per tile (9), in the order the brief gives. Lettering on white, 4:3 (1440 × 1080), WebP ≤ 300 KB. **Exception to §4.3:** these pictures carry baked-in English lettering and are shown unchanged on the EN and VI pages; the slogan text MUST be repeated in the image's `alt`. |
| Cut-out photo | A transparent-background product shot is allowed as a tile (flag `cutout: true`); it sits on the soft backdrop `radial-gradient(120% 70% at 50% 50%, #fff 0%, #e6edf3 100%)`. |
| Photo size | Long side ≥ 1000px, WebP/JPG ≤ 350 KB, `width`/`height` attributes = the file's real pixel size (the layout computes tile shapes from them). |
| Link | `View specs →` (or `View catalogue →`) under the strip, same style as the Feature section link. |

Data shape (in the component, not JSON):

```js
const STORY = [
  { sentence: 'Fireproof canvas for hot works.', tiles: [
    { photo: 'scaffold-pads.webp', width: 1254, height: 1254, alt: '…', slogan: 'slogan-protection.webp', sloganAlt: '…' },
    { photo: 'fire-grinding.webp', width: 1536, height: 1024, alt: '…', slogan: 'slogan-safer.webp', sloganAlt: '…' },
    { photo: 'worker-pad.jpg',     width: 403,  height: 403,  alt: '…', slogan: 'slogan-risks.webp', sloganAlt: '…' },
  ] },
  // …2 more sentences; a transparent product shot adds `cutout: true`
];
```

Sentences and photo `alt` texts go through `t()` (§8); `sloganAlt` stays English (it describes English lettering).

#### B. Layout (fixed values)

> **Gallery rule (hard — all three at the same time, for every set):**
> 1. **Same strip height.** All 3 sets use one tile height. A set MUST NOT get its own height, and the strip MUST NOT change height when sets change.
> 2. **Photos close together.** Gaps between tiles are always **16px** (12px on phones), in every set. Spare width MUST NOT go into the gaps or be left empty; every set runs from the container's left edge to its right edge.
> 3. **Cropped properly.** A set narrower than the strip fills it by growing each tile by the same amount, so photos trim top/bottom only (≤ 15%). Each trimmed or zoomed photo MUST still show its main subject whole (the pad, its logo, the person's head) — set `position` / `zoom` + `origin` per photo until it does. Transparent cut-outs are never trimmed.
>
> If one set would need more than a 15% trim to satisfy 1 + 2, don't break the rule — ask for a different photo for that set (closer to the shapes of the other sets) and list it in the hand-off note.

| Part | Desktop ≥ 1280 | Laptop 1024–1279 | Tablet 768–1023 | Mobile < 768 |
|---|---|---|---|---|
| Section padding | 96 / 96 | 96 / 96 | 64 / 64 | 48 / 48 |
| Background | misty-sea asset (as Feature section) | same | same | same, `background-size: auto 100%` |
| Paragraph size / line-height / weight | **32px** / 1.3 / 700, letter-spacing −0.02em | **28px** | 28px | **22px** |
| Paragraph width | full container width (no `max-width`) | same | same | same |
| Line break before sentence 3 | forced (`<br class="story-break">`) | forced | forced | **removed** (text wraps freely) |
| Paragraph → strip | 32px | 32px | 32px | 24px |
| Gap between tiles and between sets | 16px | 16px | 16px | 12px |
| Tile height | **one height for all sets**: `(container − 32px) ÷ max over sets of Σ(photo width ÷ height)` — the widest set fills the width exactly | same | **260px** fixed, strip scrolls | **240px** fixed, strip scrolls |
| Tile width | starts at tile height × its photo's own ratio (`aspect-ratio: width / height`); in a set narrower than the strip every tile grows by the **same amount** (`flex: 1 1 auto`) — photos trim a little top/bottom (≤ 15%), never the sides; a `cutout` tile is never trimmed (`object-fit: contain`) | same | same | same |
| Set width | `min-width: 100cqw` — the next set never peeks in; gaps stay **16px** in every set, so every set starts at the left edge and ends at the right edge | same | same (set may be wider → swipe inside it) | same |
| Strip → link | 24px | 24px | 24px | 24px |

- Container query: `#<section-id> .container { container-type: inline-size; }`; the strip, sets and tile heights use `cqw`, so everything lines up with the page's left **and right** edge (§6.3). The last tile of every set ends exactly at the container's right edge (check: `right` of last tile = header container `right`).
- All sets share one tile height, so nothing jumps when sets change. Framing per photo (data fields): `position` (object-position for the top/bottom trim, e.g. `50% 80%` to keep low subjects), `zoom` + `origin` (scale the photo toward its subject, e.g. `1.3` at `75% 50%` to show the right side more closely — HandyPad fire photo), `cutout: true`. Check every trimmed or zoomed photo still shows its main subject whole.
- Tile: radius 8px, card shadow (§3.4), white background, `overflow: hidden`, `object-fit: cover` (with the tile at the photo's own ratio this shows the whole photo).
- Slogan layer: absolutely placed over the photo, `object-fit: contain`, padding 6%, white background, opacity 0 → 1 in 300ms.
- Scrollbar hidden (`scrollbar-width: none` + `::-webkit-scrollbar { display: none }`); `scroll-snap-type: x proximity`, each set `scroll-snap-align: start`; snapping is switched off while dragging or gliding.

#### C. Sentence styling (Shopify look)

| State | Style |
|---|---|
| Default | grey `#9fb0bf` |
| Hover / keyboard focus | red → orange gradient `linear-gradient(90deg, #e63720, #f7931e)` shown through the text (`background-clip: text`; the grey fades to transparent in **300ms**); `box-decoration-break: clone` so a wrapped sentence gets the gradient on each line |
| Lit (active) | solid navy `#06263d` — stays navy on hover |
| Focus ring | `3px solid #2871b7`, offset 2px, radius 4px |

Sentences are inline `<span role="button" tabindex="0" aria-controls="<strip id>" aria-pressed>` (not `<button>`, which cannot wrap inside a paragraph); Enter and Space act as click.

#### D. Behaviour

| Trigger | Result |
|---|---|
| **Click** a sentence (or Enter / Space) | its sentence lights up at once; after a short pause its set slides in. **Hover never changes the set.** |
| Autoplay | the current set stays still for **5s**, then the next sentence lights up and its set slides in; after set 3 it slides back to set 1 — forever |
| Slide | **250ms** pause after the sentence lights up (the next set's images are decoded meanwhile, max 800ms, so the slide never stutters), then the strip scrolls over **1400ms** with ease-in-out sine (`(1 − cos(πp)) / 2`), driven by `requestAnimationFrame` (not the browser's `smooth`); the target sentence stays lit throughout |
| Mouse drag | click-and-drag scrolls the strip 1:1; the pointer is captured only after **6px**, so plain clicks/hovers are untouched; a drag cancels a running glide |
| Touch | native swipe |
| Manual scroll / swipe / drag | the sentence of the nearest set lights up; the 5s autoplay countdown restarts |
| Hover a photo (mouse, `@media (hover: hover)`) | its slogan picture fades in; leaving fades back. Not while dragging |
| Tap a photo (touch) | toggles its slogan (only one at a time); a tap outside the strip hides it |

**Autoplay pauses** while: the mouse is over the photos (so slogans can be read) · a drag is in progress · the section is less than 30% on screen (`IntersectionObserver`) · the tab is hidden (`visibilitychange`). It resumes with a fresh 5s when none applies.

**Reduced motion** (`prefers-reduced-motion: reduce`, e.g. Windows "Animation effects" off): **no change** — autoplay keeps running and sets still slide (business decision, 2026-09-29: an instant switch looked broken on PCs with animations off). This differs from §11.1 (320ms glide) and §11.2 A/B (freeze).

Only a click, the autoplay timer or the user's own scroll may move the strip. No other self-moving element may be added to this section.

#### E. Accessibility

- Heading: the eyebrow is the section's H2 (`aria-labelledby`); the strip is `role="group"`, focusable (`tabindex="0"`, arrow keys scroll it), labelled with the eyebrow text.
- Both images of a tile have `alt` text (photo in the page language, slogan in English), so screen readers get both without hovering.
- The autoplay pause on hover plus the click/keyboard controls satisfy WCAG 2.2.2 — do not remove them.

#### F. Tests (run in the preview before hand-off)

| # | Check | Expected |
|---|---|---|
| 1 | Every tile at 1440 / 1280 / 1100 / 1024 / 800 / 390px | tiles in the widest set match their photo ratio (±0.02); other tiles trim ≤ 15% top/bottom only; the main subject (pad, logo) is whole in every tile — check by screenshot |
| 2 | ≥ 1100px: every tile of every set | same height; 16px gaps; first tile at the container's left edge, last tile at its right edge (same as header) |
| 3 | Paragraph line count, EN and VI, at 1440 / 1280 / 1100 | 2 lines: sentences 1–2, then 3 |
| 4 | Click sentence 3 | sentence 3 navy at once; strip glides (intermediate `scrollLeft` values) to set 3 |
| 5 | Hover sentence 2 (no click) | set does not change; sentence shows the gradient |
| 6 | Wait 16s (section on screen, mouse elsewhere) | sets 1 → 2 → 3 → 1 at 5s intervals, sentence changes at each glide start |
| 7 | Mouse over the photos for 7s | no set change; leaving resumes |
| 8 | Drag the strip 650px with the mouse | strip moves, no slogan toggles, nearest sentence lights up |
| 9 | Touch tap a tile, tap again, tap outside | slogan on → off; outside tap hides |
| 10 | Emulate reduced motion | autoplay continues; sets still slide (sample `scrollLeft`: intermediate values over ~1.4s) |
| 11 | No horizontal page scroll at 360–1440px; no console errors; all 18 images load | — |

Note: a hidden preview window pauses `requestAnimationFrame`, reports `document.hidden`, never fires `IntersectionObserver` and may report reduced motion — test autoplay in a frame that stubs these, or in a visible browser.

---

## 2. Per-product input package (what the human provides)

An agent MUST refuse to start until items marked **Required** exist in the project folder. List anything missing in the hand-off note.

| Item | Location | Required | Spec |
|---|---|---|---|
| Product name (brand) | brief | Required | e.g. `HYPERION` — uppercase in the eyebrow |
| Product noun (EN/VI) | brief | Required | e.g. "sign / biển báo" — used in CTAs and headings |
| Hero headline (EN + VI, 2 lines) | brief | Required | ≤ 12 words |
| Feature section copy (EN + VI) | brief | Required | eyebrow, H2, intro, 4 × (title, body) |
| Hero photo | `src/assets/products/<slug>/hero.jpg` | Required | see §4.2 |
| Feature visual | `src/assets/products/<slug>/feature-visual.webp` | Required | see §4.2 |
| Product catalogue PDF | `assets/<slug>-catalogue-en.pdf` (+ `-vi.pdf` if available) | Required | ≤ 5 MB |
| Product data | `src/data/products.json`, `families.json`, `taxonomy.json`, `configurator.json` | Required | same schema as Hyperion (§12) |
| Product images | URLs inside `products.json` → `image_url`, or files in `src/assets/products/<slug>/items/` | Required | see §4.2 |
| Pricing | **list prices** in the product data (`products.json` / `src/data/products.js`) — the site shows them 10% off (§12.2); no deposit | Required | USD + VND |
| Page `<title>` + meta description (EN) | brief | Required | title ≤ 60 chars, description ≤ 155 chars |
| Favicon | `favicon.png` | Optional | defaults to Handyman favicon |

---

## 3. Marine theme

### 3.1 Shared theme assets (reuse unchanged for every marine product)

These live in `src/assets/theme/` (plus the three contact icons in `assets/icons/`). They are **brand backgrounds**, not content. They MUST NOT be replaced per product, cropped into content images, or used anywhere other than the slot below.

| File | Size | Slot | CSS (fixed) |
|---|---|---|---|
| `theme-header-sky.png` | 2048×682 | Header background | `background: #eef8ff url(sky) center / cover;` + overlay `linear-gradient(rgba(255,255,255,.12), rgba(255,255,255,.12))`; bottom border `2px solid #e63720` |
| `products/hyperion/hero.png` | 2017×780 | Hero background (Hyperion's own photo — each product supplies its own, §4) | see §3.3 |
| `theme-feature-sea.png` | 1672×941 | Light feature-section background | `background: #f8fbfe url(bg) center bottom / cover no-repeat;` |
| `theme-summary-ocean.png` | 1448×1086 | Order Summary card (desktop) | `center / cover`, overlay per §3.3 |
| `theme-summary-ocean-tall.png` | 1122×1402 | Order Summary sheet (mobile) | `center / cover` + `linear-gradient(rgba(4,37,60,.34), rgba(4,37,60,.25))` |
| `theme-footer-ocean.png` | 2048×682 | Footer background | see §3.3 |
| `assets/icons/phone.png`, `whatsapp.png`, `zalo.png` | 96×96 | CONTACT SALES options (§1.1) | `40 × 40px`, radius 10px; transparent background — never re-export with a checkerboard or solid backdrop |

> Shared theme files live in `src/assets/theme/` and are named `theme-*` — filenames must not carry a product name. Product-specific images live in `src/assets/products/<slug>/`.

**Asset delivery rules**
- Export every theme background as **WebP, quality 80, ≤ 350 KB** (current PNGs are 1.7–3.5 MB — must be converted). Keep the PNG only as source.
- Dark backgrounds MUST always have the navy overlay; text MUST NOT sit on the raw photo.
- The helm-wheel watermark in the summary/footer images sits on the right — never place text or buttons over the right 20% of the **Order Summary** image. The footer band is an exception: it shows a lower slice of its photo (the waves, §3.3), where only a faint arc of the wheel remains, and its links run to the right edge (§10).
- The oil-rig/sea band in the feature background occupies the bottom 25% — keep cards and text above it (section bottom padding handles this, §6.3).

### 3.2 Colour palette (the only colours allowed)

| Token | Hex | Use |
|---|---|---|
| `--navy-950` | `#06263d` | Dark surfaces, headings on light, primary text on light, dark buttons |
| `--navy-800` | `#0d3a5a` | Hover of dark buttons, secondary dark |
| `--text` | `#092c46` | Body text on light |
| `--muted` | `#60788b` | Secondary text, hints, locked steps |
| `--page` | `#f3f7f9` | Page background |
| `--surface` | `#ffffff` | Cards, inputs |
| `--border` | `#cbd9e3` | Input and option borders |
| `--border-soft` | `#dce6ed` | Card borders, dividers |
| `--red` | `#e63720` | Primary CTA, active step number, accent lines, header/footer border |
| `--red-hover` | `#c92e1b` | Hover of primary CTA |
| `--red-soft` | `#fff2ee` | Selected option background |
| `--coral` | `#ff8a73` | Accent text **on dark** (footer headings, icons) |
| `--sky-text` | `#c7ddea` | Second hero line on dark |
| `--on-dark` | `#ffffff` @ 92% | Body text on dark |
| `--on-dark-muted` | `#ffffff` @ 62% | Secondary text on dark |
| `--success` | `#008548` | "Added" feedback only |

Rules: red is for **one** primary action per view plus thin accent lines — never for body text or large fills. Text contrast MUST be ≥ 4.5:1 (body) and ≥ 3:1 (≥ 20px bold).

### 3.3 Dark-section overlays (fixed values)

| Section | ≥ 768px | < 768px |
|---|---|---|
| Hero | `linear-gradient(90deg, rgba(4,33,53,.86) 0%, rgba(4,33,53,.70) 38%, rgba(4,33,53,.30) 68%, rgba(4,33,53,.08) 100%)` | `linear-gradient(180deg, rgba(4,33,53,.84) 0%, rgba(4,33,53,.74) 100%)` |
| Footer band | `linear-gradient(180deg, rgba(3,35,56,.84) 0%, rgba(3,35,56,.78) 55%, rgba(3,35,56,.70) 100%)` over the photo at `background-size: cover; background-position: 30% 70%` — the band is a thin slice of a 3:1 photo whose middle is dark sky; 70% down puts the wave crests in view (30% across favours the bright crests when the photo is cropped sideways on phones). Do not lighten the wash below 70%: the coral "Contact:" label loses contrast over the brightest crests. | same |
| Order Summary | `linear-gradient(rgba(4,37,60,.34), rgba(4,37,60,.25))` | same |

### 3.4 Shape & depth

- Radius: **8px** cards/steps/modals · **6px** buttons and inputs · **999px** pills/chips · **16px** Order Summary card only.
- Shadow (one only): `0 8px 24px rgb(6 38 61 / 8%)` for cards; Order Summary `0 16px 36px rgb(8 34 56 / 18%)`.
- Borders: 1px. Accent borders (top of search card, top of summary, header bottom, footer top): 3px `--red` (header 2px).
- Icons: 24×24 viewBox, stroke 1.7, round caps/joins, `currentColor`. Displayed at **20px** inline, **24px** in feature cards, inside a 44px circle (`--red-soft` background) for feature cards.

---

## 4. Images

### 4.1 Source rule (hard)

- Images MUST come **only** from the product's own folder `src/assets/products/<slug>/` or the `image_url` values in that product's `products.json` / `families.json`.
- MUST NOT: stock photos, AI-generated images, images from another Handyman product, screenshots, hot-linked web images, placeholder services, emoji or clip-art substitutes.
- If a required image is missing, render the built-in fallback (`Image unavailable` box, same size as the image slot) and list it in the hand-off note. Never substitute.
- Theme backgrounds (§3.1) are the only shared images.

### 4.2 Required image specs

| Slot | Min size | Aspect | Format / weight | Composition rule |
|---|---|---|---|---|
| Hero photo | 2400×900 | 8:3 | WebP/JPG ≤ 400 KB | Subject in the **right 40%**; left 60% calm and darkish for text; horizon/lines not crossing the headline |
| Feature visual | 1400×1050 | 4:3 | WebP with transparency ≤ 300 KB | Product isolated, centred, ≥ 10% empty margin on all sides |
| Product / variant images | 800×800 | 1:1 | WebP/JPG ≤ 120 KB | Product on pure white `#fff`, centred, fills 80–90% |
| Catalogue cover (optional) | 600×850 | A-ratio | WebP ≤ 120 KB | — |
| Logo | 400px wide | — | PNG/SVG transparent | Supplied by Handyman only |

### 4.3 Display rules

- `object-fit: contain` for product images (never crop a product); `cover` only for backgrounds.
- Every `<img>` has `width`/`height` attributes, `loading="lazy"` (except hero/above-the-fold: `eager`), `decoding="async"`.
- `alt` text: product name + variant in the current language (e.g. "Lifebuoy sign, 150 × 150 mm"). Decorative images: `alt=""`.
- Never put text inside images (no baked-in headlines) — all text is HTML so it can be translated. *Only exception:* the slogan pictures of the Story section (§1.2 A), with the slogan repeated in `alt`.

---

## 5. Typography

### 5.1 Font family (max 2 — standard uses 1)

| Role | Family | Weights loaded |
|---|---|---|
| Everything (UI, headings, body) | **Be Vietnam Pro** | 400, 600, 700 |
| Optional second font | *none by default* — if a product brief requires one, it may only be used for H1/H2 and MUST fully support Vietnamese | 1 weight |

- Load: self-host WOFF2 in `assets/fonts/` with `latin` + `vietnamese` subsets, `font-display: swap`, preload the 400 and 700 files.
- Fallback stack: `'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif`.
- Why: Vietnamese diacritics stack above and below letters (Ể, Ặ, Ữ); the font must draw them without clipping at line-height 1.2. Be Vietnam Pro is designed for this and is free (OFL).
- **Hyperion deviation:** currently uses `'Segoe UI', Arial` (a Windows system font, so Mac/iPhone/Android visitors see Arial/Helvetica). Migrate when the template is extracted.

### 5.2 Font sizes — exactly 5 on the whole site

| Token | Size | Line height | Weight | Used for |
|---|---|---|---|---|
| `--fs-1` | **40px** | 1.2 | 700 | Hero H1 (desktop/tablet) |
| `--fs-2` | **28px** | 1.2 | 700 | Section H2, hero H1 on mobile, Order Summary total |
| `--fs-3` | **20px** | 1.2 | 700 | Card/step titles, prices, section H2 on mobile |
| `--fs-4` | **16px** | 1.5 | 400 / 600 | Body, intro, inputs, option titles, step titles on mobile |
| `--fs-5` | **14px** | 1.5 | 400 / 600 / 700 | Labels, hints, meta (IMPA/size), eyebrows, captions, errors, **all CTA button and chip text (uppercase, 700)** |

Rules:
- No other size may appear anywhere (including modals, toasts, badges). **Minimum size is 14px** — no 10/11/12/13px text. *Only exceptions:* the Story section paragraph (§1.2 B) — 32 / 28 / 22px, letter-spacing −0.02em — and the footer links (§10) — 18px / 600.
- Mobile (< 768px) changes only two things: H1 `40 → 28`, H2 `28 → 20`. Every other element keeps its size.
- Weights: 400 (body), 600 (labels, option titles), 700 (headings, prices, CTA buttons). No 300/500/800/900.
- Letter-spacing: `0` everywhere, except uppercase eyebrows/column headings `0.12em` and CTA buttons `0.04em`.
- Uppercase is allowed only for: **CTA buttons (§5.3)**, eyebrows, header nav links, configurator heading. Never uppercase a sentence, a paragraph or body text.
- Prices, quantities, codes: `font-variant-numeric: tabular-nums`.
- **Hyperion deviation:** the current code uses ~40 distinct font sizes (8px–80px plus many `clamp()` values). The template must be normalised to the 5 tokens above.

### 5.3 CTA buttons — always uppercase

Every call-to-action button shows its text **in capitals**, in both languages.

- **Counts as a CTA:** every element styled as a button that performs an action — primary (red) and secondary (outline/navy) buttons, header `CONTACT SALES`, hero buttons, `FIND PRODUCTS`, `ADD` / `ADD TO ORDER`, `SHOW MORE RESULTS`, Order Summary `ORDER` / `PAY NOW` / `VIEW ORDER`, payment buttons (`PAY` (the payment step's one button, §12.3), `OPEN SECURE CHECKOUT`, `CHECK PAYMENT STATUS`, `SUBMIT TRANSFER REFERENCE`), modal and sheet `CLOSE`, the mobile-menu `MENU` button, footer `WHATSAPP` / `ZALO` chips, `RESET SELECTION`.
- **Not a CTA** (keep normal case): selectable option cards (category, sign, size, edition, payment option/method), form labels, text links such as `View Catalogue →`, the `EN | VI` switch, step titles.
- **How:** store the label in normal sentence case in `locale.js` (e.g. `'Find your sign': 'Tìm biển báo'`) and render capitals with CSS `text-transform: uppercase` on the button class. Never type capitals into the translation file for a CTA — this keeps screen-reader output natural and lets one string serve other contexts.
- Style: `--fs-5` 14px, weight 700, letter-spacing `0.04em`, `white-space: nowrap`. Max 3 words (Vietnamese max 4 words). Vietnamese capitals keep all diacritics (`THANH TOÁN NGAY`, `TẢI CATALOGUE`) — check that the font draws stacked marks (Ể, Ặ) without clipping at the 48px button height.

### 5.4 Text display rules (line breaks & wrapping)

1. Headings (H1–H3): `text-wrap: balance`. Paragraphs: `text-wrap: pretty`. This prevents a single orphan word on the last line.
2. Never break inside these units — join them with a non-breaking space (` `) or wrap in `white-space: nowrap`:
   - number + unit: `150 × 150 mm`, `2 units`, `US$5`, `130.000 ₫`
   - phone numbers `(+84) 347 099 905`, emails, IMPA/ISSA codes, barcodes, tax code
   - brand + product: `HYPERION by DLV Corporation` may break only before `by`
3. **One item of information = one line.** A company name, address, phone number, email, price, code, label or button text MUST NOT be split across lines anywhere the screen could fit it. Never insert manual line breaks inside an item (no `<br>`, no forced two-line split). If a layout would make such an item wrap, change the layout instead (stack or widen columns) — e.g. the footer stacks below 1280px so the address stays on one line. Only where no layout can fit it (phones, < 768px) may a long item break, and then **only between its natural parts** (address: street / ward / city, country), each part kept whole with `white-space: nowrap`.
4. Hero H1: the break between line 1 and line 2 is a **forced** break (two elements). Each line MUST NOT itself wrap at ≥ 1024px — shorten the copy if it does.
5. Body line length: max **640px** (`max-width: 640px` on intro paragraphs).
6. No hyphenation (`hyphens: manual`). Vietnamese words break only at spaces. Use `overflow-wrap: anywhere` **only** for codes/URLs inside narrow cards.
7. Buttons and chips never wrap (`white-space: nowrap`); if a label doesn't fit, shorten the label.
8. Placeholder text must fit its input at 360px width without truncation — write a short mobile variant if needed (see Hyperion search box: `IMPA, ISSA, barcode or name`).
9. One H1 per page. Heading levels never skip (H2 → H3).

---

## 6. Layout & spacing (fixed values)

### 6.1 Spacing scale (the only spacing values allowed)

`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96` px

### 6.2 Breakpoints (exactly three)

| Name | Width range | Test widths |
|---|---|---|
| Mobile | 0 – 767px | 360, 375, 390, 430 |
| Tablet | 768 – 1023px | 768, 820 |
| Laptop | 1024 – 1279px | 1024, 1180 |
| Desktop | ≥ 1280px | 1280, 1440, 1920 |

Media queries use only these three boundaries, written either mobile-first (`min-width: 768px / 1024px / 1280px`) or desktop-first with the matching maximums (`max-width: 767px / 1023px / 1279px`). The same values apply to `matchMedia()` in JavaScript. `@container` queries (a component reacting to its own width) are allowed and do not count as breakpoints. **Every `max-width` value ends in `.98`** (`767.98px`, `1023.98px`, `1279.98px`), in CSS and in `matchMedia()`: on screens with display scaling (e.g. 150 %) the viewport can be a fraction like 1279.3px, which falls in the gap between `max-width: 1279px` and `min-width: 1280px` so neither layout applies.

### 6.3 Page grid

| Value | Mobile | Tablet | Laptop | Desktop |
|---|---|---|---|---|
| Content max width | 100% − gutters | 100% − gutters | 100% − gutters | **1200px**, centred |
| Side gutter | **16px** | **32px** | **32px** | **48px** (min) |
| Header height | **64px** | **72px** | **80px** | **80px** |
| Logo width | **120px** | **140px** | **160px** | **180px** |
| Section padding (top / bottom) | **48 / 48** | **64 / 64** | **96 / 96** | **96 / 96** |
| Hero padding (top / bottom) | **40 / 48** | **48 / 64** | **64 / 64** | **64 / 64** |
| Hero min-height | none | **360px** | **400px** | **400px** |
| Footer band padding (top / bottom) | **32 / 32** | **36 / 36** | **36 / 36** | **36 / 36** |

Every section uses the same `.container` so all content aligns to the same left/right edges as the header logo. Full-bleed backgrounds, contained content — always.

### 6.4 Component spacing

| Element | Value |
|---|---|
| Eyebrow → heading | 12px |
| H2 → intro | 16px |
| Intro → content (cards/grid) | 32px (mobile 24px) |
| Card padding | 24px (mobile 16px) |
| Card grid gap | 16px |
| Two-column section gap (image ↔ text) | 64px desktop · 48px laptop · 32px tablet |
| Configurator step padding | 20px (mobile 12px) |
| Gap between steps | 16px |
| Form field gap | 16px; label → input 8px |
| Button | height **48px**, padding 0 24px, gap icon↔text 8px; text 14px / 700 / uppercase / 0.04em (§5.3) |
| Secondary chip / pill | height **32px**, padding 0 12px; text 14px / 700 / uppercase |
| Input | height **48px**, padding 0 12px |
| Minimum touch target | **44 × 44px** |
| Hero H1 → buttons | 32px (mobile 24px) |
| Footer links | one row, **right-aligned** (`justify-content: flex-end`); 40px between links (20px on tablets); "Contact:" label 24px before the first link; icon ↔ text 8px; phones: centred wrapped rows, 16px between rows, 24px between links |

### 6.5 Shop section layout

| | Mobile | Tablet | Laptop | Desktop |
|---|---|---|---|---|
| Columns | 1 | main + **280px** summary | main + **320px** summary | main + **360px** summary |
| Column gap | — | 16px | 24px | 24px |
| Summary | bottom bar (76px) + sheet | sticky, top = header + 16px | sticky | sticky |
| Search card overlap onto previous section | −24px | −36px | −36px | −36px |

### 6.5.1 Order Summary — the product list keeps one height (hard rule, 2026-10-03)

The Order Summary card has three parts: header (title + counts) · product list (scrolls) · totals area. The totals area changes height: "Estimated total" alone → "Amount due now" + `Merchandise subtotal` + `Shipping fee` once Payment unlocks → plus the `ORDER` / `PAY NOW` button when its target is off screen. It also changes back, e.g. when the customer ticks "I need a VAT invoice" and Payment locks again.

> **Rule:** the product list MUST keep exactly the same height in every totals state. The card grows or shrinks at its **bottom edge** only. The list never gets taller or shorter because of what the totals area shows.

| Part | Value |
|---|---|
| Card (`.summary-shell`) | sticky, `top = header + 16px`, **no `max-height`** (desktop and tablet) |
| Product list (`.summary-content`) | `max-height: max(200px, calc(100dvh - var(--header-height) - 32px - var(--summary-chrome)))`, `overflow-y: auto` — the cap is on the list, not on the card |
| `--summary-chrome` | summary header + the **tallest** totals area (due amount + two rows + button, in the longer language). Hyperion: **320px**; **350px** below 1024px (narrower column, rows wrap). Re-measure when the totals area or its labels change. |
| Result | the tallest card still fits between the page header and the bottom of the screen; shorter totals states leave free space under the card |
| Phone sheet | unchanged: the sheet is capped as a whole (`max-height: calc(100dvh - 24px)`) and its list takes the remaining height |

Wrong: `max-height` on the card with a flexible list inside — the list then shrinks whenever the totals area grows.

Tests (order with ≥ 4 products, Contact & Shipping complete, EN and VI, at 768 / 1024 / 1280 / 1440px): tick and untick the VAT checkbox → list height identical in both states (measure `.summary-content`), card height differs only by the totals rows · with the `ORDER` / `PAY NOW` button shown, the card's bottom edge is still on screen · no page-level horizontal scroll.

### 6.6 Order steps — one style for every step

All numbered steps (1 → Payment) are the same component and MUST look identical. No step may carry its own font size, badge size, padding, radius or shadow.

| Part | Open step (current / complete) | Locked step |
|---|---|---|
| Container | white card, 1px `--border-soft`, radius 8px, padding 20px (mobile 12px), card shadow | next locked: `#edf3f7` card, padding 8px 20px 12px · later locked: no card, title row only (padding 2px 20px) |
| Step title (legend) | `--fs-3` 20px / 700 (mobile `--fs-4` 16px) | `--fs-4` 16px / 700, `--muted` |
| Number badge | 28 × 28px, radius 4px, `--fs-5` 14px / 700 white; `--red` when current, `--navy-950` when complete | 28 × 28px, `#728596` |
| Sub-heading inside a step (e.g. "Payment option") | `--fs-4` 16px / 700 | — |
| Option title (category, sign, payment choice, method) | `--fs-4` 16px / 600 | — |
| Option detail / hint | `--fs-5` 14px / 400, `--muted` | unlock hint `--fs-5` 14px |
| Price inside a step | `--fs-3` 20px / 700, tabular numbers | — |
| Field label / error | `--fs-5` 14px / 600 · `--fs-5` 14px / 400 red | — |

Rules:
- Step-specific selectors (`#order-payment legend`, `#contact-shipping .step-number`, …) MUST NOT set typography or spacing. They may only set layout of the step's *content* (e.g. grid columns).
- The payment pop-up window (card / bank transfer dialog) is a separate modal, not a step; it uses the modal styles but still only the 5 font-size tokens.
- A step unlocks automatically when the previous step is valid. There is never a "Continue" / "Next" button between steps (§9.3).

---

## 7. Alternating layouts (sections with images)

1. Count only **image + text** sections, top to bottom. Odd ones: **image left, text right**. Even ones: **text left, image right**. (Hyperion has one: image left.)
2. Column ratio is fixed: **image 5/12, text 7/12** (at 1200px: 468px image, 64px gap, 668px text). Vertical alignment: centre.
3. **Symmetrical 6/6** is allowed only when both columns carry equal-weight content (e.g. comparing two editions/materials). Never symmetrical for a single image + copy.
4. Two image sections MUST NOT sit next to each other with the image on the same side.
5. Hero and footer are excluded from the count (they're full-width backgrounds).
6. **Mobile never alternates:** order is always eyebrow → heading → intro → image → cards → link.
7. Image column never shrinks below 320px; below 1024px the section stacks (text first).

---

## 8. Language

- Default language **English**; Vietnamese via `?lang=vi` (EN | VI switch in header). `<html lang>` MUST match.
- Every visible string goes through `t()` in `src/lib/locale.js` and MUST have a Vietnamese entry. No hard-coded UI text in components.
- Product data uses paired fields (`display_name_en` / `display_name_vi`, `label_en` / `label_vi`). Both are required.
- Currency follows language: EN → **USD** (`US$`), VI → **VND** (`₫`, dot thousands separator).
- Do not mix languages in one view, except: product codes (IMPA, ISSA), brand names (HYPERION, WhatsApp, Zalo, Visa), and the company's legal name in the footer (`DLV CORPORATION`, same in both languages).
- Vietnamese copy is written, not machine-translated word-for-word; keep the same length ±20% so layouts hold.
- Catalogue link serves `-vi.pdf` when the language is VI and that file exists, otherwise the EN PDF.

### 8.1 EN → VI wording rules

Translate the **meaning in context**, not the words. Before writing a Vietnamese string, ask: *where does it appear, what does the customer do next?*

1. **One concept = one Vietnamese term, everywhere.** Use the glossary below; never alternate synonyms (e.g. do not mix "giỏ hàng" and "đơn hàng" for the same thing).
2. **No half-English phrases.** Wrong: `THÊM VÀO CART`. Right: `THÊM VÀO ĐƠN HÀNG`. Allowed English: brand names, product codes, approved glossary terms (e.g. `sales` in `LIÊN HỆ SALES`), and loanwords in the glossary (`catalogue`).
3. **Check that the word means the same thing here.** Wrong: `Menu` → `Danh mục` ("danh mục" = category, and it clashes with "Chọn danh mục sản phẩm"). Right: `Menu`.
4. **Address the customer as "bạn"**, friendly-professional. Requests start with `Vui lòng…`; never use imperative-only commands in error messages.
5. **Sentence case in Vietnamese** (only the first word and proper nouns capitalised). CTAs get capitals from CSS (§5.3), not from the string.
6. **Vietnamese formats:** `150 × 150 mm`, dates `dd/mm/yyyy`, thousands separator `.` (`130.000 ₫`), phone `(+84) 347 099 905`.
7. **Keep it short.** Vietnamese is usually 10–30% longer than English. If a VI label wraps or overflows where EN doesn't, rewrite it shorter — never shrink the font.
8. **Official names are copied, not translated:** province names (§12.1), company legal names (§10), IMO/IMPA/ISSA terms.
9. Every translation is reviewed by a Vietnamese-speaking person before launch; the agent's hand-off lists every string it created or changed.

**Glossary (use exactly these)**

| EN | VI | Note |
|---|---|---|
| Order (noun) | đơn hàng | the customer's list of items — never "giỏ hàng" |
| Order (nav / CTA) | ĐẶT HÀNG | |
| Add (to order) | THÊM / THÊM VÀO ĐƠN HÀNG | toast: "Đã thêm vào đơn hàng" |
| Product lookup | Tra cứu sản phẩm | |
| Product range | Dòng sản phẩm | |
| Catalogue | catalogue | loanword, lowercase in sentences |
| Contact sales | Liên hệ sales | approved by the business; "sales" stays in English |
| Contact & Shipping | Thông tin liên hệ & giao hàng | |
| City / Province | Tỉnh / Thành phố | |
| Country | Quốc gia | |
| Payment | Thanh toán | |
| Pay now | THANH TOÁN NGAY | |
| Shipping fee | Phí vận chuyển | |
| Edition | Phiên bản | |
| SKU | mã sản phẩm | |
| Reset selection | Đặt lại lựa chọn | |
| Menu | Menu | not "Danh mục" |

### 8.2 Bilingual side-by-side review (required before hand-off)

Every visible string MUST be pulled in **both languages** and reviewed side by side — not only the landing sections, but also the order steps, the Order Summary, toasts, error messages and every pop-up.

**Where strings come from (collect all three):**
1. The `vi` dictionary in `src/lib/locale.js` (every key = EN, value = VI).
2. Text built inline in components with `language === 'vi' ? … : …` (counts, statuses, currency lines). These MUST be moved into `locale.js`; list any that remain.
3. Data fields: `*_en` / `*_vi` in the JSON files, `corporate.js`.

**States to render in both `?lang=en` and `?lang=vi`** (capture `innerText` of each):
- Page on load · search with results · search with no results
- Each configurator step open, complete and locked (incl. unlock hints)
- Order Summary empty → 1 item → payment option chosen; mobile bottom bar and sheet
- Contact & Shipping with every validation error shown
- Payment step · card pop-up · bank transfer/VietQR pop-up · PayPal pop-up (EN only) · ZaloPay pop-up · pending / confirmed / failed states
- Contact Sales pop-up (empty, errors, sent) · header mobile menu · footer

**Output:** a table `Area | Key | EN | VI | Issue` saved as `docs/translation-review-<slug>.md`. Flag: missing VI, EN left in VI view, inconsistent term (vs. glossary), wrong meaning, VI longer than the space, wrong number/currency format.

---

## 9. Interface clarity rules

The goal of every area: the user sees **only what they need to make the next decision**.

1. **No self-explaining UI text.** Don't write "Click a category below to begin", "Use this box to search", "This section shows…". Labels and headings are enough.
2. **One primary action per view.** Only one red button visible in a card/section at a time.
3. **No redundant controls.** If the system advances automatically (e.g. Payment unlocks when Contact & Shipping is valid), there is no "Continue" button.
4. **Hide empty states that carry no information.** No "$0.00 / 0 products" bars; the mobile order bar appears only after the first item.
5. **Locked steps:** show the step title only; the *next* locked step shows one short unlock hint (≤ 6 words, e.g. "Select a sign first"). Later locked steps collapse to a title row.
   - **Exactly one** locked step in the whole flow (configurator steps _and_ Contact & Shipping / Payment) is the "next" one: the first locked step in DOM order that is not hidden.
   - It MUST be set in JavaScript, not guessed with CSS sibling selectors. Call `markNextLockedStep()` (`src/lib/locked-steps.js`) after every state change; it sets `data-next-locked` on that one step. The card and hint styles key off that attribute.
   - The hint names what is missing ("Select a mixture first"), not "Complete the previous step".
   - ⚠️ **Known defect — do not copy (found 2026-09-25, Calibration Gas):** Hyperion's `marine-theme.css` chooses the "next" step with `.configuration-step[data-state='locked']:first-child` and `:not([data-state='locked']) + [data-state='locked']`. Two things break it:
     - A **hidden** step (e.g. the skipped "Choose a design" step) counts as "not locked", so the step after it also becomes a card.
     - Contact & Shipping is the `:first-child` of its own `.order-completion` block, so it always becomes a card too.

     The result is 2–3 grey hint cards stacked at once (e.g. "Choose a mixture", "Choose cylinder size" and "Contact & Shipping" all showing hints). Fixed in the Calibration Gas site; still open in Hyperion (Appendix A).
6. **Disabled, not hidden, for global actions** whose meaning is clear (e.g. `Reset selection` is disabled until something is selected).
7. **Placeholders are examples, not instructions** ("IMPA, ISSA, barcode or name").
8. **Errors appear on blur**, under the field, in 14px red, ≤ 8 words, saying what to fix ("Enter a valid email address").
9. **Copy limits:** hero H1 ≤ 12 words; H2 ≤ 6 words; intro ≤ 30 words; feature card body ≤ 14 words; button label ≤ 3 words.
10. **No decorative text** that can't be read (faint watermarks, tiny uppercase slogans). If it's on the page, it must pass contrast.
11. Numbers users compare (price, size, quantity) are always visible without hovering or expanding.
12. **A change in one area MUST NOT resize another area.** When a part of a card shows, hides or changes its text (totals rows, a button, an error, an extra field), only that part and the card's outer edge may move. Lists, images and controls the user is looking at or scrolling keep their size and position. Reference case: the Order Summary product list (§6.5.1).

---

## 10. Footer (fixed — the same on every product site and on the specs catalogue)

One navy ocean band with **one row of five contact links**, grouped at the right edge behind a "Contact:" label. The same five contacts as the specs catalogue (§12.4). No tagline, no brand line, no tax code, no address, no phone number as text, no copyright line. Decided 2026-10-03 on HandyPad (replaces the earlier two-column brand + Contact footer).

```
───────────────────────────────── 3px red line ─────────────────────────────────
                         Contact:  [mail] info@dlvcorp.com    [globe] Handyman.vn    [f] Facebook    [wa] WhatsApp    [zalo] Zalo
```

| Link | Label | Target |
|---|---|---|
| Email | `info@dlvcorp.com` | `mailto:info@dlvcorp.com` |
| Website | `Handyman.vn` | `https://handyman.vn` (new tab) |
| Facebook | `Facebook` | `https://www.facebook.com/handymanbydlvcorp` (new tab) |
| WhatsApp | `WhatsApp` | `https://wa.me/84347099905` (new tab) |
| Zalo | `Zalo` — icon + the word only, never the phone number | `https://zalo.me/84347099905` (Zalo on the sales phone number, new tab) |

| Part | Value |
|---|---|
| Band | ocean asset positioned on the waves, under the navy wash (§3.3 Footer band), `border-top: 3px solid --red`; the band is the whole footer |
| Row | inside the page `.container`, `justify-content: flex-end`: the group ends at the content's right edge (same edge as the header's CONTACT SALES), 40px between links, padding 36px top and bottom |
| Label | `Contact:` / `Liên hệ:` — sentence case with the colon, **18px / 700**, `--coral`, `white-space: nowrap`, directly before the first link (24px gap). Shown from **1024px** up only; hidden below (the links fill the row). `aria-hidden` — the `<nav>` already carries the label. |
| Link text | **18px / 600**, white, `white-space: nowrap`; underline on hover; focus ring 2px white, offset 4px |
| Icons | **24px**, `--coral` (`#ff8a73`); mail / globe / Facebook / WhatsApp are the catalogue's filled SVG icons, Zalo is its app icon (`assets/contact/zalo.png`, radius 5px) |
| Height | ≈ 100px on one row |
| Tablet (768–1023) | still one row, right-aligned (gap 20px); no "Contact:" label |
| Phone (< 768) | links wrap onto 2–3 **centred** rows (a right-aligned wrap looks ragged), 32px padding, each link ≥ 32px tall; no label |

- Source of truth: `src/data/corporate.js` — `email`, `website` / `website_href`, `facebook_href`, `phone_href` (WhatsApp number), `zalo_href` / `zalo_label`. Agents MUST NOT retype these values elsewhere; the header's CONTACT SALES menu reads the same `zalo_href`.
- The footer `<nav>` carries `id="contact"` and `aria-label` = "Contact" / "Liên hệ".
- The labels are the same in EN and VI (brand names and an email address); nothing in the footer needs translating.
- Changing a contact (email, Zalo, …) = change `corporate.js` **and** the catalogue footer, then rebuild both catalogue PDFs (§12.4).

---

## 11. Responsive behaviour summary

| Component | Mobile (< 768) | Tablet (768–1023) | Laptop / Desktop (≥ 1024) |
|---|---|---|---|
| Header | Logo · EN/VI · Menu | Logo · EN/VI · Menu | Logo · nav · EN/VI · Contact Sales |
| Hero | Uniform dark overlay; buttons full-width, stacked | Left text, buttons inline | Left text, buttons inline |
| Feature section | Stacked; cards 1 column | Stacked; cards 2×2 | Image 5/12 + text 7/12; cards 2×2 |
| Category options | 1 column | 2 columns | 2 columns |
| Sign/design grid | 2 columns | 3 columns | 4 columns |
| Shipping form | 1 column | 2 columns | 2 columns |
| Payment methods | one row per method (62px; icon 44px) | one row per method (66px; icon 48px) | one row per method (66px; icon 48px) |
| Order summary | Bottom bar → sheet | Sticky 280px | Sticky 320 / 360px |
| Footer | links wrap to 2–3 centred rows | one row, right-aligned | "Contact:" + one row of links, right-aligned |

- No horizontal scrolling at any width ≥ 360px (`document.documentElement.scrollWidth === innerWidth`).
- Sticky elements must never cover a focused input (`scroll-padding-top: header + 20px`, `scroll-padding-bottom: 100px` on mobile).
- Section navigation always glides — see §11.1.

### 11.1 Navigation & scroll motion (fixed behaviour)

When a click moves the customer to another part of the page, the page MUST glide there — never jump. Reason: an instant jump makes the customer lose their place and feel the page "switched".

**One helper only.** Every section move goes through `scrollToElement(target, { onDone })` in `src/lib/scroll.js`. Agents MUST NOT use `scrollIntoView()`, `location.hash`, `scrollTo()` or CSS `scroll-behavior` for section navigation.

**Actions that MUST use it**

| Trigger | Destination |
|---|---|
| Header `PRODUCT LOOKUP` / `ORDER` (desktop links and mobile menu) | Search card / configurator |
| Hero primary button (`Find your <noun>`) | Configurator |
| Order Summary `ORDER` / `PAY NOW` button | Contact & Shipping / Payment step |
| Order Summary "View order" (desktop/tablet) | Order Summary card |
| Selecting an option when the next step is off-screen (top < 110px or bottom > viewport − 100px) | Next step |
| Programmatic jumps (`hyperion:lookup`, `hyperion:configure` events) | Search card / configurator |

In-list moves (e.g. "Show more results" revealing the next card inside a scroll box) are exempt — they use `block: 'nearest'` without animation.

**Motion values (exact)**

| Setting | Value |
|---|---|
| Landing position | target top = sticky header bottom **+ 16px** (never under the header) |
| Duration (normal) | `distance(px) × 0.35` ms, floored at **480ms**, capped at **800ms** |
| Duration (`prefers-reduced-motion: reduce`, e.g. Windows "Animation effects" off) | **320ms** — still a glide, never an instant jump |
| Easing | ease-in-out cubic: `p < .5 ? 4p³ : 1 − (−2p + 2)³ / 2` |
| Cancel | stops immediately on the user's `wheel`, `touchstart` or `keydown` |
| New click during a glide | cancels the running glide and starts from the current position |
| Hidden/background tab | goes straight to the target (animation frames are paused there) |
| Distance < 2px | no movement |

**Other motion**
- After arriving, move keyboard focus to the destination heading with `focus({ preventScroll: true })` so screen readers follow without a second jump.
- Update the URL hash with `history.replaceState` (no extra history entries).
- Hover/state transitions: `150ms ease` on background and border colour only. No parallax, no scroll-triggered animations. The only self-moving elements allowed are the two in §11.2 and the Story section autoplay (§1.2 D, which also sets its own 300ms colour/opacity fades).
- With `prefers-reduced-motion: reduce`, remove all transitions except the shortened section glide.

### 11.2 Self-moving elements (auto-slide & rotating image)

Only two elements may move on their own, and only if the product brief includes them. Both use the **same reduced-motion check**: `matchMedia('(prefers-reduced-motion: reduce)')`, listened to live (`change` event), so turning Windows "Animation effects" off freezes them immediately without a reload. *Verify on a Windows machine with Animation effects off — that is how many customers' PCs are set.*

**A. Product range strip (auto-slide)**

| Behaviour | Value |
|---|---|
| Default | Slides continuously and slowly, right → left, **24px per second**, seamless loop (card list rendered twice; the copy is `aria-hidden="true"` and `inert`) |
| Stops **only** while | the mouse is over the strip · the strip is being dragged (mouse or touch) · keyboard focus is on a card inside the strip (`focusin` → stop, `focusout` leaving the strip → resume) |
| Resumes | immediately when none of the three conditions is true, from the current position (no jump back) |
| Drag | pointer drag moves the strip 1:1; release continues auto-slide from there; a drag > 6px cancels the card click |
| Keyboard | cards are focusable links in DOM order; `Tab` moves card to card and the strip scrolls so the focused card is fully visible |
| Also pauses | when the tab is hidden (`visibilitychange`) — resume on return |
| Reduced motion | **frozen** — no auto-slide at all; the strip is a normal horizontal scroll area (drag, trackpad, keyboard, and ‹ › buttons 44×44px appear) |
| Card size | 240px wide desktop / 200px mobile, gap 16px, image 1:1 on white |

**B. Hero rotating product image**

| Behaviour | Value |
|---|---|
| Default | Rotates through 3–5 product images, **5 seconds** per image, **600ms** cross-fade (opacity only) |
| Pauses | while the mouse is over the image, while any element inside the hero has keyboard focus, and when the tab is hidden |
| Reduced motion | **frozen on the first image** — no automatic rotation. If dot controls are shown and the user picks another image, it **switches instantly** (no fade) |
| Controls | optional dots (8px, 44×44px touch target) with `aria-label="Image 2 of 4"`; `aria-live` is **off** (don't announce each rotation) |
| Mobile (< 768px) | not shown |
| Images | only from the product folder (§4), same size/aspect, `object-fit: contain` |

Both elements must also meet WCAG 2.2.2 (pause/stop/hide for moving content): the hover/focus/drag pause and the reduced-motion freeze satisfy it — do not remove them.

---

## 12. Data contract (functionality reuse)

The shopping flow is data-driven. A new product changes data, not code.

| File | Role | Key fields |
|---|---|---|
| `products.json` | One row per SKU | `id`, `barcode`, `internal_reference`, `product_family_id`, `display_name_en/vi`, `customer_category_en/vi`, `impa_code`, `issa_code`, `dimensions_display`, `edition`, prices, `image_url` |
| `families.json` | One row per design (groups SKUs) | `id`, `display_name_en/vi`, `sku_ids[]`, `image_url`, `direction` |
| `taxonomy.json` | Step 1 categories | `groups[]`: `id`, `label_en/vi`, `order` |
| `configurator.json` | Which steps each category uses, in order | `branches.<category-id>`: ordered list of fields (e.g. `config_concept`, `config_direction`, `dimensions_display`, `product_family_id`, `edition`) + `concepts`, `directions`, `families` mappings |
| `corporate.js` | Footer/company facts | fixed (§10) |
| `checkout/config.js` | Payment mode and enabled payment methods | `paymentMode`, `apiBase`, `methods` (`card`, `paypal`, `zalopay`, `bank_transfer`) — no deposit settings; never put secrets here |

Rules: IDs are stable strings; every `_en` field has a `_vi` twin; images follow §4; a step whose field has only one possible value for the current selection is auto-selected and shown as complete.

**Loading product data (standard process).** Product data is generated, never hand-edited:

1. `node scripts/make-price-template.mjs <catalogue build folder>` → `docs/price-template-new-skus.csv` (one row per size × edition; sizes already sold are pre-filled from current site prices).
2. The business fills in `price_vnd` / `price_usd` for every row. If official prices are not ready, `node scripts/estimate-prices.mjs` fills the gaps from current site prices (Standard: never-decreasing curve by sign area; Outdoor: Standard × the 150×150 mm Outdoor/Standard ratio) into `docs/price-list-new-skus.csv`, every estimate marked `ESTIMATE` — replace them before relying on them. When the official Odoo product export (with `Sales Price`) arrives, `node scripts/import-odoo-prices.mjs --xlsx <export.xlsx>` writes its prices into that CSV (matched by barcode; it stops if one size × edition has two prices), then re-run the build.
3. `node scripts/build-catalogue-data.mjs --catalogue <folder> --prices <filled CSV> [--images <base URL or ./path>] [--odoo <Odoo import folder>]` regenerates `products.json`, `families.json`, `taxonomy.json`, `configurator.json`. It keeps existing SKUs unchanged, adds new ones, and **stops without writing** if any SKU lacks a price or Vietnamese name, or a new barcode/reference is duplicated. Use `--dry-run --out <temp folder>` to preview. With `--odoo`, sizes follow Odoo's orientation (as on existing products — never show one size in both orientations), "(Type B)" design names follow Odoo, and the report lists SKUs on only one side. Re-running is safe: previously generated SKUs are rebuilt, hand-maintained ones kept.
4. Missing Vietnamese design names go in `scripts/catalogue-names-vi-extra.tsv` (reviewed by a Vietnamese speaker).
5. Images: `<base URL>/<Standard internal reference>.jpg` for both editions — either a web address or a folder in the repo, e.g. `--images ./product-images` (Hyperion: 1,108 JPGs, 17 MB, lazy-loaded — the same folder the Odoo image URLs point to on GitHub, so each picture exists once). Without `--images`, new SKUs show "Image unavailable".
6. Never publish `cost` or other internal fields — the build drops every field the site doesn't read.

Page budget for product data is measured **compressed (gzip)**: ≤ 400 KB. (Hyperion with 2,524 SKUs: 3.4 MB raw, 240 KB gzip.)

### 12.1 Checkout — Contact & Shipping form

**Field order (fixed):**

| # | Field | Type | Required |
|---|---|---|---|
| 1 | Full name | text | yes |
| 2 | Company | text | no |
| 3 | Email | email | yes |
| 4 | Phone / WhatsApp | tel (international format) | yes |
| 5 | **Country** | searchable dropdown (existing `country-select`) | yes |
| 6 | **City / Province** | dropdown **that follows the selected country** — or free text (see below) | yes |
| 7 | Shipping address | text, full width | yes |

Country MUST sit directly before City / Province (same row on desktop/tablet: Country left, City / Province right).

**City / Province behaviour**

| Situation | Behaviour |
|---|---|
| No country chosen yet | City / Province disabled; placeholder `Select a country first` / `Chọn quốc gia trước` |
| Country **has a list** (VN, US, CA, AU, MY) | Searchable dropdown of that country's units, same component and keyboard model as Country (type to filter, ↑/↓, Enter, Esc). The value MUST be picked from the list; typed text that matches no option is invalid → error `Select a province from the list` / `Chọn tỉnh / thành phố trong danh sách` |
| Country **has no list** (e.g. Japan) | Plain text input, as before; any non-empty text is valid |
| Country changed to a different country | The City / Province chosen for the old country is **cleared** and the field shows empty; Payment re-locks until it is filled again |
| Same country re-selected | City / Province is **kept** |
| Listed → unlisted country (e.g. Vietnam → Japan) | cleared; field becomes free text |
| Unlisted → unlisted (e.g. Japan → Korea) | cleared (the text belonged to the old country) |
| Language switch | stored value is a code; label re-renders in the new language |

**Stored value:** `{ countryCode: 'VN', regionCode: 'ho-chi-minh', regionName: 'Thành phố Hồ Chí Minh' }` for listed countries; `{ countryCode: 'JP', regionCode: null, regionName: '<free text>' }` otherwise. `regionCode` is a stable ID: the ISO 3166-2 subdivision code where one exists (US, CA, AU, MY — e.g. `US-CA`, `CA-ON`), and a lowercase slug for Vietnam's 2025 units. Region lists live in `src/data/regions.json`: `{ "VN": [{ "code", "name_en", "name_vi" }], "US": [...], ... }`.

**Lists (exact counts)**

- **Vietnam — 34 provincial-level units** (structure in force since 1 July 2025; the company address "Tan Thuan Ward, Ho Chi Minh City" already uses it). Do not use the old 63-province list.
  - 6 centrally-run cities: Hà Nội · Huế · Hải Phòng · Đà Nẵng · Thành phố Hồ Chí Minh · Cần Thơ
  - 28 provinces: Tuyên Quang · Cao Bằng · Lai Châu · Lào Cai · Thái Nguyên · Điện Biên · Lạng Sơn · Sơn La · Phú Thọ · Bắc Ninh · Quảng Ninh · Hưng Yên · Ninh Bình · Thanh Hóa · Nghệ An · Hà Tĩnh · Quảng Trị · Quảng Ngãi · Gia Lai · Khánh Hòa · Lâm Đồng · Đắk Lắk · Đồng Nai · Tây Ninh · Vĩnh Long · Đồng Tháp · Cà Mau · An Giang
  - VI labels keep diacritics; EN labels use the common English form without diacritics (Hanoi, Hue, Hai Phong, Da Nang, Ho Chi Minh City, Can Tho, Dak Lak…). Sort alphabetically in the current language, cities first.
- **United States — 51**: 50 states + District of Columbia.
- **Canada — 13**: 10 provinces + 3 territories (Northwest Territories, Nunavut, Yukon).
- **Australia — 8**: 6 states (NSW, Victoria, Queensland, South Australia, Western Australia, Tasmania) + Australian Capital Territory + Northern Territory.
- **Malaysia — 16**: 13 states + 3 federal territories (Kuala Lumpur, Labuan, Putrajaya).
- Any other country: no list → free text.

**Required tests (run in the preview)** — each case scripted *and* repeated with real mouse clicks and keyboard-only use:

| # | Steps | Expected |
|---|---|---|
| 1 | Country = Vietnam | dropdown shows exactly 34 units; "Thành phố Hồ Chí Minh" / "Ho Chi Minh City" present; no pre-2025 names (e.g. "Bình Dương", "Bà Rịa – Vũng Tàu") |
| 2 | Country = United States / Canada / Australia / Malaysia | 51 / 13 / 8 / 16 options |
| 3 | Vietnam → pick Đà Nẵng → change to United States | City / Province cleared; Payment locked |
| 4 | Vietnam → pick Đà Nẵng → re-select Vietnam | Đà Nẵng kept |
| 5 | Vietnam → type "Tokyo" (no option picked) → blur | error shown; Payment stays locked |
| 6 | Country = Japan → type "Tokyo" | accepted as free text; Payment unlocks when other fields valid |
| 7 | Japan + "Tokyo" → change to Canada | cleared; now a dropdown |
| 8 | Keyboard only: Tab to Country, type "viet", Enter, Tab to City / Province, type "hue", ↓, Enter | Huế selected, focus order Country → City / Province → Shipping address |
| 9 | Switch EN ↔ VI with a province selected | same province, label in the new language |
| 10 | Mobile 390px | both dropdowns open fully on screen, options ≥ 44px tall |

**Optional VAT invoice (checkbox under Shipping address)** — added 2026-10-03.

| Part | Rule |
|---|---|
| Control | One checkbox row, full width, directly under Shipping address: `I need a VAT invoice` / `Tôi cần xuất hóa đơn VAT`, with the hint `Uses the details above. Company and tax code are required.` (always visible). Unticked by default. |
| Unticked | Company stays optional; no Tax code field. |
| Ticked | **Company becomes required** (label gains ` *`; if it is empty, its "Required field" error shows at once) and a required **Tax code** / `Mã số thuế` field appears under the checkbox. Payment stays locked until both are valid. |
| Tax code check | Vietnam (`countryCode === 'VN'`): 10 digits, or 13 for a branch (`0307940363`, `0307940363-001`) → otherwise `Enter a valid tax code (10 or 13 digits)`. Other countries: 4–20 letters / digits (formats vary). |
| Invoice details | The invoice uses the contact and address fields already entered — there is no separate invoice address. |
| Unticking | Removes both requirements and hides the field; the typed tax code is kept in the form (not sent) in case the box is ticked again. |
| Stored / sent | The draft saves `wantsInvoice` and `customer.taxCode` (survives reload). The order payload carries `vatInvoice: true/false`; `customer.taxCode` is sent only when `vatInvoice` is true. |

Tests: tick with empty Company → Payment locks, Company flagged · fill Company only → still locked · tax code `12345` (VN) → error · `0307940363` → Payment unlocks · reload → tick and code kept · untick with empty Company → Payment unlocked.

### 12.2 Pricing — 10% off every product, paid in full (business decision 2026-10-01)

**Rule:** every price a customer sees is the **list price − 10%**, for every product and SKU. Orders are paid **in full**; there is no deposit.

| Part | Rule |
|---|---|
| Where list prices live | The product data keeps the **original list prices** (V70 / Odoo list) unchanged — never overwrite them with discounted numbers. |
| One factor, one place | A single constant `PRICE_FACTOR = 0.9` is applied where the price data is loaded (HandyPad: `src/data/products.js`; JSON-driven sites: the catalogue loader before anything reads prices). Ending or changing the discount = changing that one number. |
| Apply per price part | Products built from parts (base + add-ons, e.g. HandyPad reflective / fireproof) discount **each part**, so the "+add-on" amounts shown in the order steps add up exactly to the SKU price. |
| Rounding | VND to the whole đồng; USD to the cent, in **integer cents** with half rounding up (`Math.round(cents × 90 / 100) / 100`, e.g. US$3.85 → US$3.47). A USD SKU may therefore end 1–2¢ above an exact 10% — accepted. |
| Display | Show the discounted price **directly**, as the only price: no struck-through list price, no "−10%" badge (unless a brief asks for a sale look). Same price on Product Range cards, "from" prices, option cards, add-on prices, unit price, order rows, Order Summary, pay pop-up and confirmation. |
| Same price everywhere | The specs catalogue PDF (EN + VI) and the Odoo product export MUST read the same price data as the site (HandyPad: `handypad-catalogue/render.mjs` and `odoo-export.mjs` import `src/data/products.js`). After any price change, rebuild both PDFs and the Odoo export. |
| Payment amount | Always the full order total: `payment.amountOption = 'full'` (kept in the order payload so payment backends get the same shape), `amountDueNow = merchandiseSubtotal`. No `depositUSD` / `depositVND`, no "Remaining balance" row, no deposit wording in any language. |
| Order Summary | Shows "Estimated total" until Payment unlocks, then "Amount due now" (= full total) + Merchandise subtotal + "Shipping fee: To be confirmed". |
| Order Summary — stable product list | The product list keeps one height while the totals area changes; the card grows at its bottom edge only. Full rule, values and tests: §6.5.1. |

**Tests (before hand-off)**

| # | Check | Expected |
|---|---|---|
| 1 | Every SKU, EN and VI | shown price = parts × 0.9 rounded as above (VND exactly −10%) |
| 2 | Add-on prices in the order steps | each = add-on list price × 0.9; base + add-ons = SKU price shown |
| 3 | Catalogue PDFs + Odoo export | same prices as the site, SKU by SKU |
| 4 | Full checkout (item → Contact & Shipping → method) | no amount/deposit choice; pay button enabled after picking a method; pop-up "Amount due now" = order total |
| 5 | `grep -i deposit` / "đặt cọc" in `src/` | no visible deposit text, no deposit config |

### 12.3 Payment methods (rows, PayPal, pop-ups) — updated 2026-10-03

**Methods, in this order:**

| # | Value | Row name (EN / VI) | Icon (`assets/pay/`) | Offered when |
|---|---|---|---|---|
| 1 | `card` | Card (Visa, Mastercard) / Thẻ quốc tế (Visa, Mastercard) | `card.png` (Visa) | always |
| 2 | `paypal` | PayPal | `paypal.png` | **USD (English) page only** — PayPal cannot charge VND, so the row is left out on the VND page |
| 3 | `zalopay` | ZaloPay | `zalopay.png` | always |
| 4 | `bank_transfer` | Bank Transfer / Chuyển khoản (the row name has no "/ VietQR"; the VietQR icon and the pop-up title "Bank transfer (VietQR)" carry it) | `vietqr.png` | always |

**Row layout (fixed):** radio circle (20px) · square app-style icon · method name (16px / 700). Nothing on the right, no description line, no generic card / wallet / bank icons.

| Part | Desktop / tablet | Phone |
|---|---|---|
| Row height | 66px (`min-height: 64px`, padding 8px 16px) | 62px (padding 8px 12px) |
| Icon | 48 × 48px, radius 11px | 44 × 44px, radius 10px |
| Icon files | 144 × 144 PNG, ≤ 15 KB each; a wordmark on a transparent square (VietQR) gets a white tile with a 1px `#d8e1e7` hairline |
| Gap between rows | 10px |
| Selected row | red border + `--red-soft` background, radio filled red |

**Pay button:** one red full-width button under the rows, hidden until a method is chosen. Label **`PAY` / `THANH TOÁN`** for every method (never "Pay by card", never the amount). It opens the method's pop-up:

| Method | Pop-up |
|---|---|
| Card | card form (number, expiry, CVC) with the wide Visa + Mastercard logos; button `PAY` |
| PayPal | PayPal wordmark on a **white plate** (the pop-up is dark navy and the logo's dark-blue lettering is unreadable on it), the line `You will finish the payment securely on PayPal.`, button `CONTINUE TO PAYPAL`; live mode opens the PayPal approval link in a new tab |
| ZaloPay | three steps (open ZaloPay, open QR scanner, scan and confirm); button `OPEN PAYMENT WINDOW` |
| Bank Transfer | VietQR image + bank details with copy buttons |

Every pop-up shows `Amount due now` = the full order total (§12.2).

Rules:
- Method availability = offered for the currency **and** (simulation mode **or** the backend reports the method enabled). A saved method that is not available on this page is dropped.
- Logos supplied with a baked-in checkerboard or black backdrop MUST be cleaned to real transparency before use.
- Adding a method = one entry in `PAYMENT_METHODS` + `METHODS` (row), a pop-up branch, an icon in `assets/pay/`, the `methods` flag in `config.js`, and the service capability list.

Tests: EN page shows 4 rows, VI page 3 (no PayPal) · every icon loads · selecting a row shows `PAY` · `PAY` opens the right pop-up with the order total · no horizontal scroll at 390 / 1440px.

### 12.4 Specs catalogue (PDF) — one source with the site

Each product has a one-page A4 specs catalogue in EN and VI, built by headless Chrome from an HTML page that **imports the site's own product data** (HandyPad: `handypad-catalogue/catalogue.html` + `render.mjs` → `handypad-new/assets/<Product>-by-Handyman-specs-{en,vi}.pdf`).

| Rule | Detail |
|---|---|
| One source | Prices, sizes and add-on prices come from the site's product data — never typed into the catalogue. After any price change, rebuild both PDFs and the Odoo export (§12.2). |
| One page | Each PDF MUST be exactly **one A4 page**. The sheet is a fixed 297mm column that clips overflow, so new content can silently push the footer off the page — after every content change measure that the footer band ends at 297mm, and count the PDF's pages. If it doesn't fit, tighten spacing or shorten the price-tile pictures; never drop the footer. |
| Footer | The same five contacts as the site footer (§10), in one row; no tagline above it. (On the A4 page the five are spread edge to edge; the right-aligned group with the "Contact:" label is the website layout.) |
| Technical specs | Product-specific blocks (HandyPad: Specifications, Tensile Strength, Foam, Delivery, Fireproof Upgrade, Sizes) use the icon + title + short bullet list pattern; values are written exactly as the business supplies them. Every block has a Vietnamese twin. |
| Locked files | A PDF open in a viewer cannot be overwritten (`EBUSY`). Build into `build/`, verify, then copy into `assets/`; if the copy fails, ask the user to close the file. |

---

## 13. Accessibility (non-negotiable)

- All interactive elements reachable by keyboard; visible focus ring `3px solid #2871b7`, offset 2–4px (on dark: white).
- Steps are `<fieldset>`/`<legend>`; locked steps set `aria-disabled` and `aria-describedby` → hint.
- Live cart updates announced via the `#cart-feedback` `role="status"` region.
- Icons are `aria-hidden`; icon-only links have `aria-label`.
- Form fields have `<label>`, `autocomplete`, and error text linked via `aria-describedby`.

---

## 14. Performance budgets

- Total page weight on first load ≤ **2.5 MB** (images WebP; theme backgrounds ≤ 350 KB each).
- Only 3 font files (Be Vietnam Pro 400/600/700 WOFF2, Vietnamese + Latin subset).
- No third-party scripts except payment providers when enabled.
- Largest Contentful Paint (hero) ≤ 2.5s on 4G.

---

## 15. Hand-off checklist (agent must report each)

- [ ] Section order and backgrounds match §1; no dark sections adjacent.
- [ ] All images are from `src/assets/products/<slug>/` or the product's data — list any missing.
- [ ] `grep` shows only the 5 font-size tokens and the 9 spacing values; no `clamp()`, no `vw` font sizes.
- [ ] Only Be Vietnam Pro (and at most one approved second font) is loaded.
- [ ] Only the 3 breakpoints are used (no extra footer breakpoint).
- [ ] Every UI string has a Vietnamese translation; `?lang=vi` renders with VND prices.
- [ ] Footer matches §10: one navy band showing the waves (§3.3), five contact links (email, Handyman.vn, Facebook, WhatsApp, Zalo) at 18px with 24px icons, right-aligned on one row from 768px with the last link on the content's right edge, "Contact:" / "Liên hệ:" before the first link from 1024px, wrapped and centred on phones; no tagline, brand line, tax code, address or copyright; every link target equals `corporate.js`.
- [ ] Payment (§12.3): rows are radio · square icon · name only; PayPal on the USD page only; one `PAY` button; every pop-up shows the full order total.
- [ ] VAT invoice (§12.1): unticked by default; ticking makes Company and Tax code required and locks Payment until valid; all six tests pass in EN and VI.
- [ ] Specs catalogue (§12.4): EN and VI PDFs rebuilt after any data, contact or copy change; each is exactly one A4 page with the footer fully visible; prices equal the site's.
- [ ] No orphan words in headings at 1440 / 1024 / 390px; units, phones, codes never split.
- [ ] One item = one line (§5.4 rule 3): measure the line count of the address, company name, phone, email and every button at 1440, 1280, 1279, 1100, 1024, 1023, 768, 767, 390 and 360px in EN and VI — 1 line everywhere from 768px up; on phones the address breaks only between its parts. Also proofread every visible string for typos and stray breaks before hand-off.
- [ ] Breakpoints: no `max-width` without `.98`; test once at a fractional width (browser zoom or 150 % display scaling) that the layout changes exactly at 768 / 1024 / 1280.
- [ ] Hero H1 lines don't wrap at ≥ 1024px.
- [ ] No horizontal scroll at 360, 390, 768, 1024, 1280, 1440px.
- [ ] Screenshots of every section at 1440px and 390px attached.
- [ ] Full order flow tested: category → item → contact & shipping → payment unlocks automatically; no "Continue" button between steps.
- [ ] All order steps measure identically (title size, 28px badge, padding, radius) — no step-specific overrides (§6.6).
- [ ] Locked steps (§9.5): check four states — nothing chosen · category chosen · product resolved with an empty order · item in order. In each, **exactly one** visible locked step has `data-next-locked` and shows a grey hint card; every other locked step is a title row only. Check with a flow that hides a step (a category where the design step is skipped).
- [ ] Every trigger in §11.1 glides to its target: sample `scrollY` every 50ms after the click — values must pass through intermediate positions (not 0 → target), and the target's top ends at header bottom + 16px. Test once normally and once with `prefers-reduced-motion: reduce` emulated.
- [ ] `grep` finds no `scrollIntoView` / `scroll-behavior` used for section navigation.
- [ ] Every CTA button renders in capitals in EN and VI (via `text-transform`, not capitalised strings) (§5.3); option cards and text links are not uppercase.
- [ ] Bilingual review table `docs/translation-review-<slug>.md` delivered, covering landing, order steps, Order Summary, toasts, errors and every pop-up (§8.2); glossary terms used consistently (§8.1); no inline `language === 'vi'` strings left.
- [ ] If present — Product range strip: slides at 24px/s; stops only on hover, drag, keyboard focus; freezes with reduced motion (§11.2A). Hero rotating image: 5s / 600ms fade; pauses on hover/focus; frozen on first image with reduced motion, manual switch instant (§11.2B). Both tested with Windows "Animation effects" off.
- [ ] Checkout: Country directly before City / Province; all 10 tests in §12.1 pass, by script and by real mouse + keyboard.
- [ ] Pricing (§12.2): every price shown is list price × 0.9 (per part), identical on the site, the catalogue PDFs and the Odoo export; checkout is full payment only — no deposit option, setting or wording; all 5 tests in §12.2 pass.
- [ ] Order Summary (§6.5.1, §9 rule 12): the product list keeps one height in every totals state — tick / untick the VAT checkbox with ≥ 4 products in EN and VI at 768 / 1024 / 1280 / 1440px; the tallest card (with the button) stays on screen.
- [ ] If present — Story section: the Gallery rule in §1.2 B holds for all 3 sets at 1440 / 1280 / 1100px (one strip height, 16px gaps, edge to edge, every trimmed/zoomed photo shows its main subject whole — screenshot each set); all 11 tests in §1.2 F pass (same tile height and 16px gaps in every set, main subjects whole, sets flush with the right edge, 2-line paragraph in EN and VI, click-only set change, 5s autoplay loop with pauses, same slide with reduced motion; one tile height for all sets).

---

## Appendix A — Hyperion vs. this standard (migration list)

Status after the alignment pass of 2026-09-24.

**Still different from the standard (open):**

| Area | Hyperion today | Standard | Why still open |
|---|---|---|---|
| Font sizes | ~40 distinct values, several fluid `clamp()` headline sizes (e.g. hero H1 47px) | 5 tokens: 40 / 28 / 20 / 16 / 14px (§5.2) | Not selected for this pass |
| Theme images | PNG, 1.7–3.5 MB each | WebP ≤ 350 KB (§3.1) | No WebP converter on the build machine; skipped |
| Catalogue | EN PDF only (Hyperion-IMO-Signs-Catalogue-by-DLV-Corp, replaced 2026-09-25) | EN + VI when available | No VI catalogue supplied |
| Catalogue size | 25.5 MB | ≤ 5 MB (§2) | Needs compressing (image downsampling) before launch — no PDF tool on the build machine |
| Bank branch name | `VPBank - Chi nhanh Trung Son` (no accents) in bank-transfer settings | proper Vietnamese, unless it must match bank records | Needs a business decision (see `docs/translation-review-hyperion.md`) |
| Product range strip / hero rotating image | not present | optional; if added, follow §11.2 | Not in the Hyperion brief |
| ⚠️ **Locked-step hint cards (defect)** | "Next locked" step picked by CSS sibling selectors, so several grey hint cards show at once after a hidden step and at Contact & Shipping | exactly one next-locked card, set by `markNextLockedStep()` (§9.5) | Found 2026-09-25 while building Calibration Gas. Fix: port `src/lib/locked-steps.js` plus its two calls (`product-configurator.js`, `order-completion.js`) and the `[data-next-locked]` CSS from the Calibration Gas site |
| Specs catalogue (§12.4) and Story section (§1.2) | not present — Hyperion keeps its supplied catalogue PDF and the Feature section | one-page EN + VI specs PDF built from the site data; Story variant optional | Not in the Hyperion brief; decide per product |
| New catalogue SKUs (2,216, 9 new categories) | LIVE in the site data (2026-09-25) with images; official prices from `Hyperion_Products_Odoo_2_2.xlsx` applied 2026-09-28 (all 2,214 Odoo SKUs match) | — | Price changes: new Odoo export → `scripts/import-odoo-prices.mjs` → re-run the build |

**Brought in line (reference implementation):**

| Area | Now | Where |
|---|---|---|
| Font | Be Vietnam Pro 400 / 600 / 700, self-hosted with Vietnamese + Latin subsets, 2 files preloaded | `assets/fonts/`, `src/styles/fonts.css`, `index.html` |
| Breakpoints | only 767.98 / 1023.98 / 1279.98; JS `matchMedia` uses the same | all stylesheets, `header.js`, `order-summary.js`, `product-search.js` |
| Spacing | fixed per breakpoint — gutter 48 / 32 / 16, header 80 / 72 / 64, section padding 96 / 64 / 48, hero 64 / 48 / 40, shop summary column 360 / 320 / 280 | `tokens.css`, `hero.css`, `sign-construction.css`, `order-summary.css`, `footer.css` |
| Asset names | `theme-*` shared backgrounds; product photos in `src/assets/products/hyperion/`; contact icons in `assets/icons/` | `src/assets/` |
| Footer year | computed automatically | `footer.js` |
| CTA text | every CTA uppercase via CSS, labels in sentence case | `marine-theme.css` (CTA block), `locale.js` |
| VI wording | glossary applied; 7 inline strings moved to `locale.js` via `tn()`; full EN/VI review done | `locale.js`, `docs/translation-review-hyperion.md` |
| Order steps | titles 20px (16px mobile / locked), in-step prices 20px | `configurator-steps.css`, `configurator.css`, `checkout.css`, `configurator-purchase.css` |
| Focus after glide | header links, hero button and Order Summary button move focus to the destination | `src/lib/scroll.js` (`focus: true`) |
| Checkout | Country → City / Province → Address; province dropdown for VN (34), US (51), CA (13), AU (8), MY (16); free text elsewhere; clear-on-change, keep-on-reselect; all 10 tests of §12.1 passed (scripted + real mouse/keyboard) | `src/checkout/regions.js`, `components/region-select.js`, `order-completion.js`, `checkout-store.js`, `order-draft.js` |
| CONTACT SALES | three direct options (call, WhatsApp, Zalo) with icons; contact form removed; VI label "LIÊN HỆ SALES" (approved term) | `components/contact-options.js`, `header.css` |
| Headings | balanced lines, no orphan words (`text-wrap: balance` / `pretty`) | `base.css` |
| Footer (§10) | one navy band on the waves; "Contact:" / "Liên hệ:" + five links (email, Handyman.vn, Facebook, WhatsApp, Zalo) right-aligned, last link on the content edge; one row from 768px, centred wrap on phones. **Hyperion value:** tablet links are 16px with a 14px gap (Be Vietnam Pro is wider than HandyPad's font, 18px / 20px would wrap at 768px) | `footer.js`, `footer.css`, `marine-theme.css` (`.footer-band`), `corporate.js` |
| Zalo link | `corporate.zalo_href` = `https://zalo.me/84347099905` in the footer and CONTACT SALES (the Zalo OA link is gone) | `corporate.js`, `contact-options.js`, `footer.js` |
| Pricing (§12.2) | every price = list × 0.9: `PRICE_FACTOR` in `src/main.js`, applied once when `products.json` loads (the JSON and `docs/price-list-new-skus.csv` keep list prices); 20 SKUs checked EN + VI | `src/main.js` |
| Payment (§12.2, §12.3) | full payment only — no deposit option, setting or wording; rows = radio · square icon · name; PayPal on the USD page only; one `PAY` button; every pop-up shows "Amount due now" = order total | `checkout/config.js`, `order-draft.js`, `checkout-store.js`, `payment-service.js`, `order-completion.js`, `payment-modal.js`, `order-summary.js`, `checkout.css`, `assets/pay/`, `assets/paypal.png` |
| VAT invoice (§12.1) | checkbox under Shipping address; Company + Tax code required while ticked (VN: 10 or 13 digits); kept across reload; all six tests passed in EN and VI | `order-draft.js`, `checkout-store.js`, `order-completion.js`, `checkout.css`, `locale.js` |
| Order Summary list height (§12.2) | product list keeps one height while the totals area changes; the box grows at its bottom edge (fixed 2026-10-03 after the VAT checkbox made the list jump) | `order-summary.css` |
| Earlier fixes | smooth section scrolling (§11.1), Payment step uses the shared step styles (§6.6), no "Continue to payment" button, mobile order bar hidden until the first item, compact locked steps | — |
