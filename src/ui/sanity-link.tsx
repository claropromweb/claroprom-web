import { stegaClean } from 'next-sanity'
import NextLink, { type LinkProps } from 'next/link'
import resolveUrl from '@/lib/resolve-url'
import type { Link, Page } from '@/sanity/types'

export type SanityLinkType = Omit<Link, 'internal'> & {
	_type?: 'link'
	_key?: string
	internal?: Omit<Page, 'metadata'> & {
		_type?: string
		title?: string | null
		language?: string | null
		slug?: string | { current?: string }
		metadata?: { slug?: { current?: string } | null } | null
	}
}

export default function ({
	link,
	children,
	...props
}: { link?: SanityLinkType } & Omit<
	React.ComponentProps<typeof NextLink>,
	'href'
>) {
	const { label, type, internal, external, params } = link ?? {}

	const linkProps: Omit<LinkProps, 'href'> | React.ComponentProps<'a'> = {
		...props,
		children:
			children ||
			stegaClean(label) ||
			stegaClean(internal?.title) ||
			stegaClean(external),
	}

	if (type === 'internal' && internal) {
		// GROQ LINK_QUERY already builds a localized slug string;
		// fall back to resolveUrl when consumers pass raw page documents.
		const slugString =
			typeof internal.slug === 'string'
				? internal.slug
				: resolveUrl(internal as any, { params: params ?? undefined })

		if (slugString) {
			const href =
				typeof internal.slug === 'string'
					? [slugString, stegaClean(params)].filter(Boolean).join('')
					: slugString
			return <NextLink href={href} {...linkProps} />
		}
	}

	if (type === 'external' && external)
		return <NextLink href={stegaClean(external)} {...linkProps} />

	return <span {...linkProps} />
}
