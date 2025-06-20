// src/app/campaigns/[id]/page.tsx
'use client'
import React, { useState, useEffect, useCallback } from 'react'
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
  TrendingUp
} from 'lucide-react'
import { useApi } from '@/lib/api'
import { Campaign } from '@/lib/api'

// Define the intelligence interface to match what the API returns
interface IntelligenceSource {
  id: string
  source_title: string
  confidence_score?: number
  created_at: string
  insights_extracted?: number
  intelligence_type?: string
  [key: string]: any // Allow additional properties
}

// Define workflow state interface
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

export default function FlexibleCampaignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const api = useApi()
  
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

  // Load campaign and workflow state
  useEffect(() => {
    const loadCampaignData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        console.log('🔄 Loading campaign:', campaignId)
        
        // Load basic campaign data
        const campaignData = await api.getCampaign(campaignId)
        console.log('✅ Campaign loaded:', campaignData)
        setCampaign(campaignData)
        
        // Load workflow state
        try {
          const workflow = await api.getWorkflowState(campaignId)
          setWorkflowState(workflow)
          setCurrentStep(workflow.suggested_step || 1)
          // Safely set workflow mode with type checking
          const mode = workflow.workflow_preference
          if (mode === 'quick' || mode === 'methodical' || mode === 'flexible') {
            setWorkflowMode(mode)
          } else {
            setWorkflowMode('flexible')
          }
          console.log('✅ Workflow status loaded:', workflow)
        } catch (workflowError) {
          console.warn('⚠️ Could not load workflow status, using defaults:', workflowError)
          setCurrentStep(1)
        }

        // Load intelligence data if available
        try {
          const intelligence = await api.getCampaignIntelligence(campaignId)
          if (intelligence && intelligence.intelligence_sources) {
            setIntelligenceData(intelligence.intelligence_sources)
            console.log(`📊 Loaded ${intelligence.intelligence_sources.length} intelligence sources`)
          }
        } catch (intelligenceError) {
          console.warn('⚠️ Intelligence loading failed (normal for new campaigns):', intelligenceError)
          setIntelligenceData([])
        }
        
      } catch (err) {
        console.error('❌ Failed to load campaign:', err)
        setError(err instanceof Error ? err.message : 'Failed to load campaign')
      } finally {
        setIsLoading(false)
      }
    }

    if (campaignId) {
      loadCampaignData()
    }
  }, [campaignId, api])

  // Session timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isActiveSession) {
      interval = setInterval(() => {
        setSessionTimer(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isActiveSession])

  // Auto-save functionality
  const saveProgress = useCallback(async (data: any = {}) => {
    if (!autoSave) return
    
    try {
      await api.saveProgress(campaignId, {
        current_step: currentStep,
        session_data: data,
        timestamp: new Date().toISOString()
      })
      setLastSaved(new Date())
    } catch (error) {
      console.error('Auto-save failed:', error)
    }
  }, [campaignId, currentStep, autoSave, api])

  // Auto-save every 30 seconds when user is active
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
    try {
      await api.setWorkflowPreference(campaignId, {
        workflow_preference: mode,
        quick_mode: mode === 'quick',
        detailed_guidance: mode === 'methodical',
        auto_advance: mode === 'quick'
      })
      
      setWorkflowMode(mode)
      // Reload workflow state
      const newWorkflow = await api.getWorkflowState(campaignId)
      setWorkflowState(newWorkflow)
    } catch (error) {
      console.error('Failed to update workflow preference:', error)
    }
  }, [campaignId, api])

  const handleIntelligenceGenerated = useCallback((intelligence: IntelligenceSource) => {
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
    if (!campaign || !workflowState) return null

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
            onSourceAdded={(source) => {
              saveProgress({ source_added: source })
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
            sourcesCount={workflowState.progress_summary?.sources_added || 0}
            intelligenceData={intelligenceData}
            onIntelligenceGenerated={handleIntelligenceGenerated}
          />
        )
      
      case 4:
        return (
          <ContentGenerationStep
            campaignId={campaignId}
            workflowMode={workflowMode}
            intelligenceCount={workflowState.progress_summary?.sources_analyzed || 0}
            onContentGenerated={(content) => {
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaign...</p>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Campaign Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The campaign you\'re looking for doesn\'t exist.'}</p>
          <button
            onClick={() => router.push('/campaigns')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
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
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/campaigns')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{campaign.title}</h1>
                <p className="text-sm text-gray-500">
                  Step {currentStep} • {workflowMode} mode
                  {isActiveSession && (
                    <span className="ml-2 text-green-600">• {formatTime(sessionTimer)}</span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Session timer toggle */}
              <button
                onClick={() => setIsActiveSession(!isActiveSession)}
                className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors ${
                  isActiveSession 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {isActiveSession ? <Clock className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                <span className="text-sm">{isActiveSession ? 'Pause' : 'Start'} Session</span>
              </button>
              
              {/* Auto-save indicator */}
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className={`w-2 h-2 rounded-full ${autoSave ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span>
                  {lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : 'Not saved'}
                </span>
              </div>
              
              {/* Manual save button */}
              <button
                onClick={() => saveProgress({ manual_save: true })}
                className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>Save</span>
              </button>
              
              {/* Settings */}
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Workflow Navigation */}
          <div className="lg:col-span-1 space-y-6">
            {/* Mode Selector */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Working Style</h3>
              
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => handleModeChange('quick')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    workflowMode === 'quick'
                      ? 'border-orange-500 bg-orange-50 text-orange-900'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <Zap className="h-5 w-5 mx-auto mb-2" />
                  <div className="text-sm font-medium">Quick Mode</div>
                  <div className="text-xs text-gray-600">Rush through steps</div>
                </button>
                
                <button
                  onClick={() => handleModeChange('methodical')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    workflowMode === 'methodical'
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <BookOpen className="h-5 w-5 mx-auto mb-2" />
                  <div className="text-sm font-medium">Methodical</div>
                  <div className="text-xs text-gray-600">Take your time</div>
                </button>
                
                <button
                  onClick={() => handleModeChange('flexible')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    workflowMode === 'flexible'
                      ? 'border-purple-500 bg-purple-50 text-purple-900'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <Settings className="h-5 w-5 mx-auto mb-2" />
                  <div className="text-sm font-medium">Flexible</div>
                  <div className="text-xs text-gray-600">Mix of both</div>
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
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Overall</span>
                    <span className="text-sm font-medium text-gray-900">
                      {Math.round(workflowState.progress_summary?.completion_percentage || 0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${workflowState.progress_summary?.completion_percentage || 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-purple-600">
                      {workflowState.progress_summary?.sources_added || 0}
                    </div>
                    <div className="text-xs text-gray-600">Sources</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-600">
                      {workflowState.progress_summary?.sources_analyzed || 0}
                    </div>
                    <div className="text-xs text-gray-600">Analyzed</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">
                      {workflowState.progress_summary?.content_generated || 0}
                    </div>
                    <div className="text-xs text-gray-600">Content</div>
                  </div>
                </div>
              </div>
            )}

            {/* Next Action Card */}
            {workflowState && workflowState.suggested_step && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-purple-900 mb-2">Next Action</h4>
                <p className="text-sm text-purple-700 mb-3">
                  {workflowState.primary_suggestion}
                </p>
                <button
                  onClick={() => handleStepChange(workflowState.suggested_step!)}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  Continue
                </button>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {renderStepContent()}
            </div>
          </div>
        </div>
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
    if (!workflowState?.progress?.steps) return 'locked'
    
    const progress = workflowState.progress.steps[`step_${stepNumber}`] || 0
    
    if (progress >= 100) return 'completed'
    if (stepNumber === currentStep) return 'active'
    if (workflowState.available_actions?.some((a: any) => a.step === stepNumber && a.can_access)) return 'available'
    return 'locked'
  }

  const getStepIcon = (step: any, status: string) => {
    const Icon = step.icon
    
    if (status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-600" />
    } else if (status === 'locked') {
      return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
    } else {
      return <Icon className={`h-5 w-5 ${
        status === 'active' ? 'text-purple-600' : 'text-blue-600'
      }`} />
    }
  }

  if (workflowMode === 'methodical') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Steps</h3>
        
        <div className="space-y-4">
          {steps.map((step, index) => {
            const status = getStepStatus(step.number)
            const isClickable = status !== 'locked'
            
            return (
              <div key={step.number}>
                <button
                  onClick={() => isClickable && onStepClick(step.number)}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    status === 'completed' ? 'bg-green-50 border-green-200' :
                    status === 'active' ? 'bg-purple-50 border-purple-200 ring-2 ring-purple-200' :
                    status === 'available' ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' :
                    'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
                  }`}
                  disabled={!isClickable}
                >
                  <div className="flex items-center space-x-3">
                    {getStepIcon(step, status)}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {step.number}. {step.title}
                      </h4>
                      <p className="text-xs text-gray-600">{step.description}</p>
                    </div>
                  </div>
                </button>
                
                {index < steps.length - 1 && (
                  <div className="flex justify-center py-1">
                    <div className="w-px h-4 bg-gray-200"></div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Steps</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {steps.map((step) => {
          const status = getStepStatus(step.number)
          const isClickable = status !== 'locked'
          
          return (
            <button
              key={step.number}
              onClick={() => isClickable && onStepClick(step.number)}
              className={`p-3 rounded-lg border text-center transition-all ${
                status === 'completed' ? 'bg-green-50 border-green-200' :
                status === 'active' ? 'bg-purple-50 border-purple-200 ring-2 ring-purple-200' :
                status === 'available' ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' :
                'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
              }`}
              disabled={!isClickable}
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
      <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <Target className="h-4 w-4 text-purple-600" />
          <span className="text-sm text-purple-800">
            Current: {steps.find(s => s.number === currentStep)?.title}
          </span>
        </div>
      </div>
    </div>
  )
}

// Step Content Components
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Campaign Setup</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-blue-900 mb-2">✅ Step 1: Campaign Created</h3>
        <p className="text-blue-700">
          Your campaign is set up and ready. You can edit details here or move to Step 2 to add sources.
        </p>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
            <input
              type="text"
              value={formData.target_audience}
              onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
              placeholder="e.g., Small business owners, Marketing professionals"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Title</h3>
              <p className="text-gray-900 mt-1">{campaign.title}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700">Campaign Type</h3>
              <p className="text-gray-900 mt-1 capitalize">{campaign.campaign_type.replace('_', ' ')}</p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700">Description</h3>
            <p className="text-gray-900 mt-1">{campaign.description}</p>
          </div>
          {campaign.target_audience && (
            <div>
              <h3 className="text-sm font-medium text-gray-700">Target Audience</h3>
              <p className="text-gray-900 mt-1">{campaign.target_audience}</p>
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
  onSourceAdded 
}: {
  campaignId: string
  workflowMode: 'quick' | 'methodical' | 'flexible'
  onSourceAdded: (source: any) => void
}) {
  const [urlInput, setUrlInput] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [sources, setSources] = useState<any[]>([])
  const api = useApi()

  const handleAddURL = async () => {
    if (!urlInput.trim()) return
    
    setIsAnalyzing(true)
    try {
      // Add the URL as a source
      const newSource = {
        id: Date.now().toString(),
        type: 'url',
        url: urlInput,
        status: 'added',
        title: urlInput
      }
      
      setSources(prev => [...prev, newSource])
      onSourceAdded(newSource)
      setUrlInput('')
      
      // In a real implementation, you'd validate the URL first
      console.log('Added URL source:', urlInput)
      
    } catch (error) {
      console.error('Failed to add URL:', error)
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Add Input Sources</h2>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
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
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Link className="h-6 w-6 text-purple-600 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">Add URL</h3>
          </div>
          <div className="space-y-3">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/sales-page"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleAddURL()}
            />
            <button
              onClick={handleAddURL}
              disabled={!urlInput.trim() || isAnalyzing}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add URL
                </>
              )}
            </button>
          </div>
        </div>

        {/* File Upload */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Upload className="h-6 w-6 text-purple-600 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">Upload Document</h3>
          </div>
          <div className="space-y-3">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
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
                <span className="text-sm text-gray-600">
                  Click to upload PDF, DOC, TXT
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
          <div className="grid grid-cols-1 gap-4">
            {sources.map((source, index) => (
              <div key={source.id || index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {source.type === 'url' ? (
                        <Link className="h-4 w-4 text-purple-600" />
                      ) : (
                        <FileText className="h-4 w-4 text-purple-600" />
                      )}
                      <span className="text-sm font-medium text-gray-900">
                        {source.title || source.filename || source.url}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        source.status === 'uploaded' || source.status === 'added'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {source.status}
                      </span>
                    </div>
                    {source.insights && (
                      <p className="text-sm text-gray-600">
                        {source.insights} insights extracted
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
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Add Your First Source</h3>
          <p className="text-gray-600 mb-4">
            Upload documents, add URLs, or paste content to analyze
          </p>
          <div className="text-sm text-gray-500">
            Supported: URLs, PDF, DOC, TXT, PPTX files
          </div>
        </div>
      )}

      {/* Quick Actions for Different Modes */}
      {workflowMode === 'quick' && sources.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-medium text-orange-900 mb-2">Quick Mode: Ready to Analyze</h4>
          <p className="text-sm text-orange-700 mb-3">
            You have {sources.length} source(s). Ready to run AI analysis?
          </p>
          <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
            Start Analysis Now
          </button>
        </div>
      )}

      {workflowMode === 'methodical' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Methodical Approach</h4>
          <ul className="text-sm text-blue-700 space-y-1">
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
  onIntelligenceGenerated 
}: {
  campaignId: string
  workflowMode: 'quick' | 'methodical' | 'flexible'
  sourcesCount: number
  intelligenceData: IntelligenceSource[]
  onIntelligenceGenerated: (intelligence: IntelligenceSource) => void
}) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const api = useApi()

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true)
    setAnalysisProgress(0)
    
    try {
      // Simulate analysis progress
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 500)

      // In a real implementation, you'd analyze actual sources
      // For now, we'll simulate with a delay
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      clearInterval(progressInterval)
      setAnalysisProgress(100)
      
      // Generate mock intelligence data
      const mockIntelligence: IntelligenceSource = {
        id: Date.now().toString(),
        source_title: "Analyzed Sources",
        confidence_score: 0.85,
        created_at: new Date().toISOString(),
        insights_extracted: sourcesCount * 3,
        intelligence_type: 'competitive_analysis'
      }
      
      onIntelligenceGenerated(mockIntelligence)
      
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
      setAnalysisProgress(0)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">AI Analysis</h2>
      
      {sourcesCount === 0 ? (
        <div className="text-center py-12">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Sources to Analyze</h3>
          <p className="text-gray-600 mb-4">
            Add some sources in Step 2 before running analysis
          </p>
          <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Go to Step 2: Add Sources
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-green-900 mb-2">Ready for Analysis</h3>
            <p className="text-green-700">
              You have {sourcesCount} sources ready for AI analysis.
              {workflowMode === 'quick' && " Run quick analysis to move fast."}
              {workflowMode === 'methodical' && " Take time to configure analysis settings for best results."}
            </p>
          </div>

          {/* Analysis Progress */}
          {isAnalyzing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-blue-900">Analyzing Sources...</h4>
                <span className="text-sm text-blue-700">{analysisProgress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${analysisProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-blue-600 mt-2">
                Extracting insights from your sources...
              </p>
            </div>
          )}

          {/* Analysis Options */}
          {!isAnalyzing && intelligenceData.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Standard Analysis</h3>
                <ul className="text-sm text-gray-600 space-y-2 mb-4">
                  <li>• Extract key insights and themes</li>
                  <li>• Identify persuasion techniques</li>
                  <li>• Analyze competitive positioning</li>
                  <li>• Generate campaign suggestions</li>
                </ul>
                <button 
                  onClick={handleStartAnalysis}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Start Standard Analysis
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Enhanced Analysis</h3>
                <ul className="text-sm text-gray-600 space-y-2 mb-4">
                  <li>• Deep psychological analysis</li>
                  <li>• VSL detection and transcription</li>
                  <li>• Advanced competitive insights</li>
                  <li>• Campaign angle generation</li>
                </ul>
                <button 
                  onClick={handleStartAnalysis}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Enhanced Analysis
                </button>
              </div>
            </div>
          )}

          {/* Intelligence Results */}
          {intelligenceData.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Analysis Results ({intelligenceData.length})
                </h3>
                <button 
                  onClick={handleStartAnalysis}
                  disabled={isAnalyzing}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  Analyze More Sources
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {intelligenceData.map((intel, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{intel.source_title}</h4>
                      <span className="text-sm text-purple-600">
                        {Math.round((intel.confidence_score || 0.8) * 100)}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {intel.insights_extracted || 15} insights extracted
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{intel.intelligence_type || 'Sales Page'}</span>
                      <span>{new Date(intel.created_at || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Stats */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-2">Analysis Summary</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{intelligenceData.length}</div>
                    <div className="text-sm text-purple-700">Sources Analyzed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(intelligenceData.reduce((acc: number, intel: IntelligenceSource) => acc + (intel.confidence_score || 0.8), 0) / intelligenceData.length * 100)}%
                    </div>
                    <div className="text-sm text-purple-700">Avg Confidence</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {intelligenceData.reduce((acc: number, intel: IntelligenceSource) => acc + (intel.insights_extracted || 15), 0)}
                    </div>
                    <div className="text-sm text-purple-700">Total Insights</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ContentGenerationStep({ 
  campaignId, 
  workflowMode, 
  intelligenceCount, 
  onContentGenerated 
}: {
  campaignId: string
  workflowMode: 'quick' | 'methodical' | 'flexible'
  intelligenceCount: number
  onContentGenerated: (content: any) => void
}) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<any[]>([])

  const handleGenerateContent = async (contentType: string) => {
    setIsGenerating(true)
    
    try {
      // Simulate content generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newContent = {
        id: Date.now().toString(),
        type: contentType,
        title: getContentTitle(contentType),
        generated_at: new Date(),
        status: 'generated'
      }
      
      setGeneratedContent(prev => [...prev, newContent])
      onContentGenerated(newContent)
      
    } catch (error) {
      console.error('Content generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const getContentTitle = (type: string) => {
    const titles: Record<string, string> = {
      'email_sequence': 'Email Marketing Sequence',
      'social_posts': 'Social Media Posts',
      'ad_copy': 'Advertisement Copy',
      'blog_post': 'Blog Post',
      'landing_page': 'Landing Page Copy',
      'video_script': 'Video Script'
    }
    return titles[type] || 'Generated Content'
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Generate Content</h2>
      
      {intelligenceCount === 0 ? (
        <div className="text-center py-12">
          <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Intelligence Available</h3>
          <p className="text-gray-600 mb-4">
            Complete source analysis before generating content
          </p>
          <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Go to Step 3: Analyze Sources
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-green-900 mb-2">Ready to Generate Content</h3>
            <p className="text-green-700">
              You have {intelligenceCount} intelligence sources ready for content generation.
            </p>
          </div>

          {/* Content Type Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { 
                type: 'email_sequence', 
                title: 'Email Sequence', 
                description: 'Multi-part email campaign',
                icon: '📧'
              },
              { 
                type: 'social_posts', 
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
                type: 'landing_page', 
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
                className="p-4 bg-white border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-2xl mb-2">{contentType.icon}</div>
                <h4 className="font-medium text-gray-900">{contentType.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{contentType.description}</p>
                {isGenerating && (
                  <div className="mt-2 flex items-center text-purple-600">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm">Generating...</span>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Quick Generate All for Quick Mode */}
          {workflowMode === 'quick' && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-medium text-orange-900 mb-2">Quick Generate All</h4>
              <p className="text-sm text-orange-700 mb-3">
                Generate a complete content suite based on your intelligence sources.
              </p>
              <button 
                onClick={() => handleGenerateContent('content_suite')}
                disabled={isGenerating}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
              >
                Generate Content Suite
              </button>
            </div>
          )}

          {/* Generated Content */}
          {generatedContent.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Generated Content ({generatedContent.length})
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                {generatedContent.map((content, index) => (
                  <div key={content.id || index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Sparkles className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-gray-900">
                            {content.title}
                          </span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            Generated
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Generated {new Date(content.generated_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                          View
                        </button>
                        <button className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Campaign Complete Message */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-green-900 mb-2">🎉 Campaign Complete!</h3>
                <p className="text-green-700 mb-4">
                  You have successfully created a complete marketing campaign with AI-generated content.
                </p>
                <div className="flex justify-center space-x-4">
                  <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Download All Content
                  </button>
                  <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
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