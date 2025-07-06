// src/app/campaigns/[id]/content/page.tsx - Apple Design System
'use client'
import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Download, 
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
  RefreshCw,
  ExternalLink,
  Star,
  Target,
  Zap
} from 'lucide-react'
import { useApi } from '@/lib/api'
import ContentViewEditModal from '@/components/campaigns/ContentViewEditModal'

export default function AppleCampaignContentPage() {
  const params = useParams()
  const router = useRouter()
  const api = useApi()
  
  const campaignId = params.id as string
  const [campaign, setCampaign] = useState<any>(null)
  const [intelligenceData, setIntelligenceData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedContent, setSelectedContent] = useState<any | null>(null)
  const [isContentModalOpen, setIsContentModalOpen] = useState(false)

  // Load data on mount
  useEffect(() => {
    if (!campaignId) return

    let isMounted = true

    const loadData = async () => {
      try {
        console.log('🔄 Starting to load campaign data')
        
        const [campaignData, intelligence, contentData] = await Promise.all([
          api.getCampaign(campaignId),
          api.getCampaignIntelligence(campaignId),
          api.getContentList(campaignId, true)
        ])
        
        console.log('✅ Data loaded successfully:', {
          campaign: campaignData?.title,
          sources: intelligence?.intelligence_sources?.length,
          content_from_intelligence: intelligence?.generated_content?.length,
          content_from_content_api: contentData?.content_items?.length
        })
        
        const enhancedIntelligence = {
          ...intelligence,
          generated_content: contentData?.content_items || intelligence?.generated_content || []
        }
        
        if (isMounted) {
          setCampaign(campaignData)
          setIntelligenceData(enhancedIntelligence)
          setIsLoading(false)
        }
        
      } catch (err: any) {
        console.error('❌ Loading error:', err)
        if (isMounted) {
          setError(err.message || 'Failed to load content')
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [campaignId, api])

  // Navigation functions
  const goBackToCampaign = () => {
    router.push(`/campaigns/${campaignId}`)
  }

  const goToGenerateMore = () => {
    router.push(`/campaigns/${campaignId}?step=4`)
  }

  // Refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true)
    setError(null)
    
    try {
      const [campaignData, intelligence, contentData] = await Promise.all([
        api.getCampaign(campaignId),
        api.getCampaignIntelligence(campaignId),
        api.getContentList(campaignId, true)
      ])
      
      const enhancedIntelligence = {
        ...intelligence,
        generated_content: contentData?.content_items || intelligence?.generated_content || []
      }
      
      setCampaign(campaignData)
      setIntelligenceData(enhancedIntelligence)
      
    } catch (err: any) {
      setError(err.message || 'Failed to refresh content')
    } finally {
      setIsRefreshing(false)
    }
  }

  // Content parsing and formatting functions (simplified for brevity)
  const parseContentBody = (contentBody: any, contentType: string) => {
    if (!contentBody || contentBody === null || contentBody === undefined) {
      return { 
        success: false, 
        error: 'Content was not generated or saved', 
        data: null,
        isEmpty: true,
        suggestion: 'Try regenerating this content'
      }
    }

    if (contentBody === '' || contentBody.trim() === '') {
      return { 
        success: false, 
        error: 'Content body is empty in database', 
        data: null,
        isEmpty: true,
        suggestion: 'The content generation may have failed. Try regenerating this content.'
      }
    }

    if (typeof contentBody === 'object' && contentBody !== null) {
      return { success: true, data: contentBody }
    }

    if (typeof contentBody === 'string') {
      const trimmed = contentBody.trim()
      
      if (trimmed === '{}' || trimmed === '[]' || trimmed === 'null') {
        return { 
          success: false, 
          error: 'Content generated as empty JSON', 
          data: null,
          isEmpty: true,
          suggestion: 'The AI may have generated empty content. Try regenerating with different parameters.'
        }
      }

      try {
        const parsed = JSON.parse(trimmed)
        
        if (!parsed || (typeof parsed === 'object' && Object.keys(parsed).length === 0)) {
          return { 
            success: false, 
            error: 'Generated content is empty', 
            data: parsed,
            isEmpty: true,
            suggestion: 'The AI generated an empty response. Try regenerating with more specific prompts.'
          }
        }

        return { success: true, data: parsed }
        
      } catch (parseError) {
        if (trimmed.length > 0) {
          return { 
            success: true, 
            data: { 
              text: trimmed, 
              content_type: 'plain_text',
              fallback: true 
            } 
          }
        }
        
        return { 
          success: false, 
          error: 'Invalid content format', 
          data: null,
          suggestion: 'Content appears corrupted. Try regenerating.'
        }
      }
    }

    return { 
      success: false, 
      error: 'Unknown content format', 
      data: contentBody,
      suggestion: 'Unexpected data format. Contact support if this persists.'
    }
  }

  const getDisplayContent = () => {
    const displayItems: any[] = []
    
    // Add intelligence sources
    intelligenceData?.intelligence_sources?.forEach((source: any) => {
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
    
    // Add generated content
    intelligenceData?.generated_content?.forEach((content: any, index: number) => {
      const parseResult = parseContentBody(content.content_body, content.content_type)
      
      let previewText = 'Generated content'
      let hasValidContent = parseResult.success && parseResult.data !== null
      
      if (hasValidContent) {
        previewText = getContentPreview(content.content_type, parseResult.data)
      } else {
        previewText = parseResult.error || 'Content not available'
      }
      
      displayItems.push({
        id: content.id,
        type: 'generated_content',
        title: content.content_title || 'Generated Content',
        content_type: content.content_type,
        created_at: content.created_at,
        user_rating: content.user_rating,
        is_published: content.is_published,
        performance_data: content.performance_data,
        parsed_content: parseResult.data,
        parse_result: parseResult,
        preview_text: previewText,
        has_valid_content: hasValidContent,
        raw_content_body: content.content_body,
        content_metadata: content.content_metadata,
        generation_settings: content.generation_settings,
        intelligence_used: content.intelligence_used,
        is_amplified_content: content.amplification_context?.generated_from_amplified_intelligence || false,
        amplification_metadata: content.amplification_context?.amplification_metadata || {}
      })
    })
    
    return displayItems
  }

  const getContentPreview = (contentType: string, data: any) => {
    switch (contentType) {
      case 'email_sequence':
        const emails = data.emails || data.email_sequence || []
        if (Array.isArray(emails) && emails.length > 1) {
          return `${emails.length} emails: ${emails.slice(0, 2).map((e: any) => e.subject).join(', ')}`
        }
        return data.subject || 'Email sequence'
        
      case 'social_media_posts':
      case 'SOCIAL_POSTS':
        const posts = data.posts || data.social_posts || []
        if (Array.isArray(posts)) {
          const platforms = Array.from(new Set(posts.map((p: any) => p.platform).filter(Boolean)))
          return `${posts.length} posts${platforms.length > 0 ? ` (${platforms.join(', ')})` : ''}`
        }
        return 'Social media posts'
        
      case 'ad_copy':
        const ads = data.ads || data.ad_copy || []
        if (Array.isArray(ads)) {
          return `${ads.length} ad variations`
        }
        return 'Ad copy'
        
      default:
        return `Generated ${contentType.replace('_', ' ')}`
    }
  }

  // Get filtered content
  const getFilteredContent = () => {
    const content = getDisplayContent()
    
    return content.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.content_type === selectedCategory
      const matchesSearch = searchTerm === '' || 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content_type.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesCategory && matchesSearch
    })
  }

  // Get content categories
  const getContentCategories = () => {
    const content = getDisplayContent()
    const uniqueTypes = Array.from(new Set(content.map(c => c.content_type)))
    const categories = ['all', ...uniqueTypes]
    
    return categories.map(cat => ({
      value: cat,
      label: cat === 'all' ? 'All Content' : cat.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      count: cat === 'all' ? content.length : content.filter(c => c.content_type === cat).length
    }))
  }

  // Helper functions
  const getContentIcon = (type: string) => {
    const icons: Record<string, any> = {
      'intelligence_source': TrendingUp,
      'email_sequence': Mail,
      'social_media_posts': Image,
      'social_posts': Image,
      'ad_copy': Target,
      'blog_post': FileText,
      'LANDING_PAGE': Globe,
      'video_script': Video
    }
    return icons[type] || FileText
  }

  const getContentColor = (type: string) => {
    const colors: Record<string, string> = {
      'intelligence_source': 'bg-purple-100 text-purple-800',
      'email_sequence': 'bg-blue-100 text-blue-800',
      'social_media_posts': 'bg-pink-100 text-pink-800',
      'social_posts': 'bg-pink-100 text-pink-800',
      'ad_copy': 'bg-green-100 text-green-800',
      'blog_post': 'bg-purple-100 text-purple-800',
      'LANDING_PAGE': 'bg-cyan-100 text-cyan-800',
      'video_script': 'bg-red-100 text-red-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const formatContentType = (type: string) => {
    const formatted: Record<string, string> = {
      'intelligence_source': 'Intelligence Source',
      'email_sequence': 'Email Sequence',
      'social_media_posts': 'Social Media Posts',
      'SOCIAL_POSTS': 'Social Media Posts',
      'ad_copy': 'Ad Copy',
      'blog_post': 'Blog Post',
      'LANDING_PAGE': 'Landing Page',
      'video_script': 'Video Script'
    }
    return formatted[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  // Content actions
  const handleCopyContent = async (content: any) => {
    try {
      let textContent = ''
      
      if (content.type === 'intelligence') {
        textContent = `Intelligence Source: ${content.title}\n\n`
        textContent += `Source URL: ${content.source_url || 'N/A'}\n`
        textContent += `Confidence: ${Math.round(content.confidence_score * 100)}%\n`
        if (content.is_amplified) {
          textContent += `🚀 AMPLIFIED (+${Math.round(content.amplification_boost * 100)}%)\n`
        }
        textContent += `\n${JSON.stringify(content.data, null, 2)}`
      } else {
        textContent = `${content.title}\n\nType: ${formatContentType(content.content_type)}\n\n`
        if (content.is_amplified_content) {
          textContent += `🚀 Generated from AMPLIFIED Intelligence\n\n`
        }
        textContent += JSON.stringify(content.parsed_content, null, 2)
      }
      
      await navigator.clipboard.writeText(textContent)
      
      // Show feedback
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
      textContent = `Intelligence Source: ${content.title}\n`
      textContent += `${'='.repeat(50)}\n\n`
      textContent += `Source URL: ${content.source_url || 'N/A'}\n`
      textContent += `Confidence Score: ${content.confidence_score || 'N/A'}\n`
      textContent += `Amplified: ${content.is_amplified ? 'Yes' : 'No'}\n`
      if (content.is_amplified) {
        textContent += `Confidence Boost: +${Math.round(content.amplification_boost * 100)}%\n`
      }
      textContent += `\n${JSON.stringify(content.data, null, 2)}`
    } else {
      textContent = `${content.title}\n`
      textContent += `${'='.repeat(50)}\n\n`
      textContent += `Type: ${formatContentType(content.content_type)}\n`
      textContent += `Created: ${new Date(content.created_at).toLocaleDateString()}\n`
      textContent += `Amplified Intelligence: ${content.is_amplified_content ? 'Yes' : 'No'}\n\n`
      textContent += JSON.stringify(content.parsed_content, null, 2)
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

  // Modal functions
  const openContentModal = (content: any) => {
    setSelectedContent(content)
    setIsContentModalOpen(true)
  }

  const closeContentModal = () => {
    setSelectedContent(null)
    setIsContentModalOpen(false)
  }

  const handleSaveContent = async (contentId: string, newContent: string) => {
    try {
      const updateResult = await api.updateContent(campaignId, contentId, {
        content_body: newContent
      })
      
      await handleRefresh()
      
    } catch (error) {
      console.error('❌ Failed to save content:', error)
      throw error
    }
  }

  // Get data for rendering
  const displayContent = getDisplayContent()
  const filteredContent = getFilteredContent()
  const contentCategories = getContentCategories()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-apple-light flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-apple-gray font-medium">Loading content...</p>
        </div>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-apple-light flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light text-black mb-2">Error Loading Content</h1>
          <p className="text-apple-gray mb-6">{error}</p>
          <div className="flex space-x-3 justify-center">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition-colors disabled:bg-gray-600 font-medium"
            >
              {isRefreshing ? 'Retrying...' : 'Try Again'}
            </button>
            <button
              onClick={() => router.push('/campaigns')}
              className="bg-gray-100 text-black px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Back to Campaigns
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-apple-light">
      {/* Apple-style Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={goBackToCampaign}
                className="w-8 h-8 flex items-center justify-center text-apple-gray hover:text-black transition-colors rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-black">Content Library</h1>
                <p className="text-sm text-apple-gray font-medium">
                  {campaign.title} • {filteredContent.length} items
                  {intelligenceData?.summary?.amplification_summary?.sources_amplified && intelligenceData.summary.amplification_summary.sources_amplified > 0 && (
                    <span className="ml-2 text-blue-600">
                      🚀 {intelligenceData.summary.amplification_summary.sources_amplified} amplified
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors disabled:bg-gray-300 font-medium"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
              <button
                onClick={goToGenerateMore}
                className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
              >
                <Plus className="h-4 w-4" />
                <span>Generate More</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Apple-style Filters and Search */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {contentCategories.map(category => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 rounded-lg border transition-all font-medium ${
                    selectedCategory === category.value
                      ? 'bg-black text-white border-black'
                      : 'bg-gray-100 border-gray-200 text-black hover:bg-gray-200'
                  }`}
                >
                  {category.label} ({category.count})
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-apple-gray" />
              <input
                type="text"
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all w-full lg:w-64 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Content Grid */}
        {filteredContent.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText className="h-8 w-8 text-apple-gray" />
            </div>
            <h3 className="text-xl font-medium text-black mb-3">No Content Found</h3>
            <p className="text-apple-gray mb-6 max-w-md mx-auto">
              {displayContent.length === 0 
                ? "No content or intelligence sources have been created for this campaign yet."
                : "No content matches your current filters."
              }
            </p>
            <button
              onClick={goToGenerateMore}
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition-colors font-medium"
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
                <div key={item.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center relative ${colorClass}`}>
                        <Icon className="h-5 w-5" />
                        {(item.is_amplified || item.is_amplified_content) && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                            <Zap className="h-2.5 w-2.5 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-black text-sm truncate">
                          {item.title}
                          {(item.is_amplified || item.is_amplified_content) && (
                            <span className="ml-1 text-blue-600">🚀</span>
                          )}
                        </h3>
                        <p className="text-xs text-apple-gray font-medium">
                          {formatContentType(item.content_type)}
                        </p>
                      </div>
                    </div>
                    {item.confidence_score && (
                      <div className="text-right">
                        <span className="text-xs text-blue-600 font-semibold">
                          {Math.round(item.confidence_score * 100)}%
                        </span>
                        {item.is_amplified && item.amplification_boost && (
                          <div className="text-xs text-green-600 font-medium">
                            (+{Math.round(item.amplification_boost * 100)}%)
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Content Preview */}
                  <div className="mb-4">
                    <div className="text-sm text-apple-gray leading-relaxed">
                      {item.type === 'intelligence' 
                        ? `Intelligence source with ${Object.keys(item.data || {}).length} analysis types`
                        : item.has_valid_content
                          ? item.preview_text
                          : 'Content parsing failed'
                      }
                      {item.is_amplified_content && (
                        <span className="block text-blue-600 text-xs mt-2 font-medium">
                          ✨ Enhanced with amplified intelligence
                        </span>
                      )}
                      {!item.has_valid_content && item.type === 'generated_content' && (
                        <span className="block text-amber-600 text-xs mt-2 font-medium">
                          ⚠️ {item.parse_result?.isEmpty ? 'Content not generated - click to regenerate' : (item.parse_result?.error || 'Content not available')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-apple-gray mb-4">
                    <span className="font-medium">Created {new Date(item.created_at).toLocaleDateString()}</span>
                    <div className="flex items-center space-x-2">
                      {item.user_rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="font-medium">{item.user_rating}</span>
                        </div>
                      )}
                      {item.is_published && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-lg font-medium">
                          Published
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Apple-style Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openContentModal(item)}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                    <button
                      id={`copy-${item.id}`}
                      onClick={() => handleCopyContent(item)}
                      className="w-10 h-10 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                      title="Copy content"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDownloadContent(item)}
                      className="w-10 h-10 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                      title="Download content"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    {item.source_url && (
                      <button
                        onClick={() => window.open(item.source_url, '_blank')}
                        className="w-10 h-10 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
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

      {/* Content Modal */}
      <ContentViewEditModal
        content={selectedContent}
        isOpen={isContentModalOpen}
        onClose={closeContentModal}
        onSave={handleSaveContent}
        onRefresh={handleRefresh}
        formatContentType={formatContentType}
      />
    </div>
  )
}