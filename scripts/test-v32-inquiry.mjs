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
const outreachUri = uri(readFileSync('src/lib/outreach.ts', 'utf8'))
const rateLimitUri = uri(readFileSync('src/lib/contact-rate-limit.ts', 'utf8'))
const itemUri = uri(
	readFileSync('src/lib/inquiry-items.ts', 'utf8').replace(
		"'./outreach'",
		JSON.stringify(outreachUri),
	),
)
const {
	inquiryRows,
	validateRequestedItems,
	resolveInquiryItems,
	inquiryEmailLines,
} = await import(itemUri)
const product = {
	_id: 'product-id',
	title: 'Ethanol 96% v/v',
	language: 'en',
	metadata: { slug: { current: 'ethanol-test' } },
	table: [{ _key: 'row', code: 'CPE96I', format: '1 L' }],
}
const requested = validateRequestedItems([
	{
		productId: 'product-id',
		rowKey: 'row',
		quantity: 4,
		name: 'FAKE NAME',
		code: 'FAKE',
		packaging: 'FAKE',
	},
])
const resolved = resolveInquiryItems(requested, [product])
assert.equal(resolved[0].code, 'CPE96I')
assert.equal(resolved[0].quantity, 4)
assert.match(inquiryEmailLines(resolved), /1 L.*4 pack\(s\)/)
assert.doesNotMatch(inquiryEmailLines(resolved), /FAKE/)
for (const invalid of [
	[],
	Array(51).fill(requested[0]),
	[...requested, ...requested],
	[{ ...requested[0], quantity: 0 }],
	[{ ...requested[0], quantity: 1.5 }],
	[{ ...requested[0], quantity: '4' }],
	[{ ...requested[0], quantity: 10001 }],
])
	assert.throws(() => validateRequestedItems(invalid))
for (const p of [
	{ ...product, hidden: true },
	{ ...product, language: 'hr' },
	{ ...product, table: [{ _key: 'row', code: '', format: '1 L' }] },
	{ ...product, table: [{ _key: 'row', code: 'CPE96I', format: '' }] },
])
	assert.throws(() => resolveInquiryItems(requested, [p]))
assert.throws(() =>
	resolveInquiryItems([{ ...requested[0], rowKey: 'different' }], [product]),
)
assert.throws(() =>
	resolveInquiryItems([{ ...requested[0], productId: 'missing' }], [product]),
)
for (const [slug, code, pack] of [
	['claroplast-a-2-kg', 'CP00CL2', '2 kg'],
	['claroplast-a-10-kg', 'CP00CLP', '10 kg'],
]) {
	const rows = inquiryRows({
		...product,
		metadata: { slug: { current: slug } },
		table: [{ _key: 'row', code: '345', format: '' }],
	})
	assert.equal(rows[0].code, code)
	assert.equal(rows[0].packaging, pack)
}

// Isolated route fixture: records sends, never opens a provider connection.
globalThis.__v32Sends = []
globalThis.__v32Queries = 0
const responseUri = uri(
	`export const NextResponse={json:(data,options)=>new Response(JSON.stringify(data),{status:options?.status||200,headers:{'Content-Type':'application/json'}})}`,
)
const resendUri = uri(
	`export class Resend { constructor(){this.emails={send:async message=>{globalThis.__v32Sends.push(message);return {data:{id:'isolated-test-id'},error:null}}}} }`,
)
globalThis.__v32Products = [product]
const clientUri = uri(
	`export const client={withConfig:()=>({fetch:async()=>{globalThis.__v32Queries++;return globalThis.__v32Products}})}`,
)
const route = readFileSync('src/app/(frontend)/api/contact/route.ts', 'utf8')
	.replace("'next/server'", JSON.stringify(responseUri))
	.replace("'resend'", JSON.stringify(resendUri))
	.replace("'@/lib/contact-rate-limit'", JSON.stringify(rateLimitUri))
	.replace("'@/lib/outreach'", JSON.stringify(outreachUri))
	.replace("'@/lib/inquiry-items'", JSON.stringify(itemUri))
	.replace("'@/sanity/lib/client'", JSON.stringify(clientUri))
const { POST } = await import(uri(route))
process.env.RESEND_API_KEY = 'isolated-test-not-a-key'
process.env.CONTACT_FORM_TO = 'claroprom@gmail.com'
process.env.CONTACT_FORM_FROM = 'CLARO-PROM <test@example.com>'
const valid = {
	name: 'Test <script>',
	email: 'test@example.com',
	request: 'Test inquiry',
	privacy: true,
	website: '',
	inquiry: 'quote',
	items: [...requested],
	company: 'Example company',
	country: 'Croatia',
}
async function post(body, origin = 'https://claroprom.com') {
	return POST(
		new Request('https://claroprom.com/api/contact', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', Origin: origin },
			body: JSON.stringify(body),
		}),
	)
}
assert.equal((await post(valid)).status, 200)
assert.equal(globalThis.__v32Sends.length, 1)
assert.match(
	globalThis.__v32Sends[0].text,
	/Catalogue No.: CPE96I.*Quantity: 4 pack/,
)
assert.ok(globalThis.__v32Sends[0].html.includes('&lt;script&gt;'))
assert.equal(globalThis.__v32Sends[0].to[0], 'claroprom@gmail.com')
assert.equal(
	(
		await post({
			...valid,
			inquiry: 'distributor',
			items: undefined,
			formId: 'distributor-inquiry',
			markets: 'EU',
		})
	).status,
	200,
)
assert.equal(
	(
		await post({
			...valid,
			items: undefined,
			product: 'Existing single product',
		})
	).status,
	200,
)
for (const body of [
	{ ...valid, privacy: false },
	{ ...valid, website: 'bot.example' },
	{ ...valid, items: [{ ...requested[0], quantity: -1 }] },
	{ ...valid, items: [{ ...requested[0], productId: 'unknown' }] },
	{ ...valid, formId: {} },
	{ ...valid, email: 'bad-email' },
	{
		...valid,
		inquiry: 'distributor',
		items: undefined,
		formId: 'distributor-inquiry',
		markets: '',
	},
])
	assert.equal((await post(body)).status, 422)
assert.equal((await post(valid, 'https://other.example')).status, 403)
assert.equal((await post({ ...valid, request: 'x'.repeat(40001) })).status, 413)
assert.equal(globalThis.__v32Sends.length, 3)
console.log(
	'PASS: SKU identity, forged labels, pack quantities, duplicates, unavailable products, consent, honeypot, body limits, cross-origin, HTML escaping, distributor/RFQ/single route sends (isolated).',
)
