import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'

const source = ts.transpileModule(
	readFileSync('src/lib/public-page-fetch.ts', 'utf8').replace(
		"import { SITE_URL } from './site-url'",
		"const SITE_URL = 'https://claroprom.com'",
	),
	{
		compilerOptions: {
			module: ts.ModuleKind.ESNext,
			target: ts.ScriptTarget.ES2022,
		},
	},
).outputText
const { fetchPublicPage } = await import(
	'data:text/javascript;base64,' + Buffer.from(source).toString('base64')
)
const original = globalThis.fetch
let calls = []
try {
	globalThis.fetch = async (url, options) => {
		calls.push(String(url))
		assert.equal(options.redirect, 'manual')
		return new Response('Public page', { status: 200 })
	}
	assert.equal((await fetchPublicPage('/eu-projekt-iso-13485')).status, 200)
	for (const path of [
		'https://other.example/',
		'//other.example/',
		'/api/contact',
		'/admin',
		'/_next/image',
		'/x/../api/contact',
		'/foo.md',
		'/%61pi/contact',
		'/foo%2emd',
		'/%2561pi/contact',
	]) {
		const n = calls.length
		await assert.rejects(fetchPublicPage(path))
		assert.equal(calls.length, n)
	}
	globalThis.fetch = async () =>
		new Response(null, {
			status: 302,
			headers: { location: 'https://other.example/' },
		})
	await assert.rejects(fetchPublicPage('/redirect'))
	let n = 0
	globalThis.fetch = async () =>
		++n === 1
			? new Response(null, { status: 301, headers: { location: '/products' } })
			: new Response('Products')
	assert.equal((await fetchPublicPage('/old-products')).status, 200)
	assert.equal(n, 2)
	n = 0
	globalThis.fetch = async () => {
		n++
		return new Response(null, { status: 302, headers: { location: '/loop' } })
	}
	await assert.rejects(fetchPublicPage('/loop'))
	assert.equal(n, 6)
} finally {
	globalThis.fetch = original
}
console.log(
	'PASS: public content fetch, canonical host, no private/API/recursive routes, external redirects rejected, internal redirects preserved, redirect loops bounded. No network.',
)
