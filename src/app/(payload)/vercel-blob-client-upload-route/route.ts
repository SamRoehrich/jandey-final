import { getClientUploadRoute } from '@payloadcms/storage-vercel-blob'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { PayloadRequest } from 'payload'

// Create the handler only if BLOB_READ_WRITE_TOKEN is set
const handler = process.env.BLOB_READ_WRITE_TOKEN
  ? getClientUploadRoute({
      token: process.env.BLOB_READ_WRITE_TOKEN,
      access: async ({ req }) => {
        // Only allow authenticated users to upload
        return !!req.user
      },
    })
  : null

export const POST = async (req: Request) => {
  // Return 404 if Vercel Blob storage is not configured
  if (!handler) {
    return new Response('Vercel Blob storage is not configured', { status: 404 })
  }

  try {
    // Get Payload instance
    const payload = await getPayload({ config: config })

    // Authenticate the user from the request
    const authResult = await payload.auth({
      headers: req.headers,
    })

    if (!authResult.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Create an enhanced request object that extends the original Request
    // with Payload context needed by the handler
    const enhancedReq = Object.create(req) as PayloadRequest & Request

    // Attach Payload context
    enhancedReq.payload = payload
    enhancedReq.user = authResult.user

    // Call the handler with the enhanced request
    return handler(enhancedReq)
  } catch (error) {
    // If there's an error, try to get payload instance for logging
    try {
      const payload = await getPayload({ config: config })
      payload.logger.error({ err: error }, 'Error in Vercel Blob client upload route')
    } catch {
      // If we can't get payload, just log to console
      console.error('Error in Vercel Blob client upload route:', error)
    }

    // Return appropriate error response
    if (error instanceof Error) {
      if (error.message.includes('Forbidden') || error.name === 'Forbidden') {
        return new Response('Forbidden', { status: 403 })
      }
      if (error.message.includes('Unauthorized')) {
        return new Response('Unauthorized', { status: 401 })
      }
      return new Response(error.message, { status: 500 })
    }

    return new Response('Internal server error', { status: 500 })
  }
}
