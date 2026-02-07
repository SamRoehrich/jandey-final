import { renderHome } from './templates/home'
import { renderPosts } from './templates/posts'
import { renderPost } from './templates/post'
import { renderPage } from './templates/page'
import { renderNotFound } from './templates/not-found'
import { renderUpload } from './templates/upload'
import { renderGallery } from './templates/gallery'
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

  // Gallery
  if (path === '/gallery') {
    return { html: await renderGallery(), status: 200 }
  }

  // Upload page (GET)
  if (path === '/upload') {
    return { html: renderUpload(), status: 200 }
  }

  // 404
  return { html: await renderNotFound(), status: 404 }
}

// Handle upload POST request
export async function handleUpload(formData: FormData): Promise<RouteResult> {
  const password = formData.get('password') as string
  const files = formData.getAll('images') as File[]

  // Check password
  if (password !== 'jandeyisgreat') {
    return { html: renderUpload({ error: 'Invalid password' }), status: 401 }
  }

  // Check if files were uploaded
  if (!files || files.length === 0) {
    return { html: renderUpload({ error: 'No images selected' }), status: 400 }
  }

  // Validate file types
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
  const invalidFiles = files.filter(file => !allowedTypes.includes(file.type))
  
  if (invalidFiles.length > 0) {
    return { html: renderUpload({ error: `Invalid file type: ${invalidFiles[0].name}. Only images are allowed.` }), status: 400 }
  }

  // Save files
  const uploadPromises = files.map(async (file) => {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_') // Sanitize filename
    const filePath = `./public/images/${fileName}`
    await Bun.write(filePath, buffer)
    return fileName
  })

  try {
    const uploadedFiles = await Promise.all(uploadPromises)
    return { 
      html: renderUpload({ success: `Successfully uploaded ${uploadedFiles.length} image(s)` }), 
      status: 200 
    }
  } catch (error) {
    console.error('Upload error:', error)
    return { html: renderUpload({ error: 'Failed to upload images. Please try again.' }), status: 500 }
  }
}
