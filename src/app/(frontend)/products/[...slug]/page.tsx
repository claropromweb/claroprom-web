import type { Metadata } from 'next'
import { groq } from 'next-sanity'
import { notFound } from 'next/navigation'
import { ROUTES } from '@/lib/env'
import { DEFAULT_LANG, languages, type Lang } from '@/lib/i18n'
import resolveUrl from '@/lib/resolve-url'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import { sanityFetchLive } from '@/sanity/lib/live'
import {
	GLOBAL_MODULE_EXCLUDE_QUERY,
	MODULES_QUERY,
	TRANSLATIONS_QUERY,
} from '@/sanity/lib/queries'
import type { PRODUCT_QUERY_RESULT } from '@/sanity/types'
import ModulesResolver from '@/ui/modules'

type Props = {
	params: Promise<{ slug: string[] }>
}

export default async function ({ params }: Props) {
	const { slug } = await params
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

	return <ModulesResolver product={resolvedProduct as typeof product} />
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug: rawSlug } = await params
	const product = await getProduct(rawSlug)
	const { title, description, image, noIndex } = product?.metadata ?? {}

	const canonical = product ? resolveUrl(product as any) : undefined

	const alternates: Record<string, string> = {}
	const translations = (product as any)?.translations as
		| Array<{ value?: { language?: string; _type?: string; metadata?: any } }>
		| undefined
	translations?.forEach((entry) => {
		const v = entry?.value
		if (!v?.language) return
		alternates[v.language] = resolveUrl(v as any)
	})
	if ((product as any)?.language)
		alternates[(product as any).language as string] = canonical ?? '/'

	return {
		title: title || product?.title,
		description,
		openGraph: {
			title: title || product?.title || undefined,
			description,
			url: canonical
				? `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}${canonical}`
				: undefined,
			images: [
				image
					? urlFor(image).width(1200).url()
					: product?.image
						? urlFor(product.image).width(1200).url()
						: `${process.env.NEXT_PUBLIC_BASE_URL}/api/og?slug=${ROUTES.products}/${product?.metadata?.slug?.current ?? ''}`,
			],
		},
		robots: {
			index: noIndex ? false : undefined,
		},
		alternates: {
			canonical,
			languages: Object.keys(alternates).length ? alternates : undefined,
		},
	}
}

export async function generateStaticParams() {
	const products = await client.fetch<
		{ slug: string; language?: string | null }[]
	>(
		groq`*[_type == 'product' && hidden != true && defined(metadata.slug.current)]{
			'slug': metadata.slug.current,
			language
		}`,
	)

	return products.map(({ slug, language }) => {
		const parts = slug.split('/')
		if (language && language !== DEFAULT_LANG) {
			return { slug: [language, ...parts] }
		}
		return { slug: parts }
	})
}

async function getProduct(slugInput: string[]) {
	const { slug, lang } = processSlug(slugInput)

	return await sanityFetchLive<PRODUCT_QUERY_RESULT>({
		query: PRODUCT_QUERY,
		params: {
			slug,
			productsDir: `${ROUTES.products}/`,
			productsBase: ROUTES.products,
			lang: lang ?? DEFAULT_LANG,
			defaultLang: DEFAULT_LANG,
		},
	})
}

function processSlug(slug: string[]): { slug: string; lang?: Lang } {
	const lang = languages.includes(slug[0] as Lang)
		? (slug[0] as Lang)
		: undefined

	const path = lang ? slug.slice(1).join('/') : slug.join('/')
	return { slug: path, lang }
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
