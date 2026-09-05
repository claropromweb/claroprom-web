import { defineArrayMember, defineField, defineType } from 'sanity'
import { DocumentIcon, ImageIcon } from '@sanity/icons'
import { VscBeaker } from 'react-icons/vsc'
import { count } from '@/lib/utils'
import { DEFAULT_LANG } from '@/lib/i18n'

export default defineType({
	name: 'product',
	title: 'Product',
	type: 'document',
	icon: VscBeaker,
	groups: [
		{ name: 'content', default: true },
		{ name: 'regulatory', title: 'Regulatory & use' },
		{ name: 'docs', title: 'Documents' },
		{ name: 'metadata' },
	],
	fields: [
		defineField({
			name: 'language',
			type: 'string',
			readOnly: true,
			hidden: ({ document }) => !!(document as { language?: string })?.language,
			initialValue: DEFAULT_LANG,
		}),
		defineField({
			name: 'title',
			type: 'string',
			group: 'content',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'category',
			type: 'reference',
			to: [{ type: 'product.category' }],
			group: 'content',
		}),
		defineField({
			name: 'image',
			type: 'image',
			options: {
				hotspot: true,
				metadata: ['lqip'],
			},
			fields: [
				defineField({
					name: 'alt',
					type: 'string',
				}),
			],
			group: 'content',
		}),
		defineField({
			name: 'description',
			type: 'array',
			of: [{ type: 'block' }],
			group: 'content',
		}),
		defineField({
			name: 'productType',
			title: 'Product type',
			type: 'string',
			options: {
				layout: 'radio',
				list: [
					{ title: 'IVD medical device', value: 'ivd' },
					{ title: 'Laboratory reagent', value: 'laboratory-reagent' },
					{ title: 'Laboratory consumable', value: 'consumable' },
				],
			},
			validation: (Rule) => Rule.required(),
			group: 'regulatory',
		}),
		defineField({
			name: 'manufacturerRole',
			title: 'Claroprom role',
			type: 'string',
			options: {
				layout: 'radio',
				list: [
					{ title: 'Manufacturer', value: 'manufacturer' },
					{ title: 'Distributor', value: 'distributor' },
				],
			},
			validation: (Rule) => Rule.required(),
			group: 'regulatory',
		}),
		defineField({
			name: 'intendedPurpose',
			title: 'Intended purpose',
			type: 'array',
			of: [{ type: 'block' }],
			description: 'Use the wording approved in the product documentation.',
			group: 'regulatory',
		}),
		defineField({
			name: 'ivdClass',
			title: 'IVD class',
			type: 'string',
			options: {
				list: [
					{ title: 'Class A', value: 'A' },
					{ title: 'Class B', value: 'B' },
					{ title: 'Class C', value: 'C' },
					{ title: 'Class D', value: 'D' },
				],
			},
			hidden: ({ parent }) => parent?.productType !== 'ivd',
			group: 'regulatory',
		}),
		defineField({
			name: 'storageConditions',
			title: 'Storage conditions',
			type: 'string',
			group: 'regulatory',
		}),
		defineField({
			name: 'shelfLife',
			title: 'Shelf life',
			type: 'string',
			group: 'regulatory',
		}),
		defineField({
			name: 'table',
			title: 'Codes & formats',
			type: 'array',
			of: [
				defineArrayMember({
					type: 'object',
					name: 'row',
					fields: [
						defineField({
							name: 'code',
							type: 'string',
							validation: (Rule) => Rule.required(),
						}),
						defineField({
							name: 'format',
							type: 'string',
						}),
					],
					preview: {
						select: { code: 'code', format: 'format' },
						prepare: ({ code, format }) => ({
							title: code,
							subtitle: format,
						}),
					},
				}),
			],
			group: 'content',
		}),
		defineField({
			name: 'instructionsForUse',
			title: 'Instructions for Use – IFU (PDF)',
			type: 'file',
			options: { accept: '.pdf' },
			icon: DocumentIcon,
			group: 'docs',
		}),
		defineField({
			name: 'declarationOfConformity',
			title: 'EU Declaration of Conformity (PDF)',
			type: 'file',
			options: { accept: '.pdf' },
			icon: DocumentIcon,
			group: 'docs',
		}),
		defineField({
			name: 'technicalDataSheet',
			title: 'Technical Data Sheet (PDF)',
			type: 'file',
			options: { accept: '.pdf' },
			icon: DocumentIcon,
			group: 'docs',
		}),
		defineField({
			name: 'safetyDataSheet',
			title: 'Safety Data Sheet (PDF)',
			type: 'file',
			options: { accept: '.pdf' },
			icon: DocumentIcon,
			group: 'docs',
		}),
		defineField({
			name: 'metadata',
			type: 'metadata',
			group: 'metadata',
		}),
	],
	preview: {
		select: {
			title: 'title',
			category: 'category.title',
			category_en: 'category.title_en',
			media: 'image',
			table: 'table',
		},
		prepare: ({ title, category, category_en, media, table }) => ({
			title,
			subtitle: [category || category_en, count(table, 'code')]
				.filter(Boolean)
				.join(' · '),
			media,
		}),
	},
	orderings: [
		{
			name: 'title',
			title: 'Title',
			by: [{ field: 'title', direction: 'asc' }],
		},
	],
})
