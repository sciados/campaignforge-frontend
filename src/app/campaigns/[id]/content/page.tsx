// src/app/campaigns/[id]/page.tsx - WITH NAVIGATION
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
  RefreshCw,
  Search,
  Shield,
  Users,
  Building2,
  BarChart3,
  Activity,
  Image as ImageIcon,
  ListChecks
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
                <h1 className="text-xl font-bold text-gray-900">{campaign.title}</h1>
                <p className="text-sm text-gray-500">
                  Step {currentStep} • {workflowMode} mode
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

          {/* Working Style Selector */}
          <div className="p-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Working Style</h3>
            
            <div className="space-y-2">
              <button
                onClick={() => handleModeChange('quick')}
                className={`w-full p-3 rounded-lg border transition-all text-left ${
                  workflowMode === 'quick'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Zap className={`h-4 w-4 ${workflowMode === 'quick' ? 'text-orange-600' : 'text-gray-400'}`} />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Quick Mode</div>
                    <div className="text-xs text-gray-500">Rush through steps</div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => handleModeChange('methodical')}
                className={`w-full p-3 rounded-lg border transition-all text-left ${
                  workflowMode === 'methodical'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <BookOpen className={`h-4 w-4 ${workflowMode === 'methodical' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Methodical</div>
                    <div className="text-xs text-gray-500">Take your time</div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => handleModeChange('flexible')}
                className={`w-full p-3 rounded-lg border transition-all text-left ${
                  workflowMode === 'flexible'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Settings className={`h-4 w-4 ${workflowMode === 'flexible' ? 'text-purple-600' : 'text-gray-400'}`} />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Flexible</div>
                    <div className="text-xs text-gray-500">Mix of both</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Step Navigation */}
            <div className="lg:col-span-1 space-y-6">
              <StepNavigation
                currentStep={currentStep}
                workflowMode={workflowMode}
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
                        {Math.round(workflowState.progress_summary?.completion_percentage || 0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${workflowState.progress_summary?.completion_percentage || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-6 text-center">
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        {intelligenceData.length}
                      </div>
                      <div className="text-xs text-gray-600 font-medium">Sources</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        {intelligenceData.filter(s => s.confidence_score && s.confidence_score > 0).length}
                      </div>
                      <div className="text-xs text-gray-600 font-medium">Analyzed</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        {workflowState.progress_summary?.content_generated || 0}
                      </div>
                      <div className="text-xs text-gray-600 font-medium">Content</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Next Action Card */}
              {workflowState && workflowState.suggested_step && (
                <div className="bg-purple-600 rounded-xl p-6 shadow-sm">
                  <h4 className="text-sm font-semibold text-white mb-2">Next Action</h4>
                  <p className="text-sm text-purple-100 mb-4">
                    {workflowState.primary_suggestion}
                  </p>
                  <button
                    onClick={() => handleStepChange(workflowState.suggested_step!)}
                    className="w-full px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                  >
                    Continue
                  </button>
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
        </main>
      </div>
    </div>
  )
}

// Step Navigation Component
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
        status === 'active' ? 'text-purple-600' : 'text-gray-400'
      }`} />
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Steps</h3>
      
      <div className="space-y-3">
        {steps.map((step) => {
          const status = getStepStatus(step.number)
          
          return (
            <button
              key={step.number}
              onClick={() => onStepClick(step.number)}
              className={`w-full p-4 rounded-xl border text-center transition-all ${
                status === 'completed' ? 'bg-green-50 border-green-200' :
                status === 'active' ? 'bg-purple-50 border-purple-200' :
                'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                {getStepIcon(step, status)}
                <div>
                  <div className="text-sm font-medium text-gray-900">{step.title}</div>
                  <div className="text-xs text-gray-600">Step {step.number}</div>
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

// Placeholder components - replace with your actual components from the original file
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
        <h2 className="text-2xl font-light text-gray-900">Campaign Setup</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isEditing 
              ? 'bg-gray-100 text-gray-900 hover:bg-gray-200' 
              : 'bg-purple-600 text-white hover:bg-purple-700'
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
            <label className="block text-sm font-medium text-gray-900 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/20 transition-all font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Target Audience</label>
            <input
              type="text"
              value={formData.target_audience}
              onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
              placeholder="e.g., Small business owners, Marketing professionals"
              className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/20 transition-all"
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
              <h3 className="text-sm font-medium text-gray-600 mb-2">Title</h3>
              <p className="text-gray-900 font-medium">{campaign.title}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Campaign Type</h3>
              <p className="text-gray-900 font-medium mb-1">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-900">
                  🌟 Universal Campaign
                </span>
              </p>
              <p className="text-xs text-gray-600">
                Accepts any input • Generates all content types
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Description</h3>
            <p className="text-gray-900">{campaign.description}</p>
          </div>
          {campaign.target_audience && (
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Target Audience</h3>
              <p className="text-gray-900">{campaign.target_audience}</p>
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
      <h2 className="text-2xl font-light text-gray-900">Add Input Sources</h2>
      
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Step 2: Collect Your Sources</h3>
        <p className="text-blue-700">
          Add URLs, documents, or other content sources that you want to analyze. 
          {workflowMode === 'quick' && " Add at least one source to quickly move to analysis."}
          {workflowMode === 'methodical' && " Take time to add multiple high-quality sources for better results."}
        </p>
      </div>

      {/* Source Input Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* URL Input */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
              <Link className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Add URL</h3>
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
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-medium"
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
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-3">
              <Upload className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Upload Document</h3>
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
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-900 font-medium">
                  Click to upload PDF, DOC, TXT
                </span>
                <span className="text-xs text-gray-600 mt-1">
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
          <h3 className="text-lg font-medium text-gray-900">Added Sources ({sources.length})</h3>
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
                      <span className="text-sm font-medium text-gray-900">
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
                      <p className="text-sm text-gray-600">
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
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Add Your First Source</h3>
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            Upload documents, add URLs, or paste content to analyze
          </p>
          <div className="text-sm text-gray-600">
            Supported: URLs, PDF, DOC, TXT, PPTX files
          </div>
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
        <h2 className="text-2xl font-light text-gray-900">AI Analysis</h2>
        <button
          onClick={onRefresh}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh Data</span>
        </button>
      </div>
      
      {sourcesCount === 0 ? (
        <div className="text-center py-16">
          <Brain className="h-16 w-16 text-gray-400 mx-auto mb-6" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Sources to Analyze</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Add some sources in Step 2 before running analysis
          </p>
          <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
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
            <h3 className="text-lg font-medium text-gray-900">
              Analysis Results ({intelligenceData.length})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {intelligenceData.map((intel, index) => (
                <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900 truncate">{intel.source_title}</h4>
                    <span className="text-sm text-blue-600 font-medium">
                      {Math.round((intel.confidence_score || 0.8) * 100)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    {intel.insights_extracted || 15} insights extracted
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span className="bg-gray-100 px-2 py-1 rounded-lg font-medium">
                      {intel.intelligence_type || 'Sales Page'}
                    </span>
                    <span>{new Date(intel.created_at || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
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

  const handleGenerateContent = async (contentType: string) => {
    setIsGenerating(true)
    
    try {
      console.log('🎯 Starting content generation for:', contentType)
      
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
      <h2 className="text-2xl font-light text-gray-900">Generate Content</h2>
      
      {intelligenceCount === 0 ? (
        <div className="text-center py-16">
          <Sparkles className="h-16 w-16 text-gray-400 mx-auto mb-6" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Intelligence Available</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Complete source analysis before generating content
          </p>
          <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
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

          {/* Content Generation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { 
                type: 'email_sequence', 
                title: 'Email Sequence', 
                description: 'Multi-part email campaign',
                icon: '📧'
              },
              { 
                type: 'SOCIAL_POSTS', 
                title: 'Social Media Posts', 
                description: 'Platform-specific content',
                icon: '📱'
              },
              { 
                type: 'ad_copy', 
                title: 'Ad Copy', 
                description: 'Paid advertising content',
                icon: '📢'
              },
              { 
                type: 'blog_post', 
                title: 'Blog Post', 
                description: 'Long-form content',
                icon: '📝'
              },
              { 
                type: 'LANDING_PAGE', 
                title: 'Landing Page', 
                description: 'Conversion-focused page',
                icon: '🎯'
              },
              { 
                type: 'video_script', 
                title: 'Video Script', 
                description: 'Video content outline',
                icon: '🎬'
              }
            ].map((contentType) => (
              <button
                key={contentType.type}
                onClick={() => handleGenerateContent(contentType.type)}
                disabled={isGenerating}
                className="p-6 bg-white border border-gray-200 rounded-xl hover:border-gray-400 hover:shadow-md transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-3xl mb-3">{contentType.icon}</div>
                <h4 className="font-medium text-gray-900 mb-1">{contentType.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{contentType.description}</p>
                {isGenerating && (
                  <div className="mt-3 flex items-center text-purple-600">
                    <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span className="text-sm font-medium">Generating...</span>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Generated Content Display */}
          {generatedContent.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">
                Generated Content ({generatedContent.length})
              </h3>
              
              <div className="space-y-4">
                {generatedContent.map((content, index) => (
                  <div key={content.id || index} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-green-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {content.title}
                          </span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            Generated
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Generated {new Date(content.generated_at).toLocaleString()}
                        </p>
                        {content.preview && (
                          <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg border">
                            {content.preview}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button 
                          onClick={() => router.push(`/campaigns/${campaignId}/content`)}
                          className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                        >
                          View All
                        </button>
                        <button className="px-3 py-1 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Campaign Complete */}
              <div className="bg-gray-100 rounded-xl p-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">🎉 Campaign Complete!</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  You have successfully created a complete marketing campaign with AI-generated content
                </p>
                
                <div className="flex justify-center space-x-4">
                  <button 
                    onClick={() => router.push(`/campaigns/${campaignId}/content`)}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    View All Content
                  </button>
                  <button 
                    onClick={() => router.push('/campaigns')}
                    className="px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium"
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