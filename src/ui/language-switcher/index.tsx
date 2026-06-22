import type { ComponentProps } from 'react'
import { supportedLanguages } from '@/lib/i18n'
import { getTranslations } from '@/sanity/lib/queries'
import Switcher from './switcher'

export default async function LanguageSwitcher(
	props: ComponentProps<'label'>,
) {
	if (supportedLanguages.length < 2) return null

	const translations = await getTranslations()
	return <Switcher translations={translations ?? []} {...props} />
}
