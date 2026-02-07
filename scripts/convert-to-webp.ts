#!/usr/bin/env bun
/**
 * Batch convert existing images to WebP format
 * Usage: bun scripts/convert-to-webp.ts
 * 
 * This script will:
 * 1. Find all images in public/images (jpg, jpeg, png, gif)
 * 2. Convert them to WebP format using sharp
 * 3. Delete the original files (optional - currently enabled)
 * 4. Skip files that are already WebP or SVG
 */

import { readdir, stat, unlink } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'

const IMAGES_DIR = path.join(process.cwd(), 'public', 'images')

interface ImageFile {
  fullPath: string
  relativePath: string
  fileName: string
  extension: string
}

async function findImages(dir: string, basePath: string = ''): Promise<ImageFile[]> {
  const images: ImageFile[] = []
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif']

  try {
    const entries = await readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      const relativePath = basePath ? path.join(basePath, entry.name) : entry.name

      if (entry.isDirectory()) {
        // Recursively scan subdirectories
        const subImages = await findImages(fullPath, relativePath)
        images.push(...subImages)
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase()
        if (imageExtensions.includes(ext)) {
          images.push({
            fullPath,
            relativePath,
            fileName: entry.name,
            extension: ext,
          })
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error)
  }

  return images
}

async function convertImage(image: ImageFile): Promise<{ success: boolean; newFileName?: string; error?: string }> {
  try {
    const webpFileName = image.fileName.replace(/\.[^.]+$/, '.webp')
    const webpPath = path.join(path.dirname(image.fullPath), webpFileName)

    // Check if WebP version already exists
    try {
      await stat(webpPath)
      console.log(`  ⚠️  Skipping ${image.relativePath} (WebP already exists)`)
      return { success: false, error: 'WebP already exists' }
    } catch {
      // WebP doesn't exist, proceed with conversion
    }

    // Convert to WebP
    await sharp(image.fullPath)
      .webp({ quality: 85, effort: 4 })
      .toFile(webpPath)

    // Delete original file
    await unlink(image.fullPath)

    console.log(`  ✅ Converted: ${image.relativePath} → ${webpFileName}`)
    return { success: true, newFileName: webpFileName }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`  ❌ Failed to convert ${image.relativePath}:`, errorMessage)
    return { success: false, error: errorMessage }
  }
}

async function main() {
  console.log('🔍 Scanning for images to convert...\n')

  const images = await findImages(IMAGES_DIR)

  if (images.length === 0) {
    console.log('No images found to convert.')
    return
  }

  console.log(`Found ${images.length} image(s) to convert:\n`)

  let successCount = 0
  let failCount = 0
  let skipCount = 0

  for (const image of images) {
    const result = await convertImage(image)
    if (result.success) {
      successCount++
    } else if (result.error === 'WebP already exists') {
      skipCount++
    } else {
      failCount++
    }
  }

  console.log('\n📊 Conversion Summary:')
  console.log(`   ✅ Successfully converted: ${successCount}`)
  console.log(`   ⚠️  Skipped (already exists): ${skipCount}`)
  console.log(`   ❌ Failed: ${failCount}`)
  console.log(`   📁 Total processed: ${images.length}`)
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
