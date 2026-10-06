# Hand-off: Lockout Tagout landing page

Built from the Calibration Gas repo (`Downloads/calibration-gas`, template of 3 Oct 2026, `docs/landing-page-template.md`). Same header, footer, order steps, Order Summary, checkout, payment rows and VAT invoice. Product data is generated, never hand-edited.

**Run locally:** start `lockout-tagout` from `.claude/launch.json` (bundled node, `tools/serve.mjs`, port 8096), then open http://localhost:8096 (Vietnamese: `?lang=vi`).
**Rebuild data:** `node scripts/merge-loto-sources.mjs` (reads the source files from `../LOTO` by default, writes `data-source/loto.json`, `docs/price-estimates-loto.csv` and `../LOTO/reports/merge-report-loto.csv`), then `node scripts/build-loto-data.mjs`.
**Other scripts:** `node scripts/check-translations.mjs`, `node scripts/make-translation-review.mjs`.

## What is on sale
851 products in 11 categories (padlocks 179 · group lockout 77 · kits & stations 85 · cable 46 · valve 82 · electrical 87 · switch/gas/air 36 · fuse & terminal 13 · plug & vehicle 26 · confined space 15 · tags 205).

| Source | Items | Price |
|---|---:|---|
| Odoo exports (9 files, 193 rows) | 115 unique | Odoo sales price (VND), real |
| Price-list PDF | 42 of 58 models (16 were the same product as an Odoo item, so Odoo wins) | Estimate: PDF price × 7,547 VND (the median Odoo ÷ PDF ratio over the 16 overlaps). The PDF currency is assumed USD. |
| Brady-range catalogue | 694 of 728 SKUs | Estimate (see below) |

Rules applied (full list in `../LOTO/reports/merge-report-loto.csv`):
- **One product once.** 40 items were dropped as duplicates (16 PDF models, 24 catalogue SKUs: same type and size as a Handyman product, or the same product listed twice in the catalogue). The Handyman item is kept.
- **11 skipped:** 10 "custom key-code" padlock sets (made to order) and 1 heading row.
- **No producer names.** Producer names, logos and part numbers of the catalogue and of Sofamel, Allegro and Space Age are not shown anywhere on the page or in `src/` or `data-source/loto.json`. Their items use neutral names and Handyman product codes (`HM-…` for the four Odoo items that carried a producer prefix, `LOTO-…` for catalogue items). A few Sofamel / Allegro model designations remain as plain variant labels (for example "Industrial hasp, model EN-6/25", "Lockout station, model LS-10", "Lockout tagout wall case, model 4400-L"). Remove them if you do not want them shown.
- **Names, sizes and Vietnamese are generated** from the technical facts by `scripts/loto/rules-*.mjs`; they have not been checked against the products.

