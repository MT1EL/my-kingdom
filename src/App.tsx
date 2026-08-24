import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import HomePage from '@/pages/HomePage'
import ProgramsPage from '@/pages/ProgramsPage'
import GalleryPage from '@/pages/GalleryPage'
import LocationPage from '@/pages/LocationPage'
import BookingPage from '@/pages/BookingPage'
import NotFoundPage from '@/pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="programs" element={<ProgramsPage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="location" element={<LocationPage />} />
          <Route path="booking" element={<BookingPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
