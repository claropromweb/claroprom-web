'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { VscLoading, VscSearch } from 'react-icons/vsc'
import getLang from '@/lib/get-lang'
import { cn } from '@/lib/utils'
import Img from '@/ui/img'
import { getProductTranslations } from '@/ui/modules/product/translations'
import { searchProducts, type ProductSearchResult } from './search'

export default function ProductSearch({ className }: { className?: string }) {
	const lang = getLang()
	const t = getProductTranslations(lang)
	const router = useRouter()

	const [query, setQuery] = useState('')
	const [results, setResults] = useState<ProductSearchResult[]>([])
	const [loading, setLoading] = useState(false)
	const [open, setOpen] = useState(false)

	const rootRef = useRef<HTMLDivElement>(null)
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const requestRef = useRef(0)

	// Close the dropdown when clicking outside.
	useEffect(() => {
		function onPointerDown(e: MouseEvent) {
			if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
		}
		document.addEventListener('mousedown', onPointerDown)
		return () => document.removeEventListener('mousedown', onPointerDown)
	}, [])

	function runSearch(value: string) {
		setQuery(value)
		if (debounceRef.current) clearTimeout(debounceRef.current)

		const trimmed = value.trim()
		if (!trimmed) {
			setResults([])
			setLoading(false)
			setOpen(false)
			return
		}

		setLoading(true)
		setOpen(true)

		debounceRef.current = setTimeout(async () => {
			const requestId = ++requestRef.current
			const res = await searchProducts(trimmed, lang)
			// Ignore responses that arrived out of order.
			if (requestId !== requestRef.current) return
			setResults(res)
			setLoading(false)
		}, 300)
	}

	function goTo(slug?: string | null) {
		setOpen(false)
		if (slug) router.push(slug)
	}

	const showDropdown = open && query.trim().length > 0

	return (
		<div ref={rootRef} className={cn('relative', className)}>
			<search>
				<div className="border-foreground/15 focus-within:border-foreground/30 bg-background flex items-center gap-2 rounded-full border py-1.5 pr-1.5 pl-4 transition-colors">
					<VscSearch className="text-foreground/50 shrink-0" />

					<input
						className="grow bg-transparent py-1.5 outline-none"
						type="search"
						placeholder={t.search}
						value={query}
						onChange={(e) => runSearch(e.target.value)}
						onFocus={() => query.trim() && setOpen(true)}
						onKeyDown={(e) => {
							if (e.key === 'Escape') setOpen(false)
							if (e.key === 'Enter' && results[0])
								goTo(results[0].slug)
						}}
					/>

					{loading && (
						<VscLoading className="text-foreground/50 shrink-0 animate-spin" />
					)}

					<button
						type="button"
						onClick={() => results[0] && goTo(results[0].slug)}
						className="shrink-0 rounded-full bg-red-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-red-700 active:scale-98"
					>
						{t.searchButton}
					</button>
				</div>

				{showDropdown && (
					<div className="anim-fade border-stroke bg-background absolute inset-x-0 top-full z-50 mt-2 max-h-[60vh] origin-top overflow-hidden overflow-y-auto rounded-2xl border shadow-xl starting:-translate-y-1">
						{loading ? (
							<p className="text-foreground/50 p-4 text-sm">
								{t.search}…
							</p>
						) : results.length ? (
							<ul>
								{results.map((product) => (
									<li key={product._id}>
										<button
											type="button"
											onClick={() => goTo(product.slug)}
											className="hover:bg-foreground/5 flex w-full items-center gap-4 px-4 py-3 text-left transition-colors"
										>
											<span className="bg-foreground/5 flex size-12 shrink-0 items-center justify-center overflow-hidden">
												{product.image?.asset && (
													<Img
														className="size-full object-contain"
														image={product.image}
														width={96}
														height={96}
														alt={
															product.image?.alt ??
															product.title ??
															''
														}
													/>
												)}
											</span>

											<span className="grid gap-0.5">
												<span className="leading-snug font-medium">
													{product.title}
												</span>
												{product.categoryTitle && (
													<span className="text-foreground/50 text-sm">
														{product.categoryTitle}
													</span>
												)}
											</span>
										</button>
									</li>
								))}
							</ul>
						) : (
							<p className="text-foreground/50 p-4 text-sm">
								{t.noResults}
							</p>
						)}
					</div>
				)}
			</search>
		</div>
	)
}
