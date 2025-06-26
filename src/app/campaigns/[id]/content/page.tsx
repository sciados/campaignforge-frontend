// src/app/campaigns/[id]/content/page.tsx - DEBUG VERSION
'use client'
import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useApi } from '@/lib/api'

export default function DebugCampaignContentPage() {
  const params = useParams()
  const router = useRouter()
  const api = useApi()
  
  const campaignId = params.id as string
  const [campaign, setCampaign] = useState<any>(null)
  const [intelligenceData, setIntelligenceData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  const addDebugInfo = (message: string) => {
    console.log('🐛 DEBUG:', message)
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    const loadData = async () => {
      addDebugInfo('useEffect triggered')
      addDebugInfo(`campaignId: ${campaignId}`)
      
      if (!campaignId) {
        addDebugInfo('No campaignId, returning')
        return
      }

      try {
        addDebugInfo('Starting API calls...')
        setIsLoading(true)
        setError(null)
        
        addDebugInfo('Calling getCampaign...')
        const campaignData = await api.getCampaign(campaignId)
        addDebugInfo(`Campaign loaded: ${campaignData?.title || 'undefined'}`)
        setCampaign(campaignData)
        
        addDebugInfo('Calling getCampaignIntelligence...')
        const intelligence = await api.getCampaignIntelligence(campaignId)
        addDebugInfo(`Intelligence loaded - sources: ${intelligence?.intelligence_sources?.length || 0}, content: ${intelligence?.generated_content?.length || 0}`)
        setIntelligenceData(intelligence)
        
        addDebugInfo('Setting isLoading to false')
        setIsLoading(false)
        addDebugInfo('Data loading completed successfully')
        
      } catch (err: any) {
        addDebugInfo(`Error occurred: ${err.message}`)
        console.error('❌ Loading error:', err)
        setError(err.message)
        setIsLoading(false)
      }
    }

    loadData()
  }, [api, campaignId]) // Simple dependency array

  addDebugInfo(`Render - isLoading: ${isLoading}, campaign: ${!!campaign}, intelligenceData: ${!!intelligenceData}, error: ${error}`)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg p-6 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <h1 className="text-xl font-semibold">Loading enhanced campaign content...</h1>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Debug Information:</h3>
              <div className="text-sm space-y-1 max-h-60 overflow-y-auto">
                {debugInfo.map((info, index) => (
                  <div key={index} className="text-gray-600">{info}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg p-6">
            <h1 className="text-xl font-semibold text-red-600 mb-4">Error Loading Content</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Debug Information:</h3>
              <div className="text-sm space-y-1 max-h-60 overflow-y-auto">
                {debugInfo.map((info, index) => (
                  <div key={index} className="text-gray-600">{info}</div>
                ))}
              </div>
            </div>
            
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg p-6">
            <h1 className="text-xl font-semibold text-orange-600 mb-4">No Campaign Data</h1>
            <p className="text-gray-600 mb-4">Campaign data is null but no error occurred.</p>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Debug Information:</h3>
              <div className="text-sm space-y-1 max-h-60 overflow-y-auto">
                {debugInfo.map((info, index) => (
                  <div key={index} className="text-gray-600">{info}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  const displayContent: { id: any; type: string; title: any; content_type: any }[] = []
  
  // Add intelligence sources
  intelligenceData?.intelligence_sources?.forEach((source: any) => {
    displayContent.push({
      id: source.id,
      type: 'intelligence',
      title: source.source_title || 'Intelligence Source',
      content_type: 'intelligence_source'
    })
  })
  
  // Add generated content
  intelligenceData?.generated_content?.forEach((content: any) => {
    displayContent.push({
      id: content.id,
      type: 'generated_content',
      title: content.content_title || 'Generated Content',
      content_type: content.content_type
    })
  })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-semibold text-green-600 mb-4">✅ Success!</h1>
          <p className="text-gray-600 mb-4">Campaign: {campaign.title}</p>
          <p className="text-gray-600 mb-4">Content items: {displayContent.length}</p>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="font-medium mb-2">Debug Information:</h3>
            <div className="text-sm space-y-1 max-h-60 overflow-y-auto">
              {debugInfo.map((info, index) => (
                <div key={index} className="text-gray-600">{info}</div>
              ))}
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Content Items:</h3>
            <div className="space-y-2">
              {displayContent.map((item, index) => (
                <div key={item.id} className="text-sm bg-white p-2 rounded border">
                  <span className="font-medium">{index + 1}. {item.title}</span>
                  <span className="text-gray-500 ml-2">({item.content_type})</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-6 flex space-x-3">
            <button
              onClick={() => router.push(`/campaigns/${campaignId}`)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Back to Campaign
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}