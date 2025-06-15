// Force dynamic rendering
export const dynamic = 'force-dynamic'

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Video, FileText, BarChart3 } from 'lucide-react'

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  role: 'admin' | 'user'
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      if (typeof window === 'undefined') return

      const token = localStorage.getItem('authToken')
      if (!token) {
        router.push('/login')
        return
      }

      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const response = await fetch(`${API_BASE_URL}/api/auth/validate`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (response.ok) {
          const userData: User = await response.json()
          if (userData.role === 'admin') {
            router.push('/admin')
            return
          }
          setUser(userData)
        } else {
          localStorage.removeItem('authToken')
          router.push('/login')
          return
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/login')
        return
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken')
    }
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 w-10 h-10 rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">CampaignForge</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user?.first_name || 'User'}</span>
              <button
                onClick={handleLogout}
                className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-gray-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Create amazing marketing campaigns with AI-powered content generation</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Video className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Campaigns Created</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Content Pieces</p>
                <p className="text-2xl font-bold text-gray-900">247</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="bg-emerald-100 p-3 rounded-lg">
                <BarChart3 className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">AI Credits Used</p>
                <p className="text-2xl font-bold text-gray-900">1,240</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left">
              <div className="flex items-center mb-2">
                <Video className="h-5 w-5 text-purple-600 mr-2" />
                <h3 className="font-semibold text-gray-900">Create from Video</h3>
              </div>
              <p className="text-gray-600 text-sm">Process videos from YouTube, TikTok, and 8+ platforms</p>
            </button>

            <button className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left">
              <div className="flex items-center mb-2">
                <FileText className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-semibold text-gray-900">Upload Document</h3>
              </div>
              <p className="text-gray-600 text-sm">Create campaigns from PDFs, docs, and presentations</p>
            </button>
          </div>
        </div>

        {/* Recent Campaigns */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Campaigns</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900">Product Launch Campaign</h3>
                <p className="text-gray-600 text-sm">Created 2 days ago • 15 content pieces</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Completed</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900">Social Media Blitz</h3>
                <p className="text-gray-600 text-sm">Created 5 days ago • 28 content pieces</p>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Active</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900">Email Newsletter Series</h3>
                <p className="text-gray-600 text-sm">Created 1 week ago • 12 content pieces</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Completed</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}