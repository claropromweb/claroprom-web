import Image from 'next/image'
import Link from 'next/link'
import { DEFAULT_LANG } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export default async function ({
	className,
	lang,
	children,
}: {
	variant?: 'default' | 'light' | 'dark'
	className?: string
	lang?: string
	children?: React.ReactNode
}) {
	const homeHref = lang && lang !== DEFAULT_LANG ? `/${lang}` : '/'

	return (
		<Link
			href={homeHref}
			aria-label="CLARO-PROM home"
			className={cn('logo text-foreground inline-block font-bold', className)}
		>
			<Image
				src="/brand/claroprom-logo-p185c.svg"
				width={37}
				height={42}
				className="inline-block h-full w-auto object-contain"
				alt="CLARO-PROM"
				unoptimized
			/>
			{children}
		</Link>
	)
}
