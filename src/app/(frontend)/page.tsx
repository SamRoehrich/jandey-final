import type { Metadata } from 'next'
import Image from 'next/image'
import { getAllPosts } from '@/utilities/content'
import { Card } from '@/components/Card'

export const metadata: Metadata = {
  title: 'Welcome | Home',
  description: 'Welcome to our blog - exploring ideas, sharing stories.',
}

export default function HomePage() {
  const posts = getAllPosts()
  const recentPosts = posts.slice(0, 6)

  return (
    <div className="pt-16 pb-24">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] mb-16">
        <Image
          src="/images/image-hero1.webp"
          alt="Hero image"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Welcome</h1>
            <p className="text-xl md:text-2xl max-w-2xl mx-auto px-4">
              Exploring ideas, sharing stories, and discovering new perspectives.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Posts Section */}
      <section className="container">
        <div className="prose dark:prose-invert max-w-none mb-8">
          <h2>Recent Posts</h2>
        </div>

        {recentPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.map((post) => (
              <Card key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No posts yet. Check back soon!</p>
        )}
      </section>
    </div>
  )
}
