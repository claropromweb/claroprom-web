import { groq } from 'next-sanity'
import { ImageResponse } from 'next/og'
import { ROUTES } from '@/lib/env'
import { SITE_URL } from '@/lib/site-url'
import { cn } from '@/lib/utils'
import { sanityFetchLive } from '@/sanity/lib/live'
import { getSite } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'
import type { OG_QUERY_RESULT } from '@/sanity/types'

const { hostname } = new URL(SITE_URL!)
const blogDir = `${ROUTES.blog}/`

const OG_QUERY = groq`*[_type == $type && metadata.slug.current == $slug][0]{
	'title': coalesce(metadata.title, title),
}`

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url)
	const slug = searchParams.get('slug') ?? 'index'
	const invert = ['1', 'true'].includes(searchParams.get('invert')!)

	const type = slug.startsWith(blogDir) ? 'blog.post' : 'page'

	const [page, site] = await Promise.all([
		sanityFetchLive<OG_QUERY_RESULT>({
			query: OG_QUERY,
			params: {
				type,
				slug: type === 'blog.post' ? slug.replace(blogDir, '') : slug,
			},
		}),
		getSite(),
	])


	if (searchParams.get('homepage') === '1') {
		const brand = 'Claro-prom'
		const heading = 'European IVD & Histology Manufacturer'
		const description = 'Histology, IVD and laboratory products manufactured in Croatia, EU.'
		const logo = site?.logo?.image?.default
		const fontText = brand + heading + description + 'claroprom.com'
		return new ImageResponse(
			<div style={{ display: 'flex', width: '100%', height: '100%', flexDirection: 'column', justifyContent: 'space-between', padding: '56px 72px', background: '#ffffff', color: '#262626', borderTop: '12px solid #e60012' }}>
				<div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
					{logo && <img src={urlFor(logo).url()} width={100} height={112} style={{ objectFit: 'contain' }} alt="Claro-prom logo" />}
					<span style={{ fontSize: 64, fontWeight: 700 }}>{brand}</span>
				</div>
				<div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
					<div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.15 }}>{heading}</div>
					<div style={{ fontSize: 28, lineHeight: 1.4, color: '#525252' }}>{description}</div>
				</div>
				<div style={{ fontSize: 26, color: '#e60012' }}>claroprom.com</div>
			</div>,
			{
				width: 1200,
				height: 630,
				fonts: [
					{ name: 'Geist', data: await loadGoogleFont('Geist:wght@400', fontText), weight: 400, style: 'normal' },
					{ name: 'Geist', data: await loadGoogleFont('Geist:wght@700', fontText), weight: 700, style: 'normal' },
				],
			},
		)
	}

	const [h1 = '', h2 = ''] =
		(page?.title || site?.title)?.split(/(?:\s*[|-—]\s*)/) ?? []
	const text = [...new Set([...h1, ...h2, ...hostname])].join('')

	return new ImageResponse(
		<div
			tw={cn(
				'flex h-full w-full flex-col justify-between px-24 py-16',
				invert
					? 'bg-neutral-900 text-neutral-100'
					: 'bg-neutral-100 text-neutral-900',
			)}
		>
			<hgroup tw="flex flex-col">
				<h1 tw="text-7xl leading-[1.1] font-bold">{h1}</h1>
				{h2 && <h2 tw="text-4xl font-bold">{h2}</h2>}
			</hgroup>
			<p tw="text-4xl">{hostname}</p>
		</div>,
		{
			width: 1200,
			height: 630,
			fonts: [
				{
					name: 'Geist',
					data: await loadGoogleFont('Geist:wght@400', text),
					weight: 400,
					style: 'normal',
				},
				{
					name: 'Geist',
					data: await loadGoogleFont('Geist:wght@700', text),
					weight: 700,
					style: 'normal',
				},
			],
		},
	)
}

async function loadGoogleFont(font: string, text: string) {
	const url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(text)}`
	const css = await (await fetch(url)).text()
	const regex = /src: url\((?<resource>.+)\) format\('(opentype|truetype)'\)/g
	const { resource } = regex.exec(css)?.groups ?? {}

	if (resource) {
		const response = await fetch(resource)
		if (response.status === 200) {
			return await response.arrayBuffer()
		}
	}

	throw new Error('Failed to load font data')
}
