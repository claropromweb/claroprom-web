'use client'

import { useQueryState } from 'nuqs'
import { usePagination } from '@/hooks/usePagination'
import ProductPreview, {
	type ProductPreviewItem,
} from '@/ui/modules/product/product-preview'

export default function ({
	products,
	productsPerPage,
	noProductsLabel,
	filterByQuery = true,
}: {
	products: ProductPreviewItem[]
	productsPerPage?: number
	filterByQuery?: boolean
	noProductsLabel: string
}) {
	const [category] = useQueryState('category')

	const processedProducts = products?.filter((product) =>
		!filterByQuery || !category ? true : product.categorySlug === category,
	)

	const { paginatedItems, Pagination } = usePagination({
		items: processedProducts ?? [],
		itemsPerPage: productsPerPage,
	})

	if (!paginatedItems?.length) {
		return (
			<p className="text-foreground/60 py-8 text-center">{noProductsLabel}</p>
		)
	}

	return (
		<>
			<ul className="grid grid-cols-2 items-start gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
				{paginatedItems.map((product) => (
					<ProductPreview
						product={product}
						className="anim-fade"
						key={product._id}
					/>
				))}
			</ul>

			<Pagination
				className="gap-ch flex items-center justify-center tabular-nums"
				buttonClassName="cursor-pointer not-disabled:hover:underline disabled:opacity-50"
			/>
		</>
	)
}
