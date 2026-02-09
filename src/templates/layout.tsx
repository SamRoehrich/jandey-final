import type { ReactNode } from 'react'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'

interface LayoutProps {
  title: string
  description?: string
  children: ReactNode
}

// Script to initialize theme before page renders (prevents flash)
const themeScript = `
(function() {
  function getTheme() {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  const theme = getTheme();
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.classList.toggle('light', theme === 'light');
})();
`

// Script for theme toggle functionality
const themeToggleScript = `
document.addEventListener('DOMContentLoaded', function() {
  var toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function() {
      var isDark = document.documentElement.classList.contains('dark');
      var newTheme = isDark ? 'light' : 'dark';
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }

  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
    if (!localStorage.getItem('theme')) {
      document.documentElement.classList.toggle('dark', e.matches);
      document.documentElement.classList.toggle('light', !e.matches);
    }
  });
});
`

// Script for mobile menu toggle
const mobileMenuScript = `
document.addEventListener('DOMContentLoaded', function() {
  var btn = document.getElementById('mobile-menu-toggle');
  var menu = document.getElementById('mobile-menu');
  var iconOpen = document.getElementById('mobile-menu-icon-open');
  var iconClose = document.getElementById('mobile-menu-icon-close');
  if (!btn || !menu || !iconOpen || !iconClose) return;

  btn.addEventListener('click', function() {
    var isOpen = !menu.classList.contains('hidden');
    if (isOpen) {
      menu.classList.add('hidden');
      iconOpen.classList.remove('hidden');
      iconClose.classList.add('hidden');
      btn.setAttribute('aria-expanded', 'false');
    } else {
      menu.classList.remove('hidden');
      iconOpen.classList.add('hidden');
      iconClose.classList.remove('hidden');
      btn.setAttribute('aria-expanded', 'true');
    }
  });

  // Close menu when clicking a link
  var links = menu.querySelectorAll('a');
  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener('click', function() {
      menu.classList.add('hidden');
      iconOpen.classList.remove('hidden');
      iconClose.classList.add('hidden');
      btn.setAttribute('aria-expanded', 'false');
    });
  }
});
`

export function Layout({ title, description, children }: LayoutProps) {
  const fullTitle = title === 'Home' ? 'Jandey Shackelford' : `${title} | Jandey Shackelford`

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{fullTitle}</title>
        {description && <meta name="description" content={description} />}
        <link rel="stylesheet" href="/styles.css" />
        <link rel="icon" href="/favicon.ico" />
        {/* Theme initialization script - runs before body renders */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        {/* Theme toggle functionality */}
        <script dangerouslySetInnerHTML={{ __html: themeToggleScript }} />
        {/* Mobile menu toggle */}
        <script dangerouslySetInnerHTML={{ __html: mobileMenuScript }} />
      </body>
    </html>
  )
}
