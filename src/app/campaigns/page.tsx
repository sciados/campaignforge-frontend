// src/app/campaigns/page.tsx - SIMPLIFIED - Universal Campaigns Only
'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Video, FileText, Globe, Calendar, Filter, Grid, List, FolderOpen } from 'lucide-react'
import { useApi, type Campaign } from '@/lib/api'
import CampaignFilters from '@/components/campaigns/CampaignFilters'
import CampaignGrid from '@/components/campaigns/CampaignGrid'
import CampaignStats from '@/components/campaigns/CampaignStats'
import SimpleCampaignModal from '@/components/campaigns/SimpleCampaignModal'

interface IntelligenceSource {
  id: string
  source_title: string
  source_type: string
  confidence_score: number
}

export default function CampaignsPage() {
  const router = useRouter()
  const api = useApi()
  
  // State management
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([])
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // UI State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Filter state - ✅ SIMPLIFIED: Only status filter, no campaign type
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Use ref to prevent multiple loads and track completion
  const isInitialized = useRef(false)
  const isLoadingData = useRef(false)

  // ✅ SIMPLIFIED: Remove campaign type filtering
  const filterCampaigns = useCallback(() => {
    let filtered = campaigns

    if (searchQuery) {
      filtered = filtered.filter(campaign =>
        campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(campaign => campaign.status === statusFilter)
    }

    setFilteredCampaigns(filtered)
  }, [campaigns, searchQuery, statusFilter])

  // Initialize campaigns page
  useEffect(() => {
    // Only run once
    if (isInitialized.current) {
      console.log('⏸️ Already initialized, skipping...')
      return
    }
    
    console.log('🔥 Initializing campaigns page...')
    
    // Check authentication
    const authToken = localStorage.getItem('authToken')
    const accessToken = localStorage.getItem('access_token')
    
    // Sync tokens
    if (authToken && !accessToken) {
      localStorage.setItem('access_token', authToken)
    } else if (accessToken && !authToken) {
      localStorage.setItem('authToken', accessToken)
    }
    
    const token = authToken || accessToken
    if (!token) {
      console.log('🔒 No auth token, redirecting...')
      setIsLoading(false)
      router.push('/login')
      return
    }
    
    console.log('🔑 Auth token found')
    isInitialized.current = true
    
    // Load initial data
    const loadInitialData = async () => {
      // Prevent concurrent calls
      if (isLoadingData.current) {
        console.log('⏸️ Load already in progress, skipping...')
        return
      }
      
      console.log('🚀 Starting loadInitialData...')
      isLoadingData.current = true
      
      try {
        console.log('📞 Calling getUserProfile...')
        const userProfile = await api.getUserProfile()
        console.log('✅ getUserProfile success:', userProfile)
        setUser(userProfile)

        console.log('📞 Calling getCampaigns...')
        const campaignsData = await api.getCampaigns({ limit: 50 })
        console.log('✅ getCampaigns success:', campaignsData)
        
        if (campaignsData && Array.isArray(campaignsData)) {
          setCampaigns(campaignsData)
          console.log(`📊 Set ${campaignsData.length} campaigns`)
        } else {
          console.log('⚠️ Invalid campaigns data, setting empty array')
          setCampaigns([])
        }

        // ✅ FIXED: Use the correct endpoint for dashboard stats
        try {
          console.log('📞 Calling getDashboardStats from /api/campaigns/dashboard/stats...')
          const dashboardStats = await api.getDashboardStats()
          console.log('✅ getDashboardStats success:', dashboardStats)
        } catch (statsError) {
          console.warn('⚠️ Dashboard stats failed (non-critical):', statsError)
        }

        // Force state update
        setTimeout(() => {
          console.log('🔄 Force updating loading state...')
          setIsLoading(false)
          setError(null)
          console.log('✅ Loading state updated!')
        }, 100)

      } catch (err) {
        console.error('❌ loadInitialData error:', err)
        const errorMessage = err instanceof Error ? err.message : 'Failed to load data'
        setError(errorMessage)
        setIsLoading(false)
        
      } finally {
        isLoadingData.current = false
        console.log('🏁 loadInitialData completed')
      }
    }
    
    // Load data
    loadInitialData()
    
  }, [api, router])

  // Filter campaigns when data changes
  useEffect(() => {
    filterCampaigns()
  }, [filterCampaigns])

  // ✅ SIMPLIFIED: Create universal campaign (no campaign type selection)
  const handleCreateCampaign = useCallback(async (campaignData: {
    title: string
    description: string
    keywords: string[]
    target_audience: string
  }) => {
    try {
      console.log('🎯 Creating universal campaign:', campaignData)
      
      // ✅ SIMPLIFIED: No campaign_type field needed - all campaigns are universal
      const payload = {
        title: campaignData.title,
        description: campaignData.description,
        keywords: campaignData.keywords,
        target_audience: campaignData.target_audience,
        tone: 'conversational',
        style: 'modern',
        settings: { 
          created_from: 'simplified_flow',
          creation_method: 'basic_info_only'
        }
      }
      
      console.log('📤 Exact payload being sent:', JSON.stringify(payload, null, 2))
      
      // Create campaign with simplified data structure
      const newCampaign = await api.createCampaign(payload)
      
      console.log('✅ Campaign created successfully:', newCampaign)
      
      // Add to campaigns list
      setCampaigns(prev => [newCampaign, ...prev])
      
      // Redirect to campaign detail page (Input Sources tab will be default)
      router.push(`/campaigns/${newCampaign.id}`)
      
    } catch (err) {
      console.error('❌ Campaign creation error:', err)
      
      const error = err as any
      let errorMessage = 'Failed to create campaign'
      let debugInfo = ''
      
      // Enhanced error parsing
      if (error?.response) {
        console.log('📥 Error response status:', error.response.status)
        console.log('📥 Error response headers:', error.response.headers)
        console.log('📥 Error response data:', error.response.data)
        
        if (error.response.data?.detail) {
          if (Array.isArray(error.response.data.detail)) {
            // Validation errors
            const validationErrors = error.response.data.detail.map((err: any) => 
              `${err.loc?.join(' -> ') || 'field'}: ${err.msg}`
            ).join(', ')
            errorMessage = `Validation Error: ${validationErrors}`
            debugInfo = JSON.stringify(error.response.data.detail, null, 2)
          } else {
            errorMessage = `Backend Error: ${error.response.data.detail}`
            debugInfo = String(error.response.data.detail)
          }
        } else if (error.response.status === 422) {
          errorMessage = 'Validation Error: Invalid data format'
          debugInfo = JSON.stringify(error.response.data, null, 2)
        } else if (error.response.status === 500) {
          errorMessage = 'Server Error: Internal server error'
          debugInfo = JSON.stringify(error.response.data, null, 2)
        } else {
          errorMessage = `HTTP ${error.response.status}: ${error.response.statusText}`
          debugInfo = JSON.stringify(error.response.data, null, 2)
        }
      } else if (error?.message) {
        errorMessage = error.message
        debugInfo = error.stack || ''
      }
      
      console.error('🔴 Final error message:', errorMessage)
      console.error('🔍 Debug info:', debugInfo)
      
      // Show debug info in error for production
      const devError = process.env.NODE_ENV === 'production' 
        ? `${errorMessage}\n\nDebug: ${debugInfo}` 
        : errorMessage
      
      throw new Error(devError) // Re-throw for modal to handle
    }
  }, [api, setCampaigns, router])

  const handleCampaignView = useCallback((campaign: Campaign) => {
    router.push(`/campaigns/${campaign.id}`)
  }, [router])

  const handleCampaignEdit = useCallback((campaign: Campaign) => {
    router.push(`/campaigns/${campaign.id}/settings`)
  }, [router])

  const handleCampaignDuplicate = useCallback(async (campaign: Campaign) => {
    try {
      const duplicatedCampaign = await api.duplicateCampaign(campaign.id)
      setCampaigns(prev => [duplicatedCampaign, ...prev])
    } catch (err) {
      console.error('Failed to duplicate campaign:', err)
      setError(err instanceof Error ? err.message : 'Failed to duplicate campaign')
    }
  }, [api])

  const handleCampaignDelete = useCallback(async (campaign: Campaign) => {
    if (!confirm(`Are you sure you want to delete "${campaign.title}"?`)) {
      return
    }

    try {
      await api.deleteCampaign(campaign.id)
      setCampaigns(prev => prev.filter(c => c.id !== campaign.id))
    } catch (err) {
      console.error('Failed to delete campaign:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete campaign')
    }
  }, [api])

  // ✅ SIMPLIFIED: Remove campaign type filter clearing
  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setStatusFilter('all')
  }, [])

  // Manual retry function
  const handleRetry = () => {
    console.log('🔄 Manual retry triggered')
    setError(null)
    setIsLoading(true)
    isInitialized.current = false
    isLoadingData.current = false
    
    // Recreate loadInitialData for retry
    const retryLoadData = async () => {
      if (isLoadingData.current) return
      
      console.log('🚀 Retry: Starting loadInitialData...')
      isLoadingData.current = true
      
      try {
        const userProfile = await api.getUserProfile()
        setUser(userProfile)

        const campaignsData = await api.getCampaigns({ limit: 50 })
        
        if (campaignsData && Array.isArray(campaignsData)) {
          setCampaigns(campaignsData)
        } else {
          setCampaigns([])
        }

        setTimeout(() => {
          setIsLoading(false)
          setError(null)
        }, 100)

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load data'
        setError(errorMessage)
        setIsLoading(false)
      } finally {
        isLoadingData.current = false
      }
    }
    
    setTimeout(() => {
      retryLoadData()
    }, 100)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your campaigns...</p>
          <div className="mt-4 p-4 bg-white rounded-lg shadow-sm max-w-md">
            <p className="text-sm text-gray-500">Debug Info:</p>
            <p className="text-xs text-gray-400">
              Campaigns: {campaigns.length} | 
              User: {user ? '✅' : '❌'} | 
              Initialized: {isInitialized.current ? '✅' : '❌'}
            </p>
            <button 
              onClick={handleRetry}
              className="mt-2 px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded hover:bg-purple-200"
            >
              Force Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Universal Campaigns</h1>
            <p className="text-gray-600 mt-2">Create intelligent campaigns that work with any input and generate multiple content types</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Campaign
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-700 font-medium">Error</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={handleRetry}
                  className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200"
                >
                  Retry
                </button>
                <button 
                  onClick={() => setError(null)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State - First Time User */}
        {campaigns.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="h-8 w-8 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to CampaignForge!</h2>
              <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                Create your first universal campaign that accepts any input source and generates multiple content types automatically.
              </p>
              
              {/* ✅ SIMPLIFIED: Universal workflow description */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">1. Create Campaign</h3>
                  <p className="text-sm text-gray-600">Set name and basic details</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Globe className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">2. Add Any Sources</h3>
                  <p className="text-sm text-gray-600">URLs, documents, videos, text</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Video className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">3. AI Analysis</h3>
                  <p className="text-sm text-gray-600">Extract marketing intelligence</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Plus className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">4. Generate Everything</h3>
                  <p className="text-sm text-gray-600">Emails, ads, posts, pages, videos</p>
                </div>
              </div>
              
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all inline-flex items-center text-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Campaign
              </button>
            </div>
          </div>
        )}

        {/* Campaign Stats */}
        {campaigns.length > 0 && (
          <CampaignStats campaigns={campaigns} user={user} />
        )}

        {/* ✅ SIMPLIFIED: Campaign Management without type filter */}
        {campaigns.length > 0 && (
          <>
            {/* Simplified Filters Component */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search campaigns..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
                  </select>
                  
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Clear Filters
                  </button>
                  
                  <span className="text-sm text-gray-500">
                    {filteredCampaigns.length} campaigns
                  </span>
                </div>
              </div>
            </div>

            <CampaignGrid
              campaigns={filteredCampaigns}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onCampaignView={handleCampaignView}
              onCampaignEdit={handleCampaignEdit}
              onCampaignDuplicate={handleCampaignDuplicate}
              onCampaignDelete={handleCampaignDelete}
            />
          </>
        )}

        {/* Recent Campaigns */}
{campaigns.length > 0 && (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200">
    <div className="p-6 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-500">
            {filteredCampaigns.length} campaigns • {' '}
            {filteredCampaigns.reduce((acc, campaign) => acc + (campaign.generated_content_count ?? 0), 0)} content pieces
          </span>
        </div>
      </div>
    </div>
    <div className="p-6">
      {filteredCampaigns.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No campaigns match your current filters.</p>
          <button 
            onClick={clearFilters}
            className="mt-2 text-purple-600 hover:text-purple-700"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCampaigns.slice(0, 3).map((campaign) => {
            const contentCount = campaign.generated_content_count ?? 0
            const hasContent = contentCount > 0
            
            return (
              <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-2 rounded-lg mr-3">
                    <span className="text-lg">🌟</span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{campaign.title}</h4>
                      {hasContent && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          📄 {contentCount}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(campaign.created_at).toLocaleDateString()}
                      <span className="mx-2">•</span>
                      <span className="text-purple-600 font-medium">Universal Campaign</span>
                      {hasContent && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="text-green-600 font-medium">{contentCount} content pieces ready</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                    campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {campaign.status}
                  </span>
                  
                  {/* Content Library Button - only show if content exists */}
                  {hasContent && (
                    <button 
                      onClick={() => router.push(`/campaigns/${campaign.id}/content`)}
                      className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center space-x-1 px-3 py-1 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <FolderOpen className="h-4 w-4" />
                      <span>Content</span>
                    </button>
                  )}
                  
                  <button 
                    onClick={() => handleCampaignView(campaign)}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium px-3 py-1 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    View
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  </div>
)}
      </div>

      {/* ✅ SIMPLIFIED: Campaign Creation Modal */}
      <SimpleCampaignModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateCampaign={handleCreateCampaign}
      />
    </div>
  )
}