import type { GalleryCategoryOption, GalleryImage } from '@/types'

/* ------------------------------------------------------------------
   Gallery.

   ⚠️  PLACEHOLDER PHOTOS — every `src` below is a temporary stock image.
   Replace them with the venue's own photography: drop files into
   /public/gallery and point `src` at "/gallery/<file>.jpg".
------------------------------------------------------------------- */

const img = (id: string, w = 1400) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

export const galleryCategories: GalleryCategoryOption[] = [
  { id: 'all', label: 'ყველა' },
  { id: 'zeimi', label: 'ზეიმები' },
  { id: 'aqtivobebi', label: 'აქტივობები' },
  { id: 'photozona', label: 'ფოტოზონები' },
  { id: 'dekoracia', label: 'დეკორაცია' },
  { id: 'torti', label: 'ტორტები' },
]

export const galleryImages: GalleryImage[] = [
  {
    id: 'g01',
    src: img('photo-1509666537727-9154b6962292'),
    alt: 'ორი გოგონა საზეიმო ქუდებით და ბუშტით',
    category: 'zeimi',
    span: 'tall',
  },
  {
    id: 'g02',
    src: img('photo-1608790672275-309c02d888ff'),
    alt: 'ბავშვები ტორტზე სანთლებს აქრობენ',
    category: 'zeimi',
  },
  {
    id: 'g03',
    src: img('photo-1707589338174-dc1ddc18945a'),
    alt: 'ბუშტების თაღი ფოტოზონაში',
    category: 'photozona',
    span: 'tall',
  },
  {
    id: 'g04',
    src: img('photo-1765947380154-0928682783b2'),
    alt: 'ბავშვები ეზოში სახალისო თამაშს თამაშობენ',
    category: 'aqtivobebi',
  },
  {
    id: 'g05',
    src: img('photo-1504196606672-aef5c9cefc92'),
    alt: 'ფერადი ჰელიუმის ბუშტები',
    category: 'dekoracia',
  },
  {
    id: 'g06',
    src: img('photo-1519340241574-2cec6aef0c01'),
    alt: 'ორი ბიჭი სუპერგმირების კოსტიუმებში',
    category: 'aqtivobebi',
    span: 'tall',
  },
  {
    id: 'g07',
    src: img('photo-1578922864601-79dcc7cbcea9'),
    alt: 'დაბადების დღის კექსები საზეიმო ბარათებით',
    category: 'torti',
  },
  {
    id: 'g08',
    src: img('photo-1730724620698-42f23877153d'),
    alt: 'ბავშვები სცენაზე მიკროფონებით და დისკო განათებით',
    category: 'aqtivobebi',
    span: 'wide',
  },
  {
    id: 'g09',
    src: img('photo-1628016354739-6c65f0e11c24'),
    alt: 'გოგონას სახეს ხატავენ ზეიმზე',
    category: 'aqtivobebi',
  },
  {
    id: 'g10',
    src: img('photo-1615445565741-c60a9edd393f'),
    alt: 'ბიჭი საზეიმო ქუდით ბუშტების ფონზე',
    category: 'zeimi',
    span: 'tall',
  },
  {
    id: 'g11',
    src: img('photo-1765947385432-a343060608f9'),
    alt: 'გაწყობილი საზეიმო მაგიდა ბავშვებისთვის',
    category: 'dekoracia',
  },
  {
    id: 'g12',
    src: img('photo-1514793302631-293f95fcd7e7'),
    alt: 'ბავშვის სახეზე დახატული პერსონაჟი',
    category: 'aqtivobebi',
  },
  {
    id: 'g13',
    src: img('photo-1783153918493-55acf5d278db'),
    alt: 'ლურჯი საზეიმო დეკორაცია ბუშტებით',
    category: 'dekoracia',
    span: 'tall',
  },
  {
    id: 'g14',
    src: img('photo-1493711662062-fa541adb3fc8'),
    alt: 'ბავშვები სათამაშო კონსოლით თამაშობენ',
    category: 'aqtivobebi',
  },
  {
    id: 'g15',
    src: img('photo-1585421079919-44c712bdf839'),
    alt: 'ორი ბავშვი ერთად იცინის',
    category: 'zeimi',
  },
  {
    id: 'g16',
    src: img('photo-1555607124-8531c7c702d0'),
    alt: 'ტორტი და „Happy Birthday" გირლანდა',
    category: 'torti',
    span: 'wide',
  },
  {
    id: 'g17',
    src: img('photo-1777332547120-e7ec407b5ed6'),
    alt: 'ბუშტების დეკორაცია ტორტის მაგიდასთან',
    category: 'dekoracia',
  },
  {
    id: 'g18',
    src: img('photo-1698966165570-2c1d256c596c'),
    alt: 'ილუზიონისტის შოუ ზეიმზე',
    category: 'aqtivobebi',
    span: 'tall',
  },
  {
    id: 'g19',
    src: img('photo-1516668557604-c8e814fdb184'),
    alt: 'გოგონა ტორტზე სანთელს აქრობს',
    category: 'torti',
  },
  {
    id: 'g20',
    src: img('photo-1643214341435-09bef932414a'),
    alt: 'ბავშვები საზეიმო მაგიდასთან',
    category: 'zeimi',
  },
  {
    id: 'g21',
    src: img('photo-1765947380775-712a88940f8a'),
    alt: 'გოგონა პინიატას არტყამს ზეიმზე',
    category: 'aqtivobebi',
  },
  {
    id: 'g22',
    src: img('photo-1504437484202-613bb51ce359'),
    alt: 'გოგონა ბუშტებთან საზეიმო კაბაში',
    category: 'photozona',
    span: 'tall',
  },
]

/** First N images, used for the home-page preview strip. */
export const galleryPreview = galleryImages.slice(0, 8)
