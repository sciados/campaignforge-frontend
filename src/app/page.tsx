'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../lib/hooks/useAuth'
import { Sparkles, Video, FileText, Globe, ArrowRight } from 'lucide-react'

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Redirect authenticated users to their appropriate dashboard
      if (user?.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    }
  }, [isAuthenticated, isLoading, user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading CampaignForge...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    // This will be handled by the useEffect redirect above
    return null
  }

  // Landing page for unauthenticated users
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
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
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all flex items-center group"
            >
              Start Creating Free
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => router.push('/login')}
              className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-gray-400 hover:bg-white transition-all"
            >
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <Video className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">8+ Video Platforms</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Process content from YouTube, TikTok, Wistia, LinkedIn, Instagram, and more. Extract insights and create campaigns from any video source.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <Sparkles className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Content Generation</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Generate professional images, videos, and complete content suites automatically. AI-powered creativity at scale.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <Globe className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Complete Campaigns</h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Not just individual pieces - create comprehensive marketing campaigns with email sequences, social content, and more.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Start Free, Scale When Ready</h2>
          <p className="text-xl text-gray-600">No credit card required for free tier</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
            <p className="text-4xl font-bold text-gray-900 mb-6">$0<span className="text-lg font-normal text-gray-600">/month</span></p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> 5 video inputs</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> 10 AI images</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> 3 campaigns</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-8 shadow-xl text-white transform scale-105">
            <h3 className="text-2xl font-bold mb-2">Professional</h3>
            <p className="text-4xl font-bold mb-6">$79<span className="text-lg font-normal opacity-80">/month</span></p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> 200 video inputs</li>
              <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> 500 AI images</li>
              <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> 25 AI videos</li>
              <li className="flex items-center"><span className="text-green-400 mr-2">✓</span> 50 campaigns</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
            <p className="text-4xl font-bold text-gray-900 mb-6">$499<span className="text-lg font-normal text-gray-600">/month</span></p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Unlimited everything</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Team collaboration</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> API access</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 w-8 h-8 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="ml-2 text-lg font-bold text-gray-900">CampaignForge</span>
          </div>
          <p className="text-gray-600">© 2024 CampaignForge. Transform content into campaigns.</p>
        </div>
      </footer>
    </main>
  )
}