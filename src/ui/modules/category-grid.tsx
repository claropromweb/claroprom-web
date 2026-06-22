import { stegaClean } from 'next-sanity'
import type { CategoryGrid } from '@/sanity/types'
import Img from '@/ui/img'
import SanityLink, { type SanityLinkType } from '@/ui/sanity-link'
import { Module } from '.'

type Category = NonNullable<CategoryGrid['categories']>[number]

function CategoryColumn({
	title,
	description,
	image,
	link,
}: Category) {
	const hasLink =
		link?.type === 'internal'
			? !!link.internal
			: link?.type === 'external'
				? !!link.external
				: false

	const className =
		'group relative flex min-h-80 flex-col items-center justify-center overflow-hidden px-6 py-16 text-center text-white sm:min-h-96'

	const content = (
		<>
			{image && (
				<Img
					className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
					image={image}
					width={480}
					height={640}
					sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
					alt={image.alt ?? ''}
				/>
			)}

			<div
				aria-hidden
				className="absolute inset-0 bg-black/45 transition-colors duration-500 group-hover:bg-black/55"
			/>

			<div className="relative z-10 max-w-xs space-y-3">
				{title && (
					<h3 className="text-2xl font-bold">{stegaClean(title)}</h3>
				)}
				{description && (
					<p className="text-sm leading-relaxed text-white/90 md:text-base">
						{stegaClean(description)}
					</p>
				)}
			</div>
		</>
	)

	if (hasLink) {
		return (
			<SanityLink
				link={link as SanityLinkType}
				className={className}
				aria-label={title ? stegaClean(title) : undefined}
			>
				{content}
			</SanityLink>
		)
	}

	return <article className={className}>{content}</article>
}

export default function ({
	pretitle,
	heading,
	categories,
	...props
}: CategoryGrid) {
	return (
		<Module {...props}>
			{(pretitle || heading) && (
				<header className="bg-red-600 px-6 py-14 text-center text-white md:py-16">
					{pretitle && (
						<p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
							{stegaClean(pretitle)}
						</p>
					)}
					{heading && (
						<h2 className="mt-3 text-3xl font-normal text-balance md:text-4xl">
							{stegaClean(heading)}
						</h2>
					)}
				</header>
			)}

			{!!categories?.length && (
				<div className="grid sm:grid-cols-2 lg:grid-cols-4">
					{categories.map((category) => (
						<CategoryColumn key={category._key} {...category} />
					))}
				</div>
			)}
		</Module>
	)
}
