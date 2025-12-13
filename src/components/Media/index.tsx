import React, { Fragment } from 'react'

import type { Props } from './types'

import { ImageMedia } from './ImageMedia'

export const Media: React.FC<Props> = (props) => {
  const { className, htmlElement = 'div', src } = props

  const Tag = htmlElement || Fragment

  if (!src) {
    return null
  }

  return (
    <Tag
      {...(htmlElement !== null
        ? {
            className,
          }
        : {})}
    >
      <ImageMedia {...props} />
    </Tag>
  )
}
