import { renderHTML } from '../render'
import { Layout } from './layout'

export async function renderNotFound(): Promise<string> {
  return renderHTML(
    <Layout title="Page Not Found" description="The page you're looking for doesn't exist.">
      <div className="not-found">
        <h1>404</h1>
        <p>Oops! The page you're looking for doesn't exist.</p>
        <a href="/">Go back home</a>
      </div>
    </Layout>,
  )
}
