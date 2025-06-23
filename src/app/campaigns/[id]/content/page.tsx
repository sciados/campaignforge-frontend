// src/app/campaigns/[id]/content/page.tsx
'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Download, 
  Edit3, 
  Eye, 
  Copy, 
  MoreHorizontal,
  Mail,
  FileText,
  Video,
  Image,
  Globe,
  TrendingUp,
  Search,
  Plus,
  ExternalLink,
  X
} from 'lucide-react'
import { useApi } from '@/lib/api'

// Local type definitions to avoid conflicts
interface ContentItem {
  id: string
  campaign_id: string
  content_type: string
  title: string
  content: string | any
  status: string
  quality_score?: number
  performance_metrics?: any
  created_at: string
  updated_at: string
  generation_parameters?: any
}

interface CampaignData {
  id: string
  title: string
  description: string
  target_audience?: string
  generated_content?: ContentItem[]
}

export default function CampaignContentPage() {
  const params = useParams()
  const router = useRouter()
  const api = useApi()
  
  const campaignId = params.id as string
  const [campaign, setCampaign] = useState<CampaignData | null>(null)
  const [content, setContent] = useState<ContentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null)
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

  const loadCampaignContent = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Load campaign details
      const campaignData = await api.getCampaign(campaignId)
      setCampaign(campaignData)
      console.log('📋 Campaign data:', campaignData)
      
      // Try multiple approaches to find generated content
      let foundContent: ContentItem[] = []
      
      // Approach 1: Check if campaign has generated_content (cast to any to avoid type conflicts)
      if ((campaignData as any).generated_content && Array.isArray((campaignData as any).generated_content)) {
        console.log('✅ Found generated content in campaign data')
        foundContent = (campaignData as any).generated_content
      }
      
      // Approach 2: Try getCampaignIntelligence 
      if (foundContent.length === 0) {
        try {
          const intelligence = await api.getCampaignIntelligence(campaignId)
          console.log('🧠 Intelligence response:', intelligence)
          
          if (intelligence?.generated_content && Array.isArray(intelligence.generated_content)) {
            console.log('✅ Found generated content in intelligence data')
            foundContent = intelligence.generated_content
          }
        } catch (intelligenceError) {
          console.warn('⚠️ Intelligence call failed:', intelligenceError)
        }
      }
      
      // Approach 3: Try a direct content endpoint (if it exists)
      if (foundContent.length === 0) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/campaigns/${campaignId}/content`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (response.ok) {
            const contentData = await response.json()
            console.log('✅ Found content via direct endpoint:', contentData)
            if (Array.isArray(contentData)) {
              foundContent = contentData
            } else if (contentData.content && Array.isArray(contentData.content)) {
              foundContent = contentData.content
            }
          }
        } catch (directError) {
          console.warn('⚠️ Direct content endpoint failed:', directError)
        }
      }
      
      setContent(foundContent)
      console.log(`📊 Final content count: ${foundContent.length}`)
      
    } catch (err) {
      console.error('❌ Failed to load campaign content:', err)
      setError(err instanceof Error ? err.message : 'Failed to load content')
    } finally {
      setIsLoading(false)
    }
  }, [campaignId, api])

  useEffect(() => {
    loadCampaignContent()
  }, [loadCampaignContent])

  const getContentIcon = (type: string) => {
    const icons: Record<string, any> = {
      'email': Mail,
      'email_series': Mail,
      'email_sequence': Mail,
      'social_post': Image,
      'social_posts': Image,
      'ad_copy': TrendingUp,
      'blog_post': FileText,
      'video_script': Video,
      'lead_magnet': Globe,
      'sales_material': FileText,
      'newsletter': Mail,
      'case_study': FileText,
      'whitepaper': FileText,
      'presentation': FileText,
      'landing_page': Globe
    }
    return icons[type] || FileText
  }

  const getContentColor = (type: string) => {
    const colors: Record<string, string> = {
      'email': 'bg-blue-100 text-blue-800 border-blue-200',
      'email_series': 'bg-blue-100 text-blue-800 border-blue-200',
      'email_sequence': 'bg-blue-100 text-blue-800 border-blue-200',
      'social_post': 'bg-pink-100 text-pink-800 border-pink-200',
      'social_posts': 'bg-pink-100 text-pink-800 border-pink-200',
      'ad_copy': 'bg-green-100 text-green-800 border-green-200',
      'blog_post': 'bg-purple-100 text-purple-800 border-purple-200',
      'video_script': 'bg-red-100 text-red-800 border-red-200',
      'lead_magnet': 'bg-orange-100 text-orange-800 border-orange-200',
      'sales_material': 'bg-gray-100 text-gray-800 border-gray-200',
      'newsletter': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'case_study': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'whitepaper': 'bg-teal-100 text-teal-800 border-teal-200',
      'presentation': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'landing_page': 'bg-orange-100 text-orange-800 border-orange-200'
    }
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const formatContentType = (type: string) => {
    const formatted: Record<string, string> = {
      'email': 'Email',
      'email_series': 'Email Series',
      'email_sequence': 'Email Sequence',
      'social_post': 'Social Media Post',
      'social_posts': 'Social Media Posts',
      'ad_copy': 'Ad Copy',
      'blog_post': 'Blog Post',
      'video_script': 'Video Script',
      'lead_magnet': 'Lead Magnet',
      'sales_material': 'Sales Material',
      'newsletter': 'Newsletter',
      'case_study': 'Case Study',
      'whitepaper': 'Whitepaper',
      'presentation': 'Presentation',
      'landing_page': 'Landing Page'
    }
    return formatted[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getContentCategories = () => {
    // Use Array.from to convert Set to Array for better compatibility
    const uniqueTypes = Array.from(new Set(content.map(c => c.content_type)))
    const categories = ['all', ...uniqueTypes]
    
    return categories.map(cat => ({
      value: cat,
      label: cat === 'all' ? 'All Content' : formatContentType(cat),
      count: cat === 'all' ? content.length : content.filter(c => c.content_type === cat).length
    }))
  }

  const filteredContent = content.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.content_type === selectedCategory
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof item.content === 'string' ? item.content : JSON.stringify(item.content)).toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesCategory && matchesSearch
  })

  const handleCopyContent = async (content: ContentItem) => {
    try {
      const textContent = typeof content.content === 'string' 
        ? content.content 
        : JSON.stringify(content.content, null, 2)
      
      await navigator.clipboard.writeText(textContent)
      
      // Show temporary success message
      const button = document.getElementById(`copy-${content.id}`)
      if (button) {
        const originalText = button.innerHTML
        button.innerHTML = '<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg> Copied!'
        setTimeout(() => {
          button.innerHTML = originalText
        }, 2000)
      }
    } catch (err) {
      console.error('Failed to copy content:', err)
    }
  }

  const handleDownloadContent = (content: ContentItem) => {
    const textContent = typeof content.content === 'string' 
      ? content.content 
      : JSON.stringify(content.content, null, 2)
    
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

  const handleDownloadAll = () => {
    const allContent = filteredContent.map(item => {
      const textContent = typeof item.content === 'string' 
        ? item.content 
        : JSON.stringify(item.content, null, 2)
      
      return `\n\n=== ${item.title} ===\nType: ${formatContentType(item.content_type)}\nCreated: ${new Date(item.created_at).toLocaleDateString()}\n\n${textContent}`
    }).join('\n')
    
    const blob = new Blob([`Campaign: ${campaign?.title}\n\n${allContent}`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${campaign?.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_all_content.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const openContentModal = (content: ContentItem) => {
    setSelectedContent(content)
    setEditedContent(
      typeof content.content === 'string' 
        ? content.content 
        : JSON.stringify(content.content, null, 2)
    )
    setIsEditing(false)
  }

  const saveEditedContent = async () => {
    if (!selectedContent) return
    
    try {
      const updatedContent = content.map(item => 
        item.id === selectedContent.id 
          ? {
              ...item,
              content: editedContent,
              updated_at: new Date().toISOString()
            }
          : item
      )
      
      setContent(updatedContent)
      setIsEditing(false)
      setSelectedContent(null)
      
    } catch (err) {
      console.error('Failed to save content:', err)
    }
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
          <button
            onClick={goBackToCampaigns}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Campaigns
          </button>
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
                <p className="text-sm text-gray-500">{campaign.title} • {content.length} items</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleDownloadAll}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Download All</span>
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
              {content.length === 0 
                ? "No content has been generated for this campaign yet."
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
                    <div className="flex items-center space-x-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === 'published' ? 'bg-green-100 text-green-800' :
                        item.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                        item.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status}
                      </span>
                      {item.quality_score && (
                        <span className="text-xs text-purple-600">
                          {Math.round(item.quality_score * 100)}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 line-clamp-3">
                      {typeof item.content === 'string'
                        ? item.content.substring(0, 150) + (item.content.length > 150 ? '...' : '')
                        : 'Structured content available'
                      }
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>Created {new Date(item.created_at).toLocaleDateString()}</span>
                    {item.performance_metrics && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Analytics
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
                    {item.performance_metrics && (
                      <button
                        onClick={() => console.log('View analytics for:', item.id)}
                        className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <TrendingUp className="h-4 w-4" />
                      </button>
                    )}
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
                  {formatContentType(selectedContent.content_type)} • {selectedContent.status}
                  {selectedContent.quality_score && (
                    <span className="ml-2 text-purple-600">
                      Quality: {Math.round(selectedContent.quality_score * 100)}%
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedContent(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {isEditing ? (
                <div className="space-y-4">
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                    placeholder="Edit your content here..."
                  />
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveEditedContent}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                    {typeof selectedContent.content === 'string'
                      ? selectedContent.content
                      : JSON.stringify(selectedContent.content, null, 2)
                    }
                  </pre>
                  
                  {selectedContent.generation_parameters && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Generation Parameters:</h4>
                      <div className="text-sm text-blue-800 space-y-1">
                        {Object.entries(selectedContent.generation_parameters).map(([key, value]) => (
                          <div key={key}><strong>{key}:</strong> {String(value)}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedContent.performance_metrics && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Performance Metrics:</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm text-green-800">
                        {Object.entries(selectedContent.performance_metrics).map(([key, value]) => (
                          <div key={key}><strong>{key}:</strong> {typeof value === 'number' ? Math.round(value * 100) + '%' : String(value)}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}