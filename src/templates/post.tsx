import { renderHTML } from '../render'
import { Layout } from './layout'
import type { Post } from '../content'

export async function renderPost(post: Post, canonicalUrl?: string): Promise<string> {
  const { frontmatter, content } = post

  const date = new Date(frontmatter.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return renderHTML(
    <Layout 
      title={frontmatter.title} 
      description={frontmatter.description}
      canonicalUrl={canonicalUrl}
      type="article"
      publishedAt={frontmatter.publishedAt}
      author={frontmatter.author}
      image={frontmatter.heroImage}
    >
      <article>
        {/* Post Hero */}
        <header className="hero post-hero">
          <img 
            src={frontmatter.heroImage} 
            alt={frontmatter.title} 
            className="hero-image"
            width={1920}
            height={1080}
            decoding="async"
            loading="eager"
          />
          <div className="hero-overlay" />
          <div className="hero-content">
            <h1 className="hero-title">{frontmatter.title}</h1>
            <div className="post-meta">
              <span>By {frontmatter.author}</span>
              <span>•</span>
              <time dateTime={frontmatter.publishedAt}>{date}</time>
            </div>
          </div>
        </header>

        {/* Post Content */}
        <section className="section">
          <div className="container container-narrow">
            <div className="prose" dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        </section>
      </article>
    </Layout>,
  )
}
