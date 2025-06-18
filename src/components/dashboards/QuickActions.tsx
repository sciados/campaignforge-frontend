import React, { useState } from 'react'
import { 
  Video, FileText, Globe, Zap, Target, Plus, ArrowUpRight, 
  Upload, Link, Sparkles, BarChart3, Users, Settings
} from 'lucide-react'

interface QuickActionsProps {
  onVideoAnalysis?: () => void
  onDocumentUpload?: () => void
  onWebsiteAnalysis?: () => void
  onCreateCampaign?: () => void
  onViewAnalytics?: () => void
  onTeamSettings?: () => void
  compactMode?: boolean
}

const INTELLIGENCE_ACTIONS = [
  {
    id: 'video',
    title: 'Video Intelligence',
    description: 'Analyze competitor videos and extract winning strategies',
    icon: Video,
    gradient: 'from-purple-500 to-blue-600',
    hoverGradient: 'from-purple-600 to-blue-700',
    examples: ['YouTube videos', 'TikTok content', 'Video ads']
  },
  {
    id: 'document',
    title: 'Document Intelligence',
    description: 'Transform PDFs and docs into marketing insights',
    icon: FileText,
    gradient: 'from-emerald-500 to-teal-600',
    hoverGradient: 'from-emerald-600 to-teal-700',
    examples: ['PDFs', 'Word docs', 'Presentations']
  },
  {
    id: 'website',
    title: 'Website Intelligence',
    description: 'Analyze competitor sites and extract winning copy',
    icon: Globe,
    gradient: 'from-orange-500 to-red-600',
    hoverGradient: 'from-orange-600 to-red-700',
    examples: ['Sales pages', 'Landing pages', 'Product pages']
  }
]

const QUICK_ACTIONS = [
  {
    id: 'create-campaign',
    title: 'Create Campaign',
    description: 'Start a new marketing campaign',
    icon: Target,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    hoverBg: 'hover:bg-purple-200'
  },
  {
    id: 'view-analytics',
    title: 'View Analytics',
    description: 'See campaign performance',
    icon: BarChart3,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    hoverBg: 'hover:bg-blue-200'
  },
  {
    id: 'team-settings',
    title: 'Team Settings',
    description: 'Manage team and permissions',
    icon: Users,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    hoverBg: 'hover:bg-emerald-200'
  },
  {
    id: 'upgrade',
    title: 'Upgrade Plan',
    description: 'Get more features and credits',
    icon: Sparkles,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    hoverBg: 'hover:bg-orange-200'
  }
]

export default function QuickActions({
  onVideoAnalysis,
  onDocumentUpload,
  onWebsiteAnalysis,
  onCreateCampaign,
  onViewAnalytics,
  onTeamSettings,
  compactMode = false
}: QuickActionsProps) {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null)

  const handleActionClick = (actionId: string) => {
    switch (actionId) {
      case 'video':
        onVideoAnalysis?.()
        break
      case 'document':
        onDocumentUpload?.()
        break
      case 'website':
        onWebsiteAnalysis?.()
        break
      case 'create-campaign':
        onCreateCampaign?.()
        break
      case 'view-analytics':
        onViewAnalytics?.()
        break
      case 'team-settings':
        onTeamSettings?.()
        break
      default:
        console.log(`Action clicked: ${actionId}`)
    }
  }

  if (compactMode) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.id}
              onClick={() => handleActionClick(action.id)}
              className={`p-3 ${action.bgColor} ${action.hoverBg} rounded-lg transition-colors group`}
            >
              <Icon className={`w-5 h-5 ${action.color} mx-auto mb-1`} />
              <span className="text-xs font-medium text-gray-900 block">{action.title}</span>
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Intelligence Actions */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Start with Intelligence</h3>
            <p className="text-gray-600 text-sm">Analyze competitor content to extract winning strategies</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Zap className="w-4 h-4" />
            <span>AI-Powered Analysis</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {INTELLIGENCE_ACTIONS.map((action) => {
            const Icon = action.icon
            const isHovered = hoveredAction === action.id

            return (
              <div
                key={action.id}
                onMouseEnter={() => setHoveredAction(action.id)}
                onMouseLeave={() => setHoveredAction(null)}
                className={`bg-gradient-to-br ${isHovered ? action.hoverGradient : action.gradient} p-6 rounded-xl text-white cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg`}
                onClick={() => handleActionClick(action.id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className="w-8 h-8" />
                  <ArrowUpRight className={`w-6 h-6 transition-transform duration-200 ${isHovered ? 'translate-x-1 -translate-y-1' : ''}`} />
                </div>
                
                <h4 className="text-lg font-semibold mb-2">{action.title}</h4>
                <p className="text-white/90 text-sm mb-4">{action.description}</p>
                
                <div className="flex flex-wrap gap-1">
                  {action.examples.map((example, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-white/20 rounded text-xs"
                    >
                      {example}
                    </span>
                  ))}
                </div>

                <button className={`w-full mt-4 bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-lg transition-colors ${isHovered ? 'bg-white/30' : ''}`}>
                  Get Started
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            <p className="text-gray-600 text-sm">Common tasks and shortcuts</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon

            return (
              <button
                key={action.id}
                onClick={() => handleActionClick(action.id)}
                className={`p-4 ${action.bgColor} ${action.hoverBg} rounded-xl transition-all duration-200 hover:scale-105 group`}
              >
                <Icon className={`w-6 h-6 ${action.color} mx-auto mb-3 group-hover:scale-110 transition-transform`} />
                <h4 className="font-medium text-gray-900 mb-1">{action.title}</h4>
                <p className="text-xs text-gray-600">{action.description}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Recent Shortcuts */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="font-medium text-gray-900 mb-4">Recent Shortcuts</h4>
        <div className="space-y-2">
          {[
            { icon: Video, label: 'Analyze YouTube video', time: '2 hours ago' },
            { icon: FileText, label: 'Upload competitor PDF', time: '1 day ago' },
            { icon: Target, label: 'Create social campaign', time: '3 days ago' }
          ].map((shortcut, index) => {
            const Icon = shortcut.icon
            return (
              <button
                key={index}
                className="w-full flex items-center space-x-3 p-2 hover:bg-white rounded-lg transition-colors text-left"
              >
                <Icon className="w-4 h-4 text-gray-400" />
                <span className="flex-1 text-sm text-gray-700">{shortcut.label}</span>
                <span className="text-xs text-gray-500">{shortcut.time}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Help & Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 mb-1">💡 Pro Tip</h4>
            <p className="text-sm text-gray-600 mb-3">
              Start with intelligence analysis for better campaign results. Our AI can extract winning strategies from competitor content.
            </p>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Learn more →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}