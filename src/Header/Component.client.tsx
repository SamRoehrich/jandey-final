'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Menu, X, SearchIcon } from 'lucide-react'

import { headerNav } from '@/data/navigation'

export const HeaderClient: React.FC = () => {
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
        <Link
          href="/"
          className="text-xl font-normal tracking-tight hover:opacity-70 transition-opacity"
        >
          jandey
        </Link>
        {/* Desktop Navigation - shown on md and up */}
        <nav className="hidden md:flex items-center gap-6">
          {headerNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-base font-normal hover:opacity-70 transition-opacity"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/search"
            className="flex items-center gap-2 text-base font-normal hover:opacity-70 transition-opacity"
          >
            <span>Search</span>
            <SearchIcon className="w-5 h-5" />
          </Link>
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
          <div className="container flex flex-col gap-4">
            {headerNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-base font-normal hover:opacity-70 transition-opacity"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/search"
              className="flex items-center gap-2 text-base font-normal hover:opacity-70 transition-opacity"
            >
              <span>Search</span>
              <SearchIcon className="w-5 h-5" />
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}
