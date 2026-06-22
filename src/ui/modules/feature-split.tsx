import { stegaClean } from 'next-sanity'
import { cn } from '@/lib/utils'
import type { FeatureSplit } from '@/sanity/types'
import Img from '@/ui/img'
import { Module } from '.'

export default function ({
	pretitle,
	title,
	items,
	image,
	...props
}: FeatureSplit) {
	return (
		<Module className="section space-y-10 py-16 md:space-y-14 md:py-20 lg:py-24" {...props}>
			{(pretitle || title) && (
				<header className="mx-auto max-w-3xl space-y-3 text-center">
					{pretitle && (
						<p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600">
							{stegaClean(pretitle)}
						</p>
					)}
					{title && (
						<h2 className="h2 text-balance">{stegaClean(title)}</h2>
					)}
				</header>
			)}

			<div className="grid items-center gap-10 md:grid-cols-2 md:gap-14 lg:gap-16">
				{items && items.length > 0 && (
					<div>
						{items.map(({ _key, header, text }, index) => (
							<div
								key={_key}
								className={cn(
									'space-y-2 py-8',
									index > 0 && 'border-stroke border-t',
									index === items.length - 1 && 'pb-0',
									index === 0 && 'pt-0',
								)}
							>
								{header && (
									<h3 className="text-lg font-bold">{stegaClean(header)}</h3>
								)}
								{text && (
									<p className="text-sm leading-relaxed text-foreground/70 md:text-base">
										{stegaClean(text)}
									</p>
								)}
							</div>
						))}
					</div>
				)}

				{image && (
					<figure className="mx-auto w-full max-w-md overflow-hidden rounded-2xl md:mx-0 md:max-w-none">
						<Img
							className="aspect-[4/3] w-full object-cover md:aspect-[5/4]"
							image={image}
							width={720}
							height={576}
							alt={image.alt ?? ''}
						/>
					</figure>
				)}
			</div>
		</Module>
	)
}
