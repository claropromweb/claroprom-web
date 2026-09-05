# Sanity product catalog

## Editing after activation

- **Product categories → English:** edit the name and description. **Catalog:** upload a photograph, edit its alternative text, change the display order or switch **Show in Products** on/off. Images are optional. Publish changes.
- **Products → English → New:** enter the title, select the category, add the main photograph, additional photographs and description. The English list now creates an English document automatically.
- **Product codes & available pack sizes:** add one row per SKU/pack size.
- **Regulatory & use:** complete the existing required product type and Claroprom role fields using the approved product information.
- **Documents:** upload SDS, IFU, technical data sheet or declaration of conformity PDFs.
- **Metadata:** generate a unique URL slug. Publish to make the product appear automatically in its assigned category.
- Switch **Hide from website** on and publish to remove a product from lists, search, related products and its direct public URL. Turn it off and publish to restore it. Sanity's existing Unpublish and Delete actions also remove the public document.

All three category pages read their name, description, image and assigned English products directly from Sanity. A category remains visible with no products. Renaming a category does not require renaming its URL slug. Changing slugs changes the public URL, so keep them stable after sharing.

## Activation in the existing project

The live site uses Sanity project **ddtwki7e**, dataset **production**. The old CLI configuration referenced an unrelated template project; the CLI now uses the environment configuration with the correct existing project as its fallback.

1. Deploy this code to the existing `claroprom-web` project after approval. No new project or integration is needed. The deployed environment already needs its existing Sanity Viewer token (`SANITY_API_READ_TOKEN`).
2. Run `node scripts/configure-product-catalog.mjs` to review the migration. It defaults to a dry run.
3. With an Editor token supplied securely through `SANITY_API_WRITE_TOKEN`, run `node scripts/configure-product-catalog.mjs --apply`. The script checks the project, existing content, duplicate categories and pending drafts, saves a local backup, and applies one transaction with revision guards.
4. Check `/proizvodi` and the three existing category URLs: `/en/proizvodi/labex`, `/en/proizvodi/claroplast`, `/en/proizvodi/ivd-reagents`.

The migration reuses the LABEX category, creates Claroplast and IVD Reagents, and replaces only the two known manually added category-link modules with the existing Product list module's **Product categories (English)** mode. The LABEX image is preserved. Other modules and existing products are untouched. Former placeholder pages are retained with an **[Archived]** title and excluded from the sitemap; edit categories through **Product categories**.

For activation through Studio instead of an Editor token: set the three category names and slugs above, enable **Show in Products**, and change the Products page's Product list display to **Product categories (English)**. Remove its old Category grid and Custom HTML links. Archive the old placeholder page documents using the reviewed migration to avoid duplicate sitemap entries.

## Validation

`node scripts/test-product-catalog.mjs` evaluates the actual GROQ queries against fixtures. It checks empty categories, assignment and reassignment, edited category text, language filtering, and hiding from list/search/related/direct-product queries.

`npm run typegen` regenerates schema/query types. `npm run typecheck` verifies integration. A full production build requires the deployment's existing Viewer token.

Before considering activation complete, verify in Studio and on the public site: create a temporary English product with a SKU and pack size; assign it to LABEX; move it to Claroplast; upload a photo and PDF; hide and restore it; unpublish it. Confirm each step on the category page and direct product URL. No sample products are created by the migration.