## Needs your input or review
| # | Item | Detail |
|---|---|---|
| 1 | **Estimated prices (736 of 851)** | `docs/price-estimates-loto.csv` lists every estimate with its basis (median of similar Handyman products × a factor × pack size). Fill the last column, put the numbers into `loto.json` (or an Odoo import) and rebuild. Examples: padlock pack of 24 about 4.1M ₫, 50-pack of breaker lockouts about 5.6M ₫. |
| 2 | **Currency of the price-list PDF** | Assumed USD (the file shows "$"). Odoo prices are VND and are about 1/7 of the PDF numbers for the same products, so confirm which list is current. |
| 3 | **One Odoo padlock at 1,400,000 ₫** | Odoo lists a red keyed-different nylon padlock at 1.4M ₫ (the other Handyman padlocks are 185–200k ₫). Used as listed; please check. |
| 4 | **Images (none supplied)** | Hero (2400×900), feature visual (1400×1050) and 851 product photos. The page shows the standard "Image unavailable" boxes. `docs/missing-images.md` and `docs/missing-images-loto.csv`. |
| 5 | **Catalogue PDF (built 5 Oct)** | `assets/lockout-tagout-catalogue-en.pdf` (46 pages) and `-vi.pdf` (47 pages), about 4.5 MB each, every one of the 851 products with its Handyman code and the site price. CATALOGUE nav link, hero DOWNLOAD CATALOGUE button and "View Catalogue" link are on and pick the language. Built by `../lockout-tagout-catalogue` (see its README). Photos in it come from Brady's catalogue (your choice): see items 11 and 12. Rebuild after any data or price change. |
| 11 | **Photos in the catalogue show third-party branding risk** | 102 photos cut from the Brady PDF (96 of 105 product types; the 9 without a photo print without one: insulated-jacket padlocks, key boxes, ball valve arm, gate valve cylinder lockout, cable + butterfly set, fire alarm kit, round/square panel lockouts, pin & sleeve lockouts, customised tags). I painted over the logo on 6 photos and trimmed stray caption fragments on 6, but small embossed marks (for example on the toolbox lid, group lock boxes, padlock bodies) can still be seen on some photos when zoomed in. The landing page itself does not use these photos. |
| 12 | **Catalogue prices** | Same as the site (list x 0.9: USD on the EN PDF, VND on the VI PDF), so 736 of 851 are still estimates. They are printed with no "estimate" mark. Examples that look odd side by side: red keyed-different padlock (single) US$48.47 vs the other colours US$6.92, hasp HM-764102 US$122.54. |
| 6 | **Standard tag designs** | The 90 standard tags come in 10 front designs; the legends are images in the source PDF, so they show as "Design 1 … Design 10". Give each its real name (`scripts/loto/rules-brady.mjs`, `standardTags`). |
| 7 | **Unverified product groupings** | Hasp "Style 1–4" and tag "Style 1 / Language set A, B / Roll style 1, 2" groups, the two ready-access stations' dimensions, and the Odoo GVL-04…10 sizes (taken from the price-list model numbers V-04…V-10). |
| 8 | **Odoo data problems** | See the Data Notes sheet in `LOTO_Full_Catalog.xlsx` (wrong categories, duplicate names, misspellings). They are not carried onto the site. |
| 9 | **Vietnamese copy** | `docs/translation-review-loto.md` (page copy, 105 product types, 456 size/pack labels). Needs a Vietnamese speaker. |
| 10 | **Publishing** | `scripts/loto/rules-brady.mjs` and `scripts/merge-loto-sources.mjs` contain catalogue part numbers and producer names for mapping. Do not publish the `scripts/` and `docs/` folders (this hand-off names the producers): publish only `index.html`, `assets/` (includes the two catalogue PDFs), `src/`, `favicon.png`. The builder folder `../lockout-tagout-catalogue` is internal too (its `photos/` are from a third-party catalogue). |

## Deviations from the template
- **Hero:** standard hero (eyebrow, two-line H1, FIND YOUR PRODUCT + DOWNLOAD CATALOGUE). Copy is mine (EN + VI), not yet approved.
- **Configurator:** the engine shows fixed steps, used here as 1 Category · 2 Product · 3 Design (colour / model) · 4 Size or option · 5 Pack or keying, then Contact & Shipping and Payment. Design is skipped when a product has one design, and size is skipped when it is the plain "Standard". Size options are drawn per product (a global size matrix would have hundreds of greyed buttons). The pack step hides its button when there is only one pack.
- **Heading:** "FIND YOUR PRODUCT" (template wording), nav link ORDER, no product lookup section (as on Calibration Gas).
- **Inherited:** some non-token font sizes and the 1.7–2.6 MB PNG theme backgrounds are still those of Hyperion / Calibration Gas (template Appendix A).

