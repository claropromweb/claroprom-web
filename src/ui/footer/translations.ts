import type { Lang } from '@/lib/i18n'

export const translations = {
	hr: {
		contactHeading: 'Get in touch',
	},
	en: {
		contactHeading: 'Get in touch',
	},
} as const satisfies Record<Lang, { contactHeading: string }>
