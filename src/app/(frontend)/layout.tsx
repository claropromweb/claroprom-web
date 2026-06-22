import { Geist } from 'next/font/google'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { preconnect } from 'react-dom'
import getLangServer from '@/lib/get-lang-server'
import CookieBannerWrapper from '@/ui/cookies/cookie-banner'
import CookieConsentProviderWrapper from '@/ui/cookies/cookie-consent-provider'
import Footer from '@/ui/footer'
import Header from '@/ui/header'
import VisualEditing from '@/ui/modules/visual-editing'
import '@/app.css'

const fontSans = Geist({
	subsets: ['latin'],
})

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	preconnect('https://cdn.sanity.io')
	const lang = await getLangServer()

	return (
		<html lang={lang} data-scroll-behavior="smooth">
			<NuqsAdapter>
				<body className="bg-background text-foreground antialiased">
					<CookieConsentProviderWrapper>
						<Header lang={lang} />
						<main>{children}</main>
						<Footer lang={lang} />

						<VisualEditing />
						<CookieBannerWrapper />
					</CookieConsentProviderWrapper>
				</body>
			</NuqsAdapter>
		</html>
	)
}
