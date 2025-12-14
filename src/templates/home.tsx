import { renderHTML } from '../render'
import { Layout } from './layout'
import { PortfolioCard, BlogCard } from '../components/Card'
import { getAllPosts } from '../content'
import { Button } from '../components/ui/button'
import { Separator } from '../components/ui/separator'
import { ArrowRight } from 'lucide-react'

export async function renderHome(): Promise<string> {
  const posts = await getAllPosts()
  const featuredPosts = posts.slice(0, 4)
  const blogPosts = posts.slice(0, 3)

  return renderHTML(
    <Layout
      title="Home"
      description="Welcome to Jandey Shaclekford's blog - exploring ideas, sharing stories."
    >
      {/* Hero Section - MA Quilts Style */}
      <section className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
        <div className="flex flex-col justify-center px-6 lg:px-16 py-24 lg:py-32 pt-32 lg:pt-32">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tighter leading-[0.9] uppercase">
            <span className="block">Jandey</span>
            <span className="block">Shaclekford</span>
            <span className="block text-muted-foreground">Art</span>
            <span className="block text-muted-foreground">&amp; Ideas</span>
          </h1>
          <p className="mt-8 text-lg text-muted-foreground max-w-md leading-relaxed">
            Exploring emotion, sharing stories, and discovering new perspectives through thoughtful
            art.
          </p>
        </div>
        <div className="relative h-[50vh] lg:h-auto">
          <img
            src="/images/image-hero1.webp"
            alt="Hero background"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Featured Posts Section - Portfolio Grid */}
      <section className="py-24 lg:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">Featured Work</h2>
          </div>

          {featuredPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredPosts.map((post) => (
                <PortfolioCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No posts yet. Check back soon!</p>
          )}

          <div className="mt-12">
            <Button variant="outline" asChild>
              <a href="/posts" className="inline-flex items-center gap-2">
                See all posts
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      <Separator className="max-w-[1400px] mx-auto" />

      {/* About Preview Section */}
      <section className="py-24 lg:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-2xl lg:text-3xl font-bold tracking-tight mb-6">The Process</h3>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                Every story begins with curiosity. I explore the intersection of technology,
                culture, and human experience, crafting narratives that illuminate the world around
                us.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Through careful research and thoughtful reflection, each piece aims to offer new
                perspectives and meaningful insights.
              </p>
              <Button variant="outline" asChild>
                <a href="/about" className="inline-flex items-center gap-2">
                  Find out more
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Separator className="max-w-[1400px] mx-auto" />

      {/* Blog Section */}
      <section className="py-24 lg:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">From the Blog</h2>
          </div>

          {blogPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No posts yet. Check back soon!</p>
          )}

          <div className="mt-12">
            <Button variant="outline" asChild>
              <a href="/posts" className="inline-flex items-center gap-2">
                See all blog posts
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>,
  )
}
