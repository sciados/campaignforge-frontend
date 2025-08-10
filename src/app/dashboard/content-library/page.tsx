// src/app/dashboard/content-library/page.tsx - COMPLETE REDESIGN
"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, Filter, ArrowLeft, Sparkles, ChevronDown, ChevronRight,
  FileText, Calendar, Globe, Star, Edit, Copy, Download, Trash2,
  Plus, Eye, Grid, List, SortAsc, SortDesc, AlertCircle, RefreshCw,
  Clock, TrendingUp, Zap, Award, Archive, Play
} from 'lucide-react'
import { apiClient, type User as ApiUser, type Campaign as ApiCampaign } from '@/lib/api'
import ContentViewEditModal from '@/components/campaigns/ContentViewEditModal'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface User {
  id: string
  email: string
  full_name: string
  role: string
  company: {
    id: string
    company_name: string
    company_slug: string
    subscription_tier: string
    monthly_credits_used: number
    monthly_credits_limit: number
    company_size?: string
  }
}

interface ContentItem {
  id: string
  content_type: string
  content_title: string
  content_body: string
  content_metadata: any
  generation_settings: any
  intelligence_used: any
  performance_data?: any
  user_rating?: number
  is_published?: boolean
  published_at?: string
  created_at: string
  updated_at?: string
  campaign_id: string
  campaign_title?: string
}

interface Campaign {
  id: string
  title: string
  description: string
  campaign_type: string
  status: string
  created_at: string
  updated_at: string
  content_count?: number
}

interface ContentGroup {
  contentType: string
  icon: string
  label: string
  color: string
  items: ContentItem[]
  count: number
}

interface CampaignSection {
  id: string
  title: string
  contentGroups: ContentGroup[]
  totalContentCount: number
  status: string
  created_at: string
}

interface LibraryStats {
  totalContentPieces: number
  recentContent: number
  contentTypes: number
  avgQualityScore: number
  totalCampaigns: number
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONTENT_TYPE_CONFIG = {
  'email_sequence': { 
    label: 'Email Sequences', 
    icon: '📧', 
    color: 'bg-blue-100 text-blue-800' 
  },
  'SOCIAL_POSTS': { 
    label: 'Social Media', 
    icon: '📱', 
    color: 'bg-purple-100 text-purple-800' 
  },
  'social_media_posts': { 
    label: 'Social Media', 
    icon: '📱', 
    color: 'bg-purple-100 text-purple-800' 
  },
  'ad_copy': { 
    label: 'Ad Copy', 
    icon: '📢', 
    color: 'bg-red-100 text-red-800' 
  },
  'blog_post': { 
    label: 'Blog Posts', 
    icon: '📝', 
    color: 'bg-green-100 text-green-800' 
  },
  'LANDING_PAGE': { 
    label: 'Landing Pages', 
    icon: '🌐', 
    color: 'bg-yellow-100 text-yellow-800' 
  },
  'video_script': { 
    label: 'Video Scripts', 
    icon: '🎥', 
    color: 'bg-indigo-100 text-indigo-800' 
  },
  'email': { 
    label: 'Emails', 
    icon: '📧', 
    color: 'bg-blue-100 text-blue-800' 
  },
  'newsletter': { 
    label: 'Newsletters', 
    icon: '📰', 
    color: 'bg-cyan-100 text-cyan-800' 
  },
  'case_study': { 
    label: 'Case Studies', 
    icon: '📊', 
    color: 'bg-orange-100 text-orange-800' 
  }
}

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: Play },
  review: { label: 'Review', color: 'bg-yellow-100 text-yellow-800', icon: Eye },
  active: { label: 'Active', color: 'bg-green-100 text-green-800', icon: TrendingUp },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: Award },
  archived: { label: 'Archived', color: 'bg-gray-100 text-gray-600', icon: Archive }
}

