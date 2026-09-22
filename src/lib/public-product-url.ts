import { CLAROPLAST_SLUG } from './site-url'

/** Normalize known public origins and legacy catalog paths without changing CMS data. */
export function publicProductUrl(url: string): string {
	const local =
		url.replace(
			/^https?:\/\/(?:www\.)?(?:labexclean\.com|claroprom\.com|claroprom-web\.vercel\.app)(?=\/|[?#]|$)/i,
			'',
		) || '/'
	return local
		.replace(
			/^\/(?:en\/proizvodi|proizvodi|products\/en|en\/products)(?=\/|[?#]|$)/,
			'/products',
		)
		.replace(
			/^\/products\/claroplast(?=[?#]|\/?$)/,
			`/products/${CLAROPLAST_SLUG}`,
		)
}
