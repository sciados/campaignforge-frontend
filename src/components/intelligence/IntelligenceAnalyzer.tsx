// src/components/intelligence/IntelligenceAnalyzer.tsx
import React, { useState, useCallback } from 'react'
import { 
  Brain, 
  Zap, 
  FileText, 
  Globe, 
  Upload, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Target,
  Eye,
  Lightbulb,
  Calendar,
  X,
  Plus
} from 'lucide-react'
import { useApi } from '@/lib/api'

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

interface IntelligenceAnalyzerProps {
  campaignId: string
  onAnalysisComplete: (result: AnalysisResult) => void
}

export default function IntelligenceAnalyzer({ campaignId, onAnalysisComplete }: IntelligenceAnalyzerProps) {
  const api = useApi()
  
  const [activeTab, setActiveTab] = useState<'url' | 'document' | 'results'>('url')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // URL Analysis State
  const [url, setUrl] = useState('')
  const [analysisType, setAnalysisType] = useState('sales_page')
  
  // Document Upload State
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const analyzeUrl = useCallback(async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL')
      return
    }
    
    setIsAnalyzing(true)
    setError(null)
    setSuccessMessage(null)
    
    try {
      const result = await api.analyzeURL({
        url: url.trim(),
        campaign_id: campaignId,
        analysis_type: analysisType
      })
      
      // Transform the API response to match the expected interface
      const analysisResult: AnalysisResult = {
        intelligence_id: result.intelligence_id,
        confidence_score: result.confidence_score,
        offer_intelligence: result.offer_intelligence,
        psychology_intelligence: result.psychology_intelligence,
        competitive_opportunities: result.competitive_opportunities,
        campaign_suggestions: result.campaign_suggestions,
        analysis_status: result.analysis_status,
        source_url: url.trim()
      }
      
      setAnalysisResult(analysisResult)
      setActiveTab('results')
      setSuccessMessage('Analysis completed successfully!')
      onAnalysisComplete(analysisResult)
      
    } catch (err) {
      console.error('Analysis error:', err)
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setIsAnalyzing(false)
    }
  }, [url, analysisType, campaignId, onAnalysisComplete, api])

  const uploadDocument = useCallback(async (file: File) => {
    setIsAnalyzing(true)
    setError(null)
    setSuccessMessage(null)
    setUploadProgress(0)
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)
      
      const result = await api.uploadDocument(file, campaignId)
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      // Convert document result to match AnalysisResult interface
      const analysisResult: AnalysisResult = {
        intelligence_id: result.intelligence_id,
        confidence_score: 0.8, // Default confidence for documents
        offer_intelligence: {},
        psychology_intelligence: {},
        competitive_opportunities: result.content_opportunities.map((opp: any) => ({ description: opp })),
        campaign_suggestions: result.content_opportunities,
        analysis_status: result.status,
        source_title: file.name
      }
      
      setAnalysisResult(analysisResult)
      setActiveTab('results')
      setSuccessMessage(`Document analyzed successfully! Found ${result.insights_extracted} insights.`)
      onAnalysisComplete(analysisResult)
      
    } catch (err) {
      console.error('Document upload error:', err)
      setError(err instanceof Error ? err.message : 'Document analysis failed')
      setUploadProgress(0)
    } finally {
      setIsAnalyzing(false)
    }
  }, [campaignId, onAnalysisComplete, api])

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
    if (files && files[0]) {
      setUploadedFile(files[0])
      uploadDocument(files[0])
    }
  }, [uploadDocument])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      setUploadedFile(files[0])
      uploadDocument(files[0])
    }
  }, [uploadDocument])

  const clearMessages = () => {
    setError(null)
    setSuccessMessage(null)
  }

  const startNewAnalysis = () => {
    setAnalysisResult(null)
    setActiveTab('url')
    setUrl('')
    setUploadedFile(null)
    setUploadProgress(0)
    clearMessages()
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
      <div className="mb-8">
        <h2 className="text-2xl font-light text-black flex items-center">
          <Brain className="h-6 w-6 mr-3 text-black" />
          Intelligence Analyzer
        </h2>
        <p className="text-gray-600 mt-2">
          Analyze competitor content to extract marketing intelligence and opportunities
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2 bg-gray-100 rounded-xl p-2 mb-8">
        <button
          onClick={() => setActiveTab('url')}
          className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'url'
              ? 'bg-white text-black shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Globe className="h-4 w-4 inline mr-2" />
          Analyze URL
        </button>
        <button
          onClick={() => setActiveTab('document')}
          className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'document'
              ? 'bg-white text-black shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Upload className="h-4 w-4 inline mr-2" />
          Upload Document
        </button>
        {analysisResult && (
          <button
            onClick={() => setActiveTab('results')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'results'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <CheckCircle className="h-4 w-4 inline mr-2" />
            View Results
          </button>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
              <p className="text-red-700">{error}</p>
            </div>
            <button onClick={clearMessages} className="text-red-500 hover:text-red-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <p className="text-green-700">{successMessage}</p>
            </div>
            <button onClick={clearMessages} className="text-green-500 hover:text-green-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* URL Analysis Tab */}
      {activeTab === 'url' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-black mb-3">
              Analysis Type
            </label>
            <select
              value={analysisType}
              onChange={(e) => setAnalysisType(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
              disabled={isAnalyzing}
            >
              <option value="sales_page">Sales Page Analysis</option>
              <option value="website">General Website Analysis</option>
              <option value="competitor">Competitor Analysis</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-3">
              URL to Analyze
            </label>
            <div className="flex space-x-4">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://competitor-sales-page.com"
                className="flex-1 px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                disabled={isAnalyzing}
                onKeyPress={(e) => e.key === 'Enter' && !isAnalyzing && analyzeUrl()}
              />
              <button
                onClick={analyzeUrl}
                disabled={isAnalyzing || !url.trim()}
                className="px-8 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isAnalyzing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="font-medium text-black mb-4">What we will analyze:</h3>
            <ul className="text-sm text-gray-600 space-y-3">
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-black mr-3 flex-shrink-0" />
                Offer structure and pricing strategies
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-black mr-3 flex-shrink-0" />
                Psychology and persuasion techniques
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-black mr-3 flex-shrink-0" />
                Competitive gaps and opportunities
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-black mr-3 flex-shrink-0" />
                Content strategy insights
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Document Upload Tab */}
      {activeTab === 'document' && (
        <div className="space-y-6">
          <div
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
              dragActive
                ? 'border-gray-400 bg-gray-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {uploadedFile ? (
              <div className="space-y-4">
                <CheckCircle className="h-12 w-12 text-black mx-auto" />
                <p className="text-lg font-medium text-black">{uploadedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                {isAnalyzing && (
                  <div className="mt-6">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-black h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-3">Processing... {uploadProgress}%</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-black">
                    Drop your document here, or{' '}
                    <label className="text-black hover:text-gray-600 cursor-pointer underline">
                      browse
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.xlsx,.csv"
                        onChange={handleFileInput}
                        disabled={isAnalyzing}
                      />
                    </label>
                  </p>
                  <p className="text-sm text-gray-500 mt-3">
                    Supports: PDF, Word, PowerPoint, Excel, CSV, Text files
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-2xl p-6">
              <FileText className="h-6 w-6 text-black mb-3" />
              <h3 className="font-medium text-black">Research Documents</h3>
              <p className="text-sm text-gray-600">Market reports, whitepapers, case studies</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6">
              <TrendingUp className="h-6 w-6 text-black mb-3" />
              <h3 className="font-medium text-black">Competitor Materials</h3>
              <p className="text-sm text-gray-600">Sales decks, product guides, presentations</p>
            </div>
          </div>

          {isAnalyzing && (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mr-4" />
              <p className="text-lg text-gray-600">Processing your document...</p>
            </div>
          )}
        </div>
      )}

      {/* Results Tab */}
      {activeTab === 'results' && analysisResult && (
        <div className="space-y-8">
          {/* Header with New Analysis Button */}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-medium text-black">Analysis Results</h3>
            <button
              onClick={startNewAnalysis}
              className="flex items-center px-6 py-3 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Analysis
            </button>
          </div>

          {/* Confidence Score */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-black">Analysis Confidence</h3>
                <p className="text-sm text-gray-600">Quality of extracted intelligence</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold text-black">
                  {Math.round(analysisResult.confidence_score * 100)}%
                </div>
                <div className="text-sm text-gray-500">
                  {analysisResult.confidence_score > 0.8 ? 'Excellent' : 
                   analysisResult.confidence_score > 0.6 ? 'Good' : 'Fair'}
                </div>
              </div>
            </div>
          </div>

          {/* Source Information */}
          {(analysisResult.source_title || analysisResult.source_url) && (
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="font-medium text-black mb-3">Analysis Source</h3>
              <div className="flex items-center text-sm text-gray-600">
                <Globe className="h-4 w-4 mr-3" />
                <span>{analysisResult.source_title || analysisResult.source_url}</span>
              </div>
            </div>
          )}

          {/* Intelligence Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Offer Intelligence */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center mb-4">
                <Target className="h-5 w-5 text-black mr-3" />
                <h3 className="font-medium text-black">Offer Intelligence</h3>
              </div>
              <div className="space-y-3 text-sm">
                {analysisResult.offer_intelligence?.products?.slice(0, 3).map((product: string, index: number) => (
                  <div key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">{product}</span>
                  </div>
                ))}
                {(!analysisResult.offer_intelligence?.products || analysisResult.offer_intelligence.products.length === 0) && (
                  <p className="text-gray-500 italic">No specific offers detected</p>
                )}
              </div>
            </div>

            {/* Psychology Intelligence */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center mb-4">
                <Brain className="h-5 w-5 text-black mr-3" />
                <h3 className="font-medium text-black">Psychology Triggers</h3>
              </div>
              <div className="space-y-3 text-sm">
                {analysisResult.psychology_intelligence?.emotional_triggers?.slice(0, 3).map((trigger: string, index: number) => (
                  <div key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">{trigger}</span>
                  </div>
                ))}
                {(!analysisResult.psychology_intelligence?.emotional_triggers || analysisResult.psychology_intelligence.emotional_triggers.length === 0) && (
                  <p className="text-gray-500 italic">No psychology triggers identified</p>
                )}
              </div>
            </div>

            {/* Competitive Opportunities */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center mb-4">
                <Eye className="h-5 w-5 text-black mr-3" />
                <h3 className="font-medium text-black">Opportunities</h3>
              </div>
              <div className="space-y-3 text-sm">
                {analysisResult.competitive_opportunities?.slice(0, 3).map((opportunity: any, index: number) => (
                  <div key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">
                      {typeof opportunity === 'string' ? opportunity : opportunity.description || 'Opportunity identified'}
                    </span>
                  </div>
                ))}
                {(!analysisResult.competitive_opportunities || analysisResult.competitive_opportunities.length === 0) && (
                  <p className="text-gray-500 italic">No opportunities identified</p>
                )}
              </div>
            </div>

            {/* Campaign Suggestions */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center mb-4">
                <Lightbulb className="h-5 w-5 text-black mr-3" />
                <h3 className="font-medium text-black">Campaign Ideas</h3>
              </div>
              <div className="space-y-3 text-sm">
                {analysisResult.campaign_suggestions?.slice(0, 3).map((suggestion: string, index: number) => (
                  <div key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">{suggestion}</span>
                  </div>
                ))}
                {(!analysisResult.campaign_suggestions || analysisResult.campaign_suggestions.length === 0) && (
                  <p className="text-gray-500 italic">No campaign suggestions generated</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-6 border-t border-gray-200">
            <button 
              onClick={() => {
                // Content generator will automatically show when analysis is complete
                // This is handled by the parent component
              }}
              className="flex-1 bg-black text-white py-4 px-6 rounded-lg font-medium hover:bg-gray-900 transition-colors"
            >
              Proceed to Content Generation
            </button>
            <button 
              onClick={() => {
                console.log('Saving analysis:', analysisResult)
                // Implement save functionality
              }}
              className="px-8 py-4 bg-gray-100 text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Save Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  )
}