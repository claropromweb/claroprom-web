import { cn } from '@/lib/utils'
import type { LinkList as LinkListType } from '@/sanity/types'
import SanityLink, { type SanityLinkType } from '@/ui/sanity-link'
import LinkList from './link.list'

type FooterMenuItem =
	| ({ _type: 'link'; _key: string } & SanityLinkType)
	| ({ _type: 'link.list'; _key: string } & LinkListType)
	| { _type: string; _key: string; [key: string]: any }

export type FooterMenu = {
	title?: string | null
	items?: FooterMenuItem[] | null
} | null

export default function FooterNavigation({
	menu,
	className,
	showHeading = true,
}: {
	menu?: FooterMenu
	className?: string
	showHeading?: boolean
}) {
	if (!menu?.items?.length) return null

	const heading = menu.title?.replace(/^(Footer|Header|Social)\s*[-·:]?\s*/i, '')

	return (
		<nav className={cn('flex flex-col gap-4', className)}>
			{showHeading && heading && (
				<h3 className="text-foreground font-semibold">{heading}</h3>
			)}

			<ul className="flex flex-col items-start gap-2">
				{menu.items.map((item) => {
					switch (item._type) {
						case 'link':
							return (
								<li key={item._key}>
									<SanityLink
										link={item as SanityLinkType}
										className="text-foreground/80 hover:text-foreground transition-colors hover:underline"
									/>
								</li>
							)

						case 'link.list':
							return (
								<LinkList
									{...(item as unknown as LinkListType)}
									key={item._key}
								/>
							)

						default:
							return null
					}
				})}
			</ul>
		</nav>
	)
}
