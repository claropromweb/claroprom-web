import { ROUTES } from '@/lib/env'
import { DEFAULT_LANG } from '@/lib/i18n'

export default function resolveSlug({
	_type,
	internal,
	params,
	external,
	language,
}: {
	// internal
	_type?: string
	internal?: string
	params?: string
	language?: string
	// external
	external?: string
}) {
	if (external) return external

	if (internal) {
		const nonDefaultLang =
			language && language !== DEFAULT_LANG ? language : null

		const isBlog = _type === 'blog.post'
		const isProduct = _type === 'product'
		const isPrefixed = isBlog || isProduct
		const segment = isBlog
			? `/${ROUTES.blog}/`
			: isProduct
				? `/${ROUTES.products}/`
				: '/'
		const langSegment = nonDefaultLang
			? isPrefixed
				? `${nonDefaultLang}/`
				: `${nonDefaultLang}`
			: null
		const path = internal === 'index' ? null : internal

		if (isPrefixed) {
			return [segment, langSegment, path, params].filter(Boolean).join('')
		}

		return [
			langSegment ? `/${langSegment}` : null,
			segment,
			path,
			params,
		]
			.filter(Boolean)
			.join('')
	}

	return undefined
}
