import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactElement } from 'react'

/**
 * Render a React element to an HTML string with doctype
 */
export function renderHTML(element: ReactElement): string {
  const html = renderToStaticMarkup(element)
  return `<!DOCTYPE html>${html}`
}
