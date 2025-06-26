// src/app/campaigns/[id]/content/page.tsx - ENHANCED CONTENT VIEW/EDIT
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
  RefreshCw,
  Save,
  Undo,
  ExternalLink,
  Star,
  Target,
  Zap
} from 'lucide-react'
import { useApi } from '@/lib/api'
import { MoreHorizontal, Trash2 } from 'lucide-react'

// ✅ ENHANCED: Content types with proper structure
interface GeneratedContentItem {
  id: string
  content_type: string
  content_title: string
  content_body: string // JSON string containing the actual content
  content_metadata: any
  generation_settings: any
  intelligence_used: any
  performance_data?: any
  user_rating?: number
  is_published?: boolean
  published_at?: string
  created_at: string
  updated_at?: string
  // Amplification context
  amplification_context?: {
    generated_from_amplified_intelligence: boolean
    amplification_metadata: any
  }
}

interface IntelligenceSource {
  id: string
  source_title: string
  source_url?: string
  source_type: string
  confidence_score: number
  analysis_status: string
  created_at: string
  offer_intelligence?: any
  psychology_intelligence?: any
  content_intelligence?: any
  competitive_intelligence?: any
  brand_intelligence?: any
  amplification_status?: {
    is_amplified: boolean
    confidence_boost: number
    scientific_enhancements: number
    credibility_score: number
  }
}

interface CampaignIntelligenceResponse {
  campaign_id: string
  intelligence_sources: IntelligenceSource[]
  generated_content: GeneratedContentItem[]
  summary: {
    total_intelligence_sources: number
    total_generated_content: number
    avg_confidence_score: number
    amplification_summary?: any
  }
}

interface CampaignData {
  id: string
  title: string
  description: string
  target_audience?: string
}

// ✅ ENHANCED: Parse content body based on content type
const parseContentBody = (contentBody: string, contentType: string) => {
  try {
    const parsed = JSON.parse(contentBody)
    return parsed
  } catch (error) {
    console.warn('Failed to parse content body as JSON:', error)
    return { raw_content: contentBody }
  }
}

// ✅ ENHANCED: Format content for display based on type
const formatContentForDisplay = (content: any, contentType: string) => {
  if (!content) return 'No content available'

  switch (contentType) {
    case 'email_sequence':
      if (content.emails && Array.isArray(content.emails)) {
        return content.emails.map((email: any, index: number) => ({
          type: 'email',
          title: `Email ${index + 1}: ${email.subject || 'No Subject'}`,
          content: email.body || 'No content',
          metadata: {
            subject: email.subject,
            preview: email.body?.substring(0, 100) + '...',
            email_number: email.email_number || index + 1
          }
        }))
      }
      break

    case 'social_media_posts':
    case 'social_posts':
      if (content.posts && Array.isArray(content.posts)) {
        return content.posts.map((post: any, index: number) => ({
          type: 'social_post',
          title: `${post.platform || 'Social'} Post ${index + 1}`,
          content: post.content || post.text || 'No content',
          metadata: {
            platform: post.platform,
            hashtags: post.hashtags,
            character_count: post.character_count,
            engagement_elements: post.engagement_elements
          }
        }))
      }
      break

    case 'ad_copy':
      if (content.ads && Array.isArray(content.ads)) {
        return content.ads.map((ad: any, index: number) => ({
          type: 'ad',
          title: `${ad.platform || 'Ad'} Copy ${index + 1}`,
          content: `**${ad.headline}**\n\n${ad.body}\n\n*CTA: ${ad.cta}*`,
          metadata: {
            platform: ad.platform,
            headline: ad.headline,
            body: ad.body,
            cta: ad.cta,
            target_audience: ad.target_audience
          }
        }))
      }
      break

    case 'blog_post':
      return [{
        type: 'blog_post',
        title: content.title || 'Blog Post',
        content: content.body || content.content || 'No content',
        metadata: {
          meta_description: content.meta_description,
          tags: content.tags,
          word_count: content.word_count
        }
      }]

    case 'landing_page':
      return [{
        type: 'landing_page',
        title: content.title || 'Landing Page',
        content: content.html || content.html_code || 'No HTML content',
        metadata: {
          page_type: content.page_type,
          sections: content.sections
        }
      }]

    case 'video_script':
      if (content.scenes && Array.isArray(content.scenes)) {
        return content.scenes.map((scene: any, index: number) => ({
          type: 'video_scene',
          title: `Scene ${scene.scene || index + 1}: ${scene.title}`,
          content: scene.script || 'No script',
          metadata: {
            duration: scene.duration,
            visual_notes: scene.visual_notes,
            scene_number: scene.scene
          }
        }))
      }
      break

    default:
      // Generic content handling
      if (typeof content === 'object') {
        return [{
          type: 'generic',
          title: content.title || `Generated ${contentType}`,
          content: content.content || content.body || JSON.stringify(content, null, 2),
          metadata: content.metadata || {}
        }]
      }
      return [{
        type: 'generic',
        title: `Generated ${contentType}`,
        content: String(content),
        metadata: {}
      }]
  }

  // Fallback
  return [{
    type: 'generic',
    title: `Generated ${contentType}`,
    content: JSON.stringify(content, null, 2),
    metadata: {}
  }]
}

