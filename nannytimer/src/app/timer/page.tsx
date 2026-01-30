'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Timer from '@/components/Timer'
import TimeHistory from '@/components/TimeHistory'
import WeeklySummary from '@/components/WeeklySummary'
import { Clock, LogOut, Loader2, User } from 'lucide-react'
import Link from 'next/link'

export default function TimerPage() {
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
      } else if (profile?.role === 'employer') {
        router.push('/dashboard')
      } else if (profile && !profile.work_address) {
        router.push('/setup')
      }
    }
  }, [user, profile, loading, router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-8 safe-area-bottom">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-white/20">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              NannyTimer
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/50 rounded-full px-3 py-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {profile.full_name}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-xl bg-white/50 text-gray-600 hover:bg-white hover:text-red-500 transition-all"
              title="Déconnexion"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Timer */}
        <Timer />

        {/* Weekly Summary */}
        <WeeklySummary />

        {/* Recent History */}
        <TimeHistory limit={5} />
      </main>
    </div>
  )
}
