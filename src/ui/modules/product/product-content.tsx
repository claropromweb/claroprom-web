import { groq, PortableText, stegaClean } from 'next-sanity'
import Link from 'next/link'
import { ROUTES } from '@/lib/env'
import getLangServer from '@/lib/get-lang-server'
import { DEFAULT_LANG } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { sanityFetchLive } from '@/sanity/lib/live'
import type { PRODUCT_QUERY_RESULT, ProductContent } from '@/sanity/types'
import Img from '@/ui/img'
import { Module } from '@/ui/modules'
import ProductPreview from './product-preview'
import { getProductTranslations } from './translations'

type QuoteLink = {
	type?: string | null
	external?: string | null
	params?: string | null
	internal?: { slug?: string | { current?: string } | null } | null
}

function quoteBaseHref(link?: QuoteLink | null): string | null {
	if (!link) return null
	if (link.type === 'external' && link.external) return stegaClean(link.external)
	if (link.type === 'internal' && link.internal) {
		const slug =
			typeof link.internal.slug === 'string'
				? link.internal.slug
				: link.internal.slug?.current
		if (slug)
			return [stegaClean(slug), stegaClean(link.params ?? undefined)]
				.filter(Boolean)
				.join('')
	}
	return null
}

function withParam(base: string, key: string, value: string) {
	const sep = base.includes('?') ? '&' : '?'
	return `${base}${sep}${key}=${encodeURIComponent(value)}`
}

// Matches the contact form submit button (src/ui/modules/form-module/contact-form.tsx)
const BUTTON_BASE =
	'gap-ch inline-flex items-center justify-center rounded-md bg-red-600 font-semibold text-white transition-colors hover:bg-red-700 active:scale-98'
const QUOTE_BUTTON = cn(BUTTON_BASE, 'whitespace-nowrap px-4 py-2 text-xs')
const SHEET_BUTTON = cn(BUTTON_BASE, 'px-8 py-3')

