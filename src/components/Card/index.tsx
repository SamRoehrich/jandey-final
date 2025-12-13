'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import Image from 'next/image'
import React from 'react'

import type { Post } from '@/types/post'

export const Card: React.FC<{
  post: Post
  className?: string
}> = ({ post, className }) => {
  const { card, link } = useClickableCard({})

  return (
    <article
      className={cn(
        'border border-border rounded-lg overflow-hidden bg-card hover:cursor-pointer',
        className,
      )}
      ref={card.ref}
    >
      <div className="relative w-full aspect-video">
        {post.heroImage ? (
          <Image
            src={post.heroImage}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">No image</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="prose dark:prose-invert">
          <h3 className="mt-0">
            <Link
              className="not-prose no-underline hover:underline"
              href={`/posts/${post.slug}`}
              ref={link.ref}
            >
              {post.title}
            </Link>
          </h3>
        </div>
        {post.description && (
          <p className="mt-2 text-muted-foreground text-sm line-clamp-2">{post.description}</p>
        )}
        <div className="mt-3 text-xs text-muted-foreground">
          <span>{post.author}</span>
          <span className="mx-2">•</span>
          <time dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </time>
        </div>
      </div>
    </article>
  )
}
