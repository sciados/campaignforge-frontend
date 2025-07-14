// src/app/campaigns/[id]/content/page.tsx
'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, FileText, Mail, Megaphone, Eye, Edit, Download, Copy, 
  Trash2, Star, Clock, CheckCircle, Filter, Search, Grid, List,
  Sparkles, BookOpen, ExternalLink, Plus, RefreshCw
} from 'lucide-react'
import { useApi } from '@/lib/api'

interface GeneratedContent {
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
}

interface Campaign {
  id: string
  title: string
  description: string
  status: string
  created_at: string
}

export default function CampaignContentLibrary() {
  const params = useParams()
  const router = useRouter()
  const api = useApi()
  
  const campaignId = params.id as string
  
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [content, setContent] = useState<GeneratedContent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Modal states
  const [selectedContent, setSelectedContent] = useState<GeneratedContent | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState('')

  // Fixed: Remove api from dependencies to prevent infinite loop
  const loadCampaignAndContent = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Load campaign details
      const campaignData = await api.getCampaign(campaignId)
      setCampaign(campaignData)
      
      // Load generated content
      const contentData = await api.getContentList(campaignId, true)
      setContent(contentData.content_items || [])
      
    } catch (err) {
      console.error('Failed to load content:', err)
      setError(err instanceof Error ? err.message : 'Failed to load content')
    } finally {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]) // Only include campaignId, not api to prevent infinite loop

  // Fixed: Use campaignId directly in useEffect instead of the callback
  useEffect(() => {
    if (!campaignId) return

    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Load campaign details
        const campaignData = await api.getCampaign(campaignId)
        setCampaign(campaignData)
        
        // Load generated content
        const contentData = await api.getContentList(campaignId, true)
        setContent(contentData.content_items || [])
        
      } catch (err) {
        console.error('Failed to load content:', err)
        setError(err instanceof Error ? err.message : 'Failed to load content')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]) // Only depend on campaignId - api excluded to prevent infinite loop

  const handleRefresh = () => {
    loadCampaignAndContent()
  }

  const getContentIcon = (contentType: string) => {
    switch (contentType) {
      case 'email_sequence':
      case 'email':
        return Mail
      case 'ad_copy':
      case 'ad':
        return Megaphone
      case 'social_posts':
      case 'social_media':
      case 'social':
        return FileText
      case 'blog_post':
      case 'blog':
        return BookOpen
      case 'video_script':
      case 'video':
        return FileText
      default:
        return FileText
    }
  }

  const getContentTypeLabel = (contentType: string) => {
    const labels: Record<string, string> = {
      'email_sequence': 'Email Sequence',
      'email': 'Email',
      'ad_copy': 'Ad Copy',
      'ad': 'Ad Copy',
      'social_posts': 'Social Posts',
      'social_media': 'Social Media',
      'social': 'Social Media',
      'blog_post': 'Blog Post',
      'blog': 'Blog Post',
      'video_script': 'Video Script',
      'video': 'Video Script'
    }
    return labels[contentType] || contentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const formatContentForDisplay = (content: GeneratedContent) => {
    if (typeof content.content_body === 'string') {
      return content.content_body
    }
    
    if (content.content_body && typeof content.content_body === 'object') {
      const bodyObj = content.content_body as any
      
      // Handle structured content (emails, sequences, etc.)
      if (bodyObj.emails && Array.isArray(bodyObj.emails)) {
        return bodyObj.emails.map((email: any, index: number) => 
          `Email ${index + 1}: ${email.subject || 'No Subject'}\n\n${email.body || email.content || ''}`
        ).join('\n\n---\n\n')
      }
      
      if (bodyObj.sequence_title || bodyObj.emails) {
        const title = bodyObj.sequence_title || 'Email Sequence'
        const emails = bodyObj.emails || []
        return `${title}\n\n${emails.map((email: any, index: number) => 
          `Email ${index + 1}: ${email.subject || 'No Subject'}\n\n${email.body || email.content || ''}`
        ).join('\n\n---\n\n')}`
      }
      
      // Handle other structured content
      if (bodyObj.content) {
        return bodyObj.content
      }
      
      // Fallback to JSON stringify with better formatting
      return JSON.stringify(content.content_body, null, 2)
    }
    
    return 'No content available'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getContentPreview = (content: GeneratedContent) => {
    const formattedContent = formatContentForDisplay(content)
    const preview = formattedContent.substring(0, 150)
    return preview + (formattedContent.length > 150 ? '...' : '')
  }

  const handleViewContent = (contentItem: GeneratedContent) => {
    setSelectedContent(contentItem)
    setEditedContent(formatContentForDisplay(contentItem))
    setIsEditing(false)
    setShowPreviewModal(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedContent) return
    
    try {
      // Update the content via API
      await api.updateContent(campaignId, selectedContent.id, {
        content_body: editedContent
      })
      
      // Update local state
      setContent(prev => prev.map(c => 
        c.id === selectedContent.id 
          ? { ...c, content_body: editedContent }
          : c
      ))
      
      setIsEditing(false)
      console.log('Content updated successfully')
    } catch (error) {
      console.error('Failed to update content:', error)
    }
  }

  const handleCancelEdit = () => {
    setEditedContent(formatContentForDisplay(selectedContent!))
    setIsEditing(false)
  }

  const handleCopyContent = async (contentItem: GeneratedContent) => {
    try {
      const textToCopy = formatContentForDisplay(contentItem)
      await navigator.clipboard.writeText(textToCopy)
      console.log('Content copied to clipboard')
    } catch (error) {
      console.error('Failed to copy content:', error)
    }
  }

  const handleDeleteContent = async (contentId: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return
    
    try {
      await api.deleteContent(campaignId, contentId)
      setContent(prev => prev.filter(c => c.id !== contentId))
    } catch (error) {
      console.error('Failed to delete content:', error)
    }
  }

  const filteredContent = content.filter(item => {
    if (searchQuery && !item.content_title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (typeFilter !== 'all' && item.content_type !== typeFilter) {
      return false
    }
    return true
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'title':
        return a.content_title.localeCompare(b.content_title)
      default:
        return 0
    }
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading content library...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <FileText className="h-12 w-12 mx-auto" />
          </div>
          <h1 className="text-2xl font-light text-gray-900 mb-2">Failed to Load Content</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push(`/campaigns/${campaignId}`)}
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Content Library</h1>
              <p className="text-sm text-gray-500">
                {campaign?.title} • {content.length} content piece{content.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            
            <button
              onClick={() => router.push(`/campaigns/${campaignId}`)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Back to Campaign
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="email_sequence">Email Sequences</option>
                <option value="email">Emails</option>
                <option value="ad_copy">Ad Copy</option>
                <option value="ad">Ads</option>
                <option value="social_posts">Social Posts</option>
                <option value="social_media">Social Media</option>
                <option value="social">Social</option>
                <option value="blog_post">Blog Posts</option>
                <option value="blog">Blog</option>
                <option value="video_script">Video Scripts</option>
                <option value="video">Video</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">By Title</option>
              </select>
              
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid/List */}
        {filteredContent.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-6">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Content Generated Yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {content.length === 0 
                ? "Start generating content for this campaign to see it here."
                : "No content matches your current filters."
              }
            </p>
            <button
              onClick={() => router.push(`/campaigns/${campaignId}`)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2 inline" />
              Generate Content
            </button>
          </div>
        ) : (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
          }`}>
            {filteredContent.map((contentItem) => {
              const Icon = getContentIcon(contentItem.content_type)
              
              return viewMode === 'grid' ? (
                <div key={contentItem.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Icon className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 truncate max-w-[200px]" title={contentItem.content_title}>
                          {contentItem.content_title}
                        </h3>
                        <p className="text-sm text-gray-500">{getContentTypeLabel(contentItem.content_type)}</p>
                      </div>
                    </div>
                    {contentItem.is_published && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        Published
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {getContentPreview(contentItem)}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(contentItem.created_at)}
                    </span>
                    {contentItem.user_rating && (
                      <span className="flex items-center">
                        <Star className="h-3 w-3 mr-1 text-yellow-500 fill-current" />
                        {contentItem.user_rating}/5
                      </span>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewContent(contentItem)}
                      className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      <Eye className="h-4 w-4 mr-1 inline" />
                      View
                    </button>
                    <button
                      onClick={() => handleCopyContent(contentItem)}
                      className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteContent(contentItem.id)}
                      className="px-3 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div key={contentItem.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Icon className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 truncate max-w-[300px]" title={contentItem.content_title}>
                          {contentItem.content_title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {getContentTypeLabel(contentItem.content_type)} • {formatDate(contentItem.created_at)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {contentItem.is_published && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Published
                        </span>
                      )}
                      <button
                        onClick={() => handleViewContent(contentItem)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleCopyContent(contentItem)}
                        className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteContent(contentItem.id)}
                        className="px-3 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Content Preview Modal */}
      {showPreviewModal && selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedContent.content_title}</h3>
                  <p className="text-gray-600">{getContentTypeLabel(selectedContent.content_type)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveEdit}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => setShowPreviewModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-96">
              {isEditing ? (
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full h-80 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono text-sm"
                  placeholder="Edit your content..."
                />
              ) : (
                <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                  {formatContentForDisplay(selectedContent)}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => handleCopyContent(selectedContent)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Copy className="h-4 w-4 mr-2 inline" />
                Copy Content
              </button>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}