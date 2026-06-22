import { NextResponse, type NextRequest } from 'next/server'
import { ROUTES } from '@/lib/env'
import { DEFAULT_LANG, languages } from '@/lib/i18n'

const BOT =
	/bot|crawl|spider|gptbot|claudebot|claude-web|anthropic|chatgpt|oai-searchbot|perplexity|ccbot|google-extended/i

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
	const { pathname } = req.nextUrl
	const pathLang = detectLang(pathname) ?? DEFAULT_LANG

	const wantsMd =
		req.headers.get('accept')?.includes('text/markdown') ||
		BOT.test(req.headers.get('user-agent') ?? '')

	if (wantsMd) {
		const url = req.nextUrl.clone()
		url.pathname = `/api/md${pathname === '/' ? '/index' : pathname}`
		const res = NextResponse.rewrite(url)
		res.headers.append('Vary', 'Accept, User-Agent')
		res.headers.set('x-language', pathLang)
		return res
	}

	const res = NextResponse.next()
	res.headers.set('x-language', pathLang)
	return res
}

export const config = {
	// skip api, studio, _next, and anything with a file extension (incl. .md)
	matcher: ['/((?!api|admin|_next|.*\\..*).*)'],
}
