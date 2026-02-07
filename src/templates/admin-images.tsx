import { renderHTML } from '../render'
import { Layout } from './layout'
import type { Tag } from '../lib/tags'

interface MediaItem {
  src: string
  name: string
  tagId: string | null
  tagName: string | null
  fullPath: string
  isVideo: boolean
}

interface AdminImagesTemplateProps {
  images: MediaItem[]
  tags: Tag[]
  error?: string
  success?: string
}

export function renderAdminImages({
  images,
  tags,
  error,
  success,
}: AdminImagesTemplateProps): string {
  const hasImages = images.length > 0
  const hasTags = tags.length > 0

  return renderHTML(
    <Layout title="Manage Media" description="View, edit, and delete images and videos">
      <div className="max-w-[1200px] mx-auto px-6 py-24">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Manage Media</h1>
          <a
            href="/admin"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Admin
          </a>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg text-green-800">
            {success}
          </div>
        )}

        <div className="mb-8">
          <a
            href="/admin/upload"
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-background bg-foreground rounded-md hover:opacity-90 transition-opacity"
          >
            <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Upload New Media
          </a>
        </div>

        {!hasImages ? (
          <div className="text-center py-12 border rounded-lg">
            <p className="text-muted-foreground mb-4">No media found</p>
            <a
              href="/admin/upload"
              className="text-sm font-medium text-primary hover:underline"
            >
              Upload your first images or videos
            </a>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {images.map((image) => (
              <div key={image.src} className="border rounded-lg overflow-hidden">
                <div className="aspect-square bg-muted">
                  {image.isVideo ? (
                    <video
                      src={image.src}
                      className="w-full h-full object-cover"
                      preload="metadata"
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <img
                      src={image.src}
                      alt={image.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="p-4">
                  <p className="font-medium truncate mb-1" title={image.name}>
                    {image.name}
                    {image.isVideo && <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded">Video</span>}
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    {image.tagName ? `Collection: ${image.tagName}` : 'Uncategorized'}
                  </p>
                  
                  <div className="space-y-2">
                    <form method="POST" action="/admin/update-image-tag" className="flex gap-2">
                      <input type="hidden" name="imagePath" value={image.fullPath} />
                      <select
                        name="newTagId"
                        className="flex-1 text-sm px-2 py-1 border rounded bg-background"
                        required={hasTags}
                      >
                        <option value="">
                          {hasTags ? 'Move to...' : 'No collections'}
                        </option>
                        {tags.map((tag) => (
                          <option 
                            key={tag.id} 
                            value={tag.id}
                            selected={tag.id === image.tagId}
                          >
                            {tag.title}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="px-3 py-1 text-sm font-medium border rounded hover:bg-accent transition-colors"
                      >
                        Move
                      </button>
                    </form>
                    
                    <div className="flex gap-2">
                      <a
                        href={image.src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-3 py-2 text-sm font-medium text-center border rounded hover:bg-accent transition-colors"
                      >
                        View
                      </a>
                      <form method="POST" action="/admin/delete-image" className="flex-1">
                        <input type="hidden" name="imagePath" value={image.fullPath} />
                        <button
                          type="submit"
                          className="w-full px-3 py-2 text-sm font-medium text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
                          onClick="return confirm('Are you sure you want to delete this media?')"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>,
  )
}
