// src/components/input-sources/UniversalInputCollector.tsx
import React, { useState, useCallback, useRef } from 'react'
import { 
  Upload, 
  Globe, 
  Video, 
  FileText, 
  Database,
  Loader2, 
  CheckCircle, 
  AlertCircle,
  X,
  Plus,
  ExternalLink,
  Paperclip,
  Zap,
  Brain,
  Target,
  Sparkles,
  Clock
} from 'lucide-react'
import { useApi } from '@/lib/api'

interface InputSource {
  id: string
  type: 'url' | 'file' | 'video' | 'data'
  name: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  url?: string
  file?: File
  size?: number
  extractedData?: any
  intelligence?: any
  error?: string
  createdAt: Date
}

interface UniversalInputCollectorProps {
  campaignId: string
  onSourceAdded: (source: InputSource) => void
  onIntelligenceGenerated: (intelligence: any) => void
  existingSources?: InputSource[]
}

export default function UniversalInputCollector({ 
  campaignId, 
  onSourceAdded, 
  onIntelligenceGenerated,
  existingSources = []
}: UniversalInputCollectorProps) {
  const api = useApi()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [activeInputType, setActiveInputType] = useState<'url' | 'file' | 'batch'>('url')
  const [sources, setSources] = useState<InputSource[]>(existingSources)
  const [isProcessing, setIsProcessing] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  
  // URL Input State
  const [urlInput, setUrlInput] = useState('')
  const [urlType, setUrlType] = useState<'sales_page' | 'website' | 'video' | 'social'>('sales_page')
  
  // Batch Input State
  const [batchUrls, setBatchUrls] = useState('')

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2)

  // Helper function to update source progress - moved before other functions that use it
  const updateSourceProgress = useCallback((sourceId: string, progress: number, status?: string) => {
    setSources(prev => prev.map(source => 
      source.id === sourceId 
        ? { ...source, progress }
        : source
    ))
  }, [])

  // URL Processing
  const processUrl = useCallback(async (url: string, type: string = urlType) => {
    const sourceId = generateId()
    const newSource: InputSource = {
      id: sourceId,
      type: 'url',
      name: url,
      status: 'processing',
      progress: 0,
      url: url,
      createdAt: new Date()
    }
    
    setSources(prev => [...prev, newSource])
    onSourceAdded(newSource)
    setIsProcessing(true)
    
    try {
      // Step 1: Validate URL
      updateSourceProgress(sourceId, 10, 'Validating URL...')
      
      // Step 2: Analyze content
      updateSourceProgress(sourceId, 30, 'Extracting content...')
      
      const intelligence = await api.analyzeURL({
        url: url,
        campaign_id: campaignId,
        analysis_type: type
      })
      
      // Step 3: Process intelligence
      updateSourceProgress(sourceId, 70, 'Processing intelligence...')
      
      // Step 4: Complete
      updateSourceProgress(sourceId, 100, 'Complete')
      
      setSources(prev => prev.map(source => 
        source.id === sourceId 
          ? { 
              ...source, 
              status: 'completed',
              intelligence,
              extractedData: {
                title: `Analysis: ${new URL(url).hostname}`,
                confidence: intelligence.confidence_score,
                insights: intelligence.campaign_suggestions?.length || 0
              }
            }
          : source
      ))
      
      onIntelligenceGenerated(intelligence)
      
    } catch (error) {
      setSources(prev => prev.map(source => 
        source.id === sourceId 
          ? { 
              ...source, 
              status: 'error',
              error: error instanceof Error ? error.message : 'Analysis failed'
            }
          : source
      ))
    } finally {
      setIsProcessing(false)
    }
  }, [campaignId, urlType, api, onSourceAdded, onIntelligenceGenerated, updateSourceProgress])

  // File Processing
  const processFile = useCallback(async (file: File) => {
    const sourceId = generateId()
    const newSource: InputSource = {
      id: sourceId,
      type: 'file',
      name: file.name,
      status: 'processing',
      progress: 0,
      file: file,
      size: file.size,
      createdAt: new Date()
    }
    
    setSources(prev => [...prev, newSource])
    onSourceAdded(newSource)
    setIsProcessing(true)
    
    try {
      // Step 1: Upload file
      updateSourceProgress(sourceId, 20, 'Uploading file...')
      
      // Step 2: Process document
      updateSourceProgress(sourceId, 50, 'Processing document...')
      
      const result = await api.uploadDocument(file, campaignId)
      
      // Step 3: Extract intelligence
      updateSourceProgress(sourceId, 80, 'Extracting intelligence...')
      
      // Step 4: Complete
      updateSourceProgress(sourceId, 100, 'Complete')
      
      setSources(prev => prev.map(source => 
        source.id === sourceId 
          ? { 
              ...source, 
              status: 'completed',
              extractedData: {
                title: file.name,
                insights: result.insights_extracted,
                opportunities: result.content_opportunities?.length || 0
              }
            }
          : source
      ))
      
      // Generate intelligence format compatible with the system
      const intelligence = {
        intelligence_id: result.intelligence_id,
        confidence_score: 0.8,
        source_title: file.name,
        campaign_suggestions: result.content_opportunities,
        competitive_opportunities: result.content_opportunities.map((opp: string) => ({ description: opp }))
      }
      
      onIntelligenceGenerated(intelligence)
      
    } catch (error) {
      setSources(prev => prev.map(source => 
        source.id === sourceId 
          ? { 
              ...source, 
              status: 'error',
              error: error instanceof Error ? error.message : 'File processing failed'
            }
          : source
      ))
    } finally {
      setIsProcessing(false)
    }
  }, [campaignId, api, onSourceAdded, onIntelligenceGenerated, updateSourceProgress])

  // Batch URL Processing
  const processBatchUrls = useCallback(async () => {
    const urls = batchUrls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url && url.startsWith('http'))
    
    if (urls.length === 0) return
    
    setIsProcessing(true)
    
    for (const url of urls) {
      await processUrl(url)
      // Small delay between batch processing
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    setBatchUrls('')
    setIsProcessing(false)
  }, [batchUrls, processUrl])

  // Drag and Drop Handlers
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
    
    const files = Array.from(e.dataTransfer.files)
    files.forEach(file => processFile(file))
  }, [processFile])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => processFile(file))
  }, [processFile])

  const removeSource = useCallback((sourceId: string) => {
    setSources(prev => prev.filter(source => source.id !== sourceId))
  }, [])

  const retrySource = useCallback((source: InputSource) => {
    if (source.type === 'url' && source.url) {
      processUrl(source.url)
    } else if (source.type === 'file' && source.file) {
      processFile(source.file)
    }
  }, [processUrl, processFile])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Database className="h-6 w-6 mr-2 text-purple-600" />
          Universal Input Collector
        </h2>
        <p className="text-gray-600 mt-1">
          Add any content source to extract marketing intelligence and campaign insights
        </p>
      </div>

      {/* Input Type Selector */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
        <button
          onClick={() => setActiveInputType('url')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center ${
            activeInputType === 'url'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Globe className="h-4 w-4 mr-2" />
          URL Analysis
        </button>
        <button
          onClick={() => setActiveInputType('file')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center ${
            activeInputType === 'file'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Upload className="h-4 w-4 mr-2" />
          File Upload
        </button>
        <button
          onClick={() => setActiveInputType('batch')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center ${
            activeInputType === 'batch'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Target className="h-4 w-4 mr-2" />
          Batch Analysis
        </button>
      </div>

      {/* URL Input Tab */}
      {activeInputType === 'url' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Type
            </label>
            <select
              value={urlType}
              onChange={(e) => setUrlType(e.target.value as any)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isProcessing}
            >
              <option value="sales_page">Sales Page / Landing Page</option>
              <option value="website">General Website</option>
              <option value="video">Video Content (YouTube, Vimeo)</option>
              <option value="social">Social Media Content</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL to Analyze
            </label>
            <div className="flex space-x-3">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://competitor-site.com/sales-page"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isProcessing}
                onKeyPress={(e) => e.key === 'Enter' && !isProcessing && urlInput.trim() && processUrl(urlInput.trim())}
              />
              <button
                onClick={() => urlInput.trim() && processUrl(urlInput.trim())}
                disabled={isProcessing || !urlInput.trim()}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Brain className="h-4 w-4 mr-2" />
                )}
                Analyze
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <Globe className="h-5 w-5 text-purple-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-purple-900">Sales Pages</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <Video className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-blue-900">Video Content</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <FileText className="h-5 w-5 text-green-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-green-900">Landing Pages</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-center">
              <ExternalLink className="h-5 w-5 text-orange-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-orange-900">Social Media</p>
            </div>
          </div>
        </div>
      )}

      {/* File Upload Tab */}
      {activeInputType === 'file' && (
        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-purple-400 bg-purple-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div>
              <p className="text-lg font-medium text-gray-900">
                Drop files here, or{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-purple-600 hover:text-purple-700 underline"
                  disabled={isProcessing}
                >
                  browse
                </button>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Supports: PDF, Word, PowerPoint, Excel, CSV, Text, Images
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.xlsx,.csv,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              disabled={isProcessing}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-red-50 rounded-lg p-4">
              <FileText className="h-6 w-6 text-red-600 mb-2" />
              <h3 className="font-medium text-red-900">Documents</h3>
              <p className="text-sm text-red-700">PDFs, Word, PowerPoint</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <Database className="h-6 w-6 text-green-600 mb-2" />
              <h3 className="font-medium text-green-900">Data Files</h3>
              <p className="text-sm text-green-700">CSV, Excel spreadsheets</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <Paperclip className="h-6 w-6 text-blue-600 mb-2" />
              <h3 className="font-medium text-blue-900">Other</h3>
              <p className="text-sm text-blue-700">Text files, images</p>
            </div>
          </div>
        </div>
      )}

      {/* Batch Analysis Tab */}
      {activeInputType === 'batch' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Multiple URLs (one per line)
            </label>
            <textarea
              value={batchUrls}
              onChange={(e) => setBatchUrls(e.target.value)}
              placeholder={`https://competitor1.com/sales-page
https://competitor2.com/landing-page
https://competitor3.com/offer-page`}
              rows={6}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isProcessing}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {batchUrls.split('\n').filter(url => url.trim() && url.startsWith('http')).length} URLs detected
            </div>
            <button
              onClick={processBatchUrls}
              disabled={isProcessing || !batchUrls.trim()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Analyze All
            </button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <Sparkles className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-900">Batch Analysis Benefits</h3>
                <ul className="text-sm text-yellow-800 mt-1 space-y-1">
                  <li>• Compare multiple competitors simultaneously</li>
                  <li>• Identify market gaps and opportunities</li>
                  <li>• Generate consolidated campaign strategies</li>
                  <li>• Discover common industry patterns</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sources List */}
      {sources.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Input Sources ({sources.length})</h3>
          <div className="space-y-3">
            {sources.map((source) => (
              <InputSourceCard
                key={source.id}
                source={source}
                onRemove={() => removeSource(source.id)}
                onRetry={() => retrySource(source)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Individual Source Card Component
interface InputSourceCardProps {
  source: InputSource
  onRemove: () => void
  onRetry: () => void
}

function InputSourceCard({ source, onRemove, onRetry }: InputSourceCardProps) {
  const getSourceIcon = () => {
    switch (source.type) {
      case 'url': return <Globe className="h-5 w-5" />
      case 'file': return <FileText className="h-5 w-5" />
      case 'video': return <Video className="h-5 w-5" />
      default: return <Database className="h-5 w-5" />
    }
  }

  const getStatusColor = () => {
    switch (source.status) {
      case 'completed': return 'text-green-600'
      case 'processing': return 'text-blue-600'
      case 'error': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = () => {
    switch (source.status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'processing': return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
      case 'error': return <AlertCircle className="h-5 w-5 text-red-600" />
      default: return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div className={getStatusColor()}>
            {getSourceIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate">{source.name}</h4>
            <div className="flex items-center space-x-4 mt-1">
              <span className={`text-sm ${getStatusColor()}`}>
                {source.status.charAt(0).toUpperCase() + source.status.slice(1)}
              </span>
              {source.size && (
                <span className="text-sm text-gray-500">
                  {(source.size / 1024 / 1024).toFixed(2)} MB
                </span>
              )}
              {source.extractedData && (
                <span className="text-sm text-purple-600">
                  {source.extractedData.insights || source.extractedData.opportunities || 0} insights
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <div className="flex space-x-1">
              {source.status === 'error' && (
                <button
                  onClick={onRetry}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="Retry"
                >
                  <Plus className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={onRemove}
                className="p-1 text-gray-400 hover:text-red-600"
                title="Remove"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      {source.status === 'processing' && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${source.progress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {source.status === 'error' && source.error && (
        <div className="mt-3 text-sm text-red-600 bg-red-50 rounded p-2">
          {source.error}
        </div>
      )}
      
      {/* Success Summary */}
      {source.status === 'completed' && source.extractedData && (
        <div className="mt-3 text-sm text-green-700 bg-green-50 rounded p-2">
          Successfully extracted {source.extractedData.insights || source.extractedData.opportunities || 'valuable'} insights
          {source.extractedData.confidence && ` with ${Math.round(source.extractedData.confidence * 100)}% confidence`}
        </div>
      )}
    </div>
  )
}