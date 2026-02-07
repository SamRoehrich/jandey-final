import { renderHTML } from '../render'
import { Layout } from './layout'

interface AdminTemplateProps {
  isAuthenticated: boolean
  error?: string
}

export function renderAdmin({ isAuthenticated, error }: AdminTemplateProps): string {
  if (!isAuthenticated) {
    return renderHTML(
      <Layout title="Admin Login" description="Admin authentication required">
        <div className="max-w-[400px] mx-auto px-6 py-24">
          <h1 className="text-2xl font-bold tracking-tight mb-6 text-center">Admin Login</h1>
          
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg text-red-800">
              {error}
            </div>
          )}
          
          <form method="POST" action="/admin/login" className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                required
                autoComplete="username"
                className="w-full px-3 py-2 border rounded-md bg-background"
                placeholder="Enter username"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                autoComplete="current-password"
                className="w-full px-3 py-2 border rounded-md bg-background"
                placeholder="Enter password"
              />
            </div>
            
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-background bg-foreground rounded-md hover:opacity-90 transition-opacity"
            >
              Login
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <a
              href="/gallery"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Gallery
            </a>
          </div>
        </div>
      </Layout>,
    )
  }

  return renderHTML(
    <Layout title="Admin Dashboard" description="Site administration">
      <div className="max-w-[1200px] mx-auto px-6 py-24">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <form method="POST" action="/admin/logout">
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-accent transition-colors"
            >
              Logout
            </button>
          </form>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <a
            href="/admin/images"
            className="block p-6 border rounded-lg hover:border-foreground hover:shadow-md transition-all group"
          >
            <h2 className="text-xl font-semibold mb-2 group-hover:text-primary">Manage Images</h2>
            <p className="text-sm text-muted-foreground mb-4">
              View, upload, edit tags, and delete images
            </p>
            <div className="flex items-center text-sm font-medium">
              Go to Images 
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>
          
          <a
            href="/admin/collections"
            className="block p-6 border rounded-lg hover:border-foreground hover:shadow-md transition-all group"
          >
            <h2 className="text-xl font-semibold mb-2 group-hover:text-primary">Manage Collections</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Create, edit, and delete image collections (tags)
            </p>
            <div className="flex items-center text-sm font-medium">
              Go to Collections
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>
          
          <a
            href="/admin/upload"
            className="block p-6 border rounded-lg hover:border-foreground hover:shadow-md transition-all group"
          >
            <h2 className="text-xl font-semibold mb-2 group-hover:text-primary">Upload Images</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Upload new images to collections
            </p>
            <div className="flex items-center text-sm font-medium">
              Go to Upload
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>
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
