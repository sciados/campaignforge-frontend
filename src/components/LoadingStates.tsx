// src/components/LoadingStates.tsx
import React from 'react'
import { Loader2, FileText, Database, Brain, Sparkles } from 'lucide-react'

// Skeleton Loading Components
export function CampaignCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
        <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
      </div>
      
      <div className="space-y-3">
        <div className="h-5 bg-gray-200 rounded-lg w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded-lg w-full"></div>
        <div className="h-4 bg-gray-200 rounded-lg w-2/3"></div>
      </div>
      
      <div className="mt-6 space-y-2">
        <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded-lg w-1/3"></div>
      </div>
      
      <div className="mt-6 flex space-x-2">
        <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  )
}

export function ContentLibrarySkeletons({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <CampaignCardSkeleton key={i} />
      ))}
    </div>
  )
}

// Specialized Loading States
export function CampaignWorkflowLoading({ step }: { step: number }) {
  const steps = [
    { icon: FileText, label: 'Setup' },
    { icon: Database, label: 'Sources' },
    { icon: Brain, label: 'Analysis' },
    { icon: Sparkles, label: 'Generate' }
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        <h3 className="text-lg font-medium text-black mb-2">
          Loading Campaign Workflow
        </h3>
        
        <p className="text-gray-600 mb-6">
          Preparing Step {step}: {steps[step - 1]?.label}
        </p>

        {/* Step Progress */}
        <div className="flex justify-center space-x-4 mb-6">
          {steps.map((stepItem, index) => {
            const StepIcon = stepItem.icon
            const isActive = index + 1 === step
            const isCompleted = index + 1 < step
            
            return (
              <div
                key={index}
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isActive
                    ? 'bg-purple-600 text-white'
                    : isCompleted
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                <StepIcon className="w-5 h-5" />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function ContentGenerationLoading({ contentType }: { contentType: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
        
        <div className="flex-1">
          <h4 className="font-medium text-black mb-1">
            Generating {contentType}
          </h4>
          <div className="space-y-2">
            <div className="h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-blue-600 rounded-full animate-pulse" style={{ width: '45%' }}></div>
            </div>
            <p className="text-sm text-gray-600">
              AI is analyzing your sources and creating content...
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function IntelligenceAnalysisLoading({ sourcesCount }: { sourcesCount: number }) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-medium text-blue-900">
            Analyzing {sourcesCount} Sources
          </h3>
        </div>
        
        <div className="space-y-3">
          {Array.from({ length: sourcesCount }, (_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <div className="flex-1 h-4 bg-blue-200 rounded-lg animate-pulse"></div>
              <div className="w-16 h-4 bg-blue-300 rounded-lg animate-pulse"></div>
            </div>
          ))}
        </div>
        
        <p className="text-blue-700 text-sm mt-4">
          Extracting insights, identifying opportunities, and preparing recommendations...
        </p>
      </div>
    </div>
  )
}

// Smart Loading with Context
export function SmartLoadingState({ 
  type, 
  context 
}: { 
  type: 'campaigns' | 'content' | 'analysis' | 'generation'
  context?: any 
}) {
  switch (type) {
    case 'campaigns':
      return (
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded-lg w-1/3 animate-pulse"></div>
          <ContentLibrarySkeletons count={context?.count || 6} />
        </div>
      )
      
    case 'content':
      return (
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                <div className="h-5 bg-gray-200 rounded-lg w-1/2"></div>
                <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded-lg w-full"></div>
                <div className="h-4 bg-gray-200 rounded-lg w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      )
      
    case 'analysis':
      return <IntelligenceAnalysisLoading sourcesCount={context?.sourcesCount || 1} />
      
    case 'generation':
      return <ContentGenerationLoading contentType={context?.contentType || 'content'} />
      
    default:
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-gray-600 animate-spin" />
        </div>
      )
  }
}

// Loading Overlay for specific sections
export function LoadingOverlay({ 
  isVisible, 
  message = 'Loading...',
  showProgress = false,
  progress = 0
}: {
  isVisible: boolean
  message?: string
  showProgress?: boolean
  progress?: number
}) {
  if (!isVisible) return null

  return (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-xl">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-black animate-spin mx-auto mb-4" />
        <p className="text-black font-medium mb-2">{message}</p>
        
        {showProgress && (
          <div className="w-48 h-2 bg-gray-200 rounded-full mx-auto">
            <div 
              className="h-2 bg-black rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  )
}