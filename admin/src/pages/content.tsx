import type { Activity, Benefit, Extra, GalleryImage, Program } from '@shared/types'
import { ResourcePage, type ManagedItem, type ResourceConfig } from '@/components/resource/ResourcePage'
import { LucideIcon } from '@/components/resource/LucideIcon'
import { Badge } from '@/components/ui'

/* ------------------------------------------------------------------
   The content screens.

   Each one is a configuration, not a component: the fields it has, how a
   row reads, and what to call it. `ResourcePage` does the rest.
------------------------------------------------------------------- */

/** Fields every content type shares. Kept identical so the forms feel the same. */
const publishedField = {
  kind: 'boolean' as const,
  name: 'published',
  label: 'გამოქვეყნებული',
  hint: 'მოხსნით — საიტიდან გაქრება, მაგრამ არ წაიშლება.',
  full: true,
}

/* --------------------------- programmes -------------------------- */

type ProgramRow = Program & ManagedItem

const programsConfig: ResourceConfig<ProgramRow> = {
  path: '/api/admin/programs',
  title: 'პროგრამები',
  description: 'ზეიმის თემები, რომლებსაც ოჯახები ჯავშნისას ირჩევენ.',
  noun: 'პროგრამა',
  labelOf: (item) => item.title,
  blank: {
    title: '',
    tagline: '',
    description: '',
    ageMin: 3,
    ageMax: 10,
    durationMinutes: 120,
    image: '',
    highlights: [],
    accent: 'from-royal-600 to-candy-500',
    featured: false,
    published: true,
  },
  fields: [
    { kind: 'text', name: 'title', label: 'სათაური', required: true },
    { kind: 'text', name: 'tagline', label: 'ქვესათაური', required: true },
    { kind: 'textarea', name: 'description', label: 'აღწერა', required: true, full: true },
    { kind: 'number', name: 'ageMin', label: 'ასაკი — დან', min: 0, max: 18 },
    { kind: 'number', name: 'ageMax', label: 'ასაკი — მდე', min: 0, max: 18 },
    { kind: 'number', name: 'durationMinutes', label: 'ხანგრძლივობა (წუთი)', min: 15, max: 600 },
    { kind: 'boolean', name: 'featured', label: 'მთავარ გვერდზე', hint: 'გამოჩნდება „რჩეული პროგრამების“ ბლოკში.' },
    { kind: 'image', name: 'image', label: 'სურათი', full: true },
    { kind: 'list', name: 'highlights', label: 'რას მოიცავს', hint: 'მოკლე პუნქტები — ბარათზე ჩამონათვალად გამოჩნდება.', max: 12, full: true },
    { kind: 'accent', name: 'accent', label: 'ბარათის ფერი', full: true },
    publishedField,
  ],
  renderRow: (item) => (
    <div className="flex items-center gap-3">
      {item.image && (
        <img src={item.image} alt="" className="size-12 shrink-0 rounded-lg object-cover" />
      )}
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-2 font-semibold text-royal-950">
          {item.title}
          {item.featured && <Badge tone="success">მთავარზე</Badge>}
        </p>
        <p className="truncate text-sm text-royal-900/60">
          {item.tagline} · {item.ageMin}–{item.ageMax} წ. · {item.durationMinutes} წთ
        </p>
      </div>
    </div>
  ),
}

export const ProgramsScreen = () => <ResourcePage config={programsConfig} />

/* --------------------------- activities -------------------------- */

type ActivityRow = Activity & ManagedItem

const activitiesConfig: ResourceConfig<ActivityRow> = {
  path: '/api/admin/activities',
  title: 'აქტივობები',
  description: '„რა ხდება ზეიმის დროს“ — მთავარი გვერდის ბლოკი.',
  noun: 'აქტივობა',
  labelOf: (item) => item.title,
  blank: { title: '', description: '', icon: 'Sparkles', accent: 'from-royal-500 to-royal-700', published: true },
  fields: [
    { kind: 'text', name: 'title', label: 'სათაური', required: true },
    { kind: 'textarea', name: 'description', label: 'აღწერა', rows: 3, required: true, full: true },
    { kind: 'icon', name: 'icon', label: 'აიკონი', full: true },
    { kind: 'accent', name: 'accent', label: 'ფერი', full: true },
    publishedField,
  ],
  renderRow: (item) => (
    <div className="flex items-center gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-royal-100 text-royal-700">
        <LucideIcon name={item.icon} className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="font-semibold text-royal-950">{item.title}</p>
        <p className="truncate text-sm text-royal-900/60">{item.description}</p>
      </div>
    </div>
  ),
}

