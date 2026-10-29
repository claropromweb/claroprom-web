import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'

const uri = (s) =>
	'data:text/javascript;base64,' +
	Buffer.from(
		ts.transpileModule(s, {
			compilerOptions: {
				module: ts.ModuleKind.ESNext,
				target: ts.ScriptTarget.ES2022,
			},
		}).outputText,
	).toString('base64')
const outreach = uri(readFileSync('src/lib/outreach.ts', 'utf8'))
const rateLimit = uri(readFileSync('src/lib/contact-rate-limit.ts', 'utf8'))
const items = uri(
	readFileSync('src/lib/inquiry-items.ts', 'utf8').replace(
		"'./outreach'",
		JSON.stringify(outreach),
	),
)
const response = uri(
	`export const NextResponse={json:(body,options)=>new Response(JSON.stringify(body),{status:options?.status||200,headers:options?.headers})}`,
)
const provider = uri(
	`export class Resend {constructor(){this.emails={send:async message=>{globalThis.__v34Sends.push(message);if(globalThis.__v34Mode==='throw')throw Error('sensitive fixture content');if(globalThis.__v34Mode==='reject')return {data:null,error:{name:'validation_error',message:'sensitive fixture content'}};if(globalThis.__v34Mode==='missing')return {data:null,error:null};return {data:{id:'mock-message-'+globalThis.__v34Sends.length},error:null}}}}}`,
)
const sanity = uri(
	`export const client={withConfig:()=>({fetch:async()=>globalThis.__v34Products})}`,
)
globalThis.__v34Sends = []
globalThis.__v34Mode = 'ok'
globalThis.__v34Logs = []
globalThis.__v34Log = (...values) => globalThis.__v34Logs.push(values)
globalThis.__v34Products = [
	{
		_id: 'wax',
		title: 'Claroplast a 2 kg',
		language: 'en',
		metadata: { slug: { current: 'claroplast-a-2-kg' } },
		table: [{ _key: 'r', code: 'CP00CL2', format: '2 kg' }],
	},
	{
		_id: 'ethanol',
		title: 'Ethanol 96% v/v, IVD Reagent, 1 L',
		language: 'en',
		metadata: { slug: { current: 'ethanol-96-v-v-cpe96i' } },
		table: [{ _key: 'r', code: 'CPE96I', format: '1 L' }],
	},
	{
		_id: 'fixative',
		title: '4% NB Formaldehyde Solution, 1 L',
		language: 'en',
		metadata: { slug: { current: '4-nb-formaldehyde-solution-cp00f4' } },
		table: [{ _key: 'r', code: 'CP00F4', format: '1 L' }],
	},
	{
		_id: 'labex',
		title: 'LABEX A, 1 L',
		language: 'en',
		metadata: { slug: { current: 'labex-a-a-1000-ml' } },
		table: [{ _key: 'r', code: 'CP00LA1', format: '1 L' }],
	},
]
let source = readFileSync('src/app/(frontend)/api/contact/route.ts', 'utf8')
	.replace("'next/server'", JSON.stringify(response))
	.replace("'resend'", JSON.stringify(provider))
	.replace("'@/lib/contact-rate-limit'", JSON.stringify(rateLimit))
	.replace("'@/lib/outreach'", JSON.stringify(outreach))
	.replace("'@/lib/inquiry-items'", JSON.stringify(items))
	.replace("'@/sanity/lib/client'", JSON.stringify(sanity))
	.replaceAll('console.error', 'globalThis.__v34Log')
	.replaceAll('console.info', 'globalThis.__v34Log')
const { POST } = await import(uri(source))
process.env.VERCEL_ENV = 'production'
process.env.RESEND_API_KEY = 'mock-only-not-a-key'
process.env.CONTACT_FORM_TO = 'claroprom@gmail.com'
process.env.CONTACT_FORM_FROM = 'CLARO-PROM Website <forms@send.claroprom.com>'
const base = {
	name: 'Synthetic company',
	email: 'buyer+rfq@international.example',
	request: 'Controlled mocked inquiry',
	privacy: true,
	website: '',
	company: 'Synthetic distributor',
	country: 'Croatia',
	markets: 'EU',
}
const post = (body, headers = {}) =>
	POST(
		new Request('https://claroprom.com/api/contact', {
			method: 'POST',
			headers: {
				Origin: 'https://claroprom.com',
				'Content-Type': 'application/json',
				...headers,
			},
			body: JSON.stringify(body),
		}),
	)