export default function EnhancedCampaignContentPage() {
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
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Navigation functions
  const goBackToCampaign = () => {
    router.push(`/campaigns/${campaignId}`)
  }

  const goToGenerateMore = () => {
    router.push(`/campaigns/${campaignId}?step=4`)
  }

  // ✅ ENHANCED: Load campaign content
  const loadCampaignContent = useCallback(async () => {
    if (!campaignId || isLoading) return

    try {
      console.log('🔄 Loading enhanced campaign content for:', campaignId)
      setIsLoading(true)
      setError(null)
      
      // Load campaign details
      const campaignData = await api.getCampaign(campaignId)
      setCampaign(campaignData)
      console.log('✅ Campaign loaded:', campaignData.title)
      
      // Load intelligence and content
      const intelligence = await api.getCampaignIntelligence(campaignId)
      setIntelligenceData(intelligence)
      
      console.log('✅ Enhanced intelligence loaded:', {
        sources: intelligence.intelligence_sources?.length || 0,
        content: intelligence.generated_content?.length || 0,
        amplified_sources: intelligence.summary?.amplification_summary?.sources_amplified || 0
      })
      
    } catch (err) {
      console.error('❌ Failed to load campaign content:', err)
      setError(err instanceof Error ? err.message : 'Failed to load content')
    } finally {
      setIsLoading(false)
    }
  }, [campaignId, isLoading, api])

  useEffect(() => {
    if (campaignId) {
      loadCampaignContent()
    }
  }, [campaignId, loadCampaignContent])

  // ✅ ENHANCED: Get display content with proper parsing
  const getDisplayContent = () => {
    if (!intelligenceData) return []
    
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
        is_amplified: source.amplification_status?.is_amplified || false,
        amplification_boost: source.amplification_status?.confidence_boost || 0,
        data: {
          offer_intelligence: source.offer_intelligence,
          psychology_intelligence: source.psychology_intelligence,
          content_intelligence: source.content_intelligence,
          competitive_intelligence: source.competitive_intelligence,
          brand_intelligence: source.brand_intelligence
        }
      })
    })
    
    // ✅ ENHANCED: Add generated content with proper parsing
    intelligenceData.generated_content?.forEach(content => {
      const parsedContent = parseContentBody(content.content_body, content.content_type)
      const formattedContent = formatContentForDisplay(parsedContent, content.content_type)
      
      displayItems.push({
        id: content.id,
        type: 'generated_content',
        title: content.content_title || 'Generated Content',
        content_type: content.content_type,
        created_at: content.created_at,
        user_rating: content.user_rating,
        is_published: content.is_published,
        performance_data: content.performance_data,
        // ✅ ENHANCED: Include parsed content structure
        parsed_content: parsedContent,
        formatted_content: formattedContent,
        content_metadata: content.content_metadata,
        generation_settings: content.generation_settings,
        intelligence_used: content.intelligence_used,
        // Amplification context
        is_amplified_content: content.amplification_context?.generated_from_amplified_intelligence || false,
        amplification_metadata: content.amplification_context?.amplification_metadata || {}
      })
    })
    
    return displayItems
  }

  // ✅ ENHANCED: Content type icons and colors
  const getContentIcon = (type: string) => {
    const icons: Record<string, any> = {
      'intelligence_source': TrendingUp,
      'email_sequence': Mail,
      'social_media_posts': Image,
      'social_posts': Image,
      'ad_copy': Target,
      'blog_post': FileText,
      'landing_page': Globe,
      'video_script': Video
    }
    return icons[type] || FileText
  }

  const getContentColor = (type: string) => {
    const colors: Record<string, string> = {
      'intelligence_source': 'bg-purple-100 text-purple-800 border-purple-200',
      'email_sequence': 'bg-blue-100 text-blue-800 border-blue-200',
      'social_media_posts': 'bg-pink-100 text-pink-800 border-pink-200',
      'social_posts': 'bg-pink-100 text-pink-800 border-pink-200',
      'ad_copy': 'bg-green-100 text-green-800 border-green-200',
      'blog_post': 'bg-purple-100 text-purple-800 border-purple-200',
      'landing_page': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'video_script': 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const formatContentType = (type: string) => {
    const formatted: Record<string, string> = {
      'intelligence_source': 'Intelligence Source',
      'email_sequence': 'Email Sequence',
      'social_media_posts': 'Social Media Posts',
      'social_posts': 'Social Media Posts',
      'ad_copy': 'Ad Copy',
      'blog_post': 'Blog Post',
      'landing_page': 'Landing Page',
      'video_script': 'Video Script'
    }
    return formatted[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  // ✅ ENHANCED: Categories with counts
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

  // ✅ ENHANCED: Filtering with amplification status
  const filteredContent = getDisplayContent().filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.content_type === selectedCategory
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content_type.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesCategory && matchesSearch
  })

  // ✅ ENHANCED: Copy content with proper formatting
  const handleCopyContent = async (content: any) => {
    try {
      let textContent = ''
      
      if (content.type === 'intelligence') {
        const data = content.data || {}
        textContent = `Intelligence Source: ${content.title}\n\n`
        
        if (content.source_url) {
          textContent += `Source URL: ${content.source_url}\n`
        }
        
        if (content.is_amplified) {
          textContent += `🚀 AMPLIFIED INTELLIGENCE (Confidence Boost: +${(content.amplification_boost * 100).toFixed(0)}%)\n\n`
        }
        
        if (data.offer_intelligence?.value_propositions) {
          textContent += `Value Propositions:\n${data.offer_intelligence.value_propositions.join('\n')}\n\n`
        }
        
        if (data.psychology_intelligence?.emotional_triggers) {
          textContent += `Emotional Triggers:\n${data.psychology_intelligence.emotional_triggers.join('\n')}\n\n`
        }
      } else {
        // ✅ ENHANCED: Copy formatted content
        textContent = `${content.title}\n\nType: ${formatContentType(content.content_type)}\n\n`
        
        if (content.is_amplified_content) {
          textContent += `🚀 Generated from AMPLIFIED Intelligence\n\n`
        }
        
        if (content.formatted_content) {
          content.formatted_content.forEach((section: any, index: number) => {
            textContent += `${section.title}\n`
            textContent += `${'-'.repeat(section.title.length)}\n`
            textContent += `${section.content}\n\n`
          })
        }
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

  // ✅ ENHANCED: Download with proper formatting
  const handleDownloadContent = (content: any) => {
    let textContent = ''
    
    if (content.type === 'intelligence') {
      const data = content.data || {}
      textContent = `Intelligence Source: ${content.title}\n`
      textContent += `${'='.repeat(50)}\n\n`
      textContent += `Source URL: ${content.source_url || 'N/A'}\n`
      textContent += `Confidence Score: ${content.confidence_score || 'N/A'}\n`
      textContent += `Amplified: ${content.is_amplified ? 'Yes' : 'No'}\n`
      if (content.is_amplified) {
        textContent += `Confidence Boost: +${(content.amplification_boost * 100).toFixed(0)}%\n`
      }
      textContent += `\n${JSON.stringify(data, null, 2)}`
    } else {
      textContent = `${content.title}\n`
      textContent += `${'='.repeat(50)}\n\n`
      textContent += `Type: ${formatContentType(content.content_type)}\n`
      textContent += `Created: ${new Date(content.created_at).toLocaleDateString()}\n`
      textContent += `Amplified Intelligence: ${content.is_amplified_content ? 'Yes' : 'No'}\n\n`
      
      if (content.formatted_content) {
        content.formatted_content.forEach((section: any) => {
          textContent += `${section.title}\n`
          textContent += `${'-'.repeat(section.title.length)}\n`
          textContent += `${section.content}\n\n`
        })
      }
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

  // ✅ ENHANCED: Open content modal with proper display
  const openContentModal = (content: any) => {
    setSelectedContent(content)
    
    if (content.type === 'intelligence') {
      setEditedContent(JSON.stringify(content.data, null, 2))
    } else if (content.formatted_content) {
      // Create editable text from formatted content
      const editableText = content.formatted_content.map((section: any) => 
        `${section.title}\n${'-'.repeat(section.title.length)}\n${section.content}`
      ).join('\n\n')
      setEditedContent(editableText)
    } else {
      setEditedContent(content.title)
    }
    
    setIsEditing(false)
    setHasChanges(false)
  }

  // ✅ ENHANCED: Save content changes
  const handleSaveContent = async () => {
    if (!selectedContent || !hasChanges) return
    
    setIsSaving(true)
    try {
      // Here you would implement the actual save functionality
      // For now, we'll just simulate it
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In real implementation, you'd call:
      // await api.updateGeneratedContent(selectedContent.id, editedContent)
      
      setHasChanges(false)
      setIsEditing(false)
      
      // Refresh the content
      await loadCampaignContent()
      
    } catch (error) {
      console.error('Failed to save content:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle content editing
  const handleContentChange = (newContent: string) => {
    setEditedContent(newContent)
    setHasChanges(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading enhanced campaign content...</p>
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
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/campaigns')}
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
                <h1 className="text-xl font-semibold text-gray-900">Enhanced Content Library</h1>
                <p className="text-sm text-gray-500">
                  {campaign.title} • {filteredContent.length} items
                  {intelligenceData?.summary?.amplification_summary?.sources_amplified && intelligenceData.summary.amplification_summary.sources_amplified > 0 && (
                    <span className="ml-2 text-purple-600">
                      🚀 {intelligenceData.summary.amplification_summary.sources_amplified} amplified
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.location.reload()}
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
                      <div className={`p-2 rounded-lg ${colorClass} relative`}>
                        <Icon className="h-5 w-5" />
                        {(item.is_amplified || item.is_amplified_content) && (
                          <Zap className="h-3 w-3 text-purple-600 absolute -top-1 -right-1" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {item.title}
                          {(item.is_amplified || item.is_amplified_content) && (
                            <span className="ml-1 text-purple-600">🚀</span>
                          )}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {formatContentType(item.content_type)}
                        </p>
                      </div>
                    </div>
                    {item.confidence_score && (
                      <span className="text-xs text-purple-600">
                        {Math.round(item.confidence_score * 100)}%
                        {item.is_amplified && item.amplification_boost && (
                          <span className="text-green-600">
                            (+{Math.round(item.amplification_boost * 100)}%)
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Content Preview */}
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 line-clamp-3">
                      {item.type === 'intelligence' 
                        ? `Intelligence source with ${Object.keys(item.data || {}).length} analysis types`
                        : item.formatted_content 
                          ? `${item.formatted_content.length} section${item.formatted_content.length !== 1 ? 's' : ''} generated`
                          : `Generated ${formatContentType(item.content_type)}`
                      }
                      {item.is_amplified_content && (
                        <span className="block text-purple-600 text-xs mt-1">
                          ✨ Enhanced with amplified intelligence
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>Created {new Date(item.created_at).toLocaleDateString()}</span>
                    <div className="flex items-center space-x-2">
                      {item.user_rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span>{item.user_rating}</span>
                        </div>
                      )}
                      {item.is_published && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                          Published
                        </span>
                      )}
                    </div>
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
                      title="Copy content"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDownloadContent(item)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      title="Download content"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    {item.source_url && (
                      <button
                        onClick={() => window.open(item.source_url, '_blank')}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Open source URL"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ✅ ENHANCED: Content Modal with proper formatting and editing */}
      {selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    {selectedContent.title}
                    {(selectedContent.is_amplified || selectedContent.is_amplified_content) && (
                      <span className="ml-2 text-purple-600">🚀</span>
                    )}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {formatContentType(selectedContent.content_type)}
                    {selectedContent.confidence_score && (
                      <span className="ml-2 text-purple-600">
                        Confidence: {Math.round(selectedContent.confidence_score * 100)}%
                        {selectedContent.is_amplified && selectedContent.amplification_boost && (
                          <span className="text-green-600">
                            (+{Math.round(selectedContent.amplification_boost * 100)}%)
                          </span>
                        )}
                      </span>
                    )}
                  </p>
                  {selectedContent.is_amplified_content && (
                    <p className="text-xs text-purple-600 mt-1">
                      ✨ Generated from amplified intelligence
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {selectedContent.type === 'generated_content' && (
                  <>
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => {
                            setIsEditing(false)
                            setHasChanges(false)
                          }}
                          className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                          disabled={isSaving}
                        >
                          <Undo className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleSaveContent}
                          disabled={!hasChanges || isSaving}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                        >
                          <Save className="h-4 w-4" />
                          <span>{isSaving ? 'Saving...' : 'Save'}</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Edit3 className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                    )}
                  </>
                )}
                <button
                  onClick={() => setSelectedContent(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto">
              {isEditing ? (
                <div className="p-6">
                  <textarea
                    value={editedContent}
                    onChange={(e) => handleContentChange(e.target.value)}
                    className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Edit your content here..."
                  />
                  {hasChanges && (
                    <p className="text-sm text-orange-600 mt-2">
                      You have unsaved changes
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-6">
                  {selectedContent.type === 'intelligence' ? (
                    <div className="space-y-6">
                      {/* Intelligence Source Information */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">Source Information</h3>
                        {selectedContent.source_url && (
                          <div className="mb-2">
                            <span className="text-sm text-gray-600">URL: </span>
                            <a 
                              href={selectedContent.source_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm underline"
                            >
                              {selectedContent.source_url}
                            </a>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Confidence: </span>
                            <span className="font-medium">{Math.round(selectedContent.confidence_score * 100)}%</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Type: </span>
                            <span className="font-medium">{formatContentType(selectedContent.content_type)}</span>
                          </div>
                          {selectedContent.is_amplified && (
                            <>
                              <div>
                                <span className="text-gray-600">Amplified: </span>
                                <span className="font-medium text-purple-600">Yes 🚀</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Boost: </span>
                                <span className="font-medium text-green-600">+{Math.round(selectedContent.amplification_boost * 100)}%</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Intelligence Data Sections */}
                      {Object.entries(selectedContent.data || {}).map(([key, value]) => {
                        if (!value || (Array.isArray(value) && value.length === 0) || (typeof value === 'object' && Object.keys(value).length === 0)) return null
                        
                        return (
                          <div key={key} className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3 capitalize">
                              {key.replace('_', ' ').replace('intelligence', 'Intelligence')}
                            </h3>
                            <div className="prose max-w-none">
                              <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed text-sm bg-gray-50 p-3 rounded border">
                                {JSON.stringify(value, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Generated Content Information */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">Content Information</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Type: </span>
                            <span className="font-medium">{formatContentType(selectedContent.content_type)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Created: </span>
                            <span className="font-medium">{new Date(selectedContent.created_at).toLocaleDateString()}</span>
                          </div>
                          {selectedContent.user_rating && (
                            <div>
                              <span className="text-gray-600">Rating: </span>
                              <div className="inline-flex items-center">
                                {[...Array(selectedContent.user_rating)].map((_, i) => (
                                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                                ))}
                              </div>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-600">Published: </span>
                            <span className="font-medium">{selectedContent.is_published ? 'Yes' : 'No'}</span>
                          </div>
                          {selectedContent.is_amplified_content && (
                            <div className="col-span-2">
                              <span className="text-gray-600">Amplified Intelligence: </span>
                              <span className="font-medium text-purple-600">Yes ✨</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content Sections */}
                      {selectedContent.formatted_content && selectedContent.formatted_content.length > 0 ? (
                        <div className="space-y-4">
                          {selectedContent.formatted_content.map((section: any, index: number) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                              <h3 className="font-semibold text-gray-900 mb-3">{section.title}</h3>
                              <div className="prose max-w-none">
                                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                                  {section.content}
                                </div>
                                {section.metadata && Object.keys(section.metadata).length > 0 && (
                                  <div className="mt-4 p-3 bg-gray-50 rounded border">
                                    <h4 className="font-medium text-gray-700 mb-2">Metadata</h4>
                                    <div className="text-xs space-y-1">
                                      {Object.entries(section.metadata).map(([key, value]) => (
                                        <div key={key}>
                                          <span className="text-gray-600">{key}: </span>
                                          <span className="font-medium">
                                            {Array.isArray(value) ? value.join(', ') : String(value)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h3 className="font-semibold text-gray-900 mb-3">Content</h3>
                          <div className="prose max-w-none">
                            <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                              {selectedContent.parsed_content 
                                ? JSON.stringify(selectedContent.parsed_content, null, 2)
                                : 'No content available'
                              }
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Generation Settings and Metadata */}
                      {(selectedContent.generation_settings || selectedContent.content_metadata) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedContent.generation_settings && Object.keys(selectedContent.generation_settings).length > 0 && (
                            <div className="border border-gray-200 rounded-lg p-4">
                              <h3 className="font-semibold text-gray-900 mb-3">Generation Settings</h3>
                              <pre className="text-xs bg-gray-50 p-3 rounded border whitespace-pre-wrap">
                                {JSON.stringify(selectedContent.generation_settings, null, 2)}
                              </pre>
                            </div>
                          )}
                          
                          {selectedContent.content_metadata && Object.keys(selectedContent.content_metadata).length > 0 && (
                            <div className="border border-gray-200 rounded-lg p-4">
                              <h3 className="font-semibold text-gray-900 mb-3">Content Metadata</h3>
                              <pre className="text-xs bg-gray-50 p-3 rounded border whitespace-pre-wrap">
                                {JSON.stringify(selectedContent.content_metadata, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Performance Data */}
                      {selectedContent.performance_data && Object.keys(selectedContent.performance_data).length > 0 && (
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h3 className="font-semibold text-gray-900 mb-3">Performance Data</h3>
                          <pre className="text-xs bg-gray-50 p-3 rounded border whitespace-pre-wrap">
                            {JSON.stringify(selectedContent.performance_data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {selectedContent.type === 'intelligence' 
                    ? `Intelligence source • ${Object.keys(selectedContent.data || {}).length} analysis types`
                    : `Generated content • ${selectedContent.formatted_content?.length || 1} section${selectedContent.formatted_content?.length !== 1 ? 's' : ''}`
                  }
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCopyContent(selectedContent)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy All</span>
                  </button>
                  <button
                    onClick={() => handleDownloadContent(selectedContent)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}