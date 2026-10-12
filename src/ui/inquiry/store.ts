'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { InquiryItem } from '@/lib/inquiry-items'

type State = {
	items: InquiryItem[]
	add: (item: InquiryItem) => void
	quantity: (key: string, quantity: number) => void
	remove: (key: string) => void
	clear: () => void
}
export const itemKey = (item: Pick<InquiryItem, 'productId' | 'rowKey'>) =>
	item.productId + ':' + item.rowKey
export const useInquiry = create<State>()(
	persist(
		(set) => ({
			items: [],
			add: (item) =>
				set((state) => ({
					items: state.items.some((i) => itemKey(i) === itemKey(item))
						? state.items
						: [...state.items, item].slice(0, 50),
				})),
			quantity: (key, quantity) =>
				set((state) => ({
					items: state.items.map((i) =>
						itemKey(i) === key &&
						Number.isSafeInteger(quantity) &&
						quantity >= 1 &&
						quantity <= 10000
							? { ...i, quantity }
							: i,
					),
				})),
			remove: (key) =>
				set((state) => ({
					items: state.items.filter((i) => itemKey(i) !== key),
				})),
			clear: () => set({ items: [] }),
		}),
		{
			name: 'claroprom-inquiry-v32',
			version: 1,
			skipHydration: true,
			partialize: (state) => ({ items: state.items }),
			merge: (persisted, current) => {
				const values = (persisted as { items?: unknown })?.items
				const items = Array.isArray(values)
					? values
							.filter(
								(i) =>
									i &&
									[
										'productId',
										'rowKey',
										'name',
										'code',
										'packaging',
										'url',
									].every(
										(key) => typeof i[key] === 'string' && i[key].length <= 500,
									) &&
									i.url.startsWith('/products/') &&
									Number.isSafeInteger(i.quantity) &&
									i.quantity >= 1 &&
									i.quantity <= 10000,
							)
							.slice(0, 50)
					: []
				return { ...current, items }
			},
		},
	),
)
