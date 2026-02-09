import { Menu, Moon, Sun, X } from 'lucide-react'
import { Button } from './ui/button'
import { Separator } from './ui/separator'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a
            href="/"
            className="text-lg font-bold tracking-tight uppercase hover:opacity-70 transition-opacity"
          >
            Jandey Shackelford
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-foreground after:transition-all hover:after:w-full"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" id="theme-toggle" aria-label="Toggle theme">
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              id="mobile-menu-toggle"
              aria-label="Toggle menu"
              aria-expanded="false"
              aria-controls="mobile-menu"
            >
              <Menu className="h-5 w-5" id="mobile-menu-icon-open" />
              <X className="h-5 w-5 hidden" id="mobile-menu-icon-close" />
            </Button>
          </div>
        </div>
      </div>
      <Separator />

      {/* Mobile Navigation Menu */}
      <nav
        id="mobile-menu"
        className="hidden md:hidden bg-background/95 backdrop-blur-sm border-b"
        aria-label="Mobile navigation"
      >
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block py-3 text-base font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors border-b border-border last:border-0"
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  )
}
