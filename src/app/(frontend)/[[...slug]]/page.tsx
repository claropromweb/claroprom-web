import pkg from '@@/package.json'
import type { Metadata } from 'next'
import { groq } from 'next-sanity'
import { notFound } from 'next/navigation'
import { ROUTES } from '@/lib/env'
import { DEFAULT_LANG, languages, type Lang } from '@/lib/i18n'
import resolveUrl from '@/lib/resolve-url'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import { sanityFetchLive } from '@/sanity/lib/live'
import {
	getSite,
	GLOBAL_MODULE_EXCLUDE_QUERY,
	GLOBAL_MODULE_PATH_QUERY,
	MODULES_QUERY,
	TRANSLATIONS_QUERY,
} from '@/sanity/lib/queries'
import type { PAGE_QUERY_RESULT } from '@/sanity/types'
import ModulesResolver from '@/ui/modules'

type Props = {
	params: Promise<{ slug?: string[] }>
}

export default async function Page({ params }: Props) {
	const { slug } = await params
	const page = await getPage(slug)
	if (!page) notFound()

	return <ModulesResolver page={page} />
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params
	const page = await getPage(slug)
	const { lang } = processSlug(slug)
	const site = await getSite(lang)
	const { title, description, image, noIndex } = page?.metadata ?? {}

	const canonical = page ? resolveUrl(page as any) : undefined

	const alternates: Record<string, string> = {}
	const translations = (page as any)?.translations as
		| Array<{ value?: { language?: string } & PageLike }>
		| undefined

	translations?.forEach((entry) => {
		const v = entry?.value
		if (!v?.language) return
		alternates[v.language] = resolveUrl(v as any)
	})
	if ((page as any)?.language)
		alternates[(page as any).language as string] = canonical ?? '/'

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
			languages: Object.keys(alternates).length ? alternates : undefined,
			types: {
				'application/rss+xml': `/${ROUTES.blog}/rss.xml`,
			},
		},
		generator: `SanityPress v${pkg.version}`,
	}
}

export async function generateStaticParams() {
	const pages = await client.fetch<
		{ slug: string; language?: string | null }[]
	>(
		groq`
			*[
				_type == 'page'
				&& defined(metadata.slug.current)
				&& !(metadata.slug.current in ['404'])
			]{
				'slug': metadata.slug.current,
				language
			}
		`,
	)

	return pages.map(({ slug, language }) => {
		const parts = slug === 'index' ? [] : slug.split('/')

		if (language && language !== DEFAULT_LANG) {
			return { slug: [language, ...parts] }
		}

		return { slug: parts.length ? parts : undefined }
	})
}

async function getPage(slugInput?: string[]) {
	const { slug, lang } = processSlug(slugInput)

	return await sanityFetchLive<PAGE_QUERY_RESULT>({
		query: PAGE_QUERY,
		params: {
			slug,
			lang: lang ?? DEFAULT_LANG,
			defaultLang: DEFAULT_LANG,
		},
	})
}

type PageLike = {
	_type?: string
	language?: string | null
	metadata?: { slug?: { current?: string } | null } | null
}

function processSlug(slug?: string[]): { slug: string; lang?: Lang } {
	const lang =
		slug && languages.includes(slug[0] as Lang)
			? (slug[0] as Lang)
			: undefined

	if (!slug || slug.length === 0) return { slug: 'index', lang: undefined }

	if (lang) {
		const rest = slug.slice(1).join('/')
		return { slug: rest === '' ? 'index' : rest, lang }
	}

	return { slug: slug.join('/') }
}

const PAGE_QUERY = groq`
	*[_type == 'page'
		&& metadata.slug.current == $slug
		&& coalesce(language, $defaultLang) == $lang
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
