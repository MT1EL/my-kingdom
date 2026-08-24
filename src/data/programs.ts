import type { Program } from '@/types'

/* ------------------------------------------------------------------
   Birthday programmes.

   ⚠️  PLACEHOLDER CONTENT — the themes, age ranges and durations below are
   a realistic starting point for the venue to edit, not confirmed offers.
   Photos are temporary stock images; swap `image` for the venue's own
   photography (any URL or a file under /public works).
------------------------------------------------------------------- */

const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

export const programs: Program[] = [
  {
    id: 'princess',
    title: 'პრინცესების ბალი',
    tagline: 'გვირგვინი, ბალი და ნამდვილი სამეფო ზეიმი',
    description:
      'ზეიმი პატარა პრინცესებისთვის — გვირგვინები, სამეფო დეკორაცია, ცეკვა და ბალის ცერემონია. ანიმატორი მთელი ზეიმის განმავლობაში ატარებს ბავშვებს სცენარით, რომელიც დაბადების დღის გოგონას ირგვლივ იგება.',
    ageMin: 3,
    ageMax: 8,
    durationMinutes: 120,
    image: img('photo-1504437484202-613bb51ce359'),
    highlights: ['სამეფო დეკორაცია', 'გვირგვინები და აქსესუარები', 'ცეკვა და ბალი', 'ფოტოზონა'],
    accent: 'from-candy-500 to-royal-600',
    featured: true,
  },
  {
    id: 'superhero',
    title: 'სუპერგმირების აკადემია',
    tagline: 'მისიები, გამოცდები და გმირობის დიპლომი',
    description:
      'ენერგიული პროგრამა, სადაც ბავშვები სუპერგმირების აკადემიაში ირიცხებიან: გადიან სახალისო გამოცდებს, ასრულებენ გუნდურ მისიებს და ზეიმის ბოლოს იღებენ საკუთარ დიპლომს.',
    ageMin: 4,
    ageMax: 10,
    durationMinutes: 120,
    image: img('photo-1519340241574-2cec6aef0c01'),
    highlights: ['გუნდური მისიები', 'ნიღბები და აქსესუარები', 'სახალისო გამოცდები', 'დიპლომის ცერემონია'],
    accent: 'from-royal-600 to-mint-500',
    featured: true,
  },
  {
    id: 'karaoke',
    title: 'კარაოკე ვარსკვლავი',
    tagline: 'სცენა, მიკროფონი და შენი პირველი კონცერტი',
    description:
      'ზეიმი, რომელიც კონცერტად იქცევა — კარაოკე სისტემა, სცენის განათება და წამყვანი, რომელიც ბავშვებს ვარსკვლავებად აქცევს. სიმღერები ირჩევა წინასწარ, დაბადების დღის ბავშვის გემოვნებით.',
    ageMin: 6,
    ageMax: 13,
    durationMinutes: 120,
    image: img('photo-1730724620698-42f23877153d'),
    highlights: ['კარაოკე სისტემა', 'სცენის განათება', 'წამყვანი', 'გუნდური კონკურსები'],
    accent: 'from-candy-600 to-sun-500',
  },
  {
    id: 'gaming',
    title: 'გეიმერების ტურნირი',
    tagline: 'Xbox, დიდი ეკრანი და ჩემპიონატი მეგობრებთან',
    description:
      'პროგრამა უფროსი ბავშვებისთვის: Xbox კონსოლები დიდ ეკრანზე, ტურნირის ბადე, ცოცხალი კომენტარი და საზეიმო დაჯილდოება გამარჯვებულებისთვის.',
    ageMin: 7,
    ageMax: 14,
    durationMinutes: 120,
    image: img('photo-1665041982909-8a86864a1e49'),
    highlights: ['Xbox კონსოლები', 'ტურნირის ბადე', 'დიდი ეკრანი', 'დაჯილდოება'],
    accent: 'from-royal-700 to-royal-500',
    featured: true,
  },
  {
    id: 'disco',
    title: 'დისკო-ზეიმი DJ-სთან',
    tagline: 'მუსიკა, შუქები და ცეკვის იატაკი',
    description:
      'DJ ცოცხლად უკრავს ბავშვების საყვარელ მუსიკას, დარბაზი დისკოდ გარდაიქმნება — შუქები, ცეკვის კონკურსები და ბუშტების ფინალი დაბადების დღის ბავშვისთვის.',
    ageMin: 5,
    ageMax: 12,
    durationMinutes: 120,
    image: img('photo-1524594152303-9fd13543fe6e'),
    highlights: ['DJ და ხმის აპარატურა', 'დისკო განათება', 'ცეკვის კონკურსები', 'ბუშტების შოუ'],
    accent: 'from-royal-600 to-candy-500',
  },
  {
    id: 'art',
    title: 'ხელოვნების სახელოსნო',
    tagline: 'ფერები, სახის მოხატვა და ნამუშევარი სახლში',
    description:
      'მშვიდი და შემოქმედებითი პროგრამა — სახის მოხატვა, ხელნაკეთი სახელოსნო და პატარა გამოფენა ზეიმის ბოლოს. თითოეული სტუმარი საკუთარ ნამუშევარს სახლში მიაქვს.',
    ageMin: 4,
    ageMax: 10,
    durationMinutes: 120,
    image: img('photo-1585775484045-0cafc65dc562'),
    highlights: ['სახის მოხატვა', 'ხელნაკეთი სახელოსნო', 'მასალები შედის', 'ნამუშევარი საჩუქრად'],
    accent: 'from-sun-500 to-candy-500',
  },
  {
    id: 'magic',
    title: 'ჯადოსნური შოუ',
    tagline: 'ილუზიები, ბუშტები და ოხ-ის ხმა დარბაზში',
    description:
      'ინტერაქტიული შოუ ყველაზე პატარებისთვის — ილუზიონისტი, საპნის ბუშტების შოუ და ჯადოსნური ხრიკები, რომლებშიც ბავშვები თავადაც მონაწილეობენ.',
    ageMin: 3,
    ageMax: 9,
    durationMinutes: 90,
    image: img('photo-1765947385319-e19e919bdf22'),
    highlights: ['ილუზიონისტი', 'საპნის ბუშტების შოუ', 'ინტერაქტიული ხრიკები', 'პატარა საჩუქრები'],
    accent: 'from-royal-800 to-candy-600',
  },
  {
    id: 'classic',
    title: 'კლასიკური ზეიმი',
    tagline: 'ბუშტები, თამაშები და ტორტის ცერემონია',
    description:
      'უნივერსალური პროგრამა ნებისმიერი ასაკისთვის — ბუშტების დეკორაცია, ანიმატორის თამაშები, კონკურსები და სანთლების ჩაქრობის საზეიმო წუთი. იდეალურია, თუ თემა ჯერ არჩეული არ გაქვთ.',
    ageMin: 1,
    ageMax: 12,
    durationMinutes: 120,
    image: img('photo-1555607124-8531c7c702d0'),
    highlights: ['ბუშტების დეკორაცია', 'ანიმატორის თამაშები', 'ტორტის ცერემონია', 'მუსიკა'],
    accent: 'from-mint-500 to-royal-600',
  },
]

export const getProgram = (id: string | null | undefined): Program | undefined =>
  programs.find((program) => program.id === id)

export const featuredPrograms = programs.filter((program) => program.featured)
