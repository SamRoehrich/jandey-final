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

const INITIAL_BATCH_SIZE = 20

export async function renderGallery(): Promise<string> {
  const images = await getGalleryImages()

  // Split images: first 20 for server-side rendering, rest for virtual scroll
  const initialImages = images.slice(0, INITIAL_BATCH_SIZE)
  const remainingImages = images.slice(INITIAL_BATCH_SIZE)
  const hasMoreImages = remainingImages.length > 0

  // Only pass remaining images to virtual scroll script
  const remainingImagesJson = hasMoreImages 
    ? JSON.stringify(remainingImages).replace(/</g, '\\u003c').replace(/>/g, '\\u003e')
    : null

  return renderHTML(
    <Layout title="Gallery" description="Browse all uploaded images">
      <div className="max-w-[1400px] mx-auto px-6 py-24">
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-12">Gallery</h1>

        {images.length > 0 ? (
          <>
            {/* Grid with first 20 images rendered server-side */}
            <div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              data-gallery-grid
              data-images={remainingImagesJson}
            >
              {initialImages.map((image) => (
                <a
                  key={image.src}
                  href={image.tagId ? `/collection/${image.tagId}` : image.src}
                  className="gallery-item group block aspect-square overflow-hidden rounded-lg border bg-muted"
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
            {/* Loading indicator - only show if there are more images */}
            {hasMoreImages && (
              <div id="gallery-loading" className="text-center py-8 text-muted-foreground">
                Loading more images...
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24">
            <p className="text-muted-foreground text-lg mb-6">No images yet.</p>
            <a
              href="/admin/upload"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-background bg-foreground rounded-md hover:opacity-90 transition-opacity"
            >
              Upload Your First Image
            </a>
          </div>
        )}
      </div>
      {/* Virtual scrolling script - only load when there are remaining images */}
      {hasMoreImages && <script src="/js/gallery-virtual-scroll.js" defer />}
    </Layout>,
  )
}
