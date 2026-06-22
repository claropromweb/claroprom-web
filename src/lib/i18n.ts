import type { Language } from '@sanity/document-internationalization'

export const DEFAULT_LANG = 'hr'

export const supportedLanguages = [
	{ id: 'hr', title: 'Hrvatski' },
	{ id: 'en', title: 'English' },
] as const as Language[]

export const languages = supportedLanguages.map((lang) => lang?.id)

export type Lang = (typeof languages)[number]

export const langCookieName = `claroprom-${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}-lang`
