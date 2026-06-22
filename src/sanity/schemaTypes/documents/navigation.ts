import { defineField, defineType } from 'sanity'
import { IoShareSocialOutline } from 'react-icons/io5'
import { VscLayoutMenubar, VscLayoutPanelOff, VscMap } from 'react-icons/vsc'
import { DEFAULT_LANG, supportedLanguages } from '@/lib/i18n'
import { count } from '@/lib/utils'

export default defineType({
	name: 'navigation',
	title: 'Navigation',
	icon: VscMap,
	type: 'document',
	fields: [
		defineField({
			name: 'title',
			type: 'string',
			description:
				'Prefix the title with "Header", "Footer", or "Social" so the site can pick the right menu (per language).',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'language',
			title: 'Language',
			type: 'string',
			options: {
				list: supportedLanguages.map((l) => ({ title: l.title, value: l.id })),
				layout: 'radio',
				direction: 'horizontal',
			},
			initialValue: DEFAULT_LANG,
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'blurb',
			type: 'array',
			of: [
				{
					type: 'block',
					styles: [{ title: 'Normal', value: 'normal' }],
					lists: [],
				},
			],
		}),
		defineField({
			name: 'items',
			type: 'array',
			of: [{ type: 'link' }, { type: 'link.list' }, { type: 'megamenu' }],
		}),
	],
	preview: {
		select: {
			title: 'title',
			items: 'items',
			language: 'language',
		},
		prepare: ({ title, items, language }) => {
			const t = (title ?? '').toLowerCase()
			const langTag = language ? language.toUpperCase() : ''

			return {
				title: `${title}${langTag ? ` · ${langTag}` : ''}`,
				subtitle: count(items),
				media: t.includes('social')
					? IoShareSocialOutline
					: t.includes('header')
						? VscLayoutMenubar
						: t.includes('footer')
							? VscLayoutPanelOff
							: null,
			}
		},
	},
})
