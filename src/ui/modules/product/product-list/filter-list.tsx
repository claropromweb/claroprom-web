'use client'

import Filter, { type ProductCategoryOption } from './filter'

export default function ({
	categories,
	allLabel,
}: {
	categories: ProductCategoryOption[]
	allLabel: string
}) {
	return (
		<div className="flex flex-wrap items-center justify-center gap-2">
			<Filter>{allLabel}</Filter>

			{categories?.map((category) => (
				<Filter category={category} key={category._id} />
			))}
		</div>
	)
}