export const ActivitiesScreen = () => <ResourcePage config={activitiesConfig} />

/* ---------------------------- benefits --------------------------- */

type BenefitRow = Benefit & ManagedItem

const benefitsConfig: ResourceConfig<BenefitRow> = {
  path: '/api/admin/benefits',
  title: 'რატომ ჩვენ',
  description: 'დაპირებები, რომლებიც მთავარ გვერდზე მუქ ბლოკში ჩანს.',
  noun: 'პუნქტი',
  labelOf: (item) => item.title,
  blank: { title: '', description: '', icon: 'PartyPopper', published: true },
  fields: [
    { kind: 'text', name: 'title', label: 'სათაური', required: true, full: true },
    { kind: 'textarea', name: 'description', label: 'აღწერა', rows: 3, required: true, full: true },
    { kind: 'icon', name: 'icon', label: 'აიკონი', full: true },
    publishedField,
  ],
  renderRow: (item) => (
    <div className="flex items-center gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-sun-100 text-sun-800">
        <LucideIcon name={item.icon} className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="font-semibold text-royal-950">{item.title}</p>
        <p className="truncate text-sm text-royal-900/60">{item.description}</p>
      </div>
    </div>
  ),
}

export const BenefitsScreen = () => <ResourcePage config={benefitsConfig} />

/* ----------------------------- extras ---------------------------- */

type ExtraRow = Extra & ManagedItem

const extrasConfig: ResourceConfig<ExtraRow> = {
  path: '/api/admin/extras',
  title: 'დამატებითი სერვისები',
  description: 'ჯავშნის მე-4 ნაბიჯზე შემოთავაზებული დამატებები.',
  noun: 'სერვისი',
  labelOf: (item) => item.title,
  blank: { title: '', description: '', icon: 'Gift', published: true },
  fields: [
    { kind: 'text', name: 'title', label: 'დასახელება', required: true, full: true },
    { kind: 'textarea', name: 'description', label: 'აღწერა', rows: 3, required: true, full: true },
    { kind: 'icon', name: 'icon', label: 'აიკონი', full: true },
    publishedField,
  ],
  renderRow: (item) => (
    <div className="flex items-center gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-candy-100 text-candy-700">
        <LucideIcon name={item.icon} className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="font-semibold text-royal-950">{item.title}</p>
        <p className="truncate text-sm text-royal-900/60">{item.description}</p>
      </div>
    </div>
  ),
}

export const ExtrasScreen = () => <ResourcePage config={extrasConfig} />

/* ----------------------------- gallery --------------------------- */

type GalleryRow = GalleryImage & ManagedItem

const CATEGORY_LABELS: Record<string, string> = {
  zeimi: 'ზეიმები',
  aqtivobebi: 'აქტივობები',
  photozona: 'ფოტოზონები',
  dekoracia: 'დეკორაცია',
  torti: 'ტორტები',
}

const galleryConfig: ResourceConfig<GalleryRow> = {
  path: '/api/admin/gallery',
  title: 'გალერეა',
  description: 'ფოტოები გალერეის გვერდსა და მთავარი გვერდის მოზაიკაზე.',
  noun: 'ფოტო',
  labelOf: (item) => item.alt,
  blank: { src: '', alt: '', category: 'zeimi', span: 'normal', published: true },
  fields: [
    { kind: 'image', name: 'src', label: 'ფოტო', full: true },
    {
      kind: 'text',
      name: 'alt',
      label: 'აღწერა',
      required: true,
      full: true,
      hint: 'რა ჩანს ფოტოზე — ეკრანის წამკითხველები და Google ამას იყენებენ.',
    },
    {
      kind: 'select',
      name: 'category',
      label: 'კატეგორია',
      options: Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
    },
    {
      kind: 'select',
      name: 'span',
      label: 'ზომა ბადეში',
      options: [
        { value: 'normal', label: 'ჩვეულებრივი' },
        { value: 'tall', label: 'მაღალი' },
        { value: 'wide', label: 'განიერი' },
      ],
    },
    publishedField,
  ],
  renderRow: (item) => (
    <div className="flex items-center gap-3">
      <img src={item.src} alt="" className="size-12 shrink-0 rounded-lg object-cover" />
      <div className="min-w-0">
        <p className="truncate font-semibold text-royal-950">{item.alt}</p>
        <p className="text-sm text-royal-900/60">
          {CATEGORY_LABELS[item.category] ?? item.category}
        </p>
      </div>
    </div>
  ),
}

export const GalleryScreen = () => <ResourcePage config={galleryConfig} />
