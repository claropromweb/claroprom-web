import type { Lang } from '@/lib/i18n'

export const translations = {
	hr: {
		all: 'Sve',
		home: 'Početna',
		category: 'Kategorija',
		code: 'Kod',
		format: 'Format',
		askForQuote: 'Zatraži ponudu',
		technicalDataSheet: 'Tehnički list',
		safetyDataSheet: 'Sigurnosno-tehnički list',
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
		code: 'Code',
		format: 'Format',
		askForQuote: 'Ask for a quote',
		technicalDataSheet: 'Technical Data Sheet',
		safetyDataSheet: 'Safety Data Sheet',
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
