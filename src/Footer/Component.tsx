import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import type { Footer } from '@/payload-types'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'

export async function Footer() {
  const footerData: Footer = await getCachedGlobal('footer', 1)()

  const navItems = footerData?.navItems || []
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-border">
      <div className="container py-8 flex flex-col md:flex-row md:justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          ©{currentYear} Dair Massey
        </div>

        <div className="flex flex-col-reverse items-start md:flex-row gap-4 md:items-center">
          <ThemeSelector />
          {navItems.length > 0 && (
            <nav className="flex flex-col md:flex-row gap-4">
              {navItems.map(({ link }, i) => {
                return (
                  <CMSLink 
                    key={i} 
                    {...link}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  />
                )
              })}
            </nav>
          )}
        </div>
      </div>
    </footer>
  )
}
