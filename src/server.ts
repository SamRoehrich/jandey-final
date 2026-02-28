import { 
  router, 
  handleUpload, 
  handleCreateTag,
  handleDeleteImage,
  handleUpdateImageTag,
  handleUpdateCollection,
  handleDeleteCollection,
  handleAdminLogin,
  handleAdminLogout,
  handleUpdateHeroImage,
  handleSetHeroUrl,
  handleAddHomepageCollection,
  handleRemoveHomepageCollection,
  handleMoveHomepageCollection,
  type RouteResult 
} from './router'
import path from 'path'

const PORT = process.env.PORT || 3000
const PUBLIC_DIR = path.join(process.cwd(), 'public')

// Simple cache versioning for cache invalidation
// When admin actions modify content, increment this to force cache refresh
let cacheVersion = Date.now()

export function invalidateCache(): void {
  cacheVersion = Date.now()
  console.log(`Cache invalidated at ${new Date(cacheVersion).toISOString()}`)
}

function generateETag(): string {
  return `"${cacheVersion}"`
}

async function handleRouteResult(result: RouteResult, isStaticPage: boolean = false, req?: Request): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'text/html; charset=utf-8',
  }
  
  // Add caching headers for static pages (public content)
  if (isStaticPage && result.status === 200) {
    // Cache public pages for 1 year with stale-while-revalidate
    // ETag-based revalidation ensures freshness when content changes
    headers['Cache-Control'] = 'public, max-age=31536000, stale-while-revalidate=86400, immutable'
    headers['ETag'] = generateETag()
    headers['Vary'] = 'Accept-Encoding'
    
    // Check for ETag match (conditional request)
    const ifNoneMatch = req?.headers.get('if-none-match')
    if (ifNoneMatch === generateETag()) {
      return new Response(null, {
        status: 304,
        headers,
      })
    }
  } else {
    // No caching for dynamic/admin pages
    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
  }
  
  // Add any additional headers from the result
  if (result.headers) {
    Object.assign(headers, result.headers)
  }
  
  return new Response(result.html, {
    status: result.status,
    headers,
  })
}

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url)
    const pathname = url.pathname

    // Static files from public directory
    if (
      pathname.startsWith('/images/') ||
      pathname.startsWith('/js/') ||
      pathname.startsWith('/files/') ||
      pathname === '/styles.css' ||
      pathname === '/favicon.ico' ||
      pathname === '/favicon.svg'
    ) {
      // Remove leading slash to properly join paths
      const relativePath = pathname.slice(1)
      const filePath = path.join(PUBLIC_DIR, relativePath)
      const file = Bun.file(filePath)
      
      if (await file.exists()) {
        const fileExtension = filePath.split('.').pop()?.toLowerCase()
        
        // Set appropriate content type for JS files
        let contentType = file.type
        if (fileExtension === 'js') {
          contentType = 'application/javascript'
        }
        
        // Configure caching based on file type
        let cacheControl: string
        if (fileExtension === 'webp' || fileExtension === 'jpg' || fileExtension === 'jpeg' || 
            fileExtension === 'png' || fileExtension === 'gif' || fileExtension === 'svg' ||
            fileExtension === 'ico') {
          // Images: cache for 1 year (immutable content)
          cacheControl = 'public, max-age=31536000, immutable'
        } else if (fileExtension === 'css' || fileExtension === 'js') {
          // CSS/JS: cache for 1 year with stale-while-revalidate
          cacheControl = 'public, max-age=31536000, stale-while-revalidate=86400'
        } else {
          // Other static files: cache for 1 day
          cacheControl = 'public, max-age=86400'
        }
        
        return new Response(file, {
          headers: {
            'Content-Type': contentType || 'application/octet-stream',
            'Cache-Control': cacheControl,
          }
        })
      }
      console.error(`Static file not found: ${filePath} (PUBLIC_DIR: ${PUBLIC_DIR}, pathname: ${pathname})`)
      return new Response('Not Found', { status: 404 })
    }

    // Handle POST /admin/login
    if (req.method === 'POST' && pathname === '/admin/login') {
      try {
        const formData = await req.formData()
        const result = await handleAdminLogin(formData)
        return handleRouteResult(result, false, req)
      } catch (error) {
        console.error('Error handling login:', error)
        return new Response('Internal Server Error', { status: 500 })
      }
    }

    // Handle POST /admin/logout
    if (req.method === 'POST' && pathname === '/admin/logout') {
      try {
        const result = await handleAdminLogout()
        return handleRouteResult(result, false, req)
      } catch (error) {
        console.error('Error handling logout:', error)
        return new Response('Internal Server Error', { status: 500 })
      }
    }

    // Handle POST /admin/upload (moved from /upload)
    if (req.method === 'POST' && pathname === '/admin/upload') {
      try {
        const formData = await req.formData()
        const result = await handleUpload(formData, req)
        // Invalidate cache after successful upload
        if (result.status === 200) {
          invalidateCache()
        }
        return handleRouteResult(result, false, req)
      } catch (error) {
        console.error('Error handling upload:', error)
        return new Response('Internal Server Error', { status: 500 })
      }
    }

    // Legacy redirect for POST /upload
    if (req.method === 'POST' && pathname === '/upload') {
      return new Response(null, { 
        status: 301, 
        headers: { 'Location': '/admin/upload' } 
      })
    }

    // Handle POST /create-tag (legacy, now at /admin/create-collection)
    if (req.method === 'POST' && pathname === '/create-tag') {
      try {
        const formData = await req.formData()
        const result = await handleCreateTag(formData, req)
        if (result.status === 200) {
          invalidateCache()
        }
        return handleRouteResult(result, false, req)
      } catch (error) {
        console.error('Error creating tag:', error)
        return new Response('Internal Server Error', { status: 500 })
      }
    }

    // Handle POST /admin/create-collection
    if (req.method === 'POST' && pathname === '/admin/create-collection') {
      try {
        const formData = await req.formData()
        const result = await handleCreateTag(formData, req)
        if (result.status === 200) {
          invalidateCache()
        }
        return handleRouteResult(result, false, req)
      } catch (error) {
        console.error('Error creating collection:', error)
        return new Response('Internal Server Error', { status: 500 })
      }
    }

    // Handle POST /admin/delete-image
    if (req.method === 'POST' && pathname === '/admin/delete-image') {
      try {
        const formData = await req.formData()
        const result = await handleDeleteImage(formData, req)
        if (result.status === 200) {
          invalidateCache()
        }
        return handleRouteResult(result, false, req)
      } catch (error) {
        console.error('Error deleting image:', error)
        return new Response('Internal Server Error', { status: 500 })
      }
    }

    // Handle POST /admin/update-image-tag
    if (req.method === 'POST' && pathname === '/admin/update-image-tag') {
      try {
        const formData = await req.formData()
        const result = await handleUpdateImageTag(formData, req)
        if (result.status === 200) {
          invalidateCache()
        }
        return handleRouteResult(result, false, req)
      } catch (error) {
        console.error('Error updating image tag:', error)
        return new Response('Internal Server Error', { status: 500 })
      }
    }

    // Handle POST /admin/update-collection
    if (req.method === 'POST' && pathname === '/admin/update-collection') {
      try {
        const formData = await req.formData()
        const result = await handleUpdateCollection(formData, req)
        if (result.status === 200) {
          invalidateCache()
        }
        return handleRouteResult(result, false, req)
      } catch (error) {
        console.error('Error updating collection:', error)
        return new Response('Internal Server Error', { status: 500 })
      }
    }

    // Handle POST /admin/delete-collection
    if (req.method === 'POST' && pathname === '/admin/delete-collection') {
      try {
        const formData = await req.formData()
        const result = await handleDeleteCollection(formData, req)
        if (result.status === 200) {
          invalidateCache()
        }
        return handleRouteResult(result, false, req)
      } catch (error) {
        console.error('Error deleting collection:', error)
        return new Response('Internal Server Error', { status: 500 })
      }
    }

    // Handle POST /admin/homepage/update-hero
    if (req.method === 'POST' && pathname === '/admin/homepage/update-hero') {
      try {
        const formData = await req.formData()
        const result = await handleUpdateHeroImage(formData, req)
        if (result.status === 200) {
          invalidateCache()
        }
        return handleRouteResult(result, false, req)
      } catch (error) {
        console.error('Error updating hero image:', error)
        return new Response('Internal Server Error', { status: 500 })
      }
    }

    // Handle POST /admin/homepage/set-hero-url
    if (req.method === 'POST' && pathname === '/admin/homepage/set-hero-url') {
      try {
        const formData = await req.formData()
        const result = await handleSetHeroUrl(formData, req)
        if (result.status === 200) {
          invalidateCache()
        }
        return handleRouteResult(result, false, req)
      } catch (error) {
        console.error('Error setting hero URL:', error)
        return new Response('Internal Server Error', { status: 500 })
      }
    }

    // Handle POST /admin/homepage/add-collection
    if (req.method === 'POST' && pathname === '/admin/homepage/add-collection') {
      try {
        const formData = await req.formData()
        const result = await handleAddHomepageCollection(formData, req)
        if (result.status === 200) {
          invalidateCache()
        }
        return handleRouteResult(result, false, req)
      } catch (error) {
        console.error('Error adding homepage collection:', error)
        return new Response('Internal Server Error', { status: 500 })
      }
    }

    // Handle POST /admin/homepage/remove-collection
    if (req.method === 'POST' && pathname === '/admin/homepage/remove-collection') {
      try {
        const formData = await req.formData()
        const result = await handleRemoveHomepageCollection(formData, req)
        if (result.status === 200) {
          invalidateCache()
        }
        return handleRouteResult(result, false, req)
      } catch (error) {
        console.error('Error removing homepage collection:', error)
        return new Response('Internal Server Error', { status: 500 })
      }
    }

    // Handle POST /admin/homepage/move-collection
    if (req.method === 'POST' && pathname === '/admin/homepage/move-collection') {
      try {
        const formData = await req.formData()
        const result = await handleMoveHomepageCollection(formData, req)
        if (result.status === 200) {
          invalidateCache()
        }
        return handleRouteResult(result, false, req)
      } catch (error) {
        console.error('Error moving homepage collection:', error)
        return new Response('Internal Server Error', { status: 500 })
      }
    }

    // Dynamic routes - pass the request to handle query params and cookies
    // Determine if this is a public/static page for caching purposes
    const isPublicPage = !pathname.startsWith('/admin')
    try {
      const result = await router(pathname, req)
      return handleRouteResult(result, isPublicPage && result.status === 200, req)
    } catch (error) {
      console.error('Error handling request:', error)
      return new Response('Internal Server Error', { status: 500 })
    }
  },
})

console.log(`Server running at http://localhost:${PORT}`)
