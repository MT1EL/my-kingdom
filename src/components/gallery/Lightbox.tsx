import { useCallback, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { GalleryImage } from '@/types'

interface LightboxProps {
  images: GalleryImage[]
  index: number
  onClose: () => void
  onNavigate: (index: number) => void
}

export function Lightbox({ images, index, onClose, onNavigate }: LightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const touchStartX = useRef<number | null>(null)
  const image = images[index]

  const goPrev = useCallback(
    () => onNavigate((index - 1 + images.length) % images.length),
    [index, images.length, onNavigate],
  )
  const goNext = useCallback(
    () => onNavigate((index + 1) % images.length),
    [index, images.length, onNavigate],
  )

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft') goPrev()
      if (event.key === 'ArrowRight') goNext()
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [goNext, goPrev, onClose])

  if (!image) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="ფოტოს გადიდებული ხედი"
      className="fixed inset-0 z-[70] flex flex-col bg-royal-950/95 backdrop-blur-md"
      onClick={onClose}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0].clientX
      }}
      onTouchEnd={(event) => {
        if (touchStartX.current === null) return
        const delta = event.changedTouches[0].clientX - touchStartX.current
        if (Math.abs(delta) > 60) {
          if (delta > 0) goPrev()
          else goNext()
        }
        touchStartX.current = null
      }}
    >
      <div className="flex items-center justify-between gap-4 px-5 py-4 text-white sm:px-8">
        <span className="text-sm font-semibold text-white/70">
          {index + 1} / {images.length}
        </span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="დახურვა"
          className="grid size-11 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
        >
          <X className="size-5" />
        </button>
      </div>

      <div
        className="relative flex flex-1 items-center justify-center px-4 pb-4 sm:px-16"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={goPrev}
          aria-label="წინა ფოტო"
          className="absolute left-2 z-10 grid size-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 sm:left-4 sm:size-13"
        >
          <ChevronLeft className="size-6" />
        </button>

        <figure className="flex max-h-full flex-col items-center gap-4">
          <img
            key={image.id}
            src={image.src}
            alt={image.alt}
            className="max-h-[70vh] w-auto max-w-full rounded-3xl object-contain shadow-lift animate-rise"
          />
          <figcaption className="max-w-xl text-center text-sm text-white/70">
            {image.alt}
          </figcaption>
        </figure>

        <button
          type="button"
          onClick={goNext}
          aria-label="შემდეგი ფოტო"
          className="absolute right-2 z-10 grid size-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25 sm:right-4 sm:size-13"
        >
          <ChevronRight className="size-6" />
        </button>
      </div>
    </div>
  )
}
