import type { Lang } from '@/lib/i18n'

export const translations = {
	hr: {
		name: 'Ime / Tvrtka',
		email: 'Email',
		phone: 'Telefon',
		lab: 'Vaš laboratorij',
		product: 'Naziv proizvoda ili šifra proizvoda',
		request: 'Upit',
		privacy: 'Pročitao/la sam i prihvaćam',
		privacyLink: 'Politiku privatnosti',
		submit: 'Pošalji upit',
		submitting: 'Slanje...',
		success: 'Hvala! Vaš upit je uspješno poslan. Javit ćemo vam se uskoro.',
		error: 'Došlo je do pogreške pri slanju. Molimo pokušajte ponovno.',
		requiredError: 'Molimo ispunite sva obavezna polja.',
	},
	en: {
		name: 'Name / Company',
		email: 'Email',
		phone: 'Phone',
		lab: 'Your lab',
		product: 'Product name or product code',
		request: 'Request',
		privacy: 'I have read and accept the',
		privacyLink: 'Privacy Policy',
		submit: 'Send request',
		submitting: 'Sending...',
		success: 'Thank you! Your request has been sent. We will get back to you soon.',
		error: 'Something went wrong while sending. Please try again.',
		requiredError: 'Please fill in all required fields.',
	},
} as const

export type FormTranslations = (typeof translations)['hr']

export function getFormTranslations(lang: Lang): FormTranslations {
	return (
		(translations as unknown as Record<string, FormTranslations>)[lang] ??
		translations.hr
	)
}
