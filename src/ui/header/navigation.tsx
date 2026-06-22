import { cn } from '@/lib/utils'
import { getSite } from '@/sanity/lib/queries'
import type { LinkList, Megamenu as MegamenuType } from '@/sanity/types'
import SanityLink, { type SanityLinkType } from '@/ui/sanity-link'
import Dropdown from './dropdown'
import Megamenu from './megamenu'

const topLevelClassName = cn(
	'grid uppercase md:place-content-center md:text-center md:text-balance leading-tight py-[.5ch] md:py-ch',
)

export default async function ({
	lang,
	className,
}: {
	lang?: string
	className?: string
}) {
	const site = await getSite(lang)

	return (
		<nav
			className={cn(
				'gap-x-lh flex items-stretch max-md:flex-col max-md:items-center max-md:gap-y-4',
				className,
			)}
		>
			{site?.header?.items?.map((item) => {
				switch (item._type) {
					case 'link':
						return (
							<SanityLink
								link={item as SanityLinkType}
								className={cn(
									topLevelClassName,
									'text-current hover:underline',
								)}
								key={item._key}
							/>
						)

					case 'link.list':
						return (
							<Dropdown
								{...(item as LinkList & { _key: string })}
								summaryClassName={topLevelClassName}
								key={item._key}
							/>
						)

					case 'megamenu':
						return (
							<Megamenu
								{...(item as MegamenuType)}
								summaryClassName={topLevelClassName}
								key={item._key}
							/>
						)

					default:
						return null
				}
			})}
		</nav>
	)
}
