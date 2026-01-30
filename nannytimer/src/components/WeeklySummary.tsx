'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { getCurrentWeekRange, formatDuration, getWeekNumber } from '@/lib/utils'
import { Clock, TrendingUp, Calendar } from 'lucide-react'

interface WeekStats {
  totalMinutes: number
  daysWorked: number
  averagePerDay: number
}

export default function WeeklySummary() {
  const { profile } = useAuth()
  const [stats, setStats] = useState<WeekStats>({
    totalMinutes: 0,
    daysWorked: 0,
    averagePerDay: 0
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchWeeklyStats = async () => {
      if (!profile) return

      const { start, end } = getCurrentWeekRange()

      let query = supabase
        .from('time_entries')
        .select('*')
        .gte('clock_in', start.toISOString())
        .lte('clock_in', end.toISOString())
        .not('clock_out', 'is', null)

      if (profile.role === 'nanny') {
        query = query.eq('nanny_id', profile.id)
      } else {
        query = query.eq('employer_id', profile.id)
      }

      const { data, error } = await query

      if (!error && data) {
        const totalMinutes = data.reduce(
          (sum: number, entry: { duration_minutes?: number | null }) => sum + (entry.duration_minutes || 0),
          0
        )
        const uniqueDays = new Set(
          data.map((entry: { clock_in: string }) => new Date(entry.clock_in).toDateString())
        ).size

        setStats({
          totalMinutes,
          daysWorked: uniqueDays,
          averagePerDay: uniqueDays > 0 ? Math.round(totalMinutes / uniqueDays) : 0
        })
      }
      setLoading(false)
    }

    fetchWeeklyStats()
  }, [profile])

  const weekNumber = getWeekNumber(new Date())

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-200 rounded-2xl h-32"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total hours this week */}
      <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium">Cette semaine</p>
            <p className="text-3xl font-bold mt-1">
              {formatDuration(stats.totalMinutes)}
            </p>
            <p className="text-white/70 text-sm mt-1">Semaine {weekNumber}</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Days worked */}
      <div className="bg-gradient-to-br from-fuchsia-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium">Jours travaillés</p>
            <p className="text-3xl font-bold mt-1">{stats.daysWorked}</p>
            <p className="text-white/70 text-sm mt-1">sur 5 jours</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Average per day */}
      <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium">Moyenne / jour</p>
            <p className="text-3xl font-bold mt-1">
              {formatDuration(stats.averagePerDay)}
            </p>
            <p className="text-white/70 text-sm mt-1">par jour travaillé</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  )
}
