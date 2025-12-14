import { Instagram, Twitter } from 'lucide-react'
import { Separator } from './ui/separator'
import { Button } from './ui/button'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/posts', label: 'Posts' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

const socialLinks = [
  { href: 'https://twitter.com', icon: Twitter, label: 'Twitter' },
  { href: 'https://instagram.com', icon: Instagram, label: 'Instagram' },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-secondary mt-24">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Logo */}
          <a
            href="/"
            className="text-xl font-bold tracking-tight uppercase hover:opacity-70 transition-opacity text-center md:text-left"
          >
            Jandey Shaclekford
          </a>

          {/* Navigation */}
          <nav className="flex flex-wrap justify-center gap-6">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Social Links */}
          <div className="flex justify-center md:justify-end gap-2">
            {socialLinks.map((social) => (
              <Button key={social.href} variant="ghost" size="icon" asChild>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              </Button>
            ))}
          </div>
        </div>

        <Separator className="my-8" />

        {/* Copyright */}
        <p className="text-center text-sm text-muted-foreground">
          &copy; {year} Jandey Shaclekford. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
