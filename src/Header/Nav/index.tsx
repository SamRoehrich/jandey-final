'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []

  return (
    <nav className="flex flex-col gap-4">
      {navItems.map(({ link }, i) => {
        return (
          <CMSLink 
            key={i} 
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
    </nav>
  )
}
