import { defineArrayMember, defineField } from 'sanity'
import { TfiLayoutMediaRight } from 'react-icons/tfi'
import { count } from '@/lib/utils'
import defineModule from '@/sanity/schemaTypes/fragments/define-module'

export default defineModule({
	name: 'feature-split',
	title: 'Feature split',
	type: 'object',
	icon: TfiLayoutMediaRight,
	groups: [
		{ name: 'content', default: true },
		{ name: 'image' },
	],
	fields: [
		defineField({
			name: 'pretitle',
			type: 'string',
			group: 'content',
		}),
		defineField({
			name: 'title',
			type: 'string',
			group: 'content',
		}),
		defineField({
			name: 'items',
			type: 'array',
			of: [
				defineArrayMember({
					name: 'item',
					type: 'object',
					fields: [
						defineField({
							name: 'header',
							type: 'string',
							validation: (rule) => rule.required(),
						}),
						defineField({
							name: 'text',
							type: 'text',
							rows: 4,
						}),
					],
					preview: {
						select: {
							header: 'header',
							text: 'text',
						},
						prepare: ({ header, text }) => ({
							title: header,
							subtitle: text,
						}),
					},
				}),
			],
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
				defineField({
					name: 'loading',
					type: 'string',
					options: {
						list: ['lazy', 'eager'],
						layout: 'radio',
					},
					initialValue: 'lazy',
				}),
			],
			group: 'image',
		}),
	],
	preview: {
		select: {
			title: 'title',
			pretitle: 'pretitle',
			items: 'items',
			image: 'image',
		},
		prepare: ({ title, pretitle, items, image }) => ({
			title: title || pretitle,
			subtitle: `Feature split (${count(items, 'item')})`,
			media: image,
		}),
	},
})
