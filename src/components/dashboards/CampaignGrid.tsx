import React, { useState } from 'react'
import { Grid, List, SortAsc, SortDesc, Filter, Calendar, Star, Zap, FileText, Eye, Edit, Copy, Trash2, Clock, Play, TrendingUp, Award, Archive } from 'lucide-react'

interface Campaign {
  id: string
  title: string
  description: string
  campaign_type: string
  status: string
  created_at: string
  user_id: string
  company_id: string
  content: any
  intelligence_count?: number
  generated_content_count?: number
  confidence_score?: number
  last_activity?: string
}

interface CampaignGridProps {
  campaigns: Campaign[]
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSortChange?: (sortBy: string, order: 'asc' | 'desc') => void
  onCampaignView?: (campaign: Campaign) => void
  onCampaignEdit?: (campaign: Campaign) => void
  onCampaignDuplicate?: (campaign: Campaign) => void
  onCampaignDelete?: (campaign: Campaign) => void
  isLoading?: boolean
}

const CAMPAIGN_TYPES = {
  social_media: { label: 'Social Media', icon: '📱', color: 'bg-blue-100 text-blue-800' },
  email_marketing: { label: 'Email Marketing', icon: '📧', color: 'bg-green-100 text-green-800' },
  video_content: { label: 'Video Content', icon: '🎥', color: 'bg-purple-100 text-purple-800' },
  blog_post: { label: 'Blog Post', icon: '📝', color: 'bg-orange-100 text-orange-800' },
  advertisement: { label: 'Advertisement', icon: '📢', color: 'bg-red-100 text-red-800' },
  product_launch: { label: 'Product Launch', icon: '🚀', color: 'bg-emerald-100 text-emerald-800' },
  brand_awareness: { label: 'Brand Awareness', icon: '🎯', color: 'bg-pink-100 text-pink-800' },
  multimedia: { label: 'Multimedia', icon: '🎨', color: 'bg-indigo-100 text-indigo-800' }
}

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: Play },
  review: { label: 'Review', color: 'bg-yellow-100 text-yellow-800', icon: Eye },
  active: { label: 'Active', color: 'bg-green-100 text-green-800', icon: TrendingUp },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-800', icon: Award },
  archived: { label: 'Archived', color: 'bg-gray-100 text-gray-600', icon: Archive }
}

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Date Created' },
  { value: 'title', label: 'Title' },
  { value: 'status', label: 'Status' },
  { value: 'campaign_type', label: 'Type' },
  { value: 'confidence_score', label: 'Confidence Score' },
  { value: 'intelligence_count', label: 'Intelligence Sources' },
  { value: 'generated_content_count', label: 'Generated Content' },
  { value: 'last_activity', label: 'Last Activity' }
]

