import { PortableText } from 'next-sanity'
import { getSite } from '@/sanity/lib/queries'
import Logo from '@/ui/logo'
import LegalNavigation from './legal-navigation'
import Navigation from './navigation'
import FooterContact from './contact'
import FloatingWhatsApp from './whatsapp-contact'

export default async function ({ lang }: { lang?: string }) {
	const site = await getSite(lang)

	return (
		<footer>
			<div className="bg-white text-foreground">
				<div className="w-full px-6 py-10 md:px-12 md:py-12 lg:px-16">
					<div className="mx-auto grid w-full max-w-4xl grid-cols-1 items-start gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-16">
						<Navigation
							menu={site?.footer}
							className="w-max"
						/>

						<FooterContact
							logo={<Logo lang={lang} className="shrink-0 leading-none [&_img]:h-8 [&_img]:w-auto" />}
						/>
					</div>
				</div>
			</div>

			<div className="bg-red-600 text-sm text-white">
				<div className="w-full px-6 py-5 md:px-12 lg:px-16 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
					<div className="[&_a]:text-white [&_a]:underline">
						<PortableText value={site?.copyright ?? []} />
					</div>

					<LegalNavigation menu={site?.footerSecondary} />
				</div>
			</div>
			<FloatingWhatsApp />
		</footer>
	)
}
