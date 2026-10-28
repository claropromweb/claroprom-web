'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function EUFunding() {
	const pathname = usePathname()
	if (pathname !== '/') return null
	return (
		<div className="mx-auto mt-8 w-full max-w-4xl">
			<Link
				href="/eu-projekt-iso-13485"
				className="inline-block max-w-full rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-800"
			>
				<Image
					src="/brand/eu-cofunded-hr.png"
					alt="Sufinancira Europska unija — informacije o projektu ISO 13485"
					width={1024}
					height={271}
					className="h-auto w-80 max-w-full"
					unoptimized
				/>
			</Link>
		</div>
	)
}
