import { defineArrayMember, defineField } from 'sanity'
import { TfiLayoutColumn2 } from 'react-icons/tfi'
import { count } from '@/lib/utils'
import defineModule from '@/sanity/schemaTypes/fragments/define-module'

export default defineModule({
	name: 'split-columns',
	title: 'Split columns',
	type: 'object',
	icon: TfiLayoutColumn2,
	groups: [{ name: 'content', default: true }],
	fields: [
		defineField({
			name: 'columns',
			type: 'array',
			of: [
				defineArrayMember({
					name: 'column',
					type: 'object',
					fields: [
						defineField({
							name: 'image',
							title: 'Background image',
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
							validation: (rule) => rule.required(),
						}),
						defineField({
							name: 'title',
							type: 'string',
							validation: (rule) => rule.required(),
						}),
						defineField({
							name: 'description',
							type: 'text',
							rows: 3,
						}),
						defineField({
							name: 'link',
							type: 'link',
						}),
					],
					preview: {
						select: {
							title: 'title',
							description: 'description',
							image: 'image',
						},
						prepare: ({ title, description, image }) => ({
							title,
							subtitle: description,
							media: image,
						}),
					},
				}),
			],
			validation: (rule) => rule.min(2).max(2),
			group: 'content',
		}),
	],
	preview: {
		select: {
			columns: 'columns',
		},
		prepare: ({ columns }) => ({
			title: 'Split columns',
			subtitle: count(columns, 'column'),
		}),
	},
})
