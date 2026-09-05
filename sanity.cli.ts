/**
 * This configuration file lets you run `$ sanity [command]` in this folder
 * Go to https://www.sanity.io/docs/cli to learn more.
 **/
import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
	api: {
		projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'ddtwki7e',
		dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
	},
	typegen: {
		enabled: true,
		path: [
			'./src/{app,ui}/**/*.{ts,tsx,js,jsx}',
			'./src/sanity/schemaTypes/**/*.{ts,tsx,js,jsx}',
			'./src/sanity/lib/queries.ts',
		],
		schema: './src/sanity/schema.json',
		generates: './src/sanity/types.ts',
	},
})
