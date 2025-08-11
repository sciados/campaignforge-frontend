// src/app/campaigns/[id]/page.tsx - UNIFIED VERSION USING ContentGenerator COMPONENT
'use client'
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Save, 
  FileText,
  Brain,
  Sparkles,
  Settings,
  Clock,
  CheckCircle,
  AlertCircle,
  Target,
  Play,
  RefreshCw,
  Shield,
  BarChart3,
  Activity
} from 'lucide-react'
import { useApi } from '@/lib/api'
import { Campaign, WorkflowStateResponse } from '@/lib/api'
import ContentGenerator from '@/components/intelligence/ContentGenerator'

// Import the IntelligenceSource type from ContentGenerator instead of defining it here
// This ensures we use the same interface everywhere

export default function CampaignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const api = useApi()

  console.log('🔍 Campaign Detail Page - Content Generation Focus')
  
  const isInitializedRef = useRef(false)
  const isLoadingRef = useRef(false)
  
  const campaignId = params.id as string
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoSave, setAutoSave] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [sessionTimer, setSessionTimer] = useState(0)
  const [isActiveSession, setIsActiveSession] = useState(false)
  const [intelligenceData, setIntelligenceData] = useState<any[]>([])

  // 🔧 FIXED: Updated to use new API methods
  const stableApi = useMemo(() => ({
    getCampaign: api.getCampaign,
    getCampaignIntelligence: api.getCampaignIntelligence,
    saveWorkflowProgress: api.saveWorkflowProgress,
    generateContent: api.generateContent
  }), [api])

  // Helper functions for navigation
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken')
      localStorage.removeItem('access_token')
    }
    router.push('/login')
  }

  const loadCampaignData = useCallback(async () => {
    if (!campaignId || isInitializedRef.current || isLoadingRef.current) {
      console.log('⏸️ Skipping loadCampaignData - already initialized/loading or no campaignId')
      return
    }

    try {
      console.log('🔄 Loading campaign data for:', campaignId)
      isLoadingRef.current = true
      setIsLoading(true)
      setError(null)
      
      // Load campaign data only
      const campaignData = await stableApi.getCampaign(campaignId)
      
      console.log('✅ Campaign loaded:', campaignData.title)
      setCampaign(campaignData)

      // Load intelligence data
      try {
        const intelligence = await stableApi.getCampaignIntelligence(campaignId)
        if (intelligence && intelligence.intelligence_entries) {
          setIntelligenceData(intelligence.intelligence_entries)
          console.log(`📊 Loaded ${intelligence.intelligence_entries.length} intelligence sources`)
        } else {
          setIntelligenceData([])
        }
      } catch (intelligenceError) {
        console.warn('⚠️ Intelligence loading failed:', intelligenceError)
        setIntelligenceData([])
      }
      
      isInitializedRef.current = true
      console.log('🏁 Campaign data loading completed')
      
    } catch (err) {
      console.error('❌ Failed to load campaign:', err)
      setError(err instanceof Error ? err.message : 'Failed to load campaign')
      isInitializedRef.current = true
    } finally {
      setIsLoading(false)
      isLoadingRef.current = false
    }
  }, [campaignId, stableApi])

  const refreshIntelligenceData = useCallback(async () => {
    if (!campaignId) return
    
    try {
      console.log('🔄 Manual refresh of intelligence data')
      const intelligence = await stableApi.getCampaignIntelligence(campaignId)
      if (intelligence && intelligence.intelligence_entries) {
        setIntelligenceData(intelligence.intelligence_entries)
        console.log(`✅ Refreshed: ${intelligence.intelligence_entries.length} intelligence sources`)
      }
    } catch (error) {
      console.warn('⚠️ Manual refresh failed:', error)
    }
  }, [campaignId, stableApi])

  useEffect(() => {
    if (campaignId && !isInitializedRef.current && !isLoadingRef.current) {
      loadCampaignData()
    }
  }, [campaignId, loadCampaignData])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isActiveSession) {
      interval = setInterval(() => {
        setSessionTimer(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isActiveSession])

  // 🔧 FIXED: Updated to use new workflow progress method
  const saveProgress = useCallback(async (data: any = {}) => {
    if (!autoSave || !campaignId) return
    
    try {
      await stableApi.saveWorkflowProgress(campaignId, {
        step_data: {
          session_data: data,
          timestamp: new Date().toISOString()
        },
        completion_percentage: campaign?.completion_percentage || 50
      })
      setLastSaved(new Date())
    } catch (error) {
      console.error('Auto-save failed:', error)
    }
  }, [campaignId, autoSave, campaign?.completion_percentage, stableApi])

  useEffect(() => {
    if (!autoSave || !isActiveSession) return
    
    const interval = setInterval(() => {
      saveProgress({ auto_save: true })
    }, 30000)
    
    return () => clearInterval(interval)
  }, [saveProgress, autoSave, isActiveSession])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm font-medium">Loading campaign...</p>
        </div>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto" />
          </div>
          <h1 className="text-2xl font-light text-gray-900 mb-2">Campaign Not Found</h1>
          <p className="text-gray-600 mb-6 max-w-md">{error || 'The campaign you\'re looking for doesn\'t exist.'}</p>
          <button
            onClick={() => router.push('/campaigns')}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Back to Campaigns
          </button>
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
            <button
              onClick={() => router.push('/campaigns')}
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {campaign.title}
                  {campaign.is_demo && (
                    <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                      Demo
                    </span>
                  )}
                </h1>
                <p className="text-sm text-gray-500">
                  Content Generation Ready
                  {isActiveSession && (
                    <span className="ml-2 text-green-600 font-medium">• {formatTime(sessionTimer)}</span>
                  )}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Session Control */}
            <button
              onClick={() => setIsActiveSession(!isActiveSession)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                isActiveSession 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {isActiveSession ? <Clock className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span>{isActiveSession ? 'Pause' : 'Start'}</span>
            </button>
            
            {/* Auto-save Status */}
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className={`w-2 h-2 rounded-full ${autoSave ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="font-medium">
                {lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : 'Not saved'}
              </span>
            </div>
            
            {/* Save Button */}
            <button
              onClick={() => saveProgress({ manual_save: true })}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              <Save className="h-4 w-4" />
              <span>Save</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
            >
              Sign Out
            </button>
            
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
              {campaign.title.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={() => router.push('/campaigns')}
              className="w-full flex items-center space-x-2 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors text-sm border border-purple-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Campaigns</span>
            </button>
          </div>

          <nav className="p-4 space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/dashboard' },
              { id: 'campaigns', label: 'Campaigns', icon: Target, path: '/campaigns' },
              { id: 'analytics', label: 'Analytics', icon: Activity, path: '/dashboard/analytics' },
              { id: 'content-library', label: 'Content Library', icon: FileText, path: '/dashboard/content-library' },
              { id: 'settings', label: 'Settings', icon: Settings, path: '/dashboard/settings' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                className="w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors text-gray-600 hover:bg-gray-50"
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
            
            {/* Admin Access */}
            <div className="pt-4 border-t border-gray-200 mt-4">
              <button
                onClick={() => router.push('/admin')}
                className="w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors text-gray-600 hover:bg-red-50 hover:text-red-700"
              >
                <Shield className="w-5 h-5" />
                <span className="font-medium">Admin Panel</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Campaign Summary Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Campaign Info */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Info</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Title</h4>
                      <p className="text-black font-medium">{campaign.title}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
                      <p className="text-sm text-gray-700">{campaign.description}</p>
                    </div>
                    
                    {campaign.target_audience && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Target Audience</h4>
                        <p className="text-sm text-gray-700">{campaign.target_audience}</p>
                      </div>
                    )}
                    
                    {campaign.salespage_url && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Analyzed URL</h4>
                        <p className="text-sm text-blue-600 truncate">{campaign.salespage_url}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Analysis Summary */}
                {intelligenceData.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Analysis Results</h3>
                      <button
                        onClick={refreshIntelligenceData}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-semibold text-gray-900">{intelligenceData.length}</div>
                        <div className="text-xs text-gray-600 font-medium">Sources Analyzed</div>
                      </div>
                      <div>
                        <div className="text-2xl font-semibold text-gray-900">
                          {intelligenceData.length > 0 ? Math.round(intelligenceData.reduce((acc: number, intel: any) => acc + (intel.confidence_score || 0), 0) / intelligenceData.length * 100) : 0}%
                        </div>
                        <div className="text-xs text-gray-600 font-medium">Avg Confidence</div>
                      </div>
                      <div>
                        <div className="text-2xl font-semibold text-gray-900">
                          {intelligenceData.reduce((acc: number, intel: any) => acc + (intel.insights_extracted || Object.keys(intel.offer_intelligence || {}).length || 1), 0)}
                        </div>
                        <div className="text-xs text-gray-600 font-medium">Total Insights</div>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-800">
                          Analysis Complete - Ready for Content Generation
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Main Content Generation Area - USING ContentGenerator COMPONENT */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                  {intelligenceData.length === 0 ? (
                    <div className="text-center py-16">
                      <Brain className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                      <h3 className="text-xl font-medium text-black mb-2">No Intelligence Available</h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        This campaign needs to complete the analysis process before content can be generated.
                      </p>
                      <button
                        onClick={() => router.push('/campaigns/create-workflow')}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                      >
                        Create New Campaign
                      </button>
                    </div>
                  ) : (
                    <ContentGenerator
                      campaignId={campaignId}
                      intelligenceSources={intelligenceData}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}