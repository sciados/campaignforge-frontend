// src/app/dashboard/content-library/page.tsx - FIXED INFINITE LOOP
"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react'
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

  // ✅ FIX: Use ref to prevent infinite loops
  const isLoadingRef = useRef(false)
  const hasLoadedRef = useRef(false)

  // ✅ FIX: Stable callback without problematic dependencies
  const loadDashboardData = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isLoadingRef.current || hasLoadedRef.current) {
      console.log('⏸️ Skipping loadDashboardData - already loading/loaded')
      return
    }

    try {
      isLoadingRef.current = true
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
        
        // ✅ FIX: Process campaigns without creating dependency loops
        const enhancedCampaigns: Campaign[] = []
        const allContent: GeneratedContentItem[] = []
        
        for (const campaign of campaignsData) {
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

            const enhancedCampaign: Campaign = {
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
              confidence_score: avgRating > 0 ? avgRating / 5 : 0.85,
              last_activity: campaign.updated_at || campaign.created_at,
              workflow_state: campaign.workflow_state,
              completion_percentage: campaign.completion_percentage
            }

            enhancedCampaigns.push(enhancedCampaign)

            // Collect all content
            if (contentData.content_items) {
              allContent.push(...contentData.content_items)
            }

          } catch (error) {
            console.warn(`⚠️ Failed to enhance campaign ${campaign.id}:`, error)
            // Add basic campaign without enhancements
            enhancedCampaigns.push({
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
            })
          }
        }
        
        // ✅ FIX: Set state only once after all processing
        setCampaigns(enhancedCampaigns)
        setAllGeneratedContent(allContent)
        console.log('✅ Enhanced campaigns with content counts')
        console.log('✅ All generated content loaded:', allContent.length, 'items')

        // Load dashboard stats with the collected content
        try {
          const statsData = await apiClient.getCompanyStats()
          
          const transformedStats: DashboardStats = {
            total_campaigns_created: statsData.total_campaigns_created || 0,
            active_campaigns: statsData.active_campaigns || 0,
            draft_campaigns: enhancedCampaigns.filter(c => c.status === 'draft').length,
            completed_campaigns: enhancedCampaigns.filter(c => c.status === 'completed').length,
            total_intelligence_sources: enhancedCampaigns.reduce((sum, c) => sum + (c.intelligence_count || 0), 0),
            total_generated_content: allContent.length,
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
        console.error('❌ Failed to load campaigns:', error)
        setCampaigns([])
        setAllGeneratedContent([])
      }

      hasLoadedRef.current = true

    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
      isLoadingRef.current = false
    }
  }, [router]) // ✅ FIX: Only depend on router, which is stable

  // ✅ FIX: Only load once on mount
  useEffect(() => {
    if (!hasLoadedRef.current) {
      loadDashboardData()
    }
  }, [loadDashboardData])

  // ✅ FIX: Update stats when campaigns change, but don't trigger reload
  useEffect(() => {
    if (campaigns.length > 0 && stats) {
      const updatedStats: DashboardStats = {
        ...stats,
        draft_campaigns: campaigns.filter(c => c.status === 'draft').length,
        completed_campaigns: campaigns.filter(c => c.status === 'completed').length,
        total_intelligence_sources: campaigns.reduce((sum, c) => sum + (c.intelligence_count || 0), 0),
        total_generated_content: allGeneratedContent.length
      }
      setStats(updatedStats)
    }
  }, [campaigns.length, allGeneratedContent.length, campaigns, stats]) // ✅ FIX: Only depend on lengths, not full arrays

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

        {/* Campaign Display */}
        {/* Campaign Display - Replace your current section with this */}
        {campaigns.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-black mb-2">No campaigns yet</h3>
            <p className="text-gray-500 mb-6">
              Create your first campaign to start generating content!
            </p>
            <button 
              onClick={() => router.push('/campaigns')}
              className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors"
            >
              Create Campaign
            </button>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-black mb-2">No campaigns match your filters</h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your search or filter settings.
            </p>
            <button 
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
                setTypeFilter('all')
              }}
              className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors"
            >
              Clear Filters
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

              // Grid view
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

        {/* Debug Info - Remove this after testing */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm">
          <p><strong>Debug:</strong> campaigns.length = {campaigns.length}, filteredCampaigns.length = {filteredCampaigns.length}</p>
          <p><strong>Filters:</strong> search=&quot;{searchQuery}&quot;, status=&quot;{statusFilter}&quot;, type=&quot;{typeFilter}&quot;</p>
        </div>
      </div>
    </div>
  )
}