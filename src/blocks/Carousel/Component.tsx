'use client'

import React, { useEffect } from 'react'
import { cn } from '@/utilities/ui'
import RichText from '@/components/RichText'
import { Media } from '@/components/Media'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel'

import type { CarouselBlock as CarouselBlockProps } from '@/payload-types'

type Props = CarouselBlockProps & {
  className?: string
  disableInnerContainer?: boolean
}

export const CarouselBlock: React.FC<Props> = (props) => {
  const { slides, showNavigation = true, autoplay = false, autoplayInterval, className } = props
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)

  // Default autoplay interval to 5000ms if not provided
  const intervalMs = autoplayInterval ?? 5000

  // Autoplay plugin would be added here if embla-carousel-autoplay is installed
  // For now, we'll implement a simple autoplay using useEffect
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
            const { richText, media } = slide

            return (
              <CarouselItem key={index}>
                <div className="flex flex-col gap-6">
                  {media && typeof media === 'object' && (
                    <div className="w-full">
                      <Media
                        resource={media}
                        imgClassName="w-full h-auto rounded-lg object-cover"
                      />
                    </div>
                  )}
                  {richText && (
                    <div>
                      <RichText data={richText} enableGutter={false} />
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
                current === index + 1
                  ? 'bg-foreground w-8'
                  : 'bg-muted-foreground/30'
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

