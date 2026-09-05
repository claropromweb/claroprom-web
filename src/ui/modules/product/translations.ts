import type { Lang } from '@/lib/i18n'

export const translations = {
	hr: {
		all: 'Sve',
		home: 'Početna',
		category: 'Kategorija',
		productType: 'Vrsta proizvoda',
		ivd: 'IVD medicinski proizvod',
		laboratoryReagent: 'Laboratorijski reagens',
		consumable: 'Laboratorijski potrošni materijal',
		manufacturer: 'Proizvođač',
		distributor: 'Distributer',
		intendedPurpose: 'Namjena',
		ivdClass: 'IVD razred',
		storageConditions: 'Uvjeti čuvanja',
		shelfLife: 'Rok valjanosti',
		code: 'Kod',
		format: 'Format',
		askForQuote: 'Zatraži ponudu',
		technicalDataSheet: 'Tehnički list',
		safetyDataSheet: 'Sigurnosno-tehnički list',
		instructionsForUse: 'Upute za uporabu (IFU)',
		declarationOfConformity: 'EU izjava o sukladnosti',
		relatedProducts: 'Povezani proizvodi',
		noProducts: 'Nema dostupnih proizvoda.',
		search: 'Pretraži proizvode',
		searchButton: 'Traži',
		noResults: 'Nema rezultata',
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
