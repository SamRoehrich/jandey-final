import { readdir } from 'fs/promises'
import path from 'path'
import { renderHTML } from '../render'
import { Layout } from './layout'
import { getTagById, type Tag } from '../lib/tags'

const IMAGES_DIR = path.join(process.cwd(), 'public/images')

export interface TagImage {
  src: string
  name: string
}

export async function getTagImages(tagId: string): Promise<TagImage[]> {
  const tagFolderPath = path.join(IMAGES_DIR, tagId)
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']

  try {
    const files = await readdir(tagFolderPath)
    return files
      .filter((file) => imageExtensions.some((ext) => file.toLowerCase().endsWith(ext)))
      .map((file) => ({
        src: `/images/${tagId}/${file}`,
        name: file,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  } catch {
    return []
  }
}

interface TagPageProps {
  tag: Tag
  images: TagImage[]
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
            {images.map((image) => (
              <a
                key={image.src}
                href={image.src}
                target="_blank"
                rel="noopener noreferrer"
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
            <p className="text-muted-foreground text-lg">No images in this tag yet.</p>
            <a
              href="/admin/upload"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-background bg-foreground rounded-md hover:opacity-90 transition-opacity mt-4"
            >
              Upload Images
            </a>
          </div>
        )}
      </div>
    </Layout>,
  )
}
