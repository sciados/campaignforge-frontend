'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Upload, 
  Link, 
  Video, 
  FileText, 
  Globe, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  Loader2,
  AlertCircle,
  X,
  Plus
} from 'lucide-react'

interface SourceItem {
  id: string
  type: 'url' | 'file' | 'video'
  name: string
  status: 'pending' | 'analyzing' | 'completed' | 'error'
  data?: any
  error?: string
}

interface CampaignStep2Props {
  campaignId: string
}

export default function CampaignStep2({ campaignId }: CampaignStep2Props) {
  const router = useRouter()
  const [sources, setSources] = useState<SourceItem[]>([])
  const [activeTab, setActiveTab] = useState<'url' | 'upload' | 'video'>('url')
  const [urlInput, setUrlInput] = useState('')
  const [videoUrlInput, setVideoUrlInput] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [campaign, setCampaign] = useState<any>(null)
  const [error, setError] = useState('')

  // Load campaign data
  useEffect(() => {
    const loadCampaign = async () => {
      try {
        const token = localStorage.getItem('authToken')
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://campaign-backend-production-e2db.up.railway.app'

        const response = await fetch(`${API_BASE_URL}/api/campaigns/${campaignId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (response.ok) {
          const campaignData = await response.json()
          setCampaign(campaignData)
        }
      } catch (error) {
        console.error('Failed to load campaign:', error)
      }
    }

    if (campaignId) {
      loadCampaign()
    }
  }, [campaignId])

  const addUrlSource = async () => {
    if (!urlInput.trim()) return

    const newSource: SourceItem = {
      id: Date.now().toString(),
      type: 'url',
      name: urlInput,
      status: 'analyzing'
    }

    setSources(prev => [...prev, newSource])
    setUrlInput('')
    setIsProcessing(true)

    try {
      const token = localStorage.getItem('authToken')
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://campaign-backend-production-e2db.up.railway.app'

      const response = await fetch(`${API_BASE_URL}/api/intelligence/analyze-url`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: urlInput,
          campaign_id: campaignId,
          analysis_type: 'sales_page'
        })
      })

      if (response.ok) {
        const result = await response.json()
        setSources(prev => prev.map(source => 
          source.id === newSource.id 
            ? { ...source, status: 'completed', data: result }
            : source
        ))
      } else {
        const errorData = await response.json()
        setSources(prev => prev.map(source => 
          source.id === newSource.id 
            ? { ...source, status: 'error', error: errorData.detail || 'Analysis failed' }
            : source
        ))
      }
    } catch (error) {
      setSources(prev => prev.map(source => 
        source.id === newSource.id 
          ? { ...source, status: 'error', error: 'Network error' }
          : source
      ))
    } finally {
      setIsProcessing(false)
    }
  }

  const addVideoSource = async () => {
    if (!videoUrlInput.trim()) return

    const newSource: SourceItem = {
      id: Date.now().toString(),
      type: 'video',
      name: videoUrlInput,
      status: 'analyzing'
    }

    setSources(prev => [...prev, newSource])
    setVideoUrlInput('')
    setIsProcessing(true)

    try {
      const token = localStorage.getItem('authToken')
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://campaign-backend-production-e2db.up.railway.app'

      const response = await fetch(`${API_BASE_URL}/api/intelligence/analyze-video`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          video_url: videoUrlInput,
          campaign_id: campaignId,
          analysis_type: 'video_content'
        })
      })

      if (response.ok) {
        const result = await response.json()
        setSources(prev => prev.map(source => 
          source.id === newSource.id 
            ? { ...source, status: 'completed', data: result }
            : source
        ))
      } else {
        const errorData = await response.json()
        setSources(prev => prev.map(source => 
          source.id === newSource.id 
            ? { ...source, status: 'error', error: errorData.detail || 'Video analysis failed' }
            : source
        ))
      }
    } catch (error) {
      setSources(prev => prev.map(source => 
        source.id === newSource.id 
          ? { ...source, status: 'error', error: 'Network error' }
          : source
      ))
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileUpload = async (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const newSource: SourceItem = {
        id: Date.now().toString() + i,
        type: 'file',
        name: file.name,
        status: 'analyzing'
      }

      setSources(prev => [...prev, newSource])

      try {
        const token = localStorage.getItem('authToken')
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://campaign-backend-production-e2db.up.railway.app'

        const formData = new FormData()
        formData.append('file', file)
        formData.append('campaign_id', campaignId)

        const response = await fetch(`${API_BASE_URL}/api/intelligence/upload-document`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        })

        if (response.ok) {
          const result = await response.json()
          setSources(prev => prev.map(source => 
            source.id === newSource.id 
              ? { ...source, status: 'completed', data: result }
              : source
          ))
        } else {
          const errorData = await response.json()
          setSources(prev => prev.map(source => 
            source.id === newSource.id 
              ? { ...source, status: 'error', error: errorData.detail || 'Upload failed' }
              : source
          ))
        }
      } catch (error) {
        setSources(prev => prev.map(source => 
          source.id === newSource.id 
            ? { ...source, status: 'error', error: 'Network error' }
            : source
        ))
      }
    }
  }

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const removeSource = (sourceId: string) => {
    setSources(prev => prev.filter(source => source.id !== sourceId))
  }

  const proceedToNextStep = () => {
    const completedSources = sources.filter(s => s.status === 'completed')
    if (completedSources.length === 0) {
      setError('Please add at least one successful analysis before proceeding')
      return
    }
    
    router.push(`/campaigns/${campaignId}/step-3`)
  }

  const goBackToStep1 = () => {
    router.push(`/campaigns/${campaignId}/step-1`)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {campaign?.title || 'Campaign Setup'}
              </h1>
              <p className="text-gray-600 mt-2">Step 2 of 3: Add input sources for AI analysis</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <span className="text-sm text-green-600 font-medium">Setup</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
                <span className="text-sm text-purple-600 font-medium">Input Sources</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm">3</div>
                <span className="text-sm text-gray-500">Generate Content</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
              <button 
                onClick={() => setError('')}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Input Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'url'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Globe className="h-4 w-4 inline mr-2" />
              Sales Pages & Websites
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'upload'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Upload className="h-4 w-4 inline mr-2" />
              Upload Documents
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'video'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Video className="h-4 w-4 inline mr-2" />
              Video URLs
            </button>
          </div>

          {/* URL Input Tab */}
          {activeTab === 'url' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Sales Page or Website URL
                </label>
                <div className="flex space-x-3">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/sales-page"
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && addUrlSource()}
                  />
                  <button
                    onClick={addUrlSource}
                    disabled={!urlInput.trim() || isProcessing}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Analyze
                  </button>
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">What we can analyze:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Sales pages and landing pages</li>
                  <li>• salespage websites and product pages</li>
                  <li>• Marketing campaigns and promotions</li>
                  <li>• Blog posts and content pages</li>
                </ul>
              </div>
            </div>
          )}

          {/* File Upload Tab */}
          {activeTab === 'upload' && (
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
                <Upload className={`mx-auto h-12 w-12 ${dragActive ? 'text-purple-500' : 'text-gray-400'}`} />
                <p className="mt-2 text-lg font-medium text-gray-900">
                  Drop files here or click to upload
                </p>
                <p className="text-sm text-gray-600">
                  Support for PDF, DOCX, PPTX, TXT files
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
                  className="mt-4 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Files
                </label>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">Supported document types:</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• PDF documents and reports</li>
                  <li>• Word documents (.doc, .docx)</li>
                  <li>• PowerPoint presentations (.ppt, .pptx)</li>
                  <li>• Text files and markdown</li>
                </ul>
              </div>
            </div>
          )}

          {/* Video Input Tab */}
          {activeTab === 'video' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Video URL
                </label>
                <div className="flex space-x-3">
                  <input
                    type="url"
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && addVideoSource()}
                  />
                  <button
                    onClick={addVideoSource}
                    disabled={!videoUrlInput.trim() || isProcessing}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Analyze
                  </button>
                </div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="font-medium text-yellow-900 mb-2">Supported video platforms:</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• YouTube videos and tutorials</li>
                  <li>• Vimeo presentations</li>
                  <li>• Direct video file URLs</li>
                  <li>• Marketing and demo videos</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Sources List */}
        {sources.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Analysis Sources ({sources.length})
            </h3>
            <div className="space-y-3">
              {sources.map((source) => (
                <div
                  key={source.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {source.type === 'url' && <Globe className="h-5 w-5 text-blue-500" />}
                      {source.type === 'file' && <FileText className="h-5 w-5 text-green-500" />}
                      {source.type === 'video' && <Video className="h-5 w-5 text-red-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {source.name}
                      </p>
                      {source.error && (
                        <p className="text-sm text-red-600">{source.error}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {source.status === 'analyzing' && (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      )}
                      {source.status === 'completed' && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      {source.status === 'error' && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="ml-2 text-sm text-gray-600 capitalize">
                        {source.status}
                      </span>
                    </div>
                    <button
                      onClick={() => removeSource(source.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={goBackToStep1}
            className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Setup
          </button>
          
          <button
            onClick={proceedToNextStep}
            disabled={sources.filter(s => s.status === 'completed').length === 0}
            className="flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Content Generation
            <ArrowRight className="h-5 w-5 ml-2" />
          </button>
        </div>
      </div>
    </div>
  )
}