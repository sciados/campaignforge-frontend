// src/app/campaigns/create-workflow/components/Step2Sources.tsx
'use client'
import React, { useState, useCallback } from 'react'
import { Upload, Link, FileText, Plus, Check, Loader2, Brain, ArrowRight } from 'lucide-react'
import { useApi } from '@/lib/api'

interface SourceItem {
  id: string
  type: 'url' | 'document'
  name: string
  status: 'analyzing' | 'completed' | 'error'
  confidence_score?: number
  insights_count?: number
  error_message?: string
  created_at: string
}

interface Step2SourcesProps {
  campaignId: string
  campaignTitle: string
  onSourceAdded: () => void
  onSourceAnalyzed: () => void
  sourcesCount: number
  analyzedCount: number
}

export default function Step2Sources({
  campaignId,
  campaignTitle,
  onSourceAdded,
  onSourceAnalyzed,
  sourcesCount,
  analyzedCount
}: Step2SourcesProps) {
  const api = useApi()
  const [sources, setSources] = useState<SourceItem[]>([])
  const [urlInput, setUrlInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [activeTab, setActiveTab] = useState<'url' | 'upload'>('url')

  const addUrlSource = async () => {
    if (!urlInput.trim() || isProcessing) return

    const newSource: SourceItem = {
      id: `url_${Date.now()}`,
      type: 'url',
      name: urlInput,
      status: 'analyzing',
      created_at: new Date().toISOString()
    }

    setSources(prev => [...prev, newSource])
    setUrlInput('')
    setIsProcessing(true)
    onSourceAdded()

    try {
      console.log('🔍 Analyzing URL:', urlInput)
      
      const result = await api.analyzeURL({
        url: urlInput,
        campaign_id: campaignId,
        analysis_type: 'sales_page'
      })

      console.log('✅ URL analysis complete:', result)

      // Update source with results
      setSources(prev => prev.map(source => 
        source.id === newSource.id 
          ? {
              ...source,
              status: 'completed',
              confidence_score: result.confidence_score,
              insights_count: result.offer_intelligence?.key_offers?.length || 5
            }
          : source
      ))

      onSourceAnalyzed()
      
    } catch (error) {
      console.error('❌ URL analysis failed:', error)
      
      setSources(prev => prev.map(source => 
        source.id === newSource.id 
          ? {
              ...source,
              status: 'error',
              error_message: error instanceof Error ? error.message : 'Analysis failed'
            }
          : source
      ))
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileUpload = useCallback(
    async (files: FileList) => {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const newSource: SourceItem = {
          id: `file_${Date.now()}_${i}`,
          type: 'document',
          name: file.name,
          status: 'analyzing',
          created_at: new Date().toISOString()
        }

        setSources(prev => [...prev, newSource])
        onSourceAdded()

        try {
          console.log('📄 Analyzing document:', file.name)

          const result = await api.uploadDocument(file, campaignId)

          console.log('✅ Document analysis complete:', result)

          setSources(prev => prev.map(source =>
            source.id === newSource.id
              ? {
                  ...source,
                  status: 'completed',
                  confidence_score: 0.85,
                  insights_count: result.insights_extracted || 8
                }
              : source
          ))

          onSourceAnalyzed()

        } catch (error) {
          console.error('❌ Document analysis failed:', error)

          setSources(prev => prev.map(source =>
            source.id === newSource.id
              ? {
                  ...source,
                  status: 'error',
                  error_message: error instanceof Error ? error.message : 'Upload failed'
                }
              : source
          ))
        }
      }
    },
    [api, campaignId, onSourceAdded, onSourceAnalyzed] // ✅ dependency array added here
  )

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileUpload(files)
    }
  }, [handleFileUpload])

  const getAnalysisProgress = () => {
    if (sources.length === 0) return 0
    return Math.round((analyzedCount / sources.length) * 100)
  }

  const hasCompletedSources = analyzedCount > 0
  const allSourcesAnalyzed = sources.length > 0 && analyzedCount === sources.length

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
            <Brain className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add Source Materials</h2>
            <p className="text-gray-600">Upload content for AI analysis and intelligence extraction</p>
          </div>
        </div>
        
        {hasCompletedSources && (
          <div className="flex items-center space-x-2 text-green-600">
            <Check className="h-5 w-5" />
            <span className="text-sm font-medium">{analyzedCount} sources analyzed</span>
          </div>
        )}
      </div>

      {/* Campaign Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-blue-900 mb-1">Campaign: {campaignTitle}</h3>
        <p className="text-sm text-blue-700">
          Add competitor pages, sales materials, or documents to extract winning strategies and generate unique content angles.
        </p>
      </div>

      {/* Analysis Progress */}
      {sources.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900">Analysis Progress</span>
            <span className="text-sm text-gray-600">{analyzedCount} of {sources.length} complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${getAnalysisProgress()}%` }}
            />
          </div>
          {allSourcesAnalyzed && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center text-green-700">
                <Check className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">
                  All sources analyzed! You&apos;ll automatically advance to content generation.
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
        <button
          onClick={() => setActiveTab('url')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'url'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Link className="h-4 w-4 inline mr-2" />
          Website URLs
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'upload'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Upload className="h-4 w-4 inline mr-2" />
          Upload Documents
        </button>
      </div>

      {/* URL Input */}
      {activeTab === 'url' && (
        <div className="space-y-4 mb-6">
          <div className="flex space-x-3">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/sales-page"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && addUrlSource()}
              disabled={isProcessing}
            />
            <button
              onClick={addUrlSource}
              disabled={!urlInput.trim() || isProcessing}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Analyze
            </button>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Recommended Sources:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Competitor sales pages and landing pages</li>
              <li>• High-converting product pages</li>
              <li>• Successful marketing campaigns</li>
              <li>• Industry leader websites and content</li>
            </ul>
          </div>
        </div>
      )}

      {/* File Upload */}
      {activeTab === 'upload' && (
        <div className="space-y-4 mb-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className={`mx-auto h-12 w-12 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
            <p className="mt-2 text-lg font-medium text-gray-900">
              Drop files here or click to upload
            </p>
            <p className="text-sm text-gray-600">
              Support for PDF, DOCX, PPTX, TXT files (Max 10MB each)
            </p>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose Files
            </label>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Supported Documents:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Sales presentations and pitch decks</li>
              <li>• Marketing materials and brochures</li>
              <li>• Competitor analysis reports</li>
              <li>• Product documentation and guides</li>
            </ul>
          </div>
        </div>
      )}

      {/* Sources List */}
      {sources.length > 0 && (
        <div className="space-y-3 mb-6">
          <h3 className="font-medium text-gray-900">Sources Added ({sources.length})</h3>
          {sources.map((source) => (
            <div
              key={source.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-3 flex-1">
                <div className="flex-shrink-0">
                  {source.type === 'url' ? (
                    <Link className="h-5 w-5 text-blue-500" />
                  ) : (
                    <FileText className="h-5 w-5 text-green-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {source.name}
                  </p>
                  {source.status === 'completed' && source.insights_count && (
                    <p className="text-xs text-gray-500">
                      {source.insights_count} insights extracted • {Math.round((source.confidence_score || 0.8) * 100)}% confidence
                    </p>
                  )}
                  {source.status === 'error' && (
                    <p className="text-xs text-red-600">{source.error_message}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {source.status === 'analyzing' && (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    <span className="text-sm text-blue-600 font-medium">Analyzing...</span>
                  </>
                )}
                {source.status === 'completed' && (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600 font-medium">Complete</span>
                  </>
                )}
                {source.status === 'error' && (
                  <span className="text-sm text-red-600 font-medium">Failed</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Auto-advance Notice */}
      {hasCompletedSources && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Brain className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-green-900">Analysis Complete!</h3>
                <p className="text-sm text-green-700">
                  {analyzedCount} source{analyzedCount !== 1 ? 's' : ''} analyzed and ready for content generation.
                  {allSourcesAnalyzed && ' You\'ll automatically advance to Step 3.'}
                </p>
              </div>
            </div>
            {allSourcesAnalyzed && (
              <div className="flex items-center text-green-600">
                <ArrowRight className="h-5 w-5 mr-1" />
                <span className="text-sm font-medium">Moving to Step 3...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {sources.length === 0 && (
        <div className="text-center py-12">
          <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Add Your First Source</h3>
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            Upload competitor content or add URLs to analyze and extract winning strategies for your campaign.
          </p>
        </div>
      )}
    </div>
  )
}