import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { INQUIRY_TYPES, type InquiryType } from '@/lib/outreach'

type ContactPayload = {
	inquiry?: string
	privacy?: boolean
	website?: string
	name?: string
	email?: string
	phone?: string
	lab?: string
	product?: string
	request?: string
	formId?: string
	lang?: string
}

function escapeHtml(value: string) {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;')
}

export async function POST(request: Request) {
	const apiKey = process.env.RESEND_API_KEY
	const to = process.env.CONTACT_FORM_TO
	const from = process.env.CONTACT_FORM_FROM

	if (!apiKey || !to || !from) {
		console.error(
			'Contact form: missing RESEND_API_KEY / CONTACT_FORM_TO / CONTACT_FORM_FROM',
		)
		return NextResponse.json(
			{ error: 'Email service is not configured.' },
			{ status: 500 },
		)
	}

	let body: ContactPayload
	try {
		body = await request.json()
	} catch {
		return NextResponse.json(
			{ error: 'Invalid request body.' },
			{ status: 400 },
		)
	}

	if (
		!body ||
		typeof body !== 'object' ||
		[
			'name',
			'email',
			'phone',
			'lab',
			'product',
			'request',
			'inquiry',
			'website',
		].some(
			(key) =>
				body[key as keyof ContactPayload] != null &&
				typeof body[key as keyof ContactPayload] !== 'string',
		)
	)
		return NextResponse.json({ error: 'Invalid fields.' }, { status: 422 })
	if (body.privacy !== true || body.website?.trim())
		return NextResponse.json(
			{ error: 'Privacy consent is required or request is invalid.' },
			{ status: 422 },
		)
	if (
		Object.values(body).some(
			(value) => typeof value === 'string' && value.length > 10000,
		)
	)
		return NextResponse.json({ error: 'Request is too long.' }, { status: 422 })
	const inquiry =
		body.inquiry && Object.hasOwn(INQUIRY_TYPES, body.inquiry)
			? (body.inquiry as InquiryType)
			: 'general'
	const name = body.name?.trim()
	const email = body.email?.trim()
	const phone = body.phone?.trim()
	const lab = body.lab?.trim()
	const product = body.product?.trim()
	const message = body.request?.trim()

	// Name, email, message and privacy are required; phone is optional.
	if (!name || !email || !message || (inquiry === 'quote' && !product)) {
		return NextResponse.json(
			{ error: 'Missing required fields.' },
			{ status: 422 },
		)
	}

	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		return NextResponse.json(
			{ error: 'Invalid email address.' },
			{ status: 422 },
		)
	}

	const resend = new Resend(apiKey)

	const rows: Array<[string, string | undefined]> = [
		['Inquiry type', INQUIRY_TYPES[inquiry]],
		['Name / Company', name],
		['Email', email],
		['Phone', phone || '—'],
		['Lab', lab || '—'],
		['Product name / code', product || '—'],
		['Request', message],
	]

	const html = `
		<h2>New contact request${body.formId ? ` (${escapeHtml(body.formId)})` : ''}</h2>
		<table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
			${rows
				.map(
					([label, value]) => `
				<tr>
					<td style="padding:6px 12px;border:1px solid #e5e5e5;font-weight:600;vertical-align:top">${escapeHtml(label)}</td>
					<td style="padding:6px 12px;border:1px solid #e5e5e5;white-space:pre-wrap">${escapeHtml(value ?? '')}</td>
				</tr>`,
				)
				.join('')}
		</table>
	`

	const text = rows
		.map(([label, value]) => `${label}: ${value ?? ''}`)
		.join('\n')

	try {
		const { error } = await resend.emails.send({
			from,
			to: to.split(',').map((address) => address.trim()),
			replyTo: email,
			subject: `Contact form: ${INQUIRY_TYPES[inquiry]}${product ? ' — ' + product : ''}`,
			html,
			text,
		})

		if (error) {
			console.error('Resend error:', error)
			return NextResponse.json(
				{ error: 'Failed to send email.' },
				{ status: 502 },
			)
		}

		return NextResponse.json({ ok: true })
	} catch (err) {
		console.error('Contact form send error:', err)
		return NextResponse.json(
			{ error: 'Failed to send email.' },
			{ status: 500 },
		)
	}
}
