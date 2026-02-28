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
import { renderAdminHomepage } from './templates/admin-homepage'
import { getPost, getPage } from './content'
import { loadTags, createTag, getTagById, updateTag, deleteTag, getTagImageCount, type Tag } from './lib/tags'
import { loadHomepageConfig, saveHomepageConfig, addFeaturedCollection, removeFeaturedCollection } from './lib/homepage'
import { readdir, stat, unlink, rename, mkdir } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'

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

// Helper function to get all media (images and videos) across all tags
async function getAllMedia(): Promise<{ src: string; name: string; tagId: string | null; tagName: string | null; fullPath: string; isVideo: boolean }[]> {
  const media: { src: string; name: string; tagId: string | null; tagName: string | null; fullPath: string; isVideo: boolean }[] = []
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
            
            if (stats.isFile()) {
              const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file)
              const isVideo = /\.(mp4|webm|mov|m4v)$/i.test(file)
              
              if (isImage || isVideo) {
                media.push({
                  src: `/images/${tagId}/${file}`,
                  name: file,
                  tagId: tagId,
                  tagName: tag?.title || tagId,
                  fullPath: filePath,
                  isVideo,
                })
              }
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
  return media.sort((a, b) => a.name.localeCompare(b.name))
}

// Helper to get all collections with cover images and counts (for admin homepage)
async function getAdminHomepageCollections(): Promise<(Tag & { coverImage?: string; imageCount: number })[]> {
  const tags = await loadTags()
  const result: (Tag & { coverImage?: string; imageCount: number })[] = []

  for (const tag of tags) {
    const images = await getTagImages(tag.id)
    const firstImage = images.find((img) => !img.isVideo)
    result.push({
      ...tag,
      coverImage: firstImage?.src,
      imageCount: images.length,
    })
  }

  // Also include folder-based collections not in tags.json
  const imagesDir = path.join(process.cwd(), 'public', 'images')
  try {
    const entries = await readdir(imagesDir, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isDirectory() && !tags.some((t) => t.id === entry.name)) {
        const images = await getTagImages(entry.name)
        if (images.length > 0) {
          const firstImage = images.find((img) => !img.isVideo)
          result.push({
            id: entry.name,
            title: entry.name.charAt(0).toUpperCase() + entry.name.slice(1).replace(/-/g, ' '),
            date: '',
            description: '',
            createdAt: '',
            coverImage: firstImage?.src,
            imageCount: images.length,
          })
        }
      }
    }
  } catch {
    // Directory might not exist
  }

  return result
}

