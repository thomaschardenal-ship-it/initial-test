'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Clock, Baby, Sparkles, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user && profile) {
      if (profile.role === 'employer') {
        router.push('/dashboard')
      } else if (profile.work_address) {
        router.push('/timer')
      } else {
        router.push('/setup')
      }
    }
  }, [user, profile, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
            NannyTimer
          </span>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="max-w-lg w-full text-center">
          {/* Floating icons */}
          <div className="relative mb-8">
            <div className="absolute -left-4 top-0 animate-float">
              <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center rotate-12">
                <Clock className="w-8 h-8 text-violet-500" />
              </div>
            </div>
            <div className="absolute -right-4 top-8 animate-float" style={{ animationDelay: '0.5s' }}>
              <div className="w-14 h-14 bg-fuchsia-100 rounded-2xl flex items-center justify-center -rotate-12">
                <Baby className="w-7 h-7 text-fuchsia-500" />
              </div>
            </div>
            <div className="w-32 h-32 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-violet-500/30 animate-float">
              <Sparkles className="w-16 h-16 text-white" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
            Suivi simplifié
            <br />
            <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              des heures de garde
            </span>
          </h1>

          <p className="text-gray-600 text-lg mb-8">
            Pointeuse intelligente avec géolocalisation, historique complet et récapitulatif hebdomadaire automatique.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold rounded-2xl hover:from-violet-600 hover:to-fuchsia-600 transition-all shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40"
            >
              Commencer
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 font-semibold rounded-2xl border-2 border-gray-200 hover:border-violet-300 hover:text-violet-600 transition-all"
            >
              Se connecter
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 mt-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">📍</span>
              </div>
              <p className="text-sm text-gray-600 font-medium">Géolocalisation</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-fuchsia-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">📊</span>
              </div>
              <p className="text-sm text-gray-600 font-medium">Statistiques</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">📧</span>
              </div>
              <p className="text-sm text-gray-600 font-medium">Récap auto</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-gray-500 text-sm">
        © 2024 NannyTimer - Fait avec 💜
      </footer>
    </div>
  )
}
