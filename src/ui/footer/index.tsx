import { PortableText } from 'next-sanity'
import { DEFAULT_LANG } from '@/lib/i18n'
import { getSite } from '@/sanity/lib/queries'
import Logo from '@/ui/logo'
import LegalNavigation from './legal-navigation'
import Navigation from './navigation'
import { translations } from './translations'

export default async function ({ lang }: { lang?: string }) {
	const site = await getSite(lang)
	const currentLang = (lang || DEFAULT_LANG) as keyof typeof translations
	const t = translations[currentLang] ?? translations[DEFAULT_LANG]

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

						<div className="flex w-max max-w-sm flex-col gap-4 md:col-span-3 md:col-start-8">
							<h3 className="font-semibold">{t.contactHeading}</h3>
							<div className="text-foreground/80 space-y-2 leading-relaxed [&_a]:text-foreground [&_a]:hover:underline">
								<PortableText value={site?.footerContent ?? []} />
							</div>
						</div>
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
		</footer>
	)
}
