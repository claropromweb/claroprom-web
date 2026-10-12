import Image from 'next/image'
import { ROUTES } from '@/lib/env'
import { cn } from '@/lib/utils'
import type { BlogCategory, BlogPost, Person } from '@/sanity/types'
import Img from '@/ui/img'
import SanityLink, { type SanityLinkType } from '@/ui/sanity-link'
import Byline from './byline'
import Categories from './categories'
import Date from './date'

export default function ({
	post,
	className,
}: { post: BlogPost } & React.ComponentProps<'article'>) {
	if (!post) return null

	return (
		<article
			className={cn('relative grid gap-x-8 gap-y-4 md:grid-cols-2', className)}
		>
			<figure className="bg-foreground/5 max-md:full-bleed aspect-video self-start">
				{post._id === 'prepared-medica-2026' ? (
					<div className="flex h-full flex-col justify-center p-6 text-red-700">
						<strong className="text-3xl">MEDICA 2026</strong>
						<span className="mt-2">16–19 November · Düsseldorf</span>
						<span>Hall 1 / A03</span>
					</div>
				) : post.metadata?.image ? (
					<Img
						className="aspect-video w-full object-cover"
						image={post.metadata?.image}
						width={600}
						alt={post.title ?? ''}
					/>
				) : (
					<Image
						src={`/api/og?slug=${ROUTES.blog}/${post.metadata?.slug?.current}&invert=1`}
						className="aspect-video w-full object-cover"
						alt={post.title ?? ''}
						width={400}
						height={(400 * 9) / 16}
					/>
				)}
			</figure>

			<div className="grid gap-2 self-center">
				<SanityLink
					className="h1 block text-current before:absolute before:inset-0 hover:underline"
					link={
						{ type: 'internal', internal: post } as unknown as SanityLinkType
					}
				>
					{post.title}
				</SanityLink>

				{post.metadata?.description && (
					<p className="line-clamp-3">{post.metadata?.description}</p>
				)}

				<div className="flex flex-wrap items-center justify-between gap-x-4">
					<Date date={post.publishDate} />
					{post._id === 'prepared-medica-2026' && !post.publishDate && (
						<span className="text-sm text-neutral-500">Draft preview</span>
					)}
					<Categories
						categories={post.categories as unknown as BlogCategory[]}
					/>
				</div>

				<Byline author={post.author as unknown as Person} />
			</div>
		</article>
	)
}
