import Link from 'next/link'
import React from 'react'

import { footerNav } from '@/data/navigation'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'

export async function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-border">
      <div className="container py-8 flex flex-col md:flex-row md:justify-between gap-4">
        <div className="text-sm text-muted-foreground">&copy;{currentYear} Jandey Shackelford</div>

        <div className="flex flex-col-reverse items-start md:flex-row gap-4 md:items-center">
          <ThemeSelector />
          <nav className="flex flex-col md:flex-row gap-4">
            {footerNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}
