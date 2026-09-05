import { writeFileSync } from 'node:fs'
import { createClient } from '@sanity/client'

// Dry-run by default. A write token is only needed for the explicit apply step.
// Never run this against the template project's old CLI project ID.
const client = createClient({
	projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'ddtwki7e',
	dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
	apiVersion: '2026-06-17',
	useCdn: false,
	perspective: 'raw',
	token: process.env.SANITY_API_WRITE_TOKEN,
})
if (
	client.config().projectId !== 'ddtwki7e' ||
	client.config().dataset !== 'production'
) {
	throw new Error(
		'This migration is only for the existing Claroprom production dataset.',
	)
}

const groups = [
	{
		id: '6e8a1061-1bb4-4223-83ed-6e70c25aa119',
		title: 'LABEX – Laboratory Detergents',
		slug: 'labex',
		page: 'caabddb0-9142-46db-95d3-64e30606a651',
	},
	{
		id: 'catalog-claroplast',
		title: 'Claroplast – Histology Wax',
		slug: 'claroplast',
		page: 'ce365bf1-1513-4507-b950-0559ea6e0008',
	},
	{
		id: 'catalog-ivd-reagents',
		title: 'IVD Reagents – Histology & Cytology',
		slug: 'ivd-reagents',
		page: '856f7348-50de-4038-bd4c-55d2a1b99b48',
	},
]
const rootId = '46dc32b1-9b06-4378-9a15-c2d1800697f4'
const ids = [rootId, ...groups.flatMap((g) => [g.id, g.page])]
const docs = await client.fetch('*[_id in $ids || _id in $draftIds]', {
	ids,
	draftIds: ids.map((id) => `drafts.${id}`),
})
if (docs.some((d) => d._id.startsWith('drafts.')))
	throw new Error(
		'Pending drafts exist. Review and publish/discard them before migrating.',
	)
const root = docs.find((d) => d._id === rootId)
if (root?.metadata?.slug?.current !== 'proizvodi')
	throw new Error('Products page not found at the expected URL.')
const legacyKeys = ['797500d0a2d0', 'a2acca191282']
const list = root.modules?.find(
	(m) => m._key === 'f332cd0a0391' && m._type === 'product-list',
)
if (!list)
	throw new Error(
		'Expected Products module is missing. Review the page before migrating.',
	)

let transaction = client.transaction()
for (const [index, group] of groups.entries()) {
	const existing = docs.find((d) => d._id === group.id)
	const conflicts = await client.fetch(
		`*[_type == 'product.category' && _id != $id &&
		(slug_en.current == $slug || title_en == $title)]{_id}`,
		{ ...group },
	)
	if (conflicts.length)
		throw new Error(
			`Another category already uses ${group.title}. Reuse it before continuing.`,
		)
	const page = docs.find((d) => d._id === group.page)
	if (
		page &&
		(page.language !== 'en' ||
			page.metadata?.slug?.current !== `proizvodi/${group.slug}` ||
			page.modules?.length !== 1 ||
			page.modules[0]._type !== 'prose' ||
			page.modules[0].content
				?.flatMap((b) => b.children ?? [])
				.map((s) => s.text ?? '')
				.join('') !== group.title)
	) {
		throw new Error(
			`The placeholder page for ${group.title} has changed. Preserve its new content before migrating.`,
		)
	}
	const values = {
		title_en: group.title,
		slug_en: { _type: 'slug', current: group.slug },
		showInCatalog: true,
		sortOrder: index + 1,
	}
	if (index === 0) {
		const previousImage = root.modules.find(m => m._key === '797500d0a2d0')?.categories?.[0]?.image
		if (previousImage && !existing?.image) values.image = previousImage
	}
	if (existing) {
		// A completed migration must not overwrite later editorial changes.
		if (existing.showInCatalog === undefined) {
			transaction = transaction.patch(group.id, (p) =>
				p.ifRevisionId(existing._rev).set(values),
			)
		}
	} else {
		transaction = transaction.createIfNotExists({
			_id: group.id,
			_type: 'product.category',
			...values,
		})
	}
	if (page) {
		// Keep the previous page document as an archive; it no longer owns this URL.
		// noIndex prevents duplicate sitemap entries. Nothing is deleted.
		transaction = transaction.patch(page._id, (p) =>
			p.ifRevisionId(page._rev).set({
				title: `[Archived] ${group.title}`,
				'metadata.noIndex': true,
				catalogArchive: true,
			}),
		)
	}
}
const modules = root.modules
	.filter((m) => !legacyKeys.includes(m._key))
	.map((m) => (m._key === list._key ? { ...m, display: 'categories' } : m))
transaction = transaction.patch(rootId, (p) =>
	p.ifRevisionId(root._rev).set({ modules }),
)

console.log(
	JSON.stringify(
		{
			project: client.config().projectId,
			categories: groups.map((g) => g.title),
			productsPage: rootId,
			mutations: transaction.serialize(),
		},
		null,
		2,
	),
)
if (process.argv.includes('--apply')) {
	if (!process.env.SANITY_API_WRITE_TOKEN)
		throw new Error('Missing SANITY_API_WRITE_TOKEN with Editor permissions.')
	const backup = `catalog-backup-${Date.now()}.json`
	writeFileSync(backup, JSON.stringify(docs, null, 2), {
		mode: 0o600,
		flag: 'wx',
	})
	await transaction.commit()
	console.log(`Applied. Original documents saved to ${backup}.`)
} else {
	console.log(
		'Dry run only. After deploying the code, rerun with --apply and an Editor token.',
	)
}
