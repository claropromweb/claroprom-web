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
	GLOBAL_MODULE_EXCLUDE_QUERY,
	MODULES_QUERY,
	TRANSLATIONS_QUERY,
} from '@/sanity/lib/queries'
import type { BLOG_POST_QUERY_RESULT } from '@/sanity/types'
import ModulesResolver from '@/ui/modules'

type Props = {
	params: Promise<{ slug: string[] }>
}

export default async function ({ params }: Props) {
	const { slug } = await params
	const post = await getPost(slug)
	if (!post) notFound()

	return <ModulesResolver post={post} />
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug: rawSlug } = await params
	const post = await getPost(rawSlug)
	const { title, description, image, noIndex } = post?.metadata ?? {}

	const canonical = post ? resolveUrl(post as any) : undefined

	const alternates: Record<string, string> = {}
	const translations = (post as any)?.translations as
		| Array<{ value?: { language?: string; _type?: string; metadata?: any } }>
		| undefined
	translations?.forEach((entry) => {
		const v = entry?.value
		if (!v?.language) return
		alternates[v.language] = resolveUrl(v as any)
	})
	if ((post as any)?.language)
		alternates[(post as any).language as string] = canonical ?? '/'

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
					: `${process.env.NEXT_PUBLIC_BASE_URL}/api/og?slug=${ROUTES.blog}/${post?.metadata?.slug?.current ?? ''}`,
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
				'text/markdown': `/${ROUTES.blog}/${post?.metadata?.slug?.current ?? ''}.md`,
			},
		},
	}
}

export async function generateStaticParams() {
	const posts = await client.fetch<
		{ slug: string; language?: string | null }[]
	>(
		groq`*[_type == 'blog.post' && defined(metadata.slug.current)]{
			'slug': metadata.slug.current,
			language
		}`,
	)

	return posts.map(({ slug, language }) => {
		const parts = slug.split('/')
		if (language && language !== DEFAULT_LANG) {
			return { slug: [language, ...parts] }
		}
		return { slug: parts }
	})
}

async function getPost(slugInput: string[]) {
	const { slug, lang } = processSlug(slugInput)

	return await sanityFetchLive<BLOG_POST_QUERY_RESULT>({
		query: BLOG_POST_QUERY,
		params: {
			slug,
			blogDir: `${ROUTES.blog}/`,
			lang: lang ?? DEFAULT_LANG,
			defaultLang: DEFAULT_LANG,
		},
	})
}

function processSlug(slug: string[]): { slug: string; lang?: Lang } {
	const lang = languages.includes(slug[0] as Lang)
		? (slug[0] as Lang)
		: undefined

	const path = lang ? slug.slice(1).join('/') : slug.join('/')
	return { slug: path, lang }
}

const BLOG_POST_QUERY = groq`*[_type == 'blog.post'
	&& metadata.slug.current == $slug
	&& coalesce(language, $defaultLang) == $lang
][0]{
	...,
	content[]{
		...,
		_type == 'image' => {
			...,
			asset->
		}
	},
	'contentPlainText': pt::text(content),
	'readTime': length(string::split(pt::text(content), ' ')) / 200,
	'headings': content[style in ['h2', 'h3', 'h4', 'h5', 'h6']]{
		style,
		'text': pt::text(@)
	},
	categories[]->{
		title,
		title_en,
		slug,
		slug_en
	},
	author->{
		name,
		image{
			...,
			asset->
		}
	},
	'modules': (
		// global modules (before)
		*[_type == 'global-module' && path == '*' && ${GLOBAL_MODULE_EXCLUDE_QUERY}].before[]{ ${MODULES_QUERY} }
		// path modules (before)
		+ *[_type == 'global-module' && path == $blogDir].before[]{ ${MODULES_QUERY} }
		// path modules (after)
		+ *[_type == 'global-module' && path == $blogDir].after[]{ ${MODULES_QUERY} }
		// global modules (after)
		+ *[_type == 'global-module' && path == '*' && ${GLOBAL_MODULE_EXCLUDE_QUERY}].after[]{ ${MODULES_QUERY} }
	),
	${TRANSLATIONS_QUERY}
}`
