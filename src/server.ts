import { router, handleUpload, handleCreateTag } from './router'

const PORT = process.env.PORT || 3000

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url)
    const path = url.pathname

    // Static files from public directory
    if (
      path.startsWith('/images/') ||
      path === '/styles.css' ||
      path === '/favicon.ico' ||
      path === '/favicon.svg'
    ) {
      const file = Bun.file(`./public${path}`)
      if (await file.exists()) {
        return new Response(file)
      }
      return new Response('Not Found', { status: 404 })
    }

    // Handle POST /upload
    if (req.method === 'POST' && path === '/upload') {
      try {
        const formData = await req.formData()
        const { html, status } = await handleUpload(formData)
        return new Response(html, {
          status,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache',
          },
        })
      } catch (error) {
        console.error('Error handling upload:', error)
        return new Response('Internal Server Error', { status: 500 })
      }
    }

    // Handle POST /create-tag
    if (req.method === 'POST' && path === '/create-tag') {
      try {
        const formData = await req.formData()
        const { html, status } = await handleCreateTag(formData)
        return new Response(html, {
          status,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache',
          },
        })
      } catch (error) {
        console.error('Error creating tag:', error)
        return new Response('Internal Server Error', { status: 500 })
      }
    }

    // Dynamic routes
    try {
      const { html, status } = await router(path)
      return new Response(html, {
        status,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache',
        },
      })
    } catch (error) {
      console.error('Error handling request:', error)
      return new Response('Internal Server Error', { status: 500 })
    }
  },
})

console.log(`Server running at http://localhost:${PORT}`)
