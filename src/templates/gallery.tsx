import { readdir, stat } from 'fs/promises'
import path from 'path'
import { renderHTML } from '../render'
import { Layout } from './layout'

const IMAGES_DIR = path.join(process.cwd(), 'public/images')

export interface GalleryMedia {
  src: string
  name: string
  tagId?: string
  isVideo: boolean
}

async function getAllMediaRecursive(dir: string, basePath: string = ''): Promise<GalleryMedia[]> {
  const media: GalleryMedia[] = []
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
  const videoExtensions = ['.mp4', '.webm', '.mov', '.m4v']

  try {
    const entries = await readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      const relativePath = basePath ? path.join(basePath, entry.name) : entry.name

      if (entry.isDirectory()) {
        // Recursively get media from subdirectories (tag folders)
        const subMedia = await getAllMediaRecursive(fullPath, relativePath)
        media.push(...subMedia)
      } else if (entry.isFile()) {
        // Check if file is an image or video
        const ext = path.extname(entry.name).toLowerCase()
        const isImage = imageExtensions.includes(ext)
        const isVideo = videoExtensions.includes(ext)
        
        if (isImage || isVideo) {
          media.push({
            src: `/images/${relativePath}`,
            name: entry.name,
            tagId: basePath || undefined,
            isVideo,
          })
        }
      }
    }
  } catch {
    // Directory doesn't exist or can't be read
  }

  return media
}

export async function getGalleryImages(): Promise<GalleryMedia[]> {
  const media = await getAllMediaRecursive(IMAGES_DIR)
  // Sort by name for consistent ordering
  return media.sort((a, b) => a.name.localeCompare(b.name))
}

export async function renderGallery(): Promise<string> {
  const media = await getGalleryImages()

  return renderHTML(
    <Layout title="Gallery" description="Browse all uploaded images and videos">
      <div className="max-w-[1400px] mx-auto px-6 py-24">
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-12">Gallery</h1>

        {media.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {media.map((item) => (
              <a
                key={item.src}
                href={item.tagId ? `/collection/${item.tagId}` : item.src}
                className="group block aspect-square overflow-hidden rounded-lg border bg-muted relative"
              >
                {item.isVideo ? (
                  <video
                    src={item.src}
                    className="h-full w-full object-cover"
                    preload="metadata"
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <img
                    src={item.src}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                )}
                {item.isVideo && (
                  <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 text-xs rounded flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                    Video
                  </div>
                )}
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <p className="text-muted-foreground text-lg mb-6">No media yet.</p>
            <a
              href="/admin/upload"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-background bg-foreground rounded-md hover:opacity-90 transition-opacity"
            >
              Upload Your First Image or Video
            </a>
          </div>
        )}
      </div>
    </Layout>,
  )
}
