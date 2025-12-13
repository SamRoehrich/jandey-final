import React from 'react'

export interface LowImpactHeroProps {
  title?: string
  description?: string
  children?: React.ReactNode
}

export const LowImpactHero: React.FC<LowImpactHeroProps> = ({ title, description, children }) => {
  return (
    <div className="container mt-8 mb-12">
      <div className="max-w-[48rem]">
        {title && <h1 className="mb-4 text-3xl md:text-4xl font-bold">{title}</h1>}
        {description && <p className="text-lg text-muted-foreground">{description}</p>}
        {children}
      </div>
    </div>
  )
}
