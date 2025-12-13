import { compile, run } from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { getMDXComponents } from './components/mdx'

// Cache for compiled MDX
const cache = new Map<string, { mtime: number; html: string }>()

/**
 * Compile MDX content to HTML string with caching based on file modification time
 */
export async function compileMDX(source: string, filePath: string): Promise<string> {
  // Check cache
  const file = Bun.file(filePath)
  const stat = (await file.exists()) ? { mtimeMs: Date.now() } : null

  if (stat) {
    const cached = cache.get(filePath)
    if (cached && cached.mtime === stat.mtimeMs) {
      return cached.html
    }
  }

  try {
    // Compile MDX to JavaScript
    const compiled = await compile(source, {
      outputFormat: 'function-body',
      development: false,
    })

    // Run the compiled code to get the component
    const { default: MDXContent } = await run(compiled, {
      ...runtime,
      baseUrl: import.meta.url,
    })

    // Get our custom components
    const components = await getMDXComponents()

    // Render to static HTML
    const element = createElement(MDXContent, { components })
    const html = renderToStaticMarkup(element)

    // Cache the result
    if (stat) {
      cache.set(filePath, { mtime: stat.mtimeMs, html })
    }

    return html
  } catch (error) {
    console.error('MDX compilation error:', error)
    return `<p style="color: red;">Error compiling MDX: ${error instanceof Error ? error.message : 'Unknown error'}</p>`
  }
}

/**
 * Clear the MDX cache (useful for development)
 */
export function clearMDXCache(): void {
  cache.clear()
}
