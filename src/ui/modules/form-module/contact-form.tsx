'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useRef, useState } from 'react'
import { VscCheck, VscLoading } from 'react-icons/vsc'
import type { Lang } from '@/lib/i18n'
import {
	changeInquiryContext,
	contactContext,
	INQUIRY_TYPES,
	type InquiryType,
} from '@/lib/outreach'
import { cn } from '@/lib/utils'
import { getFormTranslations } from './translations'

type Status = 'idle' | 'submitting' | 'success' | 'error'

type ContactFormProps = { lang: Lang; formId?: string; privacyHref?: string }

export default function ContactForm(props: ContactFormProps) {
	const searchParams = useSearchParams()
	return (
		<ContactFields
			key={searchParams.toString()}
			{...props}
			context={contactContext(searchParams)}
		/>
	)
}
function ContactFields({
	lang,
	formId,
	privacyHref,
	context,
}: ContactFormProps & { context: ReturnType<typeof contactContext> }) {
	const t = getFormTranslations(lang)
	const [status, setStatus] = useState<Status>('idle')
	const [inquiry, setInquiry] = useState(context)
	const submitting = useRef(false)

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()
		if (submitting.current) return
		submitting.current = true
		const form = e.currentTarget
		const formData = new FormData(form)

		setStatus('submitting')

		try {
			const res = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: formData.get('name'),
					inquiry: formData.get('inquiry'),
					privacy: formData.get('privacy') === 'on',
					website: formData.get('website'),
					email: formData.get('email'),
					phone: formData.get('phone'),
					lab: formData.get('lab'),
					product: formData.get('product'),
					request: formData.get('request'),
					formId,
					lang,
				}),
			})

			if (!res.ok) throw new Error('Request failed')

			setStatus('success')
			form.reset()
		} catch {
			setStatus('error')
		} finally {
			submitting.current = false
		}
	}

	if (status === 'success') {
		return (
			<div
				role="status"
				className="gap-ch border-stroke flex items-center justify-center border bg-green-500/5 p-6 text-center text-green-700"
			>
				<VscCheck className="shrink-0" />
				{t.success}
			</div>
		)
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="grid gap-6"
			aria-busy={status === 'submitting'}
		>
			<label className="grid gap-2">
				<span className="font-semibold">Inquiry type</span>
				<select
					name="inquiry"
					aria-describedby="inquiry-guidance"
					value={inquiry.type}
					onChange={(event) =>
						setInquiry((current) =>
							changeInquiryContext(current, event.target.value as InquiryType),
						)
					}
					className="w-full rounded-md border border-neutral-300 px-3 py-3"
				>
					{Object.entries(INQUIRY_TYPES).map(([value, label]) => (
						<option key={value} value={value}>
							{label}
						</option>
					))}
				</select>
				<span id="inquiry-guidance" className="text-sm text-neutral-500">
					Select the purpose of your request. Your product details and message
					are preserved.
				</span>
			</label>
			<div aria-hidden="true" className="hidden">
				<label>
					Website
					<input name="website" tabIndex={-1} autoComplete="off" />
				</label>
			</div>
			<div className="grid gap-6 sm:grid-cols-2">
				<Field name="name" label={t.name} required />
				<Field name="email" label={t.email} type="email" required />
			</div>

			<Field name="phone" label={t.phone + ' (optional)'} type="tel" />

			<Field name="lab" label={t.lab} />

			<Field
				name="product"
				label={
					inquiry.type === 'meeting' ? 'Meeting / product or topic' : t.product
				}
				value={inquiry.topic}
				onChange={(event) =>
					setInquiry((current) => ({ ...current, topic: event.target.value }))
				}
				required={inquiry.type === 'quote'}
			/>

			<label className="grid gap-2">
				<span className="font-semibold">
					{t.request} <span className="text-red-500">*</span>
				</span>
				<textarea
					name="request"
					value={inquiry.request}
					onChange={(event) =>
						setInquiry((current) => ({
							...current,
							request: event.target.value,
						}))
					}
					required
					rows={8}
					className="bg-foreground/5 border-foreground/15 focus:border-foreground/40 w-full resize-y rounded-md border px-3 py-2 leading-normal outline-none"
				/>
			</label>

			<label className="flex items-start gap-2 text-sm">
				<input
					type="checkbox"
					name="privacy"
					required
					className="mt-1 shrink-0"
				/>
				<span>
					{t.privacy}{' '}
					{privacyHref ? (
						<Link href={privacyHref} className="link" target="_blank">
							{t.privacyLink}
						</Link>
					) : (
						<span className="font-semibold">{t.privacyLink}</span>
					)}
					.
				</span>
			</label>

			{status === 'error' && (
				<p role="alert" className="text-sm text-red-600">
					{t.error}
				</p>
			)}

			<div>
				<button
					type="submit"
					disabled={status === 'submitting'}
					className="gap-ch inline-flex items-center justify-center rounded-md bg-red-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-red-700 active:scale-98 disabled:opacity-60"
				>
					{status === 'submitting' && <VscLoading className="animate-spin" />}
					{status === 'submitting' ? t.submitting : t.submit}
				</button>
			</div>
		</form>
	)
}

function Field({
	name,
	label,
	type = 'text',
	required,
	defaultValue,
	value,
	onChange,
	className,
}: {
	name: string
	label: string
	type?: string
	required?: boolean
	defaultValue?: string
	value?: string
	onChange?: React.ChangeEventHandler<HTMLInputElement>
	className?: string
}) {
	return (
		<label className={cn('grid gap-2', className)}>
			<span className="font-semibold">
				{label} {required && <span className="text-red-500">*</span>}
			</span>
			<input
				type={type}
				name={name}
				required={required}
				defaultValue={defaultValue}
				value={value}
				onChange={onChange}
				className="bg-foreground/5 border-foreground/15 focus:border-foreground/40 w-full rounded-md border px-3 py-3 leading-normal outline-none"
			/>
		</label>
	)
}
