'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { itemKey, useInquiry } from './store'

export default function BusinessForm({
	kind,
	productContext,
}: {
	kind: 'distributor' | 'rfq'
	productContext?: string
}) {
	const items = useInquiry((s) => s.items),
		remove = useInquiry((s) => s.remove)
	const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>(
			'idle',
		),
		[error, setError] = useState('')
	const busy = useRef(false)
	async function send(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		if (busy.current) return
		busy.current = true
		setStatus('sending')
		const data = new FormData(event.currentTarget),
			submitted = items.map((item) => ({ ...item }))
		try {
			const payload = Object.fromEntries(data.entries())
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...payload,
					privacy: data.get('privacy') === 'on',
					inquiry: kind === 'rfq' ? 'quote' : 'distributor',
					formId: kind === 'rfq' ? 'multi-product-rfq' : 'distributor-inquiry',
					...(kind === 'rfq'
						? {
								items: submitted.map(({ productId, rowKey, quantity }) => ({
									productId,
									rowKey,
									quantity,
								})),
							}
						: {}),
				}),
			})
			const result = await response.json()
			if (!response.ok)
				throw new Error(
					result.error || 'Unable to send your inquiry. Please try again.',
				)
			setStatus('sent')
			if (kind === 'rfq')
				for (const item of submitted) {
					const current = useInquiry
						.getState()
						.items.find((i) => itemKey(i) === itemKey(item))
					if (current?.quantity === item.quantity) remove(itemKey(item))
				}
		} catch (e) {
			setError(
				e instanceof Error
					? e.message
					: 'Unable to send your inquiry. Please try again.',
			)
			setStatus('error')
		} finally {
			busy.current = false
		}
	}
	if (status === 'sent')
		return (
			<p
				role="status"
				className="rounded-lg border border-green-300 bg-green-50 p-6 text-green-800"
			>
				Thank you. Your inquiry has been sent to CLARO-PROM. Our team will
				contact you.
			</p>
		)
	const inputClass = 'w-full rounded-md border border-neutral-300 px-3 py-3'
	return (
		<form
			onSubmit={send}
			aria-label={
				kind === 'rfq' ? 'Multi-product RFQ form' : 'Distributor inquiry form'
			}
			aria-busy={status === 'sending'}
			className="grid gap-5"
		>
			<fieldset disabled={status === 'sending'} className="grid gap-5">
				<div className="hidden" aria-hidden="true">
					<label>
						Website
						<input name="website" tabIndex={-1} autoComplete="off" />
					</label>
				</div>
				<div className="grid gap-5 sm:grid-cols-2">
					{[
						['name', 'Contact name', 'text'],
						['email', 'Business email', 'email'],
						['company', 'Company', 'text'],
						['country', 'Country', 'text'],
					].map(([name, label, type]) => (
						<label key={name} className="grid gap-2 font-semibold">
							{label}
							<input
								name={name}
								type={type}
								required
								maxLength={300}
								className={inputClass}
							/>
						</label>
					))}
				</div>
				{kind === 'distributor' && (
					<>
						<label className="grid gap-2 font-semibold">
							Distribution markets
							<input
								name="markets"
								required
								maxLength={1000}
								placeholder="Countries or territories you serve"
								className={inputClass}
							/>
						</label>
						<label className="grid gap-2 font-semibold">
							Product interests
							<select
								name="product"
								defaultValue={
									productContext || 'Claroplast, IVD reagents and LABEX'
								}
								className={inputClass}
							>
								{productContext && <option>{productContext}</option>}
								<option>Claroplast, IVD reagents and LABEX</option>
								<option>Claroplast — Polymer-Modified Histology Wax</option>
								<option>IVD histology and cytology reagents</option>
								<option>LABEX laboratory cleaning products</option>
								<option>OEM / private-label discussion</option>
							</select>
						</label>
					</>
				)}
				<label className="grid gap-2 font-semibold">
					{kind === 'rfq'
						? 'Requirements / delivery details'
						: 'Tell us about your business and requirements'}
					<textarea
						name="request"
						required
						rows={6}
						maxLength={5000}
						className={inputClass}
					/>
				</label>
				<label className="flex items-start gap-3 text-sm">
					<input type="checkbox" name="privacy" required className="mt-1" />
					<span>
						I agree to the processing of my information to respond to this
						inquiry, as described in the{' '}
						<Link
							href="/politika-privatnosti"
							target="_blank"
							className="underline"
						>
							Privacy Policy
						</Link>
						.
					</span>
				</label>
				<p className="text-sm text-neutral-600">
					You can also email info@claroprom.com. No order or payment is placed.
				</p>
				{status === 'error' && (
					<p role="alert" className="text-red-700">
						{error}
					</p>
				)}
				<button
					type="submit"
					disabled={status === 'sending' || (kind === 'rfq' && !items.length)}
					className="justify-self-start rounded-md bg-red-600 px-7 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
				>
					{status === 'sending'
						? 'Sending…'
						: kind === 'rfq'
							? 'Send combined RFQ'
							: 'Send distributor inquiry'}
				</button>
			</fieldset>
		</form>
	)
}
