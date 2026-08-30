import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ContentProvider } from '@/content'
import HomePage from '@/pages/HomePage'
import ProgramsPage from '@/pages/ProgramsPage'
import MenuPage from '@/pages/MenuPage'
import GalleryPage from '@/pages/GalleryPage'
import LocationPage from '@/pages/LocationPage'
import BookingPage from '@/pages/BookingPage'
import NotFoundPage from '@/pages/NotFoundPage'

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
            <Route path="booking" element={<BookingPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ContentProvider>
  )
}
