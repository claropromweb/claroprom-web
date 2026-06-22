'use client'

import { usePathname } from 'next/navigation'
import { DEFAULT_LANG, languages, type Lang } from '@/lib/i18n'

export default function getLang(): Lang {
	const pathname = usePathname()
	return detectLangFromPath(pathname)
}

export function detectLangFromPath(pathname: string): Lang {
	const first = pathname.split('/').filter(Boolean)[0]
	if (first && languages.includes(first as Lang)) return first as Lang

	// blog (and other prefixed routes): /blog/<lang>/...
	const segments = pathname.split('/').filter(Boolean)
	if (segments.length >= 2 && languages.includes(segments[1] as Lang)) {
		return segments[1] as Lang
	}

	return DEFAULT_LANG as Lang
}
