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
const outreach = uri(readFileSync('src/lib/outreach.ts', 'utf8'))
const { MEDICA } = await import(
	uri(
		readFileSync('src/content/medica-2026.ts', 'utf8').replace(
			"'@/lib/outreach'",
			JSON.stringify(outreach),
		),
	)
)
const date = MEDICA.publishDate
assert.ok(
	date && /^\d{4}-\d{2}-\d{2}$/.test(date),
	'A valid approved publication date is required before release.',
)
assert.equal(
	new Date(date + 'T12:00:00Z').toISOString().slice(0, 10),
	date,
	'Invalid publication calendar date.',
)
const parts = new Intl.DateTimeFormat('en-GB', {
	timeZone: 'Europe/Zagreb',
	year: 'numeric',
	month: '2-digit',
	day: '2-digit',
}).formatToParts(new Date())
const value = (type) => parts.find((part) => part.type === type).value
const today = value('year') + '-' + value('month') + '-' + value('day')
assert.equal(
	date,
	today,
	'Release date differs from today in Europe/Zagreb. Stop: update the date, commit, reverify Preview and obtain approval of the new SHA before merging.',
)
console.log(
	'PASS: planned publication date ' +
		date +
		' matches release day. This check does not authorize or deploy production.',
)
