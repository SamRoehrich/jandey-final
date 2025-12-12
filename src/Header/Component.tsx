import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'

import type { Header } from '@/payload-types'

const getPages = unstable_cache(
  async () => {
    const payload = await getPayload({ config: configPromise })
    const pages = await payload.find({
      collection: 'pages',
      draft: false,
      limit: 1000,
      overrideAccess: false,
      pagination: false,
      where: {
        _status: {
          equals: 'published',
        },
      },
      select: {
        slug: true,
        title: true,
      },
    })
    return pages.docs || []
  },
  ['header-pages'],
  {
    tags: ['pages'],
  },
)

export async function Header() {
  const headerData: Header = await getCachedGlobal('header', 1)()
  const pages = await getPages()

  return <HeaderClient data={headerData} pages={pages} />
}
