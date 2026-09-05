import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { evaluate, parse } from 'groq-js'

function query(file, name) {
	const source = readFileSync(file, 'utf8')
	const text = source.match(
		new RegExp(`const ${name} = groq\x60([\\s\\S]*?)\x60`),
	)?.[1]
	assert.ok(text, `Query ${name} exists`)
	return text
		.replaceAll('${DEFAULT_LANG}', 'hr')
		.replaceAll('${GLOBAL_MODULE_EXCLUDE_QUERY}', 'true')
		.replaceAll('${MODULES_QUERY}', '_type')
		.replaceAll('${TRANSLATIONS_QUERY}', '')
}
const categoryFile = 'src/app/(frontend)/en/proizvodi/[category]/page.tsx'
const categoryQuery = query(categoryFile, 'CATALOG_CATEGORY_QUERY')
const listQuery = query(
	'src/ui/modules/product/category-list.tsx',
	'CATALOG_CATEGORIES_QUERY',
)
const category = (id) => ({
	_id: id,
	_type: 'product.category',
	title_en: id,
	slug_en: { current: id },
	showInCatalog: true,
})
const product = (id, categoryId, extras = {}) => ({
	_id: id,
	_type: 'product',
	title: id,
	language: 'en',
	category: { _type: 'reference', _ref: categoryId },
	metadata: { slug: { current: id } },
	...extras,
})
const dataset = [
	category('labex'),
	category('wax'),
	category('ivd'),
	{ ...category('legacy'), showInCatalog: undefined },
	product('visible', 'labex'),
	product('explicitly-visible', 'labex', { hidden: false }),
	product('hidden', 'labex', { hidden: true }),
	product('other-language', 'labex', { language: 'hr' }),
	product('other-group', 'wax'),
	product('no-url', 'labex', { metadata: {} }),
]
async function run(q, params = {}, data = dataset) {
	return (await evaluate(parse(q, { params }), { dataset: data, params })).get()
}
assert.deepEqual((await run(listQuery)).map((c) => c._id).sort(), [
	'ivd',
	'labex',
	'wax',
])
assert.deepEqual((await run(categoryQuery, { slug: 'ivd' })).products, [])
assert.deepEqual(
	(await run(categoryQuery, { slug: 'labex' })).products
		.map((p) => p._id)
		.sort(),
	['explicitly-visible', 'visible'],
)
assert.equal(await run(categoryQuery, { slug: 'missing' }), null)
assert.equal(await run(categoryQuery, { slug: 'legacy' }), null)
const moved = dataset.map((d) =>
	d._id === 'visible'
		? { ...d, category: { _type: 'reference', _ref: 'ivd' } }
		: d,
)
assert.deepEqual(
	(await run(categoryQuery, { slug: 'ivd' }, moved)).products.map((p) => p._id),
	['visible'],
)
assert.ok(
	!(await run(categoryQuery, { slug: 'labex' }, moved)).products.some(
		(p) => p._id === 'visible',
	),
)
const edited = dataset.map((d) =>
	d._id === 'labex'
		? { ...d, title_en: 'Renamed', description_en: 'Edited description' }
		: d,
)
assert.equal(
	(await run(listQuery, {}, edited)).find((c) => c._id === 'labex').title,
	'Renamed',
)
assert.equal(
	(await run(categoryQuery, { slug: 'labex' }, edited)).description,
	'Edited description',
)

for (const [file, name, params] of [
	['src/ui/modules/product/product-list/index.tsx', 'PRODUCT_LIST_QUERY', {}],
	[
		'src/ui/header/product-search/search.ts',
		'PRODUCT_SEARCH_QUERY',
		{ queryMatch: '*' },
	],
	[
		'src/ui/modules/product/product-content.tsx',
		'RELATED_PRODUCTS_QUERY',
		{ id: 'other-group', categoryId: 'labex', limit: 10 },
	],
]) {
	const results = await run(query(file, name), {
		lang: 'en',
		defaultLang: 'hr',
		productsDir: '/products/',
		...params,
	})
	assert.ok(
		results.some((p) => p._id === 'visible'),
		`${name}: visible product is included`,
	)
	assert.ok(
		!results.some((p) => p._id === 'hidden'),
		`${name}: hidden product is excluded`,
	)
}
const detailQuery = query(
	'src/app/(frontend)/products/[...slug]/page.tsx',
	'PRODUCT_QUERY',
)
const detailParams = {
	lang: 'en',
	defaultLang: 'hr',
	productsDir: 'products/',
	productsBase: 'products',
}
assert.equal(await run(detailQuery, { ...detailParams, slug: 'hidden' }), null)
assert.equal(
	(await run(detailQuery, { ...detailParams, slug: 'visible' }))._id,
	'visible',
)
const sitemapQuery = readFileSync('src/app/sitemap.ts', 'utf8').match(/query: groq`([\s\S]*?)`/)?.[1]
assert.ok(sitemapQuery)
const sitemap = await run(sitemapQuery, { baseUrl: 'https://example.com', productsDir: 'products', blogDir: 'blog', defaultLang: 'hr' })
assert.ok(sitemap.products.some(p => p.url.endsWith('/visible')))
assert.ok(!sitemap.products.some(p => p.url.endsWith('/hidden')))
assert.equal(sitemap.categories.length, 3)
console.log(
	'PASS: empty categories, automatic assignment/reassignment, CMS text edits, language scope, hidden products in lists/search/related/direct URLs.',
)
