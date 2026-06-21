import { getSite } from '@/sanity/lib/queries'
import type { LinkList as LinkListType } from '@/sanity/types'
import SanityLink, { type SanityLinkType } from '@/ui/sanity-link'
import LinkList from './link.list'

export default async function () {
	const site = await getSite()

	return (
		<nav>
			<ul className="gap-y-lh flex items-start justify-center gap-x-[2lh] max-md:flex-col">
				{site?.footer?.items?.map((item) => {
					switch (item._type) {
						case 'link':
							return (
								<li key={item._key}>
									<SanityLink
										link={item as SanityLinkType}
										className="text-current hover:underline"
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
