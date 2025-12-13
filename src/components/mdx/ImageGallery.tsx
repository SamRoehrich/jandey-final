interface ImageGalleryProps {
  images: string[]
  alt?: string[]
}

export function ImageGallery({ images, alt = [] }: ImageGalleryProps) {
  return (
    <div className="image-gallery">
      {images.map((src, index) => (
        <img key={src} src={src} alt={alt[index] || `Gallery image ${index + 1}`} loading="lazy" />
      ))}
    </div>
  )
}
