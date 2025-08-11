// src/components/intelligence/ContentGenerator.tsx - FIXED WITH AD COPY DISPLAY FIX
import React, { useState, useCallback, useEffect } from 'react'
import { 
  Wand2, 
  Mail, 
  MessageSquare, 
  FileText, 
  Globe, 
  Video, 
  Megaphone,
  Settings,
  Copy,
  Download,
  Eye,
  TrendingUp,
  Star,
  Loader2,
  CheckCircle,
  Lightbulb,
  AlertCircle,
  Calendar,
  Edit3
} from 'lucide-react'

import ContentViewEditModal from '../campaigns/ContentViewEditModal'
import { useApi } from '../../lib/api'

interface IntelligenceSource {
  id: string
  source_title: string
  source_type: string
  confidence_score: number
}

interface ContentGeneratorProps {
  campaignId: string
  intelligenceSources: IntelligenceSource[]
}

interface GeneratedContent {
  content_id: string
  content_type: string
  generated_content: {
    title: string
    content: any
    metadata?: any
    usage_tips?: string[]
  }
  smart_url?: string
  performance_predictions: any
}

// 🆕 NEW: Content item interface for list display
interface ContentItem {
  id: string
  content_type: string
  title: string
  created_at: string
  confidence_score?: number
  is_published?: boolean
  user_rating?: number
  preview_text?: string
}

const CONTENT_TYPES = [
  {
    id: 'email_sequence',
    name: 'Email Sequence',
    icon: Mail,
    description: 'Multi-email nurture sequence',
    credits: 3,
    color: 'bg-gray-100'
  },
  {
    id: 'SOCIAL_POSTS',
    name: 'Social Media Posts',
    icon: MessageSquare,
    description: '10+ social media posts',
    credits: 2,
    color: 'bg-gray-100'
  },
  {
    id: 'ad_copy',
    name: 'Ad Copy',
    icon: Megaphone,
    description: 'Multiple ad variations',
    credits: 2,
    color: 'bg-gray-100'
  },
  {
    id: 'blog_post',
    name: 'Blog Post',
    icon: FileText,
    description: 'SEO-optimized article',
    credits: 4,
    color: 'bg-gray-100'
  },
  {
    id: 'LANDING_PAGE',
    name: 'Landing Page',
    icon: Globe,
    description: 'Conversion-optimized page',
    credits: 5,
    color: 'bg-gray-100'
  },
  {
    id: 'video_script',
    name: 'Video Script',
    icon: Video,
    description: 'Engaging video content',
    credits: 3,
    color: 'bg-gray-100'
  }
]

