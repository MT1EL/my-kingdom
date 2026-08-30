import { useState } from 'react'
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from 'lucide-react'
import type { MenuTag } from '@shared/types'
import { api } from '@/lib/api'
import { errorFields, errorMessage, useApiResource } from '@/lib/useResource'
import { useToast } from '@/components/ui/Toasts'
import {
  Badge,
  Button,
  Card,
  CardHeader,
  ConfirmDialog,
  EmptyNote,
  ErrorNote,
  Modal,
  Spinner,
} from '@/components/ui'
import { FormField, type FieldSpec, type FormValues } from '@/components/resource/fields'
import { LucideIcon } from '@/components/resource/LucideIcon'
import { cn } from '@/lib/cn'

/* ------------------------------------------------------------------
   The menu.

   Unlike the other content types this is a tree: categories hold dishes.
   It is edited as one screen because that is how the owner thinks about
   it — "add a drink to the cold drinks section", not "create an item and
   then attach it to a category".
------------------------------------------------------------------- */

interface AdminMenuItem {
  id: string
  categoryId: string
  title: string
  description?: string | null
  price: number | null
  unit?: string | null
  tags: MenuTag[]
  published: boolean
  sortOrder: number
}

interface AdminMenuCategory {
  id: string
  group: 'food' | 'drinks'
  title: string
  description: string
  icon: string
  published: boolean
  sortOrder: number
  items: AdminMenuItem[]
}

const TAG_LABELS: Record<MenuTag, string> = {
  veg: 'ვეგეტარიანული',
  popular: 'ხშირად ირჩევენ',
}

const categoryFields: FieldSpec[] = [
  { kind: 'text', name: 'title', label: 'სათაური', required: true },
  {
    kind: 'select',
    name: 'group',
    label: 'ჯგუფი',
    options: [
      { value: 'food', label: 'საჭმელი' },
      { value: 'drinks', label: 'სასმელი' },
    ],
  },
  { kind: 'textarea', name: 'description', label: 'აღწერა', rows: 2, required: true, full: true },
  { kind: 'icon', name: 'icon', label: 'აიკონი', full: true },
  { kind: 'boolean', name: 'published', label: 'გამოქვეყნებული', full: true },
]

const itemFields: FieldSpec[] = [
  { kind: 'text', name: 'title', label: 'დასახელება', required: true },
  { kind: 'price', name: 'price', label: 'ფასი' },
  { kind: 'textarea', name: 'description', label: 'აღწერა', rows: 2, full: true },
  {
    kind: 'text',
    name: 'unit',
    label: 'რაზე ვრცელდება ფასი',
    placeholder: 'მაგ. 6 ცალი, 1 ბავშვი, 1 ლ',
  },
  {
    kind: 'multi',
    name: 'tags',
    label: 'ნიშნები',
    options: (Object.keys(TAG_LABELS) as MenuTag[]).map((value) => ({
      value,
      label: TAG_LABELS[value],
    })),
  },
  { kind: 'boolean', name: 'published', label: 'გამოქვეყნებული', full: true },
]

const blankCategory: FormValues = {
  title: '',
  group: 'food',
  description: '',
  icon: 'UtensilsCrossed',
  published: true,
}

const blankItem = (categoryId: string): FormValues => ({
  categoryId,
  title: '',
  description: '',
  price: null,
  unit: '',
  tags: [],
  published: true,
})

type Editing =
  | { type: 'category'; id: string | null; values: FormValues }
  | { type: 'item'; id: string | null; values: FormValues }

type Deleting =
  | { type: 'category'; id: string; label: string }
  | { type: 'item'; id: string; label: string }

