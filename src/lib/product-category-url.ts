import { CLAROPLAST_SLUG } from './site-url'

/** Category names and slugs belong to Sanity; this is only the route convention. */
export function categoryUrl(slug: string) {
	return `/products/${encodeURIComponent(slug === 'claroplast' ? CLAROPLAST_SLUG : slug)}`
}
