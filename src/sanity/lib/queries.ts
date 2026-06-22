import { groq } from 'next-sanity'
import { ROUTES } from '@/lib/env'
import { DEFAULT_LANG } from '@/lib/i18n'
import type { SITE_QUERY_RESULT } from '@/sanity/types'
import { sanityFetchLive } from './live'

/* fragments */

// @sanity-typegen-ignore
const LINK_QUERY = groq`
	...,
	type == 'internal' => {
		internal->{
			_type,
			_id,
			title,
			language,
			'slug': select(
				metadata.slug.current == 'index' && (!defined(language) || language == '${DEFAULT_LANG}') => '/',
				metadata.slug.current == 'index' && defined(language) && language != '${DEFAULT_LANG}' => '/' + language,
				_type == 'blog.post' && (!defined(language) || language == '${DEFAULT_LANG}') => '/${ROUTES.blog}/' + metadata.slug.current,
				_type == 'blog.post' && defined(language) && language != '${DEFAULT_LANG}' => '/${ROUTES.blog}/' + language + '/' + metadata.slug.current,
				_type == 'product' && (!defined(language) || language == '${DEFAULT_LANG}') => '/${ROUTES.products}/' + metadata.slug.current,
				_type == 'product' && defined(language) && language != '${DEFAULT_LANG}' => '/${ROUTES.products}/' + language + '/' + metadata.slug.current,
				(!defined(language) || language == '${DEFAULT_LANG}') => '/' + metadata.slug.current,
				'/' + language + '/' + metadata.slug.current
			)
		}
	}
`

// @sanity-typegen-ignore
const NAVIGATION_QUERY = groq`
	...,
	items[]{
		${LINK_QUERY},
		defined(link) => { link{ ${LINK_QUERY} } },
		defined(links[]) => { links[]{ ${LINK_QUERY} } },
		_type == 'megamenu' => {
			defined(link) => { link{ ${LINK_QUERY} } },
			items[]{
				...,
				_type == 'link' => { ${LINK_QUERY} },
				_type == 'link.list' => {
					defined(link) => { link{ ${LINK_QUERY} } },
					links[]{ ${LINK_QUERY} }
				}
			}
		}
	}
`

const SITE_QUERY = groq`*[_type == 'site'][0]{
	...,
	'title': select(
		$lang == '${DEFAULT_LANG}' => title,
		defined(title_en) => title_en,
		title
	),
	'footerContent': select(
		$lang == '${DEFAULT_LANG}' => footerContent,
		defined(footerContent_en) => footerContent_en,
		footerContent
	),
	'copyright': select(
		$lang == '${DEFAULT_LANG}' => copyright,
		defined(copyright_en) => copyright_en,
		copyright
	),
	'header': select(
		$lang == '${DEFAULT_LANG}' => header,
		defined(header_en) => header_en,
		header
	)->{ ${NAVIGATION_QUERY} },
	'ctas': select(
		$lang == '${DEFAULT_LANG}' => ctas,
		defined(ctas_en) => ctas_en,
		ctas
	)[]{
		...,
		link{ ${LINK_QUERY} }
	},
	'footer': select(
		$lang == '${DEFAULT_LANG}' => footer,
		defined(footer_en) => footer_en,
		footer
	)->{ ${NAVIGATION_QUERY} },
	'footerSecondary': select(
		$lang == '${DEFAULT_LANG}' => footerSecondary,
		defined(footerSecondary_en) => footerSecondary_en,
		footerSecondary
	)->{ ${NAVIGATION_QUERY} },
	footerImages[]{
		...,
		asset->{
			...,
			metadata
		}
	},
	'social': select(
		$lang == '${DEFAULT_LANG}' => social,
		defined(social_en) => social_en,
		social
	)->{ ${NAVIGATION_QUERY} },
}`

export const GLOBAL_MODULE_EXCLUDE_QUERY = groq`
	select(
		defined(excludePaths) => count(excludePaths[string::startsWith($slug, @)]) == 0,
		true
	)
`

export const GLOBAL_MODULE_PATH_QUERY = groq`
	string::startsWith($slug, path)
	&& ${GLOBAL_MODULE_EXCLUDE_QUERY}
`

// @sanity-typegen-ignore
export const TRANSLATIONS_QUERY = groq`
	'translations': *[_type == 'translation.metadata' && references(^._id)].translations[]{
		'value': value->{
			_id,
			_type,
			language,
			'slug': metadata.slug.current
		}
	}
`

// @sanity-typegen-ignore
const SIDEBAR_QUERY = groq`
	...,
	modules[]{
		...,
		_type == 'callout' => {
			ctas[]{
				...,
				link{ ${LINK_QUERY} }
			}
		}
	}
`

