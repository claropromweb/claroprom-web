/** Category names and slugs belong to Sanity; this is only the route convention. */
export function categoryUrl(slug: string) {
	return `/en/proizvodi/${encodeURIComponent(slug)}`
}
