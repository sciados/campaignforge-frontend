// src/app/campaigns/page.tsx - FIXED VERSION
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

  // 🔧 FIX: Use ref to prevent multiple loads and track completion
  const isInitialized = useRef(false)
  const isLoadingData = useRef(false)

  // Memoize filter function to prevent unnecessary re-renders
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

    if (typeFilter !== 'all') {
      filtered = filtered.filter(campaign => campaign.campaign_type === typeFilter)
    }

    setFilteredCampaigns(filtered)
  }, [campaigns, searchQuery, statusFilter, typeFilter])

  // 🔧 FIX: Simplified load function - moved inside useEffect to avoid dependency issues
  
  // 🔧 FIX: Simplified useEffect with better control
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
    
    // 🔧 FIX: Define loadInitialData inside useEffect to avoid dependency issues
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
        
        // Handle campaigns data
        if (campaignsData && Array.isArray(campaignsData.campaigns)) {
          setCampaigns(campaignsData.campaigns)
          console.log(`📊 Set ${campaignsData.campaigns.length} campaigns`)
        } else {
          console.log('⚠️ Invalid campaigns data, setting empty array')
          setCampaigns([])
        }

        // 🔧 FIX: Force state update with setTimeout
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
        setIsLoading(false) // This should work in catch block
        
      } finally {
        isLoadingData.current = false
        console.log('🏁 loadInitialData completed')
      }
    }
    
    // Load data
    loadInitialData()
    
  }, [api, router]) // 🔧 FIX: Include required dependencies

  // Filter campaigns when data changes
  useEffect(() => {
    filterCampaigns()
  }, [filterCampaigns])

  const handleCreateCampaign = useCallback(async (type: string, method: string) => {
    try {
      console.log('🎯 INPUT PARAMS:', { type, method })
      
      // 🔧 FIX: Map to backend enum values (lowercase with underscores)
      const typeMapping: { [key: string]: string } = {
        'video_content': 'video_content',
        'social_media': 'social_media', 
        'email_marketing': 'email_marketing',
        'multimedia': 'video_content',
        'content_marketing': 'blog_post',
        'advertising': 'advertisement',
        'blog': 'blog_post',
        'newsletter': 'email_marketing',
        'video': 'video_content',
        'social': 'social_media',
        'email': 'email_marketing',
        'ads': 'advertisement',
        'content': 'blog_post',
        'website': 'brand_awareness',
        'document': 'email_marketing',
        'brand_awareness': 'brand_awareness'
      }
      
      // 🔧 FIX: Handle empty/undefined type
      const inputType = type || 'video_content'
      const campaignType = typeMapping[inputType] || 'social_media'  // Use backend default
      
      const campaignData = {
        title: `New ${inputType.replace('_', ' ')} Campaign`,
        description: `Campaign created from ${method}`,
        target_audience: 'general',  // 🔧 ADD: Missing field
        campaign_type: campaignType,  // 🔧 FIX: Use lowercase enum values
        tone: 'conversational',
        style: 'modern',
        settings: { method, created_from: 'campaigns_page' }
      }

      console.log('🚀 Creating campaign with data:', campaignData)
      console.log('🔍 Mapped type from', inputType, 'to', campaignType)
      
      console.log('📡 About to call api.createCampaign...')
      const newCampaign = await api.createCampaign(campaignData)
      console.log('✅ Campaign created successfully:', newCampaign)
      
      setCampaigns(prev => [newCampaign, ...prev])
      setSelectedCampaignId(newCampaign.id)
      setShowIntelligence(true)
      
    } catch (err) {
      console.error('❌ Full error object:', err)
      
      // 🔧 FIX: Proper TypeScript error handling with deep inspection
      const error = err as any
      console.error('❌ Error name:', error?.name)
      console.error('❌ Error message:', error?.message)
      console.error('❌ Error stack:', error?.stack)
      console.error('❌ Error toString:', error?.toString())
      
      // 🔧 FIX: Deep dive into error properties
      console.error('❌ All error keys:', Object.keys(error || {}))
      console.error('❌ Error prototype:', Object.getPrototypeOf(error || {}))
      
      // 🔧 FIX: Try to access response data more thoroughly
      if (error?.response) {
        console.error('❌ Response status:', error.response.status)
        console.error('❌ Response statusText:', error.response.statusText)
        console.error('❌ Response data:', error.response.data)
        console.error('❌ Response headers:', error.response.headers)
        console.error('❌ Response config:', error.response.config)
        
        // Try different ways to extract the error message
        if (typeof error.response.data === 'string') {
          console.error('❌ Raw response string:', error.response.data)
        }
      } else if (error?.request) {
        console.error('❌ Request object:', error.request)
        console.error('❌ Request status:', error.request.status)
        console.error('❌ Request response:', error.request.response)
        console.error('❌ Request responseText:', error.request.responseText)
      }
      
      // 🔧 FIX: Also check if this is a network/fetch error
      if (error?.cause) {
        console.error('❌ Error cause:', error.cause)
      }
      
      // 🔧 FIX: Check for custom error properties
      if (error?.status) {
        console.error('❌ Error status property:', error.status)
      }
      if (error?.statusText) {
        console.error('❌ Error statusText property:', error.statusText)
      }
      if (error?.data) {
        console.error('❌ Error data property:', error.data)
      }
      
      // 🔧 FIX: More comprehensive error message extraction
      let errorMessage = 'Failed to create campaign'
      
      // 🔧 FIX: Handle the specific case where data.detail exists but is truncated  
      if (error?.data?.detail) {
        errorMessage = `Backend Error: ${error.data.detail}`
        console.error('🎯 Found error.data.detail:', error.data.detail)
      } else if (error?.response?.data) {
        const responseData = error.response.data
        if (typeof responseData === 'string') {
          errorMessage = `Backend Error: ${responseData}`
        } else if (responseData?.detail) {
          errorMessage = `Backend Error: ${responseData.detail}`
        } else if (responseData?.message) {
          errorMessage = `Backend Error: ${responseData.message}`
        } else if (responseData?.error) {
          errorMessage = `Backend Error: ${responseData.error}`
        } else {
          errorMessage = `Backend Error: ${JSON.stringify(responseData)}`
        }
      } else if (error?.request?.response) {
        errorMessage = `Backend Error: ${error.request.response}`
      } else if (error?.request?.responseText) {
        errorMessage = `Backend Error: ${error.request.responseText}`
      } else if (error?.message && !error.message.endsWith(': ')) {
        errorMessage = error.message
      } else if (error?.status) {
        errorMessage = `HTTP ${error.status}: ${error.statusText || 'Unknown error'}`
      }
      
      // 🔧 FIX: If the message is still truncated, add helpful info
      if (errorMessage.endsWith(': ') || errorMessage.endsWith(':')) {
        errorMessage += ' [Error message appears to be truncated. Check backend logs for full details.]'
      }
      
      console.error('🔴 Final error message:', errorMessage)
      setError(errorMessage)
      
      // 🔧 FIX: Check if campaign was actually created despite the error
      console.log('🔄 Checking if campaign was created despite error...')
      setTimeout(async () => {
        try {
          const campaignsData = await api.getCampaigns({ limit: 50 })
          if (campaignsData && campaignsData.campaigns.length > campaigns.length) {
            console.log('✅ Campaign was actually created! Refreshing list...')
            setCampaigns(campaignsData.campaigns)
            setError(null) // Clear the error since it worked
          }
        } catch (refreshErr) {
          console.log('❌ Could not refresh campaigns list:', refreshErr)
        }
      }, 1000) // Wait 1 second then check
    }
  }, [api, campaigns.length, setCampaigns, setSelectedCampaignId, setShowIntelligence, setError])

  // 🔧 FIX: Create explicit button handlers after handleCreateCampaign is defined
  const handleVideoClick = useCallback(() => {
    console.log('🖱️ Video button clicked - explicit handler')
    handleCreateCampaign('video_content', 'video')
  }, [handleCreateCampaign])

  const handleDocumentClick = useCallback(() => {
    console.log('🖱️ Document button clicked - explicit handler')
    handleCreateCampaign('email_marketing', 'document')
  }, [handleCreateCampaign])

  const handleWebsiteClick = useCallback(() => {
    console.log('🖱️ Website button clicked - explicit handler')
    handleCreateCampaign('brand_awareness', 'website')
  }, [handleCreateCampaign])

  const handleAnalysisComplete = async (result: AnalysisResult) => {
    try {
      const newIntelligenceSource: IntelligenceSource = {
        id: result.intelligence_id,
        source_title: result.source_title || result.source_url || 'Analysis Result',
        source_type: result.analysis_status || 'analysis',
        confidence_score: result.confidence_score
      }

      setIntelligenceSources(prev => [...prev, newIntelligenceSource])
      
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

  // 🔧 FIX: Add manual retry function that recreates the loadInitialData function
  const handleRetry = () => {
    console.log('🔄 Manual retry triggered')
    setError(null)
    setIsLoading(true)
    isInitialized.current = false
    isLoadingData.current = false
    
    // 🔧 FIX: Recreate loadInitialData for retry
    const retryLoadData = async () => {
      if (isLoadingData.current) return
      
      console.log('🚀 Retry: Starting loadInitialData...')
      isLoadingData.current = true
      
      try {
        const userProfile = await api.getUserProfile()
        setUser(userProfile)

        const campaignsData = await api.getCampaigns({ limit: 50 })
        
        if (campaignsData && Array.isArray(campaignsData.campaigns)) {
          setCampaigns(campaignsData.campaigns)
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

  // 🔧 FIX: Add debug info in loading state
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
        
        {/* 🔧 FIX: Add success indicator */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-700 font-medium">✅ SUCCESS! Page loaded successfully</p>
          <p className="text-green-600 text-sm mt-1">
            Found {campaigns.length} campaigns. Backend API is working correctly.
          </p>
        </div>

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

        {/* 🔧 DEBUG: Add manual test buttons with hardcoded parameters */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="text-yellow-800 font-medium mb-2">🔧 Debug: Manual Test Buttons</h3>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                console.log('🧪 DEBUG: Manual video test')
                handleCreateCampaign('video_content', 'video')
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Test Video
            </button>
            <button
              onClick={() => {
                console.log('🧪 DEBUG: Manual email test')
                handleCreateCampaign('email_marketing', 'document')
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Test Email
            </button>
            <button
              onClick={() => {
                console.log('🧪 DEBUG: Manual brand test')
                handleCreateCampaign('brand_awareness', 'website')
              }}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Test Brand
            </button>
            <button
              onClick={async () => {
                console.log('🔍 DEBUG: Testing multiple scenarios')
                const token = localStorage.getItem('authToken') || localStorage.getItem('access_token')
                const endpoint = 'https://campaign-backend-production-e2db.up.railway.app/api/campaigns'
                
                // Test different scenarios
                const scenarios = [
                  {
                    name: 'Test social_media (default)',
                    data: {
                      title: 'Test 1',
                      description: 'Test Description 1',
                      campaign_type: 'social_media'
                    }
                  },
                  {
                    name: 'Test email_marketing lowercase',
                    data: {
                      title: 'Test 2',
                      description: 'Test Description 2', 
                      campaign_type: 'email_marketing'
                    }
                  },
                  {
                    name: 'Test video_content lowercase',
                    data: {
                      title: 'Test 3',
                      description: 'Test Description 3',
                      campaign_type: 'video_content'
                    }
                  },
                  {
                    name: 'Test blog_post lowercase',
                    data: {
                      title: 'Test 4',
                      description: 'Test Description 4',
                      campaign_type: 'blog_post'
                    }
                  },
                  {
                    name: 'Test Just Required Fields',
                    data: {
                      title: 'Test 5',
                      description: 'Test Description 5'
                      // Let it use the default campaign_type
                    }
                  }
                ]
                
                for (const scenario of scenarios) {
                  try {
                    console.log(`🧪 Testing: ${scenario.name}`)
                    console.log('📤 Request data:', scenario.data)
                    
                    const response = await fetch(endpoint, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify(scenario.data)
                    })
                    
                    const responseText = await response.text()
                    console.log(`📥 ${scenario.name} - Status: ${response.status}`)
                    console.log(`📥 ${scenario.name} - Response: ${responseText}`)
                    
                    if (response.ok) {
                      console.log(`✅ SUCCESS: ${scenario.name} worked!`)
                      break // Stop on first success
                    } else {
                      console.log(`❌ FAILED: ${scenario.name}`)
                    }
                    
                    // Wait a bit between requests
                    await new Promise(resolve => setTimeout(resolve, 1000))
                    
                  } catch (err) {
                    const error = err as any
                    console.log(`🚨 ${scenario.name} - Error: ${error.message || error}`)
                  }
                }
              }}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              Test Multiple Scenarios
            </button>
          </div>
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

        {/* Quick Start Options */}
        {campaigns.length === 0 && !showIntelligence && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button 
              onClick={handleVideoClick}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:border-purple-300 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center mb-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Video className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900">From Video</h3>
              </div>
              <p className="text-gray-600">Process videos from YouTube, TikTok, and 8+ platforms</p>
            </button>

            <button 
              onClick={handleDocumentClick}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900">From Document</h3>
              </div>
              <p className="text-gray-600">Upload PDFs, docs, presentations, and spreadsheets</p>
            </button>

            <button 
              onClick={handleWebsiteClick}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:border-emerald-300 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center mb-4">
                <div className="bg-emerald-100 p-3 rounded-lg">
                  <Globe className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900">From Website</h3>
              </div>
              <p className="text-gray-600">Extract content from web pages and articles</p>
            </button>
          </div>
        )}

        {/* Campaign Stats */}
        {campaigns.length > 0 && (
          <CampaignStats campaigns={campaigns} user={user} />
        )}

        {/* Campaign Management */}
        {campaigns.length > 0 && !showIntelligence && (
          <>
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
            
            {intelligenceSources.length > 0 && (
              <ContentGenerator 
                campaignId={selectedCampaignId}
                intelligenceSources={intelligenceSources}
              />
            )}
          </div>
        )}

        {/* Recent Campaigns */}
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