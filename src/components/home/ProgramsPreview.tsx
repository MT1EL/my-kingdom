import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'
import { LinkButton } from '@/components/ui/Button'
import { ProgramCard } from '@/components/programs/ProgramCard'
import { featuredPrograms, programs } from '@/data/programs'

export function ProgramsPreview() {
  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-0 size-96 rounded-full bg-candy-100/60 blur-3xl"
      />

      <Container size="wide" className="relative">
        <SectionHeading
          eyebrow="პროგრამები"
          title={
            <>
              აირჩიე თემა, <span className="text-gradient-royal">დანარჩენს ჩვენ მოვაგვარებთ</span>
            </>
          }
          description="თითოეული პროგრამა სცენარით, ანიმატორითა და დეკორაციით სრულდება — თქვენ მხოლოდ თემა უნდა აირჩიოთ."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredPrograms.map((program, index) => (
            <Reveal key={program.id} delay={index * 90} as="article" className="h-full">
              <ProgramCard program={program} compact />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 flex justify-center">
          <LinkButton to="/programs" variant="secondary" size="lg">
            ყველა პროგრამა ({programs.length})
            <ArrowRight className="size-4" />
          </LinkButton>
        </Reveal>
      </Container>
    </section>
  )
}
