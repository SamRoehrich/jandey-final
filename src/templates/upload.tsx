import { renderHTML } from '../render'
import { Layout } from './layout'

interface UploadTemplateProps {
  error?: string
  success?: string
}

export function renderUpload({ error, success }: UploadTemplateProps = {}): string {
  return renderHTML(
    <Layout
      title="Upload Images"
      description="Upload images to the gallery"
    >
      <div className="max-w-[800px] mx-auto px-6 py-24">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Upload Images</h1>
        
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
        
        <form method="POST" action="/upload" encType="multipart/form-data" className="space-y-6">
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
            <label htmlFor="images" className="block text-sm font-medium mb-2">
              Select Images
            </label>
            <input
              type="file"
              id="images"
              name="images"
              multiple
              accept="image/*"
              required
              className="w-full px-3 py-2 border rounded-md bg-background file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-foreground file:text-background hover:file:opacity-90"
            />
            <p className="mt-2 text-sm text-muted-foreground">
              You can select multiple images. Supported formats: JPG, PNG, GIF, WebP
            </p>
          </div>
          
          <button
            type="submit"
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-background bg-foreground rounded-md hover:opacity-90 transition-opacity"
          >
            Upload Images
          </button>
        </form>
        
        <div className="mt-12 pt-8 border-t">
          <a href="/gallery" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            ← View Gallery
          </a>
        </div>
      </div>
    </Layout>,
  )
}
