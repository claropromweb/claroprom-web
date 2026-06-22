import { PortableText, stegaClean } from 'next-sanity'
import { cn } from '@/lib/utils'
import { urlFor } from '@/sanity/lib/image'
import type { HeroCover } from '@/sanity/types'
import CTAList from '@/ui/cta-list'
import Eyebrow from '@/ui/eyebrow'
import { Module } from '.'
import CustomHtml from './custom-html'

function getBackgroundUrl(
	image: NonNullable<HeroCover['image']>,
	width: number,
) {
	return urlFor(image)
		.withOptions({ auto: 'format', q: 100, width })
		.url()
}

export default function ({
	eyebrow,
	content = [],
	ctas,
	image,
	textAlign: ta = 'center',
	verticalAlign: va = 'center',
	maxHeight,
	backgroundOverlay,
	...props
}: HeroCover) {
	const textAlign = stegaClean(ta)
	const verticalAlign = stegaClean(va)
	const cleanMaxHeight = stegaClean(maxHeight)
	const overlay = stegaClean(backgroundOverlay)
	const opacity = Number(stegaClean(image?.opacity)) ?? 1
	const desktopBg = image ? getBackgroundUrl(image, 1920) : undefined
	const mobileBg = image?.mobile
		? getBackgroundUrl(image.mobile, 1000)
		: desktopBg

	return (
		<Module className="layout-x py-6 md:py-8" {...props}>
			<div
				className={cn(
					'relative flex flex-col overflow-hidden rounded-2xl',
					!cleanMaxHeight && 'min-h-[60svh]',
					{
						'justify-start': verticalAlign === 'top',
						'justify-center': verticalAlign === 'center',
						'justify-end': verticalAlign === 'bottom',
					},
					{
						'items-start text-left': textAlign === 'left',
						'items-center text-center': textAlign === 'center',
						'items-end text-right': textAlign === 'right',
					},
				)}
				style={
					cleanMaxHeight
						? { maxHeight: cleanMaxHeight, minHeight: cleanMaxHeight }
						: undefined
				}
			>
				{image && desktopBg && (
					<>
						<div
							aria-hidden
							className="pointer-events-none absolute inset-0 rounded-2xl bg-cover bg-center bg-no-repeat bg-fixed md:hidden"
							style={{
								backgroundImage: `url(${mobileBg})`,
								opacity,
							}}
						/>
						<div
							aria-hidden
							className="pointer-events-none absolute inset-0 hidden rounded-2xl bg-cover bg-center bg-no-repeat bg-fixed md:block"
							style={{
								backgroundImage: `url(${desktopBg})`,
								opacity,
							}}
						/>
						{image.alt && <span className="sr-only">{image.alt}</span>}
					</>
				)}

				{overlay && (
					<div
						aria-hidden
						className="pointer-events-none absolute inset-0 rounded-2xl bg-red-600/70"
					/>
				)}

				<div
					className={cn(
						'relative z-10 flex w-full flex-col px-8 py-16 md:px-12 md:py-20 lg:px-16',
						(overlay || opacity > 0.5) && 'text-background',
					)}
				>
					<header className="prose max-w-3xl [&_h1]:text-4xl [&_h1]:leading-[1.1] [&_h1]:md:text-5xl [&_h1]:lg:text-6xl [&_p]:text-lg [&_p]:md:text-xl">
						<Eyebrow value={eyebrow} />
						<PortableText
							value={content}
							components={{
								types: {
									'custom-html': ({ value }) => <CustomHtml {...value} />,
								},
							}}
						/>
						<CTAList
							ctas={ctas}
							className={cn('max-sm:*:w-full', {
								'justify-start': textAlign === 'left',
								'justify-center': textAlign === 'center',
								'justify-end': textAlign === 'right',
							})}
						/>
					</header>
				</div>
			</div>
		</Module>
	)
}
