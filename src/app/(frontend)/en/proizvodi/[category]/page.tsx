import type { Metadata } from 'next'
import { groq, stegaClean } from 'next-sanity'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { categoryUrl } from '@/lib/product-category-url'
import { urlFor } from '@/sanity/lib/image'
import { sanityFetchLive } from '@/sanity/lib/live'
import type { CATALOG_CATEGORY_QUERY_RESULT } from '@/sanity/types'
import Img from '@/ui/img'
import PaginatedProducts from '@/ui/modules/product/product-list/paginated-products'

type Props = { params: Promise<{ category: string }> }

async function getCategory(slug: string) {
	return sanityFetchLive<CATALOG_CATEGORY_QUERY_RESULT>({
		query: CATALOG_CATEGORY_QUERY,
		params: { slug },
	})
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const category = await getCategory((await params).category)
	if (!category) notFound()
	return {
		title: category.title,
		description: category.description,
		alternates: { canonical: categoryUrl(stegaClean(category.slug!)) },
		openGraph: {
			title: category.title ?? undefined,
			description: category.description ?? undefined,
			images: category.image?.asset
				? [urlFor(category.image).width(1200).url()]
				: [],
		},
	}
}

export default async function CategoryPage({ params }: Props) {
	const category = await getCategory((await params).category)
	if (!category) notFound()
	return (
		<article className="section space-y-10">
			<nav aria-label="Breadcrumb">
				<Link href="/proizvodi" className="underline">
					Products
				</Link>
				<span aria-hidden="true"> / </span>
				<span aria-current="page">{category.title}</span>
			</nav>
			<header className="space-y-5">
				<h1 className="text-3xl font-semibold md:text-4xl">{category.title}</h1>
				{category.description && (
					<p className="max-w-3xl whitespace-pre-line">
						{category.description}
					</p>
				)}
				{category.image?.asset && (
					<Img
						image={category.image}
						alt={category.image.alt ?? category.title ?? ''}
						width={960}
						height={480}
						className="max-h-96 w-full rounded-lg object-contain"
					/>
				)}
			</header>
			<Suspense fallback={<p>Loading products...</p>}>
				<PaginatedProducts
					products={category.products}
					productsPerPage={12}
					filterByQuery={false}
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
