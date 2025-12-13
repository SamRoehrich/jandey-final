import React from 'react'
import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'

type LinkItem = {
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

type CallToActionBlockProps = {
  links?: LinkItem[] | null
  richText?: React.ReactNode | string | null
}

export const CallToActionBlock: React.FC<CallToActionBlockProps> = ({ links, richText }) => {
  return (
    <div className="container">
      <div className="bg-card rounded border-border border p-4 flex flex-col gap-8 md:flex-row md:justify-between md:items-center">
        <div className="max-w-[48rem] flex items-center">
          {richText && <RichText className="mb-0" data={richText} enableGutter={false} />}
        </div>
        <div className="flex flex-col gap-8">
          {(links || []).map(({ link }, i) => {
            return <CMSLink key={i} size="lg" {...link} />
          })}
        </div>
      </div>
    </div>
  )
}
