import { groq, PortableText, stegaClean } from 'next-sanity'
import Link from 'next/link'
import { ROUTES } from '@/lib/env'
import getLangServer from '@/lib/get-lang-server'
import { DEFAULT_LANG } from '@/lib/i18n'
import { inquiryRows } from '@/lib/inquiry-items'
import {
	claroplastPack,
	hasPackSize,
	inquiryHref,
	relevantProducts,
} from '@/lib/outreach'
import { categoryUrl } from '@/lib/product-category-url'
import { cn } from '@/lib/utils'
import { sanityFetchLive } from '@/sanity/lib/live'
import type { PRODUCT_QUERY_RESULT, ProductContent } from '@/sanity/types'
import { AddToInquiry } from '@/ui/inquiry/controls'
import { Module } from '@/ui/modules'
import { ClaroplastPackagingAdvantage } from './claroplast-outreach'
import ProductPhoto, { safeProductPhoto } from './product-photo'
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
	if (link.type === 'external' && link.external)
		return stegaClean(link.external)
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

	const lang = product.language === 'en' ? 'en' : await getLangServer()
	const t = getProductTranslations(lang)

	const category = product.category
	const categoryTitle =
		lang === 'en' ? (category?.title_en ?? category?.title) : category?.title
	const categorySlug = stegaClean(
		(lang === 'en'
			? (category?.slug_en?.current ?? category?.slug?.current)
			: category?.slug?.current) ?? '',
	)

	const categoryHref =
		category?.showInCatalog && category?.slug_en?.current
			? categoryUrl(stegaClean(category.slug_en.current))
			: {
					pathname: `/${ROUTES.products}`,
					query: categorySlug ? { category: categorySlug } : undefined,
				}

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
	const pack = claroplastPack(product.metadata?.slug?.current)
	const showFormat = hasPackSize(product.table)
	const hasPhoto = !!safeProductPhoto(product.image)
	const gallery = (product.gallery ?? []).filter((image) =>
		safeProductPhoto(image),
	)
	const inquiryItems = inquiryRows(product)

	const candidates =
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

	const related = relevantProducts(
		{ title: productName, slug: product.metadata?.slug?.current },
		candidates ?? [],
		relatedLimit,
	)
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
									href={categoryHref}
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

			<div
				className={cn(
					'section grid items-start gap-10 py-12 md:gap-14',
					(hasPhoto || gallery.length > 0) && 'md:grid-cols-2',
				)}
			>
				{(hasPhoto || gallery.length > 0) && (
					<div className="space-y-5">
						{hasPhoto && (
							<figure className="space-y-2">
								<div className="flex aspect-square w-full items-center justify-center rounded-lg bg-neutral-50 p-5">
									<ProductPhoto
										image={product.image}
										title={product.title}
										eager
										sizes="(max-width: 767px) 90vw, 45vw"
									/>
								</div>
								{product.image?.caption && (
									<figcaption className="text-sm text-neutral-600">
										{product.image?.caption}
									</figcaption>
								)}
							</figure>
						)}
						{gallery.length > 0 && (
							<div className="grid grid-cols-2 gap-4">
								{gallery.map((image) => (
									<figure key={image._key} className="space-y-2">
										<div className="flex aspect-square items-center justify-center rounded-md bg-neutral-50 p-3">
											<ProductPhoto
												image={image}
												title={product.title}
												width={800}
												sizes="(max-width: 767px) 42vw, 22vw"
											/>
										</div>
										{image.caption && (
											<figcaption className="text-xs text-neutral-600">
												{image.caption}
											</figcaption>
										)}
									</figure>
								))}
							</div>
						)}
					</div>
				)}

				<div className="min-w-0 space-y-6">
					{product.shortDescription?.trim() && (
						<p className="max-w-3xl text-lg leading-relaxed text-neutral-700">
							{product.shortDescription}
						</p>
					)}
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

					{pack && (
						<dl className="grid gap-4 rounded-lg border border-neutral-200 bg-neutral-50 p-5 sm:grid-cols-2">
							<div>
								<dt className="text-sm text-neutral-500">Packaging</dt>
								<dd className="font-semibold">{pack.packaging}</dd>
							</div>
							<div>
								<dt className="text-sm text-neutral-500">Catalogue No.</dt>
								<dd className="font-semibold">{pack.code}</dd>
							</div>
							<div className="sm:col-span-2">
								<dt className="text-sm text-neutral-500">Manufacturer</dt>
								<dd>CLARO-PROM d.o.o. · Croatia, European Union</dd>
							</div>
						</dl>
					)}
					{pack &&
						(pack.packaging === '2 kg' ? (
							<ClaroplastPackagingAdvantage transportOnly />
						) : (
							<section
								aria-label="Claroplast packaging advantage"
								className="space-y-2 rounded-lg bg-neutral-50 p-5"
							>
								<h2 className="text-lg font-semibold">
									Lightweight, easy-to-handle packaging
								</h2>
								<p className="text-sm">
									The 10 kg pack features a lightweight cardboard carton with a
									durable inner bag for practical handling by laboratory
									personnel.
								</p>
							</section>
						))}
					{!!product.description?.length && (
						<div className="prose max-w-none">
							<PortableText value={product.description} />
						</div>
					)}

					{!!product.intendedPurpose?.length && (
						<section className="border-stroke border-t pt-5">
							<h2 className="mb-2 text-lg font-semibold">
								{t.intendedPurpose}
							</h2>
							<div className="prose max-w-none">
								<PortableText value={product.intendedPurpose} />
							</div>
						</section>
					)}

					{(product.ivdClass ||
						product.storageConditions ||
						product.shelfLife) && (
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
									<dd className="mt-1 font-semibold">
										{product.storageConditions}
									</dd>
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
							<Link href={categoryHref} className="link underline">
								{categoryTitle}
							</Link>
						</p>
					)}
					{inquiryItems.length > 0 && (
						<section
							aria-label="Add product packs to inquiry"
							className="flex flex-wrap gap-3"
						>
							{inquiryItems.map((item) => (
								<AddToInquiry key={item.rowKey} item={item} />
							))}
							<Link href="/inquiry" className="self-center text-sm underline">
								Review your inquiry
							</Link>
						</section>
					)}

					{!!product.table?.some(
						(row) => row.code?.trim() || row.format?.trim(),
					) && (
						<div className="border-stroke overflow-x-auto border">
							<table className="w-full border-collapse text-left text-sm">
								<thead>
									<tr className="bg-foreground/5">
										<th className="px-4 py-2 font-semibold">{t.code}</th>
										{showFormat && (
											<th className="px-4 py-2 font-semibold">
												Packaging / pack size
											</th>
										)}
										{quoteHref && <th className="px-4 py-2" />}
									</tr>
								</thead>
								<tbody>
									{product.table
										.filter((row) => row.code?.trim() || row.format?.trim())
										.map((row) => {
											const code = stegaClean(row.code ?? '')
											return (
												<tr key={row._key} className="border-stroke border-t">
													<td className="px-4 py-2 align-middle">{row.code}</td>
													{showFormat && (
														<td className="text-foreground/70 px-4 py-2 align-middle">
															{row.format}
														</td>
													)}
													{quoteHref && (
														<td className="px-4 py-2 text-right align-middle">
															<Link
																href={
																	withParam(
																		productName
																			? withParam(
																					quoteHref,
																					'product',
																					productName,
																				)
																			: quoteHref,
																		'code',
																		code,
																	) + '&inquiry=quote'
																}
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

					<section className="space-y-3 border-t border-neutral-200 pt-5">
						<h2 className="text-lg font-semibold">Technical Documentation</h2>
						<p className="text-sm">
							Contact our team to request documentation relevant to this
							product.
						</p>
						<Link
							className="underline"
							href={inquiryHref(
								'documentation',
								productName,
								product.table?.[0]?.code || undefined,
							)}
						>
							Request technical documentation
						</Link>
						{pack && (
							<div className="flex flex-wrap gap-4 text-sm">
								<Link
									className="underline"
									href={inquiryHref('distributor', productName, pack.code)}
								>
									Distributor inquiry
								</Link>
								<Link
									className="underline"
									href={inquiryHref('sample', productName, pack.code)}
								>
									Request a sample
								</Link>
							</div>
						)}
					</section>
					{pack?.packaging === '2 kg' && (
						<p className="text-sm text-neutral-600">
							Transport carton: 5 × 2 kg. Not a separate product or SKU.
						</p>
					)}
					{(ifuUrl || declarationUrl || technicalUrl || safetyUrl) && (
						<div className="flex flex-wrap gap-3">
							{ifuUrl && (
								<a
									href={ifuUrl}
									target="_blank"
									rel="noopener noreferrer"
									className={SHEET_BUTTON}
								>
									{t.instructionsForUse}
								</a>
							)}
							{declarationUrl && (
								<a
									href={declarationUrl}
									target="_blank"
									rel="noopener noreferrer"
									className={SHEET_BUTTON}
								>
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

					<ul className="grid auto-rows-fr grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
		_type == 'product' && hidden != true
		&& _id != $id
		&& category._ref == $categoryId
		&& coalesce(language, $defaultLang) == $lang
	]|order(title asc){
		_id,
		title, table, shortDescription, language,
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
