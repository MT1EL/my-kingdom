import { useEffect } from 'react'

/** Keeps <title> and the meta description in sync with the active route. */
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title
    if (!description) return

    const tag = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!tag) return

    const previous = tag.content
    tag.content = description
    return () => {
      tag.content = previous
    }
  }, [title, description])
}
