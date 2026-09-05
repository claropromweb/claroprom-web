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
	const { pathname } = req.nextUrl
	const pathLang = detectLang(pathname) ?? DEFAULT_LANG

	const res = NextResponse.next()
	res.headers.set('x-language', pathLang)
	return res
}

export const config = {
	// skip api, studio, _next, and anything with a file extension (incl. .md)
	matcher: ['/((?!api|admin|_next|.*\\..*).*)'],
}
