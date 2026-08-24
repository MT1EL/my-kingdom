import type { Activity } from '@/types'

/* ------------------------------------------------------------------
   What happens during a party.

   ⚠️  PLACEHOLDER CONTENT — confirm with the venue which of these are
   actually offered, then delete or extend the list.
   `icon` must match an export of `lucide-react`.
------------------------------------------------------------------- */

export const activities: Activity[] = [
  {
    id: 'games',
    title: 'თამაშები და კონკურსები',
    description: 'ანიმატორის მიერ წაყვანილი აქტიური თამაშები, გუნდური კონკურსები და პრიზები.',
    icon: 'Dices',
    accent: 'from-royal-500 to-royal-700',
  },
  {
    id: 'karaoke',
    title: 'კარაოკე',
    description: 'მიკროფონები, სცენა და ბავშვების საყვარელი სიმღერების დიდი ბიბლიოთეკა.',
    icon: 'MicVocal',
    accent: 'from-candy-500 to-candy-700',
  },
  {
    id: 'xbox',
    title: 'Xbox და კონსოლები',
    description: 'სათამაშო ზონა დიდი ეკრანით — ორთაბრძოლები და ტურნირები მეგობრებთან.',
    icon: 'Gamepad2',
    accent: 'from-royal-600 to-mint-500',
  },
  {
    id: 'dj',
    title: 'DJ და მუსიკა',
    description: 'ცოცხალი DJ, ხმის აპარატურა და დისკო განათება ცეკვის ნაწილისთვის.',
    icon: 'Disc3',
    accent: 'from-sun-400 to-candy-600',
  },
  {
    id: 'photo',
    title: 'ფოტოგრაფია',
    description: 'ზეიმის გადაღება, რომ საუკეთესო წუთები არ დაიკარგოს.',
    icon: 'Camera',
    accent: 'from-royal-700 to-candy-500',
  },
  {
    id: 'photozone',
    title: 'ფოტოზონები',
    description: 'თემატური ფოტოზონები და ბუშტების დეკორაცია სტუმრებისთვის.',
    icon: 'Sparkles',
    accent: 'from-candy-400 to-sun-400',
  },
  {
    id: 'animators',
    title: 'ანიმატორები',
    description: 'პერსონაჟები და წამყვანები, რომლებიც სცენარს თავიდან ბოლომდე ატარებენ.',
    icon: 'Wand2',
    accent: 'from-mint-500 to-royal-600',
  },
  {
    id: 'facepaint',
    title: 'სახის მოხატვა',
    description: 'ჰიპოალერგიული საღებავები და პერსონაჟები, რომლებსაც ბავშვები თავად ირჩევენ.',
    icon: 'Palette',
    accent: 'from-candy-600 to-royal-500',
  },
  {
    id: 'bubbles',
    title: 'ბუშტების შოუ',
    description: 'საპნის გიგანტური ბუშტები — ზეიმის ყველაზე ფოტოგენური წუთები.',
    icon: 'Droplets',
    accent: 'from-mint-400 to-royal-500',
  },
  {
    id: 'cake',
    title: 'ტორტის ცერემონია',
    description: 'სანთლების ჩაქრობა, მუსიკა და სურვილის თქმა — მთავარი წუთი დღის.',
    icon: 'Cake',
    accent: 'from-sun-400 to-candy-500',
  },
  {
    id: 'menu',
    title: 'საბავშვო მენიუ',
    description: 'ზეიმის მაგიდა ბავშვებისთვის — მენიუ ჯავშნისას ერთად ვთანხმდებით.',
    icon: 'UtensilsCrossed',
    accent: 'from-royal-600 to-sun-500',
  },
  {
    id: 'parents',
    title: 'ზონა მშობლებისთვის',
    description: 'კომფორტული ადგილი მშობლებისთვის, საიდანაც ზეიმი კარგად ჩანს.',
    icon: 'Armchair',
    accent: 'from-royal-500 to-candy-600',
  },
]

/* ------------------------------------------------------------------
   "რატომ ჩემი სამეფო" — the venue's promises.
   ⚠️  Review with the owner before publishing; keep it free of any
   claim (awards, years of experience, guest counts) we cannot back up.
------------------------------------------------------------------- */

export interface Benefit {
  id: string
  title: string
  description: string
  icon: string
}

export const benefits: Benefit[] = [
  {
    id: 'one-place',
    title: 'ყველაფერი ერთ სივრცეში',
    description:
      'დეკორაცია, პროგრამა, მუსიკა და თამაშები ერთად — არ გჭირდებათ სხვადასხვა სერვისის ცალკე ძებნა.',
    icon: 'PartyPopper',
  },
  {
    id: 'script',
    title: 'ინდივიდუალური სცენარი',
    description:
      'პროგრამას ვაწყობთ დაბადების დღის ბავშვის ინტერესებზე — პერსონაჟები, მუსიკა და თამაშები მის გემოვნებაზე.',
    icon: 'Wand2',
  },
  {
    id: 'safe',
    title: 'უსაფრთხო და კომფორტული სივრცე',
    description: 'დახურული სივრცე, სადაც ბავშვები თავისუფლად მოძრაობენ და მშობლები მშვიდად არიან.',
    icon: 'ShieldCheck',
  },
  {
    id: 'team',
    title: 'გუნდი, რომელიც ბავშვების ენაზე საუბრობს',
    description: 'გუნდი, რომელიც ბავშვებს ყურადღებას ერთ წუთსაც არ ჩამოაცილებს და მშობელს ორგანიზების ტვირთს ხსნის.',
    icon: 'Users',
  },
  {
    id: 'memories',
    title: 'ფოტოები, რომლებიც რჩება',
    description: 'ფოტოზონები და გადაღება, რომ ზეიმის ყველაზე ლამაზი წუთები შემორჩეს.',
    icon: 'Camera',
  },
  {
    id: 'easy',
    title: 'მარტივი ჯავშანი',
    description: 'აირჩიეთ თარიღი და პროგრამა საიტზე — დანარჩენს ჩვენ მოვაგვარებთ.',
    icon: 'CalendarCheck',
  },
]
