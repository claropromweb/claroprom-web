import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import vm from 'node:vm'
import ts from 'typescript'
const require = createRequire(import.meta.url)
const React = require('react')
const { renderToStaticMarkup: render } = require('react-dom/server')
const { ImageConfigContext } = require('next/dist/shared/lib/image-config-context.shared-runtime')
const { imageConfigDefault } = require('next/dist/shared/lib/image-config')
const renderToStaticMarkup = element => render(React.createElement(ImageConfigContext.Provider, { value: { ...imageConfigDefault, remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io' }] } }, element))
const cache = new Map()
let candidates = []
const mocks = {
 'next-sanity': { groq: (s, ...v) => s.reduce((a, x, i) => a + x + (v[i] ?? ''), ''), stegaClean: x => x, PortableText: ({ value }) => React.createElement('p', null, value.flatMap(b => (b.children ?? []).map(c => c.text ?? '')).join(' ')) },
 '@/sanity/lib/live': { sanityFetchLive: async ({ query }) => query.includes("_type == 'product'") ? candidates : { url: '/kontakt' } },
 '@/lib/get-lang-server': { default: async () => 'hr', __esModule: true },
 '@/ui/modules': { Module: ({ as = 'section', children, ...props }) => React.createElement(as, props, children) },
 'sanity': { defineType: x => x, defineField: x => x, defineArrayMember: x => x },
}
function load(file) {
 if (cache.has(file)) return cache.get(file).exports
 const mod = { exports: {} }; cache.set(file, mod)
 const source = readFileSync(file, 'utf8')
 const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText
 const localRequire = name => {
  if (mocks[name]) return mocks[name]
  let target = name.startsWith('@/') ? path.resolve('src', name.slice(2)) : name.startsWith('.') ? path.resolve(path.dirname(file), name) : null
  if (target) { for (const ext of ['.ts', '.tsx']) { try { readFileSync(target + ext); return load(target + ext) } catch (e) { if (e.code !== 'ENOENT') throw e } } }
  return require(name)
 }
 vm.runInNewContext(`(function(require,module,exports){${code}\n})`, { console, process, URL, URLSearchParams })(localRequire, mod, mod.exports)
 return mod.exports
}
const Card = load(path.resolve('src/ui/modules/product/product-preview.tsx')).default
const Detail = load(path.resolve('src/ui/modules/product/product-content.tsx')).default
const block = text => ({ _type: 'block', children: [{ _type: 'span', text }] })
const image = { asset: { _id: 'image-34e609d84fcd96a456977d7137f9c9d7649b2bdd-1074x1074-webp', url: 'https://cdn.sanity.io/images/ddtwki7e/production/34e609d84fcd96a456977d7137f9c9d7649b2bdd-1074x1074.webp' }, alt: 'Approved fixture photograph' }
const base = { _id: 'fixture-only', language: 'en', title: 'A long existing catalogue product title to verify wrapping and complete accessible link text', slug: '/products/example', table: [{ _key: 'a', code: 'FIXTURE-A', format: '1 L' }, { _key: 'b', code: 'FIXTURE-B', format: '5 L' }] }
const plain = renderToStaticMarkup(React.createElement(Card, { product: base }))
assert.ok(!plain.includes('<img')); assert.ok(!plain.includes('<figure')); assert.match(plain, /FIXTURE-A, FIXTURE-B/); assert.match(plain, /1 L \/ 5 L/); assert.ok(!plain.includes('Short description'))
const withSummary = renderToStaticMarkup(React.createElement(Card, { product: { ...base, shortDescription: 'Approved fixture summary, explicitly supplied by the test.', image } }))
assert.match(withSummary, /Approved fixture summary/); assert.match(withSummary, /alt="Approved fixture photograph"/); assert.match(withSummary, /sizes=/); assert.match(withSummary, /fit%3Dmax|fit=max/); assert.match(withSummary, /loading="lazy"/)
const empty = renderToStaticMarkup(React.createElement(Card, { product: { ...base, table: [], shortDescription: '  ' } }))
assert.ok(!empty.includes('<dl')); assert.ok(!empty.includes('Catalogue No.'))
for (const [slug, code] of [['claroplast-a-2-kg','CP00CL2'], ['claroplast-a-10-kg','CP00CLP']]) { const html = renderToStaticMarkup(React.createElement(Card, { product: { ...base, slug, table: [{code:'legacy',format:''}] } })); assert.match(html, new RegExp(code)); assert.ok(!html.includes('legacy')) }
const detailBase = { ...base, metadata: { slug: { current: 'example' } }, productType: 'ivd', manufacturerRole: 'manufacturer', category: { _id: 'cat', title_en: 'Fixture category', slug_en: { current: 'ivd-reagents' }, showInCatalog: true } }
const detailPlain = renderToStaticMarkup(await Detail({ product: detailBase, showRelated: false }))
assert.ok(!detailPlain.includes('<figure')); assert.ok(!detailPlain.includes('md:grid-cols-2')); assert.ok(!detailPlain.includes('Intended purpose')); assert.ok(!detailPlain.includes('IFU'))
assert.match(detailPlain, /inquiry=quote/); assert.match(detailPlain, /Request technical documentation/)
const populated = { ...detailBase, shortDescription: 'Approved short summary fixture.', description: [block('Approved detailed description fixture.')], intendedPurpose: [block('EXACT REGULATORY FIXTURE WORDING.')], image: { ...image, alt: '', caption: 'Representative pack caption fixture' }, gallery: [{ ...image, _key: 'first', caption: 'First gallery fixture' }, { ...image, _key: 'second', caption: 'Second gallery fixture' }], instructionsForUse: { asset: { url: 'https://example.invalid/fixture-only.pdf' } } }
const before = JSON.stringify(populated)
const detail = renderToStaticMarkup(await Detail({ product: populated, showRelated: false }))
assert.match(detail, /Approved short summary fixture/); assert.match(detail, /Approved detailed description fixture/); assert.match(detail, /EXACT REGULATORY FIXTURE WORDING/); assert.match(detail, /Instructions for Use/)
assert.ok(detail.indexOf('First gallery fixture') < detail.indexOf('Second gallery fixture')); assert.match(detail, /Representative pack caption fixture/); assert.match(detail, /alt="A long existing catalogue product/); assert.equal(JSON.stringify(populated), before)
const galleryOnly = renderToStaticMarkup(await Detail({ product: { ...detailBase, gallery: populated.gallery }, showRelated: false })); assert.match(galleryOnly, /First gallery fixture/); assert.ok(!galleryOnly.includes('Representative pack'))
const invalidRows = renderToStaticMarkup(await Detail({ product: { ...detailBase, table: [{ _key:'empty',code:' ',format:' ' }] }, showRelated: false })); assert.ok(!invalidRows.includes('<table'))
const Photo = load(path.resolve('src/ui/modules/product/product-photo.tsx')).default
const cropped = renderToStaticMarkup(React.createElement(Photo, { image: { ...image, crop: { top: .1, bottom: .1, left: 0, right: 0 }, hotspot: {x:.5,y:.5,width:.2,height:.2} }, title:'Fixture',width:640,sizes:'90vw' })); assert.match(cropped, /height="512"/); assert.match(cropped, /rect%3D|rect=/)
const schema = load(path.resolve('src/sanity/schemaTypes/documents/product.ts')).default
const summary = schema.fields.find(f=>f.name==='shortDescription');let required=false,warning=false;const rule={max(){return this},warning(){warning=true;return this},required(){required=true;return this}};summary.validation(rule);assert.equal(required,false);assert.equal(warning,true);assert.equal(schema.fields.filter(f=>f.name==='image').length,1);assert.equal(schema.fields.filter(f=>f.name==='gallery').length,1);assert.equal(schema.fields.find(f=>f.name==='image').options.hotspot,true)
if(process.env.CATALOGUE_FIXTURE_OUTPUT){mkdirSync(process.env.CATALOGUE_FIXTURE_OUTPUT,{recursive:true});writeFileSync(path.join(process.env.CATALOGUE_FIXTURE_OUTPUT,'fixture.html'),`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><ul class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">${plain}${withSummary}${empty}</ul>${detail}</body></html>`)}
console.log('PASS: actual card/detail rendering, optional summaries, missing images/rows/docs, codes, multi-pack display, separate intended purpose, gallery order/captions/lazy images, crop/hotspot, optional schema. Isolated fixtures only; no CMS writes or emails.')
