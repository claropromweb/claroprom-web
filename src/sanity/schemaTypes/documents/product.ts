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
