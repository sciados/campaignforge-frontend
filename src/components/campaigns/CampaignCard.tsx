import React from 'react'
import { useRouter } from 'next/navigation'
import { 
  Calendar, Star, Zap, FileText, Eye, Edit, Copy, Trash2, 
  Clock, Play, TrendingUp, Award, Archive, Folder
} from 'lucide-react'

interface Campaign {
  id: string
  title: string
  description: string
  campaign_type: string
  status: string
  created_at: string
  intelligence_count?: number
  generated_content_count?: number
  confidence_score?: number
  last_activity?: string
}

interface CampaignCardProps {
  campaign: Campaign
  onView?: (campaign: Campaign) => void
  onEdit?: (campaign: Campaign) => void
  onDuplicate?: (campaign: Campaign) => void
  onDelete?: (campaign: Campaign) => void
}

// Updated for Universal Campaigns only
const CAMPAIGN_TYPES = {
  universal: { label: 'Universal Campaign', icon: '🌟', color: 'bg-purple-100 text-purple-800' }
}

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: Play },
  review: { label: 'Review', color: 'bg-yellow-100 text-yellow-800', icon: Eye },
  active: { label: 'Active', color: 'bg-green-100 text-green-800', icon: TrendingUp },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-800', icon: Award },
  archived: { label: 'Archived', color: 'bg-gray-100 text-gray-600', icon: Archive }
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

export default function CampaignCard({ 
  campaign, 
  onView, 
  onEdit, 
  onDuplicate, 
  onDelete 
}: CampaignCardProps) {
  const router = useRouter()

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

  // Always use universal campaign config
  const typeConfig = CAMPAIGN_TYPES['universal'] || {
    label: 'Universal Campaign',
    icon: '🌟',
    color: 'bg-purple-100 text-purple-800'
  }
  
  const statusConfig = STATUS_CONFIG[campaign.status as keyof typeof STATUS_CONFIG] || {
    label: 'Unknown',
    color: 'bg-gray-100 text-gray-800',
    icon: Clock
  }
  
  const StatusIcon = statusConfig.icon

  // Check for generated content
  const contentCount = campaign.generated_content_count ?? 0
  const hasContent = contentCount > 0

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:border-purple-200 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg flex items-center justify-center text-2xl">
          🌟
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
      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-4 ${typeConfig.color}`}>
        {typeConfig.label}
      </div>
      
      {/* Content Preview (if exists) */}
      {hasContent && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-700 font-medium">
              {contentCount} content piece{contentCount !== 1 ? 's' : ''} ready
            </span>
            <button
              onClick={() => router.push(`/campaigns/${campaign.id}/content`)}
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              View All →
            </button>
          </div>
        </div>
      )}
      
      {/* Metrics */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Intelligence Sources</span>
          <span className="font-medium">{campaign.intelligence_count ?? 0}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Generated Content</span>
          <div className="flex items-center space-x-1">
            <span className="font-medium">{contentCount}</span>
            {hasContent && (
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            )}
          </div>
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
      <div className="space-y-2">
        {/* Primary Actions */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => onView?.(campaign)}
            className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
          >
            <Eye className="w-4 h-4 mr-1 inline" />
            Open Campaign
          </button>
          
          {/* Content Library Button */}
          <button
            onClick={() => router.push(`/campaigns/${campaign.id}/content`)}
            className={`px-3 py-2 rounded-lg transition-all text-sm font-medium flex items-center space-x-1 ${
              hasContent
                ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-300'
            }`}
            title={hasContent ? `View ${contentCount} content pieces` : 'No content generated yet'}
          >
            <Folder className="w-4 h-4" />
            <span className="hidden sm:inline">Content</span>
            {contentCount > 0 && (
              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                {contentCount}
              </span>
            )}
          </button>
        </div>
        
        {/* Secondary Actions */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => onEdit?.(campaign)}
            className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-4 h-4 mr-1 inline" />
            Edit
          </button>
          <button 
            onClick={() => onDuplicate?.(campaign)}
            className="px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}