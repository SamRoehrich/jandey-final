import type { ReactNode } from 'react'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'

interface LayoutProps {
  title: string
  description?: string
  children: ReactNode
}

export function Layout({ title, description, children }: LayoutProps) {
  const fullTitle = title === 'Home' ? 'Jandey Shaclekford' : `${title} | Jandey Shaclekford`

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{fullTitle}</title>
        {description && <meta name="description" content={description} />}
        <link rel="stylesheet" href="/styles.css" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
