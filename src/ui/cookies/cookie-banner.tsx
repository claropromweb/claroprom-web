'use client'

import dynamic from 'next/dynamic'
import getLang from '@/lib/get-lang'
import { FloatingConsentInfo } from './floating-consent-info'
import { translations } from './translations'

const CookieBanner = dynamic(
	() =>
		import('@vantezzen/react-cookie-banner').then((mod) => mod.CookieBanner),
	{ ssr: false },
)

export default function CookieBannerWrapper() {
	const lang = getLang() || 'hr'

	return (
		<>
			{lang === 'en' ? (
				<CookieBanner
					lang={translations.en}
					privacyPolicyUrl="/politika-privatnosti"
				/>
			) : (
				<CookieBanner
					lang={translations.hr}
					privacyPolicyUrl="/politika-privatnosti"
				/>
			)}
			<FloatingConsentInfo />
		</>
	)
}
