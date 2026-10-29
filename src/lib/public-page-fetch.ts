import { SITE_URL } from './site-url'

/** Markdown export may retrieve public site pages only, never arbitrary hosts/APIs. */
export async function fetchPublicPage(path: string): Promise<Response> {
	let url = new URL(path, SITE_URL)
	for (let redirects = 0; redirects <= 5; redirects++) {
		const pathname = decodeURIComponent(url.pathname)
		if (
			url.origin !== SITE_URL ||
			url.username ||
			url.password ||
			url.pathname.length > 2000 ||
			/(?:^|\/)(?:api|admin|_next)(?:\/|$)/i.test(pathname) ||
			/\.md\/?$/i.test(pathname) ||
			/%[0-9a-f]{2}/i.test(pathname)
		)
			throw new Error('Not a public page')
		const response = await fetch(url, {
			headers: { Accept: 'text/html' },
			redirect: 'manual',
			signal: AbortSignal.timeout(15000),
		})
		if (![301, 302, 303, 307, 308].includes(response.status)) return response
		const location = response.headers.get('location')
		await response.body?.cancel()
		if (!location) throw new Error('Missing redirect')
		url = new URL(location, url)
	}
	throw new Error('Too many redirects')
}
