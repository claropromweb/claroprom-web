import { SITE_URL } from './site-url'

export const categorySeo: Record<
	string,
	{ title: string; description: string }
> = {
	claroplast: {
		title: 'Claroplast Histology Paraffin Wax | CLARO-PROM',
		description:
			'Universal histology paraffin wax for tissue infiltration and embedding, manufactured by Claro-prom in Croatia, EU. OEM and private-label options available.',
	},
	'ivd-reagents': {
		title: 'Histology & IVD Laboratory Reagents | CLARO-PROM',
		description:
			'Explore Claro-prom histology and IVD reagents: formalin, xylene, stains, mounting media, immersion oil and ethanol. Manufactured in Croatia, EU.',
	},
	labex: {
		title: 'LABEX Laboratory Cleaning Products | CLARO-PROM',
		description:
			'LABEX laboratory cleaning concentrates and solutions for glassware, instruments, equipment and surfaces. Manufactured by Claro-prom in Croatia, EU.',
	},
}
export const pageSeo: Record<string, { title: string; description: string }> = {
	index: {
		title: 'CLARO-PROM | European IVD & Histology Manufacturer',
		description:
			'CLARO-PROM d.o.o. manufactures Claroplast histology paraffin wax, IVD laboratory reagents and LABEX cleaning products in Croatia, European Union.',
	},
	'o-nama': {
		title: 'About CLARO-PROM | Croatian Histology Products Manufacturer',
		description:
			'Meet Claro-prom, a family-owned Croatian manufacturer with over 30 years of experience and an ISO 13485 Quality Management System for IVD manufacturing.',
	},
	proizvodi: {
		title: 'Histology Products & Laboratory Reagents | CLARO-PROM',
		description:
			'Explore Claroplast histology paraffin wax, IVD laboratory reagents and LABEX laboratory cleaning products from Croatian manufacturer Claro-prom.',
	},
}
export const organization = {
	'@type': 'Organization',
	'@id': `${SITE_URL}/#organization`,
	name: 'CLARO-PROM d.o.o.',
	legalName: 'CLARO-PROM d.o.o.',
	alternateName: ['CLARO-PROM', 'Claroprom'],
	url: SITE_URL,
	description:
		'Family-owned Croatian manufacturer of histology products, laboratory reagents and laboratory cleaning products with more than 30 years of experience.',
	telephone: '+38598818891',
	email: 'claroprom@gmail.com',
	vatID: 'HR50624653521',
	identifier: {
		'@type': 'PropertyValue',
		propertyID: 'EUDAMED SRN',
		value: 'HR-MF-000055271',
	},
	address: {
		'@type': 'PostalAddress',
		streetAddress: 'Horvatovac 37',
		postalCode: '10000',
		addressLocality: 'Zagreb',
		addressCountry: 'HR',
	},
}

export const website = {
	'@context': 'https://schema.org',
	'@type': 'WebSite',
	'@id': `${SITE_URL}/#website`,
	name: 'CLARO-PROM',
	alternateName: 'Claroprom',
	url: SITE_URL,
	inLanguage: 'en',
	publisher: { '@id': organization['@id'] },
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
