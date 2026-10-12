import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
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
const {
	CLAROPLAST_PACKS,
	inquiryHref,
	contactContext,
	changeInquiryContext,
	claroplastPack,
	hasPackSize,
	relevantProducts,
} = await import(outreachUri)
assert.deepEqual(
	CLAROPLAST_PACKS.map((p) => p.code),
	['CP00CL2', 'CP00CLP'],
)
assert.equal(CLAROPLAST_PACKS.length, 2)
assert.equal(claroplastPack('claroplast-5-x-2-kg'), undefined)
assert.equal(hasPackSize([{ format: '' }, { format: '  ' }]), false)
assert.equal(hasPackSize([{ format: null }, { format: '1 L' }]), true)
for (const type of [
	'quote',
	'distributor',
	'documentation',
	'sample',
	'meeting',
]) {
	const url = new URL(
		inquiryHref(type, 'Claroplast — 2 kg', 'CP00CL2'),
		'https://claroprom.com',
	)
	const c = contactContext(url.searchParams)
	assert.equal(c.type, type)
	assert.match(
		c.request,
		new RegExp(
			type === 'meeting'
				? 'MEDICA'
				: type === 'quote'
					? 'Product quote'
					: type === 'documentation'
						? 'Technical documentation'
						: type === 'distributor'
							? 'Distributor'
							: 'Sample',
		),
	)
	if (type !== 'meeting') {
		assert.match(c.topic, /CP00CL2/)
		assert.match(c.topic, /Claroplast/)
	}
}
assert.equal(
	contactContext(new URLSearchParams('code=CP00CLP&product=Claroplast')).type,
	'quote',
)
assert.equal(
	contactContext(new URLSearchParams('product=Distributor+inquiry')).type,
	'distributor',
)
assert.equal(
	contactContext(new URLSearchParams('inquiry=unknown')).type,
	'general',
)
const source = readFileSync('src/content/medica-2026.ts', 'utf8').replace(
	"'@/lib/outreach'",
	JSON.stringify(outreachUri),
)
const {
	MEDICA,
	preparedMedicaPost,
	showMedicaPromotion,
	medicaSitemapEntries,
	includeMedicaPost,
} = await import(uri(source))
const releaseDate = MEDICA.publishDate
assert.equal(releaseDate, '2026-10-12')
MEDICA.publishDate = null
assert.equal(preparedMedicaPost('production'), null)
assert.equal(includeMedicaPost([], 'production').length, 0)
assert.equal(includeMedicaPost([], 'preview').length, 1)
assert.equal(preparedMedicaPost('preview').publishDate, undefined)
assert.equal(MEDICA.stand, 'Hall 1 / A03')
assert.equal(MEDICA.dates, '16–19 November 2026')
assert.equal(
	showMedicaPromotion(new Date('2026-11-19T22:59:59Z'), 'preview'),
	true,
)
assert.equal(
	showMedicaPromotion(new Date('2026-11-19T23:00:00Z'), 'preview'),
	false,
)
assert.equal(showMedicaPromotion(new Date('2026-10-12'), 'production'), false)
assert.match(
	preparedMedicaPost('preview').contentPlainText,
	/OEM\/private-label/,
)
const matches = relevantProducts(
	{ title: 'Claroclear Xylene Substitute, 1 L' },
	[
		{ title: 'Claroclear Xylene Substitute, 10 L' },
		{ title: 'Claroclear Xylene, 1 L' },
		{ title: 'Claromount, 50 mL' },
	],
	4,
)
assert.equal(matches.length, 1)
assert.equal(
	relevantProducts(
		{ slug: 'claroplast-a-2-kg' },
		[{ slug: '/products/en/claroplast-a-10-kg' }, { slug: '/products/foo' }],
		4,
	).length,
	1,
)

// Execute the real backend with a fake mail adapter: no credentials or external sends.
let sent = [],
	sendError = null
const code = ts.transpileModule(
	readFileSync('src/app/(frontend)/api/contact/route.ts', 'utf8'),
	{
		compilerOptions: {
			module: ts.ModuleKind.CommonJS,
			target: ts.ScriptTarget.ES2022,
		},
	},
).outputText
const sandbox = {
	exports: {},
	process: {
		env: {
			RESEND_API_KEY: 'test-only',
			CONTACT_FORM_TO: 'test@example.invalid',
			CONTACT_FORM_FROM: 'test@example.invalid',
		},
	},
	console: { error: () => {} },
	require: (name) =>
		name === 'next/server'
			? {
					NextResponse: {
						json: (b, o) =>
							new Response(JSON.stringify(b), { status: o?.status || 200 }),
					},
				}
			: name === 'resend'
				? {
						Resend: class {
							emails = {
								send: async (payload) => {
									sent.push(payload)
									return { error: sendError }
								},
							}
						},
					}
				: name === '@/lib/outreach'
					? awaitOutreach
					: null,
}
const awaitOutreach = await import(outreachUri)
vm.runInNewContext(code, sandbox)
const post = (body) =>
	sandbox.exports.POST(
		new Request('https://preview.example/api/contact', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(body),
		}),
	)
