# CLARO-PROM WEB V3.2

## Baseline and implemented scope

The checked main/production baseline was `d95ecc5ea0408dfb2ce2d79417095c36b20234b4` (PR #25). No open PR or existing V3.2 implementation was found. V3.1's 44 published IVD records and 88 descriptions were already live and remain unchanged.

- `/distributors`: indexable partnership page, Claroplast/IVD/LABEX links, contextual distributor inquiry form using the existing `/api/contact` and recipient configuration.
- `/inquiry`: noindex combined RFQ, up to 50 SKU rows, integer quantities measured in individual product packs, removal, versioned local selection persistence and shared navigation. No pricing, cart checkout or order is created.
- Catalogue cards and product detail pages expose Add to Inquiry. Stable document ID and row key identify each selection. The email endpoint rereads published Sanity products and derives names, catalogue codes and packaging on the server; client-supplied labels are ignored.
- Existing single-product quote flows are retained. Distributor CTAs route to the new page and preserve relevant product/code context.
- MEDICA homepage promotion moved above the homepage modules, with distributor/catalogue links added. Existing Hall 1 / A03, meeting CTA and automatic promotion end at `2026-11-20T00:00:00+01:00` remain intact.
- Header search matches catalogue numbers as well as product names, including owner-confirmed Claroplast codes. Input races, cleared searches and loading/error states are handled.
- Correct VAT `HR56024653521` was already present in the footer and Organization schema. The corresponding OIB `56024653521` is now also explicitly shown.

## Source-backed catalogue corrections

The owner-supplied files were found and actually read:

- `katalog 2026 cijene Medika IVD 07.06.2026..pdf`: 13 pages; SHA-256 `1e036a00a5ef9620ae763e52959f0e3c1137560c9cb22ee861915783443f1116`.
- `katalog 2026 cijene Medika IVD 07.06.2026..xls`: Sheet1, 362 rows; SHA-256 `1684f2cca4c56eca6a08151ad29f94a7ea1acc5cce708a0e8f154f1f7386ed45`.

Original PDFs, XLS files, rendered source pages and price data remain outside the repository. Only identity/presentation evidence is used. Catalogue entries without existing CMS products are not automatically imported.

| Existing product | Previous raw CMS value | Confirmed value | Authority |
|---|---|---|---|
| Claroplast 2 kg | 345; empty pack field | CP00CL2; 2 kg | Explicit prior owner confirmation; official IFU page 1 |
| Claroplast 10 kg | 6666; empty pack field | CP00CLP; 10 kg | Owner; official IFU; Medika catalogue |
| LABEX A 1 L | LABEX A a 1000 ml; empty pack field | LABEX A, 1 L; 1 L | PDF page 9; XLS rows 230–231; 1000 mL individual pack |
| Claromount 50 mL | CP00MT | CP00KB | PDF page 8/XLS row 205; explicit owner confirmation |
| Claromount 100 mL | CP00MT1 | CP01KB | Explicit owner confirmation |
| Claromount 200 mL | CP00MT2 | CP02KB | Explicit owner confirmation |
| Claromount 500 mL | CP00MT3 | CP00KB1 | PDF page 8/XLS row 207; explicit owner confirmation |

Six raw CMS code values corrected in total. The two Claroplast codes were already shown correctly through the existing public read model; this aligns the stored data. Three empty individual-pack fields filled, and one LABEX title corrected. All existing slugs/URLs are retained.

The Claromount conflict was initially isolated because catalogue CP00MT denotes methanol 1 L. The owner's subsequent explicit confirmation `CP00KB/CP01KB/CP02KB/CP00KB1 — 50/100/200/500 mL` resolves all four existing Claromount variants; no guessed code remains.

LABEX CP00LA1 is 1000 mL per product pack, with 12 individual packs in the original transport pack. RFQ quantities are individual packs; 12 was not written into the product pack-size field. Catalogue CP00LA2/LA3 and other absent presentations were not created.

## Data protection and rollback

CMS changes were targeted, revision-preconditioned patches with fresh snapshots and backups. The first transaction updated three existing records (codes/empty pack fields and the LABEX title); a separate owner-confirmed transaction changed only four Claromount code paths. Read-back compared every other field and all unrelated products. All 44 IVD products, 88 V3.1 descriptions, intendedPurpose fields, photos/galleries, formulation/class fields and existing URL metadata remained unchanged.

Code rollback: previous production deployment `dpl_7Ypobv8cxA2MN4yejPde9HHrzWTC`. Data rollback: restore only the exact changed paths with current revision guards from the internal snapshots; stop on concurrent edits. Never replace a whole product or roll back employee photographs. Original source documents are unchanged.

## Validation

Local production build and TypeScript passed. Existing source CSS pseudo-element warnings are unchanged. Isolated tests cover canonical SKU resolution, forged labels, invalid/duplicate quantities, hidden/missing/non-English products, consent/honeypot, cross-origin submissions, bounded request bodies, HTML escaping and distributor/combined-RFQ/single email adapters. Existing outreach, MEDICA expiry, product catalogue, SEO and photo rendering guard tests passed. No real email was sent by the isolated tests.

Hosted Preview, CI, release and actual production email receipts must be verified before declaring the release complete. Their final results belong in the release record, not inferred from this implementation note.
