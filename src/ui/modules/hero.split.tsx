import { PortableText, stegaClean } from 'next-sanity'
import { cn } from '@/lib/utils'
import type { HeroSplit } from '@/sanity/types'
import CTAList from '@/ui/cta-list'
import Eyebrow from '@/ui/eyebrow'
import Img from '@/ui/img'
import { Module } from '.'
import CustomHtml from './custom-html'

export default function ({
	eyebrow,
	content = [],
	ctas,
	image,
	layout: l = 'image-left',
	...props
}: HeroSplit) {
	const layout = stegaClean(l)
	const imageOnRight = layout === 'image-right'

	return (
		<Module
			className="section grid items-start gap-10 py-16 md:grid-cols-2 md:items-center md:gap-14 md:py-20 lg:gap-16 lg:py-24"
			{...props}
		>
			<figure
				className={cn(
					'w-full max-w-lg overflow-hidden rounded-2xl',
					imageOnRight ? 'md:order-last md:justify-self-end' : 'md:justify-self-start',
					(stegaClean(image?.afterContent) || imageOnRight) &&
						'max-md:order-last',
				)}
			>
				<Img
					className="aspect-[4/5] w-full object-cover"
					image={image}
					width={600}
					height={750}
					alt={image?.alt ?? ''}
				/>
			</figure>

			<header
				className={cn(
					'prose w-full max-w-lg space-y-3 [&_.cta-list]:mt-6 [&_.cta-list_a]:active:scale-98 [&_.cta-list_a]:inline-flex [&_.cta-list_a]:items-center [&_.cta-list_a]:justify-center [&_.cta-list_a]:gap-ch [&_.cta-list_a]:rounded-md [&_.cta-list_a]:border-0 [&_.cta-list_a]:bg-red-600 [&_.cta-list_a]:px-8 [&_.cta-list_a]:py-3 [&_.cta-list_a]:font-semibold [&_.cta-list_a]:text-white [&_.cta-list_a]:no-underline [&_.cta-list_a]:transition-colors hover:[&_.cta-list_a]:bg-red-700 [&_h1]:text-2xl [&_h1]:leading-snug [&_h1]:md:text-[1.75rem] [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-foreground/70 [&_p]:md:text-base',
					imageOnRight ? 'md:justify-self-start' : 'md:justify-self-end',
				)}
			>
				<Eyebrow
					value={eyebrow}
					className="font-sans text-xs font-normal tracking-[0.15em] text-foreground/45"
				/>
				<PortableText
					value={content}
					components={{
						types: {
							'custom-html': ({ value }) => <CustomHtml {...value} />,
						},
					}}
				/>
				<CTAList ctas={ctas} className="max-sm:*:w-full" />
			</header>
		</Module>
	)
}
