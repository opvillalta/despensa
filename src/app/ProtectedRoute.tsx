import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../features/auth/hooks/useAuth'
import { BottomNav } from '../components/BottomNav'

export function ProtectedRoute() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-24 text-zinc-900">
      <main className="max-w-md mx-auto min-h-screen p-4">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
