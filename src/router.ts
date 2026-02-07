import { renderHome } from './templates/home'
import { renderPosts } from './templates/posts'
import { renderPost } from './templates/post'
import { renderPage } from './templates/page'
import { renderNotFound } from './templates/not-found'
import { renderUpload } from './templates/upload'
import { renderGallery } from './templates/gallery'
import { renderTagPage, getTagImages } from './templates/tag'
import { getPost, getPage } from './content'
import { loadTags, createTag, getTagById, type Tag } from './lib/tags'
import path from 'path'

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
    const tags = await loadTags()
    return { html: renderUpload({ tags }), status: 200 }
  }

  // Tag detail page
  if (path.startsWith('/collection/')) {
    const tagId = path.replace('/collection/', '').replace(/\/$/, '')
    if (tagId) {
      const tag = await getTagById(tagId)
      if (tag) {
        const images = await getTagImages(tagId)
        return { html: renderTagPage({ tag, images }), status: 200 }
      }
    }
    return { html: await renderNotFound(), status: 404 }
  }

  // 404
  return { html: await renderNotFound(), status: 404 }
}

// Handle upload POST request
export async function handleUpload(formData: FormData): Promise<RouteResult> {
  const password = formData.get('password') as string
  const tagId = formData.get('tag') as string
  const files = formData.getAll('images') as File[]

  // Check password
  if (password !== 'jandeyisgreat') {
    const tags = await loadTags()
    return { html: renderUpload({ tags, error: 'Invalid password' }), status: 401 }
  }

  // Check if tag is selected
  if (!tagId) {
    const tags = await loadTags()
    return { html: renderUpload({ tags, error: 'Please select a tag for the images' }), status: 400 }
  }

  // Validate tag exists
  const tag = await getTagById(tagId)
  if (!tag) {
    const tags = await loadTags()
    return { html: renderUpload({ tags, error: 'Selected tag does not exist' }), status: 400 }
  }

  // Check if files were uploaded
  if (!files || files.length === 0) {
    const tags = await loadTags()
    return { html: renderUpload({ tags, error: 'No images selected' }), status: 400 }
  }

  // Validate file types
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
  const invalidFiles = files.filter(file => !allowedTypes.includes(file.type))
  
  if (invalidFiles.length > 0) {
    const tags = await loadTags()
    return { html: renderUpload({ tags, error: `Invalid file type: ${invalidFiles[0].name}. Only images are allowed.` }), status: 400 }
  }

  // Save files to tag folder
  const tagFolderPath = path.join('public', 'images', tagId)
  const uploadPromises = files.map(async (file) => {
    const bytes = await file.arrayBuffer()
    const fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_') // Sanitize filename
    const filePath = path.join(tagFolderPath, fileName)
    await Bun.write(filePath, bytes)
    return fileName
  })

  try {
    const uploadedFiles = await Promise.all(uploadPromises)
    const tags = await loadTags()
    return { 
      html: renderUpload({ tags, success: `Successfully uploaded ${uploadedFiles.length} image(s) to "${tag.title}"` }), 
      status: 200 
    }
  } catch (error) {
    console.error('Upload error:', error)
    const tags = await loadTags()
    return { html: renderUpload({ tags, error: 'Failed to upload images. Please try again.' }), status: 500 }
  }
}

// Handle tag creation POST request
export async function handleCreateTag(formData: FormData): Promise<RouteResult> {
  const password = formData.get('password') as string
  const title = formData.get('title') as string
  const date = formData.get('date') as string
  const description = formData.get('description') as string

  // Check password
  if (password !== 'jandeyisgreat') {
    const tags = await loadTags()
    return { html: renderUpload({ tags, tagError: 'Invalid password' }), status: 401 }
  }

  // Validate inputs
  if (!title || !title.trim()) {
    const tags = await loadTags()
    return { html: renderUpload({ tags, tagError: 'Tag title is required' }), status: 400 }
  }

  if (!date) {
    const tags = await loadTags()
    return { html: renderUpload({ tags, tagError: 'Date is required' }), status: 400 }
  }

  try {
    const newTag = await createTag(title.trim(), date, description || '')
    const tags = await loadTags()
    return { 
      html: renderUpload({ tags, tagSuccess: `Tag "${newTag.title}" created successfully` }), 
      status: 200 
    }
  } catch (error) {
    const tags = await loadTags()
    const errorMessage = error instanceof Error ? error.message : 'Failed to create tag'
    return { html: renderUpload({ tags, tagError: errorMessage }), status: 400 }
  }
}
