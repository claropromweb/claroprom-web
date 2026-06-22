import { defineField } from 'sanity'
import { TfiLayoutMediaLeft } from 'react-icons/tfi'
import { getBlockText } from '@/lib/utils'
import defineModule from '@/sanity/schemaTypes/fragments/define-module'

export default defineModule({
	name: 'hero.split',
	title: 'Hero (split)',
	type: 'object',
	icon: TfiLayoutMediaLeft,
	groups: [
		{ name: 'content', default: true },
		{ name: 'image' },
		{ name: 'options' },
	],
	fields: [
		defineField({
			name: 'eyebrow',
			type: 'string',
			group: 'content',
		}),
		defineField({
			name: 'content',
			type: 'array',
			of: [{ type: 'block' }, { type: 'custom-html' }],
			group: 'content',
		}),
		defineField({
			name: 'ctas',
			title: 'Call-to-actions',
			type: 'array',
			of: [{ type: 'cta' }],
			group: 'content',
		}),
		defineField({
			name: 'layout',
			title: 'Layout',
			type: 'string',
			group: 'options',
			options: {
				list: [
					{ title: 'Image left, text right', value: 'image-left' },
					{ title: 'Text left, image right', value: 'image-right' },
				],
				layout: 'radio',
			},
			initialValue: 'image-left',
		}),
		defineField({
			name: 'image',
			type: 'image',
			options: {
				hotspot: true,
				metadata: ['lqip'],
			},
			fieldsets: [{ name: 'options', options: { columns: 2 } }],
			fields: [
				defineField({
					name: 'alt',
					type: 'string',
					fieldset: 'options',
				}),
				defineField({
					name: 'loading',
					type: 'string',
					options: {
						list: ['lazy', 'eager'],
						layout: 'radio',
					},
					initialValue: 'lazy',
					fieldset: 'options',
				}),
				defineField({
					name: 'afterContent',
					description: 'Show image below text on mobile',
					type: 'boolean',
					fieldset: 'options',
				}),
			],
			group: 'image',
		}),
	],
	preview: {
		select: {
			content: 'content',
			image: 'image',
		},
		prepare: ({ content, image }) => ({
			title: getBlockText(content),
			subtitle: 'Hero (split)',
			media: image,
		}),
	},
})
