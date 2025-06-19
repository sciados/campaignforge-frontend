// src/app/campaigns/page.tsx
'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Video, FileText, Globe, Calendar, Filter, Grid, List } from 'lucide-react'
import { useApi, type Campaign } from '@/lib/api'
import IntelligenceAnalyzer from '@/components/intelligence/IntelligenceAnalyzer'
import ContentGenerator from '@/components/intelligence/ContentGenerator'
import CampaignFilters from '@/components/campaigns/CampaignFilters'
import CampaignGrid from '@/components/campaigns/CampaignGrid'
import CampaignStats from '@/components/campaigns/CampaignStats'
import CreateCampaignModal from '@/components/campaigns/CreateCampaignModal'

interface IntelligenceSource {
  id: string
  source_title: string
  source_type: string
  confidence_score: number
}

interface AnalysisResult {
  intelligence_id: string
  confidence_score: number
  offer_intelligence: any
  psychology_intelligence: any
  competitive_opportunities: any[]
  campaign_suggestions: string[]
  analysis_status: string
  source_title?: string
  source_url?: string
}

export default function CampaignsPage() {
  const router = useRouter()
  const api = useApi()
  
  // State management
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([])
  const [intelligenceSources, setIntelligenceSources] = useState<IntelligenceSource[]>([])
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // UI State
  const [showIntelligence, setShowIntelligence] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  // Ref to track if we've attempted to load data
  const hasAttemptedLoad = useRef(false)

  // Memoize filter function to prevent unnecessary re-renders
  const filterCampaigns = useCallback(() => {
    let filtered = campaigns

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(campaign =>
        campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(campaign => campaign.status === statusFilter)
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(campaign => campaign.campaign_type === typeFilter)
    }

    setFilteredCampaigns(filtered)
  }, [campaigns, searchQuery, statusFilter, typeFilter])

  // Memoize load function to prevent unnecessary re-renders
  const loadInitialData = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isLoading) return;
    
    console.log('🚀 Starting loadInitialData...')
    
    try {
      setIsLoading(true)
      setError(null)

      console.log('📞 Calling getUserProfile...')
      // Add timeout to prevent hanging
      const timeoutId = setTimeout(() => {
        console.error('⏰ getUserProfile timeout!')
        throw new Error('User profile request timeout - backend may be down')
      }, 10000) // 10 second timeout

      // Load user profile
      const userProfile = await api.getUserProfile()
      clearTimeout(timeoutId)
      console.log('✅ getUserProfile success:', userProfile)
      setUser(userProfile)

      console.log('📞 Calling getCampaigns...')
      // Load campaigns with a new timeout
      const campaignsTimeoutId = setTimeout(() => {
        console.error('⏰ getCampaigns timeout!')
        throw new Error('Campaigns request timeout - backend may be down')
      }, 10000)

      const campaignsData = await api.getCampaigns({ limit: 50 })
      clearTimeout(campaignsTimeoutId)
      console.log('✅ getCampaigns success:', campaignsData)
      
      // Handle empty campaigns explicitly
      if (campaignsData && Array.isArray(campaignsData.campaigns)) {
        setCampaigns(campaignsData.campaigns)
        console.log(`📊 Set ${campaignsData.campaigns.length} campaigns`)
      } else {
        console.log('⚠️ Invalid campaigns data format:', campaignsData)
        setCampaigns([]) // Set empty array as fallback
      }

    } catch (err) {
      console.error('❌ loadInitialData error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data'
      setError(errorMessage)
      
      // PREVENT INFINITE RETRIES - Stop all retries on any error
      // Don't redirect or retry automatically
      console.log('🛑 Stopping retries due to error')
      
    } finally {
      console.log('🏁 loadInitialData finished')
      setIsLoading(false)
    }
  }, [api, isLoading]) // Remove router dependency to prevent redirects

  // Load initial data - with retry prevention
  useEffect(() => {
    console.log('🔥 useEffect triggered, isLoading:', isLoading, 'hasAttemptedLoad:', hasAttemptedLoad.current)
    
    // Only run once on mount
    if (hasAttemptedLoad.current) {
      console.log('⏸️ Skipping - already attempted load')
      return
    }
    
    // Check authentication first and sync tokens
    const authToken = localStorage.getItem('authToken')
    const accessToken = localStorage.getItem('access_token')
    
    // Sync tokens if one exists but not the other
    if (authToken && !accessToken) {
      localStorage.setItem('access_token', authToken)
      console.log('🔄 Synced authToken to access_token')
    } else if (accessToken && !authToken) {
      localStorage.setItem('authToken', accessToken)
      console.log('🔄 Synced access_token to authToken')
    }
    
    const token = authToken || accessToken
    if (!token) {
      console.log('🔒 No auth token found, redirecting to login...')
      setIsLoading(false) // Stop loading
      router.push('/login')
      return
    }
    
    console.log('🔑 Auth token found:', token.substring(0, 20) + '...')
    
    // Mark that we've attempted to load
    hasAttemptedLoad.current = true
    
    // AGGRESSIVE TIMEOUT - Force stop loading after 10 seconds
    const aggressiveTimeout = setTimeout(() => {
      console.log('🚨 AGGRESSIVE TIMEOUT - Forcing loading to stop!')
      setIsLoading(false)
      setError('Connection timeout. The API calls succeeded but the page failed to update. Please refresh.')
    }, 10000) // 10 seconds
    
    console.log('🚀 Attempting to load data...')
    loadInitialData().catch((err) => {
      console.error('💥 loadInitialData failed:', err)
      setIsLoading(false)
      setError('Failed to load campaigns: ' + err.message)
    }).finally(() => {
      console.log('🏁 loadInitialData completed')
      clearTimeout(aggressiveTimeout)
    })
    
    // Cleanup
    return () => {
      console.log('🧹 Cleaning up timeout')
      clearTimeout(aggressiveTimeout)
    }
  }, [loadInitialData, router, error, isLoading]) // Include all required dependencies

  // Filter campaigns when search/filter changes
  useEffect(() => {
    filterCampaigns()
  }, [filterCampaigns])

  const handleCreateCampaign = async (type: string, method: string) => {
    try {
      // Create a basic campaign first
      const campaignData = {
        title: `New ${type || 'Campaign'}`,
        description: `Campaign created from ${method}`,
        campaign_type: type || 'multimedia',
        tone: 'conversational',
        style: 'modern',
        settings: { method, created_from: 'campaigns_page' }
      }

      const newCampaign = await api.createCampaign(campaignData)
      
      // Update local state
      setCampaigns(prev => [newCampaign, ...prev])
      setSelectedCampaignId(newCampaign.id)
      
      // Show intelligence analyzer for the new campaign
      setShowIntelligence(true)
      
    } catch (err) {
      console.error('Failed to create campaign:', err)
      setError(err instanceof Error ? err.message : 'Failed to create campaign')
    }
  }

  const handleAnalysisComplete = async (result: AnalysisResult) => {
    try {
      // Convert analysis result to intelligence source format
      const newIntelligenceSource: IntelligenceSource = {
        id: result.intelligence_id,
        source_title: result.source_title || result.source_url || 'Analysis Result',
        source_type: result.analysis_status || 'analysis',
        confidence_score: result.confidence_score
      }

      // Add to intelligence sources
      setIntelligenceSources(prev => [...prev, newIntelligenceSource])
      
      // If we have a selected campaign, load its intelligence
      if (selectedCampaignId) {
        const intelligence = await api.getCampaignIntelligence(selectedCampaignId)
        setIntelligenceSources(intelligence.intelligence_sources)
      }
      
    } catch (err) {
      console.error('Failed to update intelligence sources:', err)
    }
  }

  const loadCampaignIntelligence = useCallback(async (campaignId: string) => {
    try {
      const intelligence = await api.getCampaignIntelligence(campaignId)
      setIntelligenceSources(intelligence.intelligence_sources)
    } catch (err) {
      console.error('Failed to load campaign intelligence:', err)
    }
  }, [api])

  const handleCampaignView = useCallback((campaign: Campaign) => {
    setSelectedCampaignId(campaign.id)
    setShowIntelligence(true)
    loadCampaignIntelligence(campaign.id)
  }, [loadCampaignIntelligence])

  const handleCampaignEdit = useCallback((campaign: Campaign) => {
    // Navigate to campaign edit page
    router.push(`/campaigns/${campaign.id}/edit`)
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

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setStatusFilter('all')
    setTypeFilter('all')
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your campaigns...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
            <p className="text-gray-600 mt-2">Create and manage your marketing campaigns</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Campaign
          </button>
        </div>

        {/* Error Display with Retry Button */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-700 font-medium">Connection Error</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                {error.toLowerCase().includes('cors') && (
                  <p className="text-red-600 text-sm mt-2">
                    🔧 This appears to be a server configuration issue. Please check that the backend is deployed and CORS is configured correctly.
                  </p>
                )}
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    setError(null)
                    loadInitialData()
                  }}
                  className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 transition-colors"
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

        {/* Quick Start Options */}
        {campaigns.length === 0 && !showIntelligence && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div 
              onClick={() => handleCreateCampaign('video_content', 'video')}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:border-purple-300 transition-colors cursor-pointer"
            >
              <div className="flex items-center mb-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Video className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900">From Video</h3>
              </div>
              <p className="text-gray-600">Process videos from YouTube, TikTok, and 8+ platforms</p>
            </div>

            <div 
              onClick={() => handleCreateCampaign('social_media', 'document')}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
            >
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900">From Document</h3>
              </div>
              <p className="text-gray-600">Upload PDFs, docs, presentations, and spreadsheets</p>
            </div>

            <div 
              onClick={() => handleCreateCampaign('email_marketing', 'website')}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:border-emerald-300 transition-colors cursor-pointer"
            >
              <div className="flex items-center mb-4">
                <div className="bg-emerald-100 p-3 rounded-lg">
                  <Globe className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900">From Website</h3>
              </div>
              <p className="text-gray-600">Extract content from web pages and articles</p>
            </div>
          </div>
        )}

        {/* Campaign Stats */}
        {campaigns.length > 0 && (
          <CampaignStats campaigns={campaigns} user={user} />
        )}

        {/* Campaign Management */}
        {campaigns.length > 0 && !showIntelligence && (
          <>
            {/* Filters */}
            <CampaignFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              typeFilter={typeFilter}
              onTypeChange={setTypeFilter}
              onClearFilters={clearFilters}
              resultsCount={filteredCampaigns.length}
            />

            {/* Campaign Grid */}
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

        {/* Intelligence Analysis Section */}
        {showIntelligence && selectedCampaignId && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Campaign Intelligence</h2>
              <button
                onClick={() => setShowIntelligence(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Campaigns
              </button>
            </div>

            <IntelligenceAnalyzer 
              campaignId={selectedCampaignId}
              onAnalysisComplete={handleAnalysisComplete}
            />
            
            {/* Content Generator - Only show when we have intelligence sources */}
            {intelligenceSources.length > 0 && (
              <ContentGenerator 
                campaignId={selectedCampaignId}
                intelligenceSources={intelligenceSources}
              />
            )}
          </div>
        )}

        {/* Recent Campaigns for Non-Empty State */}
        {campaigns.length > 0 && !showIntelligence && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">{filteredCampaigns.length} campaigns</span>
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
                  {filteredCampaigns.slice(0, 3).map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="bg-purple-100 p-2 rounded-lg mr-3">
                          <Video className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{campaign.title}</h4>
                          <p className="text-gray-600 text-sm flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(campaign.created_at).toLocaleDateString()}
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
                        <button 
                          onClick={() => handleCampaignView(campaign)}
                          className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateCampaign={handleCreateCampaign}
      />
    </div>
  )
}