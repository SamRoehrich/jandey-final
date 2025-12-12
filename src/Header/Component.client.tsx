'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'

import type { Header, Page } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'

interface HeaderClientProps {
  data: Header
  pages: Array<Pick<Page, 'slug' | 'title'>>
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data, pages }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <header className="container relative z-20" {...(theme ? { 'data-theme': theme } : {})}>
      <div className="py-6 flex justify-between items-center">
        <Link href="/" className="text-xl font-normal tracking-tight hover:opacity-70 transition-opacity">
          jandey
        </Link>
        {/* Desktop Navigation - shown on md and up */}
        <nav className="hidden md:flex items-center gap-6">
          <HeaderNav data={data} pages={pages} />
        </nav>
        {/* Mobile Menu Button - shown on mobile only */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex items-center gap-2 text-sm font-normal hover:opacity-70 transition-opacity"
          aria-label={menuOpen ? 'Close Menu' : 'Open Menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <>
              <span>Close Menu</span>
              <X className="w-5 h-5" />
            </>
          ) : (
            <>
              <span>Open Menu</span>
              <Menu className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
      {/* Mobile Navigation - shown when menu is open on mobile */}
      {menuOpen && (
        <nav className="md:hidden absolute top-full left-0 right-0 bg-background border-t border-border py-6 shadow-sm">
          <div className="container">
            <HeaderNav data={data} pages={pages} />
          </div>
        </nav>
      )}
    </header>
  )
}
