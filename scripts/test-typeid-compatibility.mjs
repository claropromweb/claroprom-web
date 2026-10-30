import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'

const require = createRequire(import.meta.url)
const entry = require.resolve('typeid-js')
const variants = [require('typeid-js'), await import(pathToFileURL(entry.replace(/index\.js$/, 'index.mjs')).href)]
const fixedUUID = '01890a5d-ac96-774b-bcce-b302099a8057'
let golden
for (const api of variants) {
	const boxed = api.TypeID.fromUUID('document', fixedUUID)
	assert.equal(boxed.getType(), 'document')
	assert.equal(boxed.toUUID(), fixedUUID)
	assert.equal(boxed.toUUIDBytes().length, 16)
	assert.equal(api.TypeID.fromString(boxed.toString()).toString(), boxed.toString())
	assert.equal(api.TypeID.fromUUIDBytes('document', boxed.toUUIDBytes()).toString(), boxed.toString())
	assert.equal(api.fromUUID(fixedUUID, 'document'), boxed.toString())
	assert.equal(api.toUUID(boxed.toString()), fixedUUID)
	assert.equal(api.fromUUIDBytes('document', api.toUUIDBytes(boxed.toString())), boxed.toString())
	assert.equal(api.fromString(boxed.toString(), 'document'), boxed.toString())
	assert.equal(api.getType(boxed.toString()), 'document')
	assert.equal(api.getSuffix(boxed.toString()), boxed.getSuffix())
	assert.deepEqual(api.parseTypeId(boxed.toString()), { prefix: 'document', suffix: boxed.getSuffix() })
	assert.throws(() => api.TypeID.fromString(boxed.toString(), 'other'))
	assert.throws(() => api.typeid('INVALID'))
	assert.throws(() => api.TypeID.fromString('document_invalid'))
	golden ??= boxed.toString()
	assert.equal(boxed.toString(), golden)
	const ids = new Set()
	for (let i = 0; i < 10_000; i++) {
		const id = i % 2 ? api.typeid('document').toString() : api.typeidUnboxed('document')
		assert.match(api.toUUID(id), /^[\da-f]{8}-[\da-f]{4}-7[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/)
		ids.add(id)
	}
	assert.equal(ids.size, 10_000, 'Generated IDs remain unique within the rapid-generation batch')
	const emptyPrefix = api.typeid()
	assert.equal(api.TypeID.fromString(emptyPrefix.toString()).getType(), '')
}
const uuid = createRequire(entry)('uuid')
for (const [name, generate] of [
	['v3', () => uuid.v3('test', uuid.v3.DNS, new Uint8Array(8), 4)],
	['v5', () => uuid.v5('test', uuid.v5.DNS, new Uint8Array(8), 4)],
	['v6', () => uuid.v6({}, new Uint8Array(8), 4)],
]) {
	assert.throws(generate, RangeError, `${name} must reject writes outside the supplied buffer`)
}
console.log(`PASS: CommonJS and ESM TypeID generation (20,000 unique IDs), UUID/byte/string roundtrips, prefixes and invalid inputs. Stable fixture: ${golden}. No network.`)
console.log('PASS: patched UUID rejects undersized output buffers for v3/v5/v6.')
