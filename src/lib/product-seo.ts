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
		// Owner-confirmed catalogue numbers; transport cartons are not separate SKUs.
		catalogueNumber: pack === '2 kg' ? 'CP00CL2' : 'CP00CLP',
		title: `Claroplast ${pack} | Polymer-Modified Histology Wax`,
		name: `Claroplast — Histology Paraffin Wax with Polymer, ${pack}`,
		description:
			pack === '2 kg'
				? 'Claroplast 2 kg polymer-modified histology wax in pellet (granulated) form for tissue infiltration, embedding and sectioning. Manufactured by CLARO-PROM, Croatia.'
				: 'Claroplast 10 kg histology paraffin wax with polymer for embedding and smooth microtome sectioning. Pellet (granulated) form from CLARO-PROM, Croatia.',
		visibleDescription: `Claroplast is a highly purified histology paraffin wax with polymer additives for routine tissue infiltration, embedding and microtome sectioning. Its polymer-modified formulation supports controlled elasticity, smooth cutting and consistent histological ribbon formation. It is manufactured by CLARO-PROM d.o.o. in Croatia, European Union, and supplied in a ${pack} pack in pellet (granulated) form.`,
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
		// Correct the public read model only; preserve the source CMS rows and fields.
		table: product.table?.map((row) => ({
			...row,
			code: copy.catalogueNumber,
		})),
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
