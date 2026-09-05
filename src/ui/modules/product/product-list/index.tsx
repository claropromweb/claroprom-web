import { groq, PortableText } from 'next-sanity'
import { Suspense } from 'react'
import { ROUTES } from '@/lib/env'
import getLangServer from '@/lib/get-lang-server'
import { DEFAULT_LANG } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { sanityFetchLive } from '@/sanity/lib/live'
import type { ProductList } from '@/sanity/types'
import Loading from '@/ui/loading'
import { Module, type ModuleProps } from '@/ui/modules'
import CategoryList from '../category-list'
import { getProductTranslations } from '../translations'
import FilterList from './filter-list'
import PaginatedProducts from './paginated-products'

export default async function ({
	intro,
	display,
	productsPerPage = 12,
	...props
}: ProductList & ModuleProps) {
	if (display === 'categories') return <CategoryList intro={intro} {...props} />

	const lang = await getLangServer()
	const t = getProductTranslations(lang)

	const [products, categories] = await Promise.all([
		sanityFetchLive<any>({
			query: PRODUCT_LIST_QUERY,
			params: {
				lang,
				defaultLang: DEFAULT_LANG,
				productsDir: `/${ROUTES.products}/`,
			},
		}),
		sanityFetchLive<any>({
			query: PRODUCT_CATEGORIES_QUERY,
			params: { lang, defaultLang: DEFAULT_LANG },
		}),
	])

	return (
		<Module className={cn('section space-y-lh', intro && 'pt-4')} {...props}>
			{intro && (
				<header className="prose mx-auto text-center">
					<PortableText value={intro} />
				</header>
			)}

			<div className="gap-lh grid">
				<Suspense
					fallback={
						<Loading className="p-[.25em_.5em]">Loading categories...</Loading>
					}
				>
					<FilterList categories={categories ?? []} allLabel={t.all} />
				</Suspense>

				<Suspense fallback={<Loading className="py-8">Loading...</Loading>}>
					<PaginatedProducts
						products={products ?? []}
						productsPerPage={productsPerPage}
						noProductsLabel={t.noProducts}
					/>
				</Suspense>
			</div>
		</Module>
	)
}

const PRODUCT_LIST_QUERY = groq`
	*[_type == 'product' && hidden != true && coalesce(language, $defaultLang) == $lang]|order(title asc){
		_id,
		title,
		image{
			...,
			asset->
		},
		'categorySlug': select(
			$lang == 'en' => coalesce(category->slug_en.current, category->slug.current),
			category->slug.current
		),
		'categoryTitle': select(
			$lang == 'en' => coalesce(category->title_en, category->title),
			category->title
		),
		'slug': select(
			$lang == '${DEFAULT_LANG}' => $productsDir + metadata.slug.current,
			$productsDir + $lang + '/' + metadata.slug.current
		),
	}
`

const PRODUCT_CATEGORIES_QUERY = groq`
	*[
		_type == 'product.category'
		&& count(*[_type == 'product' && hidden != true && references(^._id) && coalesce(language, $defaultLang) == $lang]) > 0
	]{
		_id,
		'title': select(
			$lang == 'en' => coalesce(title_en, title),
			title
		),
		'slug': select(
			$lang == 'en' => coalesce(slug_en.current, slug.current),
			slug.current
		),
	}|order(title asc)
`
