import type { Metadata } from 'next'
import { groq } from 'next-sanity'
import { notFound } from 'next/navigation'
import { ROUTES } from '@/lib/env'
import { DEFAULT_LANG } from '@/lib/i18n'
import { categoryUrl } from '@/lib/product-category-url'
import resolveUrl from '@/lib/resolve-url'
import { breadcrumbs } from '@/lib/seo'
import { SITE_URL } from '@/lib/site-url'
import { urlFor } from '@/sanity/lib/image'
import { sanityFetchLive } from '@/sanity/lib/live'
import {
	GLOBAL_MODULE_EXCLUDE_QUERY,
	MODULES_QUERY,
	TRANSLATIONS_QUERY,
} from '@/sanity/lib/queries'
import type { PRODUCT_QUERY_RESULT } from '@/sanity/types'
import ModulesResolver from '@/ui/modules'
import CategoryPage, {
	generateMetadata as categoryMetadata,
	getCategory,
} from '@/ui/modules/product/category-page'
import StructuredData from '@/ui/structured-data'

export const dynamic = 'force-dynamic'

type Props = {
	params: Promise<{ slug: string }>
	searchParams?: Promise<{ page?: string | string[] }>
}

export default async function ({ params, searchParams }: Props) {
	const { slug } = await params
	if (await getCategory(slug))
		return CategoryPage({
			params: Promise.resolve({ category: slug }),
			searchParams,
		})
	const product = await getProduct(slug)
	if (!product) notFound()

	// The single-product view is rendered by the `product-content` module, which
	// is normally injected via a global module on the `products/` path (same
	// pattern as blog posts). If none is configured, fall back to rendering it
	// automatically so products always display their content.
	const modules = product.modules ?? []
	const hasContent = modules.some((m) => m?._type === 'product-content')

	const resolvedProduct = hasContent
		? product
		: {
				...product,
				modules: [
					...modules,
					{
						_type: 'product-content',
						_key: 'product-content',
						showRelated: true,
						relatedLimit: 4,
					},
				],
			}

	const category = product.category as any
	const path = resolveUrl(product)
	const codes = product.table?.map((row) => row.code).filter(Boolean) ?? []
	return (
		<>
			<StructuredData
				data={{
					'@context': 'https://schema.org',
					'@type': 'Product',
					name: product.title,
					url: SITE_URL + path,
					sku: codes.length === 1 ? codes[0] : undefined,
					description: product.metadata?.description || undefined,
					image: product.image?.asset
						? urlFor(product.image).width(1200).url()
						: undefined,
					category: category?.title_en || undefined,
					manufacturer:
						product.manufacturerRole === 'manufacturer'
							? { '@id': `${SITE_URL}/#organization` }
							: undefined,
				}}
			/>
			<StructuredData
				data={breadcrumbs([
					{ name: 'Home', path: '/' },
					{ name: 'Products', path: '/products' },
					...(category?.showInCatalog && category?.slug_en?.current
						? [
								{
									name: category.title_en,
									path: categoryUrl(category.slug_en.current),
								},
							]
						: []),
					{ name: product.title ?? '', path },
				])}
			/>
			<ModulesResolver product={resolvedProduct as typeof product} />
		</>
	)
}

export async function generateMetadata({
	params,
	searchParams,
}: Props): Promise<Metadata> {
	const { slug: rawSlug } = await params
	if (await getCategory(rawSlug))
		return categoryMetadata({
			params: Promise.resolve({ category: rawSlug }),
			searchParams,
		})
	const product = await getProduct(rawSlug)
	if (!product) notFound()
	const {
		title: manualTitle,
		description: manualDescription,
		image,
		noIndex,
	} = product.metadata ?? {}
	const codes = product.table
		?.map((row) => row.code)
		.filter(Boolean)
		.join(', ')
	const formats = product.table
		?.map((row) => row.format)
		.filter(Boolean)
		.join(', ')
	const title =
		manualTitle || `${product.title}${codes ? ` (${codes})` : ''} | Claro-prom`
	const description =
		manualDescription ||
		[
			product.title,
			codes ? `Code: ${codes}.` : '',
			formats ? `Pack size: ${formats}.` : '',
			product.manufacturerRole === 'manufacturer'
				? 'Manufactured by Claro-prom.'
				: '',
		]
			.filter(Boolean)
			.join(' ')
	const canonical = resolveUrl(product, { base: true })
	const images = image
		? [urlFor(image).width(1200).url()]
		: product.image?.asset
			? [urlFor(product.image).width(1200).url()]
			: []
	return {
		title,
		description,
		openGraph: { title, description, url: canonical, type: 'website', images },
		twitter: {
			card: images.length ? 'summary_large_image' : 'summary',
			title,
			description,
			images,
		},
		robots: { index: noIndex ? false : undefined },
		alternates: { canonical },
	}
}

async function getProduct(slug: string) {
	return await sanityFetchLive<PRODUCT_QUERY_RESULT>({
		query: PRODUCT_QUERY,
		params: {
			slug,
			productsDir: `${ROUTES.products}/`,
			productsBase: ROUTES.products,
			lang: 'en',
			defaultLang: DEFAULT_LANG,
		},
	})
}

const PRODUCT_QUERY = groq`*[_type == 'product' && hidden != true
	&& metadata.slug.current == $slug
	&& coalesce(language, $defaultLang) == $lang
][0]{
	...,
	image{
		...,
		asset->
	},
	gallery[]{ ..., asset-> },
	category->{
		_id,
		title,
		title_en,
		showInCatalog,
		slug,
		slug_en
	},
	instructionsForUse{
		asset->{
			url,
			originalFilename,
			size
		}
	},
	declarationOfConformity{
		asset->{
			url,
			originalFilename,
			size
		}
	},
	technicalDataSheet{
		asset->{
			url,
			originalFilename,
			size
		}
	},
	safetyDataSheet{
		asset->{
			url,
			originalFilename,
			size
		}
	},
	'modules': (
		// global modules (before)
		*[_type == 'global-module' && path == '*' && ${GLOBAL_MODULE_EXCLUDE_QUERY}].before[]{ ${MODULES_QUERY} }
		// path modules (before)
		+ *[_type == 'global-module' && path in [$productsDir, $productsBase]].before[]{ ${MODULES_QUERY} }
		// path modules (after)
		+ *[_type == 'global-module' && path in [$productsDir, $productsBase]].after[]{ ${MODULES_QUERY} }
		// global modules (after)
		+ *[_type == 'global-module' && path == '*' && ${GLOBAL_MODULE_EXCLUDE_QUERY}].after[]{ ${MODULES_QUERY} }
	),
	${TRANSLATIONS_QUERY}
}`
