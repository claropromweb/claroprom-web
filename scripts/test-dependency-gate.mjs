import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { evaluate } from './check-dependencies.mjs'

const policy = JSON.parse(fs.readFileSync(new URL('../security/dependency-policy.json', import.meta.url)))
function fixture() {
	const vulnerabilities = {}, packages = {}
	for (const [name,v] of Object.entries(policy.knownFindings)) {
		vulnerabilities[name] = { name, severity:v.severity, via:structuredClone(v.via), nodes:v.nodes.map(x=>x.node) }
		for (const x of v.nodes) packages[x.node] = {version:x.version}
	}
	return { report:{auditReportVersion:2,vulnerabilities,metadata:{vulnerabilities:{info:0,low:0,moderate:0,high:2,critical:0,total:2}}}, lock:{packages} }
}
test('existing findings remain explicit, and resolved findings do not block', () => {
	const {report,lock} = fixture()
	assert.deepEqual(evaluate(report,lock,policy),{known:['sanity-plugin-media','zod'],blocked:[]})
	report.vulnerabilities = {}; report.metadata.vulnerabilities.high = 0; report.metadata.vulnerabilities.total = 0
	assert.deepEqual(evaluate(report,lock,policy),{known:[],blocked:[]})
})
test('new findings block even at low severity', () => {
	const {report,lock} = fixture()
	report.vulnerabilities.other = {name:'other',severity:'low',via:['zod'],nodes:['node_modules/other']}
	lock.packages['node_modules/other'] = {version:'1.0.0'}
	report.metadata.vulnerabilities.low++; report.metadata.vulnerabilities.total++
	assert.deepEqual(evaluate(report,lock,policy).blocked,['other (low)'])
})
for (const [name,change] of [
	['new advisory on the same package', ({report})=>report.vulnerabilities.zod.via.push({name:'zod',url:'https://example.invalid/new',severity:'high',range:'*'})],
	['changed installed version', ({lock})=>lock.packages['node_modules/sanity-plugin-media/node_modules/zod'].version='3.0.0'],
	['additional affected location', ({report,lock})=>{report.vulnerabilities.zod.nodes.push('node_modules/zod');lock.packages['node_modules/zod']={version:'3.25.76'}}],
	['increased severity', ({report})=>{report.vulnerabilities.zod.severity='critical';report.metadata.vulnerabilities.high--;report.metadata.vulnerabilities.critical++}],
]) test(name+' is not covered by the baseline',()=>{const f=fixture();change(f);assert.ok(evaluate(f.report,f.lock,policy).blocked.length)})
test('registry errors, incomplete reports and false zero totals fail closed',()=>{
	const f=fixture()
	for(const report of [{}, {...f.report,error:{code:'ENETUNREACH'}}, {...f.report,auditReportVersion:3}]) assert.throws(()=>evaluate(report,f.lock,policy))
	f.report.metadata.vulnerabilities.total=0
	assert.throws(()=>evaluate(f.report,f.lock,policy))
})
test('missing package versions fail closed',()=>{
	const f=fixture();delete f.lock.packages['node_modules/sanity-plugin-media/node_modules/zod']
	assert.throws(()=>evaluate(f.report,f.lock,policy))
})
