import { renderHTML } from '../render'
import { Layout } from './layout'
import { Card } from '../components/Card'
import { getAllPosts } from '../content'

export async function renderPosts(): Promise<string> {
  const posts = await getAllPosts()

  return renderHTML(
    <Layout title="Posts" description="All blog posts by Jandey Shaclekford">
      <div className="page-header">
        <div className="container">
          <h1>All Posts</h1>
          <p>Thoughts, stories, and ideas.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {posts.length > 0 ? (
            <div className="cards-grid">
              {posts.map((post) => (
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
