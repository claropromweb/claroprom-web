import Link from 'next/link'
import { MEDICA, MEDICA_PATH, showMedicaPromotion } from '@/content/medica-2026'
import { inquiryHref } from '@/lib/outreach'

export default function MedicaPromotion() {
	if (!showMedicaPromotion()) return null
	return (
		<aside aria-label="MEDICA 2026" className="section my-6">
			<div className="flex flex-wrap items-center justify-between gap-5 rounded-lg border border-neutral-200 bg-neutral-50 p-5 md:p-6">
				<div>
					<h2 className="text-lg font-semibold">
						Meet CLARO-PROM at MEDICA 2026
					</h2>
					<p className="mt-1 text-sm">
						{MEDICA.dates} · Düsseldorf · {MEDICA.stand}
					</p>
				</div>
				<div className="flex flex-wrap gap-4">
					<Link
						href={inquiryHref('meeting')}
						className="font-semibold text-red-700 underline"
					>
						Arrange a meeting
					</Link>
					<Link href={MEDICA_PATH} className="underline">
						Read more
					</Link>
					<Link href="/distributors" className="underline">
						Distribution partnerships
					</Link>
					<Link href="/products" className="underline">
						Explore the catalogue
					</Link>
				</div>
			</div>
		</aside>
	)
}
