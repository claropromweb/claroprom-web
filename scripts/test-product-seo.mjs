import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'

const source = readFileSync('src/lib/product-seo.ts', 'utf8')
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } })
const { productDescription, productDescriptionText, withApprovedClaroplastCopy, claroplastCopy } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)
const block = (text) => ({ _type: 'block', children: [{ _type: 'span', text }] })
const base = { title: 'Existing reagent', description: [block('Visible description.')], metadata: { description: 'Approved SEO description.' }, manufacturerRole: 'manufacturer', table: [{code: 'ABC', format: '1 L'}] }
assert.equal(productDescription(base), 'Approved SEO description.')
assert.equal(productDescription({...base, metadata: {description: '  '}}), 'Visible description.')
assert.equal(productDescription({...base, metadata: {}, description: []}), 'Existing reagent Code: ABC. Pack size: 1 L. Manufactured by Claro-prom.')
assert.equal(productDescription({...base, metadata: {}, description: [], manufacturerRole: 'distributor'}), 'Existing reagent Code: ABC. Pack size: 1 L.')
assert.equal(productDescriptionText([{_type:'image', caption:'Not visible product copy'}, {_type:'block', children:[{_type:'span',text:'Polymer-'},{_type:'span',text:'modified\n wax'}], markDefs:[{text:'Ignore annotations'}]},block('For embedding.')]), 'Polymer-modified wax For embedding.')
assert.equal(claroplastCopy('unrelated-product'), undefined)
assert.equal(withApprovedClaroplastCopy(base), base)
for (const [pack,code] of [['10','6666'],['2','345']]) {
 const original = {...base, language:'en', metadata:{slug:{current:`claroplast-a-${pack}-kg`},noIndex:false},table:[{code}],intendedPurpose:[block('Existing intended use')],shelfLife:'unchanged'}
 const before=JSON.stringify(original)
 const result=withApprovedClaroplastCopy(original)
 assert.equal(result.title,`Claroplast Histology Embedding Wax – ${pack} kg`)
 assert.equal(result.metadata.title,`Claroplast Histology Embedding Wax, ${pack} kg | CLARO-PROM`)
 assert.equal(result.metadata.slug,original.metadata.slug)
 assert.equal(result.table,original.table)
 assert.equal(result.intendedPurpose,original.intendedPurpose)
 assert.equal(result.shelfLife,'unchanged')
 assert.equal(result.manufacturerRole,'manufacturer')
 assert.equal(JSON.stringify(original),before)
 assert.match(productDescription(result),new RegExp(`${pack} kg pack\\.$`))
 assert.match(productDescriptionText(result.description),/manufactured by CLARO-PROM d.o.o. in Croatia, European Union/)
 assert.equal(withApprovedClaroplastCopy({...original,language:'hr'}).title,base.title)
}
console.log('PASS: description priority, whitespace/Portable Text extraction, unchanged safe fallback, distributor safety, exact Claroplast copy, URL/code/regulatory preservation, immutable data and language scope.')