export function MenuScreen() {
  const resource = useApiResource<AdminMenuCategory[]>('/api/admin/menu')
  const toast = useToast()

  const [editing, setEditing] = useState<Editing | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<Deleting | null>(null)
  const [busy, setBusy] = useState(false)

  const categories = resource.data ?? []

  const change = (name: string, value: unknown) => {
    setEditing((current) =>
      current ? { ...current, values: { ...current.values, [name]: value } } : current,
    )
    setFormErrors((current) => {
      if (!current[name]) return current
      const next = { ...current }
      delete next[name]
      return next
    })
  }

  const save = async () => {
    if (!editing) return
    setSaving(true)
    setFormErrors({})

    const base = editing.type === 'category' ? '/api/admin/menu-categories' : '/api/admin/menu-items'
    const noun = editing.type === 'category' ? 'კატეგორია' : 'პოზიცია'

    try {
      if (editing.id) {
        await api.patch(`${base}/${editing.id}`, editing.values)
        toast.success(`${noun} განახლდა.`)
      } else {
        await api.post(base, editing.values)
        toast.success(`${noun} დაემატა.`)
      }
      setEditing(null)
      resource.reload()
    } catch (error) {
      setFormErrors(errorFields(error))
      toast.error(errorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!deleting) return
    setBusy(true)
    const base = deleting.type === 'category' ? '/api/admin/menu-categories' : '/api/admin/menu-items'
    try {
      await api.delete(`${base}/${deleting.id}`)
      toast.success('წაიშალა.')
      setDeleting(null)
      resource.reload()
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  /** Reorders within one category; the server stores order per list. */
  const moveItem = async (category: AdminMenuCategory, index: number, delta: number) => {
    const target = index + delta
    if (target < 0 || target >= category.items.length) return

    const items = [...category.items]
    const [moved] = items.splice(index, 1)
    items.splice(target, 0, moved!)

    resource.set(
      categories.map((entry) => (entry.id === category.id ? { ...entry, items } : entry)),
    )

    try {
      await api.post('/api/admin/menu-items/reorder', { ids: items.map((item) => item.id) })
    } catch (error) {
      resource.set(categories)
      toast.error(errorMessage(error))
    }
  }

  const fields = editing?.type === 'category' ? categoryFields : itemFields

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader
          title="მენიუ"
          description="კერძები, სასმელები და ფასები. ცარიელი ფასი საიტზე „დასაზუსტებელია“-დ გამოჩნდება."
          actions={
            <Button
              onClick={() => {
                setFormErrors({})
                setEditing({ type: 'category', id: null, values: blankCategory })
              }}
            >
              <Plus className="size-4" />
              კატეგორია
            </Button>
          }
        />

        <div className="flex flex-col gap-4 p-4 sm:p-5">
          {resource.loading && <Spinner />}
          {resource.error && !resource.loading && (
            <ErrorNote message={resource.error.message} onRetry={resource.reload} />
          )}
          {!resource.loading && !resource.error && categories.length === 0 && (
            <EmptyNote>მენიუ ჯერ ცარიელია — დაამატეთ პირველი კატეგორია.</EmptyNote>
          )}

          {categories.map((category) => (
            <section
              key={category.id}
              className={cn(
                'rounded-xl border border-royal-100',
                !category.published && 'bg-slate-25 opacity-70',
              )}
            >
              <header className="flex flex-wrap items-center gap-3 border-b border-royal-100 px-4 py-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-royal-100 text-royal-700">
                  <LucideIcon name={category.icon} className="size-4" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 font-semibold text-royal-950">
                    {category.title}
                    <Badge>{category.group === 'drinks' ? 'სასმელი' : 'საჭმელი'}</Badge>
                    {!category.published && <Badge tone="warning">დამალული</Badge>}
                  </p>
                  <p className="truncate text-sm text-royal-900/60">{category.description}</p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setFormErrors({})
                      setEditing({ type: 'item', id: null, values: blankItem(category.id) })
                    }}
                  >
                    <Plus className="size-4" />
                    პოზიცია
                  </Button>
                  <button
                    type="button"
                    aria-label={`კატეგორიის რედაქტირება: ${category.title}`}
                    onClick={() => {
                      setFormErrors({})
                      setEditing({
                        type: 'category',
                        id: category.id,
                        values: {
                          title: category.title,
                          group: category.group,
                          description: category.description,
                          icon: category.icon,
                          published: category.published,
                        },
                      })
                    }}
                    className="grid size-9 place-items-center rounded-lg text-royal-900/60 transition-colors hover:bg-royal-100"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`კატეგორიის წაშლა: ${category.title}`}
                    onClick={() =>
                      setDeleting({ type: 'category', id: category.id, label: category.title })
                    }
                    className="grid size-9 place-items-center rounded-lg text-royal-900/60 transition-colors hover:bg-candy-100 hover:text-candy-700"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </header>

              {category.items.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-royal-900/50">
                  ამ კატეგორიაში ჯერ არაფერია.
                </p>
              ) : (
                <ul className="divide-y divide-royal-100">
                  {category.items.map((item, index) => (
                    <li
                      key={item.id}
                      className={cn(
                        'flex items-center gap-3 px-4 py-2.5',
                        !item.published && 'opacity-60',
                      )}
                    >
                      <div className="flex shrink-0 flex-col">
                        <button
                          type="button"
                          onClick={() => void moveItem(category, index, -1)}
                          disabled={index === 0}
                          aria-label="ზემოთ"
                          className="grid size-5 place-items-center rounded text-royal-900/40 transition-colors hover:bg-royal-100 disabled:pointer-events-none disabled:opacity-25"
                        >
                          <ChevronUp className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void moveItem(category, index, 1)}
                          disabled={index === category.items.length - 1}
                          aria-label="ქვემოთ"
                          className="grid size-5 place-items-center rounded text-royal-900/40 transition-colors hover:bg-royal-100 disabled:pointer-events-none disabled:opacity-25"
                        >
                          <ChevronDown className="size-3.5" />
                        </button>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-royal-950">
                          {item.title}
                          {item.tags.map((tag) => (
                            <Badge key={tag} tone={tag === 'veg' ? 'success' : 'warning'}>
                              {TAG_LABELS[tag]}
                            </Badge>
                          ))}
                          {!item.published && <Badge tone="warning">დამალული</Badge>}
                        </p>
                        {item.description && (
                          <p className="truncate text-xs text-royal-900/55">{item.description}</p>
                        )}
                      </div>

                      <div className="shrink-0 text-right">
                        {item.price === null ? (
                          <Badge>დასაზუსტებელია</Badge>
                        ) : (
                          <span className="text-sm font-bold text-royal-800">{item.price} ₾</span>
                        )}
                        {item.unit && (
                          <span className="block text-xs text-royal-900/45">/ {item.unit}</span>
                        )}
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          aria-label={`რედაქტირება: ${item.title}`}
                          onClick={() => {
                            setFormErrors({})
                            setEditing({
                              type: 'item',
                              id: item.id,
                              values: {
                                categoryId: item.categoryId,
                                title: item.title,
                                description: item.description ?? '',
                                price: item.price,
                                unit: item.unit ?? '',
                                tags: item.tags,
                                published: item.published,
                              },
                            })
                          }}
                          className="grid size-8 place-items-center rounded-lg text-royal-900/55 transition-colors hover:bg-royal-100"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label={`წაშლა: ${item.title}`}
                          onClick={() => setDeleting({ type: 'item', id: item.id, label: item.title })}
                          className="grid size-8 place-items-center rounded-lg text-royal-900/55 transition-colors hover:bg-candy-100 hover:text-candy-700"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </Card>

      <Modal
        open={editing !== null}
        wide
        title={
          editing?.type === 'category'
            ? editing.id
              ? 'კატეგორია — რედაქტირება'
              : 'ახალი კატეგორია'
            : editing?.id
              ? 'პოზიცია — რედაქტირება'
              : 'ახალი პოზიცია'
        }
        onClose={() => setEditing(null)}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void save()
          }}
        >
          <div className="grid max-h-[65dvh] gap-4 overflow-y-auto px-5 py-5 sm:grid-cols-2">
            {editing &&
              fields.map((field) => (
                <FormField
                  key={field.name}
                  spec={field}
                  value={editing.values[field.name]}
                  error={formErrors[field.name]}
                  onChange={change}
                />
              ))}
          </div>

          <div className="flex justify-end gap-2 border-t border-royal-100 px-5 py-4">
            <Button type="button" variant="secondary" onClick={() => setEditing(null)} disabled={saving}>
              გაუქმება
            </Button>
            <Button type="submit" loading={saving}>
              შენახვა
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        busy={busy}
        title="წაშლა"
        message={
          deleting
            ? deleting.type === 'category'
              ? `კატეგორია „${deleting.label}“ წაიშლება. ჯერ უნდა დაცარიელდეს — თუ კერძები დარჩა, სერვერი წაშლას არ დაუშვებს.`
              : `„${deleting.label}“ სამუდამოდ წაიშლება.`
            : ''
        }
        onConfirm={() => void remove()}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
