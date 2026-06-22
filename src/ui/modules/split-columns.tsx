import { stegaClean } from 'next-sanity'
import { cn } from '@/lib/utils'
import type { SplitColumns } from '@/sanity/types'
import Img from '@/ui/img'
import SanityLink, { type SanityLinkType } from '@/ui/sanity-link'
import { Module } from '.'

type Column = NonNullable<SplitColumns['columns']>[number]

function SplitColumn({
	title,
	description,
	image,
	link,
	variant,
	className,
}: Column & { variant: 'light' | 'dark'; className?: string }) {
	const isLight = variant === 'light'

	const hasLink =
		link?.type === 'internal'
			? !!link.internal
			: link?.type === 'external'
				? !!link.external
				: false

	const columnClassName = cn(
		'relative flex min-h-72 flex-col justify-center overflow-hidden px-8 py-14 sm:min-h-80 md:px-10 md:py-16 lg:px-12',
		className,
	)

	const content = (
		<>
			{image && (
				<Img
					className="absolute inset-0 h-full w-full object-cover"
					image={image}
					width={720}
					height={480}
					sizes="(max-width: 768px) 100vw, 50vw"
					alt={image.alt ?? ''}
				/>
			)}

			<div
				aria-hidden
				className={cn(
					'absolute inset-0',
					isLight ? 'bg-white/70' : 'bg-red-600/70',
				)}
			/>

			<div
				className={cn(
					'relative z-10 max-w-md space-y-3',
					isLight ? 'text-foreground' : 'text-white',
				)}
			>
				{title && (
					<h3 className="text-2xl font-bold text-balance md:text-3xl">
						{stegaClean(title)}
					</h3>
				)}
				{description && (
					<p
						className={cn(
							'text-sm leading-relaxed md:text-base',
							isLight ? 'text-foreground/70' : 'text-white/90',
						)}
					>
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
				className={columnClassName}
				aria-label={title ? stegaClean(title) : undefined}
			>
				{content}
			</SanityLink>
		)
	}

	return <article className={columnClassName}>{content}</article>
}

export default function ({ columns, ...props }: SplitColumns) {
	if (!columns?.length) return null

	return (
		<Module className="layout-x py-6 md:py-8" {...props}>
			<div className="grid gap-2 md:grid-cols-2">
				{columns.map((column, index) => (
					<SplitColumn
						key={column._key}
						{...column}
						variant={index === 0 ? 'light' : 'dark'}
						className={cn(
							index === 0 && 'rounded-t-2xl md:rounded-none md:rounded-s-2xl',
							index === 1 && 'rounded-b-2xl md:rounded-none md:rounded-e-2xl',
						)}
					/>
				))}
			</div>
		</Module>
	)
}
