'use client'

import {
	useClient,
	type DocumentActionComponent,
	type SanityDocument,
} from 'sanity'
import { useState } from 'react'

// One-time, revision-guarded migration of the exact Pages reviewed with the owner.
const sourceHome = 'd19e85a3-1a8a-429b-b76a-287afd2a5572'
const targetHome = '4cce6636-2e32-4007-9a05-914fe4a158ea'
const inPlace = [
	'224dde54-da33-497e-8265-14c39b973d74',
	'46dc32b1-9b06-4378-9a15-c2d1800697f4',
	'6495c722-1e69-48f7-8744-20b166baacc5',
	'79c83d1a-045b-44c4-984b-91f96bf4cccf',
	'ae879dc3-f6af-424c-bba5-67668b3adb3d',
]

type PageDocument = SanityDocument & {
	language?: string
	title?: string
	catalogArchive?: boolean
	metadata?: { slug?: { current?: string }; [key: string]: unknown }
}

export const ConsolidateEnglishPages: DocumentActionComponent = (props) => {
	const client = useClient({ apiVersion: '2026-06-17' }).withConfig({
		useCdn: false,
	})
	const [docs, setDocs] = useState<PageDocument[] | null>(null)
	const [backup, setBackup] = useState<string>()
	const [saved, setSaved] = useState(false)
	const [busy, setBusy] = useState(false)
	const [message, setMessage] = useState('')
	if (props.id !== targetHome) return null
	async function prepare() {
		setBusy(true)
		try {
			const data = await client.fetch<PageDocument[]>(
				'*[_type == "page"]',
				{},
				{ perspective: 'raw' },
			)
			const home = data.find((d) => d._id === sourceHome)
			if (home?.catalogArchive)
				throw new Error('Pages have already been consolidated.')
			if (!home || home.language !== 'hr')
				throw new Error('Source home changed; review required.')
			for (const id of inPlace) {
				if (data.find((d) => d._id === id)?.language !== 'hr')
					throw new Error('A source Page changed; review required.')
			}
			if (data.some((d) => d._id === targetHome))
				throw new Error('English home is now published; review required.')
			if (
				!data.some(
					(d) => d._id === 'drafts.' + targetHome && d.language === 'en',
				)
			)
				throw new Error('English home draft missing.')
			const allowedEnglish = new Set([targetHome])
			const slugs = new Set(
				data
					.filter((d) => [sourceHome, ...inPlace].includes(d._id))
					.map((d) => d.metadata?.slug?.current),
			)
			if (
				data.some(
					(d) =>
						d.language === 'en' &&
						slugs.has(d.metadata?.slug?.current) &&
						!allowedEnglish.has(d._id.replace(/^drafts\./, '')),
				)
			)
				throw new Error('Another English Page exists; review required.')
			setDocs(data)
			setBackup(
				URL.createObjectURL(
					new Blob(
						[
							JSON.stringify(
								{
									projectId: 'ddtwki7e',
									dataset: 'production',
									createdAt: new Date().toISOString(),
									documents: data,
								},
								null,
								2,
							),
						],
						{ type: 'application/json' },
					),
				),
			)
		} catch (e) {
			setMessage(String(e))
		} finally {
			setBusy(false)
		}
	}
	async function migrate() {
		if (!docs || !saved) return
		setBusy(true)
		try {
			const source = docs.find((d) => d._id === sourceHome)!
			const target = docs.find((d) => d._id === 'drafts.' + targetHome)!
			const content = Object.fromEntries(
				Object.entries(source).filter(([key]) => !key.startsWith('_')),
			)
			const tx = client.transaction()
			// Every affected revision is checked in the same atomic transaction.
			for (const doc of docs.filter((d) =>
				[sourceHome, targetHome, ...inPlace].includes(
					d._id.replace(/^drafts\./, ''),
				),
			)) {
				tx.patch(doc._id, (p) =>
					p.ifRevisionId(doc._rev).set({ language: doc.language }),
				)
			}
			tx.create({
				...content,
				_id: targetHome,
				_type: 'page',
				language: 'en',
				metadata: { ...source.metadata, slug: target.metadata?.slug },
			})
			tx.delete(target._id) // normal publication of the existing English draft
			tx.patch(sourceHome, (p) =>
				p.set({
					catalogArchive: true,
					title: '[Archived] ' + source.title,
					'metadata.noIndex': true,
				}),
			)
			const sourceDraft = docs.find((d) => d._id === 'drafts.' + sourceHome)
			if (sourceDraft)
				tx.patch(sourceDraft._id, (p) =>
					p.set({
						catalogArchive: true,
						title: '[Archived] ' + sourceDraft.title,
						'metadata.noIndex': true,
					}),
				)
			for (const id of inPlace) {
				tx.patch(id, (p) => p.set({ language: 'en' }))
				if (docs.some((d) => d._id === 'drafts.' + id))
					tx.patch('drafts.' + id, (p) => p.set({ language: 'en' }))
			}
			await tx.commit()
			setMessage(
				'Completed. Six English Pages are active; the old home is archived. Existing drafts were preserved.',
			)
			setDocs(null)
		} catch (e) {
			setMessage(String(e))
		} finally {
			setBusy(false)
		}
	}
	return {
		label: 'Consolidate English Pages',
		disabled: busy,
		onHandle: prepare,
		dialog:
			docs || message
				? {
						type: 'dialog',
						header: 'Consolidate English Pages',
						onClose: () => {
							setDocs(null)
							setMessage('')
							props.onComplete()
						},
						content: (
							<div style={{ padding: 24, display: 'grid', gap: 16 }}>
								{message && <p>{message}</p>}
								{docs && (
									<>
										<p>
											Preserve the published content and existing slugs. Publish
											the existing English home draft using the current home
											content, archive the old home, and change the other five
											Pages to English in place. Products and categories are
											excluded.
										</p>
										<a
											href={backup}
											download="claroprom-pages-before-english-migration.json"
											onClick={() => setSaved(true)}
										>
											Download complete Pages backup first
										</a>
										<button disabled={!saved || busy} onClick={migrate}>
											Apply verified Pages migration
										</button>
									</>
								)}
							</div>
						),
					}
				: undefined,
	}
}
