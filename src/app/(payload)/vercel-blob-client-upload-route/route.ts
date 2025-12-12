import { getClientUploadRoute } from '@payloadcms/storage-vercel-blob'

export const POST = getClientUploadRoute({
  token: process.env.BLOB_READ_WRITE_TOKEN || '',
  access: async ({ req }) => {
    // Only allow authenticated users to upload
    return !!req.user
  },
})
