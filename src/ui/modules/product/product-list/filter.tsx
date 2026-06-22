'use client'

import { cn } from '@/lib/utils'
import { useProductListStore } from './store'

export type ProductCategoryOption = {
	_id: string
	title?: string | null
	slug?: string | null
}

export default function ({
	category,
	children,
}: {
	category?: ProductCategoryOption
} & React.ComponentProps<'button'>) {
	const { categoryParam, setCategoryParam } = useProductListStore()
	const slug = category?.slug ?? undefined
	const isActive = categoryParam === slug || (!categoryParam && !category)

	return (
		<button
			className={cn(
				// Matches the single-product buttons (src/ui/modules/product/product-content.tsx)
				'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition-colors active:scale-98',
				isActive
					? 'bg-red-600 text-white hover:bg-red-700'
					: 'bg-foreground/5 text-foreground hover:bg-foreground/10',
			)}
			onClick={() => {
				if (categoryParam === slug) {
					setCategoryParam(null)
				} else {
					setCategoryParam(slug ?? null)
				}
			}}
		>
			{children || category?.title}
		</button>
	)
}
