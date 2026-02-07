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
  type RouteResult 
} from './router'
import path from 'path'

const PORT = process.env.PORT || 3000
const PUBLIC_DIR = path.join(process.cwd(), 'public')

async function handleRouteResult(result: RouteResult): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-cache',
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
      pathname === '/styles.css' ||
      pathname === '/favicon.ico' ||
      pathname === '/favicon.svg'
    ) {
      const filePath = path.join(PUBLIC_DIR, pathname)
      const file = Bun.file(filePath)
      
      if (await file.exists()) {
        const fileExtension = filePath.split('.').pop()?.toLowerCase()
        
        // Set appropriate content type for JS files
        let contentType = file.type
        if (fileExtension === 'js') {
          contentType = 'application/javascript'
        }
        
        return new Response(file, {
          headers: {
            'Content-Type': contentType || 'application/octet-stream',
          }
        })
      }
      console.error(`Static file not found: ${filePath}`)
      return new Response('Not Found', { status: 404 })
    }

    // Handle POST /admin/login
    if (req.method === 'POST' && pathname === '/admin/login') {
      try {
        const formData = await req.formData()
        const result = await handleAdminLogin(formData)
        return handleRouteResult(result)
      } catch (error) {
        console.error('Error handling login:', error)
        return new Response('Internal Server Error', { status: 500 })
      }
    }

    // Handle POST /admin/logout
    if (req.method === 'POST' && pathname === '/admin/logout') {
      try {
        const result = await handleAdminLogout()
        return handleRouteResult(result)
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
        return handleRouteResult(result)
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
        return handleRouteResult(result)
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
        return handleRouteResult(result)
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
        return handleRouteResult(result)
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
        return handleRouteResult(result)
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
        return handleRouteResult(result)
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
        return handleRouteResult(result)
      } catch (error) {
        console.error('Error deleting collection:', error)
        return new Response('Internal Server Error', { status: 500 })
      }
    }

    // Dynamic routes - pass the request to handle query params and cookies
    try {
      const result = await router(pathname, req)
      return handleRouteResult(result)
    } catch (error) {
      console.error('Error handling request:', error)
      return new Response('Internal Server Error', { status: 500 })
    }
  },
})

console.log(`Server running at http://localhost:${PORT}`)
