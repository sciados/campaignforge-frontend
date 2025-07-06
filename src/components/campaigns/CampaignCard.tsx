import React from 'react'
import { useRouter } from 'next/navigation'
import { 
  Calendar, Eye, Edit, Copy, Trash2, 
  Clock, Play, TrendingUp, Award, Archive, Folder, ArrowRight
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

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: Play },
  review: { label: 'Review', color: 'bg-yellow-100 text-yellow-800', icon: Eye },
  active: { label: 'Active', color: 'bg-green-100 text-green-800', icon: TrendingUp },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: Award },
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

  if (!campaign) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-12 w-12 bg-gray-200 rounded-xl mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }
  
  const statusConfig = STATUS_CONFIG[campaign.status as keyof typeof STATUS_CONFIG] || {
    label: 'Unknown',
    color: 'bg-gray-100 text-gray-800',
    icon: Clock
  }
  
  const StatusIcon = statusConfig.icon
  const contentCount = campaign.generated_content_count ?? 0
  const hasContent = contentCount > 0

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-gray-300 transition-all group">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
          <span className="text-lg">✨</span>
        </div>
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
          <StatusIcon className="w-3 h-3 mr-1" />
          {statusConfig.label}
        </div>
      </div>
      
      {/* Content */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-black mb-2 leading-tight">{campaign.title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">{campaign.description}</p>
      </div>
      
      {/* Campaign Type Badge */}
      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mb-4">
        Universal Campaign
      </div>
      
      {/* Content Preview */}
      {hasContent && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-700 font-medium">
              {contentCount} content piece{contentCount !== 1 ? 's' : ''} ready
            </span>
            <button
              onClick={() => router.push(`/campaigns/${campaign.id}/content`)}
              className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center space-x-1"
            >
              <span>View</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
      
      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-xs text-gray-500 mb-1">Intelligence Sources</p>
          <p className="text-lg font-semibold text-black">{campaign.intelligence_count ?? 0}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Generated Content</p>
          <div className="flex items-center space-x-2">
            <p className="text-lg font-semibold text-black">{contentCount}</p>
            {hasContent && (
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            )}
          </div>
        </div>
      </div>
      
      {/* Timestamp */}
      <div className="text-xs text-gray-500 mb-6">
        Created {formatTimeAgo(campaign.created_at)}
      </div>
      
      {/* Actions */}
      <div className="space-y-3">
        {/* Primary Action */}
        <button 
          onClick={() => onView?.(campaign)}
          className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors flex items-center justify-center space-x-2"
        >
          <Eye className="w-4 h-4" />
          <span>Open Campaign</span>
        </button>
        
        {/* Secondary Actions */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => onEdit?.(campaign)}
            className="flex-1 py-2 bg-gray-100 text-black rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
          
          <button
            onClick={() => router.push(`/campaigns/${campaign.id}/content`)}
            className={`px-3 py-2 rounded-lg transition-colors text-sm font-medium flex items-center space-x-1 ${
              hasContent
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
            title={hasContent ? `View ${contentCount} content pieces` : 'No content generated yet'}
          >
            <Folder className="w-4 h-4" />
            {contentCount > 0 && (
              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                {contentCount}
              </span>
            )}
          </button>
          
          <button 
            onClick={() => onDuplicate?.(campaign)}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}