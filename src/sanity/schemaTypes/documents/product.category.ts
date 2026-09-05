import { defineField, defineType } from 'sanity'
import { TagIcon } from '@sanity/icons'

export default defineType({
	name: 'product.category',
	title: 'Product category',
	type: 'document',
	icon: TagIcon,
	groups: [
		{ name: 'en', title: 'English', default: true },
		{ name: 'hr', title: 'Hrvatski' },
		{ name: 'catalog', title: 'Catalog' },
	],
	fields: [
		defineField({
			name: 'showInCatalog',
			title: 'Show in Products',
			type: 'boolean',
			initialValue: true,
			group: 'catalog',
			description:
				'Publish this category to show it in Products, even before adding products.',
		}),
		defineField({
			name: 'description_en',
			title: 'Description (EN)',
			type: 'text',
			group: 'en',
		}),
		defineField({
			name: 'image',
			title: 'Category photograph',
			type: 'image',
			options: { hotspot: true, metadata: ['lqip'] },
			fields: [
				defineField({ name: 'alt', title: 'Alternative text', type: 'string' }),
			],
			group: 'catalog',
		}),
		defineField({
			name: 'sortOrder',
			title: 'Display order',
			type: 'number',
			initialValue: 0,
			group: 'catalog',
		}),
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
			validation: (Rule) =>
				Rule.custom((value, context) =>
					context.document?.showInCatalog && !value
						? 'Enter an English category name.'
						: true,
				),
		}),
		defineField({
			name: 'slug_en',
			title: 'Slug (EN)',
			type: 'slug',
			options: { source: 'title_en' },
			group: 'en',
			description:
				'Public page: /en/proizvodi/<slug>. Keep this unchanged after sharing the URL.',
			validation: (Rule) =>
				Rule.custom((value, context) => {
					if (!context.document?.showInCatalog) return true
					return value?.current &&
						/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.current)
						? true
						: 'Enter a unique URL slug using lowercase letters, numbers and hyphens.'
				}),
		}),
	],
	preview: {
		select: {
			title: 'title',
			title_en: 'title_en',
		},
		prepare: ({ title, title_en }) => ({
			title: title_en || title,
			subtitle: title && title_en ? `HR · EN` : title ? 'HR' : 'EN',
		}),
	},
})
