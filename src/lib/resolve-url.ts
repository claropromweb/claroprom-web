import { stegaClean } from 'next-sanity'
import { ROUTES } from '@/lib/env'
import { DEFAULT_LANG } from '@/lib/i18n'
import { publicProductUrl } from './public-product-url'

type PageLike = {
	_type?: string
	language?: string | null
	metadata?: {
		slug?: { current?: string } | null
	} | null
}

export default function resolveUrl(
	page?: PageLike | null,
	{
		base = false,
		params,
		language,
	}: {
		base?: boolean
		params?: string
		language?: string
	} = {},
) {
	const isBlogPost = page?._type === 'blog.post'
	const isProduct = page?._type === 'product'
	const isPrefixed = isBlogPost || isProduct

	const segment = isBlogPost
		? `/${ROUTES.blog}/`
		: isProduct
			? `/${ROUTES.products}/`
			: '/'

	const effectiveLang =
		page?._type === 'page'
			? DEFAULT_LANG
			: (language ?? page?.language ?? undefined)
	const nonDefaultLang =
		effectiveLang && effectiveLang !== DEFAULT_LANG ? effectiveLang : null

	const slug = page?.metadata?.slug?.current
	const path = slug === 'index' ? null : slug
	if (!isPrefixed && (slug === 'proizvodi' || slug?.startsWith('proizvodi/'))) {
		return [
			base && process.env.NEXT_PUBLIC_BASE_URL,
			publicProductUrl('/' + slug),
			stegaClean(params),
		]
			.filter(Boolean)
			.join('')
	}

	if (isPrefixed) {
		return [
			base && process.env.NEXT_PUBLIC_BASE_URL,
			segment,
			isProduct ? null : nonDefaultLang ? `${nonDefaultLang}/` : null,
			path,
			stegaClean(params),
		]
			.filter(Boolean)
			.join('')
	}

	const url = [
		base && process.env.NEXT_PUBLIC_BASE_URL,
		nonDefaultLang ? `/${nonDefaultLang}` : null,
		segment,
		path,
		stegaClean(params),
	]
		.filter(Boolean)
		.join('')

	return publicProductUrl(url || '/')
}
