"use client";

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, Search, Filter, Grid, List, Calendar, Target, TrendingUp, 
  Video, FileText, Globe, Users, BarChart3, Star, Archive, 
  Play, Pause, Settings, Copy, Eye, Edit, Trash2, Clock,
  ChevronDown, ArrowUpRight, Zap, Award, Sparkles, ArrowLeft
} from 'lucide-react'
import { apiClient, type User as ApiUser, type Campaign as ApiCampaign } from '@/lib/api'

interface Campaign {
  id: string
  title: string
  description: string
  campaign_type: string
  status: string
  created_at: string
  updated_at: string
  user_id: string
  company_id: string
  content?: any
  intelligence_count?: number
  generated_content_count?: number
  confidence_score?: number
  last_activity?: string
  workflow_state?: string
  completion_percentage?: number
}

interface GeneratedContentItem {
  id: string
  content_type: string
  content_title: string
  content_body: string
  content_metadata: any
  generation_settings: any
  intelligence_used: any
  performance_data?: any
  user_rating?: number
  is_published?: boolean
  published_at?: string
  created_at: string
  updated_at?: string
}

interface DashboardStats {
  total_campaigns_created: number
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
    id: string
    company_name: string
    company_slug: string
    subscription_tier: string
    monthly_credits_used: number
    monthly_credits_limit: number
    company_size?: string
  }
}

const CAMPAIGN_TYPES = {
  social_media: { label: 'Social Media', icon: '📱', color: 'bg-gray-100 text-gray-800' },
  email_marketing: { label: 'Email Marketing', icon: '📧', color: 'bg-gray-100 text-gray-800' },
  video_content: { label: 'Video Content', icon: '🎥', color: 'bg-gray-100 text-gray-800' },
  blog_post: { label: 'Blog Post', icon: '📝', color: 'bg-gray-100 text-gray-800' },
  advertisement: { label: 'Advertisement', icon: '📢', color: 'bg-gray-100 text-gray-800' },
  product_launch: { label: 'Product Launch', icon: '🚀', color: 'bg-gray-100 text-gray-800' },
  brand_awareness: { label: 'Brand Awareness', icon: '🎯', color: 'bg-gray-100 text-gray-800' },
  multimedia: { label: 'Multimedia', icon: '🎨', color: 'bg-gray-100 text-gray-800' },
  universal: { label: 'Universal Campaign', icon: '🔮', color: 'bg-gray-100 text-gray-800' }
}

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: Play },
  review: { label: 'Review', color: 'bg-yellow-100 text-yellow-800', icon: Eye },
  active: { label: 'Active', color: 'bg-green-100 text-green-800', icon: TrendingUp },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: Award },
  archived: { label: 'Archived', color: 'bg-gray-100 text-gray-600', icon: Archive }
}

