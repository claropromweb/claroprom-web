import Link from 'next/link'
import { CLAROPLAST } from '@/content/claroplast'
import { inquiryRows } from '@/lib/inquiry-items'
import { claroplastPack } from '@/lib/outreach'
import { publicProductUrl } from '@/lib/public-product-url'
import { cn } from '@/lib/utils'
import { AddToInquiry } from '@/ui/inquiry/controls'
import ProductPhoto, { safeProductPhoto } from './product-photo'

export type ProductPreviewItem = {
	_id: string
	title?: string | null
	slug?: string | null
	language?: string | null
	shortDescription?: string | null
	categorySlug?: string | null
	categoryTitle?: string | null
	table?: Array<{
		_key?: string
		code?: string | null
		format?: string | null
	}> | null
	image?: React.ComponentProps<typeof ProductPhoto>['image']
}

export default function ProductPreview({
	product,
	className,
}: { product: ProductPreviewItem } & React.ComponentProps<'li'>) {
	const pack = claroplastPack(product.slug)
	const codes = pack
		? [pack.code]
		: [
				...new Set(
					product.table?.map((row) => row.code?.trim()).filter(Boolean) ?? [],
				),
			]
	const formats = pack
		? [pack.packaging]
		: [
				...new Set(
					product.table?.map((row) => row.format?.trim()).filter(Boolean) ?? [],
				),
			]
	// No automatic description/intended-purpose fallback: summaries require editorial review.
	const summary = pack ? CLAROPLAST.summary : product.shortDescription?.trim()
	const hasPhoto = !!safeProductPhoto(product.image)
	const inquiryItems = inquiryRows({
		...product,
		metadata: {
			slug: { current: product.slug?.split('/').filter(Boolean).at(-1) },
		},
	})
	return (
		<li
			className={cn(
				'group relative flex h-full min-w-0 flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4',
				className,
			)}
		>
			{hasPhoto && (
				<figure className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-md bg-neutral-50 p-2">
					<ProductPhoto
						image={product.image}
						title={product.title}
						width={640}
						sizes="(max-width: 639px) 90vw, (max-width: 1023px) 40vw, 22vw"
					/>
					{product.image?.caption && (
						<span className="sr-only">{product.image?.caption}</span>
					)}
				</figure>
			)}
			<div className="flex flex-1 flex-col gap-3">
				{product.slug ? (
					<Link
						href={publicProductUrl(product.slug)}
						className="text-base leading-snug font-semibold break-words text-current before:absolute before:inset-0 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-600"
					>
						{pack?.name ?? product.title}
					</Link>
				) : (
					<span className="text-base leading-snug font-semibold">
						{product.title}
					</span>
				)}
				{summary && (
					<p className="line-clamp-3 text-sm leading-relaxed text-neutral-600">
						{summary}
					</p>
				)}
				{product.image?.caption && (
					<p className="text-xs text-neutral-500">{product.image?.caption}</p>
				)}
				{(formats.length > 0 || codes.length > 0) && (
					<dl className="mt-auto space-y-2 border-t border-neutral-100 pt-3 text-sm">
						{!!formats.length && (
							<div>
								<dt className="text-xs text-neutral-500">Packaging</dt>
								<dd>{formats.join(' / ')}</dd>
							</div>
						)}
						{!!codes.length && (
							<div>
								<dt className="text-xs text-neutral-500">Catalogue No.</dt>
								<dd className="font-medium break-words">{codes.join(', ')}</dd>
							</div>
						)}
					</dl>
				)}
				{product.slug && (
					<span className="pt-1 text-sm font-medium text-red-700">
						View product →
					</span>
				)}
			</div>
			{inquiryItems.length === 1 && <AddToInquiry item={inquiryItems[0]} />}
		</li>
	)
}
