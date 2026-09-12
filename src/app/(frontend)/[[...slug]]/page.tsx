import pkg from '@@/package.json'
import type { Metadata } from 'next'
import { groq } from 'next-sanity'
import { draftMode } from 'next/headers'
import { notFound, permanentRedirect } from 'next/navigation'
import { ROUTES } from '@/lib/env'
import { DEFAULT_LANG } from '@/lib/i18n'
import resolveUrl from '@/lib/resolve-url'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import {
	getSite,
	GLOBAL_MODULE_EXCLUDE_QUERY,
	GLOBAL_MODULE_PATH_QUERY,
	MODULES_QUERY,
	TRANSLATIONS_QUERY,
} from '@/sanity/lib/queries'
import { token } from '@/sanity/lib/token'
import type { PAGE_QUERY_RESULT } from '@/sanity/types'
import ModulesResolver from '@/ui/modules'

export const dynamic = 'force-dynamic'

type Props = {
	params: Promise<{ slug?: string[] }>
}

export default async function Page({ params }: Props) {
	const { slug } = await params
	if (slug?.[0] === 'en' || slug?.[0] === 'hr') {
		const canonical = '/' + slug.slice(1).join('/')
		permanentRedirect(canonical === '/index' ? '/' : canonical)
	}
	const page = await getPage(slug)
	if (!page) notFound()

	return <ModulesResolver page={page} />
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params
	const page = await getPage(slug)
	const site = await getSite(DEFAULT_LANG)
	const { title, description, image, noIndex } = page?.metadata ?? {}

	const canonical = page ? resolveUrl(page as any) : undefined

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			url: canonical
				? `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}${canonical}`
				: undefined,
			images: [
				image
					? urlFor(image).width(1200).url()
					: site?.ogimage
						? urlFor(site.ogimage).width(1200).url()
						: `${process.env.NEXT_PUBLIC_BASE_URL}/api/og?slug=${slug?.join('/') ?? ''}`,
			],
		},
		robots: {
			index: noIndex ? false : undefined,
		},
		alternates: {
			canonical,
			languages: undefined,
			types: {
				'application/rss+xml': `/${ROUTES.blog}/rss.xml`,
			},
		},
		generator: `SanityPress v${pkg.version}`,
	}
}

async function getPage(slugInput?: string[]) {
	const slug = !slugInput?.length ? 'index' : slugInput.join('/')
	// Pages must reflect a publish on the next request, without a build or CDN TTL.
	return client
		.withConfig({ useCdn: false, token })
		.fetch<PAGE_QUERY_RESULT>(
			PAGE_QUERY,
			{ slug },
			{
				perspective: (await draftMode()).isEnabled ? 'drafts' : 'published',
				cache: 'no-store',
			},
		)
}

const PAGE_QUERY = groq`
	*[_type == 'page' && catalogArchive != true
		&& metadata.slug.current == $slug
		&& language == 'en'
	][0]{
		...,
		'modules': (
			// global modules (before)
			*[_type == 'global-module' && path == '*' && ${GLOBAL_MODULE_EXCLUDE_QUERY}].before[]{ ${MODULES_QUERY} }
			// path modules (before)
			+ *[_type == 'global-module' && path != '*' && ${GLOBAL_MODULE_PATH_QUERY}].before[]{ ${MODULES_QUERY} }
			// page modules
			+ modules[]{ ${MODULES_QUERY} }
			// path modules (after)
			+ *[_type == 'global-module' && path != '*' && ${GLOBAL_MODULE_PATH_QUERY}].after[]{ ${MODULES_QUERY} }
			// global modules (after)
			+ *[_type == 'global-module' && path == '*' && ${GLOBAL_MODULE_EXCLUDE_QUERY}].after[]{ ${MODULES_QUERY} }
		),
		${TRANSLATIONS_QUERY}
	}
`
