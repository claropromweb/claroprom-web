'use client'

import { useQueryState } from 'nuqs'
import { usePagination } from '@/hooks/usePagination'
import ProductPreview, {
	type ProductPreviewItem,
} from '@/ui/modules/product/product-preview'

type Props = {
	products: ProductPreviewItem[]
	productsPerPage?: number
	filterByQuery?: boolean
	noProductsLabel: string
	serverPagination?: React.ReactNode
}

export default function PaginatedProducts(props: Props) {
	// Category pages are sliced on the server so crawlers and readers receive the
	// same page. Do not let the client pagination hook reset their page query.
	if (props.serverPagination !== undefined)
		return (
			<ProductList
				products={props.products}
				pagination={props.serverPagination}
				noProductsLabel={props.noProductsLabel}
			/>
		)
	return <ClientPaginatedProducts {...props} />
}

function ClientPaginatedProducts({
	products,
	productsPerPage,
	noProductsLabel,
	filterByQuery = true,
}: Props) {
	const [category] = useQueryState('category')
	const processedProducts = products?.filter((product) =>
		!filterByQuery || !category ? true : product.categorySlug === category,
	)
	const { paginatedItems, Pagination } = usePagination({
		items: processedProducts ?? [],
		itemsPerPage: productsPerPage,
	})
	return (
		<ProductList
			products={paginatedItems}
			noProductsLabel={noProductsLabel}
			pagination={
				<Pagination
					className="gap-ch flex items-center justify-center tabular-nums"
					buttonClassName="cursor-pointer not-disabled:hover:underline disabled:opacity-50"
				/>
			}
		/>
	)
}

function ProductList({
	products,
	pagination,
	noProductsLabel,
}: {
	products: ProductPreviewItem[]
	pagination: React.ReactNode
	noProductsLabel: string
}) {
	if (!products?.length)
		return (
			<p className="text-foreground/60 py-8 text-center">{noProductsLabel}</p>
		)
	return (
		<>
			<ul className="grid grid-cols-2 items-start gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
				{products.map((product) => (
					<ProductPreview
						product={product}
						className="anim-fade"
						key={product._id}
					/>
				))}
			</ul>
			{pagination}
		</>
	)
}
