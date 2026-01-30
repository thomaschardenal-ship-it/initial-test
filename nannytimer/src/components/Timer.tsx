'use client'

import { useState, useEffect, useCallback } from 'react'
import { Play, Square, MapPin, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useGeolocation } from '@/hooks/useGeolocation'
import { createClient } from '@/lib/supabase'
import { formatTime, formatTimeFromDate } from '@/lib/utils'

interface TimerProps {
  onClockOut?: () => void
}

export default function Timer({ onClockOut }: TimerProps) {
  const { profile } = useAuth()
  const [isRunning, setIsRunning] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null)
  const [clockInTime, setClockInTime] = useState<Date | null>(null)
  const [loading, setLoading] = useState(false)
  const [showLogoutPrompt, setShowLogoutPrompt] = useState(false)

  const supabase = createClient()

  const {
    isWithinRange,
    distance,
    loading: geoLoading,
    error: geoError,
    latitude,
    longitude
  } = useGeolocation({
    targetLatitude: profile?.work_latitude,
    targetLongitude: profile?.work_longitude,
    maxDistance: 50
  })

  // Check for existing active session on load
  useEffect(() => {
    const checkActiveSession = async () => {
      if (!profile) return

      const { data } = await supabase
        .from('time_entries')
        .select('*')
        .eq('nanny_id', profile.id)
        .is('clock_out', null)
        .order('clock_in', { ascending: false })
        .limit(1)
        .single()

      if (data) {
        setCurrentEntryId(data.id)
        setIsRunning(true)
        const startTime = new Date(data.clock_in)
        setClockInTime(startTime)
        const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000)
        setSeconds(elapsed)
      }
    }

    checkActiveSession()
  }, [profile])

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning])

  // Watch for leaving the zone
  useEffect(() => {
    if (isRunning && !isWithinRange && !geoLoading && latitude !== null) {
      setShowLogoutPrompt(true)
    }
  }, [isRunning, isWithinRange, geoLoading, latitude])

  const handleClockIn = async () => {
    if (!profile || !profile.employer_id) return
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          nanny_id: profile.id,
          employer_id: profile.employer_id,
          clock_in: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      setCurrentEntryId(data.id)
      setClockInTime(new Date())
      setIsRunning(true)
      setSeconds(0)
    } catch (error) {
      console.error('Error clocking in:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClockOut = async () => {
    if (!currentEntryId) return
    setLoading(true)

    try {
      const clockOut = new Date()
      const durationMinutes = Math.round(seconds / 60)

      const { error } = await supabase
        .from('time_entries')
        .update({
          clock_out: clockOut.toISOString(),
          duration_minutes: durationMinutes
        })
        .eq('id', currentEntryId)

      if (error) throw error

      setIsRunning(false)
      setCurrentEntryId(null)
      setClockInTime(null)
      setSeconds(0)
      setShowLogoutPrompt(false)

      if (onClockOut) onClockOut()
    } catch (error) {
      console.error('Error clocking out:', error)
    } finally {
      setLoading(false)
    }
  }

  const canClockIn = isWithinRange && !geoLoading && !isRunning

  return (
    <div className="relative">
      {/* Logout Prompt Modal */}
      {showLogoutPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Vous quittez la zone ?
              </h3>
              <p className="text-gray-600 mb-6">
                Il semble que vous ayez quitté votre lieu de travail.
                Voulez-vous pointer votre départ ?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutPrompt(false)}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Non, je reste
                </button>
                <button
                  onClick={handleClockOut}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-medium hover:from-rose-600 hover:to-pink-600 transition-all"
                >
                  Oui, je pars
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timer Display */}
      <div className="bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-3xl p-8 text-white shadow-2xl">
        <div className="text-center">
          {/* Status indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {isRunning ? (
              <>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-white/90 font-medium">En cours depuis {clockInTime && formatTimeFromDate(clockInTime)}</span>
              </>
            ) : (
              <span className="text-white/80">Prêt à pointer</span>
            )}
          </div>

          {/* Timer */}
          <div className="text-7xl font-mono font-bold tracking-wider mb-8">
            {formatTime(seconds)}
          </div>

          {/* Geolocation Status */}
          <div className="mb-6">
            {geoLoading ? (
              <div className="flex items-center justify-center gap-2 text-white/80">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Localisation en cours...</span>
              </div>
            ) : geoError ? (
              <div className="flex items-center justify-center gap-2 text-rose-200">
                <XCircle className="w-5 h-5" />
                <span className="text-sm">{geoError}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                {isWithinRange ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span className="text-green-200">Sur le lieu de travail</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-5 h-5 text-amber-300" />
                    <span className="text-amber-200">
                      {distance ? `À ${distance}m du lieu de travail` : 'Hors zone'}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Action Button */}
          {isRunning ? (
            <button
              onClick={handleClockOut}
              disabled={loading}
              className="w-full py-5 px-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl font-bold text-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-7 h-7 animate-spin" />
              ) : (
                <Square className="w-7 h-7 fill-current" />
              )}
              Pointer ma sortie
            </button>
          ) : (
            <button
              onClick={handleClockIn}
              disabled={!canClockIn || loading}
              className={`w-full py-5 px-8 rounded-2xl font-bold text-xl transition-all flex items-center justify-center gap-3 ${
                canClockIn
                  ? 'bg-white text-purple-600 hover:bg-white/90 shadow-lg hover:shadow-xl'
                  : 'bg-white/20 text-white/50 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <Loader2 className="w-7 h-7 animate-spin" />
              ) : (
                <Play className="w-7 h-7 fill-current" />
              )}
              Pointer mon arrivée
            </button>
          )}

          {!isRunning && !canClockIn && !geoLoading && !geoError && (
            <p className="text-white/60 text-sm mt-4">
              Vous devez être sur votre lieu de travail pour pointer
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
