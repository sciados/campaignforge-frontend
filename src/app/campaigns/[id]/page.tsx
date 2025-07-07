// src/app/campaigns/[id]/page.tsx - Apple Design System
'use client'
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Save, 
  MoreHorizontal,
  FileText,
  Database,
  Brain,
  Sparkles,
  Settings,
  Clock,
  Zap,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Target,
  Upload,
  Link,
  Plus,
  Play,
  Loader2,
  TrendingUp,
  RefreshCw
} from 'lucide-react'
import { useApi } from '@/lib/api'
import { Campaign } from '@/lib/api'

interface IntelligenceSource {
  id: string
  source_title: string
  confidence_score?: number
  created_at: string
  insights_extracted?: number
  intelligence_type?: string
  [key: string]: any
}

interface WorkflowState {
  suggested_step?: number
  workflow_preference?: string
  progress_summary?: {
    completion_percentage?: number
    sources_added?: number
    sources_analyzed?: number
    content_generated?: number
  }
  progress?: {
    steps?: Record<string, number>
  }
  available_actions?: Array<{
    step: number
    can_access: boolean
  }>
  primary_suggestion?: string
}

export default function AppleCampaignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const api = useApi()

  console.log('🔍 API object:', api)
  console.log('🔍 Available methods:', Object.keys(api))
  // console.log('🔍 generateSingleImage type:', typeof api.generateSingleImage)
  // console.log('🔍 generateCampaignWithImages type:', typeof api.generateCampaignWithImages)
  
  const isInitializedRef = useRef(false)
  const isLoadingRef = useRef(false)
  
  const campaignId = params.id as string
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [workflowMode, setWorkflowMode] = useState<'quick' | 'methodical' | 'flexible'>('flexible')
  const [workflowState, setWorkflowState] = useState<WorkflowState | null>(null)
  const [autoSave, setAutoSave] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [sessionTimer, setSessionTimer] = useState(0)
  const [isActiveSession, setIsActiveSession] = useState(false)
  const [intelligenceData, setIntelligenceData] = useState<IntelligenceSource[]>([])

  const stableApi = useMemo(() => ({
    getCampaign: api.getCampaign,
    getWorkflowState: api.getWorkflowState,
    getCampaignIntelligence: api.getCampaignIntelligence,
    setWorkflowPreference: api.setWorkflowPreference,
    saveProgress: api.saveProgress,
    analyzeURL: api.analyzeURL,
    uploadDocument: api.uploadDocument,
    generateContent: api.generateContent
  }), [api])

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
      
      const campaignData = await stableApi.getCampaign(campaignId)
      console.log('✅ Campaign loaded:', campaignData.title)
      setCampaign(campaignData)
      
      try {
        const workflow = await stableApi.getWorkflowState(campaignId)
        setWorkflowState(workflow)
        setCurrentStep(workflow.suggested_step || 1)
        
        const mode = workflow.workflow_preference
        if (mode === 'quick' || mode === 'methodical' || mode === 'flexible') {
          setWorkflowMode(mode)
        } else {
          setWorkflowMode('flexible')
        }
        console.log('✅ Workflow status loaded:', workflow.workflow_preference)
      } catch (workflowError) {
        console.warn('⚠️ Could not load workflow status, using defaults:', workflowError)
        setCurrentStep(1)
      }

      try {
        const intelligence = await stableApi.getCampaignIntelligence(campaignId)
        if (intelligence && intelligence.intelligence_sources) {
          setIntelligenceData(intelligence.intelligence_sources)
          console.log(`📊 Loaded ${intelligence.intelligence_sources.length} intelligence sources`)
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
      if (intelligence && intelligence.intelligence_sources) {
        setIntelligenceData(intelligence.intelligence_sources)
        console.log(`✅ Refreshed: ${intelligence.intelligence_sources.length} intelligence sources`)
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

  const handleStepChange = useCallback((step: number) => {
    setCurrentStep(step)
    saveProgress({ step_change: step })
  }, [saveProgress])

  const handleModeChange = useCallback(async (mode: 'quick' | 'methodical' | 'flexible') => {
    if (!campaignId) return
    
    try {
      await stableApi.setWorkflowPreference(campaignId, {
        workflow_preference: mode,
        quick_mode: mode === 'quick',
        detailed_guidance: mode === 'methodical',
        auto_advance: mode === 'quick'
      })
      
      setWorkflowMode(mode)
      const newWorkflow = await stableApi.getWorkflowState(campaignId)
      setWorkflowState(newWorkflow)
    } catch (error) {
      console.error('Failed to update workflow preference:', error)
    }
  }, [campaignId, stableApi])

  const handleIntelligenceGenerated = useCallback((intelligence: IntelligenceSource) => {
    console.log('✅ Intelligence generated, updating local state:', intelligence.id)
    setIntelligenceData(prev => [...prev, intelligence])
    if (workflowMode === 'quick') {
      setTimeout(() => setCurrentStep(4), 1000)
    }
  }, [workflowMode])

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
          <CampaignBasicInfo 
            campaign={campaign}
            onUpdate={setCampaign}
            onSave={saveProgress}
          />
        )
      
      case 2:
        return (
          <SourceCollectionStep
            campaignId={campaignId}
            workflowMode={workflowMode}
            api={stableApi}
            onSourceAdded={(source) => {
              console.log('✅ Source added, updating local state:', source)
              saveProgress({ source_added: source })
              setIntelligenceData(prev => [...prev, source])
              if (workflowMode === 'quick') {
                setTimeout(() => setCurrentStep(3), 1000)
              }
            }}
          />
        )
      
      case 3:
        return (
          <IntelligenceAnalysisStep
            campaignId={campaignId}
            workflowMode={workflowMode}
            sourcesCount={intelligenceData.length}
            intelligenceData={intelligenceData}
            onIntelligenceGenerated={handleIntelligenceGenerated}
            onRefresh={refreshIntelligenceData}
          />
        )
      
      case 4:
        return (
          <ContentGenerationStep
            campaignId={campaignId}
            workflowMode={workflowMode}
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
      <div className="min-h-screen bg-apple-light flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-apple-gray text-sm font-medium">Loading campaign...</p>
        </div>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-apple-light flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto" />
          </div>
          <h1 className="text-2xl font-light text-black mb-2">Campaign Not Found</h1>
          <p className="text-apple-gray mb-6 max-w-md">{error || 'The campaign you\'re looking for doesn\'t exist.'}</p>
          <button
            onClick={() => router.push('/campaigns')}
            className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors"
          >
            Back to Campaigns
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-apple-light">
      {/* Apple-style Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/campaigns')}
                className="w-8 h-8 flex items-center justify-center text-apple-gray hover:text-black transition-colors rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-black">{campaign.title}</h1>
                <p className="text-sm text-apple-gray">
                  Step {currentStep} • {workflowMode} mode
                  {isActiveSession && (
                    <span className="ml-2 text-green-600 font-medium">• {formatTime(sessionTimer)}</span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
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
              
              {/* Refresh Button */}
              <button
                onClick={refreshIntelligenceData}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 text-black hover:bg-gray-200 transition-colors font-medium text-sm"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
              
              {/* Auto-save Status */}
              <div className="flex items-center space-x-2 text-sm text-apple-gray">
                <div className={`w-2 h-2 rounded-full ${autoSave ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="font-medium">
                  {lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : 'Not saved'}
                </span>
              </div>
              
              {/* Save Button */}
              <button
                onClick={() => saveProgress({ manual_save: true })}
                className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
              >
                <Save className="h-4 w-4" />
                <span>Save</span>
              </button>
              
              {/* More Options */}
              <button className="w-8 h-8 flex items-center justify-center text-apple-gray hover:text-black transition-colors rounded-lg hover:bg-gray-100">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Apple-style Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Working Style Selector */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-black mb-4">Working Style</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleModeChange('quick')}
                  className={`w-full p-4 rounded-xl border transition-all ${
                    workflowMode === 'quick'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                  }`}
                >
                  <Zap className={`h-5 w-5 mx-auto mb-2 ${workflowMode === 'quick' ? 'text-orange-600' : 'text-apple-gray'}`} />
                  <div className="text-sm font-medium text-black">Quick Mode</div>
                  <div className="text-xs text-apple-gray mt-1">Rush through steps</div>
                </button>
                
                <button
                  onClick={() => handleModeChange('methodical')}
                  className={`w-full p-4 rounded-xl border transition-all ${
                    workflowMode === 'methodical'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <BookOpen className={`h-5 w-5 mx-auto mb-2 ${workflowMode === 'methodical' ? 'text-blue-600' : 'text-apple-gray'}`} />
                  <div className="text-sm font-medium text-black">Methodical</div>
                  <div className="text-xs text-apple-gray mt-1">Take your time</div>
                </button>
                
                <button
                  onClick={() => handleModeChange('flexible')}
                  className={`w-full p-4 rounded-xl border transition-all ${
                    workflowMode === 'flexible'
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <Settings className={`h-5 w-5 mx-auto mb-2 ${workflowMode === 'flexible' ? 'text-black' : 'text-apple-gray'}`} />
                  <div className="text-sm font-medium text-black">Flexible</div>
                  <div className="text-xs text-apple-gray mt-1">Mix of both</div>
                </button>
              </div>
            </div>

            {/* Step Navigation */}
            <StepNavigation
              currentStep={currentStep}
              workflowMode={workflowMode}
              workflowState={workflowState}
              onStepClick={handleStepChange}
            />

            {/* Progress Summary */}
            {workflowState && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-black mb-4">Progress</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-apple-gray font-medium">Overall</span>
                    <span className="text-sm font-semibold text-black">
                      {Math.round(workflowState.progress_summary?.completion_percentage || 0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-black h-2 rounded-full transition-all duration-500"
                      style={{ width: `${workflowState.progress_summary?.completion_percentage || 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-6 text-center">
                  <div>
                    <div className="text-lg font-semibold text-black">
                      {intelligenceData.length}
                    </div>
                    <div className="text-xs text-apple-gray font-medium">Sources</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-black">
                      {intelligenceData.filter(s => s.confidence_score && s.confidence_score > 0).length}
                    </div>
                    <div className="text-xs text-apple-gray font-medium">Analyzed</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-black">
                      {workflowState.progress_summary?.content_generated || 0}
                    </div>
                    <div className="text-xs text-apple-gray font-medium">Content</div>
                  </div>
                </div>
              </div>
            )}

            {/* Next Action Card */}
            {workflowState && workflowState.suggested_step && (
              <div className="bg-black rounded-2xl p-6 shadow-sm">
                <h4 className="text-sm font-semibold text-white mb-2">Next Action</h4>
                <p className="text-sm text-gray-300 mb-4">
                  {workflowState.primary_suggestion}
                </p>
                <button
                  onClick={() => handleStepChange(workflowState.suggested_step!)}
                  className="w-full px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                >
                  Continue
                </button>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              {renderStepContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Apple-styled Step Navigation Component
function StepNavigation({ 
  currentStep, 
  workflowMode, 
  workflowState, 
  onStepClick 
}: {
  currentStep: number
  workflowMode: 'quick' | 'methodical' | 'flexible'
  workflowState: WorkflowState | null
  onStepClick: (step: number) => void
}) {
  const steps = [
    { number: 1, icon: FileText, title: "Setup", description: "Campaign basics" },
    { number: 2, icon: Database, title: "Sources", description: "Add content to analyze" },
    { number: 3, icon: Brain, title: "Analysis", description: "AI extracts insights" },
    { number: 4, icon: Sparkles, title: "Generate", description: "Create content" }
  ]

  const getStepStatus = (stepNumber: number) => {
    if (stepNumber === currentStep) return 'active'
    if (stepNumber < currentStep) return 'completed'
    return 'available'
  }

  const getStepIcon = (step: any, status: string) => {
    const Icon = step.icon
    
    if (status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-600" />
    } else {
      return <Icon className={`h-5 w-5 ${
        status === 'active' ? 'text-black' : 'text-apple-gray'
      }`} />
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-black mb-4">Steps</h3>
      
      <div className="space-y-3">
        {steps.map((step) => {
          const status = getStepStatus(step.number)
          
          return (
            <button
              key={step.number}
              onClick={() => onStepClick(step.number)}
              className={`w-full p-4 rounded-xl border text-center transition-all ${
                status === 'completed' ? 'bg-green-50 border-green-200' :
                status === 'active' ? 'bg-gray-100 border-black' :
                'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                {getStepIcon(step, status)}
                <div>
                  <div className="text-sm font-medium text-black">{step.title}</div>
                  <div className="text-xs text-apple-gray">Step {step.number}</div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Current step indicator */}
      <div className="mt-4 p-3 bg-gray-100 rounded-xl">
        <div className="flex items-center space-x-2">
          <Target className="h-4 w-4 text-black" />
          <span className="text-sm text-black font-medium">
            Current: {steps.find(s => s.number === currentStep)?.title}
          </span>
        </div>
      </div>
    </div>
  )
}

// Apple-styled Step Content Components
function CampaignBasicInfo({ 
  campaign, 
  onUpdate, 
  onSave 
}: {
  campaign: Campaign
  onUpdate: (campaign: Campaign) => void
  onSave: (data: any) => void
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

      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <h3 className="text-lg font-medium text-green-900 mb-2">✅ Step 1: Campaign Created</h3>
        <p className="text-green-700">
          Your universal campaign is set up and ready. You can edit details here or move to Step 2 to add sources.
        </p>
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
              <h3 className="text-sm font-medium text-apple-gray mb-2">Title</h3>
              <p className="text-black font-medium">{campaign.title}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-apple-gray mb-2">Campaign Type</h3>
              <p className="text-black font-medium mb-1">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-black">
                  🌟 Universal Campaign
                </span>
              </p>
              <p className="text-xs text-apple-gray">
                Accepts any input • Generates all content types
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-apple-gray mb-2">Description</h3>
            <p className="text-black">{campaign.description}</p>
          </div>
          {campaign.target_audience && (
            <div>
              <h3 className="text-sm font-medium text-apple-gray mb-2">Target Audience</h3>
              <p className="text-black">{campaign.target_audience}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SourceCollectionStep({ 
  campaignId, 
  workflowMode, 
  api,
  onSourceAdded 
}: {
  campaignId: string
  workflowMode: 'quick' | 'methodical' | 'flexible'
  api: any
  onSourceAdded: (source: any) => void
}) {
  const [urlInput, setUrlInput] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [sources, setSources] = useState<any[]>([])

  const handleAddURL = async () => {
    if (!urlInput.trim()) return
    
    setIsAnalyzing(true)
    try {
      console.log('🎯 Starting URL analysis for:', urlInput)
      
      const analysisResult = await api.analyzeURL({
        url: urlInput,
        campaign_id: campaignId,
        analysis_type: 'sales_page'
      })
      
      console.log('✅ Analysis completed:', analysisResult)
      
      const newSource = {
        id: analysisResult.intelligence_id,
        type: 'url',
        url: urlInput,
        status: 'analyzed',
        title: urlInput,
        confidence_score: analysisResult.confidence_score,
        intelligence_id: analysisResult.intelligence_id
      }
      
      setSources(prev => [...prev, newSource])
      onSourceAdded(newSource)
      setUrlInput('')
      
      console.log('✅ URL source added and analyzed:', newSource)
      
    } catch (error) {
      console.error('❌ Failed to analyze URL:', error)
      
      const failedSource = {
        id: Date.now().toString(),
        type: 'url',
        url: urlInput,
        status: 'failed',
        title: urlInput,
        error: error instanceof Error ? error.message : 'Analysis failed'
      }
      
      setSources(prev => [...prev, failedSource])
      onSourceAdded(failedSource)
      setUrlInput('')
      
      alert(`Failed to analyze URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
      
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsAnalyzing(true)
    try {
      const result = await api.uploadDocument(file, campaignId)
      
      const newSource = {
        id: result.intelligence_id,
        type: 'document',
        filename: file.name,
        status: 'uploaded',
        title: file.name,
        insights: result.insights_extracted
      }
      
      setSources(prev => [...prev, newSource])
      onSourceAdded(newSource)
      
    } catch (error) {
      console.error('Failed to upload document:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-light text-black">Add Input Sources</h2>
      
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Step 2: Collect Your Sources</h3>
        <p className="text-blue-700">
          Add URLs, documents, or other content sources that you want to analyze. 
          {workflowMode === 'quick' && " Add at least one source to quickly move to analysis."}
          {workflowMode === 'methodical' && " Take time to add multiple high-quality sources for better results."}
        </p>
      </div>

      {/* Apple-styled Source Input Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* URL Input */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
              <Link className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-black">Add URL</h3>
          </div>
          <div className="space-y-4">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/sales-page"
              className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
              onKeyPress={(e) => e.key === 'Enter' && handleAddURL()}
            />
            <button
              onClick={handleAddURL}
              disabled={!urlInput.trim() || isAnalyzing}
              className="w-full px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-medium"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Analyze URL
                </>
              )}
            </button>
          </div>
        </div>

        {/* File Upload */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-3">
              <Upload className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-black">Upload Document</h3>
          </div>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt,.pptx"
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="h-8 w-8 text-apple-gray mb-2" />
                <span className="text-sm text-black font-medium">
                  Click to upload PDF, DOC, TXT
                </span>
                <span className="text-xs text-apple-gray mt-1">
                  Maximum file size: 10MB
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Added Sources */}
      {sources.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-black">Added Sources ({sources.length})</h3>
          <div className="space-y-3">
            {sources.map((source, index) => (
              <div key={source.id || index} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        source.type === 'url' ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        {source.type === 'url' ? (
                          <Link className="h-4 w-4 text-blue-600" />
                        ) : (
                          <FileText className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-black">
                        {source.title || source.filename || source.url}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        source.status === 'analyzed' || source.status === 'uploaded'
                          ? 'bg-green-100 text-green-800'
                          : source.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {source.status}
                      </span>
                      {source.confidence_score && (
                        <span className="text-xs text-blue-600 font-medium">
                          {Math.round(source.confidence_score * 100)}% confidence
                        </span>
                      )}
                    </div>
                    {source.insights && (
                      <p className="text-sm text-apple-gray">
                        {source.insights} insights extracted
                      </p>
                    )}
                    {source.error && (
                      <p className="text-sm text-red-600">
                        Error: {source.error}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {sources.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center">
          <Database className="h-12 w-12 text-apple-gray mx-auto mb-4" />
          <h3 className="text-lg font-medium text-black mb-2">Add Your First Source</h3>
          <p className="text-apple-gray mb-4 max-w-md mx-auto">
            Upload documents, add URLs, or paste content to analyze
          </p>
          <div className="text-sm text-apple-gray">
            Supported: URLs, PDF, DOC, TXT, PPTX files
          </div>
        </div>
      )}

      {/* Mode-specific guidance */}
      {workflowMode === 'quick' && sources.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
          <h4 className="font-medium text-orange-900 mb-2">Quick Mode: Sources Added</h4>
          <p className="text-sm text-orange-700 mb-4">
            You have {sources.length} source(s) analyzed. Ready to move to content generation!
          </p>
          <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium">
            Go to Step 4: Generate Content
          </button>
        </div>
      )}

      {workflowMode === 'methodical' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h4 className="font-medium text-blue-900 mb-2">Methodical Approach</h4>
          <ul className="text-sm text-blue-700 space-y-2">
            <li>• Add 3-5 high-quality sources for best results</li>
            <li>• Include both competitor pages and your own content</li>
            <li>• Review each source before proceeding to analysis</li>
          </ul>
        </div>
      )}
    </div>
  )
}

function IntelligenceAnalysisStep({ 
  campaignId, 
  workflowMode, 
  sourcesCount, 
  intelligenceData, 
  onIntelligenceGenerated,
  onRefresh 
}: {
  campaignId: string
  workflowMode: 'quick' | 'methodical' | 'flexible'
  sourcesCount: number
  intelligenceData: IntelligenceSource[]
  onIntelligenceGenerated: (intelligence: IntelligenceSource) => void
  onRefresh: () => void
}) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-light text-black">AI Analysis</h2>
        <button
          onClick={onRefresh}
          className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh Data</span>
        </button>
      </div>
      
      {sourcesCount === 0 ? (
        <div className="text-center py-16">
          <Brain className="h-16 w-16 text-apple-gray mx-auto mb-6" />
          <h3 className="text-xl font-medium text-black mb-2">No Sources to Analyze</h3>
          <p className="text-apple-gray mb-6 max-w-md mx-auto">
            Add some sources in Step 2 before running analysis
          </p>
          <button className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors font-medium">
            Go to Step 2: Add Sources
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h3 className="text-lg font-medium text-green-900 mb-2">✅ Analysis Complete</h3>
            <p className="text-green-700">
              You have {sourcesCount} sources analyzed and ready for content generation.
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
                  <p className="text-sm text-apple-gray mb-4">
                    {intel.insights_extracted || 15} insights extracted
                  </p>
                  <div className="flex items-center justify-between text-xs text-apple-gray">
                    <span className="bg-gray-100 px-2 py-1 rounded-lg font-medium">
                      {intel.intelligence_type || 'Sales Page'}
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
                  <div className="text-sm text-apple-gray font-medium">Sources Analyzed</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-black">
                    {intelligenceData.length > 0 ? Math.round(intelligenceData.reduce((acc: number, intel: IntelligenceSource) => acc + (intel.confidence_score || 0.8), 0) / intelligenceData.length * 100) : 0}%
                  </div>
                  <div className="text-sm text-apple-gray font-medium">Avg Confidence</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-black">
                    {intelligenceData.reduce((acc: number, intel: IntelligenceSource) => acc + (intel.insights_extracted || 15), 0)}
                  </div>
                  <div className="text-sm text-apple-gray font-medium">Total Insights</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ContentGenerationStep({ 
  campaignId, 
  workflowMode, 
  intelligenceCount,
  intelligenceData,
  campaign,
  api,
  router,
  onContentGenerated 
}: {
  campaignId: string
  workflowMode: 'quick' | 'methodical' | 'flexible'
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
        throw new Error('No intelligence sources available. Please add sources in Step 2 first.')
      }
      
      let response: any
      
      if (type === 'single') {
        response = await api.generateSingleImage({
          campaign_id: campaignId,
          prompt: `Professional marketing image for ${campaign?.title || 'product'}, high quality, social media optimized`,
          platform: 'instagram',
          style: 'health'
        })
      } else {
        response = await api.generateCampaignWithImages({
          campaign_id: campaignId,
          platforms: ['instagram', 'facebook', 'tiktok'],
          content_count: 3,
          image_style: 'health',
          generate_images: true
        })
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
        throw new Error('No intelligence sources available. Please add sources in Step 2 first.')
      }
      
      const firstIntelligence = intelligenceData[0]
      console.log('📊 Using intelligence source:', firstIntelligence)
      
      const response = await api.generateContent({
        intelligence_id: firstIntelligence.id,
        content_type: contentType,
        campaign_id: campaignId,
        preferences: {
          style: workflowMode === 'quick' ? 'concise' : 'detailed',
          tone: 'professional',
          length: workflowMode === 'methodical' ? 'long' : 'medium',
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
          <Sparkles className="h-16 w-16 text-apple-gray mx-auto mb-6" />
          <h3 className="text-xl font-medium text-black mb-2">No Intelligence Available</h3>
          <p className="text-apple-gray mb-6 max-w-md mx-auto">
            Complete source analysis before generating content
          </p>
          <button className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors font-medium">
            Go to Step 2: Add Sources
          </button>
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
                <div className="text-sm text-apple-gray font-medium">Per image (Stability AI)</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-red-600">$0.040</div>
                <div className="text-sm text-apple-gray font-medium">Per image (DALL-E)</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-green-600">90%</div>
                <div className="text-sm text-apple-gray font-medium">Cost savings</div>
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
                action: () => {
                  console.log('🔍 Button clicked, api object:', api)
                  console.log('🔍 generateSingleImage type:', typeof api.generateSingleImage)
                  console.log('🔍 Available methods:', Object.keys(api))
                  handleGenerateImages('single')
                },
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
                <p className="text-sm text-apple-gray mb-3">{contentType.description}</p>
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
                        <p className="text-sm text-apple-gray mb-3">
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
                <p className="text-apple-gray mb-6 max-w-md mx-auto">
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
                        <div className="text-apple-gray font-medium">Images Generated</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-green-600">
                          ${generatedContent.reduce((acc, c) => acc + (c.metadata?.cost || 0), 0).toFixed(3)}
                        </div>
                        <div className="text-apple-gray font-medium">Total Cost</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-green-600">90%</div>
                        <div className="text-apple-gray font-medium">Savings vs DALL-E</div>
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