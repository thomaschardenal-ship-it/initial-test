'use client'

import { useState, useEffect, useCallback } from 'react'
import { calculateDistance } from '@/lib/utils'

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  error: string | null
  loading: boolean
}

interface UseGeolocationOptions {
  targetLatitude?: number | null
  targetLongitude?: number | null
  maxDistance?: number // in meters
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const { targetLatitude, targetLongitude, maxDistance = 50 } = options

  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true
  })

  const [isWithinRange, setIsWithinRange] = useState(false)
  const [distance, setDistance] = useState<number | null>(null)
  const [watchId, setWatchId] = useState<number | null>(null)

  const checkDistance = useCallback(
    (lat: number, lon: number) => {
      if (targetLatitude != null && targetLongitude != null) {
        const dist = calculateDistance(lat, lon, targetLatitude, targetLongitude)
        setDistance(Math.round(dist))
        setIsWithinRange(dist <= maxDistance)
      }
    },
    [targetLatitude, targetLongitude, maxDistance]
  )

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'La géolocalisation n\'est pas supportée par votre navigateur',
        loading: false
      }))
      return
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setState({
          latitude,
          longitude,
          error: null,
          loading: false
        })
        checkDistance(latitude, longitude)
      },
      (error) => {
        let errorMessage = 'Erreur de géolocalisation'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Accès à la localisation refusé. Veuillez autoriser l\'accès.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Position non disponible'
            break
          case error.TIMEOUT:
            errorMessage = 'Délai d\'attente dépassé'
            break
        }
        setState(prev => ({
          ...prev,
          error: errorMessage,
          loading: false
        }))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )

    setWatchId(id)
  }, [checkDistance])

  const stopWatching = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
    }
  }, [watchId])

  const getCurrentPosition = useCallback(() => {
    return new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        reject,
        { enableHighAccuracy: true, timeout: 10000 }
      )
    })
  }, [])

  useEffect(() => {
    startWatching()
    return () => stopWatching()
  }, [startWatching, stopWatching])

  return {
    ...state,
    isWithinRange,
    distance,
    startWatching,
    stopWatching,
    getCurrentPosition
  }
}
