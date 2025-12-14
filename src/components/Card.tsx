import type { Post } from '../content'
import { Card as ShadcnCard, CardContent, CardHeader, CardTitle } from './ui/card'

interface CardProps {
  post: Post
  variant?: 'portfolio' | 'blog' | 'default'
}

export function Card({ post, variant = 'default' }: CardProps) {
  const { slug, frontmatter } = post
  const date = new Date(frontmatter.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Portfolio-style card (MA Quilts style)
  if (variant === 'portfolio') {
    return (
      <article className="group">
        <a href={`/posts/${slug}`} className="block">
          <div className="aspect-[3/4] overflow-hidden bg-muted">
            <img
              src={frontmatter.heroImage}
              alt={frontmatter.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </a>
        <div className="pt-4">
          <h3 className="text-lg font-semibold tracking-tight">
            <a href={`/posts/${slug}`} className="hover:opacity-70 transition-opacity">
              {frontmatter.title}
            </a>
          </h3>
        </div>
      </article>
    )
  }

  // Blog-style card
  if (variant === 'blog') {
    return (
      <a href={`/posts/${slug}`} className="group block">
        <div className="aspect-[4/3] overflow-hidden bg-muted rounded-lg mb-4">
          <img
            src={frontmatter.heroImage}
            alt={frontmatter.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
          />
        </div>
        <time className="text-sm text-muted-foreground" dateTime={frontmatter.publishedAt}>
          {date}
        </time>
        <h3 className="text-xl font-semibold tracking-tight mt-1 group-hover:opacity-70 transition-opacity">
          {frontmatter.title}
        </h3>
      </a>
    )
  }

  // Default card using shadcn Card component
  return (
    <ShadcnCard className="group overflow-hidden hover:shadow-lg transition-shadow">
      <a href={`/posts/${slug}`} className="block">
        <div className="aspect-video overflow-hidden">
          <img
            src={frontmatter.heroImage}
            alt={frontmatter.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </a>
      <CardHeader>
        <CardTitle className="text-xl">
          <a href={`/posts/${slug}`} className="hover:opacity-70 transition-opacity">
            {frontmatter.title}
          </a>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground line-clamp-2 mb-4">{frontmatter.description}</p>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{frontmatter.author}</span>
          <time dateTime={frontmatter.publishedAt}>{date}</time>
        </div>
      </CardContent>
    </ShadcnCard>
  )
}

// Export a simpler PortfolioCard component for featured work
export function PortfolioCard({ post }: { post: Post }) {
  return <Card post={post} variant="portfolio" />
}

// Export a simpler BlogCard component for blog sections
export function BlogCard({ post }: { post: Post }) {
  return <Card post={post} variant="blog" />
}
