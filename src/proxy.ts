import { NextResponse, type NextRequest } from 'next/server'
import { ROUTES } from '@/lib/env'
import { DEFAULT_LANG, languages } from '@/lib/i18n'

function detectLang(pathname: string): string | undefined {
	const segments = pathname.split('/').filter(Boolean)
	if (segments[0] && languages.includes(segments[0])) return segments[0]
	if (
		segments[0] === ROUTES.blog &&
		segments[1] &&
		languages.includes(segments[1])
	)
		return segments[1]
	return undefined
}

export function proxy(req: NextRequest) {
	const host = req.nextUrl.hostname.toLowerCase()
	if (host === 'labexclean.com' || host === 'www.labexclean.com') {
		// Keep the domain assigned, while permanently retiring all old content.
		if (req.nextUrl.pathname === '/robots.txt') {
			return new NextResponse('User-agent: *\nAllow: /\n', {
				headers: { 'Content-Type': 'text/plain; charset=utf-8' },
			})
		}
		return new NextResponse('Gone\n', {
			status: 410,
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
				'X-Robots-Tag': 'noindex',
				'Cache-Control': 'public, max-age=0, must-revalidate',
			},
		})
	}

	const { pathname } = req.nextUrl
	const pathLang = detectLang(pathname) ?? DEFAULT_LANG

	const res = NextResponse.next()
	res.headers.set('x-language', pathLang)
	return res
}

export const config = {
	// skip api, studio, _next, and anything with a file extension (incl. .md)
	matcher: [
		'/((?!api|admin|_next|.*\\..*).*)',
		{
			source: '/:path*',
			has: [{ type: 'host', value: '(www\\.)?labexclean\\.com' }],
		},
	],
}
