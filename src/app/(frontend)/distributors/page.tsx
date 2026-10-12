import type { Metadata } from 'next'
import Link from 'next/link'
import { MEDICA, showMedicaPromotion } from '@/content/medica-2026'
import { inquiryHref } from '@/lib/outreach'
import BusinessForm from '@/ui/inquiry/business-form'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
	title: 'Distribution Partnerships | CLARO-PROM',
	description:
		'Partner with Croatian manufacturer CLARO-PROM for Claroplast histology paraffin wax, IVD reagents and LABEX laboratory cleaning products.',
	alternates: { canonical: '/distributors' },
}
export default async function Distributors({
	searchParams,
}: {
	searchParams: Promise<{ product?: string; code?: string }>
}) {
	const params = await searchParams
	const productContext = [
		typeof params.product === 'string' ? params.product.slice(0, 300) : '',
		typeof params.code === 'string'
			? '(' + params.code.slice(0, 100) + ')'
			: '',
	]
		.filter(Boolean)
		.join(' ')
	return (
		<div className="section space-y-12 py-12">
			<header className="max-w-3xl space-y-5">
				<p className="font-semibold text-red-700">
					CLARO-PROM · Croatia, European Union
				</p>
				<h1 className="text-3xl font-semibold md:text-5xl">
					Distribution partnerships
				</h1>
				<p className="text-xl leading-relaxed">
					Connect your laboratory customers with CLARO-PROM’s portfolio of
					histology, cytology and laboratory products.
				</p>
				<p>
					We welcome inquiries from distributors, laboratory suppliers and
					potential OEM or private-label partners. Tell us about your markets
					and product interests so our team can discuss the appropriate supply
					and cooperation options.
				</p>
			</header>
			<section
				aria-label="Product portfolio"
				className="grid gap-6 md:grid-cols-3"
			>
				{[
					[
						'Claroplast',
						'Histology paraffin wax for tissue infiltration and embedding. Available in 2 kg and 10 kg product packs.',
						'/products/histology-paraffin-wax-claroplast',
					],
					[
						'IVD reagents',
						'Buffered formaldehyde solutions, ethanol reagents, clearing agents, staining solutions, mounting media and microscopy products.',
						'/products/ivd-reagents',
					],
					[
						'LABEX',
						'Laboratory cleaning products. Discuss your intended application and available presentations with our team.',
						'/products/labex',
					],
				].map(([name, text, url]) => (
					<article
						key={name}
						className="space-y-4 rounded-lg border border-neutral-200 p-6"
					>
						<h2 className="text-2xl font-semibold">{name}</h2>
						<p>{text}</p>
						<Link href={url} className="font-semibold text-red-700 underline">
							Explore {name}
						</Link>
					</article>
				))}
			</section>
			<section className="max-w-3xl space-y-4">
				<h2 className="text-2xl font-semibold">
					Start a practical conversation
				</h2>
				<p>
					Share the countries you serve, your customer segments and the products
					you are interested in. Our team can discuss catalogue requirements,
					documentation, product supply and proposed cooperation. OEM and
					private-label inquiries are reviewed individually.
				</p>
				<Link href="/products" className="font-semibold underline">
					Browse the catalogue and build a multi-product inquiry
				</Link>
			</section>
			{showMedicaPromotion() && (
				<aside className="space-y-3 rounded-lg bg-red-50 p-6">
					<h2 className="text-2xl font-semibold">Meet us at MEDICA 2026</h2>
					<p>{MEDICA.dates} · Düsseldorf · Hall 1 / Stand A03</p>
					<Link
						href={inquiryHref('meeting', 'Distribution partnership')}
						className="font-semibold text-red-700 underline"
					>
						Arrange a meeting with our team
					</Link>
				</aside>
			)}
			<section id="distributor-inquiry" className="max-w-3xl space-y-6">
				<h2 className="text-2xl font-semibold">Distributor inquiry</h2>
				<BusinessForm kind="distributor" productContext={productContext} />
			</section>
		</div>
	)
}
