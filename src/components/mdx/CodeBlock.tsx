import { codeToHtml } from 'shiki'

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
}

// Cache for highlighted code
const highlightCache = new Map<string, string>()

async function highlightCode(code: string, language: string): Promise<string> {
  const cacheKey = `${language}:${code}`

  if (highlightCache.has(cacheKey)) {
    return highlightCache.get(cacheKey)!
  }

  try {
    const html = await codeToHtml(code, {
      lang: language,
      theme: 'github-dark',
    })
    highlightCache.set(cacheKey, html)
    return html
  } catch {
    // Fallback for unsupported languages
    return `<pre><code>${escapeHtml(code)}</code></pre>`
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function CodeBlock({ code, language = 'text', filename }: CodeBlockProps) {
  // Note: For server-side rendering, we need to handle this synchronously
  // We'll use a simpler approach that works with SSR
  const displayLang = language === 'text' ? '' : language

  return (
    <div className="code-block">
      <div className="code-block-header">
        <span className="code-block-lang">{filename || displayLang}</span>
        <button className="code-block-copy" data-code={code} onClick={() => {}}>
          Copy
        </button>
      </div>
      <pre>
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  )
}

// Async version for when we can use it
export async function CodeBlockAsync({ code, language = 'text', filename }: CodeBlockProps) {
  const highlighted = await highlightCode(code, language)
  const displayLang = language === 'text' ? '' : language

  return (
    <div className="code-block">
      <div className="code-block-header">
        <span className="code-block-lang">{filename || displayLang}</span>
        <button className="code-block-copy" data-code={code}>
          Copy
        </button>
      </div>
      <div dangerouslySetInnerHTML={{ __html: highlighted }} />
    </div>
  )
}
