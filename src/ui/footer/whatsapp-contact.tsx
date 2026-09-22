'use client'

import { useCookieConsent } from '@vantezzen/react-cookie-banner'
import { useEffect, useRef } from 'react'
import { FaWhatsapp } from 'react-icons/fa6'
import styles from './whatsapp-contact.module.css'

export default function FloatingWhatsApp() {
	const { isOpen } = useCookieConsent()
	const ref = useRef<HTMLAnchorElement>(null)

	useEffect(() => {
		const link = ref.current
		if (!link) return

		let banner: Element | null = null
		let frame = 0

		function position() {
			if (!link) return
			const viewport = window.visualViewport
			const viewportBottom = viewport
				? viewport.offsetTop + viewport.height
				: window.innerHeight
			const bannerRect = isOpen ? banner?.getBoundingClientRect() : null
			// Keep the existing 48px cookie control and its 20px inset untouched.
			const bottom = bannerRect && bannerRect.height > 0
				? Math.max(80, window.innerHeight - bannerRect.top + 12)
				: 80 + Math.max(0, window.innerHeight - viewportBottom)
			link.style.setProperty('--whatsapp-bottom', `${bottom}px`)
			const headerBottom = document.querySelector('header[role="banner"]')?.getBoundingClientRect().bottom ?? 0
			// A short viewport must leave priority to navigation and consent controls.
			link.dataset.obstructed = String(window.innerHeight - bottom - 48 < headerBottom + 12 || (isOpen && !bannerRect))
		}

		function schedule() {
			cancelAnimationFrame(frame)
			frame = requestAnimationFrame(position)
		}

		const resize = new ResizeObserver(schedule)
		function findBanner() {
			const next = document.querySelector('.cookie-banner')
			if (next !== banner) {
				if (banner) resize.unobserve(banner)
				banner = next
				if (banner) resize.observe(banner)
			}
			schedule()
		}
		// The existing cookie panel loads dynamically and may be mounted later.
		const mutations = new MutationObserver(findBanner)
		mutations.observe(document.body, { childList: true, subtree: true })
		findBanner()
		window.addEventListener('resize', schedule)
		document.addEventListener('animationend', schedule, true)
		document.addEventListener('transitionend', schedule, true)
		window.visualViewport?.addEventListener('resize', schedule)
		window.visualViewport?.addEventListener('scroll', schedule)

		return () => {
			cancelAnimationFrame(frame)
			resize.disconnect()
			mutations.disconnect()
			window.removeEventListener('resize', schedule)
			document.removeEventListener('animationend', schedule, true)
			document.removeEventListener('transitionend', schedule, true)
			window.visualViewport?.removeEventListener('resize', schedule)
			window.visualViewport?.removeEventListener('scroll', schedule)
		}
	}, [isOpen])

	return (
		<a
			ref={ref}
			className={styles.button}
			href="https://wa.me/38598818891"
			target="_blank"
			rel="noopener noreferrer"
			aria-label="Contact Claro-prom on WhatsApp (opens in a new tab)"
			title="WhatsApp"
		>
			<FaWhatsapp aria-hidden="true" focusable="false" className="size-6" />
		</a>
	)
}
