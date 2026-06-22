'use client'

import { type ComponentProps, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { VscGlobe, VscLoading } from 'react-icons/vsc'
import { ROUTES } from '@/lib/env'
import { detectLangFromPath } from '@/lib/get-lang'
import { DEFAULT_LANG, supportedLanguages, type Lang } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { setLangCookie } from './actions'

type TranslationEntry = {
	_id: string
	_type: string
	slug: string
	language: string
	translations?: Array<{
		_id?: string
		_type?: string
		slug?: string
		language?: string
	}>
}

export default function Switcher({
	translations: T,
	className,
	...props
}: {
	translations: TranslationEntry[]
} & ComponentProps<'label'>) {
	const [loading, setLoading] = useState(false)
	const pathname = usePathname()
	const currentLang = detectLangFromPath(pathname)

	useEffect(() => setLoading(false), [pathname])

	const available = T.find(
		(t) =>
			t.slug === pathname ||
			t.translations?.some((p) => p.slug === pathname),
	)

	function getUrlForLang(lang: Lang): string | undefined {
		if (!available) return undefined
		if (available.language === lang) return available.slug
		const sibling = available.translations?.find((t) => t.language === lang)
		return sibling?.slug
	}

	function fallbackUrlForLang(lang: Lang): string {
		const segments = pathname.split('/').filter(Boolean)

		const stripped = supportedLanguages.some((l) => l.id === segments[0])
			? segments.slice(1)
			: segments

		if (
			stripped[0] === ROUTES.blog &&
			stripped[1] &&
			supportedLanguages.some((l) => l.id === stripped[1])
		) {
			stripped.splice(1, 1)
		}

		if (lang === DEFAULT_LANG) return '/' + stripped.join('/')

		if (stripped[0] === ROUTES.blog) {
			return (
				`/${ROUTES.blog}/` +
				lang +
				(stripped.length > 1 ? '/' + stripped.slice(1).join('/') : '')
			)
		}
		return '/' + lang + (stripped.length ? '/' + stripped.join('/') : '')
	}

	return (
		<label
			className={cn('inline-flex items-center gap-2 text-sm', className)}
			title="Change language"
			{...props}
		>
			<span className="shrink-0" aria-hidden>
				{loading ? <VscLoading className="animate-spin" /> : <VscGlobe />}
			</span>

			<select
				className="border-foreground/20 focus:border-foreground bg-transparent px-1 outline-none"
				value={currentLang}
				onChange={async (e) => {
					const targetLang = e.target.value as Lang
					if (targetLang === currentLang) return

					const url = getUrlForLang(targetLang) ?? fallbackUrlForLang(targetLang)

					setLoading(true)
					await setLangCookie(targetLang)
					window.location.href = url
				}}
			>
				{supportedLanguages.map((s) => (
					<option value={s.id} key={s.id}>
						{s.title}
					</option>
				))}
			</select>
		</label>
	)
}
