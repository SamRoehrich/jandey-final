import { readdir } from 'fs/promises'
import path from 'path'
import { renderHTML } from '../render'
import { Layout } from './layout'
import { loadTags, type Tag } from '../lib/tags'
import { getTagImages, type TagMedia } from './tag'
import { ChevronDown } from 'lucide-react'

const IMAGES_DIR = path.join(process.cwd(), 'public/images')

interface CollectionDisplay {
  id: string
  title: string
  description: string
  date: string
  coverImage: string
  imageCount: number
}

async function getCollections(): Promise<CollectionDisplay[]> {
  const tags = await loadTags()
  const collections: CollectionDisplay[] = []

  for (const tag of tags) {
    const images = await getTagImages(tag.id)
    const firstImage = images.find((img) => !img.isVideo)
    if (firstImage) {
      collections.push({
        id: tag.id,
        title: tag.title,
        description: tag.description,
        date: tag.date,
        coverImage: firstImage.src,
        imageCount: images.length,
      })
    }
  }

  // Also scan for folders without tags.json entries
  try {
    const entries = await readdir(IMAGES_DIR, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isDirectory() && !tags.some((t) => t.id === entry.name)) {
        const images = await getTagImages(entry.name)
        const firstImage = images.find((img) => !img.isVideo)
        if (firstImage) {
          collections.push({
            id: entry.name,
            title: entry.name.charAt(0).toUpperCase() + entry.name.slice(1).replace(/-/g, ' '),
            description: '',
            date: '',
            coverImage: firstImage.src,
            imageCount: images.length,
          })
        }
      }
    }
  } catch {
    // Directory might not exist
  }

  // Sort by date descending (newest first), undated at end
  return collections.sort((a, b) => {
    if (!a.date && !b.date) return 0
    if (!a.date) return 1
    if (!b.date) return -1
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
}

// Client-side script for dropdown filtering
const galleryFilterScript = `
document.addEventListener('DOMContentLoaded', function() {
  const dropdown = document.getElementById('collection-dropdown');
  const items = document.querySelectorAll('[data-collection]');
  const dropdownBtn = document.getElementById('dropdown-btn');
  const dropdownMenu = document.getElementById('dropdown-menu');
  
  if (!dropdownBtn || !dropdownMenu) return;

  // Toggle dropdown
  dropdownBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    dropdownMenu.classList.toggle('hidden');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', function() {
    dropdownMenu.classList.add('hidden');
  });

  dropdownMenu.addEventListener('click', function(e) {
    e.stopPropagation();
  });

  // Filter items
  const filterButtons = document.querySelectorAll('[data-filter]');
  filterButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      const filter = btn.getAttribute('data-filter');
      const label = btn.textContent.trim();
      
      // Update button text
      document.getElementById('dropdown-label').textContent = label;
      dropdownMenu.classList.add('hidden');

      // Update active state
      filterButtons.forEach(function(b) { b.classList.remove('font-bold'); });
      btn.classList.add('font-bold');

      // Filter items
      items.forEach(function(item) {
        if (filter === 'all' || item.getAttribute('data-collection') === filter) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
});
`

export async function renderGallery(canonicalUrl?: string): Promise<string> {
  const collections = await getCollections()

  return renderHTML(
    <Layout title="Gallery" description="Browse collections of work by Jandey Shackelford" canonicalUrl={canonicalUrl}>
      <div className="max-w-[1400px] mx-auto px-6 py-24">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Gallery</h1>

          {/* Dropdown filter */}
          {collections.length > 1 && (
            <div className="relative" id="collection-dropdown">
              <button
                id="dropdown-btn"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-md bg-background hover:bg-muted transition-colors"
                type="button"
              >
                <span id="dropdown-label">All Collections</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              <div
                id="dropdown-menu"
                className="hidden absolute right-0 mt-2 w-56 rounded-md border bg-background shadow-lg z-50"
              >
                <div className="py-1">
                  <button
                    data-filter="all"
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors font-bold"
                    type="button"
                  >
                    All Collections
                  </button>
                  {collections.map((collection) => (
                    <button
                      key={collection.id}
                      data-filter={collection.id}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors"
                      type="button"
                    >
                      {collection.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {collections.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map((collection) => (
              <a
                key={collection.id}
                href={`/collection/${collection.id}`}
                className="group block"
                data-collection={collection.id}
              >
                <div className="aspect-square overflow-hidden rounded-lg border bg-muted relative">
                  <img
                    src={collection.coverImage}
                    alt={collection.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Hover overlay with collection name */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                    <div className="text-center translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <h3 className="text-white text-xl font-bold">{collection.title}</h3>
                      <p className="text-white/70 text-sm mt-1">
                        {collection.imageCount} {collection.imageCount === 1 ? 'piece' : 'pieces'}
                      </p>
                    </div>
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-semibold tracking-tight group-hover:text-muted-foreground transition-colors">
                  {collection.title}
                </h3>
                {collection.description && (
                  <p className="text-sm text-muted-foreground mt-1">{collection.description}</p>
                )}
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <p className="text-muted-foreground text-lg mb-6">No collections yet.</p>
          </div>
        )}
      </div>
      <script dangerouslySetInnerHTML={{ __html: galleryFilterScript }} />
    </Layout>,
  )
}

// Re-export for use by other modules
export type { CollectionDisplay }
export interface GalleryMedia {
  src: string
  name: string
  tagId?: string
  isVideo: boolean
}

export async function getGalleryImages(): Promise<GalleryMedia[]> {
  const media: GalleryMedia[] = []
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
  const videoExtensions = ['.mp4', '.webm', '.mov', '.m4v']

  async function getAllMediaRecursive(dir: string, basePath: string = ''): Promise<void> {
    try {
      const entries = await readdir(dir, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        const relativePath = basePath ? path.join(basePath, entry.name) : entry.name

        if (entry.isDirectory()) {
          await getAllMediaRecursive(fullPath, relativePath)
        } else if (entry.isFile()) {
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
  }

  await getAllMediaRecursive(IMAGES_DIR)
  return media.sort((a, b) => a.name.localeCompare(b.name))
}
