import type { Metadata } from 'next'
import Image from 'next/image'

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
			<Image
				src="/brand/eu-cofunded-hr.png"
				alt="Sufinancira Europska unija"
				width={1024}
				height={271}
				className="h-auto w-96 max-w-full"
				unoptimized
			/>
			<p>
				<strong>Korisnik:</strong> CLARO-PROM d.o.o.
			</p>
			<p>
				<strong>Referentna oznaka projekta:</strong> PK.1.3.04.0758
			</p>
			<p>
				Projekt je usmjeren na uvođenje i certifikaciju sustava upravljanja
				kvalitetom prema normi ISO 13485:2016 radi unaprjeđenja kvalitete
				poslovnih procesa, pouzdanosti proizvodnje IVD reagensa i konkurentnosti
				poduzeća na domaćem i međunarodnom tržištu.
			</p>
			<p>
				Provedbom projekta implementiran je sustav upravljanja kvalitetom,
				ishođen certifikat ISO 13485:2016 te unaprijeđene kompetencije
				zaposlenika i sustav upravljanja kvalitetom.
			</p>
			<p>
				<strong>Ukupna vrijednost projekta:</strong> 23.100,00 EUR
			</p>
			<p>
				<strong>Iznos EU sufinanciranja:</strong> 14.043,75 EUR
			</p>
			<p>
				<strong>Razdoblje provedbe:</strong> 1. veljače 2026. – 1. listopada
				2026.
			</p>
			<p>
				<strong>
					Projekt je sufinancirala Europska unija iz Programa Konkurentnost i
					kohezija, Europskog fonda za regionalni razvoj, za razdoblje
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
