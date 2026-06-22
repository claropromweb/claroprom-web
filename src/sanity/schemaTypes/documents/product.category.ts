import { defineField, defineType } from 'sanity'
import { TagIcon } from '@sanity/icons'

export default defineType({
	name: 'product.category',
	title: 'Product category',
	type: 'document',
	icon: TagIcon,
	groups: [
		{ name: 'hr', title: 'Hrvatski', default: true },
		{ name: 'en', title: 'English' },
	],
	fields: [
		defineField({
			name: 'title',
			title: 'Title (HR)',
			type: 'string',
			group: 'hr',
		}),
		defineField({
			name: 'slug',
			title: 'Slug (HR)',
			type: 'slug',
			options: { source: 'title' },
			group: 'hr',
		}),
		defineField({
			name: 'title_en',
			title: 'Title (EN)',
			type: 'string',
			group: 'en',
		}),
		defineField({
			name: 'slug_en',
			title: 'Slug (EN)',
			type: 'slug',
			options: { source: 'title_en' },
			group: 'en',
		}),
	],
	preview: {
		select: {
			title: 'title',
			title_en: 'title_en',
		},
		prepare: ({ title, title_en }) => ({
			title: title || title_en,
			subtitle: title && title_en ? `HR · EN` : title ? 'HR' : 'EN',
		}),
	},
})
