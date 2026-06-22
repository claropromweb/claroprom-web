import { defineField } from 'sanity'
import { ThLargeIcon } from '@sanity/icons'
import { getBlockText } from '@/lib/utils'
import defineModule from '@/sanity/schemaTypes/fragments/define-module'

export default defineModule({
	name: 'product-list',
	title: 'Product list',
	type: 'object',
	icon: ThLargeIcon,
	groups: [{ name: 'content', default: true }, { name: 'options' }],
	fields: [
		defineField({
			name: 'intro',
			type: 'array',
			of: [{ type: 'block' }],
			group: 'content',
		}),
		defineField({
			name: 'productsPerPage',
			type: 'number',
			initialValue: 12,
			validation: (Rule) => Rule.min(1),
			group: 'options',
		}),
	],
	preview: {
		select: {
			intro: 'intro',
		},
		prepare: ({ intro }) => ({
			title: getBlockText(intro) || 'Product list',
			subtitle: 'Product list',
		}),
	},
})
