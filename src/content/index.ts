import { useContext, useMemo } from 'react'
import { ContentContext, type ContentState } from '@/content/ContentProvider'
import type {
  Activity,
  Benefit,
  ContentBundle,
  Extra,
  GalleryCategoryOption,
  GalleryImage,
  MenuCategory,
  Program,
  SiteConfig,
} from '@/types'

export { ContentProvider } from '@/content/ContentProvider'
export type { ContentState } from '@/content/ContentProvider'

/* ------------------------------------------------------------------
   Hooks for reading site content.

   `useContentState` is for the one component that renders the loading and
   error screens (`Layout`). Everything below it is rendered only once the
   content has arrived, so those hooks return the data directly — no `null`
   checks scattered through the components.
------------------------------------------------------------------- */

export function useContentState(): ContentState {
  const state = useContext(ContentContext)
  if (!state) {
    throw new Error('useContentState must be used inside <ContentProvider>')
  }
  return state
}

/** Content, guaranteed loaded. Only call below the Layout's loading gate. */
export function useContent(): ContentBundle {
  const { content } = useContentState()
  if (!content) {
    throw new Error(
      'Site content is not loaded yet — render this below the Layout loading gate.',
    )
  }
  return content
}

export const useSite = (): SiteConfig => useContent().site
export const usePrograms = (): Program[] => useContent().programs
export const useActivities = (): Activity[] => useContent().activities
export const useBenefits = (): Benefit[] => useContent().benefits
export const useExtras = (): Extra[] => useContent().extras
export const useMenu = (): MenuCategory[] => useContent().menu
export const useGallery = (): GalleryImage[] => useContent().gallery
export const useGalleryCategories = (): GalleryCategoryOption[] => useContent().galleryCategories

export function useProgram(id: string | null | undefined): Program | undefined {
  const programs = usePrograms()
  return useMemo(() => programs.find((program) => program.id === id), [programs, id])
}

export function useFeaturedPrograms(): Program[] {
  const programs = usePrograms()
  return useMemo(() => programs.filter((program) => program.featured), [programs])
}

/** Looks up several extras at once, dropping any the venue has since removed. */
export function useSelectedExtras(ids: string[]): Extra[] {
  const extras = useExtras()
  return useMemo(
    () => ids.map((id) => extras.find((extra) => extra.id === id)).filter((extra) => !!extra),
    [extras, ids],
  )
}

/** First N gallery images, for the home-page preview mosaic. */
export function useGalleryPreview(count = 8): GalleryImage[] {
  const gallery = useGallery()
  return useMemo(() => gallery.slice(0, count), [gallery, count])
}

/* --------------------------- derived URLs -------------------------- */

export const mapEmbedUrl = (site: SiteConfig): string =>
  `https://www.google.com/maps?q=${encodeURIComponent(site.map.mapQuery)}&z=${site.map.zoom}&output=embed`

export const mapDirectionsUrl = (site: SiteConfig): string =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(site.map.mapQuery)}`
