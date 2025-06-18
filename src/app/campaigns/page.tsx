// src/app/campaigns/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Video, FileText, Globe, Calendar } from 'lucide-react'
import IntelligenceAnalyzer from '@/components/intelligence/IntelligenceAnalyzer'
import ContentGenerator from '@/components/intelligence/ContentGenerator'

// Define the interfaces to match what your components expect
interface AnalysisResult {
  intelligence_id: string
  confidence_score: number
  offer_intelligence: any
  psychology_intelligence: any
  competitive_opportunities: any[]
  campaign_suggestions: string[]
  analysis_status: string
  source_title?: string
  source_url?: string
}

interface IntelligenceSource {
  id: string
  source_title: string
  source_type: string
  confidence_score: number
}

// ✅ ONLY ONE DEFAULT EXPORT - This fixes the Next.js error
export default function CampaignsPage() {
  // Get campaignId from URL params or use default
  const [campaignId] = useState("default-campaign-id") // You can get this from useParams() if needed
  
  // ✅ Properly typed state
  const [intelligenceSources, setIntelligenceSources] = useState<IntelligenceSource[]>([])
  const [showIntelligence, setShowIntelligence] = useState(false)

  // Convert AnalysisResult to IntelligenceSource when analysis completes
  const handleAnalysisComplete = (result: AnalysisResult) => {
    // Convert the analysis result to the format expected by ContentGenerator
    const newIntelligenceSource: IntelligenceSource = {
      id: result.intelligence_id,
      source_title: result.source_title || result.source_url || 'Analysis Result',
      source_type: result.analysis_status || 'analysis',
      confidence_score: result.confidence_score
    }

    // ✅ This will now work correctly with proper typing
    setIntelligenceSources(prev => [...prev, newIntelligenceSource])
    
    // Show the content generator section
    setShowIntelligence(true)
  }

  // Load existing intelligence sources for this campaign
  useEffect(() => {
    const loadExistingIntelligence = async () => {
      try {
        const response = await fetch(`/api/intelligence/campaign/${campaignId}/intelligence`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          
          // Convert the API response to IntelligenceSource format
          const sources: IntelligenceSource[] = data.intelligence_sources?.map((source: any) => ({
            id: source.id,
            source_title: source.source_title,
            source_type: source.source_type,
            confidence_score: source.confidence_score
          })) || []
          
          setIntelligenceSources(sources)
          
          // Show intelligence section if we have sources
          if (sources.length > 0) {
            setShowIntelligence(true)
          }
        }
      } catch (error) {
        console.error('Failed to load existing intelligence:', error)
      }
    }

    if (campaignId) {
      loadExistingIntelligence()
    }
  }, [campaignId])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
            <p className="text-gray-600 mt-2">Create and manage your marketing campaigns</p>
          </div>
          <button 
            onClick={() => {
              // Handle new campaign creation
              console.log('Create new campaign')
            }}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Campaign
          </button>
        </div>

        {/* Campaign Creation Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div 
            onClick={() => setShowIntelligence(true)}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:border-purple-300 transition-colors cursor-pointer"
          >
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Video className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">From Video</h3>
            </div>
            <p className="text-gray-600">Process videos from YouTube, TikTok, and 8+ platforms</p>
          </div>

          <div 
            onClick={() => setShowIntelligence(true)}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
          >
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">From Document</h3>
            </div>
            <p className="text-gray-600">Upload PDFs, docs, presentations, and spreadsheets</p>
          </div>

          <div 
            onClick={() => setShowIntelligence(true)}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:border-emerald-300 transition-colors cursor-pointer"
          >
            <div className="flex items-center mb-4">
              <div className="bg-emerald-100 p-3 rounded-lg">
                <Globe className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">From Website</h3>
            </div>
            <p className="text-gray-600">Extract content from web pages and articles</p>
          </div>
        </div>

        {/* Intelligence Analysis Section */}
        {showIntelligence && (
          <div className="space-y-8">
            <IntelligenceAnalyzer 
              campaignId={campaignId}
              onAnalysisComplete={handleAnalysisComplete}
            />
            
            {/* Content Generator - Only show when we have intelligence sources */}
            {intelligenceSources.length > 0 && (
              <ContentGenerator 
                campaignId={campaignId}
                intelligenceSources={intelligenceSources}
              />
            )}
          </div>
        )}

        {/* Recent Campaigns */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Campaigns</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="bg-purple-100 p-2 rounded-lg mr-3">
                  <Video className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Product Launch Campaign</h3>
                  <p className="text-gray-600 text-sm flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Created 2 days ago • 15 content pieces
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Completed</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Social Media Blitz</h3>
                  <p className="text-gray-600 text-sm flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Created 5 days ago • 28 content pieces
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Active</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                  <Globe className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Email Newsletter Series</h3>
                  <p className="text-gray-600 text-sm flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Created 1 week ago • 12 content pieces
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Completed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}