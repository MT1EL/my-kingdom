import type { MenuItem, MenuTag } from '@/types'
import { formatPrice, menuTagLabels } from '@/lib/menu'
import { cn } from '@/lib/cn'

interface MenuItemRowProps {
  item: MenuItem
}

const tagStyles: Record<MenuTag, string> = {
  veg: 'bg-mint-100 text-mint-700',
  popular: 'bg-sun-100 text-sun-700',
}

export function MenuItemRow({ item }: MenuItemRowProps) {
  const price = formatPrice(item.price)

  return (
    <li className="flex items-start gap-4 py-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <span className="font-semibold text-royal-950">{item.title}</span>
          {item.tags?.map((tag) => (
            <span
              key={tag}
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.7rem] font-bold',
                tagStyles[tag],
              )}
            >
              {menuTagLabels[tag]}
            </span>
          ))}
        </div>
        {item.description && (
          <p className="mt-1 text-pretty text-sm leading-snug text-royal-900/60">
            {item.description}
          </p>
        )}
      </div>

      <div className="shrink-0 text-right">
        {price ? (
          <span className="font-display text-lg font-bold text-royal-800">{price}</span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-royal-100/80 px-2.5 py-0.5 text-sm font-medium text-royal-600">
            დასაზუსტებელია
          </span>
        )}
        {item.unit && (
          <span className="mt-0.5 block text-xs font-medium text-royal-900/50">/ {item.unit}</span>
        )}
      </div>
    </li>
  )
}
