import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'

const source = ts.transpileModule(
	readFileSync('src/lib/contact-rate-limit.ts', 'utf8'),
	{
		compilerOptions: {
			module: ts.ModuleKind.ESNext,
			target: ts.ScriptTarget.ES2022,
		},
	},
).outputText
const { contactRetryAfter } = await import(
	'data:text/javascript;base64,' + Buffer.from(source).toString('base64')
)
const saved = process.env.VERCEL
try {
	const headers = new Headers({ 'x-vercel-forwarded-for': '203.0.113.1' })
	delete process.env.VERCEL
	for (let i = 0; i < 40; i++) assert.equal(contactRetryAfter(headers, 1000), 0)
	process.env.VERCEL = '1'
	for (let i = 0; i < 30; i++) assert.equal(contactRetryAfter(headers, 1000), 0)
	assert.equal(contactRetryAfter(headers, 1000), 600)
	assert.equal(contactRetryAfter(headers, 2000), 599)
	assert.equal(
		contactRetryAfter(
			new Headers({ 'x-vercel-forwarded-for': '203.0.113.2' }),
			2000,
		),
		0,
	)
	assert.equal(
		contactRetryAfter(new Headers({ 'x-forwarded-for': '203.0.113.1' }), 2000),
		0,
	)
	assert.equal(
		contactRetryAfter(
			new Headers({ 'x-vercel-forwarded-for': 'spoofed' }),
			2000,
		),
		0,
	)
	assert.equal(contactRetryAfter(headers, 601000), 0)
	const ipv6 = new Headers({ 'x-vercel-forwarded-for': '2001:db8::1' })
	for (let i = 0; i < 30; i++) assert.equal(contactRetryAfter(ipv6, 601000), 0)
	assert.equal(contactRetryAfter(ipv6, 601000), 600)
} finally {
	if (saved === undefined) delete process.env.VERCEL
	else process.env.VERCEL = saved
}
console.log(
	'PASS: generous per-client quota, isolation, expiry/recovery, IPv6 and trusted Vercel header handling. No network or real emails.',
)
