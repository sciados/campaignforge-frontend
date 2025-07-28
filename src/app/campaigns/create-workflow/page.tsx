// src/app/campaigns/create-workflow/page.tsx
'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, Loader2, Brain, Sparkles } from 'lucide-react'
import { useApi } from '@/lib/api'
import { useCampaignStore } from '@/lib/stores/campaignStore'
import { useIntelligenceStore } from '@/lib/stores/intelligenceStore'

// Import step components
import Step1Setup from './components/Step1Setup'
import Step2ContentGeneration from './components/Step2ContentGeneration'

interface WorkflowState {
  currentStep: number
  campaignData: {
    id?: string
    title: string
    description: string
    keywords: string[]
    target_audience: string
    product_name: string
    salespage_url: string
    affiliate_link: string
  }
  isStep1Locked: boolean
  isAnalyzing: boolean
  analysisComplete: boolean
}

export default function CreateWorkflowPage() {
  const router = useRouter()
  const api = useApi()
  const { createCampaign } = useCampaignStore()
  const { analyzeURL, isAnalyzing, analysisProgress, currentAnalysisStep } = useIntelligenceStore()

  const [workflow, setWorkflow] = useState<WorkflowState>({
    currentStep: 1,
    campaignData: {
      title: '',
      description: '',
      keywords: [],
      target_audience: '',
      product_name: '',
      salespage_url: '',
      affiliate_link: ''
    },
    isStep1Locked: false,
    isAnalyzing: false,
    analysisComplete: false
  })

  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  // Auto-advance to Step 3 when analysis completes
  useEffect(() => {
    if (workflow.currentStep === 2 && workflow.analysisComplete && !isAnalyzing) {
      console.log('🎯 Analysis complete, advancing to Step 3')
      setTimeout(() => {
        setWorkflow(prev => ({ ...prev, currentStep: 3 }))
      }, 1500) // Brief delay to show completion
    }
  }, [workflow.analysisComplete, isAnalyzing, workflow.currentStep])

  const handleStep1Complete = async (campaignData: {
    title: string
    description: string
    keywords: string[]
    target_audience: string
    product_name: string
    salespage_url: string
    affiliate_link: string
  }) => {
    setIsCreating(true)
    setError(null)

    try {
      console.log('🚀 Creating campaign with enhanced data:', campaignData)
      
      // Create campaign with new fields
      const campaign = await createCampaign({
        ...campaignData,
        campaign_type: 'universal',
        settings: {
          workflow_type: 'streamlined_auto_analysis',
          step_1_completed: true,
          locked_after_step_1: true,
          product_name: campaignData.product_name,
          salespage_url: campaignData.salespage_url,
          affiliate_link: campaignData.affiliate_link,
          auto_analysis_enabled: true
        }
      })

      console.log('✅ Campaign created successfully:', campaign.id)

      // Lock Step 1 and advance to Step 2 (Analysis)
      setWorkflow(prev => ({
        ...prev,
        currentStep: 2,
        campaignData: { ...campaignData, id: campaign.id },
        isStep1Locked: true,
        isAnalyzing: true
      }))

      // Start automatic background analysis
      await startBackgroundAnalysis(campaign.id, campaignData.salespage_url)

    } catch (error) {
      console.error('❌ Failed to create campaign:', error)
      setError(error instanceof Error ? error.message : 'Failed to create campaign')
    } finally {
      setIsCreating(false)
    }
  }

  const startBackgroundAnalysis = async (campaignId: string, salespageUrl: string) => {
    try {
      console.log('🔍 Starting automatic salespage analysis...', salespageUrl)
      
      setWorkflow(prev => ({ ...prev, isAnalyzing: true }))

      // Use the intelligence store to analyze the URL
      await analyzeURL(campaignId, salespageUrl)

      console.log('✅ Analysis completed successfully')
      
      setWorkflow(prev => ({ 
        ...prev, 
        isAnalyzing: false, 
        analysisComplete: true 
      }))

    } catch (error) {
      console.error('❌ Analysis failed:', error)
      setError(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      
      setWorkflow(prev => ({ 
        ...prev, 
        isAnalyzing: false, 
        analysisComplete: false 
      }))
    }
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
    return 'pending'
  }

  const getStepIcon = (stepNumber: number, status: string) => {
    if (status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-600" />
    }
    if (status === 'active' && stepNumber === 2) {
      return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
    }
    if (status === 'active' && stepNumber === 3) {
      return <Sparkles className="h-5 w-5 text-purple-600" />
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
                Streamlined auto-analysis • Step {workflow.currentStep} of 3
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
            {[
              { num: 1, title: 'Setup Campaign' },
              { num: 2, title: 'Auto Analysis' },
              { num: 3, title: 'Generate Content' }
            ].map((step, index) => {
              const status = getStepStatus(step.num)
              
              return (
                <div key={step.num} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center mb-2">
                      {getStepIcon(step.num, status)}
                    </div>
                    <div className="text-center">
                      <div className={`text-sm font-medium ${
                        status === 'active' 
                          ? step.num === 2 ? 'text-blue-600' : 'text-purple-600'
                          : status === 'completed' 
                          ? 'text-green-600'
                          : 'text-gray-500'
                      }`}>
                        {step.title}
                      </div>
                      {step.num === 2 && workflow.currentStep === 2 && workflow.isAnalyzing && (
                        <div className="text-xs text-blue-600 mt-1">Processing...</div>
                      )}
                      {step.num === 2 && workflow.currentStep === 2 && workflow.analysisComplete && (
                        <div className="text-xs text-green-600 mt-1">Complete!</div>
                      )}
                    </div>
                  </div>
                  
                  {index < 2 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      step.num < workflow.currentStep 
                        ? 'bg-green-500' 
                        : workflow.currentStep === 2 && step.num === 1
                        ? 'bg-blue-500'
                        : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Analysis Progress Bar */}
          {workflow.currentStep === 2 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Brain className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900">
                      {workflow.analysisComplete ? 'Analysis Complete!' : 'Analyzing Your Product'}
                    </h3>
                    <p className="text-sm text-blue-700">
                      {workflow.analysisComplete 
                        ? 'Intelligence extracted and ready for content generation'
                        : currentAnalysisStep || 'Processing salespage content...'
                      }
                    </p>
                  </div>
                </div>
                {workflow.analysisComplete && (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                )}
              </div>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900">
                    {workflow.analysisComplete ? 'Complete' : 'Progress'}
                  </span>
                  <span className="text-sm text-blue-700">
                    {workflow.analysisComplete ? '100' : Math.round(analysisProgress)}%
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      workflow.analysisComplete ? 'bg-green-500' : 'bg-blue-600'
                    }`}
                    style={{ 
                      width: `${workflow.analysisComplete ? 100 : analysisProgress}%` 
                    }}
                  />
                </div>
              </div>

              {workflow.campaignData.salespage_url && (
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">Analyzing:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700">Product:</span>
                      <span className="font-medium text-blue-900">
                        {workflow.campaignData.product_name}
                      </span>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="text-blue-700">Salespage:</span>
                      <span className="font-medium text-blue-900 text-right max-w-xs truncate">
                        {workflow.campaignData.salespage_url}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {workflow.analysisComplete && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center text-green-700">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">
                      Ready to generate content! Moving to Step 3...
                    </span>
                  </div>
                </div>
              )}
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

          {workflow.currentStep === 2 && (
            <div className="p-8 text-center">
              {workflow.isAnalyzing ? (
                <div className="space-y-6">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      AI is analyzing your product...
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      We are extracting insights from your salespage to create targeted content. 
                      This usually takes 30-60 seconds.
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
                    <h4 className="font-medium text-blue-900 mb-2">What we are doing:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Analyzing product features and benefits</li>
                      <li>• Identifying target audience signals</li>
                      <li>• Extracting key selling points</li>
                      <li>• Finding competitive advantages</li>
                    </ul>
                  </div>
                </div>
              ) : workflow.analysisComplete ? (
                <div className="space-y-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Analysis Complete!
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Your product intelligence has been extracted and enhanced. 
                      Ready to generate high-converting content.
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 max-w-md mx-auto">
                    <h4 className="font-medium text-green-900 mb-2">Intelligence Extracted:</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>✅ Product positioning and benefits</li>
                      <li>✅ Target audience insights</li>
                      <li>✅ Competitive differentiation</li>
                      <li>✅ Key messaging frameworks</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <Brain className="h-10 w-10 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Analysis Failed
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      We couldn not analyze your salespage. Please check the URL and try again.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {workflow.currentStep === 3 && workflow.campaignData.id && (
            <Step2ContentGeneration
              campaignId={workflow.campaignData.id}
              campaignTitle={workflow.campaignData.title}
              sourcesAnalyzed={1} // We analyzed the salespage
              onContentGenerated={handleContentGenerated}
              analysisComplete={workflow.analysisComplete}
            />
          )}
        </div>

        {/* Workflow Info */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-medium text-blue-900 mb-2">🚀 Auto-Analysis Workflow</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium text-blue-800">Step 1: Setup</div>
              <div className="text-blue-700">Campaign details + product info</div>
            </div>
            <div>
              <div className="font-medium text-blue-800">Step 2: AI Analysis</div>
              <div className="text-blue-700">Automatic salespage intelligence extraction</div>
            </div>
            <div>
              <div className="font-medium text-blue-800">Step 3: Generate</div>
              <div className="text-blue-700">Create content using extracted insights</div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
            <p className="text-sm text-blue-600">
              <strong>New:</strong> No manual source adding required! We automatically analyze your salespage 
              and extract intelligence and AI Enhance the intelligence to create new and unique targeted marketing content.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}