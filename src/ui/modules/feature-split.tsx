import { stegaClean } from 'next-sanity'
import { cn } from '@/lib/utils'
import type { FeatureSplit } from '@/sanity/types'
import Img from '@/ui/img'
import { Module } from '.'

function IsoCertification({
	isoCertificateUrl,
	isoQrImage,
}: NonNullable<FeatureSplit['items']>[number]) {
	const enteredUrl = stegaClean(isoCertificateUrl ?? '').trim()
	let url: string | undefined
	try {
		const parsed = new URL(enteredUrl)
		if (['https:', 'http:'].includes(parsed.protocol)) url = parsed.href
	} catch {
		// An empty or invalid URL must never become a public link.
	}
	const hasImage = Boolean(isoQrImage?.asset?._ref)
	if (!url && !hasImage) return null

	return (
		<div className="flex flex-wrap items-center gap-4 pt-2">
			<div className="min-w-0 flex-1 basis-52 space-y-2 text-sm leading-relaxed md:text-base">
				<p className="font-semibold">ISO 13485 Quality Management System</p>
				{url && (
					<a
						href={url}
						target="_blank"
						rel="noopener noreferrer"
						className="text-red-600 underline underline-offset-4"
					>
						Claro-prom ISO 13485 Certificate
						<span className="sr-only"> (opens in a new tab)</span>
					</a>
				)}
			</div>
			{hasImage && (
				<Img
					image={isoQrImage}
					alt="QR code for the Claro-prom ISO 13485 certificate"
					width={144}
					height={144}
					unoptimized
					className="h-36 w-36 shrink-0 bg-white object-contain p-2"
				/>
			)}
		</div>
	)
}

export default function ({
	pretitle,
	title,
	items,
	image,
	...props
}: FeatureSplit & { _key?: string }) {
	return (
		<Module
			className="section space-y-10 py-16 md:space-y-14 md:py-20 lg:py-24"
			{...props}
		>
			{(pretitle || title) && (
				<header className="mx-auto max-w-3xl space-y-3 text-center">
					{pretitle && (
						<p className="text-xs font-semibold tracking-[0.2em] text-red-600 uppercase">
							{stegaClean(pretitle)}
						</p>
					)}
					{title && <h2 className="h2 text-balance">{stegaClean(title)}</h2>}
				</header>
			)}

			<div className="grid items-center gap-10 md:grid-cols-2 md:gap-14 lg:gap-16">
				{items && items.length > 0 && (
					<div>
						{items.map(({ _key, header, text, ...item }, index) => (
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
									<p className="text-foreground/70 text-sm leading-relaxed md:text-base">
										{stegaClean(text)}
									</p>
								)}
								{props._key === 'e4653a80355f' && _key === '3ef95022d706' && (
									<IsoCertification _key={_key} {...item} />
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
