import { renderHTML } from '../render'
import { Layout } from './layout'
import { Card } from '../components/Card'
import { getAllPosts } from '../content'

export async function renderPosts(): Promise<string> {
  const posts = await getAllPosts()

  return renderHTML(
    <Layout title="Posts" description="All blog posts by Jandey Shackelford">
      <div className="page-header">
        <div className="container">
          <h1>All Posts</h1>
          <p>Thoughts, stories, and ideas.</p>
        </div>
      </div>

      <section className="section p-4">
        <div className="container mx-auto gap-4">
          {posts.length > 0 ? (
            <div className="cards-grid gap-4">
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
