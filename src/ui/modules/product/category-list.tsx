import { groq, PortableText, stegaClean } from 'next-sanity'
import Link from 'next/link'
import { categoryUrl } from '@/lib/product-category-url'
import { sanityFetchLive } from '@/sanity/lib/live'
import type {
	CATALOG_CATEGORIES_QUERY_RESULT,
	ProductList,
} from '@/sanity/types'
import Img from '@/ui/img'
import { Module, type ModuleProps } from '@/ui/modules'

export default async function CategoryList({
	intro,
	...props
}: ProductList & ModuleProps) {
	const categories = await sanityFetchLive<CATALOG_CATEGORIES_QUERY_RESULT>({
		query: CATALOG_CATEGORIES_QUERY,
	})
	return (
		<Module className="section space-y-8" {...props}>
			{intro && (
				<header className="prose mx-auto text-center">
					<PortableText value={intro} />
				</header>
			)}
			<ul className="grid gap-6 md:grid-cols-3">
				{categories.map((category) => (
					<li
						key={category._id}
						className="border-stroke overflow-hidden rounded-lg border"
					>
						<Link
							href={categoryUrl(stegaClean(category.slug!))}
							className="hover:bg-foreground/5 block h-full p-6"
						>
							{category.image?.asset && (
								<Img
									image={category.image}
									alt={category.image.alt ?? category.title ?? ''}
									width={600}
									height={400}
									className="mb-5 aspect-[3/2] w-full object-cover"
								/>
							)}
							<h2 className="text-xl font-semibold">{category.title}</h2>
							{category.description && (
								<p className="mt-3 whitespace-pre-line">
									{category.description}
								</p>
							)}
						</Link>
					</li>
				))}
			</ul>
		</Module>
	)
}

const CATALOG_CATEGORIES_QUERY = groq`*[
	_type == 'product.category' && showInCatalog == true && defined(slug_en.current)
]|order(coalesce(sortOrder, 0) asc, title_en asc){
	_id, 'title': title_en, 'description': description_en, 'slug': slug_en.current,
	image{..., asset->}
}`
