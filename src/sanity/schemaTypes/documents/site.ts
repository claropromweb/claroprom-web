import { defineField, defineType } from 'sanity'

const blockField = {
	type: 'block',
	styles: [{ title: 'Normal', value: 'normal' }],
	lists: [],
}

export default defineType({
	name: 'site',
	title: 'Site',
	type: 'document',
	groups: [
		{ name: 'branding', default: true },
		{ name: 'navigationHr', title: 'Navigation (HR)' },
		{ name: 'navigationEn', title: 'Navigation (EN)' },
		{ name: 'infoHr', title: 'Info (HR)' },
		{ name: 'infoEn', title: 'Info (EN)' },
	],
	fields: [
		// branding (shared)
		defineField({
			name: 'title',
			title: 'Title (HR)',
			type: 'string',
			validation: (Rule) => Rule.required(),
			group: 'branding',
		}),
		defineField({
			name: 'title_en',
			title: 'Title (EN)',
			type: 'string',
			group: 'branding',
		}),
		defineField({
			name: 'logo',
			type: 'logo',
			group: 'branding',
		}),
		defineField({
			name: 'ogimage',
			title: 'OpenGraph image (global)',
			description: 'Used for social sharing previews',
			type: 'image',
			group: 'branding',
		}),
		defineField({
			name: 'footerImages',
			title: 'Footer images / certifications',
			description:
				'Images shown in the fourth column of the footer (e.g. partner or certification logos). Stacked vertically in the order set here.',
			type: 'array',
			of: [
				{
					type: 'image',
					options: {
						hotspot: true,
						metadata: ['lqip'],
					},
					fields: [
						defineField({
							name: 'alt',
							title: 'Alternative text',
							type: 'string',
							validation: (Rule) => Rule.required(),
						}),
						defineField({
							name: 'href',
							title: 'Link (optional)',
							description:
								'Optional URL the image links to when clicked.',
							type: 'url',
							validation: (Rule) =>
								Rule.uri({
									scheme: ['http', 'https'],
									allowRelative: true,
								}),
						}),
					],
				},
			],
			group: 'branding',
		}),

		// Croatian navigation
		defineField({
			name: 'header',
			title: 'Header navigation (HR)',
			type: 'reference',
			to: [{ type: 'navigation' }],
			options: {
				filter: 'language == "hr"',
			},
			group: 'navigationHr',
		}),
		defineField({
			name: 'ctas',
			title: 'Header CTAs (HR)',
			type: 'array',
			of: [{ type: 'cta' }],
			group: 'navigationHr',
		}),
		defineField({
			name: 'footer',
			title: 'Footer menu (HR)',
			description:
				'Main footer menu shown in the center column (e.g. Home, Company, Products, Contacts). The navigation title is used as the column heading.',
			type: 'reference',
			to: [{ type: 'navigation' }],
			options: {
				filter: 'language == "hr"',
			},
			group: 'navigationHr',
		}),
		defineField({
			name: 'footerSecondary',
			title: 'Footer legal links (HR)',
			description:
				'Links shown on the right side of the red copyright bar (e.g. Privacy Policy, Impressum).',
			type: 'reference',
			to: [{ type: 'navigation' }],
			options: {
				filter: 'language == "hr"',
			},
			group: 'navigationHr',
		}),
		defineField({
			name: 'social',
			title: 'Social links (HR)',
			type: 'reference',
			to: [{ type: 'navigation' }],
			options: {
				filter: 'language == "hr"',
			},
			group: 'navigationHr',
		}),

		// English navigation
		defineField({
			name: 'header_en',
			title: 'Header navigation (EN)',
			type: 'reference',
			to: [{ type: 'navigation' }],
			options: {
				filter: 'language == "en"',
			},
			group: 'navigationEn',
		}),
		defineField({
			name: 'ctas_en',
			title: 'Header CTAs (EN)',
			type: 'array',
			of: [{ type: 'cta' }],
			group: 'navigationEn',
		}),
		defineField({
			name: 'footer_en',
			title: 'Footer menu (EN)',
			description:
				'Main footer menu shown in the center column (e.g. Home, Company, Products, Contacts). The navigation title is used as the column heading.',
			type: 'reference',
			to: [{ type: 'navigation' }],
			options: {
				filter: 'language == "en"',
			},
			group: 'navigationEn',
		}),
		defineField({
			name: 'footerSecondary_en',
			title: 'Footer legal links (EN)',
			description:
				'Links shown on the right side of the red copyright bar (e.g. Privacy Policy, Impressum).',
			type: 'reference',
			to: [{ type: 'navigation' }],
			options: {
				filter: 'language == "en"',
			},
			group: 'navigationEn',
		}),
		defineField({
			name: 'social_en',
			title: 'Social links (EN)',
			type: 'reference',
			to: [{ type: 'navigation' }],
			options: {
				filter: 'language == "en"',
			},
			group: 'navigationEn',
		}),

		// Croatian info
		defineField({
			name: 'footerContent',
			title: 'Footer contact info (HR)',
			description:
				'Contact details shown in the right column of the main footer (address, phone, email).',
			type: 'array',
			of: [blockField],
			group: 'infoHr',
		}),
		defineField({
			name: 'copyright',
			title: 'Copyright (HR)',
			description:
				'Text shown on the left side of the red copyright bar.',
			type: 'array',
			of: [blockField],
			group: 'infoHr',
		}),

		// English info
		defineField({
			name: 'footerContent_en',
			title: 'Footer contact info (EN)',
			description:
				'Contact details shown in the right column of the main footer (address, phone, email).',
			type: 'array',
			of: [blockField],
			group: 'infoEn',
		}),
		defineField({
			name: 'copyright_en',
			title: 'Copyright (EN)',
			description:
				'Text shown on the left side of the red copyright bar.',
			type: 'array',
			of: [blockField],
			group: 'infoEn',
		}),
	],
	preview: {
		prepare: () => ({
			title: 'Site',
		}),
	},
})
