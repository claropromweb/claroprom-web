import type { Metadata } from 'next'
import { groq } from 'next-sanity'
import getLangServer from '@/lib/get-lang-server'
import { DEFAULT_LANG } from '@/lib/i18n'
import { sanityFetchLive } from '@/sanity/lib/live'
import { MODULES_QUERY } from '@/sanity/lib/queries'
import type { NOT_FOUND_QUERY_RESULT } from '@/sanity/types'
import ModulesResolver from '@/ui/modules'

export default async function () {
	const page = await getPage()
	return <ModulesResolver page={page as any} />
}

export async function generateMetadata(): Promise<Metadata> {
	const page = await getPage()

	return {
		title: page?.metadata?.title,
		description: page?.metadata?.description,
		openGraph: {
			title: page?.metadata?.title,
			description: page?.metadata?.description,
		},
		robots: {
			index: page?.metadata?.noIndex ? false : undefined,
		},
	}
}

async function getPage() {
	const lang = await getLangServer()
	return await sanityFetchLive<NOT_FOUND_QUERY_RESULT>({
		query: NOT_FOUND_QUERY,
		params: { lang, defaultLang: DEFAULT_LANG },
	})
}

const NOT_FOUND_QUERY = groq`
	*[_type == 'page' && metadata.slug.current == '404'
		&& coalesce(language, $defaultLang) == $lang][0]{
		...,
		modules[]{ ${MODULES_QUERY} }
	}
`
