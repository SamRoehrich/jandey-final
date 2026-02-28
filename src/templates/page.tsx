import { renderHTML } from '../render'
import { Layout } from './layout'
import type { Page } from '../content'

export async function renderPage(page: Page, canonicalUrl?: string): Promise<string> {
  const { frontmatter, content } = page

  return renderHTML(
    <Layout title={frontmatter.title} description={frontmatter.description} canonicalUrl={canonicalUrl}>
      <div className="page-header">
        <div className="container">
          <h1>{frontmatter.title}</h1>
          {frontmatter.description && <p>{frontmatter.description}</p>}
        </div>
      </div>

      <section className="section">
        <div className="container container-narrow">
          <div className="prose" dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </section>
    </Layout>,
  )
}
