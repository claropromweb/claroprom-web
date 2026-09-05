import {
	defineDocuments,
	defineLocations,
	presentationTool,
} from 'sanity/presentation'
import { groq } from 'next-sanity'
import { ROUTES } from '@/lib/env'
import { DEFAULT_LANG } from '@/lib/i18n'
import { categoryUrl } from '@/lib/product-category-url'
import resolveUrl from '@/lib/resolve-url'
import {
	locationResolvers,
	referenceLocations,
} from './presentation/reference-locations'

export default presentationTool({
	previewUrl: {
		previewMode: {
			enable: '/api/draft-mode/enable',
			disable: '/api/draft-mode/disable',
		},
	},
	resolve: {
		mainDocuments: defineDocuments([
			{
				route: '/en/proizvodi/:slug',
				filter: groq`_type == 'product.category' && slug_en.current == $slug && showInCatalog == true`,
			},
			// Pages — default language (no prefix)
			{
				route: '/',
				filter: groq`_type == 'page' && metadata.slug.current == 'index'
					&& (!defined(language) || language == '${DEFAULT_LANG}')`,
			},
			{
				route: '/:slug',
				filter: groq`_type == 'page' && metadata.slug.current == $slug
					&& (!defined(language) || language == '${DEFAULT_LANG}')`,
			},
			// Pages — localized
			{
				route: '/:lang',
				filter: groq`_type == 'page' && metadata.slug.current == 'index'
					&& language == $lang`,
			},
			{
				route: '/:lang/:slug',
				filter: groq`_type == 'page' && metadata.slug.current == $slug
					&& language == $lang`,
			},
			// Blog — default language
			{
				route: `/${ROUTES.blog}/:slug`,
				filter: groq`_type == 'blog.post' && metadata.slug.current == $slug
					&& (!defined(language) || language == '${DEFAULT_LANG}')`,
			},
			// Blog — localized
			{
				route: `/${ROUTES.blog}/:lang/:slug`,
				filter: groq`_type == 'blog.post' && metadata.slug.current == $slug
					&& language == $lang`,
			},
			// Products — default language
			{
				route: `/${ROUTES.products}/:slug`,
				filter: groq`_type == 'product' && metadata.slug.current == $slug
					&& (!defined(language) || language == '${DEFAULT_LANG}')`,
			},
			// Products — localized
			{
				route: `/${ROUTES.products}/:lang/:slug`,
				filter: groq`_type == 'product' && metadata.slug.current == $slug
					&& language == $lang`,
			},
		]),
		locations: locationResolvers({
			// global
			site: defineLocations({
				message: 'Global settings used on all pages',
				tone: 'positive',
			}),
			'global-module': defineLocations({
				message: 'Modules are added to all pages in the target path',
				tone: 'positive',
			}),
			// Used on...
			page: defineLocations({
				select: {
					title: 'title',
					slug: 'metadata.slug.current',
					language: 'language',
				},
				resolve: (doc) => ({
					locations: [
						{
							title: doc?.title ?? 'Untitled',
							href:
								resolveUrl(
									{
										_type: 'page',
										language: doc?.language,
										metadata: { slug: { current: doc?.slug } },
									},
									{ base: false },
								) || '/',
						},
					],
				}),
			}),
			'blog.post': defineLocations({
				select: {
					title: 'metadata.title',
					slug: 'metadata.slug.current',
					language: 'language',
				},
				resolve: (doc) => ({
					locations: [
						{
							title: doc?.title ?? 'Untitled',
							href:
								resolveUrl(
									{
										_type: 'blog.post',
										language: doc?.language,
										metadata: { slug: { current: doc?.slug } },
									},
									{ base: false },
								) || `/${ROUTES.blog}`,
						},
					],
				}),
			}),
			product: defineLocations({
				select: {
					title: 'title',
					slug: 'metadata.slug.current',
					language: 'language',
				},
				resolve: (doc) => ({
					locations: [
						{
							title: doc?.title ?? 'Untitled',
							href:
								resolveUrl(
									{
										_type: 'product',
										language: doc?.language,
										metadata: { slug: { current: doc?.slug } },
									},
									{ base: false },
								) || `/${ROUTES.products}`,
						},
					],
				}),
			}),
			'product.category': defineLocations({
				select: {
					title: 'title_en',
					slug: 'slug_en.current',
					visible: 'showInCatalog',
				},
				resolve: (doc) => ({
					locations:
						doc?.visible && doc?.slug
							? [
									{
										title: doc.title ?? 'Product category',
										href: categoryUrl(doc.slug),
									},
								]
							: [],
				}),
			}),
			form: referenceLocations('form'),
			quote: referenceLocations('quote'),
			logo: referenceLocations('logo'),
			person: referenceLocations('person'),
		}),
	},
})
