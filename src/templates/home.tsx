import { renderHTML } from '../render'
import { Layout } from './layout'
import { Card } from '../components/Card'
import { getAllPosts } from '../content'

export async function renderHome(): Promise<string> {
  const posts = await getAllPosts()
  const recentPosts = posts.slice(0, 6)

  return renderHTML(
    <Layout
      title="Home"
      description="Welcome to Jandey Shaclekford's blog - exploring ideas, sharing stories."
    >
      {/* Hero Section */}
      <section className="hero">
        <img src="/images/image-hero1.webp" alt="Hero background" className="hero-image" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-title">Jandey Shaclekford</h1>
          <p className="hero-subtitle">
            Exploring ideas, sharing stories, and discovering new perspectives.
          </p>
        </div>
      </section>

      {/* Recent Posts Section */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Recent Posts</h2>

          {recentPosts.length > 0 ? (
            <div className="cards-grid">
              {recentPosts.map((post) => (
                <Card key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <p>No posts yet. Check back soon!</p>
          )}
        </div>
      </section>
    </Layout>,
  )
}
