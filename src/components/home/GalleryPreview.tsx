import { Link } from 'react-router-dom'
import { ArrowRight, Images } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'
import { SmartImage } from '@/components/ui/SmartImage'
import { LinkButton } from '@/components/ui/Button'
import { useGalleryPreview } from '@/content'
import { cn } from '@/lib/cn'

/** Layout pattern for the 8-image preview mosaic (index → grid span classes). */
const spans = [
  'sm:col-span-2 sm:row-span-2',
  '',
  '',
  'sm:row-span-2',
  '',
  '',
  'sm:col-span-2',
  '',
]

export function GalleryPreview() {
  const galleryPreview = useGalleryPreview(spans.length)

  return (
    <section className="py-20 sm:py-28">
      <Container size="wide">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            align="left"
            eyebrow="გალერეა"
            title={
              <>
                ერთი შეხედვა <span className="text-gradient-royal">ჩვენს ზეიმებზე</span>
              </>
            }
            description="ბუშტები, ღიმილები და მომენტები, რომლებიც ფოტოებზე რჩება."
            className="max-w-2xl"
          />
          <Reveal delay={80}>
            <LinkButton to="/gallery" variant="outline" className="shrink-0">
              <Images className="size-4" />
              სრული გალერეა
            </LinkButton>
          </Reveal>
        </div>

        <div className="mt-12 grid auto-rows-[10rem] grid-flow-dense grid-cols-2 gap-3 sm:auto-rows-[11rem] sm:grid-cols-4 sm:gap-4">
          {galleryPreview.map((image, index) => (
            <Reveal
              key={image.id}
              delay={index * 60}
              className={cn('h-full', spans[index] ?? '')}
            >
              <Link
                to="/gallery"
                className="group relative block h-full overflow-hidden rounded-3xl shadow-soft ring-1 ring-royal-900/5 transition-shadow duration-500 hover:shadow-lift"
                aria-label={`${image.alt} — გალერეის ნახვა`}
              >
                <SmartImage
                  src={image.src}
                  alt={image.alt}
                  wrapperClassName="h-full"
                  className="transition-transform duration-700 group-hover:scale-110"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-royal-950/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
                <span className="absolute bottom-3 left-3 flex items-center gap-1.5 text-sm font-semibold text-white opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  ნახე მეტი
                  <ArrowRight className="size-4" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