## Checks run (template §15 subset)
- ✅ Section order header → hero (dark) → feature (light) → shop (light) → footer (dark).
- ✅ Order flow, English: Valve lockouts → Gate valve lockout → Yellow → 1–2.5 in. → Add to order (US$4.91 = list × 0.9) → Contact & Shipping typed by keyboard (Country "viet" ↵, City "hue" ↓ ↵, address) → Payment unlocked with no Continue button; four payment rows (Card, PayPal, ZaloPay, Bank Transfer).
- ✅ Sweep of all 105 product types in 11 categories (scripted clicks, English): every one reaches a priced, resolved product in the purchase card; no console errors.
- ✅ Exactly one locked step marked as next at every state seen (nothing chosen, product chosen, design chosen, size chosen, item in order).
- ✅ Vietnamese: hero, feature section, categories, padlock flow, pack labels all in Vietnamese; `check-translations.mjs` clean.
- ✅ No horizontal scroll at 390, 768 and 1024px (and 1440). Hero H1 lines do not wrap at 1024px.
- ✅ No producer or catalogue names in `src/`, `index.html`, `data-source/loto.json` (grep for the producer names, part-number prefixes and the catalogue line name returns nothing; checked after the last data build).
- ⬜ **Not run:** payment pop-ups, PayPal removal on the VND page, VAT invoice tests, glide-scroll sampling, reduced-motion, widths 360 / 1280 / 1920, bilingual `innerText` sweep of every state, a full font-size audit, a real mouse / keyboard test in every category (only valves and padlocks were opened by hand), screenshots of every section.

## Odoo import file (5 Oct)
`../LOTO/LOTO_Odoo_Import.xlsx` (built by `scripts/odoo/make-import.mjs`, checked by `scripts/odoo/verify-import.mjs`; both internal, they hold Brady numbers). Sheet `Import` = template columns + ID, 858 rows: 733 new SKUs (generated ID `loto.<Internal Reference>`, Sales Price blank) + 125 existing Odoo items (current name and price, **ID empty**). Importing the existing rows without an ID creates duplicates: import only the rows that have an ID, or send an Odoo export with "External ID" + "Internal Reference" and run `node scripts/odoo/make-import.mjs --ids <file>`. Other sheets: `Existing in Odoo` (what changed), `Cross-reference` (Internal Reference <-> website / PDF code), `Notes`. Website and PDF still show LOTO-xxx codes.

## Odoo import file v2 (6 Oct)
`../LOTO/LOTO_Odoo_Import_v2.xlsx` (builder `scripts/odoo/make-import-v2.mjs`, check `scripts/odoo/verify-import-v2.mjs`; internal). Template columns only (no ID column). Reads the branch exports in `../23.7.4` as the current Odoo state: existing rows keep their Public Reference and Product Category/ID, Internal Reference becomes the catalogue code. 858 rows = 125 existing + 733 new; new SKUs numbered after each branch maximum (23.7.4.4 starts at .11, 23.7.4.1 at .2, .6 / .11 / 23.2 at .1). 170 Odoo items in the folder that are not in the catalogue are left out (sheet "Odoo items not in catalogue"). Without an External ID Odoo cannot update existing rows (they would be created again): run with `--ids <export with External ID>` to add the ID column.

## Catalogue v2 (6 Oct)
New layout (cover band, 11 full-page section openers, photo cards with "From" price, name-based tables). Core rules: every row prints the **Odoo product name** and the **Public Reference** from `LOTO_Odoo_Import_v2.xlsx`; Internal Reference never printed. Names with a producer / product-line / part number are cleaned for print only (`../lockout-tagout-catalogue/build/names-sanitised.txt`, 37 names; they still differ from Odoo until renamed there). Rebuild: `2-prepare-data.mjs`, `3-render.mjs --preview`, `4-verify.mjs` (needs pdftotext on PATH; checks every Public Reference/name/price once in body and index, no producer or internal reference text). EN 62 pages / 5.3 MB, VI 61 pages / 5.5 MB. Photos unchanged (see `LOTO_PDF_Catalogue_Audit.xlsx`).