const base = {
	name: 'Example Company',
	email: 'buyer@example.invalid',
	request: 'Please send information.',
	privacy: true,
	website: '',
	phone: '',
}
for (const type of [
	'quote',
	'distributor',
	'documentation',
	'sample',
	'meeting',
	'general',
]) {
	const r = await post({
		...base,
		inquiry: type,
		product: type === 'meeting' ? 'MEDICA 2026' : 'Claroplast 2 kg (CP00CL2)',
	})
	assert.equal(r.status, 200)
	assert.equal(sent.at(-1).text.includes('Inquiry type:'), true)
}
const count = sent.length
for (const bad of [
	{ ...base, privacy: false },
	{ ...base, email: 'bad' },
	{ ...base, website: 'spam' },
	{ ...base, inquiry: 'quote', product: '' },
	{ ...base, name: 12 },
	{ ...base, request: '' },
]) {
	assert.equal((await post(bad)).status, 422)
}
assert.equal(sent.length, count)
await post({ ...base, name: '<script>alert(1)</script>' })
assert.match(sent.at(-1).html, /&lt;script&gt;/)
assert.equal(sent.at(-1).html.includes('<script>'), false)
sendError = { message: 'Mock delivery failure' }
assert.equal((await post(base)).status, 502)
assert.deepEqual(medicaSitemapEntries([], 'https://claroprom.com'), [])
MEDICA.publishDate = '2026-10-12'
assert.equal(
	medicaSitemapEntries([], 'https://claroprom.com')[0].url,
	'https://claroprom.com/blog/en/' + MEDICA.slug,
)
assert.deepEqual(
	medicaSitemapEntries(
		[{ url: 'https://claroprom.com/blog/en/' + MEDICA.slug }],
		'https://claroprom.com',
	),
	[],
)
assert.equal(preparedMedicaPost('production').publishDate, '2026-10-12')

MEDICA.publishDate = releaseDate
for (const env of ['preview', 'production']) {
	assert.equal(preparedMedicaPost(env).publishDate, releaseDate)
	assert.equal(includeMedicaPost([], env).length, 1)
	assert.equal(medicaSitemapEntries([], 'https://claroprom.com').length, 1)
	assert.equal(showMedicaPromotion(new Date('2026-11-19T22:59:59Z'), env), true)
	assert.equal(
		showMedicaPromotion(new Date('2026-11-19T23:00:00Z'), env),
		false,
	)
	assert.ok(preparedMedicaPost(env))
	const cms = {
		_id: 'existing-cms-post',
		title: MEDICA.title,
		metadata: { slug: { current: MEDICA.slug } },
	}
	assert.deepEqual(includeMedicaPost([cms], env), [cms])
}
for (const [from, to, product] of [
	['general', 'quote', ''],
	['quote', 'general', 'Claroplast 2 kg (CP00CL2)'],
	['distributor', 'meeting', 'Claroplast 10 kg (CP00CLP)'],
	['meeting', 'quote', ''],
]) {
	const original = contactContext(
		new URLSearchParams({ inquiry: from, ...(product ? { product } : {}) }),
	)
	const changed = changeInquiryContext(original, to)
	assert.equal(changed.type, to)
	if (product) assert.equal(changed.topic, original.topic)
	if (to === 'quote' && !product) assert.equal(changed.topic, '')
	if (to === 'meeting') assert.match(changed.request, /MEDICA/)
	if (to === 'quote') assert.match(changed.request, /Product quote/)
	if (to === 'general') assert.equal(changed.request, '')
	const edited = {
		...original,
		topic: 'User product CP00CL2',
		request: 'User message: preserve this.',
	}
	const preserved = changeInquiryContext(edited, to)
	assert.equal(preserved.topic, edited.topic)
	assert.equal(preserved.request, edited.request)
}

const legacyDistributor = contactContext(
	new URLSearchParams('product=Distributor+inquiry'),
)
assert.equal(legacyDistributor.type, 'distributor')
assert.equal(legacyDistributor.topic, '')
const automatic = contactContext(
	new URLSearchParams('inquiry=quote&product=Claroplast&code=CP00CL2'),
)
const extended = {
	...automatic,
	request: automatic.request + '\nMy actual requirements.',
}
const switched = changeInquiryContext(extended, 'sample')
assert.match(switched.request, /^Sample request/)
assert.match(switched.request, /My actual requirements\.$/)
const editedProduct = changeInquiryContext(
	{ ...automatic, topic: 'User product CP00CLP' },
	'documentation',
)
assert.match(editedProduct.request, /User product CP00CLP/)
assert.equal(editedProduct.request.includes('CP00CL2'), false)
sendError = null
const general = await post({
	...base,
	inquiry: 'general',
	product: '',
	phone: '',
})
assert.equal(general.status, 200)
assert.equal(sent.at(-1).replyTo, base.email)
assert.match(sent.at(-1).text, /Inquiry type: General inquiry/)
for (const type of ['quote', 'general', 'meeting', 'distributor']) {
	await post({ ...base, inquiry: type, product: 'Claroplast CP00CL2' })
	assert.ok(
		sent
			.at(-1)
			.text.includes('Inquiry type: ' + awaitOutreach.INQUIRY_TYPES[type]),
	)
	assert.match(sent.at(-1).text, /CP00CL2/)
}
console.log(
	'PASS: confirmed packs, all inquiry contexts, empty format, relevant families, MEDICA draft/dates/expiry, optional phone, privacy/email/spam validation and mocked email success/failure. No real email sent.',
)