// Inline CampaignCard component to avoid import issues
function CampaignCard({ 
  campaign, 
  onView, 
  onEdit, 
  onDuplicate, 
  onDelete 
}: {
  campaign: Campaign
  onView?: (campaign: Campaign) => void
  onEdit?: (campaign: Campaign) => void
  onDuplicate?: (campaign: Campaign) => void
  onDelete?: (campaign: Campaign) => void
}) {
  // Add safety checks for campaign object
  if (!campaign) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-12 w-12 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  const typeConfig = CAMPAIGN_TYPES[campaign.campaign_type as keyof typeof CAMPAIGN_TYPES] || {
    label: 'Unknown',
    icon: '📊',
    color: 'bg-gray-100 text-gray-800'
  }
  
  const statusConfig = STATUS_CONFIG[campaign.status as keyof typeof STATUS_CONFIG] || {
    label: 'Unknown',
    color: 'bg-gray-100 text-gray-800',
    icon: Clock
  }
  
  const StatusIcon = statusConfig.icon

  const formatTimeAgo = (dateString: string) => {
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
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:border-purple-200 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg flex items-center justify-center text-2xl">
          {typeConfig?.icon || '📊'}
        </div>
        <div className="flex items-center space-x-2">
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusConfig.label}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{campaign.title}</h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{campaign.description}</p>
      
      {/* Campaign Type Badge */}
      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-4 ${typeConfig?.color}`}>
        {typeConfig?.label}
      </div>
      
      {/* Metrics */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Intelligence Sources</span>
          <span className="font-medium">{campaign.intelligence_count || 0}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Generated Content</span>
          <span className="font-medium">{campaign.generated_content_count || 0}</span>
        </div>
        {campaign.confidence_score && campaign.confidence_score > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Confidence Score</span>
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-500 mr-1" />
              <span className="font-medium">{(campaign.confidence_score * 100).toFixed(0)}%</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Timestamps */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <span>Created {formatTimeAgo(campaign.created_at)}</span>
        {campaign.last_activity && (
          <span>Updated {formatTimeAgo(campaign.last_activity)}</span>
        )}
      </div>
      
      {/* Actions */}
      <div className="flex items-center space-x-2">
        <button 
          onClick={() => onView?.(campaign)}
          className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
        >
          <Eye className="w-4 h-4 mr-1 inline" />
          View
        </button>
        <button 
          onClick={() => onEdit?.(campaign)}
          className="px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button 
          onClick={() => onDuplicate?.(campaign)}
          className="px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Copy className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default function CampaignGrid({
  campaigns = [], // Add default empty array
  viewMode,
  onViewModeChange,
  sortBy = 'created_at',
  sortOrder = 'desc',
  onSortChange,
  onCampaignView,
  onCampaignEdit,
  onCampaignDuplicate,
  onCampaignDelete,
  isLoading = false
}: CampaignGridProps) {
  const [showSortMenu, setShowSortMenu] = useState(false)

  // Ensure campaigns is always an array
  const safeCampaigns = campaigns || []

  const handleSort = (newSortBy: string) => {
    if (newSortBy === sortBy) {
      // Toggle order if same field
      onSortChange?.(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      // New field, default to desc
      onSortChange?.(newSortBy, 'desc')
    }
    setShowSortMenu(false)
  }

  const formatTimeAgo = (dateString: string) => {
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
  }

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      review: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-emerald-100 text-emerald-800',
      archived: 'bg-gray-100 text-gray-600'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
              <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex space-x-2">
            <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <LoadingSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {safeCampaigns.length} Campaign{safeCampaigns.length !== 1 ? 's' : ''}
          </h3>
          
          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              <span>Sort by {SORT_OPTIONS.find(opt => opt.value === sortBy)?.label}</span>
            </button>
            
            {showSortMenu && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                <div className="p-2">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSort(option.value)}
                      className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 transition-colors ${
                        sortBy === option.value ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option.label}</span>
                        {sortBy === option.value && (
                          sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2">
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 ${
                viewMode === 'grid'
                  ? 'bg-purple-100 text-purple-600'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              } transition-colors`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 ${
                viewMode === 'list'
                  ? 'bg-purple-100 text-purple-600'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              } transition-colors`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Campaign Display */}
      {safeCampaigns.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onView={onCampaignView}
              onEdit={onCampaignEdit}
              onDuplicate={onCampaignDuplicate}
              onDelete={onCampaignDelete}
            />
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {safeCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  {/* Campaign Icon */}
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg flex items-center justify-center text-2xl">
                    {campaign.campaign_type === 'social_media' && '📱'}
                    {campaign.campaign_type === 'email_marketing' && '📧'}
                    {campaign.campaign_type === 'video_content' && '🎥'}
                    {campaign.campaign_type === 'blog_post' && '📝'}
                    {campaign.campaign_type === 'advertisement' && '📢'}
                    {campaign.campaign_type === 'product_launch' && '🚀'}
                    {campaign.campaign_type === 'brand_awareness' && '🎯'}
                    {campaign.campaign_type === 'multimedia' && '🎨'}
                    {!['social_media', 'email_marketing', 'video_content', 'blog_post', 'advertisement', 'product_launch', 'brand_awareness', 'multimedia'].includes(campaign.campaign_type) && '📊'}
                  </div>
                  
                  {/* Campaign Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{campaign.title}</h3>
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {campaign.status.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-1">{campaign.description}</p>
                    
                    {/* Metrics */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>🔍 {campaign.intelligence_count || 0} intelligence</span>
                      <span>📄 {campaign.generated_content_count || 0} content pieces</span>
                      <span>📅 {formatTimeAgo(campaign.created_at)}</span>
                      {campaign.confidence_score && campaign.confidence_score > 0 && (
                        <span>⭐ {(campaign.confidence_score * 100).toFixed(0)}% confidence</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onCampaignView?.(campaign)}
                    className="px-3 py-2 text-sm text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => onCampaignEdit?.(campaign)}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onCampaignDuplicate?.(campaign)}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Duplicate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}