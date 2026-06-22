'use server'

import { groq } from 'next-sanity'
import { ROUTES } from '@/lib/env'
import { DEFAULT_LANG } from '@/lib/i18n'
import { sanityFetchLive } from '@/sanity/lib/live'

export type ProductSearchResult = {
	_id: string
	title: string | null
	slug: string | null
	categoryTitle?: string | null
	image?: any
}

const PRODUCT_SEARCH_QUERY = groq`
	*[
		_type == 'product'
		&& coalesce(language, $defaultLang) == $lang
		&& defined(metadata.slug.current)
		&& title match $queryMatch
	]|order(title asc)[0...8]{
		_id,
		title,
		image{
			...,
			asset->
		},
		'categoryTitle': select(
			$lang == 'en' => coalesce(category->title_en, category->title),
			category->title
		),
		'slug': select(
			$lang == $defaultLang => $productsDir + metadata.slug.current,
			$productsDir + $lang + '/' + metadata.slug.current
		),
	}
`

export async function searchProducts(
	query: string,
	lang: string,
): Promise<ProductSearchResult[]> {
	const q = query.trim()
	if (!q) return []

	// Match each token as a prefix so "eos" finds "Eosin".
	const queryMatch = q
		.split(/\s+/)
		.map((word) => `${word}*`)
		.join(' ')

	const results = await sanityFetchLive<ProductSearchResult[]>({
		query: PRODUCT_SEARCH_QUERY,
		params: {
			queryMatch,
			lang,
			defaultLang: DEFAULT_LANG,
			productsDir: `/${ROUTES.products}/`,
		},
	})

	return results ?? []
}