for (const body of [
	{ ...base, inquiry: 'general' },
	{ ...base, inquiry: 'quote', product: 'Claroplast CP00CL2' },
	{ ...base, inquiry: 'distributor', formId: 'distributor-inquiry' },
	{ ...base, inquiry: 'meeting', product: 'MEDICA 2026' },
	{
		...base,
		inquiry: 'quote',
		items: globalThis.__v34Products.map((p, i) => ({
			productId: p._id,
			rowKey: 'r',
			quantity: [3, 2, 1, 1][i],
			code: 'FORGED',
			name: 'FORGED',
		})),
	},
]) {
	const count = globalThis.__v34Sends.length,
		r = await post(body)
	assert.equal(r.status, 200)
	assert.match((await r.json()).messageId, /^mock-message-/)
	assert.equal(globalThis.__v34Sends.length, count + 1)
	const m = globalThis.__v34Sends.at(-1)
	assert.deepEqual(m.to, ['claroprom@gmail.com'])
	assert.equal(m.from, process.env.CONTACT_FORM_FROM)
	assert.equal(m.replyTo, base.email)
	assert.match(m.text, /Synthetic company/)
	assert.ok(!m.cc && !m.bcc)
}
const rfq = globalThis.__v34Sends.at(-1).text
for (const [code, pack, qty] of [
	['CP00CL2', '2 kg', 3],
	['CPE96I', '1 L', 2],
	['CP00F4', '1 L', 1],
	['CP00LA1', '1 L', 1],
])
	assert.match(
		rfq,
		new RegExp(
			`Catalogue No.: ${code}.*Pack size: ${pack}.*Quantity: ${qty} pack`,
		),
	)
assert.doesNotMatch(rfq, /FORGED/)
for (const to of [
	'claropromweb@gmail.com',
	'claroprom@gmail.com,claropromweb@gmail.com',
]) {
	process.env.CONTACT_FORM_TO = to
	const n = globalThis.__v34Sends.length
	assert.equal((await post(base)).status, 503)
	assert.equal(globalThis.__v34Sends.length, n)
}
process.env.CONTACT_FORM_TO = 'claroprom@gmail.com'
for (const from of [
	'Claroprom <onboarding@resend.dev>',
	'onboarding@RESEND.DEV',
	'bad sender',
	'Name\r\nBcc: victim@example.com <forms@send.claroprom.com>',
]) {
	process.env.CONTACT_FORM_FROM = from
	const n = globalThis.__v34Sends.length
	assert.equal((await post(base)).status, 503)
	assert.equal(globalThis.__v34Sends.length, n)
}
process.env.CONTACT_FORM_FROM = 'CLARO-PROM Website <forms@send.claroprom.com>'
for (const key of ['RESEND_API_KEY', 'CONTACT_FORM_TO', 'CONTACT_FORM_FROM']) {
	const saved = process.env[key]
	delete process.env[key]
	assert.equal((await post(base)).status, 500)
	process.env[key] = saved
}
for (const email of [
	'bad-email',
	'victim@example.com\r\nBcc:other@example.com',
	'<buyer@example.com>',
	'buyer@example.com,other@example.com',
])
	assert.equal((await post({ ...base, email })).status, 422)
for (const mode of ['reject', 'missing', 'throw']) {
	globalThis.__v34Mode = mode
	assert.equal((await post(base)).status, mode === 'throw' ? 500 : 502)
}
assert.doesNotMatch(
	JSON.stringify(globalThis.__v34Logs),
	/sensitive fixture content|buyer\+rfq|mock-only-not-a-key/,
)
for (const file of [
	'src/ui/modules/form-module/contact-form.tsx',
	'src/ui/inquiry/business-form.tsx',
]) {
	const form = readFileSync(file, 'utf8')
	assert.match(form, /if \([^)]*\.current\) return/)
	assert.match(form, /finally/)
	assert.match(form, /if \(!(?:res|response)\.ok\)/)
}
console.log(
	'PASS: five inquiry paths, canonical four-SKU payload, sole production recipient, From/Reply-To, fail-closed configuration, malformed headers, missing provider ID/rejection/network failure, safe logs and existing duplicate-send locks. Zero real emails.',
)

const previousVercel = process.env.VERCEL
try {
	process.env.VERCEL = '1'
	globalThis.__v34Mode = 'ok'
	const headers = { 'x-vercel-forwarded-for': '203.0.113.99' }
	for (let i = 0; i < 30; i++) assert.equal((await post(base, headers)).status, 200)
	const count = globalThis.__v34Sends.length
	const limited = await post(base, headers)
	assert.equal(limited.status, 429)
	assert.ok(Number(limited.headers.get('Retry-After')) > 0)
	assert.equal(globalThis.__v34Sends.length, count)
	assert.equal((await post(base, { 'x-vercel-forwarded-for': '203.0.113.100' })).status, 200)
} finally {
	if (previousVercel === undefined) delete process.env.VERCEL
	else process.env.VERCEL = previousVercel
}
console.log('PASS: excess contact submissions return 429/Retry-After before provider call; another customer still sends. Mocked provider only.')
