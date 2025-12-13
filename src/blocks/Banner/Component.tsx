import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

type BannerBlockProps = {
  content?: React.ReactNode | string | null
  style?: 'info' | 'warning' | 'error' | 'success' | null
  className?: string
}

export const BannerBlock: React.FC<BannerBlockProps> = ({ className, content, style }) => {
  return (
    <div className={cn('mx-auto my-8 w-full', className)}>
      <div
        className={cn('border py-3 px-6 flex items-center rounded', {
          'border-border bg-card': style === 'info',
          'border-error bg-error/30': style === 'error',
          'border-success bg-success/30': style === 'success',
          'border-warning bg-warning/30': style === 'warning',
        })}
      >
        <RichText data={content} enableGutter={false} enableProse={false} />
      </div>
    </div>
  )
}