const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Newest First' },
  { value: 'date_asc', label: 'Oldest First' },
  { value: 'title_asc', label: 'Title A-Z' },
  { value: 'title_desc', label: 'Title Z-A' },
  { value: 'rating_desc', label: 'Highest Rated' },
  { value: 'type_asc', label: 'Content Type' }
]

export default function ContentLibraryRedesign() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [user, setUser] = useState<User | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [allContent, setAllContent] = useState<ContentItem[]>([])
  const [organizedContent, setOrganizedContent] = useState<CampaignSection[]>([])
  const [stats, setStats] = useState<LibraryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('')
  const [contentTypeFilter, setContentTypeFilter] = useState('all')
  const [campaignFilter, setCampaignFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date_desc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(new Set())
  
  // Modal State
  const [selectedContentItem, setSelectedContentItem] = useState<any>(null)
  const [showContentModal, setShowContentModal] = useState(false)
  const [contentModalLoading, setContentModalLoading] = useState(false)
  const [contentModalError, setContentModalError] = useState<string | null>(null)
  
  const router = useRouter()
  const isLoadingRef = useRef(false)
  const hasLoadedRef = useRef(false)

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const groupContentByType = useCallback((content: ContentItem[]): ContentGroup[] => {
    const groups: Record<string, ContentItem[]> = {}
    
    content.forEach(item => {
      const type = item.content_type
      if (!groups[type]) {
        groups[type] = []
      }
      groups[type].push(item)
    })

    return Object.entries(groups).map(([type, items]) => {
      const config = CONTENT_TYPE_CONFIG[type as keyof typeof CONTENT_TYPE_CONFIG] || {
        label: formatContentType(type),
        icon: '📄',
        color: 'bg-gray-100 text-gray-800'
      }

      return {
        contentType: type,
        icon: config.icon,
        label: config.label,
        color: config.color,
        items: items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
        count: items.length
      }
    }).sort((a, b) => b.count - a.count) // Sort by count descending
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const formatContentType = useCallback((type: string): string => {
    const config = CONTENT_TYPE_CONFIG[type as keyof typeof CONTENT_TYPE_CONFIG]
    if (config) return config.label
    
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }, [])

  const formatTimeAgo = useCallback((dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    return 'Just now'
  }, [])

  const getPreviewText = useCallback((content: ContentItem): string => {
    if (content.content_metadata?.preview) {
      return content.content_metadata.preview
    }
    
    if (typeof content.content_body === 'string') {
      return content.content_body.substring(0, 120) + '...'
    }
    
    try {
      const parsed = JSON.parse(content.content_body)
      if (parsed.content) {
        return typeof parsed.content === 'string' 
          ? parsed.content.substring(0, 120) + '...'
          : 'Structured content available'
      }
    } catch {
      // Not JSON, use as is
    }
    
    return 'Content available'
  }, [])

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  const loadContentLibraryData = useCallback(async () => {
    if (isLoadingRef.current || hasLoadedRef.current) {
      console.log('⏸️ Skipping loadContentLibraryData - already loading/loaded')
      return
    }

    try {
      isLoadingRef.current = true
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem('authToken')
      if (!token) {
        router.push('/login')
        return
      }

      console.log('🔍 Loading Content Library data...')

      // Load user profile
      try {
        const userProfile = await apiClient.getUserProfile()
        const transformedUser: User = {
          id: userProfile.id,
          email: userProfile.email,
          full_name: userProfile.full_name,
          role: userProfile.role,
          company: {
            id: userProfile.company.id,
            company_name: userProfile.company.company_name,
            company_slug: userProfile.company.company_slug,
            subscription_tier: userProfile.company.subscription_tier,
            monthly_credits_used: userProfile.company.monthly_credits_used,
            monthly_credits_limit: userProfile.company.monthly_credits_limit,
            company_size: userProfile.company.company_size
          }
        }
        setUser(transformedUser)
        console.log('✅ User profile loaded')
      } catch (error) {
        console.error('❌ Failed to load user profile:', error)
        setError('Failed to load user profile')
        return
      }

      // Load campaigns
      let campaignsData: Campaign[] = []
      try {
        campaignsData = await apiClient.getCampaigns({ limit: 100 })
        setCampaigns(campaignsData)
        console.log('✅ Campaigns loaded:', campaignsData.length)
      } catch (error) {
        console.error('❌ Failed to load campaigns:', error)
        setError('Failed to load campaigns')
        return
      }

      // Load all content across campaigns
      const allContentItems: ContentItem[] = []
      const campaignSections: CampaignSection[] = []

      for (const campaign of campaignsData) {
        try {
          console.log(`🔍 Loading content for campaign: ${campaign.title}`)
          
          const contentData = await apiClient.getContentList(campaign.id, false)
          const campaignContent = contentData.content_items || []
          
          // Add campaign info to each content item
          const enrichedContent: ContentItem[] = campaignContent.map((item: any) => ({
            ...item,
            campaign_id: campaign.id,
            campaign_title: campaign.title
          }))
          
          allContentItems.push(...enrichedContent)

          // Group content by type for this campaign
          const contentGroups = groupContentByType(enrichedContent)
          
          campaignSections.push({
            id: campaign.id,
            title: campaign.title,
            contentGroups,
            totalContentCount: campaignContent.length,
            status: campaign.status,
            created_at: campaign.created_at
          })

          console.log(`✅ Loaded ${campaignContent.length} content items for ${campaign.title}`)
          
        } catch (error) {
          console.warn(`⚠️ Failed to load content for campaign ${campaign.id}:`, error)
          
          // Add empty campaign section
          campaignSections.push({
            id: campaign.id,
            title: campaign.title,
            contentGroups: [],
            totalContentCount: 0,
            status: campaign.status,
            created_at: campaign.created_at
          })
        }
      }

      setAllContent(allContentItems)
      setOrganizedContent(campaignSections)

      // Calculate stats
      const libraryStats: LibraryStats = {
        totalContentPieces: allContentItems.length,
        recentContent: allContentItems.filter(item => {
          const itemDate = new Date(item.created_at)
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return itemDate > weekAgo
        }).length,
        contentTypes: new Set(allContentItems.map(item => item.content_type)).size,
        avgQualityScore: allContentItems.length > 0 
          ? Math.round((allContentItems.reduce((sum, item) => sum + (item.user_rating || 4), 0) / allContentItems.length) * 20)
          : 85,
        totalCampaigns: campaignsData.length
      }
      
      setStats(libraryStats)
      
      // Auto-expand campaigns with content
      const campaignsWithContent = campaignSections
        .filter(section => section.totalContentCount > 0)
        .slice(0, 3) // Expand first 3 campaigns with content
        .map(section => section.id)
      
      setExpandedCampaigns(new Set(campaignsWithContent))

      console.log('✅ Content Library data loaded successfully')
      console.log(`📊 Stats: ${allContentItems.length} content items across ${campaignsData.length} campaigns`)
      
      hasLoadedRef.current = true

    } catch (error) {
      console.error('❌ Failed to load Content Library data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load content library')
    } finally {
      setLoading(false)
      isLoadingRef.current = false
    }
  }, [router, groupContentByType])

  useEffect(() => {
    if (!hasLoadedRef.current) {
      loadContentLibraryData()
    }
  }, [loadContentLibraryData])

  // ============================================================================
  // FILTERING & SEARCH
  // ============================================================================

  const getFilteredContent = (): CampaignSection[] => {
    return organizedContent.map(campaign => {
      const filteredGroups = campaign.contentGroups.map(group => {
        let filteredItems = group.items

        // Apply search filter
        if (searchQuery) {
          filteredItems = filteredItems.filter(item =>
            item.content_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            getPreviewText(item).toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.campaign_title?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        }

        // Apply content type filter
        if (contentTypeFilter !== 'all') {
          filteredItems = filteredItems.filter(item => item.content_type === contentTypeFilter)
        }

        return {
          ...group,
          items: filteredItems,
          count: filteredItems.length
        }
      }).filter(group => group.count > 0) // Remove empty groups

      return {
        ...campaign,
        contentGroups: filteredGroups,
        totalContentCount: filteredGroups.reduce((sum, group) => sum + group.count, 0)
      }
    }).filter(campaign => {
      // Apply campaign filter
      if (campaignFilter !== 'all' && campaign.id !== campaignFilter) {
        return false
      }
      
      // Only show campaigns with content after filtering
      return campaign.totalContentCount > 0
    })
  }

  const getUniqueContentTypes = (): string[] => {
    const types = new Set<string>()
    allContent.forEach(item => types.add(item.content_type))
    return Array.from(types).sort()
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const toggleCampaignExpansion = (campaignId: string) => {
    const newExpanded = new Set(expandedCampaigns)
    if (newExpanded.has(campaignId)) {
      newExpanded.delete(campaignId)
    } else {
      newExpanded.add(campaignId)
    }
    setExpandedCampaigns(newExpanded)
  }

  const handleContentClick = async (content: ContentItem) => {
    try {
      setContentModalLoading(true)
      setContentModalError(null)
      
      console.log('🔍 Loading content detail for:', content.id)

      try {
        // First try to load full content detail via the specific endpoint
        const fullContent = await apiClient.getContentDetail(content.campaign_id, content.id)
        console.log('✅ Full content detail loaded via getContentDetail:', fullContent)
        
        // Transform the response to ensure it has the expected structure
        const transformedContent = {
          ...fullContent,
          
          // Map actual API fields to expected modal fields
          type: 'generated_content',
          title: fullContent.content_title || 'Generated Content',
          confidence_score: fullContent.intelligence_source?.confidence_score || 0.85,
          is_amplified_content: false, // Default to false since is_amplified isn't in the API response yet
          
          // Enhanced content parsing for the modal
          has_valid_content: true,
          
          // Parse and format content for display
          formatted_content: (() => {
            try {
              let parsedContent;
              
              // Try to use parsed_content first, then fall back to content_body
              if (fullContent.parsed_content && typeof fullContent.parsed_content === 'object') {
                parsedContent = fullContent.parsed_content;
              } else if (fullContent.content_body) {
                parsedContent = typeof fullContent.content_body === 'string' 
                  ? JSON.parse(fullContent.content_body)
                  : fullContent.content_body;
              } else {
                throw new Error('No content available');
              }
              
              console.log('📄 Parsed content structure:', parsedContent);
              
              // Handle different content structures
              if (parsedContent.emails && Array.isArray(parsedContent.emails)) {
                return parsedContent.emails.map((email: any, index: number) => ({
                  title: email.subject || `Email ${index + 1}`,
                  content: email.body || email.content || '',
                  metadata: {
                    subject: email.subject,
                    type: 'email',
                    send_delay: email.send_delay
                  }
                }));
              } else if (parsedContent.posts && Array.isArray(parsedContent.posts)) {
                return parsedContent.posts.map((post: any, index: number) => ({
                  title: `Social Post ${index + 1}`,
                  content: post.content || post.text || '',
                  metadata: {
                    platform: post.platform,
                    hashtags: post.hashtags
                  }
                }));
              } else if (parsedContent.ads && Array.isArray(parsedContent.ads)) {
                return parsedContent.ads.map((ad: any, index: number) => ({
                  title: ad.headline || `Ad ${index + 1}`,
                  content: `**${ad.headline}**\n\n${ad.body}\n\n*CTA: ${ad.cta}*`,
                  metadata: {
                    headline: ad.headline,
                    cta: ad.cta
                  }
                }));
              } else if (typeof parsedContent === 'string') {
                return [{
                  title: fullContent.content_title || 'Generated Content',
                  content: parsedContent,
                  metadata: {}
                }];
              } else if (parsedContent.content) {
                return [{
                  title: fullContent.content_title || 'Generated Content',
                  content: parsedContent.content,
                  metadata: parsedContent.metadata || {}
                }];
              } else {
                // Handle any other structure
                return [{
                  title: fullContent.content_title || 'Generated Content',
                  content: JSON.stringify(parsedContent, null, 2),
                  metadata: { type: 'json_content' }
                }];
              }
            } catch (parseError) {
              console.warn('⚠️ Content parsing failed, using raw content:', parseError);
              return [{
                title: fullContent.content_title || 'Generated Content',
                content: fullContent.content_body || 'Content available but parsing failed',
                metadata: { parsing_error: true }
              }];
            }
          })(),
          
          // Editable text for the modal
          editable_text: (() => {
            try {
              if (fullContent.parsed_content && typeof fullContent.parsed_content === 'object') {
                return JSON.stringify(fullContent.parsed_content, null, 2);
              } else if (fullContent.content_body) {
                const parsed = typeof fullContent.content_body === 'string' 
                  ? JSON.parse(fullContent.content_body) 
                  : fullContent.content_body;
                return JSON.stringify(parsed, null, 2);
              } else {
                return fullContent.content_body || '';
              }
            } catch {
              return fullContent.content_body || '';
            }
          })(),
          
          // Add intelligence source info if available
          intelligence_source_info: fullContent.intelligence_source ? {
            source_title: fullContent.intelligence_source.source_title,
            source_url: fullContent.intelligence_source.source_url,
            confidence_score: fullContent.intelligence_source.confidence_score,
            is_amplified: false // Default to false since is_amplified isn't in the API response yet
          } : null
        };
        
        console.log('✅ Content transformed for modal:', transformedContent);
        setSelectedContentItem(transformedContent);
        setShowContentModal(true);
        
      } catch (detailError) {
        console.warn('⚠️ getContentDetail failed, using content item data:', detailError);
        
        // Fallback: Use the content item data we already have
        // Transform it to match the expected format for the modal
        const fallbackContent = {
          ...content,
          id: content.id,
          campaign_id: content.campaign_id,
          content_type: content.content_type,
          content_title: content.content_title,
          content_body: content.content_body,
          content_metadata: content.content_metadata || {},
          created_at: content.created_at,
          updated_at: content.updated_at,
          user_rating: content.user_rating,
          is_published: content.is_published,
          published_at: content.published_at,
          
          // Add fields expected by the modal
          type: 'generated_content',
          title: content.content_title,
          confidence_score: 0.85,
          is_amplified_content: false,
          
          // Parse content for display
          parsed_content: (() => {
            try {
              return typeof content.content_body === 'string' 
                ? JSON.parse(content.content_body)
                : content.content_body
            } catch {
              return { content: content.content_body }
            }
          })(),
          
          // Create formatted content for display
          formatted_content: (() => {
            try {
              const parsed = typeof content.content_body === 'string' 
                ? JSON.parse(content.content_body) 
                : content.content_body
              
              // Handle different content structures
              if (parsed.emails && Array.isArray(parsed.emails)) {
                return parsed.emails.map((email: any, index: number) => ({
                  title: email.subject || `Email ${index + 1}`,
                  content: email.body || email.content || '',
                  metadata: {
                    subject: email.subject,
                    type: 'email'
                  }
                }))
              } else if (parsed.posts && Array.isArray(parsed.posts)) {
                return parsed.posts.map((post: any, index: number) => ({
                  title: `Social Post ${index + 1}`,
                  content: post.content || post.text || '',
                  metadata: {
                    platform: post.platform,
                    hashtags: post.hashtags
                  }
                }))
              } else if (parsed.ads && Array.isArray(parsed.ads)) {
                return parsed.ads.map((ad: any, index: number) => ({
                  title: ad.headline || `Ad ${index + 1}`,
                  content: `**${ad.headline}**\n\n${ad.body}\n\n*CTA: ${ad.cta}*`,
                  metadata: {
                    headline: ad.headline,
                    cta: ad.cta
                  }
                }))
              } else if (typeof parsed === 'string') {
                return [{
                  title: content.content_title,
                  content: parsed,
                  metadata: {}
                }]
              } else if (parsed.content) {
                return [{
                  title: content.content_title,
                  content: parsed.content,
                  metadata: parsed.metadata || {}
                }]
              } else {
                return [{
                  title: content.content_title,
                  content: JSON.stringify(parsed, null, 2),
                  metadata: {}
                }]
              }
            } catch {
              return [{
                title: content.content_title,
                content: typeof content.content_body === 'string' 
                  ? content.content_body 
                  : 'Content available',
                metadata: {}
              }]
            }
          })(),
          
          has_valid_content: true,
          editable_text: (() => {
            try {
              const parsed = typeof content.content_body === 'string' 
                ? JSON.parse(content.content_body) 
                : content.content_body
              return JSON.stringify(parsed, null, 2)
            } catch {
              return content.content_body
            }
          })()
        }
        
        console.log('✅ Using fallback content data for modal')
        setSelectedContentItem(fallbackContent)
        setShowContentModal(true)
      }
    } catch (error) {
      console.error('❌ Failed to load content:', error)
      setContentModalError(error instanceof Error ? error.message : 'Failed to load content')
    } finally {
      setContentModalLoading(false)
    }
  }

  const handleContentSave = async (contentId: string, newContent: string) => {
    try {
      if (!selectedContentItem) return
      
      await apiClient.updateContent(selectedContentItem.campaign_id, contentId, { 
        content_body: newContent 
      })
      console.log('✅ Content saved successfully')
      
      // Refresh data
      hasLoadedRef.current = false
      await loadContentLibraryData()
    } catch (error) {
      console.error('❌ Failed to save content:', error)
      throw error
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setContentTypeFilter('all')
    setCampaignFilter('all')
    setSortBy('date_desc')
  }

  const expandAllCampaigns = () => {
    const allCampaignIds = organizedContent.map(campaign => campaign.id)
    setExpandedCampaigns(new Set(allCampaignIds))
  }

  const collapseAllCampaigns = () => {
    setExpandedCampaigns(new Set())
  }

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderStatsCards = () => {
    if (!stats) return null

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Content Pieces</p>
              <p className="text-3xl font-semibold text-black">{stats.totalContentPieces}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-xl">
              <FileText className="h-6 w-6 text-black" />
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Across {stats.totalCampaigns} campaigns
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Recent Content</p>
              <p className="text-3xl font-semibold text-black">{stats.recentContent}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-xl">
              <Calendar className="h-6 w-6 text-black" />
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Generated this week
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Content Types</p>
              <p className="text-3xl font-semibold text-black">{stats.contentTypes}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-xl">
              <Globe className="h-6 w-6 text-black" />
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Different formats
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Quality Score</p>
              <p className="text-3xl font-semibold text-black">{stats.avgQualityScore}%</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-xl">
              <Star className="h-6 w-6 text-black" />
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Content confidence
          </div>
        </div>
      </div>
    )
  }

  const renderSearchAndFilters = () => (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all w-64"
            />
          </div>
          
          <select
            value={contentTypeFilter}
            onChange={(e) => setContentTypeFilter(e.target.value)}
            className="px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
          >
            <option value="all">All Content Types</option>
            {getUniqueContentTypes().map(type => (
              <option key={type} value={type}>{formatContentType(type)}</option>
            ))}
          </select>
          
          <select
            value={campaignFilter}
            onChange={(e) => setCampaignFilter(e.target.value)}
            className="px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
          >
            <option value="all">All Campaigns</option>
            {campaigns.map(campaign => (
              <option key={campaign.id} value={campaign.id}>{campaign.title}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex border border-gray-200 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 ${viewMode === 'grid' ? 'bg-gray-100 text-black' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 ${viewMode === 'list' ? 'bg-gray-100 text-black' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          
          <button
            onClick={clearFilters}
            className="px-4 py-3 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Clear Filters
          </button>
          
          <button 
            onClick={() => router.push('/campaigns')}
            className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <span>Found {getFilteredContent().reduce((sum, campaign) => sum + campaign.totalContentCount, 0)} content items</span>
          <button
            onClick={expandAllCampaigns}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Expand All
          </button>
          <button
            onClick={collapseAllCampaigns}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Collapse All
          </button>
        </div>
        
        <button
          onClick={() => {
            hasLoadedRef.current = false
            loadContentLibraryData()
          }}
          className="flex items-center space-x-1 text-gray-600 hover:text-black transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>
    </div>
  )

  const renderContentCard = (content: ContentItem, isInList = false) => {
    const config = CONTENT_TYPE_CONFIG[content.content_type as keyof typeof CONTENT_TYPE_CONFIG] || {
      label: formatContentType(content.content_type),
      icon: '📄',
      color: 'bg-gray-100 text-gray-800'
    }

    if (isInList) {
      return (
        <div
          key={content.id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all cursor-pointer"
          onClick={() => handleContentClick(content)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <div className="text-2xl">{config.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-medium text-black truncate">{content.content_title}</h4>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                    {config.label}
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-1">{getPreviewText(content)}</p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <span>{formatTimeAgo(content.created_at)}</span>
                  {content.user_rating && (
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span>{content.user_rating}</span>
                    </div>
                  )}
                  {content.is_published && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                      Published
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleContentClick(content)
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )
    }

    // Grid card view
    return (
      <div
        key={content.id}
        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer hover:border-gray-300"
        onClick={() => handleContentClick(content)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="text-2xl">{config.icon}</div>
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
            {config.label}
          </div>
        </div>
        
        <h4 className="font-medium text-black mb-2 line-clamp-2">{content.content_title}</h4>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{getPreviewText(content)}</p>
        
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>{formatTimeAgo(content.created_at)}</span>
          {content.user_rating && (
            <div className="flex items-center space-x-1">
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
              <span>{content.user_rating}</span>
            </div>
          )}
        </div>

        {content.is_published && (
          <div className="mb-3">
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
              Published
            </span>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleContentClick(content)
            }}
            className="flex-1 bg-black text-white px-3 py-2 rounded-lg font-medium hover:bg-gray-900 transition-colors flex items-center justify-center text-sm"
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-100 text-black px-3 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-100 text-black px-3 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  const renderCampaignSection = (campaign: CampaignSection) => {
    const isExpanded = expandedCampaigns.has(campaign.id)
    const statusConfig = STATUS_CONFIG[campaign.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft
    const StatusIcon = statusConfig.icon

    return (
      <div key={campaign.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6">
        {/* Campaign Header */}
        <button
          onClick={() => toggleCampaignExpansion(campaign.id)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-t-2xl"
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-400" />
              )}
              <h3 className="text-lg font-medium text-black">{campaign.title}</h3>
            </div>
            
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusConfig.label}
            </div>
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <span className="font-medium">{campaign.totalContentCount} content pieces</span>
            <span>{campaign.contentGroups.length} content types</span>
            <span className="text-xs">{formatTimeAgo(campaign.created_at)}</span>
          </div>
        </button>

        {/* Campaign Content */}
        {isExpanded && (
          <div className="border-t border-gray-200">
            {campaign.contentGroups.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-300 mb-4">
                  <FileText className="h-12 w-12 mx-auto" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No content yet</h4>
                <p className="text-gray-600 mb-4">
                  This campaign does not have any generated content.
                </p>
                <button
                  onClick={() => router.push(`/campaigns/${campaign.id}`)}
                  className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-900 transition-colors"
                >
                  Generate Content
                </button>
              </div>
            ) : (
              <div className="p-6">
                {campaign.contentGroups.map((group, groupIndex) => (
                  <div key={group.contentType} className={groupIndex > 0 ? 'mt-8' : ''}>
                    {/* Content Type Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{group.icon}</span>
                        <div>
                          <h4 className="font-medium text-black">{group.label}</h4>
                          <p className="text-sm text-gray-600">{group.count} items</p>
                        </div>
                      </div>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${group.color}`}>
                        {group.count} {group.count === 1 ? 'item' : 'items'}
                      </div>
                    </div>

                    {/* Content Items */}
                    {viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {group.items.map(content => renderContentCard(content, false))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {group.items.map(content => renderContentCard(content, true))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  const renderEmptyState = () => (
    <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
      <div className="text-gray-300 mb-6">
        <FileText className="h-16 w-16 mx-auto" />
      </div>
      <h3 className="text-xl font-medium text-black mb-3">No content found</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {searchQuery || contentTypeFilter !== 'all' || campaignFilter !== 'all'
          ? "No content matches your current filters. Try adjusting your search terms or filters."
          : "You haven't generated any content yet. Create your first campaign to get started!"
        }
      </p>
      <div className="flex items-center justify-center space-x-3">
        {(searchQuery || contentTypeFilter !== 'all' || campaignFilter !== 'all') ? (
          <button
            onClick={clearFilters}
            className="bg-gray-100 text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Clear Filters
          </button>
        ) : null}
        <button
          onClick={() => router.push('/campaigns')}
          className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors"
        >
          Create Campaign
        </button>
      </div>
    </div>
  )

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your content library...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-black mb-2">Error Loading Content</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={() => {
                setError(null)
                hasLoadedRef.current = false
                loadContentLibraryData()
              }}
              className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gray-100 text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  const filteredContent = getFilteredContent()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="bg-black w-8 h-8 rounded-lg flex items-center justify-center mr-3">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-black">
                  {user?.company.company_name || 'Content Library'}
                </h1>
                <p className="text-sm text-gray-600 hidden md:block">Content Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {user && (
                <div className="bg-gray-100 text-gray-800 flex items-center space-x-2 px-3 py-1 rounded-md">
                  <span className="text-sm font-medium">{user.company.subscription_tier}</span>
                </div>
              )}
              
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-medium text-sm">
                {user?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-light text-black">Content Library</h2>
          <p className="text-gray-600 mt-2">
            Organize and manage all your generated marketing content across campaigns
          </p>
        </div>

        {/* Stats Cards */}
        {renderStatsCards()}

        {/* Search and Filters */}
        {renderSearchAndFilters()}

        {/* Content Loading States */}
        {contentModalLoading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 text-center">
              <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading content...</p>
            </div>
          </div>
        )}

        {contentModalError && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 text-center max-w-md">
              <div className="text-red-500 mb-4">
                <AlertCircle className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-black mb-2">Content Not Available</h3>
              <p className="text-gray-600 mb-6">{contentModalError}</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setContentModalError(null)}
                  className="flex-1 bg-gray-100 text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setContentModalError(null)
                    router.push('/campaigns')
                  }}
                  className="flex-1 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors"
                >
                  Generate Content
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Campaign Sections */}
        {filteredContent.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="space-y-6">
            {filteredContent.map(campaign => renderCampaignSection(campaign))}
          </div>
        )}
      </div>

      {/* Content View/Edit Modal */}
      {showContentModal && selectedContentItem && (
        <ContentViewEditModal
          content={selectedContentItem}
          isOpen={showContentModal}
          onClose={() => {
            setShowContentModal(false)
            setSelectedContentItem(null)
          }}
          onSave={handleContentSave}
          onRefresh={() => {
            hasLoadedRef.current = false
            loadContentLibraryData()
          }}
          formatContentType={formatContentType}
        />
      )}
    </div>
  )
}