import fs from 'node:fs'
import { spawnSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import { isDeepStrictEqual } from 'node:util'

const levels = ['info', 'low', 'moderate', 'high', 'critical']
export function fingerprint(v, lock) {
	if (!v || !levels.includes(v.severity) || !Array.isArray(v.via) || !v.via.length || !Array.isArray(v.nodes) || !v.nodes.length) throw Error('Invalid vulnerability entry')
	return {
		severity: v.severity,
		via: v.via.map(x => typeof x === 'string' ? x : { name: x.name, url: x.url, severity: x.severity, range: x.range }).sort((a,b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
		nodes: v.nodes.map(node => {
			const version = lock.packages?.[node]?.version
			if (!version) throw Error(`Missing locked version: ${node}`)
			return { node, version }
		}).sort((a,b) => a.node.localeCompare(b.node)),
	}
}

export function evaluate(report, lock, policy) {
	if (report?.error || report?.auditReportVersion !== 2 || !report.vulnerabilities || Array.isArray(report.vulnerabilities) || !report.metadata?.vulnerabilities) throw Error('Incomplete npm audit report; refusing build')
	const entries = Object.entries(report.vulnerabilities)
	const totals = report.metadata.vulnerabilities
	if (totals.total !== entries.length || levels.some(level => totals[level] !== entries.filter(([,v]) => v.severity === level).length)) throw Error('Inconsistent npm audit report; refusing build')
	const known = [], blocked = []
	for (const [name,v] of entries) {
		const current = fingerprint(v, lock)
		if (v.severity !== 'critical' && isDeepStrictEqual(current, policy.knownFindings?.[name])) known.push(name)
		else blocked.push(`${name} (${v.severity})`)
	}
	return { known, blocked }
}

function main() {
	if (!process.env.npm_execpath) throw Error('Run through npm run security:check')
	const run = spawnSync(process.execPath, [process.env.npm_execpath, 'audit', '--omit=dev', '--package-lock-only', '--json', '--registry=https://registry.npmjs.org'], { encoding: 'utf8', timeout: 90_000, maxBuffer: 16 * 1024 * 1024 })
	if (run.error || ![0,1].includes(run.status)) throw Error('npm audit unavailable or failed; refusing build. Retry when the registry is available.')
	let report
	try { report = JSON.parse(run.stdout) } catch { throw Error('Invalid npm audit response; refusing build') }
	const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'))
	const policy = JSON.parse(fs.readFileSync('security/dependency-policy.json', 'utf8'))
	const result = evaluate(report, lock, policy)
	if (result.known.length) console.warn(`KNOWN UNRESOLVED FINDINGS: ${result.known.join(', ')}. See security/dependency-policy.json; these are not fixed.`)
	if (result.blocked.length) throw Error(`Dependency security gate BLOCKED: ${result.blocked.join(', ')}. Review and patch; do not automatically expand the baseline.`)
	console.log(`Dependency security gate PASS: no new findings; ${result.known.length} explicitly documented existing findings.`)
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	try { main() } catch (error) { console.error(error.message); process.exitCode = 1 }
}
