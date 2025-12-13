import type { Post } from '../content'

interface CardProps {
  post: Post
}

export function Card({ post }: CardProps) {
  const { slug, frontmatter } = post
  const date = new Date(frontmatter.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <article className="card">
      <div className="card-image">
        <a href={`/posts/${slug}`}>
          <img src={frontmatter.heroImage} alt={frontmatter.title} />
        </a>
      </div>
      <div className="card-content">
        <h3 className="card-title">
          <a href={`/posts/${slug}`}>{frontmatter.title}</a>
        </h3>
        <p className="card-description">{frontmatter.description}</p>
        <div className="card-meta">
          <span>{frontmatter.author}</span>
          <time dateTime={frontmatter.publishedAt}>{date}</time>
        </div>
      </div>
    </article>
  )
}
