import { getImageDimensions } from '@sanity/asset-utils'
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
	if (!image?.asset) return null
	const dimensions = getImageDimensions(
		image.asset.url || image.asset._id || image.asset._ref || '',
	)
	const crop = image.crop
	const ratio =
		(dimensions.width * (1 - (crop?.left ?? 0) - (crop?.right ?? 0))) /
		(dimensions.height * (1 - (crop?.top ?? 0) - (crop?.bottom ?? 0)))
	return (
		<Img
			image={image}
			width={width}
			height={Math.max(1, Math.round(width / ratio))}
			imageOptions={{ width, fit: 'max', q: 80 }}
			sizes={sizes}
			alt={image.alt?.trim() || title || ''}
			loading={eager ? 'eager' : 'lazy'}
			className={className ?? 'h-full w-full object-contain'}
		/>
	)
}
