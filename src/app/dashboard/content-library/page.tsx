"use client";

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, Search, Filter, Grid, List, Calendar, Target, TrendingUp, 
  Video, FileText, Globe, Users, BarChart3, Star, Archive, 
  Play, Pause, Settings, Copy, Eye, Edit, Trash2, Clock,
  ChevronDown, ArrowUpRight, Zap, Award, Sparkles
} from 'lucide-react'

interface Campaign {
  id: string
  title: string
  description: string
  campaign_type: string
  status: string
  created_at: string
  user_id: string
  company_id: string
  content: any
  intelligence_count?: number
  generated_content_count?: number
  confidence_score?: number
  last_activity?: string
}

interface DashboardStats {
  total_campaigns: number
  active_campaigns: number
  draft_campaigns: number
  completed_campaigns: number
  total_intelligence_sources: number
  total_generated_content: number
  credits_used_this_month: number
  credits_remaining: number
  avg_confidence_score: number
}

interface User {
  id: string
  email: string
  full_name: string
  role: string
  company: {
    company_name: string
    company_id: string
    subscription_tier: string
    monthly_credits_used: number
    monthly_credits_limit: number
  }
}

const CAMPAIGN_TYPES = {
  social_media: { label: 'Social Media', icon: '📱', color: 'bg-blue-100 text-blue-800' },
  email_marketing: { label: 'Email Marketing', icon: '📧', color: 'bg-green-100 text-green-800' },
  video_content: { label: 'Video Content', icon: '🎥', color: 'bg-purple-100 text-purple-800' },
  blog_post: { label: 'Blog Post', icon: '📝', color: 'bg-orange-100 text-orange-800' },
  advertisement: { label: 'Advertisement', icon: '📢', color: 'bg-red-100 text-red-800' },
  product_launch: { label: 'Product Launch', icon: '🚀', color: 'bg-emerald-100 text-emerald-800' },
  brand_awareness: { label: 'Brand Awareness', icon: '🎯', color: 'bg-pink-100 text-pink-800' },
  multimedia: { label: 'Multimedia', icon: '🎨', color: 'bg-indigo-100 text-indigo-800' }
}

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: Play },
  review: { label: 'Review', color: 'bg-yellow-100 text-yellow-800', icon: Eye },
  active: { label: 'Active', color: 'bg-green-100 text-green-800', icon: TrendingUp },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-800', icon: Award },
  archived: { label: 'Archived', color: 'bg-gray-100 text-gray-600', icon: Archive }
}

