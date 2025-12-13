import type { StaticImageData } from 'next/image'

import { cn } from '@/utilities/ui'
import React from 'react'
import Image from 'next/image'

type Props = {
  className?: string
  imgClassName?: string
  media?: string // Image path string
  staticImage?: StaticImageData
  caption?: string
  captionClassName?: string
  enableGutter?: boolean
  disableInnerContainer?: boolean
}

export const MediaBlock: React.FC<Props> = (props) => {
  const {
    captionClassName,
    className,
    enableGutter = true,
    imgClassName,
    media,
    staticImage,
    caption,
    disableInnerContainer,
  } = props

  const imageSrc = media || staticImage

  return (
    <div
      className={cn(
        '',
        {
          container: enableGutter,
        },
        className,
      )}
    >
      {imageSrc && (
        <div className="relative aspect-video">
          <Image
            src={imageSrc}
            alt=""
            fill
            className={cn('border border-border rounded-[0.8rem] object-cover', imgClassName)}
          />
        </div>
      )}
      {caption && (
        <div
          className={cn(
            'mt-6',
            {
              container: !disableInnerContainer,
            },
            captionClassName,
          )}
        >
          <p className="text-sm text-muted-foreground">{caption}</p>
        </div>
      )}
    </div>
  )
}
