import { defineArrayMember, defineField } from 'sanity'
import { TfiLayoutGrid2 } from 'react-icons/tfi'
import { count } from '@/lib/utils'
import defineModule from '@/sanity/schemaTypes/fragments/define-module'

export default defineModule({
	name: 'category-grid',
	title: 'Category grid',
	type: 'object',
	icon: TfiLayoutGrid2,
	groups: [
		{ name: 'content', default: true },
		{ name: 'categories' },
	],
	fields: [
		defineField({
			name: 'pretitle',
			type: 'string',
			group: 'content',
		}),
		defineField({
			name: 'heading',
			type: 'string',
			group: 'content',
		}),
		defineField({
			name: 'categories',
			type: 'array',
			of: [
				defineArrayMember({
					name: 'category',
					type: 'object',
					fields: [
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
							validation: (rule) => rule.required(),
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
			group: 'categories',
		}),
	],
	preview: {
		select: {
			heading: 'heading',
			pretitle: 'pretitle',
			categories: 'categories',
		},
		prepare: ({ heading, pretitle, categories }) => ({
			title: heading || pretitle,
			subtitle: `Category grid (${count(categories, 'category')})`,
		}),
	},
})
