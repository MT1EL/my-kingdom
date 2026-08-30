/* ------------------------------------------------------------------
   Initial content.

   This is the site's current content, lifted out of `src/data/*.ts` so a
   fresh database starts with something real rather than empty pages. It
   runs once; after that the database is the source of truth and every
   change happens in the dashboard, not here.

   ⚠️  Everything below carries over the placeholder warnings from the old
   data files: the programmes, prices, photos and opening pattern are a
   realistic starting point for the venue to edit, not confirmed offers.
------------------------------------------------------------------- */

const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

export const seedSite = {
  name: 'ჩემი სამეფო',
  nameLatin: 'My Kingdom',
  tagline: 'ბავშვების დაბადების დღეების სივრცე თბილისში',
  city: 'თბილისი',

  // null → the UI shows a "დასაზუსტებელია" placeholder instead of a dead link.
  phone: null as string | null,
  phoneDisplay: null as string | null,
  email: null as string | null,
  address: null as string | null,
  addressHint: 'ზუსტი მისამართი დაზუსტდება',

  facebook: 'https://www.facebook.com/mykingdommmm',
  instagram: null as string | null,

  mapQuery: 'Tbilisi, Georgia',
  mapIsExact: false,
  mapZoom: 12,

  priceNote:
    'პაკეტების ღირებულება დამოკიდებულია სტუმრების რაოდენობასა და არჩეულ პროგრამაზე — ზუსტ ფასს ჯავშნის დადასტურებისას გეტყვით.',
  menuNotes: [
    'მენიუს საბოლოო შემადგენლობასა და რაოდენობას ჯავშნის დადასტურებისას ერთად ვათანხმებთ.',
    'ალერგიის ან სპეციალური დიეტის შემთხვევაში წინასწარ გვაცნობეთ — ალტერნატივას შევარჩევთ.',
    'ტორტი და ტკბილი მაგიდა მინიმუმ 3 დღით ადრე იკვეთება.',
  ],

  minLeadDays: 1,
  maxAheadDays: 90,
  maxChildren: 40,
}

export const seedOpeningHours = [
  { day: 'ორშაბათი – პარასკევი', hours: null },
  { day: 'შაბათი – კვირა', hours: null },
]

/** The venue's weekly pattern. 0 = Sunday … 6 = Saturday. */
export const seedScheduleSlots = [
  { weekday: 0, times: ['11:00', '13:30', '16:00', '18:30'] }, // კვირა
  // ორშაბათი — დასვენება (no row = closed)
  { weekday: 2, times: ['12:00', '14:30', '17:00'] },
  { weekday: 3, times: ['12:00', '14:30', '17:00'] },
  { weekday: 4, times: ['12:00', '14:30', '17:00'] },
  { weekday: 5, times: ['12:00', '14:30', '17:00', '19:30'] },
  { weekday: 6, times: ['11:00', '13:30', '16:00', '18:30'] },
]

export const SLOT_DURATION_MINUTES = 120

export const seedPrograms = [
  {
    id: 'football',
    title: 'ფეხბურთის პროგრამა',
    tagline: 'გვირგვინი, ბალი და ნამდვილი სამეფო ზეიმი',
    description:
      'ენერგიული საფეხბურთო პროგრამა, სადაც ბავშვები ორ გუნდად იყოფიან, გადიან სახალისო შეჯიბრებებს, იბრძვიან ჩემპიონთა თასისთვის და ბოლოს იუბილარს მედალს გადასცემენ.',
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
    highlights: [
      'გუნდური მისიები',
      'ნიღბები და აქსესუარები',
      'სახალისო გამოცდები',
      'დიპლომის ცერემონია',
    ],
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
    featured: false,
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
    featured: false,
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
    featured: false,
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
    featured: false,
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
    featured: false,
  },
]

