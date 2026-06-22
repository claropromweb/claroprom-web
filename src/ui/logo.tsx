import Link from 'next/link'
import { cn } from '@/lib/utils'
import { DEFAULT_LANG } from '@/lib/i18n'
import { getSite } from '@/sanity/lib/queries'
import Img from './img'

export default async function ({
	variant: style = 'default',
	className,
	lang,
}: {
	variant?: 'default' | 'light' | 'dark'
	className?: string
	lang?: string
}) {
	const site = await getSite(lang)
	const logo = site?.logo?.image?.[style]
	const homeHref = lang && lang !== DEFAULT_LANG ? `/${lang}` : '/'

	return (
		<Link
			href={homeHref}
			className={cn('logo text-foreground inline-block font-bold', className)}
		>
			{logo ? (
				<Img
					image={logo}
					width={100}
					className="inline-block h-full w-auto object-contain"
					alt={site?.title ?? ''}
				/>
			) : (
				site?.title
			)}
		</Link>
	)
}
