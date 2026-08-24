import type { Extra } from '@/types'

/* ------------------------------------------------------------------
   Optional add-ons offered in step 4 of the booking flow.

   ⚠️  PLACEHOLDER CONTENT — no prices are listed on purpose. Confirm the
   list (and how each extra is charged) with the venue.
------------------------------------------------------------------- */

export const extras: Extra[] = [
  {
    id: 'photographer',
    title: 'ფოტოგრაფი',
    description: 'ზეიმის პროფესიული გადაღება და დამუშავებული ფოტოები.',
    icon: 'Camera',
  },
  {
    id: 'facepaint',
    title: 'სახის მოხატვა',
    description: 'მხატვარი, რომელიც სტუმრებს პერსონაჟებად აქცევს.',
    icon: 'Palette',
  },
  {
    id: 'bubbles',
    title: 'ბუშტების შოუ',
    description: 'საპნის გიგანტური ბუშტების ინტერაქტიული შოუ.',
    icon: 'Droplets',
  },
  {
    id: 'balloons',
    title: 'ბუშტების დეკორაცია',
    description: 'თემატური ბუშტების თაღი და ფოტოზონის გაფორმება.',
    icon: 'Sparkles',
  },
  {
    id: 'cake',
    title: 'ტორტი',
    description: 'ტორტის შეკვეთა ზეიმის თემატიკის მიხედვით.',
    icon: 'Cake',
  },
  {
    id: 'menu',
    title: 'საბავშვო მენიუ',
    description: 'ზეიმის მაგიდა სტუმრებისთვის — მენიუს ერთად შევადგენთ.',
    icon: 'UtensilsCrossed',
  },
  {
    id: 'dj',
    title: 'DJ',
    description: 'ცოცხალი DJ სეტი და დისკო განათება.',
    icon: 'Disc3',
  },
  {
    id: 'giftbags',
    title: 'საჩუქრის ჩანთები',
    description: 'პატარა საჩუქრები თითოეული სტუმრისთვის.',
    icon: 'Gift',
  },
]

export const getExtra = (id: string): Extra | undefined => extras.find((extra) => extra.id === id)
