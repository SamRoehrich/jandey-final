'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export interface HighImpactHeroProps {
  title?: string
  description?: string
  image?: string
  links?: Array<{
    label: string
    href: string
  }>
}

export const HighImpactHero: React.FC<HighImpactHeroProps> = ({
  title,
  description,
  image,
  links,
}) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('dark')
  })

  return (
    <div
      className="relative -mt-[10.4rem] flex items-center justify-center text-white"
      data-theme="dark"
    >
      <div className="container mb-8 z-10 relative flex items-center justify-center">
        <div className="max-w-[36.5rem] md:text-center">
          {title && <h1 className="mb-4 text-4xl md:text-5xl lg:text-6xl font-bold">{title}</h1>}
          {description && <p className="mb-6 text-lg">{description}</p>}
          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex md:justify-center gap-4">
              {links.map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-100 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="min-h-[80vh] select-none">
        {image && (
          <Image src={image} alt={title || ''} fill priority className="-z-10 object-cover" />
        )}
      </div>
    </div>
  )
}
