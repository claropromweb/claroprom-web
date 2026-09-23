import type { PRODUCT_QUERY_RESULT } from '@/sanity/types'

type Product = NonNullable<PRODUCT_QUERY_RESULT>

/** Approved English SKU copy, versioned with the deployment; no CMS writes. */
export function claroplastCopy(slug: string | undefined) {
	const pack =
		slug === 'claroplast-a-10-kg'
			? '10 kg'
			: slug === 'claroplast-a-2-kg'
				? '2 kg'
				: undefined
	if (!pack) return undefined
	return {
		title: `Claroplast Histology Embedding Wax, ${pack} | CLARO-PROM`,
		name: `Claroplast Histology Embedding Wax – ${pack}`,
		description: `Claroplast polymer-modified histology paraffin wax for tissue infiltration and embedding, manufactured by CLARO-PROM d.o.o. in Croatia, EU. ${pack} pack.`,
		visibleDescription: `Claroplast is a polymer-modified histology paraffin wax intended for routine tissue infiltration and embedding. It is manufactured by CLARO-PROM d.o.o. in Croatia, European Union, and supplied in a ${pack} pack.`,
	}
}

export function withApprovedClaroplastCopy(product: Product): Product {
	const copy =
		product.language === 'en'
			? claroplastCopy(product.metadata?.slug?.current)
			: undefined
	if (!copy) return product
	return {
		...product,
		title: copy.name,
		metadata: {
			...product.metadata,
			_type: 'metadata',
			title: copy.title,
			description: copy.description,
		},
		description: [
			{
				_type: 'block',
				_key: 'approved-claroplast-description',
				style: 'normal',
				markDefs: [],
				children: [
					{
						_type: 'span',
						_key: 'text',
						marks: [],
						text: copy.visibleDescription,
					},
				],
			},
		],
	}
}

/** Read only visible Portable Text spans, never annotations or arbitrary objects. */
export function productDescriptionText(blocks: Product['description']): string {
	return (blocks ?? [])
		.filter((block) => block._type === 'block')
		.map((block) =>
			(block.children ?? [])
				.filter((child) => child._type === 'span')
				.map((child) => child.text ?? '')
				.join(''),
		)
		.join(' ')
		.replace(/\s+/g, ' ')
		.trim()
}

/** Shared by HTML/social metadata and Product JSON-LD. */
export function productDescription(product: Product): string {
	const manual = product.metadata?.description?.trim()
	if (manual) return manual
	const visible = productDescriptionText(product.description)
	if (visible) return visible
	const codes = product.table
		?.map((row) => row.code)
		.filter(Boolean)
		.join(', ')
	const formats = product.table
		?.map((row) => row.format)
		.filter(Boolean)
		.join(', ')
	return [
		product.title,
		codes ? `Code: ${codes}.` : '',
		formats ? `Pack size: ${formats}.` : '',
		product.manufacturerRole === 'manufacturer'
			? 'Manufactured by Claro-prom.'
			: '',
	]
		.filter(Boolean)
		.join(' ')
}
