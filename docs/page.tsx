'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken')
      if (token) {
        router.push('/dashboard')
      }
    }
  }, [router])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-medium">C</span>
              </div>
              <span className="text-xl font-semibold text-black">RodgersDigital</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => router.push('/login')}
                className="text-gray-600 font-medium hover:text-black transition-colors"
              >
                Sign In
              </button>
              <button 
                onClick={() => router.push('/register')}
                className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-900 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative">
        <div className="max-w-4xl mx-auto px-6 pt-20 pb-32 text-center">
          <h1 className="text-6xl font-light text-black mb-6 leading-tight">
            Transform content into
            <br />
            <span className="font-semibold">complete campaigns.</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Process any content source and generate comprehensive marketing campaigns 
            with AI-powered intelligence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => router.push('/register')}
              className="bg-black text-white px-8 py-4 rounded-xl font-medium text-lg hover:bg-gray-900 transition-all"
            >
              Start Creating
            </button>
            <button 
              onClick={() => router.push('/login')}
              className="bg-gray-100 text-black px-8 py-4 rounded-xl font-medium text-lg hover:bg-gray-200 transition-all"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto px-6 pb-32">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-black mb-4">Any Source</h3>
              <p className="text-gray-600 leading-relaxed">
                Upload videos, documents, URLs, or text. Our AI processes any content type intelligently.
              </p>
            </div>

            <div className="text-center p-8">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-black mb-4">AI Intelligence</h3>
              <p className="text-gray-600 leading-relaxed">
                Extract marketing insights, key messages, and audience data automatically from your content.
              </p>
            </div>

            <div className="text-center p-8">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-black mb-4">Complete Campaigns</h3>
              <p className="text-gray-600 leading-relaxed">
                Generate emails, social posts, ads, landing pages, and videos in a unified campaign.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gray-50 py-32">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-light text-black mb-6">
              Ready to transform your content?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of marketers creating smarter campaigns.
            </p>
            <button 
              onClick={() => router.push('/register')}
              className="bg-black text-white px-8 py-4 rounded-xl font-medium text-lg hover:bg-gray-900 transition-all"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}