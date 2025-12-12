import type { Block, Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

const slideFields: Field[] = [
  {
    name: 'richText',
    type: 'richText',
    editor: lexicalEditor({
      features: ({ rootFeatures }) => {
        return [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ]
      },
    }),
    label: 'Content',
  },
  {
    name: 'media',
    type: 'upload',
    relationTo: 'media',
    label: 'Image',
  },
]

export const Carousel: Block = {
  slug: 'carousel',
  interfaceName: 'CarouselBlock',
  fields: [
    {
      name: 'slides',
      type: 'array',
      required: true,
      minRows: 1,
      admin: {
        initCollapsed: true,
      },
      fields: slideFields,
    },
    {
      name: 'showNavigation',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show Navigation Arrows',
    },
    {
      name: 'autoplay',
      type: 'checkbox',
      defaultValue: false,
      label: 'Autoplay',
    },
    {
      name: 'autoplayInterval',
      type: 'number',
      defaultValue: 5000,
      label: 'Autoplay Interval (ms)',
      admin: {
        condition: (_data, siblingData) => {
          return Boolean(siblingData?.autoplay)
        },
      },
    },
  ],
}

