'use client'

import { useCookieConsent } from '@vantezzen/react-cookie-banner'
import { BiCookie } from 'react-icons/bi'

export function FloatingConsentInfo() {
	const { isOpen, setOpen } = useCookieConsent()
	if (isOpen) return null

	return (
		<button
			type="button"
			aria-label="Cookie Settings"
			title="Cookie Settings"
			onClick={() => setOpen(true)}
			style={{
				position: 'fixed',
				bottom: '20px',
				right: '20px',
				width: '48px',
				height: '48px',
				borderRadius: '9999px',
				backgroundColor: '#ffffff',
				boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
				border: '1px solid rgba(0, 0, 0, 0.06)',
				cursor: 'pointer',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				padding: 0,
				zIndex: 9998,
				transition: 'transform 0.2s ease, box-shadow 0.2s ease',
			}}
		>
			<BiCookie className="h-6 w-6 text-gray-800 transition-transform hover:scale-110 hover:rotate-12" />
		</button>
	)
}
