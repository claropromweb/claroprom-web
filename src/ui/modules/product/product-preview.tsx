import Link from 'next/link'
import { cn } from '@/lib/utils'
import Img from '@/ui/img'

export type ProductPreviewItem = {
	_id: string
	title?: string | null
	slug?: string | null
	categorySlug?: string | null
	categoryTitle?: string | null
	image?: any
}

export default function ({
	product,
	className,
}: { product: ProductPreviewItem } & React.ComponentProps<'li'>) {
	return (
		<li className={cn('group relative grid justify-items-center gap-3', className)}>
			<figure className="flex aspect-square w-full items-center justify-center overflow-hidden">
				{product.image?.asset ? (
					<Img
						className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
						image={product.image}
						width={400}
						height={400}
						sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
						alt={product.image?.alt ?? product.title ?? ''}
					/>
				) : (
					<div className="bg-foreground/5 h-full w-full" />
				)}
			</figure>

			{product.slug ? (
				<Link
					href={product.slug}
					className="text-center text-sm leading-snug text-current before:absolute before:inset-0 hover:underline"
				>
					{product.title}
				</Link>
			) : (
				<span className="text-center text-sm leading-snug">
					{product.title}
				</span>
			)}
		</li>
	)
}
