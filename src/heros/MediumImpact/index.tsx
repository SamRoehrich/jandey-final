import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

export interface MediumImpactHeroProps {
  title?: string
  description?: string
  image?: string
  links?: Array<{
    label: string
    href: string
  }>
}

export const MediumImpactHero: React.FC<MediumImpactHeroProps> = ({
  title,
  description,
  image,
  links,
}) => {
  return (
    <div className="">
      <div className="container mb-8">
        {title && <h1 className="mb-4 text-3xl md:text-4xl lg:text-5xl font-bold">{title}</h1>}
        {description && <p className="mb-6 text-lg text-muted-foreground">{description}</p>}

        {Array.isArray(links) && links.length > 0 && (
          <ul className="flex gap-4">
            {links.map((link, i) => (
              <li key={i}>
                <Link
                  href={link.href}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      {image && (
        <div className="container">
          <div className="-mx-4 md:-mx-8 2xl:-mx-16 relative aspect-[16/9]">
            <Image src={image} alt={title || ''} fill className="object-cover" />
          </div>
        </div>
      )}
    </div>
  )
}
