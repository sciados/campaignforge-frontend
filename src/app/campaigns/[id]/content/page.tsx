// src/app/campaigns/[id]/content/page.tsx - FIXED TO MATCH BACKEND
'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Download, 
  Edit3, 
  Eye, 
  Copy, 
  Mail,
  FileText,
  Video,
  Image,
  Globe,
  TrendingUp,
  Search,
  Plus,
  X,
  RefreshCw
} from 'lucide-react'
import { useApi } from '@/lib/api'

// ✅ FIXED: Match the actual backend response structure
interface GeneratedContentItem {
  id: string
  content_type: string
  content_title: string
  created_at: string
  user_rating?: number
  is_published?: boolean
  performance_data?: any
}

interface IntelligenceSource {
  id: string
  source_title: string
  source_url?: string  // ✅ FIXED: Make optional to match API
  source_type: string
  confidence_score: number
  analysis_status: string
  created_at: string
  // ✅ FIXED: Include intelligence data from backend
  offer_intelligence?: any
  psychology_intelligence?: any
  content_intelligence?: any
  competitive_intelligence?: any
  brand_intelligence?: any
}

interface CampaignIntelligenceResponse {
  campaign_id: string
  intelligence_sources: IntelligenceSource[]
  generated_content: GeneratedContentItem[]
  summary: {
    total_intelligence_sources: number
    total_generated_content: number
    avg_confidence_score: number
  }
}

interface CampaignData {
  id: string
  title: string
  description: string
  target_audience?: string
}

