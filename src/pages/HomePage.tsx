import { Hero } from '@/components/home/Hero'
import { Intro } from '@/components/home/Intro'
import { ProgramsPreview } from '@/components/home/ProgramsPreview'
import { Activities } from '@/components/home/Activities'
import { WhyUs } from '@/components/home/WhyUs'
import { GalleryPreview } from '@/components/home/GalleryPreview'
import { BookingCta } from '@/components/home/BookingCta'
import { usePageMeta } from '@/lib/usePageMeta'

export default function HomePage() {
  usePageMeta(
    'ჩემი სამეფო — საბავშვო დაბადების დღეები თბილისში',
    'თემატური პროგრამები, ანიმატორები, თამაშები, კარაოკე, Xbox, DJ და ფოტოზონები — ბავშვების დაბადების დღეების სივრცე თბილისში.',
  )

  return (
    <>
      <Hero />
      <Intro />
      <ProgramsPreview />
      <Activities />
      <WhyUs />
      <GalleryPreview />
      <BookingCta />
    </>
  )
}
