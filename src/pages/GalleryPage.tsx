import { useMemo, useState } from 'react'
import { Expand } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { Reveal } from '@/components/ui/Reveal'
import { SmartImage } from '@/components/ui/SmartImage'
import { LinkButton } from '@/components/ui/Button'
import { Lightbox } from '@/components/gallery/Lightbox'
import { useGallery, useGalleryCategories } from '@/content'
import type { GalleryCategory, GalleryImage } from '@/types'
import { usePageMeta } from '@/lib/usePageMeta'
import { cn } from '@/lib/cn'

const spanClasses: Record<GalleryImage['span'], string> = {
  tall: 'row-span-2',
  wide: 'sm:col-span-2',
  normal: '',
}

export default function GalleryPage() {
  usePageMeta(
    'გალერეა — ჩემი სამეფო',
    'ფოტოები ჩვენი ზეიმებიდან: აქტივობები, ფოტოზონები, დეკორაცია და ტორტები.',
  )

  const galleryImages = useGallery()
  const galleryCategories = useGalleryCategories()

  const [category, setCategory] = useState<GalleryCategory | 'all'>('all')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const visible = useMemo(
    () =>
      category === 'all'
        ? galleryImages
        : galleryImages.filter((image) => image.category === category),
    [category, galleryImages],
  )

  return (
    <>
      <PageHeader
        eyebrow="გალერეა"
        title="ჩვენი ზეიმები ფოტოებში"
        description="შეხედეთ, როგორ გამოიყურება დაბადების დღე ჩემს სამეფოში — დეკორაციიდან ტორტის ცერემონიამდე."
      />

      <section className="py-14 sm:py-20">
        <Container size="wide">
          <Reveal className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-2 scrollbar-none sm:flex-wrap sm:overflow-visible">
            {galleryCategories.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setCategory(option.id)
                  setLightboxIndex(null)
                }}
                aria-pressed={category === option.id}
                className={cn(
                  'shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300',
                  category === option.id
                    ? 'gradient-royal text-white shadow-[0_8px_20px_-10px_rgb(112_55_143/0.9)]'
                    : 'border border-royal-200 bg-white text-royal-800 hover:border-royal-400',
                )}
              >
                {option.label}
              </button>
            ))}
          </Reveal>

          <div className="mt-10 grid auto-rows-[11rem] grid-flow-dense grid-cols-2 gap-3 sm:auto-rows-[13rem] sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {visible.map((image, index) => (
              <Reveal
                key={image.id}
                delay={(index % 4) * 60}
                className={cn('h-full', spanClasses[image.span])}
              >
                <button
                  type="button"
                  onClick={() => setLightboxIndex(index)}
                  className="group relative block h-full w-full overflow-hidden rounded-3xl shadow-soft ring-1 ring-royal-900/5 transition-shadow duration-500 hover:shadow-lift"
                  aria-label={`${image.alt} — გადიდება`}
                >
                  <SmartImage
                    src={image.src}
                    alt={image.alt}
                    wrapperClassName="h-full"
                    className="transition-transform duration-700 group-hover:scale-110"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-royal-950/65 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />
                  <span className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/90 text-royal-800 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <Expand className="size-4" />
                  </span>
                </button>
              </Reveal>
            ))}
          </div>

          {visible.length === 0 && (
            <p className="mt-10 rounded-3xl border border-dashed border-royal-200 bg-white p-10 text-center text-royal-900/60">
              ამ კატეგორიაში ფოტოები ჯერ არ არის.
            </p>
          )}

          <Reveal className="mt-14 flex flex-col items-center gap-4 text-center">
            <h2 className="text-2xl text-royal-950 sm:text-3xl">
              მოგწონთ? მოდით, თქვენი ზეიმიც ასე დავგეგმოთ.
            </h2>
            <LinkButton to="/booking" size="lg">
              დაჯავშნე დაბადების დღე
            </LinkButton>
          </Reveal>
        </Container>
      </section>

      {lightboxIndex !== null && (
        <Lightbox
          images={visible}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  )
}
