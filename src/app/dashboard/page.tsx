// /src/app/dashboard/page.tsx - FIXED VERSION with Admin Override
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  BarChart3, Target, TrendingUp, Users, ShoppingBag,
  Plus, Calendar, ArrowRight, 
  Home, Shield
} from 'lucide-react'

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
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const checkAuth = async () => {
      if (typeof window === 'undefined') return

      const token = localStorage.getItem('authToken')
      if (!token) {
        router.push('/login')
        return
      }

      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://campaign-backend-production-e2db.up.railway.app'
        
        const authResponse = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (authResponse.ok) {
          const userData: User = await authResponse.json()
          
          // ✅ FIXED: Check for admin override parameter
          const adminOverride = searchParams.get('admin_override')
          
          if (userData.role === 'admin' && !adminOverride) {
            console.log('👑 Admin detected, redirecting to admin dashboard...')
            router.push('/admin')
            return
          }
          
          // ✅ FIXED: Log when admin is using user dashboard
          if (userData.role === 'admin' && adminOverride) {
            console.log('🔄 Admin using user dashboard with override')
          }
          
          setUser(userData)
          
          // Mock stats for design purposes
          const mockStats: CompanyStats = {
            company_name: userData.company.company_name,
            subscription_tier: userData.company.subscription_tier,
            monthly_credits_used: userData.company.monthly_credits_used,
            monthly_credits_limit: userData.company.monthly_credits_limit,
            credits_remaining: userData.company.monthly_credits_limit - userData.company.monthly_credits_used,
            total_campaigns_created: 12,
            active_campaigns: 4,
            team_members: 3,
            campaigns_this_month: 5,
            usage_percentage: userData.company.monthly_credits_limit > 0 ? 
              (userData.company.monthly_credits_used / userData.company.monthly_credits_limit * 100) : 0
          }
          
          setStats(mockStats)
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
  }, [router, searchParams])

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken')
    }
    router.push('/login')
  }

  // ✅ FIXED: Add function to switch back to admin
  const handleSwitchToAdmin = () => {
    console.log('🔄 Switching back to admin dashboard...')
    router.push('/admin')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // ✅ FIXED: Check if user is admin with override
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
              <h1 className="text-xl font-semibold text-black">RodgersDigital</h1>
            </div>
            {stats && (
              <div className="hidden md:flex items-center space-x-1 text-sm text-gray-500">
                <span>{stats.company_name}</span>
                <span>/</span>
                <span className="text-black">Dashboard</span>
                {/* ✅ FIXED: Show admin indicator */}
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
            {/* ✅ FIXED: Add admin switch button in header */}
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
          {/* ✅ FIXED: Add admin switch button in sidebar */}
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
                  {/* ✅ FIXED: Show admin indicator in welcome */}
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

            {/* Stats Grid */}
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
          </div>
        </main>
      </div>
    </div>
  )
}