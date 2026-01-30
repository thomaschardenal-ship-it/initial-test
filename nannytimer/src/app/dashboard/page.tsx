'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import TimeHistory from '@/components/TimeHistory'
import WeeklySummary from '@/components/WeeklySummary'
import { WeeklyBarChart, MonthlyLineChart } from '@/components/Charts'
import { AddNannyForm } from '@/components/NannySetup'
import { Profile, TimeEntry } from '@/lib/database.types'
import { getCurrentWeekRange, getWeekNumber } from '@/lib/utils'
import { Clock, LogOut, Loader2, Users, Calendar, Mail } from 'lucide-react'
import Link from 'next/link'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subWeeks, startOfMonth, endOfMonth, eachWeekOfInterval } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function DashboardPage() {
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [nannies, setNannies] = useState<Profile[]>([])
  const [weeklyData, setWeeklyData] = useState<{ day: string; hours: number; minutes: number }[]>([])
  const [monthlyData, setMonthlyData] = useState<{ week: string; hours: number }[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
      } else if (profile?.role === 'nanny') {
        router.push('/timer')
      }
    }
  }, [user, profile, loading, router])

  useEffect(() => {
    const fetchData = async () => {
      if (!profile) return

      // Fetch nannies
      const { data: nannyData } = await supabase
        .from('profiles')
        .select('*')
        .eq('employer_id', profile.id)
        .eq('role', 'nanny')

      if (nannyData) {
        setNannies(nannyData as Profile[])
      }

      // Fetch time entries for charts
      const { start: weekStart, end: weekEnd } = getCurrentWeekRange()

      const { data: entries } = await supabase
        .from('time_entries')
        .select('*')
        .eq('employer_id', profile.id)
        .not('clock_out', 'is', null)
        .gte('clock_in', subWeeks(new Date(), 4).toISOString())
        .order('clock_in', { ascending: true })

      if (entries) {
        // Process weekly data
        const days = eachDayOfInterval({ start: weekStart, end: weekEnd })
        const dailyStats = days.map((day) => {
          const dayStr = format(day, 'yyyy-MM-dd')
          const dayEntries = entries.filter(
            (e: TimeEntry) => format(new Date(e.clock_in), 'yyyy-MM-dd') === dayStr
          )
          const totalMinutes = dayEntries.reduce(
            (sum: number, e: TimeEntry) => sum + (e.duration_minutes || 0),
            0
          )
          return {
            day: format(day, 'EEE', { locale: fr }),
            hours: Math.floor(totalMinutes / 60),
            minutes: totalMinutes % 60
          }
        })
        setWeeklyData(dailyStats)

        // Process monthly data
        const monthStart = startOfMonth(new Date())
        const monthEnd = endOfMonth(new Date())
        const weeks = eachWeekOfInterval(
          { start: monthStart, end: monthEnd },
          { weekStartsOn: 1 }
        )

        const weeklyStats = weeks.map((weekStart) => {
          const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
          const weekEntries = entries.filter((e: TimeEntry) => {
            const entryDate = new Date(e.clock_in)
            return entryDate >= weekStart && entryDate <= weekEnd
          })
          const totalMinutes = weekEntries.reduce(
            (sum: number, e: TimeEntry) => sum + (e.duration_minutes || 0),
            0
          )
          return {
            week: `S${getWeekNumber(weekStart)}`,
            hours: Math.round((totalMinutes / 60) * 10) / 10
          }
        })
        setMonthlyData(weeklyStats)
      }

      setLoadingData(false)
    }

    fetchData()
  }, [profile])

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
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              NannyTimer
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              👋 Bonjour, {profile.full_name?.split(' ')[0]}
            </span>
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
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
          <p className="text-gray-500">Suivez les heures de garde en temps réel</p>
        </div>

        {/* Stats Summary */}
        <WeeklySummary />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loadingData ? (
            <>
              <div className="bg-white rounded-2xl p-6 shadow-lg animate-pulse h-80" />
              <div className="bg-white rounded-2xl p-6 shadow-lg animate-pulse h-80" />
            </>
          ) : (
            <>
              <WeeklyBarChart data={weeklyData} />
              <MonthlyLineChart data={monthlyData} />
            </>
          )}
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Nannies List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-violet-100 rounded-xl p-2">
                  <Users className="w-5 h-5 text-violet-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Mes nounous</h3>
              </div>

              {nannies.length === 0 ? (
                <p className="text-gray-500 text-sm">Aucune nounou associée</p>
              ) : (
                <div className="space-y-3">
                  {nannies.map((nanny) => (
                    <div
                      key={nanny.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-fuchsia-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                        {nanny.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">
                          {nanny.full_name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {nanny.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100">
                <AddNannyForm />
              </div>
            </div>
          </div>

          {/* Recent History */}
          <div className="lg:col-span-2">
            <TimeHistory limit={10} />
          </div>
        </div>

        {/* Email Settings Info */}
        <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-2xl p-6 border border-violet-100">
          <div className="flex items-start gap-4">
            <div className="bg-white rounded-xl p-3 shadow-sm">
              <Mail className="w-6 h-6 text-violet-500" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-1">Récapitulatif hebdomadaire</h3>
              <p className="text-gray-600 text-sm">
                Chaque vendredi soir, après le dernier pointage de la semaine, vous et votre
                nounou recevrez automatiquement un email récapitulatif des heures travaillées.
              </p>
              <p className="text-violet-600 text-sm mt-2 font-medium">
                📧 Envoi à : {profile.email}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
