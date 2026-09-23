import type { Metadata } from 'next'
import { groq, stegaClean } from 'next-sanity'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { categoryUrl } from '@/lib/product-category-url'
import { publicProductUrl } from '@/lib/public-product-url'
import { breadcrumbs, categorySeo } from '@/lib/seo'
import { CLAROPLAST_SLUG, SITE_URL } from '@/lib/site-url'
import { urlFor } from '@/sanity/lib/image'
import { sanityFetchLive } from '@/sanity/lib/live'
import type { CATALOG_CATEGORY_QUERY_RESULT } from '@/sanity/types'
import Img from '@/ui/img'
import PaginatedProducts from '@/ui/modules/product/product-list/paginated-products'
import StructuredData from '@/ui/structured-data'

type Props = {
	params: Promise<{ category: string }>
	searchParams?: Promise<{ page?: string | string[] }>
}

export async function getCategory(slug: string) {
	return sanityFetchLive<CATALOG_CATEGORY_QUERY_RESULT>({
		query: CATALOG_CATEGORY_QUERY,
		params: { slug: slug === CLAROPLAST_SLUG ? 'claroplast' : slug },
	})
}

function pageNumber(
	value: string | string[] | undefined,
	count: number,
	perPage: number,
) {
	const requested =
		typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : 1
	return Math.min(
		Math.max(1, requested),
		Math.max(1, Math.ceil(count / perPage)),
	)
}
function pageUrl(path: string, page: number) {
	return page > 1 ? `${path}?page=${page}` : path
}

export async function generateMetadata({
	params,
	searchParams,
}: Props): Promise<Metadata> {
	const category = await getCategory((await params).category)
	if (!category) notFound()
	const slug = stegaClean(category.slug!)
	const perPage = slug === 'ivd-reagents' ? 24 : 12
	const page = pageNumber(
		(await searchParams)?.page,
		category.products.length,
		perPage,
	)
	const seo = categorySeo[slug] ?? {
		title: category.title,
		description: category.description,
	}
	const title = `${seo.title ?? ''}${page > 1 ? ` – Page ${page}` : ''}`
	const description = `${seo.description ?? ''}${page > 1 ? ` Page ${page}.` : ''}`
	const canonical = SITE_URL + pageUrl(categoryUrl(slug), page)
	const images = category.image?.asset
		? [urlFor(category.image).width(1200).url()]
		: []
	return {
		title,
		description,
		alternates: { canonical },
		openGraph: { title, description, url: canonical, type: 'website', images },
		twitter: {
			card: images.length ? 'summary_large_image' : 'summary',
			title,
			description,
			images,
		},
	}
}

