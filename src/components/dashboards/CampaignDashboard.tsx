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
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://campaign-backend-production-e2db.up.railway.app'
        
        // Get user profile from the new /auth/profile endpoint
        const authResponse = await fetch(`${API_BASE_URL}/api/auth/profile`, {
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
          
          // Try to fetch company dashboard stats from the campaigns endpoint
          try {
            const statsResponse = await fetch(`${API_BASE_URL}/api/campaigns/dashboard/stats`, {
              headers: { 'Authorization': `Bearer ${token}` }
            })
            
            if (statsResponse.ok) {
              const campaignStats = await statsResponse.json()
              
              // Transform campaign stats to match CompanyStats interface
              const transformedStats: CompanyStats = {
                company_name: userData.company.company_name,
                subscription_tier: userData.company.subscription_tier,
                monthly_credits_used: campaignStats.credits_used_this_month || userData.company.monthly_credits_used,
                monthly_credits_limit: userData.company.monthly_credits_limit,
                credits_remaining: campaignStats.credits_remaining || (userData.company.monthly_credits_limit - userData.company.monthly_credits_used),
                total_campaigns: campaignStats.total_campaigns || 0,
                active_campaigns: campaignStats.active_campaigns || 0,
                team_members: 1, // Default for now
                campaigns_this_month: campaignStats.total_campaigns || 0, // Simplified for now
                usage_percentage: userData.company.monthly_credits_limit > 0 ? 
                  (userData.company.monthly_credits_used / userData.company.monthly_credits_limit * 100) : 0
              }
              
              setStats(transformedStats)
            } else {
              // Fallback to basic stats from user data
              const fallbackStats: CompanyStats = {
                company_name: userData.company.company_name,
                subscription_tier: userData.company.subscription_tier,
                monthly_credits_used: userData.company.monthly_credits_used,
                monthly_credits_limit: userData.company.monthly_credits_limit,
                credits_remaining: userData.company.monthly_credits_limit - userData.company.monthly_credits_used,
                total_campaigns: 0,
                active_campaigns: 0,
                team_members: 1,
                campaigns_this_month: 0,
                usage_percentage: userData.company.monthly_credits_limit > 0 ? 
                  (userData.company.monthly_credits_used / userData.company.monthly_credits_limit * 100) : 0
              }
              
              setStats(fallbackStats)
            }
          } catch (statsError) {
            console.error('Failed to fetch campaign stats, using fallback:', statsError)
            
            // Fallback stats from user data
            const fallbackStats: CompanyStats = {
              company_name: userData.company.company_name,
              subscription_tier: userData.company.subscription_tier,
              monthly_credits_used: userData.company.monthly_credits_used,
              monthly_credits_limit: userData.company.monthly_credits_limit,
              credits_remaining: userData.company.monthly_credits_limit - userData.company.monthly_credits_used,
              total_campaigns: 0,
              active_campaigns: 0,
              team_members: 1,
              campaigns_this_month: 0,
              usage_percentage: userData.company.monthly_credits_limit > 0 ? 
                (userData.company.monthly_credits_used / userData.company.monthly_credits_limit * 100) : 0
            }
            
            setStats(fallbackStats)
          }
          
        } else {
          console.error('Profile fetch failed, status:', authResponse.status)
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

  const handleNavigateToCampaigns = () => {
    router.push('/campaigns')
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
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">RodgersDigital</h1>
            </div>
            {stats && (
              <div className="hidden md:flex items-center space-x-1 text-sm text-gray-500">
                <span>{stats.company_name}</span>
                <span>/</span>
                <span className="text-gray-900">Dashboard</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Tier Badge */}
            {stats && (
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getTierColor(stats.subscription_tier)}`}>
                <span className="text-sm font-medium">{stats.subscription_tier}</span>
              </div>
            )}
            
            <div className="relative">
              <input
                type="text"
                placeholder="Search campaigns..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <button className="relative p-2 text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 17H4l5 5v-5zM12 3v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full"></span>
            </button>
            
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
              {user?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-4 space-y-2">
            {[
              { id: 'overview', label: 'Dashboard', icon: 'BarChart3', active: true, onClick: () => {} },
              { id: 'campaigns', label: 'My Campaigns', icon: 'Target', onClick: handleNavigateToCampaigns },
              { id: 'create', label: 'Create Campaign', icon: 'Plus', highlight: true, onClick: handleNavigateToCampaigns },
              { id: 'library', label: 'Content Library', icon: 'FileText', onClick: () => {} },
              { id: 'analytics', label: 'Analytics', icon: 'TrendingUp', onClick: () => {} },
              { id: 'settings', label: 'Account Settings', icon: 'Settings', onClick: () => {} },
            ].map((item) => (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
                  item.active
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : item.highlight
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="w-5 h-5">
                  {item.icon === 'BarChart3' && <BarChart3 className="w-5 h-5" />}
                  {item.icon === 'Target' && <Target className="w-5 h-5" />}
                  {item.icon === 'Plus' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}
                  {item.icon === 'FileText' && <FileText className="w-5 h-5" />}
                  {item.icon === 'TrendingUp' && <TrendingUp className="w-5 h-5" />}
                  {item.icon === 'Settings' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                </div>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Usage Stats in Sidebar */}
          {stats && (
            <div className="p-4 mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Monthly Usage</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>AI Credits</span>
                    <span>{stats.monthly_credits_used.toLocaleString()}/{stats.monthly_credits_limit.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        stats.usage_percentage >= 90 ? 'bg-red-500' :
                        stats.usage_percentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(stats.usage_percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Campaigns</span>
                    <span>{stats.total_campaigns}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {stats.active_campaigns} active
                  </div>
                </div>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full mt-6 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user?.full_name?.split(' ')[0] || 'User'}!</h2>
                <p className="text-gray-600">Here is what is happening with your campaigns today.</p>
              </div>
              <button 
                onClick={handleNavigateToCampaigns}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 shadow-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>New Campaign</span>
              </button>
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
                  <div className="mt-4 flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600 font-medium">+{stats.campaigns_this_month}</span>
                    <span className="text-gray-500 ml-1">this month</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
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
                  <div className="mt-4 flex items-center text-sm">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      stats.usage_percentage >= 90 ? 'bg-red-100 text-red-800' :
                      stats.usage_percentage >= 70 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {stats.usage_percentage.toFixed(1)}% used
                    </span>
                    <span className="text-gray-500 ml-2">{stats.credits_remaining.toLocaleString()} left</span>
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
                    In {stats.company_name}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-6 rounded-xl text-white">
                <div className="flex items-center justify-between mb-4">
                  <Video className="w-8 h-8" />
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Video Campaign</h3>
                <p className="text-purple-100 text-sm mb-4">Transform videos into complete marketing campaigns</p>
                <button 
                  onClick={handleNavigateToCampaigns}
                  className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Get Started
                </button>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-xl text-white">
                <div className="flex items-center justify-between mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">AI Visual Content</h3>
                <p className="text-emerald-100 text-sm mb-4">Generate stunning visuals with AI technology</p>
                <button 
                  onClick={handleNavigateToCampaigns}
                  className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Create Images
                </button>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 rounded-xl text-white">
                <div className="flex items-center justify-between mb-4">
                  <FileText className="w-8 h-8" />
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Content Suite</h3>
                <p className="text-orange-100 text-sm mb-4">Upload documents and create comprehensive campaigns</p>
                <button 
                  onClick={handleNavigateToCampaigns}
                  className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Upload Content
                </button>
              </div>
            </div>

            {/* Upgrade Banner for Free/Starter Users */}
            {stats && stats.subscription_tier === 'free' && (
              <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl p-6 text-white mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Upgrade to unlock more features</h3>
                      <p className="text-purple-100 text-sm">Get unlimited campaigns, advanced AI, and priority support</p>
                    </div>
                  </div>
                  <button className="bg-white text-purple-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                    Upgrade Now
                  </button>
                </div>
              </div>
            )}

            {/* Recent Campaigns */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Campaigns</h3>
                  <button 
                    onClick={handleNavigateToCampaigns}
                    className="text-purple-600 hover:text-purple-800 text-sm font-medium transition-colors"
                  >
                    View All
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    {stats && stats.total_campaigns > 0 ? 'View Your Campaigns' : 'No campaigns yet'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {stats && stats.total_campaigns > 0 ? 
                      'Go to the campaigns page to see all your campaigns' : 
                      'Create your first campaign to get started!'
                    }
                  </p>
                  <button 
                    onClick={handleNavigateToCampaigns}
                    className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    {stats && stats.total_campaigns > 0 ? 'View Campaigns' : 'Create Campaign'}
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