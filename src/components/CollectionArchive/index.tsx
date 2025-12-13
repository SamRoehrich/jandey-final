import { cn } from '@/utilities/ui'
import React from 'react'

import { Card } from '@/components/Card'
import type { Post } from '@/types/post'

export type Props = {
  posts: Post[]
}

export const CollectionArchive: React.FC<Props> = (props) => {
  const { posts } = props

  return (
    <div className={cn('container')}>
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts?.map((post) => {
            if (typeof post === 'object' && post !== null) {
              return <Card key={post.slug} post={post} className="h-full" />
            }
            return null
          })}
        </div>
      </div>
    </div>
  )
}
