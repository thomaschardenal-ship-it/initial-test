'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { TimeEntry } from '@/lib/database.types'
import { formatDate, formatTimeFromDate, formatDuration } from '@/lib/utils'
import { Clock, Calendar, ChevronRight } from 'lucide-react'

interface TimeHistoryProps {
  limit?: number
  showTitle?: boolean
}

export default function TimeHistory({ limit = 10, showTitle = true }: TimeHistoryProps) {
  const { profile } = useAuth()
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchEntries = async () => {
      if (!profile) return

      let query = supabase
        .from('time_entries')
        .select('*')
        .order('clock_in', { ascending: false })
        .limit(limit)

      // Filter based on role
      if (profile.role === 'nanny') {
        query = query.eq('nanny_id', profile.id)
      } else {
        query = query.eq('employer_id', profile.id)
      }

      const { data, error } = await query

      if (!error && data) {
        setEntries(data as TimeEntry[])
      }
      setLoading(false)
    }

    fetchEntries()

    // Subscribe to realtime updates
    const channel = supabase
      .channel('time_entries_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_entries'
        },
        () => {
          fetchEntries()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile, limit])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 py-4 border-b border-gray-100">
            <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      {showTitle && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Historique récent</h3>
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>
      )}

      {entries.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aucun pointage pour le moment</p>
        </div>
      ) : (
        <div className="space-y-1">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-4 py-3 px-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                entry.clock_out
                  ? 'bg-gradient-to-br from-violet-100 to-purple-100'
                  : 'bg-gradient-to-br from-green-100 to-emerald-100'
              }`}>
                <Clock className={`w-5 h-5 ${
                  entry.clock_out ? 'text-violet-600' : 'text-green-600'
                }`} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800">
                  {formatDate(entry.clock_in)}
                </p>
                <p className="text-sm text-gray-500">
                  {formatTimeFromDate(entry.clock_in)}
                  {entry.clock_out ? ` - ${formatTimeFromDate(entry.clock_out)}` : ' - En cours'}
                </p>
              </div>

              <div className="text-right">
                {entry.duration_minutes ? (
                  <span className="inline-block px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm font-medium">
                    {formatDuration(entry.duration_minutes)}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-green-600 text-sm font-medium">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    En cours
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
