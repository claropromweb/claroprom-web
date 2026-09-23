import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { preconnect } from 'react-dom'
import getLangServer from '@/lib/get-lang-server'
import { organization } from '@/lib/seo'
import { SITE_URL } from '@/lib/site-url'
import { urlFor } from '@/sanity/lib/image'
import { getSite } from '@/sanity/lib/queries'
import CookieBannerWrapper from '@/ui/cookies/cookie-banner'
import CookieConsentProviderWrapper from '@/ui/cookies/cookie-consent-provider'
import Footer from '@/ui/footer'
import Header from '@/ui/header'
import VisualEditing from '@/ui/modules/visual-editing'
import StructuredData from '@/ui/structured-data'
import '@/app.css'

export const metadata: Metadata = { metadataBase: new URL(SITE_URL) }

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
	const site = await getSite(lang)
	const logo = site?.logo?.image?.default

	return (
		<html lang="en" data-scroll-behavior="smooth">
			<NuqsAdapter>
				<body className="bg-background text-foreground antialiased">
					<CookieConsentProviderWrapper>
						<Header lang={lang} />
						<StructuredData
							data={{
								'@context': 'https://schema.org',
								...organization,
								...(logo ? { logo: urlFor(logo).url() } : {}),
							}}
						/>
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
