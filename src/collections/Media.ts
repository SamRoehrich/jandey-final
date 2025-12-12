import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Determine if we're using Vercel Blob storage
const useVercelBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN)
const isVercel = Boolean(process.env.VERCEL)
const isProduction = process.env.NODE_ENV === 'production'
// Use local storage only in development when not using Vercel Blob
const useLocalStorage = !useVercelBlob && !isVercel && !isProduction

const uploadConfig: CollectionConfig['upload'] = {
  adminThumbnail: 'thumbnail',
  focalPoint: true,
  imageSizes: [
    {
      name: 'thumbnail',
      width: 300,
    },
    {
      name: 'square',
      width: 500,
      height: 500,
    },
    {
      name: 'small',
      width: 600,
    },
    {
      name: 'medium',
      width: 900,
    },
    {
      name: 'large',
      width: 1400,
    },
    {
      name: 'xlarge',
      width: 1920,
    },
    {
      name: 'og',
      width: 1200,
      height: 630,
      crop: 'center',
    },
  ],
}

// Use local storage only in development (non-serverless environments)
// When Vercel Blob is configured, don't set staticDir (the plugin handles storage)
if (useLocalStorage) {
  uploadConfig.staticDir = path.resolve(dirname, '../../public/media')
}
// If Vercel Blob is configured, staticDir should be undefined (handled by plugin)

export const Media: CollectionConfig = {
  slug: 'media',
  folders: true,
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      //required: true,
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
  upload: uploadConfig,
}
