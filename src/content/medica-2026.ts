import { inquiryHref } from '@/lib/outreach'

// Release candidate for owner-planned publication on 12 October 2026; no CMS writes.
// If release is delayed, update this date and reverify the new SHA before approval.
export const MEDICA = {
	slug: 'meet-claro-prom-medica-dusseldorf-2026',
	title: 'Meet CLARO-PROM at MEDICA Düsseldorf 2026',
	dates: '16–19 November 2026',
	location: 'Düsseldorf, Germany',
	stand: 'Hall 1 / A03',
	source:
		'https://www.medica-tradefair.com/vis/v1/en/exhprofiles/MEMg3gnCTEmzoN6PImP2dg',
	sourceVerifiedOn: '2026-10-12',
	publishDate: '2026-10-12' as string | null,
	end: '2026-11-20T00:00:00+01:00',
} as const
export const MEDICA_PATH = '/blog/en/' + MEDICA.slug
export function medicaAvailable(environment = process.env.VERCEL_ENV) {
	return (
		!!MEDICA.publishDate ||
		environment === 'preview' ||
		environment === 'development'
	)
}
export function showMedicaPromotion(
	now = new Date(),
	environment = process.env.VERCEL_ENV,
) {
	return (
		medicaAvailable(environment) &&
		now.getTime() < new Date(MEDICA.end).getTime()
	)
}
const paragraphs = [
	'CLARO-PROM will be exhibiting at MEDICA 2026, taking place from 16 to 19 November in Düsseldorf, Germany.',
	'We invite distributors, laboratory suppliers, existing partners and prospective business partners to meet our team and learn more about Claroplast Histology Paraffin Wax and our broader portfolio of IVD and laboratory products.',
	'As a manufacturer based in Croatia, European Union, CLARO-PROM welcomes discussions about product supply, distribution partnerships and OEM/private-label opportunities.',
	'Visit us at MEDICA 2026 — Hall 1 / A03.',
	'Interested in arranging a meeting during the exhibition? Contact our team in advance.',
]
const block = (text: string, key: string, href?: string) => ({
	_type: 'block',
	_key: key,
	style: 'normal',
	markDefs: href ? [{ _type: 'link', _key: key + '-link', href }] : [],
	children: [
		{
			_type: 'span',
			_key: key + '-text',
			text,
			marks: href ? [key + '-link'] : [],
		},
	],
})
export function preparedMedicaPost(environment = process.env.VERCEL_ENV) {
	if (!medicaAvailable(environment)) return null
	return {
		_id: 'prepared-medica-2026',
		_type: 'blog.post',
		language: 'en',
		title: MEDICA.title,
		publishDate: MEDICA.publishDate || undefined,
		metadata: {
			_type: 'metadata',
			title: MEDICA.title + ' | CLARO-PROM',
			description:
				'Meet CLARO-PROM at MEDICA 2026, 16–19 November in Düsseldorf. Hall 1 / A03. Arrange a meeting about Claroplast, distribution or OEM/private-label opportunities.',
			slug: { _type: 'slug', current: MEDICA.slug },
		},
		content: [
			...paragraphs.map((text, i) => block(text, 'paragraph-' + i)),
			block(
				'Arrange a meeting at MEDICA 2026',
				'meeting',
				inquiryHref('meeting'),
			),
			block(
				'Explore Claroplast Histology Paraffin Wax',
				'claroplast',
				'/products/histology-paraffin-wax-claroplast',
			),
			block('Official MEDICA exhibitor profile', 'source', MEDICA.source),
			block(
				'Discuss a distribution partnership',
				'distributors',
				'/distributors',
			),
			block('Browse our product catalogue', 'catalogue', '/products'),
		],
		contentPlainText: paragraphs.join('\n\n'),
		readTime: 1,
		headings: [],
		categories: [],
		modules: [{ _type: 'blog-post-content', _key: 'medica-article' }],
	}
}

/** Only an explicitly published article enters the public sitemap; CMS URLs win. */
export function medicaSitemapEntries(
	existing: Array<{ url: string }>,
	siteUrl: string,
) {
	if (
		!MEDICA.publishDate ||
		existing.some((entry) => entry.url === siteUrl + MEDICA_PATH)
	)
		return []
	return [
		{
			url: siteUrl + MEDICA_PATH,
			lastModified: MEDICA.publishDate,
			priority: 0.4,
		},
	]
}

/** Preserve the existing CMS record instead of adding a second fallback card. */
export function includeMedicaPost<
	T extends { metadata?: { slug?: { current?: string } | null } | null },
>(cmsPosts: T[] | null | undefined, environment = process.env.VERCEL_ENV) {
	const posts = cmsPosts ?? []
	const prepared = preparedMedicaPost(environment)
	return prepared &&
		!posts.some((post) => post.metadata?.slug?.current === MEDICA.slug)
		? [prepared, ...posts]
		: posts
}
