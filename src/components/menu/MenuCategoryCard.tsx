import type { MenuCategory } from '@/types'
import { Icon } from '@/components/ui/Icon'
import { MenuItemRow } from '@/components/menu/MenuItemRow'

interface MenuCategoryCardProps {
  category: MenuCategory
}

export function MenuCategoryCard({ category }: MenuCategoryCardProps) {
  return (
    <article
      id={category.id}
      className="flex h-full flex-col overflow-hidden rounded-4xl border border-royal-100 bg-white shadow-soft transition-shadow duration-500 hover:shadow-lift"
    >
      <header className="flex items-start gap-4 border-b border-royal-100 bg-royal-50/60 p-6 sm:p-7">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl gradient-royal text-white">
          <Icon name={category.icon} className="size-6" />
        </span>
        <div className="min-w-0">
          <h2 className="text-xl text-royal-950 sm:text-2xl">{category.title}</h2>
          <p className="mt-1.5 text-pretty text-sm leading-relaxed text-royal-900/65">
            {category.description}
          </p>
        </div>
      </header>

      <ul className="flex flex-1 flex-col divide-y divide-royal-100 px-6 sm:px-7">
        {category.items.map((item) => (
          <MenuItemRow key={item.id} item={item} />
        ))}
      </ul>
    </article>
  )
}