export default async function ({
	product,
	quoteLink,
	showRelated = true,
	relatedLimit = 4,
	...props
}: { product: PRODUCT_QUERY_RESULT } & ProductContent) {
	if (!product) return null

	const lang = await getLangServer()
	const t = getProductTranslations(lang)

	const category = product.category
	const categoryTitle =
		lang === 'en'
			? (category?.title_en ?? category?.title)
			: category?.title
	const categorySlug = stegaClean(
		(lang === 'en'
			? (category?.slug_en?.current ?? category?.slug?.current)
			: category?.slug?.current) ?? '',
	)

	const technicalUrl = product.technicalDataSheet?.asset?.url
	const safetyUrl = product.safetyDataSheet?.asset?.url
	const ifuUrl = product.instructionsForUse?.asset?.url
	const declarationUrl = product.declarationOfConformity?.asset?.url
	const productTypeLabel =
		product.productType === 'ivd'
			? t.ivd
			: product.productType === 'laboratory-reagent'
				? t.laboratoryReagent
				: product.productType === 'consumable'
					? t.consumable
					: null
	const roleLabel =
		product.manufacturerRole === 'manufacturer'
			? t.manufacturer
			: product.manufacturerRole === 'distributor'
				? t.distributor
				: null

	// Quote target: an explicit `quoteLink` on the module, otherwise auto-discover
	// the page that hosts the contact form so "Ask for a quote" always works.
	const explicitQuoteHref = quoteBaseHref(quoteLink as QuoteLink)
	const contactPage = explicitQuoteHref
		? null
		: await sanityFetchLive<{ url?: string } | null>({
				query: CONTACT_PAGE_QUERY,
				params: { lang, defaultLang: DEFAULT_LANG },
			})
	const quoteHref = explicitQuoteHref ?? contactPage?.url ?? null
	const productName = stegaClean(product.title ?? '')

	const related =
		showRelated && category?._id
			? await sanityFetchLive<any>({
					query: RELATED_PRODUCTS_QUERY,
					params: {
						id: product._id,
						categoryId: category._id,
						limit: relatedLimit,
						lang,
						defaultLang: DEFAULT_LANG,
						productsDir: `/${ROUTES.products}/`,
					},
				})
			: []

	return (
		<Module as="article" {...props}>
			<header className="full-bleed bg-red-600 px-6 py-12 text-center text-white md:py-14">
				<div className="mx-auto max-w-5xl space-y-3">
					<h1 className="text-3xl font-normal text-balance md:text-4xl">
						{product.title}
					</h1>

					<nav
						className="flex flex-wrap items-center justify-center gap-x-2 text-base text-white [&_a]:text-white"
						aria-label="Breadcrumb"
					>
						<Link href="/" className="text-white hover:underline">
							{t.home}
						</Link>
						{categoryTitle && (
							<>
								<span aria-hidden>›</span>
								<Link
									href={{
										pathname: `/${ROUTES.products}`,
										query: categorySlug ? { category: categorySlug } : undefined,
									}}
									className="text-white hover:underline"
								>
									{categoryTitle}
								</Link>
							</>
						)}
						<span aria-hidden>›</span>
						<span className="text-white/90">{product.title}</span>
					</nav>
				</div>
			</header>

			<div className="section grid items-start gap-10 py-12 md:grid-cols-2 md:gap-14">
				<figure className="flex aspect-square w-full items-center justify-center overflow-hidden">
					{product.image?.asset ? (
						<Img
							className="h-full w-full object-contain"
							image={product.image}
							width={640}
							height={640}
							alt={product.image?.alt ?? product.title ?? ''}
							loading="eager"
						/>
					) : (
						<div className="bg-foreground/5 h-full w-full" />
					)}
				</figure>

				<div className="space-y-6">
					{(productTypeLabel || roleLabel) && (
						<div className="flex flex-wrap gap-2">
							{productTypeLabel && (
								<span className="rounded-full bg-red-600 px-3 py-1 text-sm font-semibold text-white">
									{productTypeLabel}
								</span>
							)}
							{roleLabel && (
								<span className="border-stroke rounded-full border px-3 py-1 text-sm font-medium">
									{roleLabel}: Claroprom
								</span>
							)}
						</div>
					)}

					{!!product.description?.length && (
						<div className="prose max-w-none">
							<PortableText value={product.description} />
						</div>
					)}

					{!!product.intendedPurpose?.length && (
						<section className="border-stroke border-t pt-5">
							<h2 className="mb-2 text-lg font-semibold">{t.intendedPurpose}</h2>
							<div className="prose max-w-none">
								<PortableText value={product.intendedPurpose} />
							</div>
						</section>
					)}

					{(product.ivdClass || product.storageConditions || product.shelfLife) && (
						<dl className="border-stroke grid border-y text-sm sm:grid-cols-2">
							{product.ivdClass && (
								<div className="border-stroke px-4 py-3 sm:border-r">
									<dt className="text-foreground/60">{t.ivdClass}</dt>
									<dd className="mt-1 font-semibold">{product.ivdClass}</dd>
								</div>
							)}
							{product.storageConditions && (
								<div className="px-4 py-3">
									<dt className="text-foreground/60">{t.storageConditions}</dt>
									<dd className="mt-1 font-semibold">{product.storageConditions}</dd>
								</div>
							)}
							{product.shelfLife && (
								<div className="border-stroke border-t px-4 py-3 sm:col-span-2">
									<dt className="text-foreground/60">{t.shelfLife}</dt>
									<dd className="mt-1 font-semibold">{product.shelfLife}</dd>
								</div>
							)}
						</dl>
					)}

					{categoryTitle && (
						<p className="text-foreground/70 text-sm">
							{t.category}:{' '}
							<Link
								href={{
									pathname: `/${ROUTES.products}`,
									query: categorySlug ? { category: categorySlug } : undefined,
								}}
								className="link underline"
							>
								{categoryTitle}
							</Link>
						</p>
					)}

					{!!product.table?.length && (
						<div className="border-stroke overflow-x-auto border">
							<table className="w-full border-collapse text-left text-sm">
								<thead>
									<tr className="bg-foreground/5">
										<th className="px-4 py-2 font-semibold">{t.code}</th>
										<th className="px-4 py-2 font-semibold">{t.format}</th>
										{quoteHref && <th className="px-4 py-2" />}
									</tr>
								</thead>
								<tbody>
									{product.table.map((row) => {
										const code = stegaClean(row.code ?? '')
										return (
											<tr key={row._key} className="border-stroke border-t">
												<td className="px-4 py-2 align-middle">{row.code}</td>
												<td className="text-foreground/70 px-4 py-2 align-middle">
													{row.format}
												</td>
												{quoteHref && (
													<td className="px-4 py-2 text-right align-middle">
														<Link
															href={withParam(
																productName
																	? withParam(quoteHref, 'product', productName)
																	: quoteHref,
																'code',
																code,
															)}
															className={QUOTE_BUTTON}
														>
															{t.askForQuote}
														</Link>
													</td>
												)}
											</tr>
										)
									})}
								</tbody>
							</table>
						</div>
					)}

					{(ifuUrl || declarationUrl || technicalUrl || safetyUrl) && (
						<div className="flex flex-wrap gap-3">
							{ifuUrl && (
								<a href={ifuUrl} target="_blank" rel="noopener noreferrer" className={SHEET_BUTTON}>
									{t.instructionsForUse}
								</a>
							)}
							{declarationUrl && (
								<a href={declarationUrl} target="_blank" rel="noopener noreferrer" className={SHEET_BUTTON}>
									{t.declarationOfConformity}
								</a>
							)}
							{technicalUrl && (
								<a
									href={technicalUrl}
									target="_blank"
									rel="noopener noreferrer"
									className={SHEET_BUTTON}
								>
									{t.technicalDataSheet}
								</a>
							)}
							{safetyUrl && (
								<a
									href={safetyUrl}
									target="_blank"
									rel="noopener noreferrer"
									className={SHEET_BUTTON}
								>
									{t.safetyDataSheet}
								</a>
							)}
						</div>
					)}
				</div>
			</div>

			{showRelated && !!related?.length && (
				<section className={cn('section pb-16')}>
					<h2 className="mb-8 text-2xl font-bold">{t.relatedProducts}</h2>

					<ul className="grid grid-cols-2 items-start gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
						{related.map((item: any) => (
							<ProductPreview product={item} key={item._id} />
						))}
					</ul>
				</section>
			)}
		</Module>
	)
}

const CONTACT_PAGE_QUERY = groq`
	*[
		_type == 'page'
		&& coalesce(language, $defaultLang) == $lang
		&& metadata.slug.current != 'index'
		&& count(modules[_type == 'form-module' && form->identifier == 'contact']) > 0
	]|order(
		!(metadata.slug.current match 'kontakt*' || metadata.slug.current match 'contact*'),
		_updatedAt desc
	)[0]{
		'url': select(
			metadata.slug.current == 'index' && $lang == $defaultLang => '/',
			metadata.slug.current == 'index' => '/' + $lang,
			$lang == $defaultLang => '/' + metadata.slug.current,
			'/' + $lang + '/' + metadata.slug.current
		)
	}
`

const RELATED_PRODUCTS_QUERY = groq`
	*[
		_type == 'product'
		&& _id != $id
		&& category._ref == $categoryId
		&& coalesce(language, $defaultLang) == $lang
	]|order(title asc)[0...$limit]{
		_id,
		title,
		image{
			...,
			asset->
		},
		'slug': select(
			$lang == '${DEFAULT_LANG}' => $productsDir + metadata.slug.current,
			$productsDir + $lang + '/' + metadata.slug.current
		),
	}
`
