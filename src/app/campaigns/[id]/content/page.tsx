// src/app/campaigns/[id]/content/page.tsx - CLEAN VERSION WITH SEPARATE MODAL
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

export default function FixedCampaignContentPage() {
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
        
        // ✅ FIXED: Use the content-specific endpoint with includeBody=true
        const [campaignData, intelligence, contentData] = await Promise.all([
          api.getCampaign(campaignId),
          api.getCampaignIntelligence(campaignId),
          api.getContentList(campaignId, true) // ✅ NEW: Get content with body included
        ])
        
        console.log('✅ Data loaded successfully:', {
          campaign: campaignData?.title,
          sources: intelligence?.intelligence_sources?.length,
          content_from_intelligence: intelligence?.generated_content?.length,
          content_from_content_api: contentData?.content_items?.length
        })
        
        // ✅ ENHANCED: Merge content from both sources, prioritizing the content API with bodies
        const enhancedIntelligence = {
          ...intelligence,
          generated_content: contentData?.content_items || intelligence?.generated_content || []
        }
        
        console.log('🔍 Enhanced intelligence content preview:', {
          total_items: enhancedIntelligence.generated_content.length,
          items_with_body: enhancedIntelligence.generated_content.filter((item: any) => 
            item.content_body && item.content_body.length > 0
          ).length,
          sample_body_lengths: enhancedIntelligence.generated_content.slice(0, 3).map((item: any) => ({
            title: item.content_title,
            body_length: item.content_body?.length || 0,
            body_preview: item.content_body?.substring?.(0, 50) || 'empty'
          }))
        })
        
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
      // ✅ FIXED: Use content endpoint with body included for refresh too
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

  // ✅ FIXED: Ultra-robust content parsing with specific empty content handling
  const parseContentBody = (contentBody: any, contentType: string) => {
    console.log('🔍 Parsing content body:', {
      type: typeof contentBody,
      isNull: contentBody === null,
      isUndefined: contentBody === undefined,
      isEmpty: contentBody === '',
      isEmptyObject: contentBody === '{}',
      length: contentBody?.length,
      preview: contentBody?.substring?.(0, 100) || 'no preview'
    })

    // Handle null/undefined
    if (!contentBody || contentBody === null || contentBody === undefined) {
      console.warn('⚠️ Content body is null or undefined')
      return { 
        success: false, 
        error: 'Content was not generated or saved', 
        data: null,
        isEmpty: true,
        suggestion: 'Try regenerating this content'
      }
    }

    // Handle empty string - this is the main issue you're seeing
    if (contentBody === '' || contentBody.trim() === '') {
      console.warn('⚠️ Content body is empty string - content_body field is empty in database')
      return { 
        success: false, 
        error: 'Content body is empty in database', 
        data: null,
        isEmpty: true,
        suggestion: 'The content generation may have failed. Try regenerating this content.'
      }
    }

    // Handle already parsed object
    if (typeof contentBody === 'object' && contentBody !== null) {
      console.log('✅ Content body is already an object')
      return { success: true, data: contentBody }
    }

    // Handle string content
    if (typeof contentBody === 'string') {
      const trimmed = contentBody.trim()
      
      // Check for empty JSON
      if (trimmed === '{}' || trimmed === '[]' || trimmed === 'null') {
        console.warn('⚠️ Content body is empty JSON')
        return { 
          success: false, 
          error: 'Content generated as empty JSON', 
          data: null,
          isEmpty: true,
          suggestion: 'The AI may have generated empty content. Try regenerating with different parameters.'
        }
      }

      // Try to parse as JSON
      try {
        const parsed = JSON.parse(trimmed)
        
        // Validate parsed content has actual data
        if (!parsed || (typeof parsed === 'object' && Object.keys(parsed).length === 0)) {
          console.warn('⚠️ Parsed content is empty object')
          return { 
            success: false, 
            error: 'Generated content is empty', 
            data: parsed,
            isEmpty: true,
            suggestion: 'The AI generated an empty response. Try regenerating with more specific prompts.'
          }
        }

        console.log('✅ Successfully parsed JSON content')
        return { success: true, data: parsed }
        
      } catch (parseError) {
        console.error('❌ JSON parse failed:', parseError)
        
        // If it's not JSON, treat as plain text
        if (trimmed.length > 0) {
          console.log('📝 Treating as plain text content')
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

    console.warn('⚠️ Unhandled content body type:', typeof contentBody)
    return { 
      success: false, 
      error: 'Unknown content format', 
      data: contentBody,
      suggestion: 'Unexpected data format. Contact support if this persists.'
    }
  }

  // ✅ ENHANCED: Add detailed API debugging to track where data is lost
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
    
    // ✅ ENHANCED: Add generated content with DETAILED API debugging
    intelligenceData?.generated_content?.forEach((content: any, index: number) => {
      console.log(`🔍 [API DEBUG] Processing content item ${index + 1}:`, {
        id: content.id,
        title: content.content_title,
        type: content.content_type,
        api_response_keys: Object.keys(content),
        content_body_from_api: {
          exists: 'content_body' in content,
          type: typeof content.content_body,
          is_null: content.content_body === null,
          is_undefined: content.content_body === undefined,
          is_empty_string: content.content_body === '',
          length: content.content_body?.length || 0,
          first_100_chars: content.content_body?.substring?.(0, 100) || '[no preview]'
        },
        raw_api_content_body: content.content_body // Log the EXACT value from API
      })
      
      // Additional debugging for this specific email sequence
      if (content.content_title?.includes('HEPATOBURN') || content.content_type === 'email_sequence') {
        console.log('🎯 [HEPATOBURN EMAIL DEBUG] Detailed analysis:', {
          title: content.content_title,
          content_body_exact_value: content.content_body,
          content_body_stringified: JSON.stringify(content.content_body),
          all_content_properties: Object.entries(content).map(([key, value]) => ({
            key,
            type: typeof value,
            hasValue: value !== null && value !== undefined && value !== ''
          }))
        })
      }
      
      // Parse the content body using robust parser
      const parseResult = parseContentBody(content.content_body, content.content_type)
      
      console.log(`📊 [PARSE RESULT] ${content.content_title}:`, {
        parse_success: parseResult.success,
        parse_error: parseResult.error,
        has_data: !!parseResult.data,
        data_preview: parseResult.data ? (typeof parseResult.data === 'object' ? Object.keys(parseResult.data) : 'not object') : 'no data'
      })
      
      let formattedContent: any[] = []
      let previewText = 'Generated content'
      let editableText = ''
      let hasValidContent = parseResult.success && parseResult.data !== null
      
      if (hasValidContent) {
        try {
          // Format content for display
          formattedContent = formatContentForDisplay(parseResult.data, content.content_type)
          previewText = getContentPreview(formattedContent, content.content_type, parseResult.data)
          editableText = createEditableText(parseResult.data, content.content_type)
          
          console.log(`✅ [FORMAT SUCCESS] ${content.content_title}:`, {
            type: content.content_type,
            sectionsCount: formattedContent.length,
            preview: previewText,
            editableLength: editableText.length,
            formatted_preview: formattedContent.slice(0, 2).map(section => ({
              title: section.title,
              contentLength: section.content?.length || 0
            }))
          })
        } catch (formatError) {
          console.error('❌ [FORMAT ERROR]:', formatError)
          hasValidContent = false
          previewText = 'Content formatting error'
        }
      } else {
        console.warn(`⚠️ [PARSE FAILED] ${content.content_title}:`, parseResult)
        previewText = parseResult.error || 'Content not available'
        editableText = content.content_body || 'No content'
      }
      
      // Always add the item, even if parsing failed
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
        parse_result: parseResult, // Include full parse result for debugging
        formatted_content: formattedContent,
        preview_text: previewText,
        has_valid_content: hasValidContent,
        editable_text: editableText,
        raw_content_body: content.content_body,
        api_debug_info: { // ✅ NEW: Store API debug info
          received_from_api: content.content_body,
          api_response_type: typeof content.content_body,
          api_keys: Object.keys(content)
        },
        content_metadata: content.content_metadata,
        generation_settings: content.generation_settings,
        intelligence_used: content.intelligence_used,
        is_amplified_content: content.amplification_context?.generated_from_amplified_intelligence || false,
        amplification_metadata: content.amplification_context?.amplification_metadata || {}
      })
    })
    
    console.log('📋 [FINAL SUMMARY] Display content processed:', {
      total_items: displayItems.length,
      generated_content_items: displayItems.filter(item => item.type === 'generated_content').length,
      items_with_valid_content: displayItems.filter(item => item.has_valid_content).length,
      items_with_parse_failures: displayItems.filter(item => !item.has_valid_content && item.type === 'generated_content').length
    })
    
    return displayItems
  }

  // ✅ ENHANCED: Content formatting with better structure detection
  const formatContentForDisplay = (content: any, contentType: string) => {
    if (!content) {
      return [{
        type: 'error',
        title: 'No Content',
        content: 'No content available',
        metadata: {}
      }]
    }

    // Handle fallback plain text
    if (content.fallback && content.text) {
      return [{
        type: 'plain_text',
        title: 'Content',
        content: content.text,
        metadata: { type: 'plain_text' }
      }]
    }

    console.log('🎨 Formatting content for display:', { contentType, content })

    switch (contentType) {
      case 'email_sequence':
        // Try multiple possible structures
        const emails = content.emails || content.email_sequence || content.sequence || []
        
        if (Array.isArray(emails) && emails.length > 0) {
          console.log(`📧 Found ${emails.length} emails in sequence`)
          return emails.map((email: any, index: number) => ({
            type: 'email',
            title: `Email ${email.email_number || email.number || index + 1}: ${email.subject || email.title || 'No Subject'}`,
            content: email.body || email.content || email.text || 'No content',
            metadata: {
              subject: email.subject || email.title,
              send_delay: email.send_delay || email.delay,
              strategic_angle: email.strategic_angle || email.strategy,
              angle_name: email.angle_name || email.angle,
              affiliate_focus: email.affiliate_focus,
              email_number: email.email_number || email.number || index + 1,
              preview: (email.body || email.content || email.text || '').substring(0, 100)
            }
          }))
        }
        
        // Single email fallback
        if (content.subject || content.body) {
          return [{
            type: 'email',
            title: `Email: ${content.subject || 'No Subject'}`,
            content: content.body || content.content || 'No content',
            metadata: {
              subject: content.subject,
              body: content.body
            }
          }]
        }
        break

      case 'social_media_posts':
      case 'SOCIAL_POSTS':
        const posts = content.posts || content.social_posts || content.content || []
        
        if (Array.isArray(posts) && posts.length > 0) {
          console.log(`📱 Found ${posts.length} social posts`)
          return posts.map((post: any, index: number) => ({
            type: 'social_post',
            title: `${post.platform || 'Social'} Post ${post.post_number || index + 1}`,
            content: post.content || post.text || post.body || 'No content',
            metadata: {
              platform: post.platform,
              hashtags: post.hashtags || [],
              character_count: post.character_count,
              post_number: post.post_number || index + 1,
              preview: (post.content || post.text || '').substring(0, 100)
            }
          }))
        }
        break

      case 'ad_copy':
        const ads = content.ads || content.ad_copy || content.advertisements || []
        
        if (Array.isArray(ads) && ads.length > 0) {
          console.log(`🎯 Found ${ads.length} ad variations`)
          return ads.map((ad: any, index: number) => ({
            type: 'ad',
            title: `${ad.platform || 'Ad'} Copy ${ad.ad_number || index + 1}`,
            content: formatAdContent(ad),
            metadata: {
              platform: ad.platform,
              headline: ad.headline || ad.title,
              body: ad.body || ad.content || ad.description,
              cta: ad.cta || ad.call_to_action,
              ad_number: ad.ad_number || index + 1
            }
          }))
        }
        break

      case 'video_script':
        if (content.script_text || content.script || content.content) {
          return [{
            type: 'video_script',
            title: content.title || 'Video Script',
            content: content.script_text || content.script || content.content,
            metadata: {
              duration: content.duration,
              tone: content.tone,
              word_count: (content.script_text || content.script || content.content || '').split(' ').length
            }
          }]
        }
        break

      case 'blog_post':
        if (content.title && (content.content || content.body || content.text)) {
          return [{
            type: 'blog_post',
            title: content.title,
            content: content.content || content.body || content.text,
            metadata: {
              word_count: content.word_count || (content.content || content.body || content.text || '').split(' ').length,
              tone: content.tone,
              topic: content.topic
            }
          }]
        }
        break

      case 'LANDING_PAGE':
        if (content.html_code || content.html || content.code) {
          return [{
            type: 'LANDING_PAGE',
            title: content.title || 'Landing Page',
            content: content.html_code || content.html || content.code,
            metadata: {
              page_type: content.page_type,
              code_lines: (content.html_code || content.html || content.code || '').split('\n').length
            }
          }]
        }
        break

      default:
        // Auto-detect content structure based on data
        if (content.emails || content.email_sequence) {
          return formatContentForDisplay(content, 'email_sequence')
        }
        if (content.posts || content.social_posts) {
          return formatContentForDisplay(content, 'social_media_posts')
        }
        if (content.ads || content.ad_copy) {
          return formatContentForDisplay(content, 'ad_copy')
        }
        if (content.script_text || content.script) {
          return formatContentForDisplay(content, 'video_script')
        }
        
        // Generic fallback
        return [{
          type: 'generic',
          title: `Generated ${contentType.replace('_', ' ')}`,
          content: typeof content === 'string' ? content : JSON.stringify(content, null, 2),
          metadata: { type: contentType }
        }]
    }

    // Final fallback
    console.warn('⚠️ No specific formatter found, using generic format')
    return [{
      type: 'generic',
      title: `Generated ${contentType.replace('_', ' ')}`,
      content: JSON.stringify(content, null, 2),
      metadata: { type: contentType, structure: Object.keys(content || {}) }
    }]
  }

  // Helper function to format ad content nicely
  const formatAdContent = (ad: any) => {
    const parts = []
    
    if (ad.headline || ad.title) {
      parts.push(`**${ad.headline || ad.title}**`)
    }
    
    if (ad.body || ad.content || ad.description) {
      parts.push(ad.body || ad.content || ad.description)
    }
    
    if (ad.cta || ad.call_to_action) {
      parts.push(`*CTA: ${ad.cta || ad.call_to_action}*`)
    }
    
    return parts.join('\n\n') || 'No content'
  }

  // ✅ ENHANCED: Better preview generation
  const getContentPreview = (formattedContent: any[], contentType: string, originalData: any) => {
    if (!formattedContent || formattedContent.length === 0) {
      return 'No content available'
    }

    const firstItem = formattedContent[0]
    
    switch (contentType) {
      case 'email_sequence':
        const emailCount = formattedContent.length
        if (emailCount > 1) {
          const subjects = formattedContent.map(item => item.metadata?.subject).filter(Boolean)
          return `${emailCount} emails: ${subjects.slice(0, 2).join(', ')}${subjects.length > 2 ? '...' : ''}`
        }
        return firstItem.metadata?.subject || firstItem.title
        
      case 'social_media_posts':
      case 'SOCIAL_POSTS':
        const platforms = Array.from(new Set(formattedContent.map(item => item.metadata?.platform).filter(Boolean)))
        return `${formattedContent.length} posts${platforms.length > 0 ? ` (${platforms.join(', ')})` : ''}`
        
      case 'ad_copy':
        const adPlatforms = Array.from(new Set(formattedContent.map(item => item.metadata?.platform).filter(Boolean)))
        return `${formattedContent.length} ad variations${adPlatforms.length > 0 ? ` (${adPlatforms.join(', ')})` : ''}`
        
      case 'video_script':
        return firstItem.metadata?.duration ? 
          `Video script (${firstItem.metadata.duration})` : 
          'Video script'
          
      case 'blog_post':
        return firstItem.metadata?.word_count ? 
          `Blog post (${firstItem.metadata.word_count} words)` : 
          firstItem.title || 'Blog post'
          
      case 'LANDING_PAGE':
        return 'Landing page HTML'
        
      default:
        return `${formattedContent.length} section${formattedContent.length !== 1 ? 's' : ''}`
    }
  }

  // ✅ ENHANCED: Create properly formatted editable text
  const createEditableText = (parsedContent: any, contentType: string): string => {
    if (!parsedContent) return 'No content'

    try {
      switch (contentType) {
        case 'email_sequence':
          const emails = parsedContent.emails || parsedContent.email_sequence || []
          
          if (Array.isArray(emails) && emails.length > 0) {
            let text = `EMAIL SEQUENCE: ${parsedContent.sequence_title || parsedContent.title || 'Email Campaign'}\n`
            text += `Total Emails: ${emails.length}\n`
            if (parsedContent.email_focus || parsedContent.focus) {
              text += `Focus: ${parsedContent.email_focus || parsedContent.focus}\n`
            }
            text += '\n' + '='.repeat(60) + '\n\n'
            
            emails.forEach((email: any, index: number) => {
              text += `EMAIL ${email.email_number || email.number || index + 1}\n`
              text += '-'.repeat(30) + '\n'
              text += `Subject: ${email.subject || email.title || 'No Subject'}\n`
              
              if (email.send_delay || email.delay) {
                text += `Send Delay: ${email.send_delay || email.delay}\n`
              }
              if (email.strategic_angle || email.strategy) {
                text += `Strategy: ${email.strategic_angle || email.strategy}\n`
              }
              if (email.angle_name || email.angle) {
                text += `Angle: ${email.angle_name || email.angle}\n`
              }
              
              text += '\nEmail Content:\n'
              text += (email.body || email.content || email.text || 'No content')
              text += '\n\n' + '='.repeat(60) + '\n\n'
            })
            
            return text
          }
          break
          
        case 'social_media_posts':
        case 'SOCIAL_POSTS':
          const posts = parsedContent.posts || parsedContent.social_posts || []
          
          if (Array.isArray(posts) && posts.length > 0) {
            let text = `SOCIAL MEDIA POSTS\n`
            text += `Total Posts: ${posts.length}\n\n`
            text += '='.repeat(60) + '\n\n'
            
            posts.forEach((post: any, index: number) => {
              text += `POST ${post.post_number || index + 1}\n`
              text += '-'.repeat(20) + '\n'
              if (post.platform) text += `Platform: ${post.platform}\n`
              text += '\nContent:\n'
              text += (post.content || post.text || post.body || 'No content')
              
              if (post.hashtags && Array.isArray(post.hashtags) && post.hashtags.length > 0) {
                text += '\n\nHashtags: ' + post.hashtags.join(' ')
              }
              
              text += '\n\n' + '='.repeat(60) + '\n\n'
            })
            
            return text
          }
          break
          
        case 'ad_copy':
          const ads = parsedContent.ads || parsedContent.ad_copy || []
          
          if (Array.isArray(ads) && ads.length > 0) {
            let text = `AD COPY VARIATIONS\n`
            text += `Total Ads: ${ads.length}\n\n`
            text += '='.repeat(60) + '\n\n'
            
            ads.forEach((ad: any, index: number) => {
              text += `AD ${ad.ad_number || index + 1}\n`
              text += '-'.repeat(15) + '\n'
              
              if (ad.platform) text += `Platform: ${ad.platform}\n`
              text += `Headline: ${ad.headline || ad.title || 'No Headline'}\n\n`
              text += `Body:\n${ad.body || ad.content || ad.description || 'No content'}\n\n`
              text += `Call-to-Action: ${ad.cta || ad.call_to_action || 'No CTA'}\n`
              
              text += '\n' + '='.repeat(60) + '\n\n'
            })
            
            return text
          }
          break
          
        case 'video_script':
          const scriptContent = parsedContent.script_text || parsedContent.script || parsedContent.content
          
          if (scriptContent) {
            let text = `VIDEO SCRIPT\n`
            text += `Title: ${parsedContent.title || 'Untitled'}\n`
            if (parsedContent.duration) text += `Duration: ${parsedContent.duration}\n`
            if (parsedContent.tone) text += `Tone: ${parsedContent.tone}\n`
            text += '\n' + '='.repeat(60) + '\n\n'
            text += scriptContent
            return text
          }
          break
          
        case 'blog_post':
          if (parsedContent.title && (parsedContent.content || parsedContent.body)) {
            let text = `BLOG POST\n`
            text += `Title: ${parsedContent.title}\n`
            if (parsedContent.word_count) text += `Word Count: ${parsedContent.word_count}\n`
            if (parsedContent.tone) text += `Tone: ${parsedContent.tone}\n`
            text += '\n' + '='.repeat(60) + '\n\n'
            text += (parsedContent.content || parsedContent.body)
            return text
          }
          break
          
        case 'LANDING_PAGE':
          const htmlContent = parsedContent.html_code || parsedContent.html || parsedContent.code
          
          if (htmlContent) {
            let text = `LANDING PAGE\n`
            text += `Title: ${parsedContent.title || 'Untitled'}\n`
            if (parsedContent.page_type) text += `Type: ${parsedContent.page_type}\n`
            text += '\n' + '='.repeat(60) + '\n\n'
            text += 'HTML CODE:\n'
            text += htmlContent
            return text
          }
          break
          
        default:
          // Auto-detect and format
          if (parsedContent.emails || parsedContent.email_sequence) {
            return createEditableText(parsedContent, 'email_sequence')
          }
          if (parsedContent.posts || parsedContent.social_posts) {
            return createEditableText(parsedContent, 'social_media_posts')
          }
          if (parsedContent.ads || parsedContent.ad_copy) {
            return createEditableText(parsedContent, 'ad_copy')
          }
          
          return JSON.stringify(parsedContent, null, 2)
      }
      
      // Fallback to JSON
      return JSON.stringify(parsedContent, null, 2)
      
    } catch (error) {
      console.error('Error creating editable text:', error)
      return JSON.stringify(parsedContent, null, 2)
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
      'intelligence_source': 'bg-purple-100 text-purple-800 border-purple-200',
      'email_sequence': 'bg-blue-100 text-blue-800 border-blue-200',
      'social_media_posts': 'bg-pink-100 text-pink-800 border-pink-200',
      'social_posts': 'bg-pink-100 text-pink-800 border-pink-200',
      'ad_copy': 'bg-green-100 text-green-800 border-green-200',
      'blog_post': 'bg-purple-100 text-purple-800 border-purple-200',
      'LANDING_PAGE': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'video_script': 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200'
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
        textContent += content.editable_text || JSON.stringify(content.parsed_content, null, 2)
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
      textContent += content.editable_text || JSON.stringify(content.parsed_content, null, 2)
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
    console.log('🔄 Starting content save process:', {
      contentId,
      contentLength: newContent.length,
      contentPreview: newContent.substring(0, 100)
    })
    
    try {
      // ✅ ENHANCED: Use the actual API to update content
      const updateResult = await api.updateContent(campaignId, contentId, {
        content_body: newContent
      })
      
      console.log('✅ Content update API response:', updateResult)
      
      // Refresh content after successful save
      console.log('🔄 Refreshing content after save...')
      await handleRefresh()
      
      console.log('✅ Content saved and refreshed successfully')
      
    } catch (error) {
      console.error('❌ Failed to save content:', error)
      throw error // Re-throw so the modal can handle the error
    }
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
                          : 'Content parsing failed'
                      }
                      {item.is_amplified_content && (
                        <span className="block text-purple-600 text-xs mt-1">
                          ✨ Enhanced with amplified intelligence
                        </span>
                      )}
                      {!item.has_valid_content && item.type === 'generated_content' && (
                        <span className="block text-amber-600 text-xs mt-1">
                          ⚠️ {item.parse_result?.isEmpty ? 'Content not generated - click to regenerate' : (item.parse_result?.error || 'Content not available')}
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