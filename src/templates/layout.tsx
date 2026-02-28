import type { ReactNode } from 'react'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'

interface LayoutProps {
  title: string
  description?: string
  children: ReactNode
  image?: string
  type?: 'website' | 'article'
  canonicalUrl?: string
  publishedAt?: string
  modifiedAt?: string
  author?: string
  jsonLd?: Record<string, unknown>
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

export function Layout({ 
  title, 
  description, 
  children, 
  image = '/website-template-OG.webp',
  type = 'website',
  canonicalUrl,
  publishedAt,
  modifiedAt,
  author = 'Jandey Shackelford',
  jsonLd
}: LayoutProps) {
  const fullTitle = title === 'Home' ? 'Jandey Shackelford' : `${title} | Jandey Shackelford`
  const siteUrl = process.env.SITE_URL || 'https://jandeyshackelford.com'
  const fullCanonicalUrl = canonicalUrl || siteUrl
  const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`

  // Default structured data for all pages
  const defaultJsonLd = {
    '@context': 'https://schema.org',
    '@type': type === 'article' ? 'Article' : 'WebSite',
    name: fullTitle,
    url: fullCanonicalUrl,
    ...(description && { description }),
    ...(fullImageUrl && { image: fullImageUrl }),
    ...(type === 'article' && {
      headline: title,
      datePublished: publishedAt,
      dateModified: modifiedAt || publishedAt,
      author: {
        '@type': 'Person',
        name: author,
      },
      publisher: {
        '@type': 'Person',
        name: 'Jandey Shackelford',
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/favicon.ico`,
        },
      },
    }),
  }

  // Merge custom JSON-LD with defaults if provided
  const finalJsonLd = jsonLd ? { ...defaultJsonLd, ...jsonLd } : defaultJsonLd

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{fullTitle}</title>
        {description && <meta name="description" content={description} />}
        
        {/* Canonical URL */}
        <link rel="canonical" href={fullCanonicalUrl} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content={type} />
        <meta property="og:url" content={fullCanonicalUrl} />
        <meta property="og:title" content={fullTitle} />
        {description && <meta property="og:description" content={description} />}
        <meta property="og:image" content={fullImageUrl} />
        <meta property="og:site_name" content="Jandey Shackelford" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={fullCanonicalUrl} />
        <meta name="twitter:title" content={fullTitle} />
        {description && <meta name="twitter:description" content={description} />}
        <meta name="twitter:image" content={fullImageUrl} />
        <meta name="twitter:creator" content="@jandeyshack" />
        
        {/* Article-specific metadata */}
        {type === 'article' && publishedAt && (
          <meta property="article:published_time" content={publishedAt} />
        )}
        {type === 'article' && modifiedAt && (
          <meta property="article:modified_time" content={modifiedAt} />
        )}
        {type === 'article' && author && (
          <meta property="article:author" content={author} />
        )}
        
        {/* Additional SEO meta tags */}
        <meta name="author" content={author} />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        
        {/* JSON-LD Structured Data */}
        <script 
          type="application/ld+json" 
          dangerouslySetInnerHTML={{ __html: JSON.stringify(finalJsonLd) }} 
        />
        
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
