import { defineField } from 'sanity'

export default ({ of = [] }: { of?: Array<{ type: string }> } = {}) =>
	defineField({
		name: 'modules',
		type: 'array',
		of: [
			{ type: 'accordion-list' },
			{ type: 'blog-index' },
			{ type: 'blog-post-list' },
			{ type: 'banner' },
			{ type: 'breadcrumbs' },
			{ type: 'callout' },
			{ type: 'card-list' },
			{ type: 'category-grid' },
			{ type: 'custom-html' },
			{ type: 'feature-split' },
			{ type: 'form-module' },
			{ type: 'hero.cover' },
			{ type: 'hero.split' },
			{ type: 'logo-list' },
			{ type: 'person-list' },
			{ type: 'product-list' },
			{ type: 'prose' },
			{ type: 'quote-list' },
			{ type: 'search-module' },
			{ type: 'split-columns' },
			{ type: 'stat-list' },
			{ type: 'step-list' },
			...of,
		],
		options: {
			insertMenu: {
				filter: true,
				views: [
					{
						name: 'grid',
						previewImageUrl: (module) => `/module-thumbnails/${module}.webp`,
					},
					{ name: 'list' },
				],
				groups: [
					{
						name: 'content',
						of: [
							'accordion-list',
							'banner',
							'callout',
							'card-list',
							'category-grid',
							'feature-split',
							'form-module',
							'hero.cover',
							'hero.split',
							'logo-list',
							'person-list',
							'prose',
							'quote-list',
							'split-columns',
							'stat-list',
							'step-list',
						],
					},
					{
						name: 'utility',
						of: ['breadcrumbs', 'custom-html', 'form-module', 'search-module'],
					},
					{
						name: 'blog',
						of: ['blog-index', 'blog-post-content', 'blog-post-list'],
					},
					{
						name: 'products',
						of: ['product-list', 'product-content'],
					},
				],
			},
		},
	})
