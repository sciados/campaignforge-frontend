// src/app/campaigns/[id]/content/page.tsx - CLEAN ERROR-FREE VERSION
'use client'
import React, { useState, useEffect } from 'react'
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

export default function CleanCampaignContentPage() {
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
  const [selectedContent, setSelectedContent] = useState<any | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState('')
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Load data on mount
  useEffect(() => {
    if (!campaignId) return

    let isMounted = true

    const loadData = async () => {
      try {
        console.log('🔄 Starting to load campaign data')
        
        const [campaignData, intelligence] = await Promise.all([
          api.getCampaign(campaignId),
          api.getCampaignIntelligence(campaignId)
        ])
        
        console.log('✅ Data loaded successfully:', {
          campaign: campaignData?.title,
          sources: intelligence?.intelligence_sources?.length,
          content: intelligence?.generated_content?.length
        })
        
        if (isMounted) {
          setCampaign(campaignData)
          setIntelligenceData(intelligence)
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
      const [campaignData, intelligence] = await Promise.all([
        api.getCampaign(campaignId),
        api.getCampaignIntelligence(campaignId)
      ])
      
      setCampaign(campaignData)
      setIntelligenceData(intelligence)
      
    } catch (err: any) {
      setError(err.message || 'Failed to refresh content')
    } finally {
      setIsRefreshing(false)
    }
  }

  // ✅ ENHANCED: Get display content with proper parsing
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
    
      // ✅ ENHANCED: Add generated content with FIXED parsing
      intelligenceData?.generated_content?.forEach((content: any) => {
        // DEBUG: Log the actual content_body we're receiving
        console.log('🔍 Processing content:', {
          id: content.id,
          title: content.content_title,
          type: content.content_type,
          body_length: content.content_body?.length || 0,
          body_preview: content.content_body?.substring(0, 100) || 'empty'
        })
        
        let parsedContent = {}
        let formattedContent: any[] = []
        let previewText = 'Generated content'
        let hasValidContent = false
        let editableText = ''
        
        try {
          // More robust content parsing
          const bodyText = content.content_body || ''
          
          if (bodyText && bodyText.trim() && bodyText !== '{}' && bodyText !== 'null') {
            parsedContent = JSON.parse(bodyText)
            
            // Check if parsed content has actual data
            if (parsedContent && typeof parsedContent === 'object' && Object.keys(parsedContent).length > 0) {
              hasValidContent = true
              
              // Format content and create editable text
              formattedContent = formatContentForDisplay(parsedContent, content.content_type)
              previewText = getContentPreview(formattedContent, content.content_type)
              editableText = createEditableText(parsedContent, content.content_type)
              
              console.log('✅ Successfully processed content:', {
                type: content.content_type,
                title: content.content_title,
                sectionsCount: formattedContent.length,
                preview: previewText,
                editableLength: editableText.length
              })
            } else {
              console.warn('⚠️ Parsed content is empty object for:', content.content_title)
            }
          } else {
            console.warn('⚠️ Empty or invalid content body for:', content.content_title)
          }
        } catch (error) {
          console.error('❌ Failed to parse content:', error, 'Raw:', content.content_body)
          parsedContent = { error: 'Parse failed', raw: content.content_body }
          editableText = content.content_body || 'No content'
        }
        
        // Always add the item, even if empty, so user can see the issue
        displayItems.push({
          id: content.id,
          type: 'generated_content',
          title: content.content_title || 'Generated Content',
          content_type: content.content_type,
          created_at: content.created_at,
          user_rating: content.user_rating,
          is_published: content.is_published,
          performance_data: content.performance_data,
          parsed_content: parsedContent,
          formatted_content: formattedContent,
          preview_text: previewText,
          has_valid_content: hasValidContent,
          editable_text: editableText, // ✅ NEW: Formatted text for editing
          raw_content_body: content.content_body, // Keep original for debugging
          content_metadata: content.content_metadata,
          generation_settings: content.generation_settings,
          intelligence_used: content.intelligence_used,
          is_amplified_content: content.amplification_context?.generated_from_amplified_intelligence || false,
          amplification_metadata: content.amplification_context?.amplification_metadata || {}
        })
      })
    
    return displayItems
  }

  // ✅ ENHANCED: Content formatting functions
  const formatContentForDisplay = (content: any, contentType: string) => {
    if (!content || content.error) {
      return [{
        type: 'error',
        title: 'Content Not Available',
        content: content?.error || 'No content available',
        metadata: {}
      }]
    }

    switch (contentType) {
      case 'email_sequence':
        if (content.emails && Array.isArray(content.emails)) {
          return content.emails.map((email: any, index: number) => ({
            type: 'email',
            title: `Email ${email.email_number || index + 1}: ${email.subject || 'No Subject'}`,
            content: email.body || 'No content',
            metadata: {
              subject: email.subject,
              send_delay: email.send_delay,
              strategic_angle: email.strategic_angle,
              angle_name: email.angle_name,
              affiliate_focus: email.affiliate_focus,
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
            title: `${post.platform || 'Social'} Post ${post.post_number || index + 1}`,
            content: post.content || post.text || 'No content',
            metadata: {
              platform: post.platform,
              hashtags: post.hashtags,
              character_count: post.character_count,
              post_number: post.post_number
            }
          }))
        }
        break

      case 'ad_copy':
        if (content.ads && Array.isArray(content.ads)) {
          return content.ads.map((ad: any, index: number) => ({
            type: 'ad',
            title: `${ad.platform || 'Ad'} Copy ${ad.ad_number || index + 1}`,
            content: `**${ad.headline || 'No Headline'}**\n\n${ad.body || ad.content || 'No content'}\n\n*CTA: ${ad.cta || 'No CTA'}*`,
            metadata: {
              platform: ad.platform,
              headline: ad.headline,
              body: ad.body || ad.content,
              cta: ad.cta,
              ad_number: ad.ad_number
            }
          }))
        }
        break

      case 'video_script':
        if (content.script_text) {
          return [{
            type: 'video_script',
            title: content.title || 'Video Script',
            content: content.script_text,
            metadata: {
              duration: content.duration,
              tone: content.tone
            }
          }]
        }
        break

      case 'blog_post':
        if (content.title && (content.content || content.body)) {
          return [{
            type: 'blog_post',
            title: content.title,
            content: content.content || content.body,
            metadata: {
              word_count: content.word_count,
              tone: content.tone,
              topic: content.topic
            }
          }]
        }
        break

      case 'landing_page':
        if (content.html_code) {
          return [{
            type: 'landing_page',
            title: content.title || 'Landing Page',
            content: content.html_code,
            metadata: {
              page_type: content.page_type,
              code_lines: content.code_lines
            }
          }]
        }
        break

      default:
        // Auto-detect content structure
        if (content.emails && Array.isArray(content.emails)) {
          return formatContentForDisplay(content, 'email_sequence')
        }
        if (content.posts && Array.isArray(content.posts)) {
          return formatContentForDisplay(content, 'social_media_posts')
        }
        if (content.ads && Array.isArray(content.ads)) {
          return formatContentForDisplay(content, 'ad_copy')
        }
        
        return [{
          type: 'generic',
          title: `Generated ${contentType}`,
          content: JSON.stringify(content, null, 2),
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

  // ✅ NEW: Create editable text format from parsed content
  const createEditableText = (parsedContent: any, contentType: string): string => {
    try {
      switch (contentType) {
        case 'email_sequence':
          if (parsedContent.emails && Array.isArray(parsedContent.emails)) {
            let text = `EMAIL SEQUENCE: ${parsedContent.sequence_title || 'Untitled Sequence'}\n`
            text += `Total Emails: ${parsedContent.emails.length}\n`
            if (parsedContent.email_focus) {
              text += `Focus: ${parsedContent.email_focus}\n`
            }
            text += '\n' + '='.repeat(50) + '\n\n'
            
            parsedContent.emails.forEach((email: any, index: number) => {
              text += `EMAIL ${email.email_number || index + 1}\n`
              text += `-`.repeat(20) + '\n'
              text += `Subject: ${email.subject || 'No Subject'}\n`
              if (email.send_delay) text += `Send Delay: ${email.send_delay}\n`
              if (email.strategic_angle) text += `Strategy: ${email.strategic_angle}\n`
              if (email.angle_name) text += `Angle: ${email.angle_name}\n`
              text += '\nContent:\n'
              text += email.body || 'No content'
              text += '\n\n' + '='.repeat(50) + '\n\n'
            })
            
            return text
          }
          break
          
        case 'social_media_posts':
        case 'social_posts':
          if (parsedContent.posts && Array.isArray(parsedContent.posts)) {
            let text = `SOCIAL MEDIA POSTS\n`
            text += `Total Posts: ${parsedContent.posts.length}\n\n`
            text += '='.repeat(50) + '\n\n'
            
            parsedContent.posts.forEach((post: any, index: number) => {
              text += `POST ${post.post_number || index + 1}\n`
              text += `-`.repeat(15) + '\n'
              if (post.platform) text += `Platform: ${post.platform}\n`
              text += '\nContent:\n'
              text += post.content || post.text || 'No content'
              if (post.hashtags && post.hashtags.length > 0) {
                text += '\n\nHashtags: ' + post.hashtags.join(' ')
              }
              text += '\n\n' + '='.repeat(50) + '\n\n'
            })
            
            return text
          }
          break
          
        case 'ad_copy':
          if (parsedContent.ads && Array.isArray(parsedContent.ads)) {
            let text = `AD COPY VARIATIONS\n`
            text += `Total Ads: ${parsedContent.ads.length}\n\n`
            text += '='.repeat(50) + '\n\n'
            
            parsedContent.ads.forEach((ad: any, index: number) => {
              text += `AD ${ad.ad_number || index + 1}\n`
              text += `-`.repeat(10) + '\n'
              if (ad.platform) text += `Platform: ${ad.platform}\n`
              text += `Headline: ${ad.headline || 'No Headline'}\n\n`
              text += `Body:\n${ad.body || ad.content || 'No content'}\n\n`
              text += `Call-to-Action: ${ad.cta || 'No CTA'}\n`
              text += '\n' + '='.repeat(50) + '\n\n'
            })
            
            return text
          }
          break
          
        case 'video_script':
          if (parsedContent.script_text) {
            let text = `VIDEO SCRIPT\n`
            text += `Title: ${parsedContent.title || 'Untitled'}\n`
            if (parsedContent.duration) text += `Duration: ${parsedContent.duration}\n`
            if (parsedContent.tone) text += `Tone: ${parsedContent.tone}\n`
            text += '\n' + '='.repeat(50) + '\n\n'
            text += parsedContent.script_text
            return text
          }
          break
          
        case 'blog_post':
          if (parsedContent.title && (parsedContent.content || parsedContent.body)) {
            let text = `BLOG POST\n`
            text += `Title: ${parsedContent.title}\n`
            if (parsedContent.word_count) text += `Word Count: ${parsedContent.word_count}\n`
            if (parsedContent.tone) text += `Tone: ${parsedContent.tone}\n`
            text += '\n' + '='.repeat(50) + '\n\n'
            text += parsedContent.content || parsedContent.body
            return text
          }
          break
          
        case 'landing_page':
          if (parsedContent.html_code) {
            let text = `LANDING PAGE\n`
            text += `Title: ${parsedContent.title || 'Untitled'}\n`
            if (parsedContent.page_type) text += `Type: ${parsedContent.page_type}\n`
            text += '\n' + '='.repeat(50) + '\n\n'
            text += 'HTML CODE:\n'
            text += parsedContent.html_code
            return text
          }
          break
          
        default:
          // Auto-detect and format
          if (parsedContent.emails && Array.isArray(parsedContent.emails)) {
            return createEditableText(parsedContent, 'email_sequence')
          }
          if (parsedContent.posts && Array.isArray(parsedContent.posts)) {
            return createEditableText(parsedContent, 'social_media_posts')
          }
          if (parsedContent.ads && Array.isArray(parsedContent.ads)) {
            return createEditableText(parsedContent, 'ad_copy')
          }
          
          return JSON.stringify(parsedContent, null, 2)
      }
      
      // Fallback
      return JSON.stringify(parsedContent, null, 2)
      
    } catch (error) {
      console.error('Error creating editable text:', error)
      return JSON.stringify(parsedContent, null, 2)
    }
  }

  const getContentPreview = (formattedContent: any[], contentType: string) => {
    if (!formattedContent || formattedContent.length === 0) {
      return 'No content available'
    }

    const firstItem = formattedContent[0]
    
    switch (contentType) {
      case 'email_sequence':
        if (formattedContent.length > 1) {
          return `${formattedContent.length} emails in sequence`
        }
        return firstItem.metadata?.subject || firstItem.title
        
      case 'social_media_posts':
      case 'social_posts':
        return `${formattedContent.length} social posts`
        
      case 'ad_copy':
        return `${formattedContent.length} ad variations`
        
      case 'video_script':
        return firstItem.metadata?.duration ? 
          `Video script (${firstItem.metadata.duration})` : 
          'Video script'
          
      case 'blog_post':
        return firstItem.metadata?.word_count ? 
          `Blog post (${firstItem.metadata.word_count} words)` : 
          'Blog post'
          
      case 'landing_page':
        return 'Landing page HTML'
        
      default:
        return `${formattedContent.length} section${formattedContent.length !== 1 ? 's' : ''}`
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

  const openContentModal = (content: any) => {
    setSelectedContent(content)
    
    if (content.type === 'intelligence') {
      setEditedContent(JSON.stringify(content.data, null, 2))
    } else {
      // ✅ Use the formatted editable text instead of raw JSON
      setEditedContent(content.editable_text || content.raw_content_body || 'No content available')
    }
    
    setIsEditing(false)
    setHasChanges(false)
  }

  const handleSaveContent = async () => {
    if (!selectedContent || !hasChanges) return
    
    setIsSaving(true)
    try {
      // Simulate save
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setHasChanges(false)
      setIsEditing(false)
      
      // Refresh
      await handleRefresh()
      
    } catch (error) {
      console.error('Failed to save content:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleContentChange = (newContent: string) => {
    setEditedContent(newContent)
    setHasChanges(true)
  }

  // Get data for rendering
  const displayContent = getDisplayContent()
  const filteredContent = getFilteredContent()
  const contentCategories = getContentCategories()

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
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {isRefreshing ? 'Retrying...' : 'Try Again'}
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
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
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
              {contentCategories.map(category => (
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
              {displayContent.length === 0 
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
                        : item.has_valid_content
                          ? item.preview_text
                          : 'Content not available'
                      }
                      {item.is_amplified_content && (
                        <span className="block text-purple-600 text-xs mt-1">
                          ✨ Enhanced with amplified intelligence
                        </span>
                      )}
                      {!item.has_valid_content && item.type === 'generated_content' && (
                        <span className="block text-orange-600 text-xs mt-1">
                          ⚠️ Content may be empty or corrupted
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

      {/* Content Modal */}
      {selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
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
                    </span>
                  )}
                </p>
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

                      {/* Intelligence Data */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Intelligence Data</h3>
                        <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded border max-h-96 overflow-y-auto">
                          {JSON.stringify(selectedContent.data, null, 2)}
                        </pre>
                      </div>
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

                      {/* Content Data */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Generated Content</h3>
                        
                        {selectedContent.has_valid_content && selectedContent.formatted_content ? (
                          <div className="space-y-4">
                            {selectedContent.formatted_content.map((section: any, index: number) => (
                              <div key={index} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                                <h4 className="font-semibold text-gray-800 mb-3 text-lg">{section.title}</h4>
                                <div className="bg-white p-3 rounded border">
                                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed mb-3">
                                    {section.content}
                                  </div>
                                  {section.metadata && Object.keys(section.metadata).length > 0 && (
                                    <div className="border-t pt-3 mt-3">
                                      <h5 className="font-medium text-gray-600 text-sm mb-2">Details</h5>
                                      <div className="grid grid-cols-2 gap-2 text-sm">
                                        {Object.entries(section.metadata).map(([key, value]) => (
                                          <div key={key} className="flex flex-col">
                                            <span className="text-gray-500 text-xs uppercase tracking-wide">{key.replace('_', ' ')}</span>
                                            <span className="text-gray-800 font-medium">
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
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h4 className="font-medium text-yellow-800 mb-2">⚠️ Content Debug Information</h4>
                            <p className="text-yellow-700 text-sm mb-3">
                              This content couldn not be parsed. Check the raw data below:
                            </p>
                            <div className="bg-yellow-100 border border-yellow-300 rounded p-3">
                              <p className="text-xs text-yellow-600 mb-2">Raw content_body length: {selectedContent.raw_content_body?.length || 0}</p>
                              <pre className="text-xs text-yellow-800 overflow-x-auto whitespace-pre-wrap">
                                {selectedContent.raw_content_body || 'No raw content'}
                              </pre>
                            </div>
                            <details className="mt-3">
                              <summary className="cursor-pointer text-yellow-600 hover:text-yellow-800 text-sm">
                                Show parsed data
                              </summary>
                              <pre className="mt-2 bg-yellow-100 p-2 rounded border text-yellow-800 overflow-x-auto text-xs">
                                {JSON.stringify(selectedContent.parsed_content, null, 2)}
                              </pre>
                            </details>
                          </div>
                        )}
                      </div>

                      {/* Metadata */}
                      {selectedContent.content_metadata && Object.keys(selectedContent.content_metadata).length > 0 && (
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h3 className="font-semibold text-gray-900 mb-3">Content Metadata</h3>
                          <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded border max-h-60 overflow-y-auto">
                            {JSON.stringify(selectedContent.content_metadata, null, 2)}
                          </pre>
                        </div>
                      )}

                      {/* Generation Settings */}
                      {selectedContent.generation_settings && Object.keys(selectedContent.generation_settings).length > 0 && (
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h3 className="font-semibold text-gray-900 mb-3">Generation Settings</h3>
                          <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded border max-h-60 overflow-y-auto">
                            {JSON.stringify(selectedContent.generation_settings, null, 2)}
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
                    ? `Intelligence source with analysis data`
                    : `Generated content item`
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