export default function FixedCampaignContentPage() {
  const params = useParams()
  const router = useRouter()
  const api = useApi()
  
  const campaignId = params.id as string
  const [campaign, setCampaign] = useState<CampaignData | null>(null)
  const [intelligenceData, setIntelligenceData] = useState<CampaignIntelligenceResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedContent, setSelectedContent] = useState<any | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState('')

  // Navigation functions
  const goBackToCampaign = () => {
    router.push(`/campaigns/${campaignId}`)
  }

  const goToGenerateMore = () => {
    router.push(`/campaigns/${campaignId}?step=4`)
  }

  const goBackToCampaigns = () => {
    router.push('/campaigns')
  }

  // ✅ FIXED: Simplified load function that matches backend exactly
  const loadCampaignContent = useCallback(async () => {
    if (!campaignId || isLoading) return

    try {
      console.log('🔄 Loading campaign content for:', campaignId)
      setIsLoading(true)
      setError(null)
      
      // Load campaign details
      const campaignData = await api.getCampaign(campaignId)
      setCampaign(campaignData)
      console.log('✅ Campaign loaded:', campaignData.title)
      
      // ✅ FIXED: Use the correct intelligence endpoint that actually exists
      const intelligence = await api.getCampaignIntelligence(campaignId)
      setIntelligenceData(intelligence)
      
      console.log('✅ Intelligence loaded:', {
        sources: intelligence.intelligence_sources?.length || 0,
        content: intelligence.generated_content?.length || 0
      })
      
    } catch (err) {
      console.error('❌ Failed to load campaign content:', err)
      setError(err instanceof Error ? err.message : 'Failed to load content')
    } finally {
      setIsLoading(false)
    }
  }, [campaignId, isLoading, api])

  const refreshContent = useCallback(async () => {
    setIsLoading(true)
    await loadCampaignContent()
  }, [loadCampaignContent])

  useEffect(() => {
    if (campaignId) {
      loadCampaignContent()
    }
  }, [campaignId, loadCampaignContent])

  // ✅ FIXED: Work with actual generated content structure
  const getDisplayContent = () => {
    if (!intelligenceData) return []
    
    // Convert both intelligence sources and generated content to display format
    const displayItems: any[] = []
    
    // Add intelligence sources as viewable content
    intelligenceData.intelligence_sources?.forEach(source => {
      displayItems.push({
        id: source.id,
        type: 'intelligence',
        title: source.source_title || 'Intelligence Source',
        content_type: 'intelligence_source',
        created_at: source.created_at,
        confidence_score: source.confidence_score,
        source_url: source.source_url,
        data: {
          offer_intelligence: source.offer_intelligence,
          psychology_intelligence: source.psychology_intelligence,
          content_intelligence: source.content_intelligence,
          competitive_intelligence: source.competitive_intelligence,
          brand_intelligence: source.brand_intelligence
        }
      })
    })
    
    // Add generated content
    intelligenceData.generated_content?.forEach(content => {
      displayItems.push({
        id: content.id,
        type: 'generated_content',
        title: content.content_title || 'Generated Content',
        content_type: content.content_type,
        created_at: content.created_at,
        user_rating: content.user_rating,
        is_published: content.is_published,
        performance_data: content.performance_data
      })
    })
    
    return displayItems
  }

  const getContentIcon = (type: string) => {
    const icons: Record<string, any> = {
      'intelligence_source': TrendingUp,
      'email': Mail,
      'email_series': Mail,
      'email_sequence': Mail,
      'social_post': Image,
      'social_posts': Image,
      'ad_copy': TrendingUp,
      'blog_post': FileText,
      'video_script': Video,
      'lead_magnet': Globe,
      'sales_material': FileText
    }
    return icons[type] || FileText
  }

  const getContentColor = (type: string) => {
    const colors: Record<string, string> = {
      'intelligence_source': 'bg-purple-100 text-purple-800 border-purple-200',
      'email': 'bg-blue-100 text-blue-800 border-blue-200',
      'email_series': 'bg-blue-100 text-blue-800 border-blue-200',
      'email_sequence': 'bg-blue-100 text-blue-800 border-blue-200',
      'social_post': 'bg-pink-100 text-pink-800 border-pink-200',
      'social_posts': 'bg-pink-100 text-pink-800 border-pink-200',
      'ad_copy': 'bg-green-100 text-green-800 border-green-200',
      'blog_post': 'bg-purple-100 text-purple-800 border-purple-200',
      'video_script': 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const formatContentType = (type: string) => {
    const formatted: Record<string, string> = {
      'intelligence_source': 'Intelligence Source',
      'email': 'Email',
      'email_series': 'Email Series',
      'email_sequence': 'Email Sequence',
      'social_post': 'Social Media Post',
      'social_posts': 'Social Media Posts',
      'ad_copy': 'Ad Copy',
      'blog_post': 'Blog Post',
      'video_script': 'Video Script'
    }
    return formatted[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getContentCategories = () => {
    const content = getDisplayContent()
    const uniqueTypes = Array.from(new Set(content.map(c => c.content_type)))
    const categories = ['all', ...uniqueTypes]
    
    return categories.map(cat => ({
      value: cat,
      label: cat === 'all' ? 'All Content' : formatContentType(cat),
      count: cat === 'all' ? content.length : content.filter(c => c.content_type === cat).length
    }))
  }

  const filteredContent = getDisplayContent().filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.content_type === selectedCategory
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content_type.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesCategory && matchesSearch
  })

  const handleCopyContent = async (content: any) => {
    try {
      let textContent = ''
      
      if (content.type === 'intelligence') {
        // Format intelligence data for copying
        const data = content.data || {}
        textContent = `Intelligence Source: ${content.title}\n\n`
        
        if (data.offer_intelligence?.value_propositions) {
          textContent += `Value Propositions:\n${data.offer_intelligence.value_propositions.join('\n')}\n\n`
        }
        
        if (data.psychology_intelligence?.emotional_triggers) {
          textContent += `Emotional Triggers:\n${data.psychology_intelligence.emotional_triggers.join('\n')}\n\n`
        }
      } else {
        textContent = `${content.title}\n\nType: ${formatContentType(content.content_type)}`
      }
      
      await navigator.clipboard.writeText(textContent)
      
      // Show success feedback
      const button = document.getElementById(`copy-${content.id}`)
      if (button) {
        const originalText = button.innerHTML
        button.innerHTML = '✓ Copied!'
        setTimeout(() => {
          button.innerHTML = originalText
        }, 2000)
      }
    } catch (err) {
      console.error('Failed to copy content:', err)
    }
  }

  const handleDownloadContent = (content: any) => {
    let textContent = ''
    
    if (content.type === 'intelligence') {
      const data = content.data || {}
      textContent = `Intelligence Source: ${content.title}\n\n`
      textContent += `Source URL: ${content.source_url || 'N/A'}\n`
      textContent += `Confidence Score: ${content.confidence_score || 'N/A'}\n\n`
      textContent += JSON.stringify(data, null, 2)
    } else {
      textContent = `${content.title}\n\nType: ${formatContentType(content.content_type)}\nCreated: ${new Date(content.created_at).toLocaleDateString()}`
    }
    
    const blob = new Blob([textContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${content.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const openContentModal = (content: any) => {
    setSelectedContent(content)
    
    if (content.type === 'intelligence') {
      setEditedContent(JSON.stringify(content.data, null, 2))
    } else {
      setEditedContent(content.title)
    }
    
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaign content...</p>
        </div>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Content</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex space-x-3 justify-center">
            <button
              onClick={refreshContent}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={goBackToCampaigns}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Back to Campaigns
            </button>
          </div>
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
                onClick={goBackToCampaign}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Content Library</h1>
                <p className="text-sm text-gray-500">
                  {campaign.title} • {filteredContent.length} items
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={refreshContent}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
              <button
                onClick={goToGenerateMore}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Generate More</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {getContentCategories().map(category => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    selectedCategory === category.value
                      ? 'bg-purple-100 border-purple-300 text-purple-800'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category.label} ({category.count})
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full lg:w-64"
              />
            </div>
          </div>
        </div>

        {/* Content Grid */}
        {filteredContent.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Found</h3>
            <p className="text-gray-600 mb-4">
              {getDisplayContent().length === 0 
                ? "No content or intelligence sources have been created for this campaign yet."
                : "No content matches your current filters."
              }
            </p>
            <button
              onClick={goToGenerateMore}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Generate Content
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.map((item) => {
              const Icon = getContentIcon(item.content_type)
              const colorClass = getContentColor(item.content_type)
              
              return (
                <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${colorClass}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {item.title}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {formatContentType(item.content_type)}
                        </p>
                      </div>
                    </div>
                    {item.confidence_score && (
                      <span className="text-xs text-purple-600">
                        {Math.round(item.confidence_score * 100)}%
                      </span>
                    )}
                  </div>

                  {/* Content Preview */}
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 line-clamp-3">
                      {item.type === 'intelligence' 
                        ? `Intelligence source with ${Object.keys(item.data || {}).length} analysis types`
                        : `Generated ${formatContentType(item.content_type)}`
                      }
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>Created {new Date(item.created_at).toLocaleDateString()}</span>
                    {item.is_published && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                        Published
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openContentModal(item)}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                    <button
                      id={`copy-${item.id}`}
                      onClick={() => handleCopyContent(item)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDownloadContent(item)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Content Modal */}
      {selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedContent.title}
                </h2>
                <p className="text-sm text-gray-500">
                  {formatContentType(selectedContent.content_type)}
                  {selectedContent.confidence_score && (
                    <span className="ml-2 text-purple-600">
                      Confidence: {Math.round(selectedContent.confidence_score * 100)}%
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={() => setSelectedContent(null)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                  {selectedContent.type === 'intelligence' 
                    ? JSON.stringify(selectedContent.data, null, 2)
                    : `Content Type: ${selectedContent.content_type}\nCreated: ${new Date(selectedContent.created_at).toLocaleDateString()}\n\nThis is generated content. Full content details would be loaded from the specific content endpoint.`
                  }
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}