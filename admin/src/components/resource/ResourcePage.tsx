import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { ChevronDown, ChevronUp, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react'
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
import { cn } from '@/lib/cn'

/* ------------------------------------------------------------------
   One screen for every content type.

   Programmes, activities, benefits, extras, gallery photos and menu
   categories differ only in their fields and how a row is summarised.
   Everything else — list, add, edit, delete, reorder, error handling —
   is the same, so it lives here once.
------------------------------------------------------------------- */

/** The minimum an item must have for this page to manage it. */
export interface ManagedItem {
  id: string
  published?: boolean
  [key: string]: unknown
}

export interface ResourceConfig<T extends ManagedItem> {
  /** API path, e.g. "/api/admin/programs". */
  path: string
  title: string
  description: string
  /** Singular, used in buttons and dialogs: "პროგრამა". */
  noun: string
  fields: FieldSpec[]
  /** Values a new item starts with. */
  blank: FormValues
  /** How a row is shown in the list. */
  renderRow: (item: T) => ReactNode
  /** Used in the delete confirmation. */
  labelOf: (item: T) => string
  /** Set false for lists where display order does not matter. */
  reorderable?: boolean
  /** Extra content under the list, e.g. a note about the API. */
  footer?: ReactNode
}

export function ResourcePage<T extends ManagedItem>({ config }: { config: ResourceConfig<T> }) {
  const { path, fields, blank } = config
  const resource = useApiResource<T[]>(path)
  const toast = useToast()

  const [editing, setEditing] = useState<T | null>(null)
  const [creating, setCreating] = useState(false)
  const [values, setValues] = useState<FormValues>(blank)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<T | null>(null)
  const [busy, setBusy] = useState(false)

  const items = useMemo(() => resource.data ?? [], [resource.data])

  const openCreate = () => {
    setValues(blank)
    setFormErrors({})
    setEditing(null)
    setCreating(true)
  }

  const openEdit = (item: T) => {
    // Only the configured fields are editable; everything else on the row
    // (timestamps, ids) is left untouched by the PATCH.
    const next: FormValues = {}
    for (const field of fields) next[field.name] = item[field.name]
    setValues(next)
    setFormErrors({})
    setCreating(false)
    setEditing(item)
  }

  const closeForm = () => {
    setCreating(false)
    setEditing(null)
    setSaving(false)
  }

  const change = useCallback((name: string, value: unknown) => {
    setValues((current) => ({ ...current, [name]: value }))
    setFormErrors((current) => {
      if (!current[name]) return current
      const next = { ...current }
      delete next[name]
      return next
    })
  }, [])

  const save = async () => {
    setSaving(true)
    setFormErrors({})
    try {
      if (editing) {
        await api.patch(`${path}/${editing.id}`, values)
        toast.success(`${config.noun} განახლდა.`)
      } else {
        await api.post(path, values)
        toast.success(`${config.noun} დაემატა.`)
      }
      closeForm()
      resource.reload()
    } catch (error) {
      const fieldMessages = errorFields(error)
      setFormErrors(fieldMessages)
      toast.error(errorMessage(error))
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!deleting) return
    setBusy(true)
    try {
      await api.delete(`${path}/${deleting.id}`)
      toast.success(`${config.noun} წაიშალა.`)
      setDeleting(null)
      resource.reload()
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  /** Moves an item one place up or down and persists the whole order. */
  const move = async (index: number, delta: number) => {
    const target = index + delta
    if (target < 0 || target >= items.length) return

    const next = [...items]
    const [moved] = next.splice(index, 1)
    next.splice(target, 0, moved!)

    // Optimistic: the list reorders instantly, and reverts if the save fails.
    resource.set(next)
    try {
      await api.post(`${path}/reorder`, { ids: next.map((item) => item.id) })
    } catch (error) {
      resource.set(items)
      toast.error(errorMessage(error))
    }
  }

  const formOpen = creating || editing !== null

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader
          title={config.title}
          description={config.description}
          actions={
            <Button onClick={openCreate}>
              <Plus className="size-4" />
              დამატება
            </Button>
          }
        />

        <div className="p-4 sm:p-5">
          {resource.loading && <Spinner />}

          {resource.error && !resource.loading && (
            <ErrorNote message={resource.error.message} onRetry={resource.reload} />
          )}

          {!resource.loading && !resource.error && items.length === 0 && (
            <EmptyNote>ჯერ არაფერია დამატებული.</EmptyNote>
          )}

          {!resource.loading && items.length > 0 && (
            <ul className="flex flex-col gap-2">
              {items.map((item, index) => (
                <li
                  key={item.id}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border border-royal-100 bg-white p-3 transition-colors hover:border-royal-200',
                    item.published === false && 'bg-slate-25 opacity-70',
                  )}
                >
                  {config.reorderable !== false && (
                    <div className="flex shrink-0 flex-col">
                      <button
                        type="button"
                        onClick={() => void move(index, -1)}
                        disabled={index === 0}
                        aria-label="ზემოთ გადატანა"
                        className="grid size-6 place-items-center rounded text-royal-900/45 transition-colors hover:bg-royal-100 hover:text-royal-800 disabled:pointer-events-none disabled:opacity-25"
                      >
                        <ChevronUp className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void move(index, 1)}
                        disabled={index === items.length - 1}
                        aria-label="ქვემოთ გადატანა"
                        className="grid size-6 place-items-center rounded text-royal-900/45 transition-colors hover:bg-royal-100 hover:text-royal-800 disabled:pointer-events-none disabled:opacity-25"
                      >
                        <ChevronDown className="size-4" />
                      </button>
                    </div>
                  )}

                  <div className="min-w-0 flex-1">{config.renderRow(item)}</div>

                  {item.published === false && (
                    <Badge tone="warning">
                      <EyeOff className="mr-1 inline size-3" />
                      დამალული
                    </Badge>
                  )}

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      aria-label={`რედაქტირება: ${config.labelOf(item)}`}
                      className="grid size-9 place-items-center rounded-lg text-royal-900/60 transition-colors hover:bg-royal-100 hover:text-royal-800"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(item)}
                      aria-label={`წაშლა: ${config.labelOf(item)}`}
                      className="grid size-9 place-items-center rounded-lg text-royal-900/60 transition-colors hover:bg-candy-100 hover:text-candy-700"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {config.footer}
        </div>
      </Card>

      <Modal
        open={formOpen}
        wide
        title={editing ? `${config.noun} — რედაქტირება` : `ახალი ${config.noun}`}
        onClose={closeForm}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void save()
          }}
        >
          <div className="grid max-h-[65dvh] gap-4 overflow-y-auto px-5 py-5 sm:grid-cols-2">
            {fields.map((field) => (
              <FormField
                key={field.name}
                spec={field}
                value={values[field.name]}
                error={formErrors[field.name]}
                onChange={change}
              />
            ))}
          </div>

          <div className="flex justify-end gap-2 border-t border-royal-100 px-5 py-4">
            <Button type="button" variant="secondary" onClick={closeForm} disabled={saving}>
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
        title={`${config.noun}ს წაშლა`}
        message={
          deleting
            ? `„${config.labelOf(deleting)}“ სამუდამოდ წაიშლება. თუ მხოლოდ დროებით გინდათ დამალვა, რედაქტირებაში მოხსენით „გამოქვეყნებული“.`
            : ''
        }
        onConfirm={() => void remove()}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
