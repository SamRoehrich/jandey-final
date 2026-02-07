import { renderHome } from './templates/home'
import { renderPosts } from './templates/posts'
import { renderPost } from './templates/post'
import { renderPage } from './templates/page'
import { renderNotFound } from './templates/not-found'
import { renderUpload } from './templates/upload'
import { renderGallery } from './templates/gallery'
import { renderTagPage, getTagImages } from './templates/tag'
import { renderAdmin } from './templates/admin'
import { renderAdminImages } from './templates/admin-images'
import { renderAdminCollections } from './templates/admin-collections'
import { getPost, getPage } from './content'
import { loadTags, createTag, getTagById, updateTag, deleteTag, getTagImageCount, type Tag } from './lib/tags'
import { readdir, stat, unlink, rename, mkdir } from 'fs/promises'
import path from 'path'

export type RouteResult = {
  html: string
  status: number
  headers?: Record<string, string>
}

const ADMIN_USERNAME = 'jandey'
const ADMIN_PASSWORD = 'jandeyisgreat'
const AUTH_COOKIE_NAME = 'admin_auth'
const AUTH_COOKIE_VALUE = 'jandey_authenticated_2024'

// Check if the request has valid admin authentication
function checkAuthCookie(req?: Request): boolean {
  if (!req) return false
  const cookies = req.headers.get('cookie')
  if (!cookies) return false
  return cookies.includes(`${AUTH_COOKIE_NAME}=${AUTH_COOKIE_VALUE}`)
}

export function generateAuthCookie(): string {
  // Cookie valid for 7 days, httpOnly, sameSite strict
  const expires = new Date()
  expires.setDate(expires.getDate() + 7)
  return `${AUTH_COOKIE_NAME}=${AUTH_COOKIE_VALUE}; Path=/; Expires=${expires.toUTCString()}; HttpOnly; SameSite=Strict`
}

export function generateClearCookie(): string {
  return `${AUTH_COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict`
}

// Handle admin login
export async function handleAdminLogin(formData: FormData): Promise<RouteResult> {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    return {
      html: '<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=/admin"></head></html>',
      status: 302,
      headers: {
        'Location': '/admin',
        'Set-Cookie': generateAuthCookie(),
      },
    }
  }

  return {
    html: renderAdmin({ isAuthenticated: false, error: 'Invalid username or password' }),
    status: 401,
  }
}

// Handle admin logout
export async function handleAdminLogout(): Promise<RouteResult> {
  return {
    html: '<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=/gallery"></head></html>',
    status: 302,
    headers: {
      'Location': '/gallery',
      'Set-Cookie': generateClearCookie(),
    },
  }
}

// Verify authentication for mutations
export function verifyAuth(req?: Request): { valid: boolean; error?: RouteResult } {
  if (!checkAuthCookie(req)) {
    return {
      valid: false,
      error: {
        html: renderAdmin({ isAuthenticated: false, error: 'Please log in to access this feature' }),
        status: 401,
      },
    }
  }
  return { valid: true }
}

// Helper function to get all images across all tags
async function getAllImages(): Promise<{ src: string; name: string; tagId: string | null; tagName: string | null; fullPath: string }[]> {
  const images: { src: string; name: string; tagId: string | null; tagName: string | null; fullPath: string }[] = []
  const tags = await loadTags()
  const imagesDir = path.join(process.cwd(), 'public', 'images')

  try {
    const entries = await readdir(imagesDir, { withFileTypes: true })
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        // This is a tag folder
        const tagId = entry.name
        const tag = tags.find(t => t.id === tagId)
        const tagFolderPath = path.join(imagesDir, tagId)
        
        try {
          const files = await readdir(tagFolderPath)
          for (const file of files) {
            const filePath = path.join(tagFolderPath, file)
            const stats = await stat(filePath)
            
            if (stats.isFile() && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file)) {
              images.push({
                src: `/images/${tagId}/${file}`,
                name: file,
                tagId: tagId,
                tagName: tag?.title || tagId,
                fullPath: filePath,
              })
            }
          }
        } catch {
          // Skip folders we can't read
        }
      }
    }
  } catch {
    // Directory might not exist
  }

  // Sort by name for consistent ordering
  return images.sort((a, b) => a.name.localeCompare(b.name))
}

