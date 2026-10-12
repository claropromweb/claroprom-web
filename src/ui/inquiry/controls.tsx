'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import type { InquiryItem } from '@/lib/inquiry-items'
import { itemKey, useInquiry } from './store'

export function InquiryNavigation() {
	const count = useInquiry((s) => s.items.length)
	useEffect(() => {
		void useInquiry.persist.rehydrate()
	}, [])
	return (
		<nav
			aria-label="Business inquiries"
			className="border-b border-neutral-200 bg-neutral-50"
		>
			<div className="section flex flex-wrap items-center justify-end gap-5 py-3 text-sm">
				<Link href="/distributors" className="font-semibold hover:underline">
					Distribution partnerships
				</Link>
				<Link href="/inquiry" className="font-semibold text-red-700 underline">
					Your inquiry ({count})
				</Link>
			</div>
		</nav>
	)
}

export function AddToInquiry({ item }: { item: InquiryItem }) {
	const selected = useInquiry((s) =>
		s.items.some((i) => itemKey(i) === itemKey(item)),
	)
	const full = useInquiry((s) => s.items.length >= 50)
	const add = useInquiry((s) => s.add)
	return (
		<button
			type="button"
			aria-label={`Add ${item.name}, ${item.code} to inquiry`}
			disabled={selected || full}
			onClick={() => add(item)}
			className="relative z-10 rounded-md border border-red-600 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
		>
			{selected ? 'Added to inquiry' : 'Add to Inquiry'}
		</button>
	)
}

export function InquiryBasket() {
	const items = useInquiry((s) => s.items),
		quantity = useInquiry((s) => s.quantity),
		remove = useInquiry((s) => s.remove)
	if (!items.length)
		return (
			<p className="rounded-lg border border-neutral-200 p-6">
				Your inquiry is empty.{' '}
				<Link href="/products" className="underline">
					Browse products
				</Link>{' '}
				and select Add to Inquiry.
			</p>
		)
	return (
		<section aria-label="Selected products" className="space-y-4">
			<p>
				Quantities are numbers of individual product packs, not litres,
				kilograms or transport cartons.
			</p>
			{items.map((item) => (
				<article
					key={itemKey(item)}
					className="grid gap-4 rounded-lg border border-neutral-200 p-5 sm:grid-cols-[1fr_auto]"
				>
					<div className="min-w-0">
						<Link
							href={item.url}
							className="font-semibold break-words underline"
						>
							{item.name}
						</Link>
						<p className="mt-2 text-sm">
							Catalogue No.: {item.code} · Pack size: {item.packaging}
						</p>
					</div>
					<div className="flex flex-wrap items-end gap-4">
						<label className="grid gap-1 text-sm">
							Number of packs
							<input
								aria-label={`Number of packs for ${item.code}`}
								type="number"
								min={1}
								max={10000}
								step={1}
								value={item.quantity}
								onChange={(e) =>
									quantity(itemKey(item), Number(e.target.value))
								}
								className="w-24 rounded border border-neutral-300 px-3 py-2"
							/>
						</label>
						<button
							type="button"
							onClick={() => remove(itemKey(item))}
							aria-label={`Remove ${item.code}`}
							className="min-h-10 text-sm text-red-700 underline"
						>
							Remove
						</button>
					</div>
				</article>
			))}
		</section>
	)
}
