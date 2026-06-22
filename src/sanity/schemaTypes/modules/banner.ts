import { defineField } from 'sanity'
import { StarIcon } from '@sanity/icons'
import { getBlockText } from '@/lib/utils'
import defineModule from '@/sanity/schemaTypes/fragments/define-module'

export default defineModule({
	name: 'banner',
	title: 'Banner',
	type: 'object',
	icon: StarIcon,
	groups: [{ name: 'content', default: true }],
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
			name: 'intro',
			title: 'Description',
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
	],
	preview: {
		select: {
			title: 'title',
			pretitle: 'pretitle',
			intro: 'intro',
		},
		prepare: ({ title, pretitle, intro }) => ({
			title: title || pretitle || getBlockText(intro),
			subtitle: 'Banner',
		}),
	},
})