export default function ContentLibraryDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [allGeneratedContent, setAllGeneratedContent] = useState<GeneratedContentItem[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const router = useRouter()

  const loadDashboardData = React.useCallback(async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('authToken')
      if (!token) {
        router.push('/login')
        return
      }

      console.log('🔍 Loading Content Library data...')

      // Load user profile
      try {
        const userProfile = await apiClient.getUserProfile()
        // Transform API user to local user interface
        const transformedUser: User = {
          id: userProfile.id,
          email: userProfile.email,
          full_name: userProfile.full_name,
          role: userProfile.role,
          company: {
            id: userProfile.company.id,
            company_name: userProfile.company.company_name,
            company_slug: userProfile.company.company_slug,
            subscription_tier: userProfile.company.subscription_tier,
            monthly_credits_used: userProfile.company.monthly_credits_used,
            monthly_credits_limit: userProfile.company.monthly_credits_limit,
            company_size: userProfile.company.company_size
          }
        }
        setUser(transformedUser)
        console.log('✅ User profile loaded:', transformedUser.full_name)
      } catch (error) {
        console.error('❌ Failed to load user profile:', error)
      }

      // Load campaigns with real API call
      try {
        const campaignsData = await apiClient.getCampaigns({ limit: 50 })
        console.log('✅ Real campaigns loaded:', campaignsData.length)
        
        // Enhance campaigns with content count and intelligence data
        const enhancedCampaigns: Campaign[] = await Promise.all(
          campaignsData.map(async (campaign): Promise<Campaign> => {
            try {
              // Get generated content for each campaign
              const contentData = await apiClient.getContentList(campaign.id, false)
              const contentCount = contentData.content_items?.length || 0
              
              // Get intelligence sources
              const intelligenceData = await apiClient.getCampaignIntelligence(campaign.id)
              const intelligenceCount = intelligenceData.intelligence_sources?.length || 0
              
              // Calculate confidence score from content ratings
              const avgRating = contentData.content_items?.length > 0 
                ? contentData.content_items.reduce((sum, item) => sum + (item.user_rating || 0), 0) / contentData.content_items.length
                : 0

              return {
                id: campaign.id,
                title: campaign.title,
                description: campaign.description,
                campaign_type: campaign.campaign_type,
                status: campaign.status,
                created_at: campaign.created_at,
                updated_at: campaign.updated_at,
                user_id: campaign.user_id,
                company_id: campaign.company_id,
                content: campaign.content || {},
                generated_content_count: contentCount,
                intelligence_count: intelligenceCount,
                confidence_score: avgRating > 0 ? avgRating / 5 : 0.85, // Convert to 0-1 scale or default
                last_activity: campaign.updated_at || campaign.created_at,
                workflow_state: campaign.workflow_state,
                completion_percentage: campaign.completion_percentage
              }
            } catch (error) {
              console.warn(`⚠️ Failed to enhance campaign ${campaign.id}:`, error)
              return {
                id: campaign.id,
                title: campaign.title,
                description: campaign.description,
                campaign_type: campaign.campaign_type,
                status: campaign.status,
                created_at: campaign.created_at,
                updated_at: campaign.updated_at,
                user_id: campaign.user_id,
                company_id: campaign.company_id,
                content: campaign.content || {},
                generated_content_count: 0,
                intelligence_count: 0,
                confidence_score: 0,
                last_activity: campaign.updated_at || campaign.created_at,
                workflow_state: campaign.workflow_state,
                completion_percentage: campaign.completion_percentage
              }
            }
          })
        )
        
        setCampaigns(enhancedCampaigns)
        console.log('✅ Enhanced campaigns with content counts')

        // Load all generated content for stats
        const allContent: GeneratedContentItem[] = []
        for (const campaign of campaignsData) {
          try {
            const contentData = await apiClient.getContentList(campaign.id, false)
            if (contentData.content_items) {
              allContent.push(...contentData.content_items)
            }
          } catch (error) {
            console.warn(`⚠️ Failed to load content for campaign ${campaign.id}:`, error)
          }
        }
        setAllGeneratedContent(allContent)
        console.log('✅ All generated content loaded:', allContent.length, 'items')

      } catch (error) {
        console.error('❌ Failed to load campaigns:', error)
        setCampaigns([])
      }

      // Load dashboard stats
      try {
        const statsData = await apiClient.getCompanyStats()
        
        const transformedStats: DashboardStats = {
          total_campaigns_created: statsData.total_campaigns_created || 0,
          active_campaigns: statsData.active_campaigns || 0,
          draft_campaigns: campaigns.filter(c => c.status === 'draft').length,
          completed_campaigns: campaigns.filter(c => c.status === 'completed').length,
          total_intelligence_sources: campaigns.reduce((sum, c) => sum + (c.intelligence_count || 0), 0),
          total_generated_content: allGeneratedContent.length,
          credits_used_this_month: statsData.monthly_credits_used || 0,
          credits_remaining: statsData.credits_remaining || 0,
          avg_confidence_score: 0.85
        }
        
        setStats(transformedStats)
        console.log('✅ Dashboard stats loaded')
        
      } catch (error) {
        console.error('❌ Failed to load dashboard stats:', error)
      }

    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [allGeneratedContent.length, campaigns, router])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

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
    return 'bg-gray-100 text-gray-800'
  }

  const handleBack = () => {
    router.back()
  }

  const handleViewContent = (campaignId: string) => {
    router.push(`/campaigns/${campaignId}/content`)
  }

  const handleEditCampaign = (campaignId: string) => {
    router.push(`/campaigns/${campaignId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your content library...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="bg-black w-8 h-8 rounded-lg flex items-center justify-center mr-3">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-black">RodgersDigital</h1>
                <p className="text-sm text-gray-600 hidden md:block">Content Library</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {user && (
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-md ${getTierColor(user.company.subscription_tier)}`}>
                  <span className="text-sm font-medium">{user.company.subscription_tier}</span>
                </div>
              )}
              
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-medium text-sm">
                {user?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-12">
          <h2 className="text-3xl font-light text-black">Content Library</h2>
          <p className="text-gray-600 mt-2">Organize and manage all your generated marketing content</p>
        </div>

        {/* Content Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Content Pieces</p>
                <p className="text-3xl font-semibold text-black">{allGeneratedContent.length}</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-xl">
                <FileText className="h-6 w-6 text-black" />
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Across {campaigns.length} campaigns
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Recent Content</p>
                <p className="text-3xl font-semibold text-black">{allGeneratedContent.filter(content => {
                  const contentDate = new Date(content.created_at)
                  const weekAgo = new Date()
                  weekAgo.setDate(weekAgo.getDate() - 7)
                  return contentDate > weekAgo
                }).length}</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-xl">
                <Calendar className="h-6 w-6 text-black" />
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Generated this week
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Content Types</p>
                <p className="text-3xl font-semibold text-black">{new Set(allGeneratedContent.map(c => c.content_type)).size}</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-xl">
                <Globe className="h-6 w-6 text-black" />
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Different formats
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Quality Score</p>
                <p className="text-3xl font-semibold text-black">{allGeneratedContent.length > 0 
                  ? Math.round((allGeneratedContent.reduce((sum, c) => sum + (c.user_rating || 4), 0) / allGeneratedContent.length) * 20)
                  : 85}%</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-xl">
                <Star className="h-6 w-6 text-black" />
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Content confidence
            </div>
          </div>
        </div>

        {/* Content Controls */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all w-64"
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="all">All Status</option>
                  {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                    <option key={status} value={status}>{config.label}</option>
                  ))}
                </select>
                
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="all">All Types</option>
                  {Object.entries(CAMPAIGN_TYPES).map(([type, config]) => (
                    <option key={type} value={type}>{config.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex border border-gray-200 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 ${viewMode === 'grid' ? 'bg-gray-100 text-black' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 ${viewMode === 'list' ? 'bg-gray-100 text-black' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
              <button 
                onClick={() => router.push('/campaigns')}
                className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Campaign
              </button>
            </div>
          </div>
        </div>

        {/* Content Display */}
        {filteredCampaigns.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-black mb-2">
              {campaigns.length === 0 ? 'No campaigns yet' : 'No campaigns match your filters'}
            </h3>
            <p className="text-gray-500 mb-6">
              {campaigns.length === 0 
                ? 'Create your first campaign to start generating content!'
                : 'Try adjusting your search or filter settings.'
              }
            </p>
            <button 
              onClick={() => router.push('/campaigns')}
              className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors"
            >
              Create Campaign
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8" 
            : "space-y-4 mb-8"
          }>
            {filteredCampaigns.map((campaign) => {
              const typeConfig = CAMPAIGN_TYPES[campaign.campaign_type as keyof typeof CAMPAIGN_TYPES] || CAMPAIGN_TYPES.universal
              const statusConfig = STATUS_CONFIG[campaign.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft
              const StatusIcon = statusConfig.icon

              if (viewMode === 'list') {
                return (
                  <div key={campaign.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-sm transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                          {typeConfig?.icon || '📊'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="text-lg font-medium text-black">{campaign.title}</h3>
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig.label}
                            </div>
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${typeConfig?.color}`}>
                              {typeConfig?.label}
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{campaign.description}</p>
                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <span className="flex items-center">
                              <FileText className="w-4 h-4 mr-1" />
                              {campaign.generated_content_count || 0} pieces
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatTimeAgo(campaign.created_at)}
                            </span>
                            {campaign.confidence_score && campaign.confidence_score > 0 && (
                              <span className="flex items-center">
                                <Star className="w-4 h-4 mr-1 text-black" />
                                {(campaign.confidence_score * 100).toFixed(0)}% quality
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewContent(campaign.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditCampaign(campaign.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <div key={campaign.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all hover:border-gray-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                      {typeConfig?.icon || '📊'}
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig.label}
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-medium text-black mb-2">{campaign.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{campaign.description}</p>
                  
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-4 ${typeConfig?.color}`}>
                    {typeConfig?.label}
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Content Pieces</span>
                      <span className="font-medium text-black">{campaign.generated_content_count || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Intelligence Used</span>
                      <span className="font-medium text-black">{campaign.intelligence_count || 0}</span>
                    </div>
                    {campaign.confidence_score && campaign.confidence_score > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Quality Score</span>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-black mr-1" />
                          <span className="font-medium text-black">{(campaign.confidence_score * 100).toFixed(0)}%</span>
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
                    <button 
                      onClick={() => handleViewContent(campaign.id)}
                      className="flex-1 bg-black text-white px-4 py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors flex items-center justify-center"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Content
                    </button>
                    <button 
                      onClick={() => handleEditCampaign(campaign.id)}
                      className="bg-gray-100 text-black px-4 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="bg-gray-100 text-black px-4 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Content Generation Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-black p-8 rounded-2xl text-white">
            <div className="flex items-center justify-between mb-4">
              <Video className="w-8 h-8" />
              <ArrowUpRight className="w-6 h-6 opacity-75" />
            </div>
            <h3 className="text-lg font-medium mb-2">Video Content</h3>
            <p className="text-gray-300 text-sm mb-4">Generate scripts, captions, and promotional content from videos</p>
            <button 
              onClick={() => router.push('/campaigns')}
              className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-3 px-4 rounded-lg transition-colors font-medium"
            >
              Generate from Video
            </button>
          </div>

          <div className="bg-black p-8 rounded-2xl text-white">
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-8 h-8" />
              <ArrowUpRight className="w-6 h-6 opacity-75" />
            </div>
            <h3 className="text-lg font-medium mb-2">Document Content</h3>
            <p className="text-gray-300 text-sm mb-4">Transform documents into engaging marketing materials</p>
            <button 
              onClick={() => router.push('/campaigns')}
              className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-3 px-4 rounded-lg transition-colors font-medium"
            >
              Upload Document
            </button>
          </div>

          <div className="bg-black p-8 rounded-2xl text-white">
            <div className="flex items-center justify-between mb-4">
              <Globe className="w-8 h-8" />
              <ArrowUpRight className="w-6 h-6 opacity-75" />
            </div>
            <h3 className="text-lg font-medium mb-2">Web Content</h3>
            <p className="text-gray-300 text-sm mb-4">Extract and repurpose content from websites and articles</p>
            <button 
              onClick={() => router.push('/campaigns')}
              className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-3 px-4 rounded-lg transition-colors font-medium"
            >
              Analyze Website
            </button>
          </div>
        </div>

        {/* Upgrade Banner for Free Users */}
        {user && user.company.subscription_tier === 'free' && (
          <div className="bg-black rounded-2xl p-8 text-white mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-1">Unlock Premium Content Features</h3>
                  <p className="text-gray-300 text-sm">Get advanced templates, bulk generation, and content optimization</p>
                </div>
              </div>
              <button className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                Upgrade Now
              </button>
            </div>
          </div>
        )}

        {/* Content Organization */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="p-8 border-b border-gray-200">
            <h3 className="text-lg font-medium text-black">Content Categories</h3>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(CAMPAIGN_TYPES).map(([type, config]) => {
                const campaignCount = campaigns.filter(c => c.campaign_type === type).length
                const contentCount = campaigns
                  .filter(c => c.campaign_type === type)
                  .reduce((sum, c) => sum + (c.generated_content_count || 0), 0)
                
                return (
                  <div key={type} className="p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="text-2xl mb-2">{config.icon}</div>
                    <div className="text-sm font-medium text-black">{config.label}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {contentCount} pieces • {campaignCount} campaigns
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Create Content Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-sm max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-black">Generate New Content</h3>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-4">Content Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(CAMPAIGN_TYPES).slice(0, 6).map(([type, config]) => (
                      <button
                        key={type}
                        className="p-4 border border-gray-200 rounded-2xl hover:border-gray-300 hover:shadow-sm transition-all text-left"
                      >
                        <div className="text-lg mb-2">{config.icon}</div>
                        <div className="text-sm font-medium text-black">{config.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-sm font-medium text-black mb-4">Generate From</h4>
                  <div className="space-y-3">
                    <button 
                      onClick={() => {
                        setShowCreateModal(false)
                        router.push('/campaigns')
                      }}
                      className="w-full flex items-center space-x-4 p-4 border border-gray-200 rounded-2xl hover:border-gray-300 hover:shadow-sm transition-all"
                    >
                      <Video className="w-5 h-5 text-black" />
                      <div className="text-left">
                        <div className="text-sm font-medium text-black">Video Source</div>
                        <div className="text-xs text-gray-500">YouTube, TikTok, Vimeo</div>
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => {
                        setShowCreateModal(false)
                        router.push('/campaigns')
                      }}
                      className="w-full flex items-center space-x-4 p-4 border border-gray-200 rounded-2xl hover:border-gray-300 hover:shadow-sm transition-all"
                    >
                      <FileText className="w-5 h-5 text-black" />
                      <div className="text-left">
                        <div className="text-sm font-medium text-black">Document Upload</div>
                        <div className="text-xs text-gray-500">PDF, Word, PowerPoint</div>
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => {
                        setShowCreateModal(false)
                        router.push('/campaigns')
                      }}
                      className="w-full flex items-center space-x-4 p-4 border border-gray-200 rounded-2xl hover:border-gray-300 hover:shadow-sm transition-all"
                    >
                      <Globe className="w-5 h-5 text-black" />
                      <div className="text-left">
                        <div className="text-sm font-medium text-black">Website Analysis</div>
                        <div className="text-xs text-gray-500">Landing pages, articles</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex space-x-3">
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setShowCreateModal(false)
                    router.push('/campaigns')
                  }}
                  className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
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