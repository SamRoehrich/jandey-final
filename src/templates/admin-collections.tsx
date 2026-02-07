import { renderHTML } from '../render'
import { Layout } from './layout'
import type { Tag } from '../lib/tags'

interface AdminCollectionsTemplateProps {
  tags: Tag[]
  tagCounts: Record<string, number>
  error?: string
  success?: string
  editTagId?: string
}

export function renderAdminCollections({
  tags,
  tagCounts,
  error,
  success,
  editTagId,
}: AdminCollectionsTemplateProps): string {
  const hasTags = tags.length > 0
  const editingTag = editTagId ? tags.find(t => t.id === editTagId) : undefined

  return renderHTML(
    <Layout title="Manage Collections" description="Create, edit, and delete image collections">
      <div className="max-w-[1200px] mx-auto px-6 py-24">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Manage Collections</h1>
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

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {editingTag ? 'Edit Collection' : 'Create New Collection'}
            </h2>
            
            <form
              method="POST"
              action={editingTag ? '/admin/update-collection' : '/admin/create-collection'}
              className="space-y-4"
            >
              {editingTag && (
                <input type="hidden" name="tagId" value={editingTag.id} />
              )}
              
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  Collection Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  defaultValue={editingTag?.title || ''}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  placeholder="e.g., Summer Vacation 2024"
                />
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium mb-2">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  required
                  defaultValue={editingTag?.date || ''}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  defaultValue={editingTag?.description || ''}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  placeholder="Optional description for this collection"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Admin Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  placeholder="Enter admin password"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-background bg-foreground rounded-md hover:opacity-90 transition-opacity"
                >
                  {editingTag ? 'Update Collection' : 'Create Collection'}
                </button>
                
                {editingTag && (
                  <a
                    href="/admin/collections"
                    className="px-6 py-3 text-sm font-medium border rounded-md hover:bg-accent transition-colors"
                  >
                    Cancel
                  </a>
                )}
              </div>
            </form>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Existing Collections</h2>
            
            {!hasTags ? (
              <div className="text-center py-12 border rounded-lg">
                <p className="text-muted-foreground">No collections yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className={`p-4 border rounded-lg ${editingTag?.id === tag.id ? 'border-primary bg-accent/50' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{tag.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {tag.date} • {tagCounts[tag.id] || 0} images
                        </p>
                        {tag.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {tag.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <a
                          href={`/admin/collections?edit=${tag.id}`}
                          className="px-3 py-1 text-sm font-medium border rounded hover:bg-accent transition-colors"
                        >
                          Edit
                        </a>
                        <a
                          href={`/collection/${tag.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 text-sm font-medium border rounded hover:bg-accent transition-colors"
                        >
                          View
                        </a>
                      </div>
                    </div>
                    
                    {editingTag?.id !== tag.id && (
                      <form
                        method="POST"
                        action="/admin/delete-collection"
                        className="mt-3 pt-3 border-t"
                        data-title={tag.title}
                      >
                        <input type="hidden" name="tagId" value={tag.id} />
                        <input type="hidden" name="password" value="" className="delete-password-input" />
                        <button
                          type="submit"
                          className="text-sm text-red-600 hover:text-red-800 font-medium"
                          onClick="const pw = prompt('Enter admin password to delete this collection:'); if (!pw) return false; this.form.querySelector('.delete-password-input').value = pw; const title = this.closest('form').getAttribute('data-title'); return confirm('Are you sure you want to delete the collection ' + title + '? This will also delete all images in this collection.');"
                        >
                          Delete Collection
                        </button>
                      </form>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t">
          <a
            href="/gallery"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            ← View Gallery
          </a>
        </div>
      </div>
    </Layout>,
  )
}
