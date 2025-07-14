// src/app/campaigns/create-workflow/page.tsx
'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, Lock, Loader2 } from 'lucide-react'
import { useApi } from '@/lib/api'
import { useCampaignStore } from '@/lib/stores/campaignStore'
import { useIntelligenceStore } from '@/lib/stores/intelligenceStore'

// Import step components
import Step1Setup from './components/Step1Setup'
import Step2Sources from './components/Step2Sources'
import Step3Generate from './components/Step3Generate'

interface WorkflowState {
  currentStep: number
  campaignData: {
    id?: string
    title: string
    description: string
    keywords: string[]
    target_audience: string
  }
  isStep1Locked: boolean
  sourcesAdded: number
  sourcesAnalyzed: number
  isAnalyzing: boolean
  analysisComplete: boolean
}

export default function CreateWorkflowPage() {
  const router = useRouter()
  const api = useApi()
  const { createCampaign } = useCampaignStore()
  const { isAnalyzing, analysisProgress, currentAnalysisStep } = useIntelligenceStore()

  const [workflow, setWorkflow] = useState<WorkflowState>({
    currentStep: 1,
    campaignData: {
      title: '',
      description: '',
      keywords: [],
      target_audience: ''
    },
    isStep1Locked: false,
    sourcesAdded: 0,
    sourcesAnalyzed: 0,
    isAnalyzing: false,
    analysisComplete: false
  })

  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  // Auto-advance logic when analysis completes
  useEffect(() => {
    if (workflow.currentStep === 2 && workflow.sourcesAnalyzed > 0 && !isAnalyzing) {
      // Auto-advance to Step 3 when analysis is complete
      setTimeout(() => {
        setWorkflow(prev => ({ ...prev, currentStep: 3, analysisComplete: true }))
      }, 1000)
    }
  }, [workflow.sourcesAnalyzed, isAnalyzing, workflow.currentStep])

  const handleStep1Complete = async (campaignData: {
    title: string
    description: string
    keywords: string[]
    target_audience: string
  }) => {
    setIsCreating(true)
    setError(null)

    try {
      console.log('🚀 Creating campaign with data:', campaignData)
      
      const campaign = await createCampaign({
        ...campaignData,
        campaign_type: 'universal',
        settings: {
          workflow_type: 'streamlined_3_step',
          step_1_completed: true,
          locked_after_step_1: true
        }
      })

      console.log('✅ Campaign created successfully:', campaign.id)

      // Lock Step 1 and advance to Step 2
      setWorkflow(prev => ({
        ...prev,
        currentStep: 2,
        campaignData: { ...campaignData, id: campaign.id },
        isStep1Locked: true
      }))

    } catch (error) {
      console.error('❌ Failed to create campaign:', error)
      setError(error instanceof Error ? error.message : 'Failed to create campaign')
    } finally {
      setIsCreating(false)
    }
  }

  const handleSourceAdded = () => {
    setWorkflow(prev => ({
      ...prev,
      sourcesAdded: prev.sourcesAdded + 1
    }))
  }

  const handleSourceAnalyzed = () => {
    setWorkflow(prev => ({
      ...prev,
      sourcesAnalyzed: prev.sourcesAnalyzed + 1
    }))
  }

  const handleContentGenerated = () => {
    // Redirect to campaign content library
    if (workflow.campaignData.id) {
      router.push(`/campaigns/${workflow.campaignData.id}/content`)
    }
  }

  const handleGoToCampaign = () => {
    if (workflow.campaignData.id) {
      router.push(`/campaigns/${workflow.campaignData.id}`)
    }
  }

  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < workflow.currentStep) return 'completed'
    if (stepNumber === workflow.currentStep) return 'active'
    if (stepNumber === 1 && workflow.isStep1Locked) return 'locked'
    return 'pending'
  }

  const getStepIcon = (stepNumber: number, status: string) => {
    if (status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-600" />
    }
    if (status === 'locked') {
      return <Lock className="h-5 w-5 text-gray-400" />
    }
    if (status === 'active' && stepNumber === 2 && isAnalyzing) {
      return <Loader2 className="h-5 w-5 text-purple-600 animate-spin" />
    }
    return (
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
        status === 'active' 
          ? 'bg-purple-600 text-white' 
          : 'bg-gray-200 text-gray-600'
      }`}>
        {stepNumber}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/campaigns')}
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Create New Campaign</h1>
              <p className="text-sm text-gray-500">
                Streamlined 3-step process • Step {workflow.currentStep} of 3
              </p>
            </div>
          </div>
          
          {workflow.campaignData.id && (
            <button
              onClick={handleGoToCampaign}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
            >
              Go to Campaign
            </button>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((stepNumber) => {
              const status = getStepStatus(stepNumber)
              const stepTitles = ['Create Campaign', 'Add Sources', 'Generate Content']
              
              return (
                <div key={stepNumber} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center mb-2">
                      {getStepIcon(stepNumber, status)}
                    </div>
                    <div className="text-center">
                      <div className={`text-sm font-medium ${
                        status === 'active' 
                          ? 'text-purple-600' 
                          : status === 'completed' 
                          ? 'text-green-600'
                          : status === 'locked'
                          ? 'text-gray-400'
                          : 'text-gray-500'
                      }`}>
                        {stepTitles[stepNumber - 1]}
                      </div>
                      {status === 'locked' && (
                        <div className="text-xs text-gray-400 mt-1">Locked</div>
                      )}
                      {stepNumber === 2 && isAnalyzing && (
                        <div className="text-xs text-purple-600 mt-1">Analyzing...</div>
                      )}
                    </div>
                  </div>
                  
                  {stepNumber < 3 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      stepNumber < workflow.currentStep 
                        ? 'bg-green-500' 
                        : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Analysis Progress Bar */}
          {workflow.currentStep === 2 && isAnalyzing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">
                  {currentAnalysisStep || 'Analyzing sources...'}
                </span>
                <span className="text-sm text-blue-700">
                  {Math.round(analysisProgress)}%
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 text-sm font-medium mt-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          {workflow.currentStep === 1 && (
            <Step1Setup
              onComplete={handleStep1Complete}
              isLoading={isCreating}
              initialData={workflow.campaignData}
              isLocked={workflow.isStep1Locked}
            />
          )}

          {workflow.currentStep === 2 && workflow.campaignData.id && (
            <Step2Sources
              campaignId={workflow.campaignData.id}
              campaignTitle={workflow.campaignData.title}
              onSourceAdded={handleSourceAdded}
              onSourceAnalyzed={handleSourceAnalyzed}
              sourcesCount={workflow.sourcesAdded}
              analyzedCount={workflow.sourcesAnalyzed}
            />
          )}

          {workflow.currentStep === 3 && workflow.campaignData.id && (
            <Step3Generate
              campaignId={workflow.campaignData.id}
              campaignTitle={workflow.campaignData.title}
              sourcesAnalyzed={workflow.sourcesAnalyzed}
              onContentGenerated={handleContentGenerated}
              analysisComplete={workflow.analysisComplete}
            />
          )}
        </div>

        {/* Workflow Info */}
        <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-medium text-purple-900 mb-2">🚀 Streamlined Workflow</h3>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• Step 1: Create campaign details (locked after completion)</li>
            <li>• Step 2: Add source materials → Automatic AI analysis</li>
            <li>• Step 3: Generate content → Access Content Library</li>
          </ul>
        </div>
      </div>
    </div>
  )
}