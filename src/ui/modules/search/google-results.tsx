import { useQueryState } from 'nuqs'
import { ROUTES } from '@/lib/env'
import { SITE_URL } from '@/lib/site-url'
import type { SearchModule } from '@/sanity/types'

;('use client')

export default function ({ scope }: { scope: SearchModule['scope'] }) {
	const [query] = useQueryState('query')

	const href = [
		`https://www.google.com/search?q=${query} `,
		`site:${SITE_URL}`,
		scope === 'blog posts' ? `/${ROUTES.blog}` : '',
	].join('')

	return (
		<p className="text-center">
			<a className="link" href={href} target="_blank">
				Search on Google
			</a>
		</p>
	)
}
