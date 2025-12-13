import { getServerSideSitemap } from 'next-sitemap'
import { getAllPosts } from '@/utilities/content'

export async function GET() {
  const SITE_URL =
    process.env.NEXT_PUBLIC_SERVER_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    'https://example.com'

  const posts = getAllPosts()

  const sitemap = posts.map((post) => ({
    loc: `${SITE_URL}/posts/${post.slug}`,
    lastmod: post.publishedAt ? new Date(post.publishedAt).toISOString() : new Date().toISOString(),
  }))

  return getServerSideSitemap(sitemap)
}
