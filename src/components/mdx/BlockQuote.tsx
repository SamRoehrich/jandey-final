import type { ReactNode } from 'react'

interface BlockQuoteProps {
  children: ReactNode
  cite?: string
}

export function BlockQuote({ children, cite }: BlockQuoteProps) {
  return (
    <blockquote className="blockquote">
      {children}
      {cite && <cite>{cite}</cite>}
    </blockquote>
  )
}
