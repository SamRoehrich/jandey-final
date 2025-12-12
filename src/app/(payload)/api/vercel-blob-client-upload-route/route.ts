import { getClientUploadRoute } from '@payloadcms/storage-vercel-blob'
import config from '@payload-config'

// Only create the route handler if BLOB_READ_WRITE_TOKEN is set
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  // Return a 404 handler if the token is not set
  export async function POST() {
    return new Response('Vercel Blob storage is not configured', { status: 404 })
  }
} else {
  const handler = getClientUploadRoute({
    token: process.env.BLOB_READ_WRITE_TOKEN,
    access: async ({ req }) => {
      // Only allow authenticated users to upload
      return !!req.user
    },
  })

  // Wrap the handler to ensure it receives the config
  export const POST = async (req: Request) => {
    // The handler expects a PayloadRequest, which should be compatible
    // with Next.js Request when used with Payload's Next.js integration
    return handler(req as any)
  }
}

