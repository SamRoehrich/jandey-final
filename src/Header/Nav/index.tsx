'use client'

import React from 'react'

import type { Header as HeaderType, Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'

interface HeaderNavProps {
  data: HeaderType
  pages: Array<Pick<Page, 'slug' | 'title'>>
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ data, pages }) => {
  const navItems = data?.navItems || []

  return (
    <>
      {pages
        .filter((page) => page.slug && page.title)
        .map((page) => {
          const href = page.slug === 'home' ? '/' : `/${page.slug}`
          return (
            <Link
              key={page.slug}
              href={href}
              className="text-base font-normal hover:opacity-70 transition-opacity"
            >
              {page.title}
            </Link>
          )
        })}
      {navItems.map(({ link }, i) => {
        return (
          <CMSLink 
            key={`nav-${i}`} 
            {...link} 
            appearance="link"
            className="text-base font-normal hover:opacity-70 transition-opacity"
          />
        )
      })}
      <Link 
        href="/search"
        className="flex items-center gap-2 text-base font-normal hover:opacity-70 transition-opacity"
      >
        <span>Search</span>
        <SearchIcon className="w-5 h-5" />
      </Link>
    </>
  )
}
