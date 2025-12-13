import type { ComponentType, ReactNode } from 'react'
import { CodeBlock } from './CodeBlock'
import { Callout } from './Callout'
import { ImageGallery } from './ImageGallery'
import { YouTube } from './YouTube'
import { BlockQuote } from './BlockQuote'

type MDXComponents = {
  [key: string]: ComponentType<any>
}

// Wrapper for pre elements to use our CodeBlock
function Pre({ children, ...props }: { children: ReactNode }) {
  // Extract code element props
  if (children && typeof children === 'object' && 'props' in children) {
    const codeElement = children as { props: { className?: string; children?: string } }
    const className = codeElement.props?.className || ''
    const code = codeElement.props?.children || ''
    const language = className.replace('language-', '') || 'text'

    return <CodeBlock code={String(code).trim()} language={language} />
  }

  return <pre {...props}>{children}</pre>
}

// Simple components for standard markdown elements
function Paragraph({ children }: { children: ReactNode }) {
  return <p>{children}</p>
}

function Heading1({ children }: { children: ReactNode }) {
  return <h1>{children}</h1>
}

function Heading2({ children }: { children: ReactNode }) {
  return <h2>{children}</h2>
}

function Heading3({ children }: { children: ReactNode }) {
  return <h3>{children}</h3>
}

function Heading4({ children }: { children: ReactNode }) {
  return <h4>{children}</h4>
}

function Link({ href, children }: { href?: string; children: ReactNode }) {
  return <a href={href}>{children}</a>
}

function Image({ src, alt }: { src?: string; alt?: string }) {
  return <img src={src} alt={alt || ''} />
}

function UnorderedList({ children }: { children: ReactNode }) {
  return <ul>{children}</ul>
}

function OrderedList({ children }: { children: ReactNode }) {
  return <ol>{children}</ol>
}

function ListItem({ children }: { children: ReactNode }) {
  return <li>{children}</li>
}

function HorizontalRule() {
  return <hr />
}

function Strong({ children }: { children: ReactNode }) {
  return <strong>{children}</strong>
}

function Emphasis({ children }: { children: ReactNode }) {
  return <em>{children}</em>
}

/**
 * Get all MDX components for rendering
 */
export async function getMDXComponents(): Promise<MDXComponents> {
  return {
    // Standard HTML element overrides
    p: Paragraph,
    h1: Heading1,
    h2: Heading2,
    h3: Heading3,
    h4: Heading4,
    a: Link,
    img: Image,
    ul: UnorderedList,
    ol: OrderedList,
    li: ListItem,
    hr: HorizontalRule,
    strong: Strong,
    em: Emphasis,
    pre: Pre,
    blockquote: BlockQuote,

    // Custom components available in MDX
    Callout,
    ImageGallery,
    YouTube,
    CodeBlock,
  }
}
