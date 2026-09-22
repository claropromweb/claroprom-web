import { SITE_URL } from './site-url'

export const categorySeo: Record<
	string,
	{ title: string; description: string }
> = {
	claroplast: {
		title: 'Claroplast Histology Paraffin Wax | Claro-prom',
		description:
			'Universal histology paraffin wax for tissue infiltration and embedding, manufactured by Claro-prom in Croatia, EU. OEM and private-label options available.',
	},
	'ivd-reagents': {
		title: 'Histology & IVD Laboratory Reagents | Claro-prom',
		description:
			'Explore Claro-prom histology and IVD reagents: formalin, xylene, stains, mounting media, immersion oil and ethanol. Manufactured in Croatia, EU.',
	},
	labex: {
		title: 'LABEX Laboratory Cleaning Products | Claro-prom',
		description:
			'LABEX laboratory cleaning concentrates and solutions for glassware, instruments, equipment and surfaces. Manufactured by Claro-prom in Croatia, EU.',
	},
}
export const pageSeo: Record<string, { title: string; description: string }> = {
	index: {
		title: 'European Histology Products Manufacturer | Claro-prom',
		description:
			'Claro-prom manufactures Claroplast histology paraffin wax, IVD laboratory reagents and LABEX cleaning products in Croatia, European Union.',
	},
	'o-nama': {
		title: 'About Claro-prom | Croatian Histology Products Manufacturer',
		description:
			'Meet Claro-prom, a family-owned Croatian manufacturer with over 30 years of experience and an ISO 13485 Quality Management System for IVD manufacturing.',
	},
	proizvodi: {
		title: 'Histology Products & Laboratory Reagents | Claro-prom',
		description:
			'Explore Claroplast histology paraffin wax, IVD laboratory reagents and LABEX laboratory cleaning products from Croatian manufacturer Claro-prom.',
	},
}
export const organization = {
	'@type': 'Organization',
	'@id': `${SITE_URL}/#organization`,
	name: 'Claro-prom',
	url: SITE_URL,
	description:
		'Family-owned Croatian manufacturer of histology products, laboratory reagents and laboratory cleaning products with more than 30 years of experience.',
	address: { '@type': 'PostalAddress', addressCountry: 'HR' },
}
export function breadcrumbs(items: { name: string; path: string }[]) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: new URL(item.path, SITE_URL).href,
		})),
	}
}
