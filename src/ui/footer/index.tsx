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
					<div className="grid grid-cols-1 items-start gap-10 md:grid-cols-12 md:gap-y-0">
						<div className="w-max md:col-span-3">
							<Logo lang={lang} className="[&_img]:h-16 [&_img]:w-auto" />
						</div>

						<Navigation
							menu={site?.footer}
							className="w-max md:col-span-2 md:col-start-5"
						/>

						<FooterContact />
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
