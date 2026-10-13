import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import {
	inquiryEmailLines,
	resolveInquiryItems,
	validateRequestedItems,
	type InquiryItem,
} from '@/lib/inquiry-items'
import { INQUIRY_TYPES, type InquiryType } from '@/lib/outreach'
import { client } from '@/sanity/lib/client'

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
	company?: string
	country?: string
	markets?: string
	items?: unknown
}

function escapeHtml(value: string) {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;')
}

function validEmail(value: string) {
	return (
		value.length <= 254 &&
		/^[^\s@<>(),;:"\\]+@[^\s@<>(),;:"\\]+\.[^\s@<>(),;:"\\]+$/.test(value)
	)
}

export async function POST(request: Request) {
	const origin = request.headers.get('origin')
	if (origin && origin !== new URL(request.url).origin)
		return NextResponse.json(
			{ error: 'Invalid request origin.' },
			{ status: 403 },
		)
	if (!request.headers.get('content-type')?.includes('application/json'))
		return NextResponse.json(
			{ error: 'JSON content is required.' },
			{ status: 415 },
		)
	const apiKey = process.env.RESEND_API_KEY
	const to = process.env.CONTACT_FORM_TO?.trim()
	const from = process.env.CONTACT_FORM_FROM?.trim()

	if (!apiKey || !to || !from) {
		console.error(
			'Contact form: missing RESEND_API_KEY / CONTACT_FORM_TO / CONTACT_FORM_FROM',
		)
		return NextResponse.json(
			{ error: 'Email service is not configured.' },
			{ status: 500 },
		)
	}
	const senderAddress = from.match(/<([^<>]+)>$/)?.[1]?.trim() ?? from
	if (
		process.env.VERCEL_ENV === 'production' &&
		(to.toLowerCase() !== 'claroprom@gmail.com' ||
			!validEmail(senderAddress) ||
			/[\r\n]/.test(from) ||
			/@(?:.*\.)?resend\.dev$/i.test(senderAddress))
	) {
		console.error('Contact form: invalid production email configuration')
		return NextResponse.json(
			{
				error:
					'Email delivery is temporarily unavailable. Please contact claroprom@gmail.com.',
			},
			{ status: 503 },
		)
	}

	let body: ContactPayload
	try {
		const reader = request.body?.getReader()
		if (!reader) throw new Error('Missing body')
		const chunks: Uint8Array[] = []
		let size = 0
		while (true) {
			const { value, done } = await reader.read()
			if (done) break
			size += value.length
			if (size > 40000) {
				await reader.cancel()
				return NextResponse.json(
					{ error: 'Request is too long.' },
					{ status: 413 },
				)
			}
			chunks.push(value)
		}
		const bytes = new Uint8Array(size)
		let offset = 0
		for (const chunk of chunks) {
			bytes.set(chunk, offset)
			offset += chunk.length
		}
		body = JSON.parse(new TextDecoder().decode(bytes))
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
			'company',
			'country',
			'markets',
			'formId',
			'lang',
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
	let product = body.product?.trim()
	const message = body.request?.trim()
	if (
		!name ||
		!email ||
		!message ||
		(inquiry === 'quote' && !product && body.items === undefined)
	)
		return NextResponse.json(
			{ error: 'Missing required fields.' },
			{ status: 422 },
		)
	if (!validEmail(email))
		return NextResponse.json(
			{ error: 'Invalid email address.' },
			{ status: 422 },
		)
	let selectedItems: InquiryItem[] = []
	if (body.items !== undefined) {
		if (inquiry !== 'quote')
			return NextResponse.json(
				{ error: 'Product selections require a quote inquiry.' },
				{ status: 422 },
			)
		try {
			const requested = validateRequestedItems(body.items)
			const products = await client
				.withConfig({ useCdn: false, perspective: 'published' })
				.fetch(
					`*[_type == "product" && !(_id in path("drafts.**")) && _id in $ids && hidden != true && language == "en"]{_id,title,hidden,language,metadata,table}`,
					{ ids: requested.map((item) => item.productId) },
				)
			selectedItems = resolveInquiryItems(requested, products)
			product =
				'Multi-product RFQ (' +
				selectedItems.length +
				' SKU' +
				(selectedItems.length === 1 ? '' : 's') +
				')'
		} catch {
			return NextResponse.json(
				{
					error:
						'Invalid or unavailable product selection. Please check the catalogue and try again.',
				},
				{ status: 422 },
			)
		}
	}
	if (
		body.formId === 'distributor-inquiry' &&
		(!body.company?.trim() || !body.country?.trim() || !body.markets?.trim())
	)
		return NextResponse.json(
			{ error: 'Company, country and distribution markets are required.' },
			{ status: 422 },
		)

	// Name, email, message and privacy are required; phone is optional.
	if (!name || !email || !message || (inquiry === 'quote' && !product)) {
		return NextResponse.json(
			{ error: 'Missing required fields.' },
			{ status: 422 },
		)
	}

	if (!validEmail(email)) {
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
	if (body.company) rows.splice(3, 0, ['Company', body.company.trim()])
	if (body.country) rows.splice(4, 0, ['Country', body.country.trim()])
	if (body.markets) rows.push(['Distribution markets', body.markets.trim()])
	if (selectedItems.length)
		rows.push([
			'Selected products (quantities in individual packs)',
			inquiryEmailLines(selectedItems),
		])

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
		const { data, error } = await resend.emails.send({
			from,
			to: to.split(',').map((address) => address.trim()),
			replyTo: email,
			subject:
				`Contact form: ${INQUIRY_TYPES[inquiry]}${product ? ' — ' + product : ''}`
					.replace(/[\r\n]+/g, ' ')
					.slice(0, 300),
			html,
			text,
		})

		if (error || !data?.id) {
			console.error('Contact provider rejected submission:', {
				code: error?.name ?? 'missing_message_id',
			})
			return NextResponse.json(
				{ error: 'Failed to send email.' },
				{ status: 502 },
			)
		}

		console.info('Contact provider accepted submission:', {
			messageId: data.id,
			inquiry,
		})
		return NextResponse.json({ ok: true, messageId: data.id })
	} catch (err) {
		console.error('Contact form send error:', {
			code: 'provider_request_failed',
		})
		return NextResponse.json(
			{ error: 'Failed to send email.' },
			{ status: 500 },
		)
	}
}
