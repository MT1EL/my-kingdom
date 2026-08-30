import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { AuthProvider, useAuth } from '@/auth/AuthProvider'
import { LoginPage } from '@/auth/LoginPage'
import { ToastProvider } from '@/components/ui/Toasts'
import { Shell } from '@/components/Shell'
import { OverviewScreen } from '@/pages/OverviewScreen'
import { BookingsScreen } from '@/pages/BookingsScreen'
import { ScheduleScreen } from '@/pages/ScheduleScreen'
import { MenuScreen } from '@/pages/MenuScreen'
import {
  ActivitiesScreen,
  BenefitsScreen,
  ExtrasScreen,
  GalleryScreen,
  ProgramsScreen,
} from '@/pages/content'
import { SettingsScreen } from '@/pages/SettingsScreen'

/**
 * Nothing renders until `/api/auth/me` has answered — otherwise a refresh
 * would flash the login screen at somebody who is already signed in.
 */
function Gate() {
  const { user, checking } = useAuth()

  if (checking) {
    return (
      <div className="grid min-h-dvh place-items-center text-royal-900/50" role="status">
        <Loader2 className="size-6 animate-spin" />
      </div>
    )
  }

  if (!user) return <LoginPage />

  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<OverviewScreen />} />
        <Route path="bookings" element={<BookingsScreen />} />
        <Route path="schedule" element={<ScheduleScreen />} />
        <Route path="programs" element={<ProgramsScreen />} />
        <Route path="menu" element={<MenuScreen />} />
        <Route path="gallery" element={<GalleryScreen />} />
        <Route path="activities" element={<ActivitiesScreen />} />
        <Route path="benefits" element={<BenefitsScreen />} />
        <Route path="extras" element={<ExtrasScreen />} />
        <Route path="settings" element={<SettingsScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Gate />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
