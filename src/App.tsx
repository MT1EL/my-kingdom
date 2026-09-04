import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ContentProvider } from '@/content'
import HomePage from '@/pages/HomePage'
import ProgramsPage from '@/pages/ProgramsPage'
import MenuPage from '@/pages/MenuPage'
import GalleryPage from '@/pages/GalleryPage'
import LocationPage from '@/pages/LocationPage'
import BookingPage from '@/pages/BookingPage'
import NotFoundPage from '@/pages/NotFoundPage'
import { bookingEnabled } from '@/lib/features'

export default function App() {
  return (
    <ContentProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="programs" element={<ProgramsPage />} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="gallery" element={<GalleryPage />} />
            <Route path="location" element={<LocationPage />} />
            {/* Switched off with VITE_BOOKING_ENABLED=false. The route stays
                registered and redirects, so links already out in the world
                (and bookmarks) land on the home page rather than a 404. */}
            <Route
              path="booking"
              element={bookingEnabled ? <BookingPage /> : <Navigate to="/" replace />}
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ContentProvider>
  )
}
