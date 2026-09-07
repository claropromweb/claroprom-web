/** Normalize only legacy public catalog URLs; never Studio or other locales. */
export function publicProductUrl(url: string): string {
	return url.replace(
		/^\/(?:en\/proizvodi|proizvodi|products\/en|en\/products)(?=\/|[?#]|$)/,
		'/products',
	)
}
