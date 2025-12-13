import type { Metadata } from 'next'
import { getAllPosts } from '@/utilities/content'
import { Card } from '@/components/Card'

export const metadata: Metadata = {
  title: 'All Posts',
  description: 'Browse all our blog posts.',
}

export default function PostsPage() {
  const posts = getAllPosts()

  return (
    <div className="pt-24 pb-24">
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>Posts</h1>
          <p>Browse all our articles and stories.</p>
        </div>
      </div>

      <div className="container">
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No posts yet. Check back soon!</p>
        )}
      </div>
    </div>
  )
}
