'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    
    // Check authentication after mount
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken')
      if (token) {
        // Simple token check - redirect to dashboard for now
        router.push('/dashboard')
      }
    }
  }, [router])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 w-10 h-10 rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">CampaignForge</span>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/login')}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Sign In
              </button>
              <button 
                onClick={() => router.push('/register')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                Start Free
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6">
          Transform Any Content Into
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
            Complete Campaigns
          </span>
        </h1>
        <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto">
          Process videos from 8+ platforms, documents, and web content. Generate AI-powered images, videos, and complete marketing campaigns automatically.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={() => router.push('/register')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all"
          >
            Start Creating Free
          </button>
          <button 
            onClick={() => router.push('/login')}
            className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-gray-400 hover:bg-white transition-all"
          >
            Sign In
          </button>
        </div>
      </section>
    </div>
  )
}