export async function router(path: string, req?: Request): Promise<RouteResult> {
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
    const slug = path.replace('/posts/', '').replace(/\/\$/, '')
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
  const pageSlug = path.replace(/^\//, '').replace(/\/\$/, '')

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

  // Admin Dashboard - requires auth
  if (path === '/admin') {
    const isAuthenticated = checkAuthCookie(req)
    return { html: renderAdmin({ isAuthenticated }), status: 200 }
  }

  // Admin Images (GET) - requires auth
  if (path === '/admin/images') {
    const auth = verifyAuth(req)
    if (!auth.valid) return auth.error!
    
    const images = await getAllImages()
    const tags = await loadTags()
    return { html: renderAdminImages({ images, tags }), status: 200 }
  }

  // Admin Collections (GET) - requires auth
  if (path === '/admin/collections') {
    const auth = verifyAuth(req)
    if (!auth.valid) return auth.error!
    
    const tags = await loadTags()
    const tagCounts: Record<string, number> = {}
    for (const tag of tags) {
      tagCounts[tag.id] = await getTagImageCount(tag.id)
    }
    
    // Check if we're editing a specific tag
    const url = new URL(req?.url || '', 'http://localhost')
    const editTagId = url.searchParams.get('edit') || undefined
    
    return { html: renderAdminCollections({ tags, tagCounts, editTagId }), status: 200 }
  }

  // Admin Upload (GET) - requires auth
  if (path === '/admin/upload') {
    const auth = verifyAuth(req)
    if (!auth.valid) return auth.error!
    
    const tags = await loadTags()
    return { html: renderUpload({ tags }), status: 200 }
  }

  // Legacy /upload redirect
  if (path === '/upload') {
    return { html: '<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=/admin/upload"></head></html>', status: 301 }
  }

  // Tag detail page
  if (path.startsWith('/collection/')) {
    const tagId = path.replace('/collection/', '').replace(/\/\$/, '')
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

// Handle upload POST request (now at /admin/upload)
export async function handleUpload(formData: FormData, req?: Request): Promise<RouteResult> {
  // Check auth
  const auth = verifyAuth(req)
  if (!auth.valid) return auth.error!

  const password = formData.get('password') as string
  const tagId = formData.get('tag') as string
  const files = formData.getAll('images') as File[]

  // Check password
  if (password !== ADMIN_PASSWORD) {
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

// Handle tag creation POST request (now at /admin/create-collection)
export async function handleCreateTag(formData: FormData, req?: Request): Promise<RouteResult> {
  // Check auth
  const auth = verifyAuth(req)
  if (!auth.valid) return auth.error!

  const password = formData.get('password') as string
  const title = formData.get('title') as string
  const date = formData.get('date') as string
  const description = formData.get('description') as string

  // Check password
  if (password !== ADMIN_PASSWORD) {
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

// Handle image deletion
export async function handleDeleteImage(formData: FormData, req?: Request): Promise<RouteResult> {
  // Check auth
  const auth = verifyAuth(req)
  if (!auth.valid) return auth.error!

  const imagePath = formData.get('imagePath') as string
  
  if (!imagePath) {
    const images = await getAllImages()
    const tags = await loadTags()
    return { 
      html: renderAdminImages({ images, tags, error: 'No image specified' }), 
      status: 400 
    }
  }
  
  try {
    await unlink(imagePath)
    const images = await getAllImages()
    const tags = await loadTags()
    return { 
      html: renderAdminImages({ images, tags, success: 'Image deleted successfully' }), 
      status: 200 
    }
  } catch (error) {
    console.error('Delete error:', error)
    const images = await getAllImages()
    const tags = await loadTags()
    return { 
      html: renderAdminImages({ images, tags, error: 'Failed to delete image' }), 
      status: 500 
    }
  }
}

// Handle image tag update (move image to different collection)
export async function handleUpdateImageTag(formData: FormData, req?: Request): Promise<RouteResult> {
  // Check auth
  const auth = verifyAuth(req)
  if (!auth.valid) return auth.error!

  const imagePath = formData.get('imagePath') as string
  const newTagId = formData.get('newTagId') as string
  
  if (!imagePath || !newTagId) {
    const images = await getAllImages()
    const tags = await loadTags()
    return { 
      html: renderAdminImages({ images, tags, error: 'Image and new collection required' }), 
      status: 400 
    }
  }
  
  // Validate new tag exists
  const tag = await getTagById(newTagId)
  if (!tag) {
    const images = await getAllImages()
    const tags = await loadTags()
    return { 
      html: renderAdminImages({ images, tags, error: 'Selected collection does not exist' }), 
      status: 400 
    }
  }
  
  try {
    // Get the filename from the path
    const fileName = path.basename(imagePath)
    const newFolderPath = path.join(process.cwd(), 'public', 'images', newTagId)
    const newPath = path.join(newFolderPath, fileName)
    
    // Ensure the destination folder exists
    await mkdir(newFolderPath, { recursive: true })
    
    // Move the file
    await rename(imagePath, newPath)
    
    const images = await getAllImages()
    const tags = await loadTags()
    return { 
      html: renderAdminImages({ images, tags, success: `Image moved to "${tag.title}"` }), 
      status: 200 
    }
  } catch (error) {
    console.error('Move error:', error)
    const images = await getAllImages()
    const tags = await loadTags()
    return { 
      html: renderAdminImages({ images, tags, error: 'Failed to move image' }), 
      status: 500 
    }
  }
}

// Handle collection update
export async function handleUpdateCollection(formData: FormData, req?: Request): Promise<RouteResult> {
  // Check auth
  const auth = verifyAuth(req)
  if (!auth.valid) return auth.error!

  const password = formData.get('password') as string
  const tagId = formData.get('tagId') as string
  const title = formData.get('title') as string
  const date = formData.get('date') as string
  const description = formData.get('description') as string

  // Check password
  if (password !== ADMIN_PASSWORD) {
    const tags = await loadTags()
    const tagCounts: Record<string, number> = {}
    for (const tag of tags) {
      tagCounts[tag.id] = await getTagImageCount(tag.id)
    }
    return { 
      html: renderAdminCollections({ tags, tagCounts, editTagId: tagId, error: 'Invalid password' }), 
      status: 401 
    }
  }

  // Validate inputs
  if (!tagId || !title || !title.trim()) {
    const tags = await loadTags()
    const tagCounts: Record<string, number> = {}
    for (const tag of tags) {
      tagCounts[tag.id] = await getTagImageCount(tag.id)
    }
    return { 
      html: renderAdminCollections({ tags, tagCounts, editTagId: tagId, error: 'Title is required' }), 
      status: 400 
    }
  }

  if (!date) {
    const tags = await loadTags()
    const tagCounts: Record<string, number> = {}
    for (const tag of tags) {
      tagCounts[tag.id] = await getTagImageCount(tag.id)
    }
    return { 
      html: renderAdminCollections({ tags, tagCounts, editTagId: tagId, error: 'Date is required' }), 
      status: 400 
    }
  }

  try {
    await updateTag(tagId, title.trim(), date, description || '')
    const tags = await loadTags()
    const tagCounts: Record<string, number> = {}
    for (const tag of tags) {
      tagCounts[tag.id] = await getTagImageCount(tag.id)
    }
    return { 
      html: renderAdminCollections({ tags, tagCounts, success: `Collection "${title}" updated successfully` }), 
      status: 200 
    }
  } catch (error) {
    const tags = await loadTags()
    const tagCounts: Record<string, number> = {}
    for (const tag of tags) {
      tagCounts[tag.id] = await getTagImageCount(tag.id)
    }
    const errorMessage = error instanceof Error ? error.message : 'Failed to update collection'
    return { 
      html: renderAdminCollections({ tags, tagCounts, editTagId: tagId, error: errorMessage }), 
      status: 400 
    }
  }
}

// Handle collection deletion
export async function handleDeleteCollection(formData: FormData, req?: Request): Promise<RouteResult> {
  // Check auth
  const auth = verifyAuth(req)
  if (!auth.valid) return auth.error!

  const password = formData.get('password') as string
  const tagId = formData.get('tagId') as string

  // Check password
  if (password !== ADMIN_PASSWORD) {
    const tags = await loadTags()
    const tagCounts: Record<string, number> = {}
    for (const tag of tags) {
      tagCounts[tag.id] = await getTagImageCount(tag.id)
    }
    return { 
      html: renderAdminCollections({ tags, tagCounts, error: 'Invalid password' }), 
      status: 401 
    }
  }

  if (!tagId) {
    const tags = await loadTags()
    const tagCounts: Record<string, number> = {}
    for (const tag of tags) {
      tagCounts[tag.id] = await getTagImageCount(tag.id)
    }
    return { 
      html: renderAdminCollections({ tags, tagCounts, error: 'No collection specified' }), 
      status: 400 
    }
  }

  try {
    const tag = await getTagById(tagId)
    const tagName = tag?.title || tagId
    await deleteTag(tagId)
    
    const tags = await loadTags()
    const tagCounts: Record<string, number> = {}
    for (const t of tags) {
      tagCounts[t.id] = await getTagImageCount(t.id)
    }
    return { 
      html: renderAdminCollections({ tags, tagCounts, success: `Collection "${tagName}" deleted successfully` }), 
      status: 200 
    }
  } catch (error) {
    const tags = await loadTags()
    const tagCounts: Record<string, number> = {}
    for (const tag of tags) {
      tagCounts[tag.id] = await getTagImageCount(tag.id)
    }
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete collection'
    return { 
      html: renderAdminCollections({ tags, tagCounts, error: errorMessage }), 
      status: 400 
    }
  }
}
