import { cn } from '@/lib/utils'
import type { LinkList as LinkListType } from '@/sanity/types'
import SanityLink, { type SanityLinkType } from '@/ui/sanity-link'
import type { FooterMenu } from './navigation'

const linkClassName =
	'text-white transition-colors hover:text-white/80 hover:underline'

export default function LegalNavigation({
	menu,
	className,
}: {
	menu?: FooterMenu
	className?: string
}) {
	if (!menu?.items?.length) return null

	return (
		<nav className={cn(className)}>
			<ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
				{menu.items.flatMap((item) => {
					switch (item._type) {
						case 'link':
							return (
								<li key={item._key}>
									<SanityLink
										link={item as SanityLinkType}
										className={linkClassName}
									/>
								</li>
							)

						case 'link.list':
							return (
								(item as LinkListType).links?.map((link) => (
									<li key={link._key}>
										<SanityLink
											link={link as SanityLinkType}
											className={linkClassName}
										/>
									</li>
								)) ?? []
							)

						default:
							return []
					}
				})}
			</ul>
		</nav>
	)
}