// @sanity-typegen-ignore
export const MODULES_QUERY = groq`
	...,
	ctas[]{
		...,
		link{ ${LINK_QUERY} }
	},
	sidebar{ ${SIDEBAR_QUERY} },
	_type == 'form-module' => {
		form->
	},
	_type == 'breadcrumbs' => {
		crumbs[]{ ${LINK_QUERY} }
	},
	_type == 'product-content' => {
		quoteLink{ ${LINK_QUERY} }
	},
	_type == 'card-list' => {
		cards[]{
			...,
			ctas[]{
				...,
				link{ ${LINK_QUERY} }
			}
		}
	},
	_type == 'category-grid' => {
		categories[]{
			...,
			link{ ${LINK_QUERY} }
		}
	},
	_type == 'split-columns' => {
		columns[]{
			...,
			link{ ${LINK_QUERY} }
		}
	},
	_type == 'logo-list' => {
		logos[]->
	},
	_type == 'person-list' => {
		people[]->
	},
	_type == 'prose' => {
		content[]{
			...,
			_type == 'image' => {
				...,
				asset->{
					...,
					metadata
				}
			}
		},
		'headings': content[style in ['h2', 'h3', 'h4', 'h5', 'h6']]{
			style,
			'text': pt::text(@)
		}
	},
	_type == 'quote-list' => {
		quotes[]->
	},
`

/* queries */

export async function getSite(lang?: string) {
	const currentLang = lang || DEFAULT_LANG
	return await sanityFetchLive<SITE_QUERY_RESULT>({
		query: SITE_QUERY,
		params: { lang: currentLang },
	})
}

/**
 * Returns a flat map of all translated pages/posts and their alternate URLs.
 * Used by the language switcher and the locale-aware middleware.
 */
export async function getTranslations() {
	return await sanityFetchLive<
		Array<{
			_id: string
			_type: string
			slug: string
			language: string
			translations?: Array<{
				_id?: string
				_type?: string
				slug?: string
				language?: string
			}>
		}>
	>({
		query: groq`*[_type in ['page', 'blog.post', 'product'] && defined(metadata.slug.current)]{
			_id,
			_type,
			language,
			'slug': select(
				_type == 'blog.post' && (!defined(language) || language == '${DEFAULT_LANG}') => '/${ROUTES.blog}/' + metadata.slug.current,
				_type == 'blog.post' && defined(language) && language != '${DEFAULT_LANG}' => '/${ROUTES.blog}/' + language + '/' + metadata.slug.current,
				_type == 'product' && (!defined(language) || language == '${DEFAULT_LANG}') => '/${ROUTES.products}/' + metadata.slug.current,
				_type == 'product' && defined(language) && language != '${DEFAULT_LANG}' => '/${ROUTES.products}/' + language + '/' + metadata.slug.current,
				metadata.slug.current == 'index' && (!defined(language) || language == '${DEFAULT_LANG}') => '/',
				metadata.slug.current == 'index' && defined(language) && language != '${DEFAULT_LANG}' => '/' + language,
				(!defined(language) || language == '${DEFAULT_LANG}') => '/' + metadata.slug.current,
				'/' + language + '/' + metadata.slug.current
			),
			'translations': *[_type == 'translation.metadata' && references(^._id)].translations[]{
				'_id': value->._id,
				'_type': value->._type,
				'language': value->language,
				'slug': select(
					value->._type == 'blog.post' && (!defined(value->language) || value->language == '${DEFAULT_LANG}') => '/${ROUTES.blog}/' + value->metadata.slug.current,
					value->._type == 'blog.post' && defined(value->language) && value->language != '${DEFAULT_LANG}' => '/${ROUTES.blog}/' + value->language + '/' + value->metadata.slug.current,
					value->._type == 'product' && (!defined(value->language) || value->language == '${DEFAULT_LANG}') => '/${ROUTES.products}/' + value->metadata.slug.current,
					value->._type == 'product' && defined(value->language) && value->language != '${DEFAULT_LANG}' => '/${ROUTES.products}/' + value->language + '/' + value->metadata.slug.current,
					value->metadata.slug.current == 'index' && (!defined(value->language) || value->language == '${DEFAULT_LANG}') => '/',
					value->metadata.slug.current == 'index' && defined(value->language) && value->language != '${DEFAULT_LANG}' => '/' + value->language,
					(!defined(value->language) || value->language == '${DEFAULT_LANG}') => '/' + value->metadata.slug.current,
					'/' + value->language + '/' + value->metadata.slug.current
				)
			}
		}`,
	})
}
