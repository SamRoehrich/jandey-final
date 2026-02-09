import { renderHTML } from '../render'
import { Layout } from './layout'
import { Button } from '../components/ui/button'
import { Separator } from '../components/ui/separator'
import { ArrowRight } from 'lucide-react'
import { loadTags, type Tag } from '../lib/tags'
import { loadHomepageConfig } from '../lib/homepage'
import { getTagImages } from './tag'
import { readdir } from 'fs/promises'
import path from 'path'

const IMAGES_DIR = path.join(process.cwd(), 'public/images')

interface CollectionWithCover {
  id: string
  title: string
  description: string
  coverImage: string
}

async function getCollectionCover(collectionId: string): Promise<CollectionWithCover | null> {
  const tags = await loadTags()
  const tag = tags.find((t) => t.id === collectionId)
  const images = await getTagImages(collectionId)
  const firstImage = images.find((img) => !img.isVideo)

  if (!firstImage) return null

  return {
    id: collectionId,
    title: tag?.title || collectionId.charAt(0).toUpperCase() + collectionId.slice(1).replace(/-/g, ' '),
    description: tag?.description || '',
    coverImage: firstImage.src,
  }
}

async function getFeaturedCollections(): Promise<CollectionWithCover[]> {
  const config = await loadHomepageConfig()

  // If there are featured collections configured, use them in order
  if (config.featuredCollections.length > 0) {
    const collections: CollectionWithCover[] = []
    for (const id of config.featuredCollections) {
      const collection = await getCollectionCover(id)
      if (collection) {
        collections.push(collection)
      }
    }
    return collections
  }

  // Fallback: show all collections that have images (auto-discover)
  const tags = await loadTags()
  const collections: CollectionWithCover[] = []

  for (const tag of tags) {
    const collection = await getCollectionCover(tag.id)
    if (collection) collections.push(collection)
  }

  // Also scan for folders not in tags.json
  try {
    const entries = await readdir(IMAGES_DIR, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isDirectory() && !tags.some((t) => t.id === entry.name)) {
        const collection = await getCollectionCover(entry.name)
        if (collection) collections.push(collection)
      }
    }
  } catch {
    // Directory might not exist
  }

  return collections
}

export async function renderHome(): Promise<string> {
  const config = await loadHomepageConfig()
  const collections = await getFeaturedCollections()

  return renderHTML(
    <Layout
      title="Home"
      description="Welcome to Jandey Shackelford's website - art, ideas, and creative work."
    >
      {/* Hero Section */}
      <section className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
        <div className="flex flex-col justify-center px-6 lg:px-10 py-24 lg:py-32 pt-32 lg:pt-32">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tighter leading-[0.9] uppercase">
            <span className="block">Jandey</span>
            <span className="block">Shackelford</span>
            <span className="block text-muted-foreground">Art</span>
            <span className="block text-muted-foreground">&amp; Ideas</span>
          </h1>
          <p className="mt-8 text-lg text-muted-foreground max-w-md leading-relaxed">
            Exploring emotion, sharing stories, and discovering new perspectives through thoughtful
            art.
          </p>
        </div>
        <div className="relative h-[50vh] lg:h-auto">
          <img
            src={config.heroImage}
            alt="Hero background"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Collections Section - Clickable images linking to gallery collections */}
      <section className="py-24 lg:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">Collections</h2>
          </div>

          {collections.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {collections.map((collection) => (
                <a
                  key={collection.id}
                  href={`/collection/${collection.id}`}
                  className="group block"
                >
                  <div className="aspect-[3/4] overflow-hidden rounded-lg border bg-muted relative">
                    <img
                      src={collection.coverImage}
                      alt={collection.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    {/* Hover overlay with collection name */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end">
                      <div className="p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <h3 className="text-white text-xl font-bold">{collection.title}</h3>
                        {collection.description && (
                          <p className="text-white/80 text-sm mt-1">{collection.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight group-hover:text-muted-foreground transition-colors">
                    {collection.title}
                  </h3>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No collections yet. Check back soon!</p>
          )}

          <div className="mt-12">
            <Button variant="outline" asChild>
              <a href="/gallery" className="inline-flex items-center gap-2">
                View all collections
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      <Separator className="max-w-[1400px] mx-auto" />

      {/* About Preview Section */}
      <section className="py-24 lg:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-2xl lg:text-3xl font-bold tracking-tight mb-6">The Process</h3>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                Every story begins with curiosity. I explore the intersection of technology,
                culture, and human experience, crafting narratives that illuminate the world around
                us.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Through careful research and thoughtful reflection, each piece aims to offer new
                perspectives and meaningful insights.
              </p>
              <Button variant="outline" asChild>
                <a href="/about" className="inline-flex items-center gap-2">
                  Find out more
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>,
  )
}
