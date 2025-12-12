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

// Media storage is handled by Vercel Blob plugin when enabled,
// otherwise falls back to local filesystem

const uploadConfig: CollectionConfig['upload'] = {
  adminThumbnail: 'thumbnail',
  focalPoint: true,
  // Limit file size to 10MB to prevent upload failures
  uploadSizeLimit: 10485760, // 10MB in bytes
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
  // Use local filesystem as fallback when Vercel Blob is not configured
  staticDir: path.resolve(dirname, '../../public/media'),
  // Restrict to common image types to prevent upload issues
  mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
}

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