export default function CampaignDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadDashboardData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('authToken')
      if (!token) {
        router.push('/login')
        return
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      // Load user data
      const userResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUser(userData)
      }

      // Load dashboard stats
      const statsResponse = await fetch(`${API_BASE_URL}/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        
        // Transform dashboard stats to match our interface
        const transformedStats: DashboardStats = {
          total_campaigns: statsData.total_campaigns || 0,
          active_campaigns: statsData.active_campaigns || 0,
          draft_campaigns: 0, // Will be calculated from campaigns
          completed_campaigns: 0, // Will be calculated from campaigns
          total_intelligence_sources: 0, // Will be calculated
          total_generated_content: 0, // Will be calculated
          credits_used_this_month: statsData.monthly_credits_used || 0,
          credits_remaining: statsData.credits_remaining || 0,
          avg_confidence_score: 0.85 // Placeholder
        }
        
        setStats(transformedStats)
      }

      // Mock campaigns data (replace with actual API call when available)
      const mockCampaigns: Campaign[] = [
        {
          id: '1',
          title: 'Product Launch Campaign',
          description: 'Comprehensive campaign for our new product launch including social media, email, and video content.',
          campaign_type: 'product_launch',
          status: 'active',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          user_id: user?.id || '',
          company_id: user?.company.company_id || '',
          content: {},
          intelligence_count: 3,
          generated_content_count: 15,
          confidence_score: 0.92,
          last_activity: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          title: 'Social Media Blitz',
          description: 'Multi-platform social media campaign targeting Gen Z audience.',
          campaign_type: 'social_media',
          status: 'in_progress',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          user_id: user?.id || '',
          company_id: user?.company?.company_id || '',
          content: {},
          intelligence_count: 2,
          generated_content_count: 28,
          confidence_score: 0.87,
          last_activity: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          title: 'Email Newsletter Series',
          description: 'Weekly email series for customer retention and engagement.',
          campaign_type: 'email_marketing',
          status: 'completed',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          user_id: user?.id || '',
          company_id: user?.company?.company_id || '',
          content: {},
          intelligence_count: 1,
          generated_content_count: 12,
          confidence_score: 0.79,
          last_activity: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '4',
          title: 'Brand Awareness Video Series',
          description: 'YouTube and TikTok video series to increase brand recognition.',
          campaign_type: 'video_content',
          status: 'draft',
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          user_id: user?.id || '',
          company_id: user?.company?.company_id || '',
          content: {},
          intelligence_count: 0,
          generated_content_count: 3,
          confidence_score: 0.0,
          last_activity: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        }
      ]

      setCampaigns(mockCampaigns)

    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter
    const matchesType = typeFilter === 'all' || campaign.campaign_type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  const getTierColor = (tier: string) => {
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      starter: 'bg-blue-100 text-blue-800',
      professional: 'bg-purple-100 text-purple-800',
      agency: 'bg-orange-100 text-orange-800',
      enterprise: 'bg-emerald-100 text-emerald-800'
    }
    return colors[tier as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your campaigns...</p>
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
              <h1 className="text-xl font-bold text-gray-900">CampaignForge</h1>
            </div>
            <div className="hidden md:flex items-center space-x-1 text-sm text-gray-500">
              <span>{user?.company?.company_name}</span>
              <span>/</span>
              <span className="text-gray-900">Campaign Dashboard</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getTierColor(user.company.subscription_tier)}`}>
                <span className="text-sm font-medium">{user.company.subscription_tier}</span>
              </div>
            )}
            
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
              {user?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Dashboard Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Campaign Dashboard</h2>
              <p className="text-gray-600 mt-1">Manage your marketing campaigns and track performance</p>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>New Campaign</span>
            </button>
          </div>

          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total_campaigns}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">+{campaigns.filter(c => {
                    const created = new Date(c.created_at)
                    const monthAgo = new Date()
                    monthAgo.setMonth(monthAgo.getMonth() - 1)
                    return created > monthAgo
                  }).length}</span>
                  <span className="text-gray-500 ml-1">this month</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                    <p className="text-3xl font-bold text-gray-900">{campaigns.filter(c => c.status === 'active').length}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Play className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  {campaigns.filter(c => c.status === 'in_progress').length} in progress
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Intelligence Sources</p>
                    <p className="text-3xl font-bold text-gray-900">{campaigns.reduce((sum, c) => sum + (c.intelligence_count || 0), 0)}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Zap className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-blue-600 font-medium">{(campaigns.reduce((sum, c) => sum + (c.confidence_score || 0), 0) / campaigns.length * 100).toFixed(0)}%</span>
                  <span className="text-gray-500 ml-1">avg confidence</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">AI Credits Used</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.credits_used_this_month.toLocaleString()}</p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    user && (user.company.monthly_credits_used / user.company.monthly_credits_limit) >= 0.9 ? 'bg-red-100 text-red-800' :
                    user && (user.company.monthly_credits_used / user.company.monthly_credits_limit) >= 0.7 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {user ? ((user.company.monthly_credits_used / user.company.monthly_credits_limit) * 100).toFixed(1) : 0}% used
                  </span>
                  <span className="text-gray-500 ml-2">{stats.credits_remaining.toLocaleString()} left</span>
                </div>
              </div>
            </div>
          )}

          {/* Campaign Controls */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search campaigns..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                      <option key={status} value={status}>{config.label}</option>
                    ))}
                  </select>
                  
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    {Object.entries(CAMPAIGN_TYPES).map(([type, config]) => (
                      <option key={type} value={type}>{config.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Campaigns Display */}
          {filteredCampaigns.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Target className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {campaigns.length === 0 ? 'No campaigns yet' : 'No campaigns match your filters'}
              </h3>
              <p className="text-gray-500 mb-6">
                {campaigns.length === 0 
                  ? 'Create your first campaign to get started with AI-powered marketing!'
                  : 'Try adjusting your search or filter settings.'
                }
              </p>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                Create Your First Campaign
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "space-y-4"
            }>
              {filteredCampaigns.map((campaign) => {
                const typeConfig = CAMPAIGN_TYPES[campaign.campaign_type as keyof typeof CAMPAIGN_TYPES]
                const statusConfig = STATUS_CONFIG[campaign.status as keyof typeof STATUS_CONFIG]
                const StatusIcon = statusConfig.icon

                if (viewMode === 'list') {
                  return (
                    <div key={campaign.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg flex items-center justify-center text-2xl">
                            {typeConfig?.icon || '📊'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900">{campaign.title}</h3>
                              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusConfig.label}
                              </div>
                              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeConfig?.color}`}>
                                {typeConfig?.label}
                              </div>
                            </div>
                            <p className="text-gray-600 text-sm mb-2">{campaign.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Zap className="w-4 h-4 mr-1" />
                                {campaign.intelligence_count || 0} intelligence
                              </span>
                              <span className="flex items-center">
                                <FileText className="w-4 h-4 mr-1" />
                                {campaign.generated_content_count || 0} content pieces
                              </span>
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatTimeAgo(campaign.created_at)}
                              </span>
                              {campaign.confidence_score && campaign.confidence_score > 0 && (
                                <span className="flex items-center">
                                  <Star className="w-4 h-4 mr-1 text-yellow-500" />
                                  {(campaign.confidence_score * 100).toFixed(0)}% confidence
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <Copy className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                }

                return (
                  <div key={campaign.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:border-purple-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg flex items-center justify-center text-2xl">
                        {typeConfig?.icon || '📊'}
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{campaign.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{campaign.description}</p>
                    
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-4 ${typeConfig?.color}`}>
                      {typeConfig?.label}
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Intelligence Sources</span>
                        <span className="font-medium">{campaign.intelligence_count || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Generated Content</span>
                        <span className="font-medium">{campaign.generated_content_count || 0}</span>
                      </div>
                      {campaign.confidence_score && campaign.confidence_score > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Confidence Score</span>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-500 mr-1" />
                            <span className="font-medium">{(campaign.confidence_score * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>Created {formatTimeAgo(campaign.created_at)}</span>
                      {campaign.last_activity && (
                        <span>Updated {formatTimeAgo(campaign.last_activity)}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all">
                        <Eye className="w-4 h-4 mr-1 inline" />
                        View
                      </button>
                      <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-6 rounded-xl text-white">
              <div className="flex items-center justify-between mb-4">
                <Video className="w-8 h-8" />
                <ArrowUpRight className="w-6 h-6 opacity-75" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Video Intelligence</h3>
              <p className="text-purple-100 text-sm mb-4">Analyze competitor videos and create powerful campaigns</p>
              <button 
                onClick={() => router.push('/campaigns')}
                className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Start Analysis
              </button>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-xl text-white">
              <div className="flex items-center justify-between mb-4">
                <FileText className="w-8 h-8" />
                <ArrowUpRight className="w-6 h-6 opacity-75" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Document Intelligence</h3>
              <p className="text-emerald-100 text-sm mb-4">Transform PDFs and docs into marketing gold</p>
              <button 
                onClick={() => router.push('/campaigns')}
                className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Upload Document
              </button>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 rounded-xl text-white">
              <div className="flex items-center justify-between mb-4">
                <Globe className="w-8 h-8" />
                <ArrowUpRight className="w-6 h-6 opacity-75" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Website Intelligence</h3>
              <p className="text-orange-100 text-sm mb-4">Analyze competitor sites and extract winning strategies</p>
              <button 
                onClick={() => router.push('/campaigns')}
                className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Analyze Site
              </button>
            </div>
          </div>

          {/* Upgrade Banner for Free/Starter Users */}
          {user && user.company.subscription_tier === 'free' && (
            <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Unlock Advanced Intelligence</h3>
                    <p className="text-purple-100 text-sm">Get unlimited campaigns, competitor analysis, and priority AI processing</p>
                  </div>
                </div>
                <button className="bg-white text-purple-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                  Upgrade Now
                </button>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {campaigns.slice(0, 5).map((campaign, index) => (
                  <div key={campaign.id} className="flex items-center space-x-4 py-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{campaign.title}</span> was {campaign.status === 'completed' ? 'completed' : 'updated'}
                      </p>
                      <p className="text-xs text-gray-500">{formatTimeAgo(campaign.last_activity || campaign.created_at)}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[campaign.status as keyof typeof STATUS_CONFIG].color}`}>
                      {STATUS_CONFIG[campaign.status as keyof typeof STATUS_CONFIG].label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Create New Campaign</h3>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(CAMPAIGN_TYPES).slice(0, 6).map(([type, config]) => (
                      <button
                        key={type}
                        className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-left"
                      >
                        <div className="text-lg mb-1">{config.icon}</div>
                        <div className="text-sm font-medium text-gray-900">{config.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Start with Intelligence</h4>
                  <div className="space-y-2">
                    <button 
                      onClick={() => {
                        setShowCreateModal(false)
                        router.push('/campaigns')
                      }}
                      className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                    >
                      <Video className="w-5 h-5 text-purple-600" />
                      <div className="text-left">
                        <div className="text-sm font-medium text-gray-900">From Video</div>
                        <div className="text-xs text-gray-500">YouTube, TikTok, Vimeo</div>
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => {
                        setShowCreateModal(false)
                        router.push('/campaigns')
                      }}
                      className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                    >
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div className="text-left">
                        <div className="text-sm font-medium text-gray-900">From Document</div>
                        <div className="text-xs text-gray-500">PDF, Word, PowerPoint</div>
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => {
                        setShowCreateModal(false)
                        router.push('/campaigns')
                      }}
                      className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                    >
                      <Globe className="w-5 h-5 text-emerald-600" />
                      <div className="text-left">
                        <div className="text-sm font-medium text-gray-900">From Website</div>
                        <div className="text-xs text-gray-500">Sales pages, landing pages</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex space-x-3">
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setShowCreateModal(false)
                    router.push('/campaigns')
                  }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}