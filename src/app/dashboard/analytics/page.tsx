'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Video, FileText, BarChart3, Users, Target, TrendingUp } from 'lucide-react'

interface User {
  id: string
  email: string
  full_name: string
  role: string
  company: {
    company_name: string
    subscription_tier: string
  }
}

interface CompanyStats {
  company_name: string
  subscription_tier: string
  monthly_credits_used: number
  monthly_credits_limit: number
  credits_remaining: number
  total_campaigns: number
  active_campaigns: number
  team_members: number
  campaigns_this_month: number
  usage_percentage: number
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<CompanyStats | null>(null)
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
        
        // Validate user authentication
        const authResponse = await fetch(`${API_BASE_URL}/api/auth/validate`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (authResponse.ok) {
          const userData: User = await authResponse.json()
          
          // Redirect admins to admin dashboard
          if (userData.role === 'admin') {
            router.push('/admin')
            return
          }
          
          setUser(userData)
          
          // Fetch company dashboard stats
          const statsResponse = await fetch(`${API_BASE_URL}/dashboard/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          
          if (statsResponse.ok) {
            const statsData: CompanyStats = await statsResponse.json()
            setStats(statsData)
          } else {
            console.error('Failed to fetch dashboard stats')
          }
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

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      free: 'bg-gray-100 text-gray-800',
      starter: 'bg-blue-100 text-blue-800',
      professional: 'bg-purple-100 text-purple-800',
      agency: 'bg-orange-100 text-orange-800',
      enterprise: 'bg-emerald-100 text-emerald-800'
    }
    return colors[tier] || 'bg-gray-100 text-gray-800'
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
              {stats && (
                <div className="ml-6 flex items-center space-x-2">
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-600">{stats.company_name}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(stats.subscription_tier)}`}>
                    {stats.subscription_tier}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user?.full_name || 'User'}</span>
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

        {/* Company Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_campaigns}</p>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                {stats.campaigns_this_month} created this month
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active_campaigns}</p>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                Currently running
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="bg-emerald-100 p-3 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">AI Credits Used</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.monthly_credits_used.toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-500 mb-1">
                  <span>{stats.credits_remaining.toLocaleString()} remaining</span>
                  <span>{stats.usage_percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{ width: `${Math.min(stats.usage_percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Team Members</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.team_members}</p>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                In your company
              </div>
            </div>
          </div>
        )}

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

        {/* Upgrade Banner for Free/Starter Users */}
        {stats && stats.subscription_tier === 'free' && (
          <div className="mt-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Upgrade to unlock more features</h3>
                <p className="text-purple-100">Get unlimited campaigns, advanced AI, and priority support</p>
              </div>
              <button className="bg-white text-purple-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                Upgrade Now
              </button>
            </div>
          </div>
        )}

        {/* Recent Campaigns Placeholder */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Campaigns</h2>
          <div className="text-center py-8 text-gray-500">
            <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No campaigns yet. Create your first campaign to get started!</p>
          </div>
        </div>
      </main>
    </div>
  )
}