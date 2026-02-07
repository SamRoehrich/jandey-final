import { readdir } from 'fs/promises'
import path from 'path'
import { renderHTML } from '../render'
import { Layout } from './layout'
import { getTagById, type Tag } from '../lib/tags'

const IMAGES_DIR = path.join(process.cwd(), 'public/images')

export interface TagMedia {
  src: string
  name: string
  isVideo: boolean
}

export async function getTagImages(tagId: string): Promise<TagMedia[]> {
  const tagFolderPath = path.join(IMAGES_DIR, tagId)
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
  const videoExtensions = ['.mp4', '.webm', '.mov', '.m4v']

  try {
    const files = await readdir(tagFolderPath)
    return files
      .filter((file) => {
        const ext = file.toLowerCase()
        return imageExtensions.some((e) => ext.endsWith(e)) || videoExtensions.some((e) => ext.endsWith(e))
      })
      .map((file) => {
        const ext = file.toLowerCase()
        const isVideo = videoExtensions.some((e) => ext.endsWith(e))
        return {
          src: `/images/${tagId}/${file}`,
          name: file,
          isVideo,
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  } catch {
    return []
  }
}

interface TagPageProps {
  tag: Tag
  images: TagMedia[]
}

export function renderTagPage({ tag, images }: TagPageProps): string {
  const formattedDate = new Date(tag.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return renderHTML(
    <Layout title={tag.title} description={tag.description}>
      <div className="max-w-[1400px] mx-auto px-6 py-24">
        <div className="mb-12">
          <a
            href="/gallery"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6 inline-block"
          >
            ← Back to Gallery
          </a>
          
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">{tag.title}</h1>
          
          <time className="text-muted-foreground" dateTime={tag.date}>
            {formattedDate}
          </time>
          
          {tag.description && (
            <p className="text-muted-foreground mt-4 max-w-2xl">{tag.description}</p>
          )}
        </div>

        {images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {images.map((item) => (
              <a
                key={item.src}
                href={item.src}
                target="_blank"
                rel="noopener noreferrer"
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
            <p className="text-muted-foreground text-lg">No images or videos in this tag yet.</p>
            <a
              href="/admin/upload"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-background bg-foreground rounded-md hover:opacity-90 transition-opacity mt-4"
            >
              Upload Media
            </a>
          </div>
        )}
      </div>
    </Layout>,
  )
}
