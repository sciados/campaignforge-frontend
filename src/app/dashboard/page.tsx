// /src/app/dashboard/page.tsx - FIXED VERSION with Live Data
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  BarChart3, Target, TrendingUp, Users, ShoppingBag,
  Plus, Calendar, ArrowRight, 
  Home, Shield
} from 'lucide-react'
import { useApi } from '@/lib/api'

export const dynamic = 'force-dynamic'

interface User {
  id: string
  email: string
  full_name: string
  role: string
  company: {
    id: string
    company_name: string
    subscription_tier: string
    monthly_credits_used: number
    monthly_credits_limit: number
  }
}

interface CompanyStats {
  company_name: string
  subscription_tier: string
  monthly_credits_used: number
  monthly_credits_limit: number
  credits_remaining: number
  total_campaigns_created: number
  active_campaigns: number
  team_members: number
  campaigns_this_month: number
  usage_percentage: number
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<CompanyStats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const router = useRouter()
  const searchParams = useSearchParams()
  const api = useApi()

  useEffect(() => {
    const loadDashboardData = async () => {
      if (typeof window === 'undefined') return

      const token = localStorage.getItem('authToken')
      if (!token) {
        router.push('/login')
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        
        // Get user profile
        const userData = await api.getUserProfile()
        
        // Check for admin override parameter
        const adminOverride = searchParams.get('admin_override')
        
        if (userData.role === 'admin' && !adminOverride) {
          console.log('👑 Admin detected, redirecting to admin dashboard...')
          router.push('/admin')
          return
        }
        
        if (userData.role === 'admin' && adminOverride) {
          console.log('🔄 Admin using user dashboard with override')
        }
        
        setUser(userData)
        
        // ✅ FIXED: Get real stats from backend instead of mock data
        console.log('📊 Loading live company stats...')
        const companyStats = await api.getCompanyStats()
        console.log('✅ Company stats loaded:', companyStats)
        
        setStats(companyStats)
        
      } catch (error) {
        console.error('❌ Dashboard data loading failed:', error)
        setError('Failed to load dashboard data')
        setRetryCount(prev => prev + 1)
        
        // Prevent infinite retry loop
        if (retryCount >= 3) {
          console.error('❌ Max retries reached, stopping')
          return
        }
        
        // If auth fails, redirect to login
        const errorMessage = error instanceof Error ? error.message : String(error)
        if (errorMessage.includes('Authentication') || errorMessage.includes('401')) {
          localStorage.removeItem('authToken')
          router.push('/login')
          return
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [router, searchParams, api, retryCount])

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken')
    }
    router.push('/login')
  }

  const handleSwitchToAdmin = () => {
    console.log('🔄 Switching back to admin dashboard...')
    router.push('/admin')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Check if user is admin with override
  const isAdminWithOverride = user?.role === 'admin' && searchParams.get('admin_override')

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-medium">C</span>
              </div>
              <h1 className="text-xl font-semibold text-black">CampaignForge</h1>
            </div>
            {stats && (
              <div className="hidden md:flex items-center space-x-1 text-sm text-gray-500">
                <span>{stats.company_name}</span>
                <span>/</span>
                <span className="text-black">Dashboard</span>
                {isAdminWithOverride && (
                  <>
                    <span>/</span>
                    <span className="text-red-600 font-medium">Admin View</span>
                  </>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {isAdminWithOverride && (
              <button
                onClick={handleSwitchToAdmin}
                className="flex items-center space-x-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium border border-red-200 hover:bg-red-200 transition-colors"
              >
                <Shield className="w-4 h-4" />
                <span>Back to Admin</span>
              </button>
            )}
            
            <input
              type="text"
              placeholder="Search campaigns..."
              className="hidden md:block w-80 px-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-medium text-sm">
              {user?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          {isAdminWithOverride && (
            <div className="p-6 border-b border-gray-200">
              <button
                onClick={handleSwitchToAdmin}
                className="w-full flex items-center space-x-3 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors text-sm border border-red-200"
              >
                <Shield className="w-5 h-5" />
                <span className="font-medium">Switch Back to Admin</span>
                <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
            </div>
          )}

          <nav className="p-6 space-y-2">
            {[
              { name: 'Dashboard', href: '/dashboard', icon: Home },
              { id: 'overview', label: 'Overview', icon: BarChart3, active: true },
              { id: 'campaigns', label: 'Campaigns', icon: Target, onClick: () => router.push('/campaigns') },
              { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, onClick: () => router.push('/marketplace') },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'settings', label: 'Settings', icon: Users },
            ].map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors font-medium ${
                    item.active
                      ? 'bg-gray-100 text-black'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              )
            })}
            
            <button
              onClick={() => router.push('/campaigns/create-workflow')}
              className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg bg-black text-white hover:bg-gray-900 transition-colors font-medium mt-4"
            >
              <Plus className="w-5 h-5" />
              <span>New Campaign</span>
            </button>
          </nav>

          {/* Usage Stats in Sidebar */}
          {stats && (
            <div className="p-6">
              <h4 className="text-sm font-medium text-black mb-4">Usage</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>AI Credits</span>
                    <span>{stats.monthly_credits_used.toLocaleString()}/{stats.monthly_credits_limit.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-black"
                      style={{ width: `${Math.min(stats.usage_percentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {stats.credits_remaining.toLocaleString()} credits remaining
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-sm text-gray-500 hover:text-black transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-6xl space-y-8">
            {/* Welcome Section */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-light text-black mb-2">
                  Good morning, {user?.full_name?.split(' ')[0] || 'User'}.
                  {isAdminWithOverride && (
                    <span className="text-red-600 font-medium text-lg ml-2">(Admin View)</span>
                  )}
                </h2>
                <p className="text-gray-600">
                  {isAdminWithOverride 
                    ? "You're viewing the user dashboard as an admin. Switch back anytime."
                    : "Here is what is happening with your campaigns today."
                  }
                </p>
              </div>
              <button 
                onClick={() => router.push('/campaigns')}
                className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>New Campaign</span>
              </button>
            </div>

            {/* Stats Grid - Now using LIVE data */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <Target className="w-6 h-6 text-black" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-semibold text-black">{stats.total_campaigns_created}</p>
                    <p className="text-sm text-gray-600">Total Campaigns</p>
                    <p className="text-sm text-green-600">+{stats.campaigns_this_month} this month</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <TrendingUp className="w-6 h-6 text-black" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-semibold text-black">{stats.active_campaigns}</p>
                    <p className="text-sm text-gray-600">Active Campaigns</p>
                    <p className="text-sm text-gray-500">Currently running</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <BarChart3 className="w-6 h-6 text-black" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-semibold text-black">{stats.monthly_credits_used.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">AI Credits Used</p>
                    <p className="text-sm text-gray-500">{stats.credits_remaining.toLocaleString()} remaining</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-6 h-6 text-black" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-semibold text-black">{stats.team_members}</p>
                    <p className="text-sm text-gray-600">Team Members</p>
                    <p className="text-sm text-gray-500">In {stats.company_name}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Campaigns */}
            <div className="bg-white rounded-2xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-black">Recent Campaigns</h3>
                  <button 
                    onClick={() => router.push('/campaigns')}
                    className="text-black font-medium text-sm flex items-center space-x-1 hover:translate-x-1 transition-transform"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Target className="h-8 w-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-black mb-2">
                    {stats && stats.total_campaigns_created > 0 ? 'View Your Campaigns' : 'No campaigns yet'}
                  </h4>
                  <p className="text-gray-600 mb-6">
                    {stats && stats.total_campaigns_created > 0 ? 
                      'Go to the campaigns page to see all your campaigns' : 
                      'Create your first campaign to get started'
                    }
                  </p>
                  <button 
                    onClick={() => router.push('/campaigns')}
                    className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors"
                  >
                    {stats && stats.total_campaigns_created > 0 ? 'View Campaigns' : 'Create Campaign'}
                  </button>
                </div>
              </div>
            </div>

            {/* Additional Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Subscription</h4>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-black capitalize">{stats.subscription_tier}</p>
                    <p className="text-sm text-gray-600">Current plan</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Usage Rate</h4>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-black">{stats.usage_percentage.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">Of monthly credits</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">This Month</h4>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-black">{stats.campaigns_this_month}</p>
                    <p className="text-sm text-gray-600">New campaigns created</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}