import { renderHTML } from '../render'
import { Layout } from './layout'
import type { Tag } from '../lib/tags'
import type { HomepageConfig } from '../lib/homepage'

interface AdminHomepageTemplateProps {
  config: HomepageConfig
  allCollections: (Tag & { coverImage?: string; imageCount: number })[]
  error?: string
  success?: string
}

export function renderAdminHomepage({
  config,
  allCollections,
  error,
  success,
}: AdminHomepageTemplateProps): string {
  const featuredIds = config.featuredCollections
  const featured = featuredIds
    .map((id) => allCollections.find((c) => c.id === id))
    .filter(Boolean) as (Tag & { coverImage?: string; imageCount: number })[]
  const available = allCollections.filter((c) => !featuredIds.includes(c.id))

  return renderHTML(
    <Layout title="Manage Homepage" description="Configure the homepage hero image and featured collections">
      <div className="max-w-[1200px] mx-auto px-6 py-24">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Manage Homepage</h1>
          <a
            href="/admin"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Back to Admin
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

        {/* Hero Image Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Hero Image</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <div className="aspect-video overflow-hidden rounded-lg border bg-muted mb-4">
                <img
                  src={config.heroImage}
                  alt="Current hero image"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Current: <code className="bg-muted px-1 py-0.5 rounded text-xs">{config.heroImage}</code>
              </p>
            </div>
            <div>
              <form
                method="POST"
                action="/admin/homepage/update-hero"
                encType="multipart/form-data"
                className="space-y-4"
              >
                <div>
                  <label htmlFor="heroImage" className="block text-sm font-medium mb-2">
                    Upload New Hero Image
                  </label>
                  <input
                    type="file"
                    id="heroImage"
                    name="heroImage"
                    accept="image/*"
                    required
                    className="w-full px-3 py-2 border rounded-md bg-background file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-foreground file:text-background hover:file:opacity-90"
                  />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Recommended: landscape image, at least 1920px wide. Will be converted to WebP.
                  </p>
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-background bg-foreground rounded-md hover:opacity-90 transition-opacity"
                >
                  Update Hero Image
                </button>
              </form>

              <div className="mt-6 pt-6 border-t">
                <p className="text-sm font-medium mb-2">Or use an existing image URL:</p>
                <form
                  method="POST"
                  action="/admin/homepage/set-hero-url"
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    name="heroImageUrl"
                    required
                    className="flex-1 px-3 py-2 border rounded-md bg-background text-sm"
                    placeholder="/images/collection-name/image.webp"
                    defaultValue={config.heroImage}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-accent transition-colors"
                  >
                    Set URL
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        <hr className="mb-12" />

        {/* Featured Collections Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Featured Collections on Homepage</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Choose which collections appear on the homepage and in what order. These are the clickable images visitors see below the hero.
          </p>

          {/* Currently featured */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-3">
              Currently Featured ({featured.length})
            </h3>

            {featured.length === 0 ? (
              <div className="text-center py-8 border rounded-lg border-dashed">
                <p className="text-muted-foreground">
                  No collections featured yet. Add some from the list below.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {featured.map((collection, index) => (
                  <div
                    key={collection.id}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded overflow-hidden bg-muted flex-shrink-0">
                      {collection.coverImage ? (
                        <img
                          src={collection.coverImage}
                          alt={collection.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          No img
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{collection.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {collection.imageCount} {collection.imageCount === 1 ? 'piece' : 'pieces'}
                      </p>
                    </div>

                    {/* Order position */}
                    <span className="text-sm text-muted-foreground font-mono w-8 text-center flex-shrink-0">
                      #{index + 1}
                    </span>

                    {/* Move up/down */}
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      {index > 0 && (
                        <form method="POST" action="/admin/homepage/move-collection">
                          <input type="hidden" name="collectionId" value={collection.id} />
                          <input type="hidden" name="direction" value="up" />
                          <button
                            type="submit"
                            className="px-2 py-1 text-xs font-medium border rounded hover:bg-accent transition-colors"
                            title="Move up"
                          >
                            &uarr;
                          </button>
                        </form>
                      )}
                      {index < featured.length - 1 && (
                        <form method="POST" action="/admin/homepage/move-collection">
                          <input type="hidden" name="collectionId" value={collection.id} />
                          <input type="hidden" name="direction" value="down" />
                          <button
                            type="submit"
                            className="px-2 py-1 text-xs font-medium border rounded hover:bg-accent transition-colors"
                            title="Move down"
                          >
                            &darr;
                          </button>
                        </form>
                      )}
                    </div>

                    {/* Remove */}
                    <form method="POST" action="/admin/homepage/remove-collection" className="flex-shrink-0">
                      <input type="hidden" name="collectionId" value={collection.id} />
                      <button
                        type="submit"
                        className="px-3 py-1 text-sm font-medium text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
                      >
                        Remove
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available to add */}
          <div>
            <h3 className="text-lg font-medium mb-3">
              Available Collections ({available.length})
            </h3>

            {available.length === 0 ? (
              <div className="text-center py-8 border rounded-lg border-dashed">
                <p className="text-muted-foreground">
                  {allCollections.length === 0
                    ? 'No collections exist yet. Create some in Manage Collections first.'
                    : 'All collections are already featured on the homepage.'}
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {available.map((collection) => (
                  <div
                    key={collection.id}
                    className="flex items-center gap-3 p-3 border rounded-lg"
                  >
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
                      {collection.coverImage ? (
                        <img
                          src={collection.coverImage}
                          alt={collection.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          No img
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{collection.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {collection.imageCount} {collection.imageCount === 1 ? 'piece' : 'pieces'}
                      </p>
                    </div>

                    {/* Add button */}
                    <form method="POST" action="/admin/homepage/add-collection" className="flex-shrink-0">
                      <input type="hidden" name="collectionId" value={collection.id} />
                      <button
                        type="submit"
                        className="px-3 py-1 text-sm font-medium border rounded hover:bg-accent transition-colors"
                      >
                        + Add
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <div className="mt-12 pt-8 border-t flex items-center justify-between">
          <a
            href="/admin"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Back to Admin
          </a>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Preview Homepage &rarr;
          </a>
        </div>
      </div>
    </Layout>,
  )
}
