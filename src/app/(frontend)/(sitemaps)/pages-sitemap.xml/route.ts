import { getServerSideSitemap } from 'next-sitemap'

export async function GET() {
  const SITE_URL =
    process.env.NEXT_PUBLIC_SERVER_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    'https://example.com'

  const dateFallback = new Date().toISOString()

  // Static pages
  const sitemap = [
    {
      loc: `${SITE_URL}/`,
      lastmod: dateFallback,
    },
    {
      loc: `${SITE_URL}/about`,
      lastmod: dateFallback,
    },
    {
      loc: `${SITE_URL}/contact`,
      lastmod: dateFallback,
    },
    {
      loc: `${SITE_URL}/posts`,
      lastmod: dateFallback,
    },
  ]

  return getServerSideSitemap(sitemap)
}
