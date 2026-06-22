import { cn } from '@/lib/utils'
import { getSite } from '@/sanity/lib/queries'
import type { Cta } from '@/sanity/types'
import CTAList from '@/ui/cta-list'
import LanguageSwitcher from '@/ui/language-switcher'
import Logo from '@/ui/logo'
import MobileToggle from './mobile-toggle'
import Navigation from './navigation'
import ProductSearch from './product-search'
import Wrapper from './wrapper'

export default async function ({ lang }: { lang?: string }) {
	const site = await getSite(lang)

	return (
		<Wrapper className="bg-background/80 has-[.accordion:open]:bg-background max-md:header-open:bg-background max-md:header-open:text-foreground max-md:header-open:shadow-xl max-md:header-open:backdrop-blur-none sticky top-0 z-50 backdrop-blur transition-colors">
			<div className="w-full px-6 md:px-12 lg:px-16 relative flex items-center justify-between gap-4 py-4">
				<Logo
					lang={lang}
					className="shrink-0 has-[img]:-my-2 has-[img]:h-[2lh]"
				/>

				<Navigation
					lang={lang}
					className="absolute left-1/2 hidden -translate-x-1/2 md:flex"
				/>

				<div
					className={cn(
						'gap-x-lh flex items-center',
						'max-md:header-not-open:hidden',
						'max-md:header-open:fixed max-md:header-open:inset-x-0 max-md:header-open:bottom-0',
						'max-md:header-open:top-(--header-height,64px)',
						'max-md:header-open:z-10 max-md:header-open:bg-background max-md:header-open:text-foreground',
						'max-md:header-open:flex-col max-md:header-open:justify-center max-md:header-open:gap-8 max-md:header-open:p-8',
						'max-md:header-open:anim-fade-to-b',
						'md:hidden',
					)}
				>
					<Navigation lang={lang} />
					<CTAList ctas={site?.ctas as Cta[]} className="*:max-md:w-full" />
					<LanguageSwitcher className="shrink-0" />
				</div>

				<div className="flex items-center gap-4">
					<CTAList
						ctas={site?.ctas as Cta[]}
						className="hidden md:flex"
					/>
					<LanguageSwitcher className="hidden shrink-0 md:flex" />
					<MobileToggle />
				</div>
			</div>

			<div className="border-stroke border-t">
				<div className="w-full px-6 md:px-12 lg:px-16 py-3">
					<ProductSearch />
				</div>
			</div>
		</Wrapper>
	)
}
