import type { Lang } from '@/lib/i18n'

export const translations = {
	hr: {
		all: 'All',
		home: 'Home',
		category: 'Category',
		productType: 'Product type',
		ivd: 'IVD medical device',
		laboratoryReagent: 'Laboratory reagent',
		consumable: 'Laboratory consumable',
		manufacturer: 'Manufacturer',
		distributor: 'Distributor',
		intendedPurpose: 'Intended purpose',
		ivdClass: 'IVD class',
		storageConditions: 'Storage conditions',
		shelfLife: 'Shelf life',
		code: 'Code',
		format: 'Format',
		askForQuote: 'Request a quote',
		technicalDataSheet: 'Technical Data Sheet',
		safetyDataSheet: 'Safety Data Sheet',
		instructionsForUse: 'Instructions for Use (IFU)',
		declarationOfConformity: 'EU Declaration of Conformity',
		relatedProducts: 'Related products',
		noProducts: 'No products available.',
		search: 'Search products',
		searchButton: 'Search',
		noResults: 'No results',
	},
	en: {
		all: 'All',
		home: 'Home',
		category: 'Category',
		productType: 'Product type',
		ivd: 'IVD medical device',
		laboratoryReagent: 'Laboratory reagent',
		consumable: 'Laboratory consumable',
		manufacturer: 'Manufacturer',
		distributor: 'Distributor',
		intendedPurpose: 'Intended purpose',
		ivdClass: 'IVD class',
		storageConditions: 'Storage conditions',
		shelfLife: 'Shelf life',
		code: 'Code',
		format: 'Format',
		askForQuote: 'Ask for a quote',
		technicalDataSheet: 'Technical Data Sheet',
		safetyDataSheet: 'Safety Data Sheet',
		instructionsForUse: 'Instructions for Use (IFU)',
		declarationOfConformity: 'EU Declaration of Conformity',
		relatedProducts: 'Related Products',
		noProducts: 'No products available.',
		search: 'Search products',
		searchButton: 'Search',
		noResults: 'No results',
	},
} as const

export type ProductTranslations = (typeof translations)['hr']

export function getProductTranslations(lang: Lang): ProductTranslations {
	return (
		(translations as unknown as Record<string, ProductTranslations>)[lang] ??
		translations.hr
	)
}
