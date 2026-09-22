import type { MetadataRoute } from 'next'
import { groq } from 'next-sanity'
import { ROUTES } from '@/lib/env'
import { DEFAULT_LANG } from '@/lib/i18n'
import { publicProductUrl } from '@/lib/public-product-url'
import { SITE_URL } from '@/lib/site-url'
import { sanityFetchLive } from '@/sanity/lib/live'

export const dynamic = 'force-dynamic'

export default async function (): Promise<MetadataRoute.Sitemap> {
	const data = await sanityFetchLive<{
		pages: MetadataRoute.Sitemap
		posts: MetadataRoute.Sitemap
		products: MetadataRoute.Sitemap
		categories: MetadataRoute.Sitemap
	}>({
		perspective: 'published',
		query: groq`{
			'pages': *[
				_type == 'page' && catalogArchive != true && language == 'en'
				&& defined(metadata.slug.current)
				&& !(metadata.slug.current in ['404'])
				&& metadata.noIndex != true
			]|order(metadata.slug.current != 'index', metadata.slug.current){
				'url': $baseUrl + select(metadata.slug.current == 'index' => '', '/' + metadata.slug.current),
				'lastModified': _updatedAt,
				'priority': select(
					metadata.slug.current == 'index' => 1,
					0.5
				)
			},
			'posts': *[
				_type == 'blog.post'
				&& defined(metadata.slug.current)
				&& metadata.noIndex != true
			]|order(publishDate desc){
				'url': $baseUrl + '/' + $blogDir + '/' + select(
					(!defined(language) || language == $defaultLang) => metadata.slug.current,
					language + '/' + metadata.slug.current
				),
				'lastModified': _updatedAt,
				'priority': 0.4
			},
			'categories': *[
				_type == 'product.category' && showInCatalog == true && defined(slug_en.current)
			]{
				'url': $baseUrl + '/en/proizvodi/' + slug_en.current,
				'lastModified': _updatedAt,
				'priority': 0.5
			},
			'products': *[
				_type == 'product' && hidden != true && language == 'en'
				&& defined(metadata.slug.current)
				&& metadata.noIndex != true
			]|order(title){
				'url': $baseUrl + '/' + $productsDir + '/' + select(
					(!defined(language) || language == $defaultLang) => metadata.slug.current,
					language + '/' + metadata.slug.current
				),
				'lastModified': _updatedAt,
				'priority': 0.4
			}
		}`,
		params: {
			baseUrl: SITE_URL,
			blogDir: ROUTES.blog,
			productsDir: ROUTES.products,
			defaultLang: DEFAULT_LANG,
		},
	})

	return Array.from(
		new Map(
			Object.values(data)
				.flat()
				.map((entry) => {
					const url = new URL(entry.url)
					url.pathname = publicProductUrl(url.pathname)
					return [url.href, { ...entry, url: url.href }] as const
				}),
		).values(),
	)
}
