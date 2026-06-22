import { PortableText, stegaClean } from 'next-sanity'
import { cn } from '@/lib/utils'
import type { Banner } from '@/sanity/types'
import CTAList from '@/ui/cta-list'
import { Module } from '.'
import CustomHtml from './custom-html'

export default function ({
	pretitle,
	title,
	intro = [],
	ctas,
	className,
	...props
}: Banner & React.ComponentProps<'section'>) {
	return (
		<Module className={cn('bg-foreground/5', className)} {...props}>
			<div className={cn('section text-center', 'py-16 md:py-24')}>
				<header className="mx-auto max-w-4xl space-y-4 text-balance">
					{pretitle && (
						<p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600">
							{stegaClean(pretitle)}
						</p>
					)}

					{title && <h2 className="h2">{stegaClean(title)}</h2>}

					{intro.length > 0 && (
						<div className="prose mx-auto text-sm leading-relaxed text-foreground/70 md:text-base">
							<PortableText
								value={intro}
								components={{
									types: {
										'custom-html': ({ value }) => <CustomHtml {...value} />,
									},
								}}
							/>
						</div>
					)}

					<CTAList ctas={ctas} className="justify-center pt-2 max-sm:*:w-full" />
				</header>
			</div>
		</Module>
	)
}
