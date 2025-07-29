// src/app/campaigns/[id]/page.tsx - FIXED: Updated for cleaned API
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

interface IntelligenceSource {
  id: string
  source_title?: string
  confidence_score: number
  source_type: string
  source_url?: string
  analysis_status: string
  offer_intelligence: Record<string, any>
  psychology_intelligence: Record<string, any>
  processing_metadata: Record<string, any>
  created_at: string
  updated_at?: string
  insights_extracted?: number
  intelligence_type?: string
  [key: string]: any
}

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
  const [intelligenceData, setIntelligenceData] = useState<IntelligenceSource[]>([])

  // 🔧 FIXED: Updated to use new API methods
  const stableApi = useMemo(() => ({
    getCampaign: api.getCampaign,
    getCampaignIntelligence: api.getCampaignIntelligence,
    saveWorkflowProgress: api.saveWorkflowProgress, // ✅ Use the correct method
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
                          {intelligenceData.length > 0 ? Math.round(intelligenceData.reduce((acc: number, intel: IntelligenceSource) => acc + (intel.confidence_score || 0), 0) / intelligenceData.length * 100) : 0}%
                        </div>
                        <div className="text-xs text-gray-600 font-medium">Avg Confidence</div>
                      </div>
                      <div>
                        <div className="text-2xl font-semibold text-gray-900">
                          {intelligenceData.reduce((acc: number, intel: IntelligenceSource) => acc + (intel.insights_extracted || Object.keys(intel.offer_intelligence || {}).length || 1), 0)}
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

              {/* Main Content Generation Area */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                  <ContentGenerationStep
                    campaignId={campaignId}
                    intelligenceCount={intelligenceData.length}
                    intelligenceData={intelligenceData}
                    campaign={campaign}
                    api={stableApi}
                    router={router}
                    onContentGenerated={(content) => {
                      console.log('✅ Content generated:', content)
                      saveProgress({ content_generated: content })
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

// Content Generation Step Component  
function ContentGenerationStep({ 
  campaignId, 
  intelligenceCount,
  intelligenceData,
  campaign,
  api,
  router,
  onContentGenerated 
}: {
  campaignId: string
  intelligenceCount: number
  intelligenceData: IntelligenceSource[]
  campaign: Campaign | null
  api: any
  router: any
  onContentGenerated: (content: any) => void
}) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<any[]>([])
  const [isLoadingExisting, setIsLoadingExisting] = useState(true)
  
  const hasLoadedContentRef = useRef(false)
  
  const stableGetCampaignIntelligence = useCallback(
    (id: string) => api.getCampaignIntelligence(id),
    [api]
  )

  useEffect(() => {
    const loadExistingContent = async () => {
      if (!campaignId || hasLoadedContentRef.current) {
        return
      }

      try {
        setIsLoadingExisting(true)
        hasLoadedContentRef.current = true
        
        const intelligence = await stableGetCampaignIntelligence(campaignId)
        
        if (intelligence?.generated_content && Array.isArray(intelligence.generated_content)) {
          setGeneratedContent(intelligence.generated_content)
        } else if (intelligence?.content && Array.isArray(intelligence.content)) {
          setGeneratedContent(intelligence.content)
        } else {
          setGeneratedContent([])
        }
        
      } catch (error) {
        console.error('❌ Failed to load existing content:', error)
        setGeneratedContent([])
      } finally {
        setIsLoadingExisting(false)
      }
    }
    
    if (campaignId && !hasLoadedContentRef.current) {
      loadExistingContent()
    }
  }, [campaignId, stableGetCampaignIntelligence])

  const refreshGeneratedContent = useCallback(async () => {
    try {
      console.log('🔄 Manual refresh of generated content')
      const intelligence = await stableGetCampaignIntelligence(campaignId)
      
      if (intelligence?.generated_content && Array.isArray(intelligence.generated_content)) {
        setGeneratedContent(intelligence.generated_content)
        console.log('✅ Refreshed generated content:', intelligence.generated_content.length, 'items')
      } else if (intelligence?.content && Array.isArray(intelligence.content)) {
        setGeneratedContent(intelligence.content)
        console.log('✅ Refreshed generated content:', intelligence.content.length, 'items')
      }
    } catch (error) {
      console.warn('⚠️ Manual refresh failed:', error)
    }
  }, [campaignId, stableGetCampaignIntelligence])

  const handleGenerateContent = async (contentType: string) => {
    setIsGenerating(true)
    
    try {
      console.log('🎯 Starting content generation for:', contentType)
      
      if (intelligenceData.length === 0) {
        throw new Error('No intelligence sources available. Please ensure analysis is complete.')
      }
      
      const firstIntelligence = intelligenceData[0]
      console.log('📊 Using intelligence source:', firstIntelligence)
      
      const response = await api.generateContent({
        intelligence_id: firstIntelligence.id,
        content_type: contentType,
        campaign_id: campaignId,
        preferences: {
          style: 'professional',
          tone: 'professional',
          length: 'medium',
          target_audience: campaign?.target_audience || 'general audience'
        }
      })
      
      console.log('✅ Content generation SUCCESS:', response)
      
      const newContent = {
        id: response.content_id,
        type: contentType,
        title: response.generated_content?.title || getContentTitle(contentType),
        generated_at: new Date(),
        status: 'generated',
        content: response.generated_content?.content,
        metadata: response.generated_content?.metadata,
        smart_url: response.smart_url,
        performance_predictions: response.performance_predictions,
        preview: (() => {
          const content = response.generated_content?.content
          if (typeof content === 'string') {
            return content.substring(0, 200) + (content.length > 200 ? '...' : '')
          } else if (content && typeof content === 'object') {
            const contentStr = JSON.stringify(content, null, 2)
            return contentStr.substring(0, 200) + (contentStr.length > 200 ? '...' : '')
          }
          return 'Content generated successfully'
        })()
      }
      
      setGeneratedContent(prev => [...prev, newContent])
      onContentGenerated(newContent)
      
      console.log('✅ Content successfully added to UI:', newContent.title)
      
    } catch (error) {
      console.error('❌ Content generation failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Content generation failed: ${errorMessage}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const getContentTitle = (type: string) => {
    const titles: Record<string, string> = {
      'email_sequence': 'Email Marketing Sequence',
      'SOCIAL_POSTS': 'Social Media Posts',
      'ad_copy': 'Advertisement Copy',
      'blog_post': 'Blog Post',
      'LANDING_PAGE': 'Landing Page Copy',
      'video_script': 'Video Script'
    }
    return titles[type] || 'Generated Content'
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-light text-black">Generate Content</h2>
        
        <button
          onClick={refreshGeneratedContent}
          className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh Content</span>
        </button>
      </div>
      
      {intelligenceCount === 0 ? (
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
        <div className="space-y-8">
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h3 className="text-lg font-medium text-green-900 mb-2">✅ Ready to Generate Content</h3>
            <p className="text-green-700">
              Analysis complete! You have {intelligenceCount} intelligence source{intelligenceCount !== 1 ? 's' : ''} ready for content generation.
            </p>
          </div>

          {/* Content Generation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { 
                type: 'email_sequence', 
                title: 'Email Sequence', 
                description: 'Multi-part email campaign',
                icon: '📧',
                action: () => handleGenerateContent('email_sequence')
              },
              { 
                type: 'SOCIAL_POSTS', 
                title: 'Social Media Posts', 
                description: 'Platform-specific content',
                icon: '📱',
                action: () => handleGenerateContent('SOCIAL_POSTS')
              },
              { 
                type: 'ad_copy', 
                title: 'Ad Copy', 
                description: 'Paid advertising content',
                icon: '📢',
                action: () => handleGenerateContent('ad_copy')
              },
              { 
                type: 'blog_post', 
                title: 'Blog Post', 
                description: 'Long-form content',
                icon: '📝',
                action: () => handleGenerateContent('blog_post')
              },
              { 
                type: 'LANDING_PAGE', 
                title: 'Landing Page', 
                description: 'Conversion-focused page',
                icon: '🎯',
                action: () => handleGenerateContent('LANDING_PAGE')
              },
              { 
                type: 'video_script', 
                title: 'Video Script', 
                description: 'Video content outline',
                icon: '🎬',
                action: () => handleGenerateContent('video_script')
              }
            ].map((contentType) => (
              <button
                key={contentType.type}
                onClick={contentType.action}
                disabled={isGenerating}
                className="p-6 bg-white border border-gray-200 rounded-2xl hover:border-gray-400 hover:shadow-md transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-3xl mb-3">{contentType.icon}</div>
                <h4 className="font-medium text-black mb-1">{contentType.title}</h4>
                <p className="text-sm text-gray-500 mb-3">{contentType.description}</p>
                {isGenerating && (
                  <div className="mt-3 flex items-center text-black">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span className="text-sm font-medium">Generating...</span>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Loading state */}
          {isLoadingExisting && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-blue-700 font-medium">Loading existing content...</span>
              </div>
            </div>
          )}

          {/* Generated Content Display */}
          {generatedContent.length > 0 && !isLoadingExisting && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-black">
                Generated Content ({generatedContent.length})
              </h3>
              
              <div className="space-y-4">
                {generatedContent.map((content, index) => (
                  <div key={content.id || index} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-green-600" />
                          </div>
                          <span className="text-sm font-medium text-black">
                            {content.title}
                          </span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            Generated
                          </span>
                          {content.smart_url && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              Smart URL
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mb-3">
                          Generated {new Date(content.generated_at).toLocaleString()}
                        </p>
                        {content.preview && (
                          <p className="text-sm text-black bg-gray-50 p-3 rounded-lg border">
                            {content.preview}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button 
                          onClick={() => router.push(`/dashboard/content-library`)}
                          className="px-3 py-1 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium"
                        >
                          View All
                        </button>
                        <button className="px-3 py-1 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                          Edit
                        </button>
                        {content.smart_url && (
                          <button 
                            onClick={() => window.open(content.smart_url, '_blank')}
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            Track
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Campaign Complete */}
              <div className="bg-gray-100 rounded-2xl p-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-black mb-2">🎉 Content Generated!</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  You have successfully generated marketing content using AI analysis of your campaign data.
                </p>
                
                <div className="flex justify-center space-x-4">
                  <button 
                    onClick={() => router.push(`/dashboard/content-library`)}
                    className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
                  >
                    View All Content
                  </button>
                  <button 
                    onClick={async () => {
                      try {
                        // Simple content export
                        const content = `Campaign: ${campaign?.title}\n\nGenerated Content Summary:\n- ${generatedContent.length} content pieces generated\n\nContent Types:\n${generatedContent.map(c => `- ${c.title}`).join('\n')}\n\nGenerated using AI analysis and intelligence extraction.`
                        
                        const blob = new Blob([content], { type: 'text/plain' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `${campaign?.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'campaign'}_content.txt`
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        URL.revokeObjectURL(url)
                        
                        alert('✅ Campaign content downloaded!')
                      } catch (error) {
                        console.error('Download failed:', error)
                        alert('Download failed. Please try again.')
                      }
                    }}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    📦 Download Content
                  </button>
                  <button 
                    onClick={() => router.push('/campaigns/create-workflow')}
                    className="px-6 py-3 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Create New Campaign
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* No Content Yet */}
          {generatedContent.length === 0 && !isLoadingExisting && (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Generate Content</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Choose a content type above to generate your first piece of marketing content using the analyzed intelligence.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}