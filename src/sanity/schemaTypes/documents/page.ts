import { defineField, defineType } from 'sanity'
import { EditIcon, ErrorScreenIcon, HomeIcon, SearchIcon } from '@sanity/icons'
import { VscEyeClosed } from 'react-icons/vsc'
import { DEFAULT_LANG, supportedLanguages } from '@/lib/i18n'
import modules from '../fragments/modules'

export default defineType({
	name: 'page',
	title: 'Page',
	type: 'document',
	groups: [{ name: 'content', default: true }, { name: 'metadata' }],
	fields: [
		defineField({
			name: 'catalogArchive',
			title: 'Archived category placeholder',
			type: 'boolean',
			readOnly: true,
			hidden: ({ document }) => document?.catalogArchive !== true,
			description:
				'This is a preserved copy of the old page. Edit the live category under Product categories.',
		}),
		defineField({
			name: 'language',
			type: 'string',
			readOnly: true,
			// Reveal the field on legacy docs created before i18n was enabled, so
			// editors can see (and the migration script can fill) the missing value.
			hidden: ({ document }) => !!(document as { language?: string })?.language,
			initialValue: DEFAULT_LANG,
		}),
		defineField({
			name: 'title',
			type: 'string',
			group: 'content',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			...modules(),
			group: 'content',
		}),
		defineField({
			name: 'metadata',
			type: 'metadata',
			group: 'metadata',
		}),
	],
	preview: {
		select: {
			title: 'title',
			slug: 'metadata.slug.current',
			noIndex: 'metadata.noIndex',
			language: 'language',
		},
		prepare: ({ title, slug, noIndex, language }) => {
			const langTag = language
				? `${supportedLanguages.find((l) => l.id === language)?.title ?? language.toUpperCase()} · `
				: ''
			return {
				title,
				subtitle: `${langTag}/${slug === 'index' ? '' : slug}`,
				media:
					(slug === 'index' && HomeIcon) ||
					(slug === '404' && ErrorScreenIcon) ||
					(slug === 'search' && SearchIcon) ||
					(slug === 'blog' && EditIcon) ||
					(noIndex && VscEyeClosed),
			}
		},
	},
})
