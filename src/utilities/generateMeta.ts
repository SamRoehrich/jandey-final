import type { Metadata } from 'next'
import type { Post } from '@/types/post'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'

export const generateMeta = async (args: { doc: Post | null }): Promise<Metadata> => {
  const { doc } = args

  const serverUrl = getServerSideURL()
  const ogImage = doc?.heroImage
    ? doc.heroImage.startsWith('http')
      ? doc.heroImage
      : serverUrl + doc.heroImage
    : serverUrl + '/website-template-OG.webp'

  const title = doc?.title ? doc.title + ' | Blog' : 'Blog'

  return {
    description: doc?.description,
    openGraph: mergeOpenGraph({
      description: doc?.description || '',
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url: doc?.slug ? `/posts/${doc.slug}` : '/',
    }),
    title,
  }
}
