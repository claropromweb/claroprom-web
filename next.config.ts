import path from 'node:path'
import type { NextConfig } from 'next'
import { groq } from 'next-sanity'
import { ROUTES } from './src/lib/env'
import { DEFAULT_LANG, supportedLanguages } from './src/lib/i18n'
import { client } from './src/sanity/lib/client'

const nextConfig: NextConfig = {
	reactCompiler: true,

	images: {
		localPatterns: [{ pathname: '/api/og' }],
		remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io' }],
	},

	async rewrites() {
		const rewrites = [
			{ source: '/:slug.md', destination: '/api/md/:slug' },
			{ source: '/:path*/:slug.md', destination: '/api/md/:path*/:slug' },
		]

		if (supportedLanguages?.length) {
			rewrites.push({
				source: `/:lang/${ROUTES.blog}/:slug*`,
				destination: `/${ROUTES.blog}/:lang/:slug*`,
			})
			rewrites.push({
				source: `/:lang/${ROUTES.products}/:slug*`,
				destination: `/${ROUTES.products}/:lang/:slug*`,
			})
		}

		return rewrites
	},

	turbopack: {},

	webpack(config, { isServer }) {
		if (!isServer) {
			config.resolve.alias = {
				...config.resolve.alias,
				// fix for @sanity/code-input on Vercel prod
				'@codemirror/state': path.resolve('./node_modules/@codemirror/state'),
				'@codemirror/view': path.resolve('./node_modules/@codemirror/view'),
			}
		}
		return config
	},

	async redirects() {
		return await client.fetch(
			groq`*[_type == 'redirect']{
				source,
				'destination': select(
					destination.type == 'internal' =>
						select(
							destination.internal->._type == 'blog.post' && (!defined(destination.internal->.language) || destination.internal->.language == $defaultLang) =>
								'/' + $blogSegment + destination.internal->.metadata.slug.current,
							destination.internal->._type == 'blog.post' && defined(destination.internal->.language) && destination.internal->.language != $defaultLang =>
								'/' + $blogSegment + destination.internal->.language + '/' + destination.internal->.metadata.slug.current,
							destination.internal->._type == 'product' && (!defined(destination.internal->.language) || destination.internal->.language == $defaultLang) =>
								'/' + $productsSegment + destination.internal->.metadata.slug.current,
							destination.internal->._type == 'product' && defined(destination.internal->.language) && destination.internal->.language != $defaultLang =>
								'/' + $productsSegment + destination.internal->.language + '/' + destination.internal->.metadata.slug.current,
							destination.internal->.metadata.slug.current == 'index' && (!defined(destination.internal->.language) || destination.internal->.language == $defaultLang) =>
								'/',
							destination.internal->.metadata.slug.current == 'index' && defined(destination.internal->.language) && destination.internal->.language != $defaultLang =>
								'/' + destination.internal->.language,
							(!defined(destination.internal->.language) || destination.internal->.language == $defaultLang) =>
								'/' + destination.internal->.metadata.slug.current,
							'/' + destination.internal->.language + '/' + destination.internal->.metadata.slug.current
						),
					destination.external
				),
				'permanent': true
			}`,
			{
				blogSegment: `${ROUTES.blog}/`,
				productsSegment: `${ROUTES.products}/`,
				defaultLang: DEFAULT_LANG,
			},
		)
	},
}

export default nextConfig
