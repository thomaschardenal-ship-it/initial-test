'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import { MapPin, Search, Loader2, CheckCircle, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface NannySetupProps {
  employerId: string
}

export default function NannySetup({ employerId }: NannySetupProps) {
  const { profile, refreshProfile } = useAuth()
  const [step, setStep] = useState<'address' | 'searching' | 'complete'>('address')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleAddressSearch = async () => {
    if (!address.trim()) return
    setLoading(true)
    setError(null)
    setStep('searching')

    try {
      // Use OpenStreetMap Nominatim API for geocoding (free, no API key needed)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        {
          headers: {
            'Accept-Language': 'fr'
          }
        }
      )

      const data = await response.json()

      if (data.length === 0) {
        throw new Error('Adresse non trouvée. Veuillez vérifier et réessayer.')
      }

      const { lat, lon } = data[0]
      setCoords({ lat: parseFloat(lat), lng: parseFloat(lon) })

      // Update profile with work address and coordinates
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          work_address: address,
          work_latitude: parseFloat(lat),
          work_longitude: parseFloat(lon),
          employer_id: employerId
        })
        .eq('id', profile?.id)

      if (updateError) throw updateError

      await refreshProfile()
      setStep('complete')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      setStep('address')
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = () => {
    router.push('/timer')
  }

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl max-w-lg w-full">
      {step === 'address' && (
        <>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Configurez votre lieu de travail
            </h2>
            <p className="text-gray-500 mt-2">
              Cette adresse sera utilisée pour vérifier votre présence lors du pointage
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse du domicile de l'employeur
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 rue de Paris, 75001 Paris"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleAddressSearch}
              disabled={!address.trim() || loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold rounded-xl hover:from-violet-600 hover:to-fuchsia-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              Valider l'adresse
            </button>
          </div>
        </>
      )}

      {step === 'searching' && (
        <div className="text-center py-12">
          <Loader2 className="w-16 h-16 text-violet-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Recherche de l'adresse...</p>
        </div>
      )}

      {step === 'complete' && coords && (
        <>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Configuration terminée !
            </h2>
            <p className="text-gray-500 mt-2">
              Votre lieu de travail a été enregistré avec succès
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-violet-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-800">{address}</p>
                <p className="text-sm text-gray-500">
                  Rayon de détection : 50 mètres
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleComplete}
            className="w-full py-4 px-6 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold rounded-xl hover:from-violet-600 hover:to-fuchsia-600 transition-all"
          >
            Commencer à pointer
          </button>
        </>
      )}
    </div>
  )
}

// Component for employer to add a nanny
export function AddNannyForm() {
  const { profile } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setLoading(true)
    setError(null)

    try {
      // Check if nanny account exists
      const { data: nannyProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .eq('role', 'nanny')
        .single()

      if (fetchError || !nannyProfile) {
        throw new Error('Aucun compte nounou trouvé avec cet email. La nounou doit d\'abord créer son compte.')
      }

      // Link nanny to employer
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ employer_id: profile.id })
        .eq('id', nannyProfile.id)

      if (updateError) throw updateError

      setSuccess(true)
      setEmail('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <div>
            <p className="font-medium text-green-800">Nounou ajoutée avec succès !</p>
            <p className="text-sm text-green-600">Elle peut maintenant commencer à pointer.</p>
          </div>
        </div>
        <button
          onClick={() => setSuccess(false)}
          className="mt-4 text-sm text-green-600 hover:underline"
        >
          Ajouter une autre nounou
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-fuchsia-100 rounded-xl p-2">
          <Users className="w-5 h-5 text-fuchsia-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-800">Ajouter une nounou</h3>
      </div>

      <form onSubmit={handleInvite} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email de la nounou
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nounou@exemple.com"
            required
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:outline-none transition-colors"
          />
          <p className="text-sm text-gray-500 mt-2">
            La nounou doit avoir créé son compte au préalable
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-6 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-medium rounded-xl hover:from-violet-600 hover:to-fuchsia-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Associer la nounou'
          )}
        </button>
      </form>
    </div>
  )
}
