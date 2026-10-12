import type { Metadata } from 'next'
import BusinessForm from '@/ui/inquiry/business-form'
import { InquiryBasket } from '@/ui/inquiry/controls'

export const metadata: Metadata = {
	title: 'Your Product Inquiry | CLARO-PROM',
	robots: { index: false, follow: true },
	alternates: { canonical: '/inquiry' },
}
export default function InquiryPage() {
	return (
		<div className="section space-y-8 py-12">
			<header className="max-w-3xl space-y-4">
				<h1 className="text-3xl font-semibold">Your product inquiry</h1>
				<p>
					Select product packs from the catalogue and send one request for a
					quotation. Check the pack sizes and enter the number of packs
					required.
				</p>
			</header>
			<InquiryBasket />
			<section className="max-w-3xl space-y-5">
				<h2 className="text-2xl font-semibold">Send your combined RFQ</h2>
				<BusinessForm kind="rfq" />
			</section>
		</div>
	)
}
