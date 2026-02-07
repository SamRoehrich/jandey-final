import { readdir, stat } from 'fs/promises'
import path from 'path'
import { renderHTML } from '../render'
import { Layout } from './layout'

const IMAGES_DIR = path.join(process.cwd(), 'public/images')

export interface GalleryImage {
  src: string
  name: string
  tagId?: string
}

async function getAllImagesRecursive(dir: string, basePath: string = ''): Promise<GalleryImage[]> {
  const images: GalleryImage[] = []
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']

  try {
    const entries = await readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      const relativePath = basePath ? path.join(basePath, entry.name) : entry.name

      if (entry.isDirectory()) {
        // Recursively get images from subdirectories (tag folders)
        const subImages = await getAllImagesRecursive(fullPath, relativePath)
        images.push(...subImages)
      } else if (entry.isFile()) {
        // Check if file is an image
        const ext = path.extname(entry.name).toLowerCase()
        if (imageExtensions.includes(ext)) {
          images.push({
            src: `/images/${relativePath}`,
            name: entry.name,
            tagId: basePath || undefined,
          })
        }
      }
    }
  } catch {
    // Directory doesn't exist or can't be read
  }

  return images
}

export async function getGalleryImages(): Promise<GalleryImage[]> {
  const images = await getAllImagesRecursive(IMAGES_DIR)
  // Sort by name for consistent ordering
  return images.sort((a, b) => a.name.localeCompare(b.name))
}

export async function renderGallery(): Promise<string> {
  const images = await getGalleryImages()

  return renderHTML(
    <Layout title="Gallery" description="Browse all uploaded images">
      <div className="max-w-[1400px] mx-auto px-6 py-24">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Gallery</h1>
          <a
            href="/upload"
            className="inline-flex items-center px-4 py-2 text-sm font-medium border rounded-md hover:bg-accent transition-colors"
          >
            Upload Images
          </a>
        </div>

        {images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((image) => (
              <a
                key={image.src}
                href={image.tagId ? `/collection/${image.tagId}` : image.src}
                className="group block aspect-square overflow-hidden rounded-lg border bg-muted"
              >
                <img
                  src={image.src}
                  alt={image.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <p className="text-muted-foreground text-lg mb-6">No images yet.</p>
            <a
              href="/upload"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-background bg-foreground rounded-md hover:opacity-90 transition-opacity"
            >
              Upload Your First Image
            </a>
          </div>
        )}
      </div>
    </Layout>,
  )
}
