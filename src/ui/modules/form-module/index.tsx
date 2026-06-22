import { PortableText, stegaClean } from 'next-sanity'
import { Suspense } from 'react'
import getLangServer from '@/lib/get-lang-server'
import type { FormModule } from '@/sanity/types'
import Eyebrow from '@/ui/eyebrow'
import Loading from '@/ui/loading'
import { Module } from '..'
import ContactForm from './contact-form'

type FormModuleProps = Omit<FormModule, 'form'> & {
	form?: { _id?: string; identifier?: string; endpoint?: string } | null
}

export default async function FormModuleComponent({
	eyebrow,
	intro = [],
	form,
	...props
}: FormModuleProps) {
	const lang = await getLangServer()

	return (
		<Module className="section" {...props}>
			<div className="mx-auto w-full space-y-8">
				{(eyebrow || (intro && intro.length > 0)) && (
					<header className="prose">
						<Eyebrow value={eyebrow} />
						<PortableText value={intro ?? []} />
					</header>
				)}

				<Suspense fallback={<Loading />}>
					<ContactForm lang={lang} formId={stegaClean(form?.identifier)} />
				</Suspense>
			</div>
		</Module>
	)
}