export default function ContentGenerator({ campaignId, intelligenceSources }: ContentGeneratorProps) {
  const api = useApi()
  
  // Generation state
  const [selectedContentType, setSelectedContentType] = useState<string | null>(null)
  const [selectedIntelligence, setSelectedIntelligence] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [showPreferences, setShowPreferences] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 🆕 NEW: Content list state
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [isLoadingContent, setIsLoadingContent] = useState(false)
  const [selectedContentItem, setSelectedContentItem] = useState<any>(null)
  const [showContentModal, setShowContentModal] = useState(false)
  
  // Content preferences state
  const [preferences, setPreferences] = useState({
    tone: 'conversational',
    length: 'medium',
    audience: 'general',
    style: 'engaging',
    platform: 'general'
  })

  // 🔥 FIXED: Format ad copy content for proper display in modal
  const formatAdCopyForDisplay = (adData: any) => {
    console.log('🔍 formatAdCopyForDisplay received:', adData);
    console.log('🔍 adData.ads:', adData.ads);
    
    if (!adData.ads || !Array.isArray(adData.ads)) {
      console.warn('⚠️ No ads array found in data');
      return {
        ...adData,
        has_valid_content: false,
        parse_result: {
          error: 'No ads found in content',
          isEmpty: true
        }
      };
    }
    
    console.log(`📊 Processing ${adData.ads.length} ads`);
    
    // Format each ad for proper display
    const formattedAds = adData.ads.map((ad: any, index: number) => {
      console.log(`🔍 Processing ad ${index + 1}:`, ad);
      console.log(`📝 Ad fields available:`, Object.keys(ad));
      console.log(`📝 Ad description raw:`, ad.description);
      console.log(`📝 Ad description type:`, typeof ad.description);
      console.log(`📝 Ad description === 'undefined':`, ad.description === 'undefined');
      console.log(`📝 Ad description === undefined:`, ad.description === undefined);
      
      // 🔥 THE ACTUAL FIX: Check if description is the string "undefined"
      let description = ad.description;
      if (description === 'undefined' || description === undefined || description === null || description === '') {
        description = 'No Description Available';
        console.log(`🔧 Fixed description for ad ${index + 1}: changed from "${ad.description}" to "${description}"`);
      }
      
      const headline = ad.headline || `Ad ${index + 1}`;
      const cta = ad.cta || 'Learn More';
      
      const formattedContent = `**${headline}**\n\n${description}\n\n*CTA: ${cta}*`;
      
      console.log(`✅ Final formatted ad ${index + 1}:`, {
        headline,
        description: description.substring(0, 50) + '...',
        cta,
        content_length: formattedContent.length
      });

      // 🔍 CRITICAL TEST: Log the exact content being created
      console.log(`🎯 FORMATTED CONTENT FOR AD ${index + 1}:`);
      console.log('Raw content string:', formattedContent);
      console.log('Contains undefined?:', formattedContent.includes('undefined'));
      
      return {
        title: headline,
        content: formattedContent,
        metadata: {
          platform: ad.platform || 'Unknown',
          objective: ad.objective || 'Unknown',
          angle: ad.angle || 'Unknown',
          target_audience: ad.target_audience || 'Unknown',
          product_name: ad.product_name || 'Unknown',
          ad_number: ad.ad_number || index + 1
        }
      };
    });
    
    console.log('✅ All ads formatted successfully:', formattedAds.length);

    console.log('🎯 FINAL FORMATTED_ADS ARRAY:', formattedAds);

    // Then check what the actual content string looks like
      formattedAds.forEach((ad: any, index: number) => {
        console.log(`🎯 AD ${index + 1} FINAL CONTENT:`, ad.content);
    });
    
    return {
      ...adData,
      formatted_content: formattedAds,
      has_valid_content: true
    };
  };

  // 🔥 NEW: Format email sequence content for proper display in modal
  const formatEmailSequenceForDisplay = (emailData: any) => {
    if (!emailData.emails) return emailData;
    
    console.log('🔧 Formatting email sequence for display:', emailData);
    
    // Format each email for proper display
    const formattedEmails = emailData.emails.map((email: any, index: number) => ({
      title: email.subject || `Email ${index + 1}`,
      content: `**Subject: ${email.subject || 'No Subject'}**\n\n${email.body || 'No Content'}`,
      metadata: {
        email_number: email.email_number || index + 1,
        send_delay: email.send_delay || 'Unknown',
        strategic_angle: email.strategic_angle || 'Unknown',
        campaign_focus: email.campaign_focus || 'Unknown'
      }
    }));
    
    console.log('✅ Formatted emails for display:', formattedEmails);
    
    return {
      ...emailData,
      formatted_content: formattedEmails,
      has_valid_content: true
    };
  };

  // 🔥 NEW: Format social posts content for proper display in modal
  const formatSocialPostsForDisplay = (socialData: any) => {
    if (!socialData.posts) return socialData;
    
    console.log('🔧 Formatting social posts for display:', socialData);
    
    // Format each post for proper display
    const formattedPosts = socialData.posts.map((post: any, index: number) => ({
      title: `${post.platform || 'Social'} Post ${index + 1}`,
      content: post.content || 'No Content',
      metadata: {
        platform: post.platform || 'Unknown',
        post_number: post.post_number || index + 1,
        hashtags: post.hashtags || [],
        estimated_reach: post.estimated_reach || 'Unknown'
      }
    }));
    
    console.log('✅ Formatted social posts for display:', formattedPosts);
    
    return {
      ...socialData,
      formatted_content: formattedPosts,
      has_valid_content: true
    };
  };

  // 🔥 FIXED: Universal content formatter for different content types
  const formatContentForDisplay = (contentDetail: any) => {
    const contentType = contentDetail.content_type;
    let parsedContent = contentDetail.parsed_content;
    
    console.log('🔧 Formatting content for display:', { 
      contentType, 
      has_parsed_content: !!parsedContent,
      content_body_type: typeof contentDetail.content_body 
    });
    
    // 🔥 FIX: If no parsed_content, parse the content_body
    if (!parsedContent && contentDetail.content_body) {
      console.log('🔄 No parsed_content, parsing content_body...');
      try {
        if (typeof contentDetail.content_body === 'string') {
          parsedContent = JSON.parse(contentDetail.content_body);
          console.log('✅ Successfully parsed content_body');
        } else {
          parsedContent = contentDetail.content_body;
          console.log('✅ Used content_body directly (already object)');
        }
      } catch (error) {
        console.error('❌ Failed to parse content_body:', error);
        return {
          ...contentDetail,
          has_valid_content: false,
          parse_result: {
            error: 'Failed to parse content data',
            isEmpty: true,
            suggestion: 'Try regenerating this content'
          }
        };
      }
    }
    
    if (!parsedContent) {
      console.warn('⚠️ No parsed content available');
      return {
        ...contentDetail,
        has_valid_content: false,
        parse_result: {
          error: 'No parsed content available',
          isEmpty: true,
          suggestion: 'Try regenerating this content'
        }
      };
    }
    
    console.log('📊 Parsed content structure:', Object.keys(parsedContent));
    
    let formattedData = parsedContent;
    
    // Apply content-type specific formatting
    switch (contentType) {
      case 'ad_copy':
        formattedData = formatAdCopyForDisplay(parsedContent);
        break;
      case 'email_sequence':
        formattedData = formatEmailSequenceForDisplay(parsedContent);
        break;
      case 'social_posts':
      case 'SOCIAL_POSTS':
        formattedData = formatSocialPostsForDisplay(parsedContent);
        break;
      default:
        // For other content types, create a simple single-item view
        formattedData = {
          ...parsedContent,
          formatted_content: [{
            title: contentDetail.content_title || `${contentType} Content`,
            content: typeof parsedContent === 'string' ? parsedContent : JSON.stringify(parsedContent, null, 2),
            metadata: {
              content_type: contentType,
              generated_at: contentDetail.created_at
            }
          }],
          has_valid_content: true
        };
    }
    
    return {
      ...contentDetail,
      parsed_content: parsedContent, // Ensure this is set
      ...formattedData
    };
  };

  // 🆕 NEW: Load existing content when component mounts
  const loadContentItems = useCallback(async () => {
    setIsLoadingContent(true)
    try {
      const content = await api.getGeneratedContent(campaignId)
      console.log('📋 Loaded content items:', content)
      
      // Transform API response to ContentItem format
      const transformedItems: ContentItem[] = content.map((item: any) => ({
        id: item.id || item.content_id,
        content_type: item.content_type,
        title: item.content_title || item.title || `${formatContentType(item.content_type)} Content`,
        created_at: item.created_at,
        confidence_score: item.confidence_score,
        is_published: item.is_published,
        user_rating: item.user_rating,
        preview_text: item.content_metadata?.preview || getPreviewText(item.content_body)
      }))
      
      setContentItems(transformedItems)
    } catch (error) {
      console.error('❌ Failed to load content items:', error)
      // Don't show error for missing content - it's normal for new campaigns
      setContentItems([])
    } finally {
      setIsLoadingContent(false)
    }
  }, [campaignId, api])

  // Load content on component mount
  useEffect(() => {
    loadContentItems()
  }, [loadContentItems])

  // 🔥 FIXED: Handle content item click with enhanced debugging
  // 🔍 ENHANCED DEBUGGING: Add this to handleContentItemClick function
// Replace the existing handleContentItemClick function with this enhanced debugging version

const handleContentItemClick = async (contentItem: ContentItem) => {
  try {
    console.log('🔍 === DETAILED API DEBUGGING ===');
    console.log('1. ContentItem clicked:', contentItem.id);
    console.log('2. ContentItem type:', contentItem.content_type);
    
    // Load full content detail
    const fullContent = await api.getContentDetail(campaignId, contentItem.id);
    console.log('3. 🔍 RAW API RESPONSE:', fullContent);
    console.log('4. 🔍 content_body RAW:', fullContent.content_body);
    console.log('5. 🔍 content_body TYPE:', typeof fullContent.content_body);
    console.log('6. 🔍 parsed_content RAW:', fullContent.parsed_content);
    console.log('7. 🔍 parsed_content TYPE:', typeof fullContent.parsed_content);
    
    // 🔥 CRITICAL: Test manual JSON parsing of content_body
    if (typeof fullContent.content_body === 'string') {
      try {
        const manualParse = JSON.parse(fullContent.content_body);
        console.log('8. 🔍 MANUAL PARSE SUCCESS:', manualParse);
        
        if (manualParse.ads && Array.isArray(manualParse.ads)) {
          console.log('9. 🔍 MANUAL PARSE - FIRST AD:', manualParse.ads[0]);
          console.log('10. 🔍 MANUAL PARSE - FIRST AD DESCRIPTION:', manualParse.ads[0].description);
          console.log('11. 🔍 MANUAL PARSE - DESCRIPTION TYPE:', typeof manualParse.ads[0].description);
          console.log('12. 🔍 MANUAL PARSE - DESCRIPTION VALUE:', JSON.stringify(manualParse.ads[0].description));
        }
      } catch (parseError) {
        console.error('8. ❌ MANUAL PARSE FAILED:', parseError);
      }
    }
    
    // 🔥 CRITICAL: Compare parsed_content vs manual parse
    if (fullContent.parsed_content) {
      console.log('13. 🔍 API parsed_content exists');
      if (fullContent.parsed_content.ads && Array.isArray(fullContent.parsed_content.ads)) {
        console.log('14. 🔍 API PARSED - FIRST AD:', fullContent.parsed_content.ads[0]);
        console.log('15. 🔍 API PARSED - FIRST AD DESCRIPTION:', fullContent.parsed_content.ads[0].description);
        console.log('16. 🔍 API PARSED - DESCRIPTION TYPE:', typeof fullContent.parsed_content.ads[0].description);
        console.log('17. 🔍 API PARSED - DESCRIPTION VALUE:', JSON.stringify(fullContent.parsed_content.ads[0].description));
        
        // 🔥 COMPARE: Manual vs API parsed
        if (typeof fullContent.content_body === 'string') {
          try {
            const manualParse = JSON.parse(fullContent.content_body);
            console.log('18. 🔍 COMPARISON - Manual vs API:');
            console.log('    Manual description:', manualParse.ads[0].description);
            console.log('    API description:', fullContent.parsed_content.ads[0].description);
            console.log('    Are they equal?:', manualParse.ads[0].description === fullContent.parsed_content.ads[0].description);
          } catch (e) {
            console.log('18. ❌ Could not compare due to parse error');
          }
        }
      }
    } else {
      console.log('13. ⚠️ No API parsed_content - will use manual parse');
    }
    
    // 🔥 FIX: Ensure we use content_body if parsed_content is missing or invalid
    if (!fullContent.parsed_content && fullContent.content_body) {
      console.log('19. 🔧 No parsed_content, attempting to parse content_body');
      try {
        if (typeof fullContent.content_body === 'string') {
          fullContent.parsed_content = JSON.parse(fullContent.content_body);
          console.log('20. ✅ Successfully parsed content_body into parsed_content');
        } else {
          fullContent.parsed_content = fullContent.content_body;
          console.log('20. ✅ Used content_body as parsed_content (already object)');
        }
      } catch (error) {
        console.error('20. ❌ Failed to parse content_body:', error);
        fullContent.parsed_content = { error: 'Failed to parse content' };
      }
    }
    
    // Format content for proper display based on content type
    const formattedContent = formatContentForDisplay(fullContent);
    console.log('21. 🔍 FINAL FORMATTED CONTENT:', {
      has_valid_content: formattedContent.has_valid_content,
      formatted_content_length: formattedContent.formatted_content?.length,
      first_item_preview: formattedContent.formatted_content?.[0]?.content?.substring(0, 100)
    });
    console.log('🔍 === END DETAILED API DEBUGGING ===');
    
    setSelectedContentItem(formattedContent);
    setShowContentModal(true);
  } catch (error) {
    console.error('❌ Failed to load content detail:', error);
    setError(error instanceof Error ? error.message : 'Failed to load content');
  }
};

  // 🆕 NEW: Handle content save
  const handleContentSave = async (contentId: string, newContent: string) => {
    try {
      await api.updateContent(campaignId, contentId, { content_body: newContent })
      console.log('✅ Content saved successfully')
      
      // Refresh content list
      await loadContentItems()
    } catch (error) {
      console.error('❌ Failed to save content:', error)
      throw error
    }
  }

  // 🆕 NEW: Format content type for display
  const formatContentType = (type: string): string => {
    const typeMap: Record<string, string> = {
      'email_sequence': 'Email Sequence',
      'SOCIAL_POSTS': 'Social Posts',
      'ad_copy': 'Ad Copy',
      'blog_post': 'Blog Post',
      'LANDING_PAGE': 'Landing Page',
      'video_script': 'Video Script'
    }
    return typeMap[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  // 🔥 FIXED: Get preview text from content with safe JSON parsing
  const getPreviewText = (content: any): string => {
    if (typeof content === 'string') {
      // Handle the case where content_body is the string "undefined"
      if (content === 'undefined' || content === 'null') {
        return 'No content available'
      }
      
      // Try to parse JSON string
      try {
        const parsed = JSON.parse(content)
        if (parsed && typeof parsed === 'object') {
          if (parsed.ads && Array.isArray(parsed.ads)) {
            const validAds = parsed.ads.filter((ad: any) => 
              (ad.description && ad.description !== 'undefined') ||
              (ad.body && ad.body !== 'undefined') ||
              (ad.content && ad.content !== 'undefined')
            );
            return `${parsed.ads.length} ad variations (${validAds.length} valid)`
          }
          if (parsed.emails && Array.isArray(parsed.emails)) {
            return `${parsed.emails.length} email sequence`
          }
          if (parsed.posts && Array.isArray(parsed.posts)) {
            return `${parsed.posts.length} social posts`
          }
          return 'Generated content available'
        }
      } catch (jsonError) {
        // If JSON parsing fails, return safe preview of the string
        console.warn('⚠️ JSON parsing failed in preview, using string preview')
      }
      
      return content.substring(0, 100) + (content.length > 100 ? '...' : '')
    }
    
    if (content && typeof content === 'object') {
      if (content.ads && Array.isArray(content.ads)) {
        return `${content.ads.length} ad variations`
      }
      if (content.emails && Array.isArray(content.emails)) {
        return `${content.emails.length} email sequence`
      }
      if (content.posts && Array.isArray(content.posts)) {
        return `${content.posts.length} social posts`
      }
      
      const text = JSON.stringify(content).substring(0, 100)
      return text + (text.length >= 100 ? '...' : '')
    }
    
    return 'No preview available'
  }

  const generateContent = useCallback(async () => {
    if (!selectedContentType || !selectedIntelligence) return
    
    setIsGenerating(true)
    setError(null)
    
    try {
      const response = await api.generateContent({
        content_type: selectedContentType,
        campaign_id: campaignId,
        preferences: preferences
      })
      
      setGeneratedContent(response)
      
      // 🆕 NEW: Refresh content list after generation
      await loadContentItems()
      
    } catch (error) {
      console.error('Content generation error:', error)
      setError(error instanceof Error ? error.message : 'Content generation failed')
    } finally {
      setIsGenerating(false)
    }
  }, [selectedContentType, selectedIntelligence, preferences, campaignId, api, loadContentItems])

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      console.log('Content copied to clipboard')
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }, [])

  const downloadContent = useCallback((content: any, filename: string) => {
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [])

  if (intelligenceSources.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
        <Wand2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-black mb-2">No Intelligence Sources</h3>
        <p className="text-gray-600">
          Analyze competitor content first to generate intelligence-driven marketing materials.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-light text-black flex items-center">
              <Wand2 className="h-6 w-6 mr-3 text-black" />
              Content Generator
            </h2>
            <p className="text-gray-600 mt-2">
              Generate marketing content using competitive intelligence
            </p>
          </div>
          <button
            onClick={() => setShowPreferences(!showPreferences)}
            className="flex items-center px-6 py-3 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            <Settings className="h-4 w-4 mr-2" />
            Preferences
          </button>
        </div>

        {/* Preferences Panel */}
        {showPreferences && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="font-medium text-black mb-6">Content Preferences</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-3">Tone</label>
                <select
                  value={preferences.tone}
                  onChange={(e) => setPreferences({...preferences, tone: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                >
                  <option value="professional">Professional</option>
                  <option value="conversational">Conversational</option>
                  <option value="enthusiastic">Enthusiastic</option>
                  <option value="educational">Educational</option>
                  <option value="humorous">Humorous</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-3">Length</label>
                <select
                  value={preferences.length}
                  onChange={(e) => setPreferences({...preferences, length: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                >
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-3">Audience</label>
                <select
                  value={preferences.audience}
                  onChange={(e) => setPreferences({...preferences, audience: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                >
                  <option value="general">General</option>
                  <option value="beginners">Beginners</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-3">Style</label>
                <select
                  value={preferences.style}
                  onChange={(e) => setPreferences({...preferences, style: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                >
                  <option value="engaging">Engaging</option>
                  <option value="informative">Informative</option>
                  <option value="persuasive">Persuasive</option>
                  <option value="inspiring">Inspiring</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-3">Platform</label>
                <select
                  value={preferences.platform}
                  onChange={(e) => setPreferences({...preferences, platform: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                >
                  <option value="general">General</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="twitter">Twitter</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Intelligence Source Selection */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <h3 className="font-medium text-black mb-6">Select Intelligence Source</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {intelligenceSources.map((source) => (
            <button
              key={source.id}
              onClick={() => setSelectedIntelligence(source.id)}
              className={`p-6 border-2 rounded-2xl text-left transition-all ${
                selectedIntelligence === source.id
                  ? 'border-gray-300 bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-black truncate">{source.source_title}</h4>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-black mr-1" />
                  <span className="text-sm font-medium text-gray-600">
                    {Math.round(source.confidence_score * 100)}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 capitalize">{source.source_type.replace('_', ' ')}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Content Type Selection */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <h3 className="font-medium text-black mb-6">Choose Content Type</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {CONTENT_TYPES.map((contentType) => {
            const IconComponent = contentType.icon
            return (
              <button
                key={contentType.id}
                onClick={() => setSelectedContentType(contentType.id)}
                className={`p-6 border-2 rounded-2xl text-left transition-all ${
                  selectedContentType === contentType.id
                    ? 'border-gray-300 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-xl ${contentType.color} mr-4`}>
                    <IconComponent className="h-6 w-6 text-black" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-black">{contentType.name}</h4>
                    <p className="text-sm text-gray-600">{contentType.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{contentType.credits} credits</span>
                  {selectedContentType === contentType.id && (
                    <CheckCircle className="h-4 w-4 text-black" />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-center">
        <button
          onClick={generateContent}
          disabled={!selectedContentType || !selectedIntelligence || isGenerating}
          className="px-12 py-4 bg-black text-white rounded-lg font-medium hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-lg"
        >
          {isGenerating ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
          ) : (
            <Wand2 className="h-5 w-5 mr-3" />
          )}
          {isGenerating ? 'Generating Content...' : 'Generate Content'}
        </button>
      </div>

      {/* 🆕 NEW: Existing Content List */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-medium text-black">Generated Content</h3>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {contentItems.length} item{contentItems.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={loadContentItems}
              disabled={isLoadingContent}
              className="flex items-center px-4 py-2 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              {isLoadingContent ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Eye className="h-4 w-4 mr-2" />
              )}
              Refresh
            </button>
          </div>
        </div>

        {isLoadingContent ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="text-gray-600">Loading content...</span>
            </div>
          </div>
        ) : contentItems.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-600 mb-2">No Content Generated Yet</h4>
            <p className="text-gray-500">
              Generate your first piece of content using the form above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contentItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleContentItemClick(item)}
                className="p-6 border border-gray-200 rounded-2xl text-left hover:border-gray-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-black group-hover:text-gray-700 truncate">
                    {item.title}
                  </h4>
                  <Edit3 className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      {formatContentType(item.content_type)}
                    </span>
                    {item.confidence_score && (
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-400 mr-1" />
                        <span className="text-xs text-gray-600">
                          {Math.round(item.confidence_score * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {item.preview_text && (
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {item.preview_text}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.is_published && (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                          Published
                        </span>
                      )}
                      {item.user_rating && (
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                          <span>{item.user_rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Generated Content Display (for newly generated content) */}
      {generatedContent && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-medium text-black">
              {generatedContent.generated_content?.title || 'Generated Content'}
            </h3>
            <div className="flex space-x-3">
              <button
                onClick={() => copyToClipboard(JSON.stringify(generatedContent.generated_content, null, 2))}
                className="flex items-center px-4 py-3 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </button>
              <button
                onClick={() => downloadContent(generatedContent.generated_content, `${generatedContent.content_type}.json`)}
                className="flex items-center px-4 py-3 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </button>
            </div>
          </div>

          {/* Performance Predictions */}
          {generatedContent.performance_predictions && (
            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-5 w-5 text-black mr-3" />
                <h4 className="font-medium text-black">Performance Predictions</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {Object.entries(generatedContent.performance_predictions).map(([key, value]) => {
                  if (key === 'optimization_suggestions' || key === 'success_factors') return null
                  return (
                    <div key={key} className="text-center">
                      <div className="text-lg font-semibold text-black">
                        {typeof value === 'number' 
                          ? `${Math.round(value * 100)}%` 
                          : String(value)}
                      </div>
                      <div className="text-sm text-gray-600 capitalize">
                        {key.replace(/_/g, ' ')}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Smart URL */}
          {generatedContent.smart_url && (
            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <div className="flex items-center mb-4">
                <Globe className="h-5 w-5 text-black mr-3" />
                <h4 className="font-medium text-black">Smart Tracking URL</h4>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={generatedContent.smart_url}
                  readOnly
                  className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm"
                />
                <button
                  onClick={() => copyToClipboard(generatedContent.smart_url || '')}
                  className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium"
                >
                  Copy URL
                </button>
              </div>
            </div>
          )}

          {/* Usage Tips */}
          {generatedContent.generated_content.usage_tips && generatedContent.generated_content.usage_tips.length > 0 && (
            <div className="mt-8 bg-gray-50 rounded-2xl p-6">
              <div className="flex items-center mb-4">
                <Lightbulb className="h-5 w-5 text-black mr-3" />
                <h4 className="font-medium text-black">Usage Tips</h4>
              </div>
              <ul className="space-y-2">
                {generatedContent.generated_content.usage_tips.map((tip: string, index: number) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start">
                    <span className="text-black mr-3">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex space-x-4 pt-6 border-t border-gray-200">
            <button 
              onClick={() => {
                // Save content to campaign
                console.log('Saving content to campaign:', generatedContent)
                // Refresh content list to show the newly saved content
                loadContentItems()
              }}
              className="flex-1 bg-black text-white py-4 px-6 rounded-lg font-medium hover:bg-gray-900 transition-colors"
            >
              Save to Campaign
            </button>
            <button 
              onClick={() => {
                // Generate more variations with same settings
                generateContent()
              }}
              className="flex-1 bg-gray-100 text-black py-4 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Generate More Variations
            </button>
            <button 
              onClick={() => {
                // Preview content in new window or modal
                console.log('Previewing content:', generatedContent)
              }}
              className="px-8 py-4 bg-gray-100 text-black rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </button>
          </div>
        </div>
      )}

      {/* 🔥 FIXED: Content View/Edit Modal with proper formatting */}
      {showContentModal && selectedContentItem && (
        <ContentViewEditModal
          content={selectedContentItem}
          isOpen={showContentModal}
          onClose={() => {
            setShowContentModal(false)
            setSelectedContentItem(null)
          }}
          onSave={handleContentSave}
          onRefresh={loadContentItems}
          formatContentType={formatContentType}
        />
      )}
    </div>
  )
}