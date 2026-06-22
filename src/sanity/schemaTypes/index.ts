import type { SchemaPluginOptions } from 'sanity'
// documents
import blogCategory from './documents/blog.category'
import blogPost from './documents/blog.post'
import form from './documents/form'
import globalModule from './documents/global-module'
import logo from './documents/logo'
import navigation from './documents/navigation'
import page from './documents/page'
import person from './documents/person'
import product from './documents/product'
import productCategory from './documents/product.category'
import quote from './documents/quote'
import redirect from './documents/redirect'
import site from './documents/site'
// modules
import accordionList from './modules/accordion-list'
import blogIndex from './modules/blog-index'
import blogPostContent from './modules/blog-post-content'
import blogPostList from './modules/blog-post-list'
import banner from './modules/banner'
import breadcrumbs from './modules/breadcrumbs'
import callout from './modules/callout'
import cardList from './modules/card-list'
import categoryGrid from './modules/category-grid'
import customHtml from './modules/custom-html'
import featureSplit from './modules/feature-split'
import formModule from './modules/form-module'
import heroCover from './modules/hero.cover'
import heroSplit from './modules/hero.split'
import logoList from './modules/logo-list'
import personList from './modules/person-list'
import productContent from './modules/product-content'
import productList from './modules/product-list'
import prose from './modules/prose'
import quoteList from './modules/quote-list'
import searchModule from './modules/search-module'
import splitColumns from './modules/split-columns'
import statList from './modules/stat-list'
import stepList from './modules/step-list'
// objects
import cta from './objects/cta'
import link from './objects/link'
import linkList from './objects/link.list'
import megamenu from './objects/megamenu'
import metadata from './objects/metadata'
import moduleAttributes from './objects/module-attributes'
import sidebar from './objects/sidebar'

export const schema: SchemaPluginOptions = {
	types: [
		// documents
		site,
		page,
		form,
		globalModule,
		blogPost,
		product,
		redirect,

		// references
		blogCategory,
		productCategory,
		logo,
		navigation,
		person,
		quote,

		// objects
		cta,
		link,
		linkList,
		megamenu,
		metadata,
		moduleAttributes,
		sidebar,

		// modules
		accordionList,
		blogIndex,
		blogPostContent,
		blogPostList,
		banner,
		breadcrumbs,
		callout,
		cardList,
		categoryGrid,
		customHtml,
		featureSplit,
		formModule,
		heroCover,
		heroSplit,
		logoList,
		personList,
		productContent,
		productList,
		prose,
		quoteList,
		searchModule,
		splitColumns,
		statList,
		stepList,
	],

	templates: (templates) =>
		templates.filter(({ schemaType }) => !singletonTypes.includes(schemaType)),
}

const singletonTypes = ['site']
