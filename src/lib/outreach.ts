export const CLAROPLAST_PACKS = [
	{
		slug: 'claroplast-a-2-kg',
		name: 'Claroplast — 2 kg',
		packaging: '2 kg',
		code: 'CP00CL2',
	},
	{
		slug: 'claroplast-a-10-kg',
		name: 'Claroplast — 10 kg',
		packaging: '10 kg',
		code: 'CP00CLP',
	},
] as const

export const INQUIRY_TYPES = {
	general: 'General inquiry',
	quote: 'Product quote',
	distributor: 'Distributor inquiry',
	documentation: 'Technical documentation request',
	sample: 'Sample request',
	meeting: 'MEDICA 2026 meeting request',
} as const
export type InquiryType = keyof typeof INQUIRY_TYPES

export function inquiryHref(
	type: InquiryType,
	product?: string,
	code?: string,
) {
	const params = new URLSearchParams({ inquiry: type })
	if (product) params.set('product', product)
	if (code) params.set('code', code)
	return '/kontakt?' + params.toString()
}
export function contactContext(params: Pick<URLSearchParams, 'get'>) {
	const raw = params.get('inquiry')
	const type: InquiryType =
		raw && Object.hasOwn(INQUIRY_TYPES, raw)
			? (raw as InquiryType)
			: params.get('code')
				? 'quote'
				: params.get('product') === 'Distributor inquiry'
					? 'distributor'
					: 'general'
	const code = (params.get('code') || '').slice(0, 200)
	const product = (params.get('product') || '').slice(0, 300)
	const topic =
		type === 'meeting'
			? 'MEDICA 2026 — Düsseldorf, 16–19 November'
			: [product, code ? '(' + code + ')' : ''].filter(Boolean).join(' ')
	const request =
		type === 'general'
			? ''
			: type === 'meeting'
				? 'I would like to arrange a meeting at MEDICA 2026.\nCompany / distribution market:\nPreferred date and time:\nTopics to discuss:'
				: INQUIRY_TYPES[type] +
					(topic ? ' — ' + topic : '') +
					'\nPlease tell us about your requirements:'
	return { type, topic, request }
}
export function claroplastPack(slug?: string | null) {
	return CLAROPLAST_PACKS.find(
		(pack) => slug?.split('/').filter(Boolean).at(-1) === pack.slug,
	)
}
export function hasPackSize(rows?: Array<{ format?: string | null }> | null) {
	return !!rows?.some((row) => row.format?.trim())
}
export function productFamily(title?: string | null) {
	return (title || '')
		.replace(/,\s*\d+(?:[.,]\d+)?\s*(?:mL|L|kg)(?:\s*\([^)]*\))?\s*$/i, '')
		.trim()
		.toLowerCase()
}
export function relevantProducts<
	T extends { title?: string | null; slug?: string | null },
>(product: T, candidates: T[], limit: number) {
	const pack = claroplastPack(product.slug)
	return candidates
		.filter((item) =>
			pack
				? !!claroplastPack(item.slug)
				: productFamily(item.title) === productFamily(product.title),
		)
		.slice(0, Math.max(0, limit))
}