export async function router(path: string, req?: Request): Promise<RouteResult> {
  // Get the base URL for canonical links
  const url = req ? new URL(req.url) : new URL('http://localhost:3000')
  const siteUrl = process.env.SITE_URL || `${url.protocol}//${url.host}`
  const canonicalUrl = `${siteUrl}${path}`

  // Home page
  if (path === '/') {
    return { html: await renderHome(canonicalUrl), status: 200 }
  }

  // Posts listing
  if (path === '/posts') {
    return { html: await renderPosts(canonicalUrl), status: 200 }
  }

  // Single post
  if (path.startsWith('/posts/')) {
    const slug = path.replace('/posts/', '').replace(/\/\$/, '')
    if (slug) {
      const post = await getPost(slug)
      if (post) {
        return { html: await renderPost(post, canonicalUrl), status: 200 }
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
      return { html: await renderPage(page, canonicalUrl), status: 200 }
    }
  }

  // Gallery
  if (path === '/gallery') {
    return { html: await renderGallery(canonicalUrl), status: 200 }
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
    
    const images = await getAllMedia()
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

  // Admin Homepage (GET) - requires auth
  if (path === '/admin/homepage') {
    const auth = verifyAuth(req)
    if (!auth.valid) return auth.error!
    
    const config = await loadHomepageConfig()
    const allCollections = await getAdminHomepageCollections()
    return { html: renderAdminHomepage({ config, allCollections }), status: 200 }
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
      // Check if folder exists even without a tag entry
      const images = await getTagImages(tagId)
      if (images.length > 0) {
        const folderTag = {
          id: tagId,
          title: tagId.charAt(0).toUpperCase() + tagId.slice(1).replace(/-/g, ' '),
          date: '',
          description: '',
          createdAt: '',
        }
        return { html: renderTagPage({ tag: folderTag, images }), status: 200 }
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
    return { html: renderUpload({ tags, error: 'No files selected' }), status: 400 }
  }

  // Validate file types (images + videos)
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
  const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v']
  const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes]
  const invalidFiles = files.filter(file => !allowedTypes.includes(file.type))
  
  if (invalidFiles.length > 0) {
    const tags = await loadTags()
    return { html: renderUpload({ tags, error: `Invalid file type: ${invalidFiles[0].name}. Only images (JPEG, PNG, GIF, WebP, SVG) and videos (MP4, WebM, MOV) are allowed.` }), status: 400 }
  }

  // Save files to tag folder (convert images to WebP, save videos as-is)
  const tagFolderPath = path.join('public', 'images', tagId)
  const uploadPromises = files.map(async (file) => {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Sanitize filename
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    
    // Check if it's a video file
    const isVideo = allowedVideoTypes.includes(file.type)
    
    if (isVideo) {
      // Save video files as-is (no conversion)
      const videoFileName = originalName
      const videoFilePath = path.join(tagFolderPath, videoFileName)
      await Bun.write(videoFilePath, bytes)
      return { fileName: videoFileName, isVideo: true }
    }
    
    // Handle images - convert to WebP
    const fileName = originalName.replace(/\.[^.]+$/, '.webp')
    const filePath = path.join(tagFolderPath, fileName)
    
    // Skip WebP conversion for SVG files
    if (file.type === 'image/svg+xml') {
      // For SVG, we'll keep them as SVG since they're already small and vector
      const svgFileName = originalName
      const svgFilePath = path.join(tagFolderPath, svgFileName)
      await Bun.write(svgFilePath, bytes)
      return { fileName: svgFileName, isVideo: false }
    }
    
    // Convert to WebP using sharp
    const webpBuffer = await sharp(buffer)
      .webp({ quality: 85, effort: 4 })
      .toBuffer()
    
    await Bun.write(filePath, webpBuffer)
    return { fileName, isVideo: false }
  })

  try {
    const uploadedFiles = await Promise.all(uploadPromises)
    const tags = await loadTags()
    const imageCount = uploadedFiles.filter(f => !f.isVideo).length
    const videoCount = uploadedFiles.filter(f => f.isVideo).length
    
    let successMessage = `Successfully uploaded to "${tag.title}": `
    if (imageCount > 0 && videoCount > 0) {
      successMessage += `${imageCount} image${imageCount === 1 ? '' : 's'} and ${videoCount} video${videoCount === 1 ? '' : 's'}`
    } else if (videoCount > 0) {
      successMessage += `${videoCount} video${videoCount === 1 ? '' : 's'}`
    } else {
      successMessage += `${imageCount} image${imageCount === 1 ? '' : 's'}`
    }
    
    return { 
      html: renderUpload({ tags, success: successMessage }), 
      status: 200 
    }
  } catch (error) {
    console.error('Upload error:', error)
    const tags = await loadTags()
    return { html: renderUpload({ tags, error: 'Failed to upload files. Please try again.' }), status: 500 }
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
    const images = await getAllMedia()
    const tags = await loadTags()
    return { 
      html: renderAdminImages({ images, tags, error: 'No image specified' }), 
      status: 400 
    }
  }
  
  try {
    await unlink(imagePath)
    const images = await getAllMedia()
    const tags = await loadTags()
    return { 
      html: renderAdminImages({ images, tags, success: 'Image deleted successfully' }), 
      status: 200 
    }
  } catch (error) {
    console.error('Delete error:', error)
    const images = await getAllMedia()
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
    const images = await getAllMedia()
    const tags = await loadTags()
    return { 
      html: renderAdminImages({ images, tags, error: 'Image and new collection required' }), 
      status: 400 
    }
  }
  
  // Validate new tag exists
  const tag = await getTagById(newTagId)
  if (!tag) {
    const images = await getAllMedia()
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
    
    const images = await getAllMedia()
    const tags = await loadTags()
    return { 
      html: renderAdminImages({ images, tags, success: `Image moved to "${tag.title}"` }), 
      status: 200 
    }
  } catch (error) {
    console.error('Move error:', error)
    const images = await getAllMedia()
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

// Helper to render admin homepage with current state
async function renderAdminHomepageWithState(overrides?: { error?: string; success?: string }): Promise<RouteResult> {
  const config = await loadHomepageConfig()
  const allCollections = await getAdminHomepageCollections()
  return {
    html: renderAdminHomepage({ config, allCollections, ...overrides }),
    status: 200,
  }
}

// Handle hero image upload
export async function handleUpdateHeroImage(formData: FormData, req?: Request): Promise<RouteResult> {
  const auth = verifyAuth(req)
  if (!auth.valid) return auth.error!

  const file = formData.get('heroImage') as File
  if (!file || !file.size) {
    return renderAdminHomepageWithState({ error: 'No image file provided' })
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return renderAdminHomepageWithState({ error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' })
  }

  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Convert to WebP and save as hero image
    const heroFileName = 'image-hero1.webp'
    const heroFilePath = path.join(process.cwd(), 'public', 'images', heroFileName)

    const webpBuffer = await sharp(buffer)
      .webp({ quality: 90, effort: 4 })
      .toBuffer()

    await Bun.write(heroFilePath, webpBuffer)

    // Update homepage config
    const config = await loadHomepageConfig()
    config.heroImage = `/images/${heroFileName}`
    await saveHomepageConfig(config)

    return renderAdminHomepageWithState({ success: 'Hero image updated successfully' })
  } catch (error) {
    console.error('Hero image upload error:', error)
    return renderAdminHomepageWithState({ error: 'Failed to upload hero image. Please try again.' })
  }
}

// Handle setting hero image URL directly
export async function handleSetHeroUrl(formData: FormData, req?: Request): Promise<RouteResult> {
  const auth = verifyAuth(req)
  if (!auth.valid) return auth.error!

  const heroImageUrl = formData.get('heroImageUrl') as string
  if (!heroImageUrl || !heroImageUrl.trim()) {
    return renderAdminHomepageWithState({ error: 'No image URL provided' })
  }

  try {
    const config = await loadHomepageConfig()
    config.heroImage = heroImageUrl.trim()
    await saveHomepageConfig(config)

    return renderAdminHomepageWithState({ success: 'Hero image URL updated successfully' })
  } catch (error) {
    console.error('Set hero URL error:', error)
    return renderAdminHomepageWithState({ error: 'Failed to update hero image URL' })
  }
}

// Handle adding a collection to the homepage
export async function handleAddHomepageCollection(formData: FormData, req?: Request): Promise<RouteResult> {
  const auth = verifyAuth(req)
  if (!auth.valid) return auth.error!

  const collectionId = formData.get('collectionId') as string
  if (!collectionId) {
    return renderAdminHomepageWithState({ error: 'No collection specified' })
  }

  try {
    await addFeaturedCollection(collectionId)
    return renderAdminHomepageWithState({ success: `Collection added to homepage` })
  } catch (error) {
    console.error('Add homepage collection error:', error)
    return renderAdminHomepageWithState({ error: 'Failed to add collection to homepage' })
  }
}

// Handle removing a collection from the homepage
export async function handleRemoveHomepageCollection(formData: FormData, req?: Request): Promise<RouteResult> {
  const auth = verifyAuth(req)
  if (!auth.valid) return auth.error!

  const collectionId = formData.get('collectionId') as string
  if (!collectionId) {
    return renderAdminHomepageWithState({ error: 'No collection specified' })
  }

  try {
    await removeFeaturedCollection(collectionId)
    return renderAdminHomepageWithState({ success: `Collection removed from homepage` })
  } catch (error) {
    console.error('Remove homepage collection error:', error)
    return renderAdminHomepageWithState({ error: 'Failed to remove collection from homepage' })
  }
}

// Handle reordering a collection on the homepage (move up/down)
export async function handleMoveHomepageCollection(formData: FormData, req?: Request): Promise<RouteResult> {
  const auth = verifyAuth(req)
  if (!auth.valid) return auth.error!

  const collectionId = formData.get('collectionId') as string
  const direction = formData.get('direction') as string

  if (!collectionId || !direction) {
    return renderAdminHomepageWithState({ error: 'Missing collection or direction' })
  }

  try {
    const config = await loadHomepageConfig()
    const idx = config.featuredCollections.indexOf(collectionId)
    if (idx === -1) {
      return renderAdminHomepageWithState({ error: 'Collection not found in featured list' })
    }

    const newIdx = direction === 'up' ? idx - 1 : idx + 1
    if (newIdx < 0 || newIdx >= config.featuredCollections.length) {
      return renderAdminHomepageWithState({ error: 'Cannot move further in that direction' })
    }

    // Swap
    const temp = config.featuredCollections[idx]
    config.featuredCollections[idx] = config.featuredCollections[newIdx]
    config.featuredCollections[newIdx] = temp
    await saveHomepageConfig(config)

    return renderAdminHomepageWithState({ success: `Collection moved ${direction}` })
  } catch (error) {
    console.error('Move homepage collection error:', error)
    return renderAdminHomepageWithState({ error: 'Failed to reorder collection' })
  }
}
