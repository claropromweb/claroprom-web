/**
 * One-shot migration: backfill `language: 'hr'` on every `page`, `blog.post`
 * and `navigation` document created before i18n was enabled.
 *
 * Usage (from claroprom-web/):
 *
 *   SANITY_WRITE_TOKEN="<token with Editor permissions>" \
 *     npx tsx scripts/migrate-add-language.ts
 *
 * Generate a write token at:
 *   https://www.sanity.io/manage → your project → API → Tokens → "Add API token"
 *   (give it Editor permissions; keep it secret).
 *
 * The script reads `NEXT_PUBLIC_SANITY_PROJECT_ID` and
 * `NEXT_PUBLIC_SANITY_DATASET` from `.env.local`.
 */
import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@sanity/client'

import { DEFAULT_LANG } from '../src/lib/i18n'

const TARGET_TYPES = ['page', 'blog.post', 'navigation'] as const

function loadDotEnvLocal() {
	const envPath = path.resolve(process.cwd(), '.env.local')
	if (!fs.existsSync(envPath)) return
	for (const raw of fs.readFileSync(envPath, 'utf8').split('\n')) {
		const line = raw.trim()
		if (!line || line.startsWith('#')) continue
		const eq = line.indexOf('=')
		if (eq === -1) continue
		const key = line.slice(0, eq).trim()
		let value = line.slice(eq + 1).trim()
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1)
		}
		if (!(key in process.env)) process.env[key] = value
	}
}

loadDotEnvLocal()

async function run() {
	const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
	const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'
	const token =
		process.env.SANITY_WRITE_TOKEN ??
		process.env.SANITY_API_TOKEN ??
		process.env.SANITY_API_READ_TOKEN

	if (!projectId) {
		throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local')
	}
	if (!token) {
		throw new Error(
			'Missing SANITY_WRITE_TOKEN. Create an Editor token in the Sanity dashboard and pass it via env, e.g.:\n  SANITY_WRITE_TOKEN="..." npx tsx scripts/migrate-add-language.ts',
		)
	}

	const client = createClient({
		projectId,
		dataset,
		token,
		apiVersion: '2024-01-01',
		useCdn: false,
	})

	console.log(`Project: ${projectId}, dataset: ${dataset}`)

	const docs = await client.fetch<
		Array<{ _id: string; _type: string; _rev: string }>
	>(`*[_type in $types && !defined(language)]{ _id, _type, _rev }`, {
		types: [...TARGET_TYPES],
	})

	if (!docs.length) {
		console.log('Nothing to migrate — every document already has a language.')
		return
	}

	console.log(
		`Found ${docs.length} document(s) without a language field:\n${docs
			.map((d) => `  - ${d._type}: ${d._id}`)
			.join('\n')}\n`,
	)
	console.log(`Setting language = "${DEFAULT_LANG}" on each…`)

	let tx = client.transaction()
	for (const doc of docs) {
		tx = tx.patch(doc._id, (p) =>
			p.setIfMissing({ language: DEFAULT_LANG }).ifRevisionId(doc._rev),
		)
	}

	const result = await tx.commit({ visibility: 'async' })
	console.log(`Patched ${result.results.length} document(s). Done.`)
}

run().catch((err) => {
	console.error(err)
	process.exit(1)
})
