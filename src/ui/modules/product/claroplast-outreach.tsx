import Link from 'next/link'
import { CLAROPLAST } from '@/content/claroplast'
import { CLAROPLAST_PACKS, inquiryHref } from '@/lib/outreach'

export const outreachButton =
	'inline-flex items-center justify-center rounded-md bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-600'
export const outreachSecondary =
	'inline-flex items-center justify-center rounded-md border border-red-600 px-5 py-3 font-semibold text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-600'

export function ClaroplastActions() {
	return (
		<div className="space-y-4">
			<div className="flex flex-wrap gap-3">
				<Link
					href={inquiryHref('quote', CLAROPLAST.shortName)}
					className={outreachButton}
				>
					Ask for a quote
				</Link>
				<Link
					href={inquiryHref('distributor', CLAROPLAST.shortName)}
					className={outreachSecondary}
				>
					Distributor inquiry
				</Link>
			</div>
			<div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
				<Link
					href={inquiryHref('documentation', CLAROPLAST.shortName)}
					className="underline"
				>
					Request technical documentation
				</Link>
				<Link
					href={inquiryHref('sample', CLAROPLAST.shortName)}
					className="underline"
				>
					Request a sample
				</Link>
			</div>
		</div>
	)
}

export function ClaroplastOverview() {
	const facts = [
		['Product', CLAROPLAST.shortName],
		['Physical form', 'pellet (granulated) form'],
		['Manufacturer', 'CLARO-PROM d.o.o.'],
		['Origin', 'Croatia, European Union'],
		['Application', 'Routine tissue infiltration and embedding'],
		['Available packaging', '2 kg / 10 kg'],
		['Catalogue numbers', 'CP00CL2 / CP00CLP'],
	]
	return (
		<section
			aria-labelledby="claroplast-overview"
			className="rounded-lg border border-neutral-200 bg-neutral-50 p-5 md:p-8"
		>
			<h2 id="claroplast-overview" className="mb-5 text-2xl font-semibold">
				Product overview
			</h2>
			<dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
				{facts.map(([label, value]) => (
					<div key={label}>
						<dt className="text-sm text-neutral-500">{label}</dt>
						<dd className="mt-1 font-medium">{value}</dd>
					</div>
				))}
			</dl>
		</section>
	)
}

export function ClaroplastVariants() {
	return (
		<section aria-labelledby="claroplast-packaging" className="space-y-5">
			<h2 id="claroplast-packaging" className="text-2xl font-semibold">
				Packaging and catalogue numbers
			</h2>
			<div className="grid gap-5 md:grid-cols-2">
				{CLAROPLAST_PACKS.map((pack) => (
					<article
						key={pack.code}
						className="space-y-4 rounded-lg border border-neutral-200 p-6"
					>
						<h3 className="text-xl font-semibold">{pack.name}</h3>
						<p>
							Catalogue No. <strong>{pack.code}</strong>
						</p>
						{pack.packaging === '2 kg' && (
							<p className="text-sm text-neutral-600">
								Transport carton: 5 × 2 kg. This is a transport configuration,
								not a separate product.
							</p>
						)}
						<div className="flex flex-wrap items-center gap-4">
							<Link
								href={inquiryHref('quote', pack.name, pack.code)}
								className={outreachButton}
							>
								Ask for a quote
							</Link>
							<Link href={'/products/' + pack.slug} className="underline">
								View details
							</Link>
						</div>
					</article>
				))}
			</div>
		</section>
	)
}

export function ClaroplastClosing() {
	return (
		<section className="space-y-4 rounded-lg bg-neutral-50 p-6 md:p-8">
			<h2 className="text-2xl font-semibold">
				Talk directly with the manufacturer
			</h2>
			<p>
				Interested in Claroplast for your laboratory or distribution portfolio?
				Contact CLARO-PROM in Croatia, European Union.
			</p>
			<ClaroplastActions />
		</section>
	)
}

/** Owner-confirmed construction applies only to the 10 kg pack and 5 × 2 kg transport configuration. */
export function ClaroplastPackagingAdvantage({
	transportOnly = false,
}: {
	transportOnly?: boolean
}) {
	return (
		<section
			aria-label="Claroplast packaging advantage"
			className="space-y-3 rounded-lg border border-neutral-200 bg-neutral-50 p-5 md:p-6"
		>
			<h2 className="text-lg font-semibold">
				Lightweight, easy-to-handle packaging
			</h2>
			<p className="max-w-3xl text-sm leading-relaxed">
				{transportOnly
					? 'The 5 × 2 kg transport configuration uses a lightweight cardboard carton with a durable inner bag for practical handling by laboratory personnel. This transport configuration is not a separate product or SKU.'
					: 'The 10 kg pack and the 5 × 2 kg transport configuration feature lightweight cardboard cartons with a durable inner bag, designed for practical handling in laboratory environments.'}
			</p>
		</section>
	)
}
