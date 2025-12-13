import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'

type ColumnSize = 'full' | 'half' | 'oneThird' | 'twoThirds'

type Column = {
  size?: ColumnSize | null
  richText?: React.ReactNode | string | null
  enableLink?: boolean | null
  link?: {
    type?: 'custom' | 'reference' | null
    url?: string | null
    label?: string | null
    newTab?: boolean | null
    reference?: {
      relationTo: 'pages' | 'posts'
      value: { slug?: string } | string | number
    } | null
  }
}

type ContentBlockProps = {
  columns?: Column[] | null
}

export const ContentBlock: React.FC<ContentBlockProps> = (props) => {
  const { columns } = props

  const colsSpanClasses: Record<ColumnSize, string> = {
    full: '12',
    half: '6',
    oneThird: '4',
    twoThirds: '8',
  }

  return (
    <div className="container my-16">
      <div className="grid grid-cols-4 lg:grid-cols-12 gap-y-8 gap-x-16">
        {columns &&
          columns.length > 0 &&
          columns.map((col, index) => {
            const { enableLink, link, richText, size } = col

            return (
              <div
                className={cn(`col-span-4 lg:col-span-${colsSpanClasses[size || 'full']}`, {
                  'md:col-span-2': size !== 'full',
                })}
                key={index}
              >
                {richText && <RichText data={richText} enableGutter={false} />}

                {enableLink && <CMSLink {...link} />}
              </div>
            )
          })}
      </div>
    </div>
  )
}
