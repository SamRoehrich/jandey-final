import type { ReactNode } from 'react'

type CalloutType = 'info' | 'warning' | 'tip' | 'danger'

interface CalloutProps {
  type?: CalloutType
  title?: string
  children: ReactNode
}

const icons: Record<CalloutType, string> = {
  info: 'i',
  warning: '!',
  tip: '*',
  danger: 'x',
}

const defaultTitles: Record<CalloutType, string> = {
  info: 'Info',
  warning: 'Warning',
  tip: 'Tip',
  danger: 'Danger',
}

export function Callout({ type = 'info', title, children }: CalloutProps) {
  const displayTitle = title || defaultTitles[type]
  const icon = icons[type]

  return (
    <div className={`callout callout-${type}`}>
      <div className="callout-title">
        <span className="callout-icon">{icon}</span>
        {displayTitle}
      </div>
      <div className="callout-content">{children}</div>
    </div>
  )
}
