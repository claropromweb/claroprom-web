import { getAssetDocumentId, getImageDimensions } from '@sanity/asset-utils'
import Img from '@/ui/img'

type ProductPhotoSource = {
	asset?: {
		_ref?: string
		_id?: string
		url?: string
		metadata?: { lqip?: string }
	} | null
	crop?: { top?: number; bottom?: number; left?: number; right?: number }
	hotspot?: { x?: number; y?: number; width?: number; height?: number }
	alt?: string | null
	caption?: string | null
}
/** Reject unusable references and ignore malformed editor geometry without CMS writes. */
export function safeProductPhoto(image?: ProductPhotoSource | null) {
	if (!image?.asset) return null
	for (const source of [image.asset._id, image.asset._ref, image.asset.url]) {
		if (!source) continue
		try {
			const id = getAssetDocumentId(source)
			const dimensions = getImageDimensions(id)
			if (!(dimensions.width > 0 && dimensions.height > 0)) continue
			const crop = image.crop
			const validCrop =
				crop &&
				['top', 'bottom', 'left', 'right'].every((key) => {
					const value = crop[key as keyof typeof crop] ?? 0
					return Number.isFinite(value) && value >= 0 && value < 1
				}) &&
				(crop.top ?? 0) + (crop.bottom ?? 0) < 1 &&
				(crop.left ?? 0) + (crop.right ?? 0) < 1
			const hotspot = image.hotspot
			const validHotspot =
				hotspot &&
				[hotspot.x, hotspot.y, hotspot.width, hotspot.height].every(
					(value) =>
						typeof value === 'number' &&
						Number.isFinite(value) &&
						value >= 0 &&
						value <= 1,
				) &&
				(hotspot.width ?? 0) > 0 &&
				(hotspot.height ?? 0) > 0
			const lqip = image.asset.metadata?.lqip
			const safeImage = {
				...image,
				asset: {
					_ref: id,
					metadata:
						typeof lqip === 'string' && lqip.startsWith('data:image/')
							? { lqip }
							: undefined,
				},
				crop: validCrop ? crop : undefined,
				hotspot: validHotspot ? hotspot : undefined,
			}
			const safeCrop = safeImage.crop
			const ratio =
				(dimensions.width *
					(1 - (safeCrop?.left ?? 0) - (safeCrop?.right ?? 0))) /
				(dimensions.height *
					(1 - (safeCrop?.top ?? 0) - (safeCrop?.bottom ?? 0)))
			return { image: safeImage, ratio }
		} catch {
			/* Try the next source; missing metadata must not crash a product page. */
		}
	}
	return null
}
/** Contain the packshot; only an editor's explicit crop removes image content. */
export default function ProductPhoto({
	image,
	title,
	sizes,
	width = 1280,
	eager = false,
	className,
}: {
	image?: ProductPhotoSource | null
	title?: string | null
	sizes: string
	width?: number
	eager?: boolean
	className?: string
}) {
	const photo = safeProductPhoto(image)
	if (!photo) return null

	return (
		<Img
			image={photo.image}
			width={width}
			height={Math.max(1, Math.round(width / photo.ratio))}
			imageOptions={{ width, fit: 'max', q: 80 }}
			sizes={sizes}
			alt={image?.alt?.trim() || title || ''}
			loading={eager ? 'eager' : 'lazy'}
			className={className ?? 'h-full w-full object-contain'}
		/>
	)
}
