import { renderHTML } from '../render'
import { Layout } from './layout'
import type { Tag } from '../lib/tags'

interface UploadTemplateProps {
  tags?: Tag[]
  error?: string
  success?: string
  tagError?: string
  tagSuccess?: string
}

export function renderUpload({
  tags = [],
  error,
  success,
  tagError,
  tagSuccess,
}: UploadTemplateProps = {}): string {
  const hasTags = tags.length > 0

  return renderHTML(
    <Layout title="Upload Media" description="Upload images and videos to the gallery">
      <div className="max-w-[800px] mx-auto px-6 py-24">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Upload Media</h1>

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

        <form
          method="POST"
          action="/admin/upload"
          encType="multipart/form-data"
          className="space-y-6"
        >
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="w-full px-3 py-2 border rounded-md bg-background"
              placeholder="Enter upload password"
            />
          </div>

          <div>
            <label htmlFor="tag" className="block text-sm font-medium mb-2">
              Select Tag
            </label>
            <select
              id="tag"
              name="tag"
              required={hasTags}
              className="w-full px-3 py-2 border rounded-md bg-background"
            >
              <option value="">{hasTags ? 'Choose a tag...' : 'No tags available - create one below'}</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.title} ({tag.date})
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-muted-foreground">
              Media will be organized in the selected tag's folder
            </p>
          </div>

          <div>
            <label htmlFor="images" className="block text-sm font-medium mb-2">
              Select Images or Videos
            </label>
            <input
              type="file"
              id="images"
              name="images"
              multiple
              accept="image/*,video/*"
              required
              className="w-full px-3 py-2 border rounded-md bg-background file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-foreground file:text-background hover:file:opacity-90"
            />
            <p className="mt-2 text-sm text-muted-foreground">
              You can select multiple files. Supported formats: JPG, PNG, GIF, WebP, MP4, WebM, MOV
            </p>
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-background bg-foreground rounded-md hover:opacity-90 transition-opacity"
          >
            Upload Media
          </button>
        </form>

        <div className="mt-12 pt-8 border-t">
          <h2 className="text-xl font-semibold mb-6">Create New Tag</h2>

          {tagError && (
            <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg text-red-800">
              {tagError}
            </div>
          )}

          {tagSuccess && (
            <div className="mb-4 p-4 bg-green-100 border border-green-300 rounded-lg text-green-800">
              {tagSuccess}
            </div>
          )}

          <form
            method="POST"
            action="/admin/create-collection"
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="tag-title"
                className="block text-sm font-medium mb-2"
              >
                Collection Title
              </label>
              <input
                type="text"
                id="tag-title"
                name="title"
                required
                className="w-full px-3 py-2 border rounded-md bg-background"
                placeholder="e.g., Summer Vacation 2024"
              />
            </div>

            <div>
              <label
                htmlFor="tag-date"
                className="block text-sm font-medium mb-2"
              >
                Date
              </label>
              <input
                type="date"
                id="tag-date"
                name="date"
                required
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </div>

            <div>
              <label
                htmlFor="tag-description"
                className="block text-sm font-medium mb-2"
              >
                Description
              </label>
              <textarea
                id="tag-description"
                name="description"
                rows={3}
                className="w-full px-3 py-2 border rounded-md bg-background"
                placeholder="Optional description for this collection"
              />
            </div>

            <div>
              <label
                htmlFor="tag-password"
                className="block text-sm font-medium mb-2"
              >
                Admin Password
              </label>
              <input
                type="password"
                id="tag-password"
                name="password"
                required
                className="w-full px-3 py-2 border rounded-md bg-background"
                placeholder="Enter admin password"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium border rounded-md hover:bg-accent transition-colors"
            >
              Create Collection
            </button>
          </form>
        </div>

        <div className="mt-12 pt-8 border-t flex items-center justify-between">
          <a
            href="/admin"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Admin
          </a>
          <a
            href="/gallery"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            View Gallery →
          </a>
        </div>
      </div>
    </Layout>,
  )
}
