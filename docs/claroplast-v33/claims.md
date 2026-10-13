# Claroplast V3.3 claim register and implementation inventory

## Authority and boundaries

Owner-approved V3.3 FINAL, 13 October 2026, authorizes positioning and the physical-form descriptor. Existing first-party Sanity Claroplast category `description_en` explicitly describes highly purified paraffin, polymer additives, controlled elasticity, smooth microtome cutting and continuous ribbon formation. A fresh read was saved privately before implementation. Official Claroplast IFU version 1.0 (8 September 2025), pages 1–2, was read and its original file hash matched the earlier extraction. It describes infiltration, embedding and microtome use, not quantified performance. Its disputed fixation statement is not repeated; controlled intendedPurpose and IFU are untouched. No polymer identity, concentration, working temperatures or section thickness is added to marketing copy.

Poth Hille PHC9009 and Leica standard Paraplast / Plus / Xtra official pages were read solely for presentation and terminology. Their properties are not Claroplast evidence. PHC9009 shrinkage and Leica variant-specific compression/DMSO/viscosity/infiltration claims are not transferred. Public copy is original and contains no competitor names.

| Theme | Classification | Publication |
|---|---|---|
| Low shrinkage during cooling | CONFIRMED formulation intent | “Formulated to help limit shrinkage during cooling.” Manufacturer confirmation supplied in the 13 October 2026 claims addendum; no measured shrinkage or comparison claim. |
| Reduced distortion / compression | CONFIRMED formulation intent | “Designed to help reduce section compression and distortion during microtome cutting.” No quantified reduction or comparator. |
| Smooth microtome cutting | QUALIFIED | “The polymer-modified formulation supports smooth, controlled microtome sectioning in routine histology workflows.” Existing manufacturer category copy and IFU microtome use; no quantified ease/cutting-force guarantee. |
| Continuous ribbon formation | QUALIFIED | “Claroplast supports continuous ribbon formation and the cohesion of successive histological sections during routine microtome cutting.” Existing manufacturer copy; no universal uninterrupted-ribbon guarantee. |
| Elasticity and tensile integrity | CONFIRMED formulation intent | “Polymer additives are selected to support elasticity and tensile integrity.” No increased/measured tensile-strength claim. |
| Highly purified paraffin with polymer additives | CONFIRMED | Existing manufacturer category copy; primary identity owner-approved. No synthetic/plasticising polymer identity disclosed. |
| pellet (granulated) form | CONFIRMED by explicit owner V3.3 product-form instruction | Exact phrase on hub, both SKUs and approved catalogue summaries; no pellet dimensions, uniformity or melting-speed claim. |

## Inventory and source of truth

Public Claroplast marketing already uses versioned frontend read models. V3.3 retains that architecture. `src/content/claroplast.ts` owns hub/summary/performance copy; `claroplastCopy` owns pack-specific metadata/detail read models; existing pack config owns stable SKU codes, pack sizes and compact names. Raw Sanity records are preserved. No CMS schema or production mutation is necessary; every image, photo caption and regulatory field retains its current source. No competing new CMS marketing values are created.

| Public route / surface | Previous wording / source | V3.3 implementation |
|---|---|---|
| `/` | Broad manufacturer H1 and CMS modules | Prominent linked polymer identity and three qualified characteristics before company modules; corporate H1 and IVD/LABEX identity retained; homepage description updated. |
| `/products/histology-paraffin-wax-claroplast` | Category CMS intro + static hub components; generic paraffin title | New primary H1, technical descriptor, original introduction, five reviewed themes, physical form, existing pack/OEM/quote sections; CollectionPage architecture retained. |
| `/products/claroplast-a-2-kg` | Approved frontend SKU read model | New public name, unique title/description, qualified core copy and form; CP00CL2 / 2 kg unchanged; descriptive hub link. |
| `/products/claroplast-a-10-kg` | Approved frontend SKU read model | Matching positioning with distinct metadata; CP00CLP / 10 kg unchanged; packaging advantage retained. |
| `/products`, related cards | Category-list and product-preview | Compact polymer identity and reviewed short summary; photographs preserved. |
| Header catalogue search | Title/code GROQ search | Existing title/code matching retained; recognized Claroplast intent also finds the existing two SKUs and displays approved names. No alternate pages. |
| `/distributors` | Static Claroplast portfolio paragraph | Concise polymer/sectioning/ribbon positioning; existing form/IVD/LABEX sections unchanged. |
| MEDICA article | Prepared article fallback | Relevant Claroplast wording and anchor updated; dates/stand/expiry/meeting logic unchanged. |

Canonical identities and schema entity IDs remain unchanged. No prices, availability, reviews, measurements or additional Product entities added. Existing accurate image alt fields are retained; image SEO edits are not needed without direct evidence the alt is inaccurate.

## Release boundary

V3.3 does not change contact API, distributor form, RFQ store/resolution, environment variables, Resend, DNS, VAT/OIB or MEDICA dates. V3.2 email delivery to the official recipient remains unresolved and must be reported separately. No real email test belongs to this content-only release.

Rollback is the prior code deployment (same V3.2 commit with corrected recipient environment). No CMS rollback is needed because V3.3 performs no mutations. Never roll back to an older deployment whose email recipient was the test inbox.

## Manufacturer claims addendum — 13 October 2026

The manufacturer explicitly confirmed the three formulation intentions above. This is qualitative manufacturer confirmation, not quantitative laboratory data. All five functional benefits appear together on the hub and in both SKU descriptions. Laboratory evidence is still required for measured shrinkage, compression/distortion reductions, elasticity or tensile values, cutting-force or ribbon-continuity measurements, any comparison with another wax, and guaranteed outcomes. Sanity data, photos, SKUs, packaging, URLs and V3.4 email code/configuration remain unchanged. The historical V3.2 email note above is not the status of V3.4; this addendum builds on V3.4 commit 5b4e52b.
