'use client'

import { CookieConsentProvider } from '@vantezzen/react-cookie-banner'

export default function CookieConsentProviderWrapper({
	children,
}: {
	children: React.ReactNode
}) {
	return <CookieConsentProvider>{children}</CookieConsentProvider>
}
