import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'

const uri = (source) =>
	'data:text/javascript;base64,' +
	Buffer.from(
		ts.transpileModule(source, {
			compilerOptions: {
				module: ts.ModuleKind.ESNext,
				target: ts.ScriptTarget.ES2022,
			},
		}).outputText,
	).toString('base64')
const { CLAROPLAST } = await import(
	uri(readFileSync('src/content/claroplast.ts', 'utf8'))
)
const { claroplastCopy } = await import(
	uri(readFileSync('src/lib/product-seo.ts', 'utf8'))
)
const copies = ['claroplast-a-2-kg', 'claroplast-a-10-kg'].map(claroplastCopy)
assert.equal(new Set(copies.map((p) => p.title)).size, 2)
assert.equal(new Set(copies.map((p) => p.description)).size, 2)
assert.equal(CLAROPLAST.benefits.length, 5)
for (const copy of copies) {
	assert.match(copy.name, /with Added Synthetic Polymers/)
	assert.match(copy.visibleDescription, /pellet \(granulated\) form/)
	assert.equal(
		(copy.name.match(/with Added Synthetic Polymers/g) || []).length,
		1,
	)
}
const published = JSON.stringify(CLAROPLAST) + JSON.stringify(copies)
assert.doesNotMatch(
	published,
	/zero shrinkage|guaranteed|increased tensile|enhanced tensile|DMSO|PHC 9009|Paraplast|universal tissue|54.?56/i,
)
for (const text of [
	JSON.stringify(CLAROPLAST),
	...copies.map((p) => p.visibleDescription),
]) {
	assert.match(text, /[Ff]ormulated to help limit shrinkage during cooling/)
	assert.match(
		text,
		/[Dd]esigned to help reduce section compression and distortion during microtome cutting/,
	)
	assert.match(
		text,
		/[Aa]dded synthetic polymers are selected to support elasticity and tensile integrity/,
	)
	assert.match(text, /smooth/i)
	assert.match(text, /continuous.*ribbon formation/i)
	assert.match(text, /not measured laboratory performance/i)
}
const search = readFileSync('src/ui/header/product-search/search.ts', 'utf8')
const expression = search.match(/claroplastSearch:\s*([\s\S]*?),\s*lang,/)[1]
const predicate = Function('lang', 'q', 'return ' + expression)
for (const q of [
	'Claroplast',
	'Histology wax',
	'Histology paraffin',
	'Histology wax with polymer',
	'Polymer-modified wax',
	'Paraffin pellets',
	'Paraffin granules',
	'With polymer',
	'Polymer-modified',
	'Polymers',
	'Synthetic polymers',
	'Added synthetic polymers',
	'Histology paraffin pellets',
	'Histology paraffin granules',
])
	assert.equal(predicate('en', q), true, q)
for (const q of ['LABEX', 'formaldehyde', 'ethanol', 'wax ethanol'])
	assert.equal(predicate('en', q), false, q)
assert.equal(predicate('hr', 'Claroplast'), false)
const query = search.match(/const PRODUCT_SEARCH_QUERY = groq`([\s\S]*?)`/)[1]
assert.match(query, /hidden != true/)
assert.match(query, /table\[\]\.code match/)
assert.match(query, /\$claroplastSearch/)
assert.match(query, /claroplast-a-2-kg/)
assert.match(query, /claroplast-a-10-kg/)
console.log(
	'PASS: distinct SKU metadata, approved form, five qualitative benefits, no measured or guaranteed claims, search intent/language/identity scope.',
)
