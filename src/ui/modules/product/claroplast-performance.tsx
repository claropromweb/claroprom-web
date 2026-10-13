import { CLAROPLAST } from '@/content/claroplast'

export default function ClaroplastPerformance() {
	return (
		<section aria-labelledby="claroplast-performance" className="space-y-6">
			<h2 id="claroplast-performance" className="text-2xl font-semibold">
				Why Choose Polymer-Modified Claroplast?
			</h2>
			<p className="max-w-3xl">{CLAROPLAST.polymer}</p>
			<div className="grid gap-5 md:grid-cols-2">
				{CLAROPLAST.benefits.map(([title, text]) => (
					<article
						key={title}
						className="space-y-3 rounded-lg border border-neutral-200 p-5"
					>
						<h3 className="text-lg font-semibold">{title}</h3>
						<p>{text}</p>
					</article>
				))}
			</div>
			<h2 className="text-2xl font-semibold">Physical form</h2>
			<p className="max-w-3xl">{CLAROPLAST.form}</p>
		</section>
	)
}
