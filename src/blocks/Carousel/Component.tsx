'use client'

import React, { useEffect } from 'react'
import { cn } from '@/utilities/ui'
import Image from 'next/image'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel'

export type CarouselSlide = {
  image?: string
  caption?: string
}

type Props = {
  slides?: CarouselSlide[]
  showNavigation?: boolean
  autoplay?: boolean
  autoplayInterval?: number
  className?: string
}

export const CarouselBlock: React.FC<Props> = (props) => {
  const { slides, showNavigation = true, autoplay = false, autoplayInterval, className } = props
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)

  // Default autoplay interval to 5000ms if not provided
  const intervalMs = autoplayInterval ?? 5000

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plugins: any[] = []

  useEffect(() => {
    if (!api) {
      return
    }

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  // Simple autoplay implementation
  useEffect(() => {
    if (!autoplay || !api || !intervalMs) {
      return
    }

    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext()
      } else {
        api.scrollTo(0)
      }
    }, intervalMs)

    return () => clearInterval(interval)
  }, [api, autoplay, intervalMs])

  if (!slides || slides.length === 0) {
    return null
  }

  return (
    <div className={cn('container my-16', className)}>
      <Carousel setApi={setApi} plugins={plugins} className="w-full">
        <CarouselContent>
          {slides.map((slide, index) => {
            const { image, caption } = slide

            return (
              <CarouselItem key={index}>
                <div className="flex flex-col gap-6">
                  {image && (
                    <div className="w-full relative aspect-video">
                      <Image
                        src={image}
                        alt={caption || ''}
                        fill
                        className="rounded-lg object-cover"
                      />
                    </div>
                  )}
                  {caption && (
                    <div>
                      <p className="text-muted-foreground">{caption}</p>
                    </div>
                  )}
                </div>
              </CarouselItem>
            )
          })}
        </CarouselContent>
        {showNavigation && slides.length > 1 && (
          <>
            <CarouselPrevious />
            <CarouselNext />
          </>
        )}
      </Carousel>
      {slides.length > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              className={cn(
                'h-2 w-2 rounded-full transition-all',
                current === index + 1 ? 'bg-foreground w-8' : 'bg-muted-foreground/30',
              )}
              onClick={() => api?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
