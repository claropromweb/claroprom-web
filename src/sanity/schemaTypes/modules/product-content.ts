import { defineField } from 'sanity'
import { VscBeaker } from 'react-icons/vsc'
import defineModule from '@/sanity/schemaTypes/fragments/define-module'

export default defineModule({
	name: 'product-content',
	title: 'Product content',
	type: 'object',
	icon: VscBeaker,
	groups: [{ name: 'content', default: true }, { name: 'options' }],
	fields: [
		defineField({
			name: 'quoteLink',
			title: 'Ask for a quote link',
			description:
				'Where the per-row "Ask for a quote" button points (e.g. your contact page). The product code is appended as a query parameter.',
			type: 'link',
			group: 'content',
		}),
		defineField({
			name: 'showRelated',
			title: 'Show related products',
			type: 'boolean',
			initialValue: true,
			group: 'options',
		}),
		defineField({
			name: 'relatedLimit',
			title: 'Number of related products',
			type: 'number',
			initialValue: 4,
			validation: (Rule) => Rule.min(1),
			group: 'options',
		}),
	],
	preview: {
		select: {
			uid: 'attributes.uid',
		},
		prepare: ({ uid }) => ({
			title: 'Product content',
			subtitle: uid && `#${uid}`,
		}),
	},
})
