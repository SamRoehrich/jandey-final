import { renderHome } from './templates/home'
import { renderPosts } from './templates/posts'
import { renderPost } from './templates/post'
import { renderPage } from './templates/page'
import { renderNotFound } from './templates/not-found'
import { getPost, getPage } from './content'

export type RouteResult = {
  html: string
  status: number
}

export async function router(path: string): Promise<RouteResult> {
  // Home page
  if (path === '/') {
    return { html: await renderHome(), status: 200 }
  }

  // Posts listing
  if (path === '/posts') {
    return { html: await renderPosts(), status: 200 }
  }

  // Single post
  if (path.startsWith('/posts/')) {
    const slug = path.replace('/posts/', '').replace(/\/$/, '')
    if (slug) {
      const post = await getPost(slug)
      if (post) {
        return { html: await renderPost(post), status: 200 }
      }
    }
    return { html: await renderNotFound(), status: 404 }
  }

  // Static pages (about, contact)
  const pageSlugs = ['about', 'contact']
  const pageSlug = path.replace(/^\//, '').replace(/\/$/, '')

  if (pageSlugs.includes(pageSlug)) {
    const page = await getPage(pageSlug)
    if (page) {
      return { html: await renderPage(page), status: 200 }
    }
  }

  // 404
  return { html: await renderNotFound(), status: 404 }
}
