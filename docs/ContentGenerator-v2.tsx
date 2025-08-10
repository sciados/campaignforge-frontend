// src/components/intelligence/ContentGenerator.tsx
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
  CheckCircle,
  Lightbulb,
  AlertCircle
} from 'lucide-react'
import ContentViewEditModal from '@/components/campaigns/ContentViewEditModal'
import { useApi } from '@/lib/api'
import type { ContentDetailResponse, GeneratedContentItem } from '@/lib/api'

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

  const [selectedContentType, setSelectedContentType] = useState<string | null>(null)
  const [selectedIntelligence, setSelectedIntelligence] = useState<string>('') // kept for UI compatibility
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [showPreferences, setShowPreferences] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Content preferences state
  const [preferences, setPreferences] = useState({
    tone: 'conversational',
    length: 'medium',
    audience: 'general',
    style: 'engaging',
    platform: 'general'
  })

  // Content list state
  const [contentItems, setContentItems] = useState<GeneratedContentItem[]>([])
  const [isLoadingList, setIsLoadingList] = useState(false)
  const [listError, setListError] = useState<string | null>(null)

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedContentDetail, setSelectedContentDetail] = useState<ContentDetailResponse | null>(null)

  const loadContentList = useCallback(async () => {
    setIsLoadingList(true)
    setListError(null)
    try {
      // includeBody=true so previews render nicely
      const resp = await api.getContentList(campaignId, true)
      setContentItems(resp?.content_items || [])
    } catch (e) {
      console.error('Failed to load content list:', e)
      setListError(e instanceof Error ? e.message : 'Failed to load content list')
    } finally {
      setIsLoadingList(false)
    }
  }, [api, campaignId])

  useEffect(() => {
    loadContentList()
  }, [loadContentList])

  const openContentModal = useCallback(
    async (contentId: string) => {
      try {
        const detail = await api.getContentDetail(campaignId, contentId)
        setSelectedContentDetail(detail)
        setIsModalOpen(true)
      } catch (e) {
        console.error('Failed to load content detail:', e)
      }
    },
    [api, campaignId]
  )

  const onModalSave = useCallback(
    async (contentId: string, newContent: string) => {
      // Persist edits and refresh list
      await api.updateContent(campaignId, contentId, { content_body: newContent })
      await loadContentList()
      setIsModalOpen(false)
      setSelectedContentDetail(null)
    },
    [api, campaignId, loadContentList]
  )

  const onModalRefresh = useCallback(async () => {
    if (!selectedContentDetail) return
    try {
      const refreshed = await api.getContentDetail(campaignId, selectedContentDetail.id)
      setSelectedContentDetail(refreshed)
    } catch (e) {
      console.error('Failed to refresh content detail:', e)
    }
  }, [api, campaignId, selectedContentDetail])

  const formatContentType = useCallback((type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  }, [])

  const formatContentForModal = useCallback((item: ContentDetailResponse) => {
    // Derive a simple formatted_content array from parsed_content when possible.
    const formattedFromParsed = (() => {
      const pc = item.parsed_content
      if (!pc) return null

      // Common structures
      if (Array.isArray(pc.emails)) {
        return pc.emails.map((e: any, idx: number) => ({
          title: e.subject || `Email ${idx + 1}`,
          content: e.body || '',
          metadata: { email_number: idx + 1 }
        }))
      }
      if (Array.isArray(pc.posts)) {
        return pc.posts.map((p: any, idx: number) => ({
          title: p.title || `Post ${idx + 1}`,
          content: p.content || p.text || '',
          metadata: { hashtags: p.hashtags || [] }
        }))
      }
      if (Array.isArray(pc.ads)) {
        return pc.ads.map((ad: any, idx: number) => ({
          title: ad.headline || `Ad ${idx + 1}`,
          content: [ad.headline, ad.body, ad.cta].filter(Boolean).join('\n\n'),
          metadata: { cta: ad.cta }
        }))
      }
      if (Array.isArray(pc.sections)) {
        return pc.sections.map((s: any, idx: number) => ({
          title: s.title || s.heading || `Section ${idx + 1}`,
          content: s.content || '',
          metadata: {}
        }))
      }
      if (pc.script) {
        return [
          {
            title: item.content_title || 'Script',
            content: pc.script,
            metadata: {}
          }
        ]
      }
      return null
    })()

    const fallbackFormatted = [
      {
        title: item.content_title || 'Content',
        content: typeof item.content_body === 'string' ? item.content_body : JSON.stringify(item.content_body, null, 2),
        metadata: {}
      }
    ]

    const formatted_content = formattedFromParsed && formattedFromParsed.length > 0 ? formattedFromParsed : fallbackFormatted
    const has_valid_content = formatted_content.length > 0

    return {
      id: item.id,
      content_type: item.content_type,
      title: item.content_title || 'Untitled Content',
      editable_text: typeof item.content_body === 'string' ? item.content_body : JSON.stringify(item.content_body, null, 2),
      raw_content_body: typeof item.content_body === 'string' ? item.content_body : JSON.stringify(item.content_body, null, 2),
      parsed_content: item.parsed_content,
      formatted_content,
      has_valid_content,
      created_at: item.created_at,
      is_published: item.is_published,
      user_rating: item.user_rating,
      confidence_score: item.intelligence_source?.confidence_score || 0.9,
      source_url: item.intelligence_source?.source_url,
      type: 'generated_content'
    }
  }, [])

  const generateContent = useCallback(async () => {
    if (!selectedContentType || !campaignId) return

    setIsGenerating(true)
    setError(null)

    try {
      // Use robust API client
      const result = await api.generateContent({
        content_type: selectedContentType,
        campaign_id: campaignId,
        preferences
      })

      // Show the just-generated content in the preview section
      setGeneratedContent(result)

      // Refresh the list so the new item appears
      await loadContentList()
    } catch (e) {
      console.error('Content generation error:', e)
      setError(e instanceof Error ? e.message : 'Content generation failed')
    } finally {
      setIsGenerating(false)
    }
  }, [api, selectedContentType, campaignId, preferences, loadContentList])

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
            <p className="text-gray-600 mt-2">Generate marketing content using competitive intelligence</p>
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
                  onChange={(e) => setPreferences({ ...preferences, tone: e.target.value })}
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
                  onChange={(e) => setPreferences({ ...preferences, length: e.target.value })}
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
                  onChange={(e) => setPreferences({ ...preferences, audience: e.target.value })}
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
                  onChange={(e) => setPreferences({ ...preferences, style: e.target.value })}
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
                  onChange={(e) => setPreferences({ ...preferences, platform: e.target.value })}
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
                  {selectedContentType === contentType.id && <CheckCircle className="h-4 w-4 text-black" />}
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

      {/* Existing Content List */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-medium text-black">Existing Content</h3>
          {isLoadingList && <span className="text-sm text-gray-500">Loading...</span>}
        </div>

        {listError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-700">{listError}</p>
          </div>
        )}

        {!isLoadingList && contentItems.length === 0 ? (
          <p className="text-sm text-gray-600">No content found for this campaign yet. Generate something to get started.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {contentItems.map((item) => (
              <button
                key={item.id}
                onClick={() => openContentModal(item.id)}
                className="w-full text-left border-2 border-gray-200 hover:border-gray-300 hover:shadow-sm rounded-2xl p-6 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <h4 className="font-medium text-black line-clamp-1">{item.content_title || 'Untitled'}</h4>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">
                      {item.content_type.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <div className="text-right">
                    {item.created_at && (
                      <span className="text-xs text-gray-500">{new Date(item.created_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-700 line-clamp-3">
                  {typeof item.content_body === 'string'
                    ? item.content_body
                    : JSON.stringify(item.content_body)?.slice(0, 220)}
                  {typeof item.content_body !== 'string' && '…'}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Generated Content Display */}
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
                onClick={() =>
                  downloadContent(generatedContent.generated_content, `${generatedContent.content_type}.json`)
                }
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
                        {typeof value === 'number' ? `${Math.round(value * 100)}%` : String(value)}
                      </div>
                      <div className="text-sm text-gray-600 capitalize">{key.replace(/_/g, ' ')}</div>
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

          {/* Content Display */}
          <div className="space-y-6">
            {/* Email Sequence Display */}
            {generatedContent.content_type === 'email_sequence' && (
              <div className="space-y-6">
                {generatedContent.generated_content.content?.map((email: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-medium text-black">Email #{email.email_number || index + 1}</h5>
                      <button
                        onClick={() =>
                          copyToClipboard(`Subject: ${email.subject || 'No subject'}\n\n${email.body || 'No content'}`)
                        }
                        className="text-sm text-black hover:text-gray-600 font-medium"
                      >
                        Copy Email
                      </button>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <strong className="text-sm text-black">Subject: </strong>
                      <span className="text-sm text-gray-700">{email.subject || 'No subject'}</span>
                    </div>
                    <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                      {email.body || 'No content available'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Social Posts Display */}
            {generatedContent.content_type === 'SOCIAL_POSTS' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {generatedContent.generated_content.content?.map((post: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-medium text-black">Post #{index + 1}</h5>
                      <button
                        onClick={() => copyToClipboard(post.text || '')}
                        className="text-sm text-black hover:text-gray-600 font-medium"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="whitespace-pre-wrap text-sm text-gray-700 mb-4">
                      {post.text || 'No content available'}
                    </div>
                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.hashtags.map((hashtag: string, idx: number) => (
                          <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                            {hashtag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Ad Copy Display */}
            {generatedContent.content_type === 'ad_copy' && (
              <div className="space-y-8">
                {Object.entries(generatedContent.generated_content.content || {}).map(([section, items]) => (
                  <div key={section} className="border border-gray-200 rounded-2xl p-6">
                    <h5 className="font-medium text-black mb-4 capitalize">{section.replace(/_/g, ' ')}</h5>
                    <div className="space-y-3">
                      {Array.isArray(items) &&
                        items.map((item: string, index: number) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                            <span className="text-sm text-gray-700">{item}</span>
                            <button
                              onClick={() => copyToClipboard(item)}
                              className="text-xs text-black hover:text-gray-600 font-medium"
                            >
                              Copy
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Blog Post Display */}
            {generatedContent.content_type === 'blog_post' && (
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-2xl p-8">
                  <h5 className="font-medium text-black mb-6">Blog Post Content</h5>
                  <div className="prose max-w-none">
                    <h1 className="text-2xl font-semibold mb-6 text-black">
                      {generatedContent.generated_content.content?.headline || 'Blog Post Title'}
                    </h1>
                    {generatedContent.generated_content.content?.sections?.map((section: any, index: number) => (
                      <div key={index} className="mb-8">
                        <h2 className="text-xl font-medium mb-3 text-black">
                          {section.title || `Section ${index + 1}`}
                        </h2>
                        <div className="whitespace-pre-wrap text-gray-700">
                          {section.content || 'No content available'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Landing Page Display */}
            {generatedContent.content_type === 'LANDING_PAGE' && (
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-2xl p-8">
                  <h5 className="font-medium text-black mb-6">Landing Page Sections</h5>
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h3 className="text-xl font-semibold text-black">
                        {generatedContent.generated_content.content?.headline || 'Landing Page Headline'}
                      </h3>
                      {generatedContent.generated_content.content?.subheadline && (
                        <p className="text-gray-600 mt-3">
                          {generatedContent.generated_content.content.subheadline}
                        </p>
                      )}
                    </div>
                    {generatedContent.generated_content.content?.sections?.map((section: string, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-medium text-black">{section}</h4>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Video Script Display */}
            {generatedContent.content_type === 'video_script' && (
              <div className="border border-gray-200 rounded-2xl p-8">
                <h5 className="font-medium text-black mb-6">Video Script</h5>
                <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                  {generatedContent.generated_content.content?.script ||
                    generatedContent.generated_content.content ||
                    'No script content available'}
                </div>
              </div>
            )}

            {/* Generic Content Display */}
            {!['email_sequence', 'SOCIAL_POSTS', 'ad_copy', 'blog_post', 'LANDING_PAGE', 'video_script'].includes(
              generatedContent.content_type
            ) && (
              <div className="border border-gray-200 rounded-2xl p-8">
                <h5 className="font-medium text-black mb-6">Generated Content</h5>
                <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                  {typeof generatedContent.generated_content.content === 'string'
                    ? generatedContent.generated_content.content
                    : JSON.stringify(generatedContent.generated_content.content, null, 2)}
                </div>
              </div>
            )}
          </div>

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
                console.log('Saving content to campaign:', generatedContent)
              }}
              className="flex-1 bg-black text-white py-4 px-6 rounded-lg font-medium hover:bg-gray-900 transition-colors"
            >
              Save to Campaign
            </button>
            <button
              onClick={() => {
                generateContent()
              }}
              className="flex-1 bg-gray-100 text-black py-4 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Generate More Variations
            </button>
            <button
              onClick={() => {
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

      {/* View/Edit Modal */}
      {selectedContentDetail && (
        <ContentViewEditModal
          content={formatContentForModal(selectedContentDetail)}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedContentDetail(null)
          }}
          onSave={onModalSave}
          onRefresh={onModalRefresh}
          formatContentType={formatContentType}
        />
      )}
    </div>
  )
}