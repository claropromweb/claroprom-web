import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'EU projekt ISO 13485 | CLARO-PROM',
	description:
		'Informacije o EU sufinanciranju projekta uvođenja ISO 13485 sustava kvalitete za proizvodnju IVD reagensa, PK.1.3.04.0758.',
	alternates: { canonical: '/eu-projekt-iso-13485' },
}

export default function EUProject() {
	return (
		<article
			lang="hr"
			className="section mx-auto max-w-4xl space-y-6 py-12 leading-relaxed md:py-16"
		>
			<h1 className="text-3xl font-semibold md:text-4xl">
				Uvođenje ISO 13485 sustava kvalitete za proizvodnju IVD reagensa
			</h1>
			<p>
				<strong>Korisnik:</strong> CLARO-PROM d.o.o.
			</p>
			<p>
				<strong>Referentna oznaka projekta:</strong> PK.1.3.04.0758
			</p>
			<p>
				Cilj projekta bio je unaprijediti sustav upravljanja kvalitetom u
				proizvodnji IVD reagensa. Provedbom projekta implementiran je i
				certificiran sustav upravljanja kvalitetom prema normi ISO 13485:2016,
				čime su unaprijeđeni poslovni procesi i kompetencije zaposlenika.
			</p>
			<p>
				<strong>
					Projekt je sufinancirala Europska unija iz Europskog fonda za
					regionalni razvoj, u okviru Programa Konkurentnost i kohezija
					2021.–2027.
				</strong>
			</p>
			<p>
				Sadržaj ove objave isključiva je odgovornost tvrtke CLARO-PROM d.o.o.
			</p>
			<p>
				<a
					className="underline underline-offset-4"
					href="https://eufondovi.gov.hr/eu-fondovi/program-konkurentnost-i-kohezija-2021-2027/"
				>
					Program Konkurentnost i kohezija 2021.–2027.
				</a>
			</p>
		</article>
	)
}
