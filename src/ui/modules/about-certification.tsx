import { draftMode } from 'next/headers'
import { client } from '@/sanity/lib/client'
import { token } from '@/sanity/lib/token'
import type { FeatureSplit } from '@/sanity/types'
import { IsoCertification } from './feature-split'

export default async function AboutCertification() {
	// Read the existing Quality fields; About Us has no separate CMS copy.
	const certification = await client
		.withConfig({ useCdn: false, token })
		.fetch<NonNullable<FeatureSplit['items']>[number] | null>(
			`*[_type == "page" && language == "en" && catalogArchive != true && metadata.slug.current == "index"][0]
		.modules[_key == "e4653a80355f"][0].items[_key == "3ef95022d706"][0]{_key, isoCertificateUrl, isoQrImage}`,
			{},
			{
				perspective: (await draftMode()).isEnabled ? 'drafts' : 'published',
				cache: 'no-store',
			},
		)
	return certification ? (
		<div className="not-prose">
			<IsoCertification {...certification} showCaption />
		</div>
	) : null
}