export default async function CategoryPage({ params, searchParams }: Props) {
	const category = await getCategory((await params).category)
	if (!category) notFound()
	const slug = stegaClean(category.slug!)
	const isClaroplast = slug === 'claroplast'
	const title = isClaroplast
		? 'Claroplast – Histology Paraffin Wax'
		: category.title
	const path = categoryUrl(slug)
	const perPage = slug === 'ivd-reagents' ? 24 : 12
	const page = pageNumber(
		(await searchParams)?.page,
		category.products.length,
		perPage,
	)
	const totalPages = Math.max(1, Math.ceil(category.products.length / perPage))
	const products = category.products.slice((page - 1) * perPage, page * perPage)
	const description = isClaroplast
		? category.description?.replace(
				'Claroplast is a universal histology-grade paraffin for routine tissue infiltration and embedding. Manufactured by Claro-prom in Croatia, European Union, it is formulated',
				'Claroplast is a universal histology paraffin wax for routine tissue infiltration and embedding, manufactured by Claro-prom in Croatia, European Union. It is formulated',
			)
		: category.description
	const paragraphs = description?.split('\n\n') ?? []
	const pagination =
		totalPages > 1 ? (
			<nav
				aria-label="Pagination"
				className="gap-ch flex items-center justify-center tabular-nums"
			>
				{page > 1 ? (
					<Link
						href={pageUrl(path, page - 1)}
						rel="prev"
						aria-label="Previous page"
						className="cursor-pointer hover:underline"
					>
						Prev
					</Link>
				) : (
					<button
						disabled
						aria-label="Previous page"
						className="cursor-pointer disabled:opacity-50"
					>
						Prev
					</button>
				)}
				<span>
					{page} of {totalPages}
				</span>
				{page < totalPages ? (
					<Link
						href={pageUrl(path, page + 1)}
						rel="next"
						aria-label="Next page"
						className="cursor-pointer hover:underline"
					>
						Next
					</Link>
				) : (
					<button
						disabled
						aria-label="Next page"
						className="cursor-pointer disabled:opacity-50"
					>
						Next
					</button>
				)}
			</nav>
		) : null
	return (
		<article className="section space-y-10">
			<StructuredData
				data={breadcrumbs([
					{ name: 'Home', path: '/' },
					{ name: 'Products', path: '/products' },
					{ name: title ?? '', path },
				])}
			/>
			{isClaroplast && (
				<StructuredData
					data={{
						'@context': 'https://schema.org',
						'@type': 'CollectionPage',
						'@id': `${SITE_URL}${path}#webpage`,
						url: SITE_URL + path,
						name: title,
						description: categorySeo.claroplast.description,
						publisher: { '@id': `${SITE_URL}/#organization` },
						mainEntity: {
							'@type': 'ItemList',
							numberOfItems: products.length,
							itemListElement: products.map((product, index) => ({
								'@type': 'ListItem',
								position: index + 1,
								item: {
									'@id': `${SITE_URL}${publicProductUrl(product.slug!)}#product`,
									url: SITE_URL + publicProductUrl(product.slug!),
									name: product.title,
								},
							})),
						},
					}}
				/>
			)}
			<nav aria-label="Breadcrumb">
				<Link href="/products" className="underline">
					Products
				</Link>
				<span aria-hidden="true"> / </span>
				<span aria-current="page">{category.title}</span>
			</nav>
			<header className="space-y-5">
				<h1 className="text-3xl font-semibold md:text-4xl">{title}</h1>
				{isClaroplast ? (
					<div className="max-w-3xl space-y-5">
						{paragraphs.map((text, i) =>
							text.trim() === 'OEM / Private Label Manufacturing' ? (
								<h2 key={i}>OEM and Private-Label Histology Paraffin</h2>
							) : (
								<p key={i} className="whitespace-pre-line">
									{text}
								</p>
							),
						)}
						<Link href="/kontakt" className="underline">
							Contact Claro-prom about OEM and private-label manufacturing
						</Link>
					</div>
				) : (
					category.description && (
						<p className="max-w-3xl whitespace-pre-line">
							{category.description}
						</p>
					)
				)}
				{category.image?.asset && (
					<Img
						image={category.image}
						alt={category.image.alt ?? title ?? ''}
						width={960}
						height={480}
						className="max-h-96 w-full rounded-lg object-contain"
					/>
				)}
			</header>
			<Suspense fallback={<p>Loading products...</p>}>
				<PaginatedProducts
					products={products}
					productsPerPage={perPage}
					filterByQuery={false}
					serverPagination={pagination}
					noProductsLabel="No products available yet."
				/>
			</Suspense>
		</article>
	)
}

const CATALOG_CATEGORY_QUERY = groq`*[
	_type == 'product.category' && showInCatalog == true && slug_en.current == $slug
][0]{
	_id, 'title': title_en, 'description': description_en, 'slug': slug_en.current,
	image{..., asset->},
	'products': *[
		_type == 'product' && hidden != true && language == 'en'
		&& category._ref == ^._id && defined(metadata.slug.current)
	]|order(title asc){
		_id, title, image{..., asset->},
		'slug': '/products/en/' + metadata.slug.current
	}
}`
