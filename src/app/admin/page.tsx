// Force dynamic rendering
export const dynamic = 'force-dynamic'

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Settings, Users, BarChart3, DollarSign, Activity } from 'lucide-react'

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  role: 'admin' | 'user'
}

export default function AdminPage() {
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
          if (userData.role !== 'admin') {
            router.push('/dashboard')
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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin portal...</p>
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
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">CampaignForge Admin</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Admin: {user?.first_name || 'Administrator'}</span>
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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor platform performance and manage users</p>
        </div>

        {/* Platform Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">1,247</p>
                <p className="text-sm text-green-600">+12% this month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">$18,432</p>
                <p className="text-sm text-green-600">+23% this month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Campaigns Created</p>
                <p className="text-2xl font-bold text-gray-900">3,142</p>
                <p className="text-sm text-green-600">+18% this month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">System Health</p>
                <p className="text-2xl font-bold text-gray-900">99.9%</p>
                <p className="text-sm text-green-600">All systems operational</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent User Registrations</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registered
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-purple-600">SJ</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">Sarah Johnson</div>
                        <div className="text-sm text-gray-500">sarah@company.com</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                      Professional
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    2 hours ago
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">MC</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">Mike Chen</div>
                        <div className="text-sm text-gray-500">mike@startup.io</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      Starter
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    5 hours ago
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">AL</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">Alex Lopez</div>
                        <div className="text-sm text-gray-500">alex@freelance.com</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      Free
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    1 day ago
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Trial
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">System Alerts</h2>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-green-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">All systems operational</p>
                <p className="text-sm text-green-600">API response time: 145ms average</p>
              </div>
            </div>

            <div className="flex items-center p-4 bg-blue-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-800">Database optimization completed</p>
                <p className="text-sm text-blue-600">Query performance improved by 23%</p>
              </div>
            </div>

            <div className="flex items-center p-4 bg-yellow-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-800">High API usage detected</p>
                <p className="text-sm text-yellow-600">AI token usage at 85% of monthly limit</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}