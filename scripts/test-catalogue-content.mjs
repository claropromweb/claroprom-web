import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const drafts = JSON.parse(
	readFileSync('docs/catalogue-v2/ivd-copy-drafts.json', 'utf8'),
)
const inventory = JSON.parse(
	readFileSync('docs/catalogue-v2/catalogue-inventory.json', 'utf8'),
)
const ivd = inventory.products.filter(
	(p) => p.language === 'en' && p.productType === 'ivd',
)
assert.equal(drafts.families.length, 15)
assert.equal(drafts.mappings.length, ivd.length)
assert.equal(new Set(drafts.mappings.map((r) => r.id)).size, ivd.length)
for (const f of drafts.families) {
	assert.ok(f.short.length >= 80 && f.short.length <= 160, f.name)
	assert.ok(
		f.detail.split(/\s+/).length >= 40 && f.detail.split(/\s+/).length <= 100,
		f.name,
	)
	assert.equal(f.approvalStatus, 'PROPOSED — OWNER REVIEW')
	assert.ok(f.sources.length)
	assert.ok(
		!/non-toxic|universally compatible|guaranteed|refractive index of|certified ergonomic/i.test(
			f.short + ' ' + f.detail,
		),
	)
}
for (const r of drafts.mappings) {
	const p = ivd.find((p) => p.id === r.id)
	assert.ok(p)
	assert.equal(r.name, p.name)
	assert.deepEqual(r.catalogueNumbers, p.sourceCodes)
	assert.deepEqual(r.packaging, p.sourcePackaging)
	assert.equal(r.publicationAllowed, false)
	assert.equal(r.familyEquivalenceConfirmed, false)
	assert.equal(r.existingIntendedPurpose, p.intendedPurposeVerbatim)
	assert.ok(r.expectedRevision)
	assert.ok(r.confidence.generalTechnicalKnowledge)
	assert.ok(r.confidence.manufacturerVerificationRequired)
}
assert.notEqual(
	drafts.mappings.find((p) => p.name.startsWith('10% NB')).proposedFamily,
	drafts.mappings.find((p) => p.name.startsWith('4% NB')).proposedFamily,
)
assert.notEqual(
	drafts.mappings.find((p) => p.name.startsWith('Claroclear Xylene Substitute'))
		.proposedFamily,
	drafts.mappings.find((p) => p.name.startsWith('Claroclear Xylene,'))
		.proposedFamily,
)
const photos = JSON.parse(
	readFileSync('docs/catalogue-v2/current-photo-inventory.json', 'utf8'),
)
assert.equal(
	photos.counts.mainPhoto,
	photos.records.filter((p) => p.language === 'en' && p.image).length,
)
assert.equal(photos.cmsChangesByAgent, 0)
console.log(
	'PASS: researched draft coverage, exact SKU/code/pack mappings, isolated concentrations/formulations, pending approval, unchanged intended purpose and current photo inventory.',
)
