import { cn } from '@/utilities/ui'
import React from 'react'

type Props = {
  data?: React.ReactNode | string | null
  enableGutter?: boolean
  enableProse?: boolean
} & React.HTMLAttributes<HTMLDivElement>

export default function RichText(props: Props) {
  const { className, data, enableProse = true, enableGutter = true, ...rest } = props

  if (!data) return null

  // If data is a string (markdown content from MDX), render it directly
  if (typeof data === 'string') {
    return (
      <div
        className={cn(
          'payload-richtext',
          {
            container: enableGutter,
            'max-w-none': !enableGutter,
            'mx-auto prose md:prose-md dark:prose-invert': enableProse,
          },
          className,
        )}
        dangerouslySetInnerHTML={{ __html: data }}
        {...rest}
      />
    )
  }

  // If data is already React nodes, render them
  return (
    <div
      className={cn(
        'payload-richtext',
        {
          container: enableGutter,
          'max-w-none': !enableGutter,
          'mx-auto prose md:prose-md dark:prose-invert': enableProse,
        },
        className,
      )}
      {...rest}
    >
      {data}
    </div>
  )
}
