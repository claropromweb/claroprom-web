import { defineArrayMember, defineField, defineType } from 'sanity'
import { DocumentIcon, ImageIcon } from '@sanity/icons'
import { VscBeaker } from 'react-icons/vsc'
import { DEFAULT_LANG } from '@/lib/i18n'
import { count } from '@/lib/utils'

export default defineType({
	name: 'product',
	title: 'Product',
	type: 'document',
	icon: VscBeaker,
	groups: [
		{ name: 'content', title: 'Basic product information', default: true },
		{ name: 'photos', title: 'Photographs' },
		{ name: 'catalogue', title: 'Packaging & catalogue' },
		{ name: 'regulatory', title: 'Regulatory & use' },
		{ name: 'docs', title: 'Technical documents' },
		{ name: 'metadata' },
	],
	fields: [
		defineField({
			name: 'hidden',
			title: 'Hide from website',
			type: 'boolean',
			initialValue: false,
			group: 'content',
			description:
				'Publish this change to hide the product from lists, search and its public page. Turn off and publish to show it again.',
		}),
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
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'image',
			title: 'Main product photograph',
			description:
				'Upload the actual packaging for this catalogue record. Keep the entire pack and label visible. If a photograph represents another pack size, explain this in its caption or leave the photograph empty.',
			type: 'image',
			options: {
				hotspot: true,
				metadata: ['lqip'],
			},
			fields: [
				defineField({
					name: 'alt',
					title: 'Alternative text',
					description:
						'Describe the visible product and pack size. Do not add claims or keywords. The product name is used when this is empty.',
					type: 'string',
				}),
				defineField({
					name: 'caption',
					title: 'Photograph caption (optional)',
					type: 'string',
					description:
						'Explain a representative pack size or useful view. Use the language of this product record.',
				}),
			],
			group: 'photos',
		}),
		defineField({
			name: 'shortDescription',
			title: 'Short product description',
			type: 'text',
			rows: 3,
			group: 'content',
			description:
				'One approved factual sentence for catalogue cards (usually 80–160 characters). Write in this product document’s language. This is not the regulatory intended purpose. Leave empty until reviewed; it does not change SEO metadata.',
			validation: (Rule) =>
				Rule.max(240).warning(
					'Keep the summary concise; about 80–160 characters is usually enough.',
				),
		}),
		defineField({
			name: 'description',
			title: 'Detailed product description',
			description:
				'Approved product function and characteristics only. Do not rewrite intended purpose here or infer specifications from a product name.',
			type: 'array',
			of: [{ type: 'block' }],
			group: 'content',
		}),
		defineField({
			name: 'gallery',
			title: 'Additional photographs',
			description:
				'Add actual views for this record, then drag to reorder. Each image has its own alternative text and optional caption. There is no required number of photographs.',
			type: 'array',
			of: [
				defineArrayMember({
					type: 'image',
					options: { hotspot: true, metadata: ['lqip'] },
					fields: [
						defineField({
							name: 'alt',
							title: 'Alternative text',
							description:
								'Describe the visible view and packaging, in the language of this record.',
							type: 'string',
						}),
						defineField({
							name: 'caption',
							title: 'Photograph caption (optional)',
							type: 'string',
							description:
								'Identify the view or representative packaging when needed.',
						}),
					],
				}),
			],
			group: 'photos',
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
			description:
				'Use confirmed catalogue numbers and actual pack sizes only. Transport cartons are not additional SKUs. Claroplast public codes remain CP00CL2 (2 kg) and CP00CLP (10 kg); do not copy legacy source values.',
			title: 'Product codes & available pack sizes',
			type: 'array',
			of: [
				defineArrayMember({
					type: 'object',
					name: 'row',
					fields: [
						defineField({
							name: 'code',
							title: 'Product code / SKU',
							type: 'string',
							validation: (Rule) => Rule.required(),
						}),
						defineField({
							name: 'format',
							title: 'Pack size',
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
			group: 'catalogue',
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
