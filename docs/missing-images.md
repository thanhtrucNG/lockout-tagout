# Missing images: Lockout Tagout landing page

Template §4: only images supplied for this product may be used. Nothing was supplied, so every slot shows the built-in "Image unavailable" box (hero: the navy motif).

| Slot | File | Size | Format |
|---|---|---|---|
| Hero photo | `src/assets/products/loto/hero.webp` | 2400×900 (8:3), subject in the right 40%, calm and dark on the left | WebP/JPG ≤ 400 KB |
| Feature visual | `src/assets/products/loto/feature-visual.webp` | 1400×1050 (4:3), product isolated, transparent, ≥ 10% margin | WebP ≤ 300 KB |
| Product photos | `src/assets/products/loto/items/<product code>.webp` (also `.jpg`, `.png`) | 800×800 (1:1), product on pure white, fills 80–90% | WebP/JPG ≤ 120 KB |

The hero and feature files are picked up automatically. For product photos, put the files in `items/` and run `node scripts/build-loto-data.mjs`; a family (design) uses the photo of its first product that has one.

`missing-images-loto.csv` lists all 851 product codes with the exact file name expected (spaces and symbols in a code become `_`, for example `GS GVL-04` → `GS_GVL-04.webp`). Many products can share one photo by copying the file under each code.