export const seedActivities = [
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

export const seedBenefits = [
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
    description:
      'გუნდი, რომელიც ბავშვებს ყურადღებას ერთ წუთსაც არ ჩამოაცილებს და მშობელს ორგანიზების ტვირთს ხსნის.',
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

export const seedExtras = [
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
  { id: 'cake', title: 'ტორტი', description: 'ტორტის შეკვეთა ზეიმის თემატიკის მიხედვით.', icon: 'Cake' },
  {
    id: 'menu',
    title: 'საბავშვო მენიუ',
    description: 'ზეიმის მაგიდა სტუმრებისთვის — მენიუს ერთად შევადგენთ.',
    icon: 'UtensilsCrossed',
  },
  { id: 'dj', title: 'DJ', description: 'ცოცხალი DJ სეტი და დისკო განათება.', icon: 'Disc3' },
  {
    id: 'giftbags',
    title: 'საჩუქრის ჩანთები',
    description: 'პატარა საჩუქრები თითოეული სტუმრისთვის.',
    icon: 'Gift',
  },
]

export const seedMenu = [
  {
    id: 'sets',
    group: 'food',
    title: 'საზეიმო სეტები',
    description: 'მზა კომპლექტი ერთ სტუმარზე — ყველაზე მარტივი გზა მაგიდის დასათვლელად.',
    icon: 'UtensilsCrossed',
    items: [
      {
        id: 'set-kids',
        title: 'საბავშვო სეტი',
        description: 'ნაგეტსები, ფრი კარტოფილი, ბოსტნეულის ჩხირები და წვენი.',
        price: 18,
        unit: '1 ბავშვი',
        tags: ['popular'],
      },
      {
        id: 'set-royal',
        title: 'სეტი „სამეფო“',
        description: 'მინი ბურგერი, ქათმის სტრიპსები, ფრი, ტკბილეული და ლიმონათი.',
        price: 24,
        unit: '1 ბავშვი',
        tags: [],
      },
      {
        id: 'set-adults',
        title: 'უფროსების სეტი',
        description: 'სენდვიჩები, ყველის ასორტი, ხილი და ცხელი სასმელი.',
        price: 26,
        unit: '1 სტუმარი',
        tags: [],
      },
    ],
  },
  {
    id: 'snacks',
    group: 'food',
    title: 'მსუბუქი კერძები',
    description: 'ხელით საჭმელი, რომელიც თამაშს არ აჩერებს.',
    icon: 'Sandwich',
    items: [
      { id: 'nuggets', title: 'ქათმის ნაგეტსები', description: null, price: 12, unit: '6 ცალი', tags: ['popular'] },
      { id: 'strips', title: 'ქათმის სტრიპსები', description: null, price: 14, unit: '5 ცალი', tags: [] },
      { id: 'fries', title: 'ფრი კარტოფილი', description: null, price: 8, unit: '1 პორცია', tags: [] },
      { id: 'mini-sandwiches', title: 'მინი სენდვიჩები', description: null, price: 15, unit: '6 ცალი', tags: [] },
      { id: 'mini-burgers', title: 'მინი ბურგერები', description: null, price: 18, unit: '4 ცალი', tags: [] },
      {
        id: 'veggie-sticks',
        title: 'ბოსტნეულის ჩხირები',
        description: 'კიტრი, სტაფილო და წიწაკა იოგურტის სოუსით.',
        price: 9,
        unit: '1 პორცია',
        tags: ['veg'],
      },
    ],
  },
  {
    id: 'pizza',
    group: 'food',
    title: 'პიცა და ცომეული',
    description: 'ცხელი მაგიდა, რომელიც მთელ კომპანიას ჰყოფნის.',
    icon: 'Pizza',
    items: [
      { id: 'margherita', title: 'პიცა მარგარიტა', description: null, price: 22, unit: '30 სმ', tags: ['veg'] },
      { id: 'pepperoni', title: 'პიცა პეპერონი', description: null, price: 26, unit: '30 სმ', tags: ['popular'] },
      { id: 'four-cheese', title: 'პიცა ოთხი ყველით', description: null, price: 28, unit: '30 სმ', tags: ['veg'] },
      { id: 'khachapuri', title: 'იმერული ხაჭაპური', description: null, price: 14, unit: '1 ცალი', tags: ['veg'] },
      {
        id: 'pizza-bites',
        title: 'საბავშვო პიცა-ნაჭრები',
        description: 'პატარა, ხელით ასაღები ნაჭრები.',
        price: 16,
        unit: '8 ნაჭერი',
        tags: [],
      },
    ],
  },
  {
    id: 'sweets',
    group: 'food',
    title: 'ტკბილეული და ტორტი',
    description: 'ზეიმის მთავარი ცერემონია და ტკბილი მაგიდა.',
    icon: 'Cookie',
    items: [
      {
        id: 'cake',
        title: 'დაბადების დღის ტორტი',
        description: 'თემატური დიზაინი — შეკვეთა მინიმუმ 3 დღით ადრე.',
        price: 45,
        unit: '1 კგ',
        tags: ['popular'],
      },
      { id: 'cupcakes', title: 'კაფქეიქები', description: null, price: 18, unit: '6 ცალი', tags: ['veg'] },
      { id: 'donuts', title: 'დონატები', description: null, price: 15, unit: '6 ცალი', tags: ['veg'] },
      { id: 'popcorn', title: 'პოპკორნი', description: null, price: 10, unit: 'დიდი კალათა', tags: ['veg'] },
      {
        id: 'candy-bar',
        title: 'ტკბილი მაგიდა',
        description: 'მარშმელოუ, ჟელეები და ორნამენტული დეკორაცია ზეიმის ფერებში.',
        price: 12,
        unit: '1 სტუმარი',
        tags: [],
      },
      { id: 'icecream', title: 'ნაყინის კუთხე', description: null, price: 7, unit: '1 სტუმარი', tags: ['veg'] },
    ],
  },
  {
    id: 'cold-drinks',
    group: 'drinks',
    title: 'გამაგრილებელი სასმელები',
    description: 'მაგიდაზე მუდმივად შევსებული დოზატორები და ბოთლები.',
    icon: 'CupSoda',
    items: [
      { id: 'lemonade', title: 'ლიმონათი', description: null, price: 7, unit: '1 ლ', tags: ['popular'] },
      {
        id: 'lemonade-dispenser',
        title: 'ლიმონათი დოზატორით',
        description: 'ხილის დეკორაციით, ზეიმის მაგიდაზე.',
        price: 30,
        unit: '5 ლ',
        tags: [],
      },
      { id: 'juice', title: 'ბუნებრივი წვენი', description: null, price: 9, unit: '1 ლ', tags: ['veg'] },
      { id: 'water', title: 'წყალი', description: null, price: 2, unit: '0.5 ლ', tags: [] },
      { id: 'milkshake', title: 'მილქშეიქი', description: null, price: 9, unit: '1 ჭიქა', tags: [] },
    ],
  },
  {
    id: 'hot-drinks',
    group: 'drinks',
    title: 'ცხელი სასმელები',
    description: 'მშობლების კუთხისთვის, სანამ ბავშვები თამაშობენ.',
    icon: 'Coffee',
    items: [
      { id: 'hot-chocolate', title: 'ცხელი შოკოლადი', description: null, price: 8, unit: '1 ჭიქა', tags: ['popular'] },
      { id: 'tea', title: 'ჩაი', description: null, price: 5, unit: '1 ჭიქა', tags: ['veg'] },
      { id: 'americano', title: 'ესპრესო / ამერიკანო', description: null, price: 6, unit: '1 ჭიქა', tags: [] },
      { id: 'cappuccino', title: 'კაპუჩინო', description: null, price: 8, unit: '1 ჭიქა', tags: [] },
    ],
  },
]

export const seedGalleryCategories = [
  { id: 'zeimi', label: 'ზეიმები' },
  { id: 'aqtivobebi', label: 'აქტივობები' },
  { id: 'photozona', label: 'ფოტოზონები' },
  { id: 'dekoracia', label: 'დეკორაცია' },
  { id: 'torti', label: 'ტორტები' },
]

const galleryImg = (id: string) => img(id, 1400)

export const seedGallery = [
  { id: 'g01', src: galleryImg('photo-1509666537727-9154b6962292'), alt: 'ორი გოგონა საზეიმო ქუდებით და ბუშტით', category: 'zeimi', span: 'tall' },
  { id: 'g02', src: galleryImg('photo-1608790672275-309c02d888ff'), alt: 'ბავშვები ტორტზე სანთლებს აქრობენ', category: 'zeimi', span: 'normal' },
  { id: 'g03', src: galleryImg('photo-1707589338174-dc1ddc18945a'), alt: 'ბუშტების თაღი ფოტოზონაში', category: 'photozona', span: 'tall' },
  { id: 'g04', src: galleryImg('photo-1765947380154-0928682783b2'), alt: 'ბავშვები ეზოში სახალისო თამაშს თამაშობენ', category: 'aqtivobebi', span: 'normal' },
  { id: 'g05', src: galleryImg('photo-1504196606672-aef5c9cefc92'), alt: 'ფერადი ჰელიუმის ბუშტები', category: 'dekoracia', span: 'normal' },
  { id: 'g06', src: galleryImg('photo-1519340241574-2cec6aef0c01'), alt: 'ორი ბიჭი სუპერგმირების კოსტიუმებში', category: 'aqtivobebi', span: 'tall' },
  { id: 'g07', src: galleryImg('photo-1578922864601-79dcc7cbcea9'), alt: 'დაბადების დღის კექსები საზეიმო ბარათებით', category: 'torti', span: 'normal' },
  { id: 'g08', src: galleryImg('photo-1730724620698-42f23877153d'), alt: 'ბავშვები სცენაზე მიკროფონებით და დისკო განათებით', category: 'aqtivobebi', span: 'wide' },
  { id: 'g09', src: galleryImg('photo-1628016354739-6c65f0e11c24'), alt: 'გოგონას სახეს ხატავენ ზეიმზე', category: 'aqtivobebi', span: 'normal' },
  { id: 'g10', src: galleryImg('photo-1615445565741-c60a9edd393f'), alt: 'ბიჭი საზეიმო ქუდით ბუშტების ფონზე', category: 'zeimi', span: 'tall' },
  { id: 'g11', src: galleryImg('photo-1765947385432-a343060608f9'), alt: 'გაწყობილი საზეიმო მაგიდა ბავშვებისთვის', category: 'dekoracia', span: 'normal' },
  { id: 'g12', src: galleryImg('photo-1514793302631-293f95fcd7e7'), alt: 'ბავშვის სახეზე დახატული პერსონაჟი', category: 'aqtivobebi', span: 'normal' },
  { id: 'g13', src: galleryImg('photo-1783153918493-55acf5d278db'), alt: 'ლურჯი საზეიმო დეკორაცია ბუშტებით', category: 'dekoracia', span: 'tall' },
  { id: 'g14', src: galleryImg('photo-1493711662062-fa541adb3fc8'), alt: 'ბავშვები სათამაშო კონსოლით თამაშობენ', category: 'aqtivobebi', span: 'normal' },
  { id: 'g15', src: galleryImg('photo-1585421079919-44c712bdf839'), alt: 'ორი ბავშვი ერთად იცინის', category: 'zeimi', span: 'normal' },
  { id: 'g16', src: galleryImg('photo-1555607124-8531c7c702d0'), alt: 'ტორტი და „Happy Birthday“ გირლანდა', category: 'torti', span: 'wide' },
  { id: 'g17', src: galleryImg('photo-1777332547120-e7ec407b5ed6'), alt: 'ბუშტების დეკორაცია ტორტის მაგიდასთან', category: 'dekoracia', span: 'normal' },
  { id: 'g18', src: galleryImg('photo-1698966165570-2c1d256c596c'), alt: 'ილუზიონისტის შოუ ზეიმზე', category: 'aqtivobebi', span: 'tall' },
  { id: 'g19', src: galleryImg('photo-1516668557604-c8e814fdb184'), alt: 'გოგონა ტორტზე სანთელს აქრობს', category: 'torti', span: 'normal' },
  { id: 'g20', src: galleryImg('photo-1643214341435-09bef932414a'), alt: 'ბავშვები საზეიმო მაგიდასთან', category: 'zeimi', span: 'normal' },
  { id: 'g21', src: galleryImg('photo-1765947380775-712a88940f8a'), alt: 'გოგონა პინიატას არტყამს ზეიმზე', category: 'aqtivobebi', span: 'normal' },
  { id: 'g22', src: galleryImg('photo-1504437484202-613bb51ce359'), alt: 'გოგონა ბუშტებთან საზეიმო კაბაში', category: 'photozona', span: 'tall' },
]
