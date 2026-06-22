import type { StructureResolverContext } from 'sanity/structure'
import { StructureBuilder, structureTool } from 'sanity/structure'
import { DocumentIcon } from '@sanity/icons'
import { VscBeaker, VscServerProcess } from 'react-icons/vsc'
import { DEFAULT_LANG, supportedLanguages } from '@/lib/i18n'
import { apiVersion } from '@/sanity/env'
import { singleton } from './lib/builders'
import { pageDirectoriesListItem } from './lib/page-directories'

// Pre-i18n documents have no `language` field. Surface them under the
// default-language list so editors can find and backfill them.
const langFilter = (type: string, langId: string) =>
	langId === DEFAULT_LANG
		? `_type == "${type}" && (!defined(language) || language == $lang)`
		: `_type == "${type}" && language == $lang`

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export default structureTool({
	structure: (S: StructureBuilder, context: StructureResolverContext) =>
		S.list()
			.title('Content')
			.items([
				S.divider().title('Global'),
				singleton(S, 'site').title('Site').icon(VscServerProcess),
				S.documentTypeListItem('global-module').title('Global modules'),

				S.divider().title('Pages'),
				S.listItem()
					.id('pages-by-language')
					.title('Pages')
					.icon(DocumentIcon)
					.child(
						S.list()
							.title('Pages by language')
							.items(
								supportedLanguages.map((lang) =>
									S.listItem()
										.title(lang.title)
										.id(`pages-${lang.id}`)
										.child(
											S.documentTypeList('page')
												.apiVersion(apiVersion)
												.title(`Pages (${lang.title})`)
												.filter(langFilter('page', lang.id))
												.params({ lang: lang.id }),
										),
								),
							),
					),
				pageDirectoriesListItem(S, context),

				S.divider().title('Blog'),
				S.listItem()
					.id('posts-by-language')
					.title('Posts')
					.child(
						S.list()
							.title('Posts by language')
							.items(
								supportedLanguages.map((lang) =>
									S.listItem()
										.title(lang.title)
										.id(`posts-${lang.id}`)
										.child(
											S.documentTypeList('blog.post')
												.apiVersion(apiVersion)
												.title(`Posts (${lang.title})`)
												.filter(langFilter('blog.post', lang.id))
												.params({ lang: lang.id }),
										),
								),
							),
					),
				S.documentTypeListItem('blog.category').title('Categories'),

				S.divider().title('Products'),
				S.listItem()
					.id('products-by-language')
					.title('Products')
					.icon(VscBeaker)
					.child(
						S.list()
							.title('Products by language')
							.items(
								supportedLanguages.map((lang) =>
									S.listItem()
										.title(lang.title)
										.id(`products-${lang.id}`)
										.child(
											S.documentTypeList('product')
												.apiVersion(apiVersion)
												.title(`Products (${lang.title})`)
												.filter(langFilter('product', lang.id))
												.params({ lang: lang.id }),
										),
								),
							),
					),
				S.documentTypeListItem('product.category').title(
					'Product categories',
				),

				S.divider().title('Navigation'),
				S.listItem()
					.id('navigations-by-language')
					.title('Navigations')
					.child(
						S.list()
							.title('Navigations by language')
							.items(
								supportedLanguages.map((lang) =>
									S.listItem()
										.title(lang.title)
										.id(`navigation-${lang.id}`)
										.child(
											S.documentTypeList('navigation')
												.apiVersion(apiVersion)
												.title(`Navigations (${lang.title})`)
												.filter(langFilter('navigation', lang.id))
												.params({ lang: lang.id }),
										),
								),
							),
					),
				S.documentTypeListItem('redirect').title('Redirects'),

				S.divider().title('References'),
				S.documentTypeListItem('form').title('Forms'),
				S.documentTypeListItem('logo').title('Logos'),
				S.documentTypeListItem('person').title('People'),
				S.documentTypeListItem('quote').title('Quotes'),
			]),
})
