import React from 'react'
import { getAllPosts } from '@/utilities/content'
import { CollectionArchive } from '@/components/CollectionArchive'

export type ArchiveBlockProps = {
  id?: string
  limit?: number
  title?: string
}

export const ArchiveBlock: React.FC<ArchiveBlockProps> = (props) => {
  const { id, limit = 6, title } = props

  const allPosts = getAllPosts()
  const posts = allPosts.slice(0, limit)

  return (
    <div className="my-16" id={`block-${id}`}>
      {title && (
        <div className="container mb-8">
          <div className="prose dark:prose-invert">
            <h2>{title}</h2>
          </div>
        </div>
      )}
      <CollectionArchive posts={posts} />
    </div>
  )
}
