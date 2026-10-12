import { claroplastPack } from './outreach'

export type InquiryProduct = {
	_id: string
	title?: string | null
	hidden?: boolean
	language?: string | null
	metadata?: { slug?: { current?: string | null } | null } | null
	table?: Array<{
		_key?: string
		code?: string | null
		format?: string | null
	}> | null
}
export type InquiryItem = {
	productId: string
	rowKey: string
	name: string
	code: string
	packaging: string
	url: string
	quantity: number
}
export type RequestedItem = Pick<
	InquiryItem,
	'productId' | 'rowKey' | 'quantity'
>

export function inquiryRows(product: InquiryProduct): InquiryItem[] {
	const slug = product.metadata?.slug?.current
	if (!slug || product.hidden || product.language !== 'en') return []
	const pack = claroplastPack(slug)
	return (product.table ?? []).flatMap((row) => {
		const code = (pack?.code ?? row.code ?? '').trim()
		const packaging = (pack?.packaging ?? row.format ?? '').trim()
		if (!row._key || !code || !packaging) return []
		return [
			{
				productId: product._id,
				rowKey: row._key,
				name: pack?.name ?? product.title ?? '',
				code,
				packaging,
				url: '/products/' + slug,
				quantity: 1,
			},
		]
	})
}

export function validateRequestedItems(value: unknown): RequestedItem[] {
	if (!Array.isArray(value) || !value.length || value.length > 50)
		throw new Error('Select between 1 and 50 products.')
	const seen = new Set<string>()
	return value.map((item) => {
		if (
			!item ||
			typeof item !== 'object' ||
			typeof item.productId !== 'string' ||
			typeof item.rowKey !== 'string' ||
			item.productId.length > 128 ||
			item.rowKey.length > 128 ||
			!Number.isSafeInteger(item.quantity) ||
			item.quantity < 1 ||
			item.quantity > 10000
		)
			throw new Error('Invalid product selection or quantity.')
		const key = item.productId + ':' + item.rowKey
		if (seen.has(key)) throw new Error('Duplicate product selection.')
		seen.add(key)
		return {
			productId: item.productId,
			rowKey: item.rowKey,
			quantity: item.quantity,
		}
	})
}

export function resolveInquiryItems(
	requested: RequestedItem[],
	products: InquiryProduct[],
): InquiryItem[] {
	return requested.map((item) => {
		const product = products.find((p) => p._id === item.productId)
		const row =
			product && inquiryRows(product).find((r) => r.rowKey === item.rowKey)
		if (!row)
			throw new Error(
				'A selected product is unavailable. Please refresh your selection.',
			)
		return { ...row, quantity: item.quantity }
	})
}

export function inquiryEmailLines(items: InquiryItem[]) {
	return items
		.map(
			(item) =>
				`${item.name} | Catalogue No.: ${item.code} | Pack size: ${item.packaging} | Quantity: ${item.quantity} pack(s)`,
		)
		.join('\n')
}
