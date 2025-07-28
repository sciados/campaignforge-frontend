// src/app/campaigns/[id]/page.tsx - SIMPLIFIED 3-STEP WORKFLOW
'use client'
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Save, 
  FileText,
  Database,
  Brain,
  Sparkles,
  Settings,
  Clock,
  CheckCircle,
  AlertCircle,
  Target,
  Upload,
  Link,
  Plus,
  Play,
  Loader2,
  RefreshCw,
  Shield,
  BarChart3,
  Activity,
  Image as ImageIcon
} from 'lucide-react'
import { useApi } from '@/lib/api'
import { Campaign, WorkflowStateResponse } from '@/lib/api'

interface IntelligenceSource {
  // Core identifiers
  id: string
  
  // Source information  
  source_title?: string
  source_type: string
  source_url?: string
  
  // Analysis data
  confidence_score: number
  analysis_status: string
  
  // Intelligence objects
  offer_intelligence: Record<string, any>
  psychology_intelligence: Record<string, any>
  processing_metadata: Record<string, any>
  
  // Timestamps
  created_at: string
  updated_at?: string
  
  // Optional extras
  insights_extracted?: number
  intelligence_type?: string
  [key: string]: any
}

export default function CampaignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const api = useApi()

  console.log('🔍 API object:', api)
  console.log('🔍 Available methods:', Object.keys(api))
  
  const isInitializedRef = useRef(false)
  const isLoadingRef = useRef(false)
  
  const campaignId = params.id as string
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [workflowState, setWorkflowState] = useState<WorkflowStateResponse | null>(null)
  const [autoSave, setAutoSave] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [sessionTimer, setSessionTimer] = useState(0)
  const [isActiveSession, setIsActiveSession] = useState(false)
  const [intelligenceData, setIntelligenceData] = useState<IntelligenceSource[]>([])

  const stableApi = useMemo(() => ({
    getCampaign: api.getCampaign,
    getWorkflowState: api.getWorkflowState,
    getCampaignIntelligence: api.getCampaignIntelligence,
    saveProgress: api.saveProgress,
    saveWorkflowProgress: api.saveWorkflowProgress || api.saveProgress,
    analyzeURL: api.analyzeURL,
    uploadDocument: api.uploadDocument,
    generateContent: api.generateContent,
    // Fallback for missing image generation methods
    // generateSingleImage: api.generateSingleImage || (() => Promise.reject(new Error('Image generation not implemented'))),
    // generateCampaignWithImages: api.generateCampaignWithImages || (() => Promise.reject(new Error('Campaign image generation not implemented'))),
    // testStabilityConnection: api.testStabilityConnection || (() => Promise.resolve({ integration_ready: false })),
    // downloadCampaignPackage: api.downloadCampaignPackage || (() => Promise.resolve({ total_images: 0, total_content_pieces: 0 }))
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
      
      // Load both campaign and workflow state
      const [campaignData, workflowData] = await Promise.all([
        stableApi.getCampaign(campaignId),
        stableApi.getWorkflowState(campaignId)
      ])
      
      console.log('✅ Campaign loaded:', campaignData.title)
      setCampaign(campaignData)
      setWorkflowState(workflowData)
      
      // Determine current step based on workflow state
      if (workflowData.can_generate_content) {
        setCurrentStep(3) // Content generation available
      } else if (workflowData.auto_analysis?.status === 'COMPLETED') {
        setCurrentStep(2) // Intelligence complete, ready for content
      } else {
        setCurrentStep(1) // Still in setup/analysis phase
      }
      
      console.log('✅ Workflow status loaded')

      try {
        const intelligence = await stableApi.getCampaignIntelligence(campaignId)
        // Fix: Handle different possible response structures
        if (intelligence && (intelligence.intelligence_entries)) {
          const sources = intelligence.intelligence_entries || []
          setIntelligenceData(sources)
          console.log(`📊 Loaded ${sources.length} intelligence sources`)
        } else {
          setIntelligenceData([])
        }
      } catch (intelligenceError) {
        console.warn('⚠️ Intelligence loading failed (normal for new campaigns):', intelligenceError)
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
      // Fix: Handle different possible response structures
      if (intelligence && (intelligence.intelligence_entries)) {
        const sources = intelligence.intelligence_entries || []
        setIntelligenceData(sources)
        console.log(`✅ Refreshed: ${sources.length} intelligence sources`)
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

  const saveProgress = useCallback(async (data: any = {}) => {
    if (!autoSave || !campaignId) return
    
    try {
      await stableApi.saveProgress(campaignId, {
        current_step: currentStep,
        session_data: data,
        timestamp: new Date().toISOString()
      })
      setLastSaved(new Date())
    } catch (error) {
      console.error('Auto-save failed:', error)
    }
  }, [campaignId, currentStep, autoSave, stableApi])

  useEffect(() => {
    if (!autoSave || !isActiveSession) return
    
    const interval = setInterval(() => {
      saveProgress({ auto_save: true })
    }, 30000)
    
    return () => clearInterval(interval)
  }, [saveProgress, autoSave, isActiveSession])

  const handleStepChange = useCallback(async (step: number) => {
    if (!workflowState || !campaign) return
    
    try {
      // Save progress with new interface
      await stableApi.saveWorkflowProgress(campaignId, {
        workflow_state: step === 1 ? 'basic_setup' : step === 2 ? 'analysis_complete' : 'content_ready',
        completion_percentage: step === 1 ? 33 : step === 2 ? 66 : 100,
        step_data: { current_step: step }
      })
      
      setCurrentStep(step)
      
      // Reload workflow state to get updated data
      await loadCampaignData()
      
    } catch (err) {
      console.error('Error updating step:', err)
      setError('Failed to update step')
    }
  }, [campaignId, workflowState, campaign, stableApi, loadCampaignData])

  // Get auto-analysis status
  const getAnalysisStatus = () => {
    if (!workflowState) return 'pending'
    return workflowState.auto_analysis?.status || 'pending'
  }

  const isAnalysisComplete = () => {
    return getAnalysisStatus() === 'COMPLETED'
  }

  const canGenerateContent = () => {
    return workflowState?.can_generate_content || false
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const renderStepContent = () => {
    if (!campaign) return null

    switch (currentStep) {
      case 1:
        return (
          <CampaignSetupStep 
            campaign={campaign}
            workflowState={workflowState}
            onUpdate={setCampaign}
            onSave={saveProgress}
            onAnalysisComplete={() => setCurrentStep(2)}
          />
        )
      
      case 2:
        return (
          <IntelligenceAnalysisStep
            campaignId={campaignId}
            intelligenceData={intelligenceData}
            workflowState={workflowState}
            onIntelligenceComplete={() => setCurrentStep(3)}
            onRefresh={refreshIntelligenceData}
          />
        )
      
      case 3:
        return (
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
        )
      
      default:
        return <div>Invalid step</div>
    }
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
                  Step {currentStep} of 3
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
              {/* Step Navigation */}
              <div className="lg:col-span-1 space-y-6">
                <StepNavigation
                  currentStep={currentStep}
                  workflowState={workflowState}
                  onStepClick={handleStepChange}
                />

                {/* Progress Summary */}
                {workflowState && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 font-medium">Overall</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {Math.round(workflowState.completion_percentage || 0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${workflowState.completion_percentage || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-6 text-center">
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          {workflowState.metrics?.intelligence_count || intelligenceData.length}
                        </div>
                        <div className="text-xs text-gray-600 font-medium">Sources</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          {workflowState.metrics?.sources_count || intelligenceData.filter(s => s.confidence_score && s.confidence_score > 0).length}
                        </div>
                        <div className="text-xs text-gray-600 font-medium">Analyzed</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          {workflowState.metrics?.content_count || 0}
                        </div>
                        <div className="text-xs text-gray-600 font-medium">Content</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Auto-Analysis Status */}
                {campaign.auto_analysis_enabled && workflowState && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Auto-Analysis</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status</span>
                        <span className={`text-sm font-medium ${
                          getAnalysisStatus() === 'COMPLETED' ? 'text-green-600' :
                          getAnalysisStatus() === 'IN_PROGRESS' ? 'text-blue-600' :
                          getAnalysisStatus() === 'FAILED' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {getAnalysisStatus()}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Confidence</span>
                        <span className="text-sm font-medium text-gray-900">
                          {Math.round((workflowState.auto_analysis?.confidence_score || 0) * 100)}%
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        URL: {workflowState.auto_analysis?.url || campaign.salespage_url || 'Not set'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Next Steps */}
                {workflowState && workflowState.next_steps && workflowState.next_steps.length > 0 && (
                  <div className="bg-purple-600 rounded-xl p-6 shadow-sm">
                    <h4 className="text-sm font-semibold text-white mb-2">Next Steps</h4>
                    <div className="space-y-2">
                      {workflowState.next_steps.slice(0, 2).map((step, index) => (
                        <div key={index} className="text-sm text-purple-100">
                          • {step.label}
                        </div>
                      ))}
                    </div>
                    {canGenerateContent() && currentStep < 3 && (
                      <button
                        onClick={() => handleStepChange(3)}
                        className="w-full mt-4 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                      >
                        Generate Content
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                  {renderStepContent()}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

// Step Navigation Component - Updated for 3 steps
function StepNavigation({ 
  currentStep, 
  workflowState, 
  onStepClick 
}: {
  currentStep: number
  workflowState: WorkflowStateResponse | null
  onStepClick: (step: number) => void
}) {
  const steps = [
    { number: 1, icon: FileText, title: "Campaign Setup", description: "Basic campaign information" },
    { number: 2, icon: Brain, title: "Auto Intelligence", description: "Automatic analysis & insights" },
    { number: 3, icon: Sparkles, title: "Generate Content", description: "Create marketing content" }
  ]

  const getStepStatus = (stepNumber: number) => {
    if (stepNumber === currentStep) return 'active'
    if (stepNumber < currentStep) return 'completed'
    
    // Check if step is available based on workflow state
    if (workflowState && stepNumber === 3) {
      return workflowState.can_generate_content ? 'available' : 'locked'
    }
    
    return 'available'
  }

  const getStepIcon = (step: any, status: string) => {
    const Icon = step.icon
    
    if (status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-600" />
    } else if (status === 'locked') {
      return <Icon className="h-5 w-5 text-gray-300" />
    } else {
      return <Icon className={`h-5 w-5 ${
        status === 'active' ? 'text-purple-600' : 'text-gray-400'
      }`} />
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow Steps</h3>
      
      <div className="space-y-3">
        {steps.map((step) => {
          const status = getStepStatus(step.number)
          
          return (
            <button
              key={step.number}
              onClick={() => status !== 'locked' && onStepClick(step.number)}
              disabled={status === 'locked'}
              className={`w-full p-4 rounded-xl border text-left transition-all ${
                status === 'completed' ? 'bg-green-50 border-green-200' :
                status === 'active' ? 'bg-purple-50 border-purple-200' :
                status === 'locked' ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-50' :
                'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                {getStepIcon(step, status)}
                <div>
                  <div className="text-sm font-medium text-gray-900">{step.title}</div>
                  <div className="text-xs text-gray-600">{step.description}</div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Current step indicator */}
      <div className="mt-4 p-3 bg-gray-100 rounded-xl">
        <div className="flex items-center space-x-2">
          <Target className="h-4 w-4 text-purple-600" />
          <span className="text-sm text-gray-900 font-medium">
            Current: {steps.find(s => s.number === currentStep)?.title}
          </span>
        </div>
      </div>
    </div>
  )
}

// Campaign Setup Step Component
function CampaignSetupStep({ 
  campaign, 
  workflowState,
  onUpdate, 
  onSave,
  onAnalysisComplete
}: {
  campaign: Campaign
  workflowState: WorkflowStateResponse | null
  onUpdate: (campaign: Campaign) => void
  onSave: (data: any) => void
  onAnalysisComplete: () => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    title: campaign.title,
    description: campaign.description,
    target_audience: campaign.target_audience || '',
    keywords: campaign.keywords || []
  })

  const handleSave = async () => {
    onUpdate({ ...campaign, ...formData })
    onSave(formData)
    setIsEditing(false)
  }

  // Check if auto-analysis is running or complete
  const analysisStatus = workflowState?.auto_analysis?.status || 'pending'
  const isAnalysisRunning = analysisStatus === 'IN_PROGRESS'
  const isAnalysisReady = analysisStatus === 'COMPLETED'

  useEffect(() => {
    if (isAnalysisReady) {
      // Auto-advance to next step when analysis is complete
      setTimeout(onAnalysisComplete, 1000)
    }
  }, [isAnalysisReady, onAnalysisComplete])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-light text-black">Campaign Setup</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isEditing 
              ? 'bg-gray-100 text-black hover:bg-gray-200' 
              : 'bg-black text-white hover:bg-gray-900'
          }`}
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {/* Auto-Analysis Status */}
      <div className={`border rounded-xl p-6 ${
        isAnalysisReady ? 'bg-green-50 border-green-200' :
        isAnalysisRunning ? 'bg-blue-50 border-blue-200' :
        'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-center space-x-3 mb-2">
          {isAnalysisReady ? (
            <CheckCircle className="h-6 w-6 text-green-600" />
          ) : isAnalysisRunning ? (
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
          ) : (
            <Clock className="h-6 w-6 text-yellow-600" />
          )}
          <h3 className={`text-lg font-medium ${
            isAnalysisReady ? 'text-green-900' :
            isAnalysisRunning ? 'text-blue-900' :
            'text-yellow-900'
          }`}>
            {isAnalysisReady ? '✅ Auto-Analysis Complete' :
             isAnalysisRunning ? '🔄 Auto-Analysis Running' :
             '⏳ Auto-Analysis Pending'}
          </h3>
        </div>
        <p className={`${
          isAnalysisReady ? 'text-green-700' :
          isAnalysisRunning ? 'text-blue-700' :
          'text-yellow-700'
        }`}>
          {isAnalysisReady ? 'Intelligence gathering complete. Ready to generate content!' :
           isAnalysisRunning ? 'Analyzing your competitor and market data automatically...' :
           'Campaign created. Auto-analysis will begin shortly.'}
        </p>
        
        {workflowState?.auto_analysis?.confidence_score && (
          <div className="mt-3 text-sm">
            <span className="font-medium">Confidence Score: </span>
            <span className="text-green-600 font-semibold">
              {Math.round(workflowState.auto_analysis.confidence_score * 100)}%
            </span>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-black mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">Target Audience</label>
            <input
              type="text"
              value={formData.target_audience}
              onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
              placeholder="e.g., Small business owners, Marketing professionals"
              className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Save Changes
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Title</h3>
              <p className="text-black font-medium">{campaign.title}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Campaign Type</h3>
              <p className="text-black font-medium mb-1">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-black">
                  🌟 Universal Campaign
                </span>
              </p>
              <p className="text-xs text-gray-500">
                Auto-analysis enabled • All content types
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
            <p className="text-black">{campaign.description}</p>
          </div>
          {campaign.target_audience && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Target Audience</h3>
              <p className="text-black">{campaign.target_audience}</p>
            </div>
          )}
          
          {campaign.salespage_url && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Analysis URL</h3>
              <p className="text-blue-600 underline">{campaign.salespage_url}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Intelligence Analysis Step Component
function IntelligenceAnalysisStep({ 
  campaignId,
  intelligenceData,
  workflowState,
  onIntelligenceComplete,
  onRefresh 
}: {
  campaignId: string
  intelligenceData: IntelligenceSource[]
  workflowState: WorkflowStateResponse | null
  onIntelligenceComplete: () => void
  onRefresh: () => void
}) {
  const hasIntelligence = intelligenceData.length > 0
  const analysisStatus = workflowState?.auto_analysis?.status || 'pending'
  const isComplete = analysisStatus === 'COMPLETED' && hasIntelligence

  useEffect(() => {
    if (isComplete) {
      // Auto-advance when intelligence is ready
      setTimeout(onIntelligenceComplete, 2000)
    }
  }, [isComplete, onIntelligenceComplete])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-light text-black">Intelligence Analysis</h2>
        <button
          onClick={onRefresh}
          className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>
      
      {!hasIntelligence ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-xl font-medium text-black mb-2">Analyzing Your Market</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Our AI is automatically gathering intelligence about your competitors, target audience, and market trends.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-md mx-auto">
            <h4 className="font-medium text-blue-900 mb-2">What we are analyzing:</h4>
            <ul className="text-sm text-blue-700 space-y-1 text-left">
              <li>• Competitor strategies</li>
              <li>• Market positioning</li>
              <li>• Audience insights</li>
              <li>• Content opportunities</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h3 className="text-lg font-medium text-green-900 mb-2">✅ Intelligence Complete</h3>
            <p className="text-green-700">
              Analysis complete! {intelligenceData.length} intelligence sources gathered and analyzed.
            </p>
          </div>

          {/* Intelligence Results */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-black">
              Analysis Results ({intelligenceData.length})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {intelligenceData.map((intel, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-black truncate">{intel.source_title}</h4>
                    <span className="text-sm text-blue-600 font-medium">
                      {Math.round((intel.confidence_score || 0.8) * 100)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    {intel.insights_extracted || 15} insights extracted
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded-lg font-medium">
                      {intel.intelligence_type || 'Market Analysis'}
                    </span>
                    <span>{new Date(intel.created_at || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Stats */}
            <div className="bg-gray-100 rounded-2xl p-6">
              <h4 className="font-medium text-black mb-4">Analysis Summary</h4>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-semibold text-black">{intelligenceData.length}</div>
                  <div className="text-sm text-gray-500 font-medium">Sources Analyzed</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-black">
                    {intelligenceData.length > 0 ? Math.round(intelligenceData.reduce((acc: number, intel: IntelligenceSource) => acc + (intel.confidence_score || 0.8), 0) / intelligenceData.length * 100) : 0}%
                  </div>
                  <div className="text-sm text-gray-500 font-medium">Avg Confidence</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-black">
                    {intelligenceData.reduce((acc: number, intel: IntelligenceSource) => acc + (intel.insights_extracted || 15), 0)}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">Total Insights</div>
                </div>
              </div>
            </div>

            {/* Auto-advance notice */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 text-center">
              <Sparkles className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h4 className="font-medium text-purple-900 mb-2">Ready for Content Generation!</h4>
              <p className="text-sm text-purple-700 mb-4">
                Intelligence analysis is complete. Moving to content generation automatically...
              </p>
              <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          </div>
        </div>
      )}
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
        
        // Fix: Handle different possible response structures
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
      
      // Fix: Handle different possible response structures
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

  const handleGenerateImages = async (type: 'single' | 'campaign') => {
    setIsGenerating(true)
    
    try {
      console.log('🎯 Starting image generation:', type)
      
      if (intelligenceData.length === 0) {
        throw new Error('No intelligence sources available. Please wait for analysis to complete.')
      }
      
      // Check if methods exist before calling
      if (!api.generateSingleImage && !api.generateCampaignWithImages) {
        throw new Error('Image generation not available. Please check your API configuration.')
      }
      
      let response: any
      
      if (type === 'single' && api.generateSingleImage) {
        response = await api.generateSingleImage({
          campaign_id: campaignId,
          prompt: `Professional marketing image for ${campaign?.title || 'product'}, high quality, social media optimized`,
          platform: 'instagram',
          style: 'health'
        })
      } else if (type === 'campaign' && api.generateCampaignWithImages) {
        response = await api.generateCampaignWithImages({
          campaign_id: campaignId,
          platforms: ['instagram', 'facebook', 'tiktok'],
          content_count: 3,
          image_style: 'health',
          generate_images: true
        })
      } else {
        throw new Error(`${type} image generation not implemented yet`)
      }
      
      console.log('✅ Image generation SUCCESS:', response)
      
      if (response.success) {
        const newContent = {
          id: response.content_id || Date.now().toString(),
          type: type === 'single' ? 'ai_image' : 'social_media_campaign_with_images',
          title: type === 'single' ? 'AI Generated Image' : 'Social Media Campaign with Images',
          generated_at: new Date(),
          status: 'generated',
          content: response,
          metadata: {
            cost: response.total_cost || response.cost,
            savings: response.cost_savings_vs_dalle,
            images_count: response.images_generated || 1,
            platform: response.platform
          },
          preview: response.message || 'Images generated successfully with ultra-cheap AI'
        }
        
        setGeneratedContent(prev => [...prev, newContent])
        onContentGenerated(newContent)
        
        const costInfo = type === 'single' 
          ? `Cost: ${response.cost?.toFixed(3) || '0.004'} (vs $0.040 DALL-E)`
          : `Total: ${response.total_cost?.toFixed(3)} • Saved: ${response.cost_savings_vs_dalle}`
        
        alert(`✅ ${response.message}\n💰 ${costInfo}`)
        
        console.log('✅ Images successfully added to UI')
        
      } else {
        throw new Error(response.error || 'Image generation failed')
      }
      
    } catch (error) {
      console.error('❌ Image generation failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Image generation failed: ${errorMessage}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleTestConnection = async () => {
    try {
      if (!api.testStabilityConnection) {
        alert('❌ Image connection test not available. Feature may not be implemented yet.')
        return
      }
      
      const result = await api.testStabilityConnection()
      if (result.integration_ready) {
        alert('✅ Stability AI is ready! Ultra-cheap image generation available.')
      } else {
        alert('❌ Stability AI setup needed. Check your STABILITY_API_KEY.')
      }
    } catch (error) {
      alert('❌ Connection test failed. Please check your setup.')
    }
  }

  const handleGenerateContent = async (contentType: string) => {
    setIsGenerating(true)
    
    try {
      console.log('🎯 Starting REAL content generation for:', contentType)
      
      if (intelligenceData.length === 0) {
        throw new Error('No intelligence sources available. Please wait for analysis to complete.')
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
        
        <div className="flex space-x-3">
          <button
            onClick={handleTestConnection}
            className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <span>🧪</span>
            <span>Test Image AI</span>
          </button>
          
          <button
            onClick={refreshGeneratedContent}
            className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh Content</span>
          </button>
        </div>
      </div>
      
      {intelligenceCount === 0 ? (
        <div className="text-center py-16">
          <Brain className="h-16 w-16 text-gray-400 mx-auto mb-6" />
          <h3 className="text-xl font-medium text-black mb-2">No Intelligence Available</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Please wait for the auto-analysis to complete before generating content
          </p>
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h3 className="text-lg font-medium text-green-900 mb-2">Ready to Generate Content</h3>
            <p className="text-green-700">
              You have {intelligenceCount} intelligence sources ready for content generation.
            </p>
          </div>

          {/* Cost Benefits */}
          <div className="bg-gray-100 rounded-2xl p-6">
            <h3 className="text-lg font-medium text-black mb-4">🎯 Ultra-Cheap AI Images Available!</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-semibold text-black">$0.004</div>
                <div className="text-sm text-gray-500 font-medium">Per image (Stability AI)</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-red-600">$0.040</div>
                <div className="text-sm text-gray-500 font-medium">Per image (DALL-E)</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-green-600">90%</div>
                <div className="text-sm text-gray-500 font-medium">Cost savings</div>
              </div>
            </div>
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
              },
              { 
                type: 'ai_image_single', 
                title: 'AI Image', 
                description: 'Single marketing image ($0.004)',
                icon: '🖼️',
                action: () => handleGenerateImages('single'),
                isNew: true,
                cost: '$0.004'
              },
              { 
                type: 'social_campaign_images', 
                title: 'Social Campaign + Images', 
                description: 'Posts + AI images (9 total)',
                icon: '📸',
                action: () => handleGenerateImages('campaign'),
                isNew: true,
                featured: true,
                cost: '~$0.036'
              }
            ].map((contentType) => (
              <button
                key={contentType.type}
                onClick={contentType.action}
                disabled={isGenerating}
                className={`relative p-6 bg-white border rounded-2xl hover:border-gray-400 hover:shadow-md transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed ${
                  contentType.featured ? 'border-black shadow-sm' : 'border-gray-200'
                }`}
              >
                {contentType.isNew && (
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    NEW
                  </span>
                )}
                {contentType.featured && (
                  <span className="absolute -top-2 -left-2 bg-black text-white text-xs px-2 py-1 rounded-full font-medium">
                    ⭐ ULTRA-CHEAP
                  </span>
                )}
                <div className="text-3xl mb-3">{contentType.icon}</div>
                <h4 className="font-medium text-black mb-1">{contentType.title}</h4>
                <p className="text-sm text-gray-500 mb-3">{contentType.description}</p>
                {contentType.cost && (
                  <p className="text-xs text-blue-600 font-medium mb-1">
                    {contentType.cost} • Stability AI
                  </p>
                )}
                {contentType.type.includes('image') && (
                  <p className="text-xs text-green-600 font-medium">
                    90% cheaper than DALL-E
                  </p>
                )}
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
                          {content.type?.includes('image') && content.metadata?.cost && (
                            <span className="px-2 py-1 bg-black text-white rounded-full text-xs font-medium">
                              ${content.metadata.cost.toFixed(3)} saved
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mb-3">
                          Generated {new Date(content.generated_at).toLocaleString()}
                          {content.metadata?.images_count && (
                            <span className="ml-2 text-blue-600 font-medium">
                              • {content.metadata.images_count} images • {content.metadata.platform || 'Multiple platforms'}
                            </span>
                          )}
                        </p>
                        {content.preview && (
                          <p className="text-sm text-black bg-gray-50 p-3 rounded-lg border">
                            {content.preview}
                          </p>
                        )}
                        {content.metadata?.savings && (
                          <p className="text-sm text-green-700 mt-2 font-medium">
                            💰 Saved {content.metadata.savings} vs DALL-E
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button 
                          onClick={() => router.push(`/campaigns/${campaignId}/content`)}
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
                        {content.type?.includes('image') && (
                          <button 
                            onClick={async () => {
                              try {
                                if (!api.downloadCampaignPackage) {
                                  alert('📦 Download feature not available yet.')
                                  return
                                }
                                const packageData = await api.downloadCampaignPackage(campaignId)
                                alert(`📦 Package ready: ${packageData.total_images} images, ${packageData.total_content_pieces} content pieces`)
                              } catch (error) {
                                console.error('Download failed:', error)
                                alert('Download failed. Please try again.')
                              }
                            }}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                          >
                            📦 Download
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
                <h3 className="text-xl font-medium text-black mb-2">🎉 Campaign Complete!</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  You have successfully created a complete marketing campaign with AI-generated content
                  {generatedContent.some(c => c.type?.includes('image')) && (
                    <span className="block text-black font-medium mt-2">
                      Including ultra-cheap AI images with 90% cost savings!
                    </span>
                  )}
                </p>
                
                {generatedContent.some(c => c.type?.includes('image')) && (
                  <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                    <h4 className="text-black font-medium mb-3">💰 Cost Savings Summary</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-lg font-semibold text-black">
                          {generatedContent.reduce((acc, c) => acc + (c.metadata?.images_count || 0), 0)}
                        </div>
                        <div className="text-gray-500 font-medium">Images Generated</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-green-600">
                          ${generatedContent.reduce((acc, c) => acc + (c.metadata?.cost || 0), 0).toFixed(3)}
                        </div>
                        <div className="text-gray-500 font-medium">Total Cost</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-green-600">90%</div>
                        <div className="text-gray-500 font-medium">Savings vs DALL-E</div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-center space-x-4">
                  <button 
                    onClick={() => router.push(`/campaigns/${campaignId}/content`)}
                    className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
                  >
                    View All Content
                  </button>
                  <button 
                    onClick={async () => {
                      try {
                        if (!api.downloadCampaignPackage) {
                          // Fallback download without API
                          const content = `Campaign: ${campaign?.title}\n\nGenerated Content Summary\n\nThis feature can be enhanced to include actual generated content when available.`
                          
                          const blob = new Blob([content], { type: 'text/plain' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = `${campaign?.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'campaign'}_content.txt`
                          document.body.appendChild(a)
                          a.click()
                          document.body.removeChild(a)
                          URL.revokeObjectURL(url)
                          return
                        }
                        
                        const packageData = await api.downloadCampaignPackage(campaignId)
                        
                        const content = `Campaign: ${campaign?.title}\n\nGenerated Content Summary:\n- ${packageData.total_content_pieces} content pieces\n- ${packageData.total_images} AI images\n\nCost Savings: 90% vs traditional AI image generation\n\nThis package includes all your generated content and ultra-cheap AI images.`
                        
                        const blob = new Blob([content], { type: 'text/plain' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `${campaign?.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'campaign'}_content_package.txt`
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        URL.revokeObjectURL(url)
                        
                        alert(`✅ Package downloaded: ${packageData.total_images} images, ${packageData.total_content_pieces} content pieces`)
                      } catch (error) {
                        console.error('Download failed:', error)
                        
                        const content = `Campaign: ${campaign?.title}\n\nGenerated Content Summary\n\nThis feature can be enhanced to include actual generated content when available.`
                        
                        const blob = new Blob([content], { type: 'text/plain' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `${campaign?.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'campaign'}_content.txt`
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        URL.revokeObjectURL(url)
                      }
                    }}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    📦 Download All Content
                  </button>
                  <button 
                    onClick={() => router.push('/campaigns')}
                    className="px-6 py-3 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Create New Campaign
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}