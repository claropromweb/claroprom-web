export const dev =
	process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview'

export const ROUTES = {
	studio: 'admin',
	blog: 'blog',
	products: 'products',
	// @example services: 'services',
	// @example caseStudies: 'case-studies',
} as const
