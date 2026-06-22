import { headers } from 'next/headers'
import { DEFAULT_LANG, languages, type Lang } from '@/lib/i18n'

/**
 * Reads the active language from the `x-language` header set by middleware.
 * Falls back to the default language when not set or unrecognized.
 */
export default async function getLangServer(): Promise<Lang> {
	const headersList = await headers()
	const lang = headersList.get('x-language')
	if (lang && languages.includes(lang as Lang)) return lang as Lang
	return DEFAULT_LANG as Lang
}
