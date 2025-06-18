import React, { useState } from 'react'
import { Video, FileText, Globe, X } from 'lucide-react'

interface CreateCampaignModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateCampaign?: (type: string, method: string) => void
}

const CAMPAIGN_TYPES = {
  social_media: { label: 'Social Media', icon: '📱', color: 'bg-blue-100 text-blue-800' },
  email_marketing: { label: 'Email Marketing', icon: '📧', color: 'bg-green-100 text-green-800' },
  video_content: { label: 'Video Content', icon: '🎥', color: 'bg-purple-100 text-purple-800' },
  blog_post: { label: 'Blog Post', icon: '📝', color: 'bg-orange-100 text-orange-800' },
  advertisement: { label: 'Advertisement', icon: '📢', color: 'bg-red-100 text-red-800' },
  product_launch: { label: 'Product Launch', icon: '🚀', color: 'bg-emerald-100 text-emerald-800' }
}

const INTELLIGENCE_METHODS = [
  {
    id: 'video',
    title: 'From Video',
    description: 'YouTube, TikTok, Vimeo',
    icon: Video,
    color: 'text-purple-600'
  },
  {
    id: 'document',
    title: 'From Document',
    description: 'PDF, Word, PowerPoint',
    icon: FileText,
    color: 'text-blue-600'
  },
  {
    id: 'website',
    title: 'From Website',
    description: 'Sales pages, landing pages',
    icon: Globe,
    color: 'text-emerald-600'
  }
]

export default function CreateCampaignModal({ 
  isOpen, 
  onClose, 
  onCreateCampaign 
}: CreateCampaignModalProps) {
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedMethod, setSelectedMethod] = useState<string>('')

  if (!isOpen) return null

  const handleContinue = () => {
    if (selectedMethod) {
      onCreateCampaign?.(selectedType, selectedMethod)
      onClose()
    }
  }

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method)
    // Auto-continue if method is selected
    onCreateCampaign?.('', method)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Create New Campaign</h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Choose how you would like to start your campaign with AI intelligence
          </p>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Campaign Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Campaign Type (Optional)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(CAMPAIGN_TYPES).slice(0, 6).map(([type, config]) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`p-3 border rounded-lg transition-colors text-left ${
                      selectedType === type
                        ? 'border-purple-300 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                    }`}
                  >
                    <div className="text-lg mb-1">{config.icon}</div>
                    <div className="text-sm font-medium text-gray-900">{config.label}</div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Intelligence Method Selection */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Start with Intelligence Analysis
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Analyze competitor content to extract winning strategies
              </p>
              <div className="space-y-3">
                {INTELLIGENCE_METHODS.map((method) => {
                  const Icon = method.icon
                  return (
                    <button 
                      key={method.id}
                      onClick={() => handleMethodSelect(method.id)}
                      className="w-full flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all group"
                    >
                      <div className={`w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-white transition-colors`}>
                        <Icon className={`w-5 h-5 ${method.color}`} />
                      </div>
                      <div className="text-left flex-1">
                        <div className="text-sm font-medium text-gray-900">{method.title}</div>
                        <div className="text-xs text-gray-500">{method.description}</div>
                      </div>
                      <div className="text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Traditional Campaign Creation */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Or Start from Scratch
              </h4>
              <button className="w-full p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Blank Campaign</div>
                    <div className="text-xs text-gray-500">Start with a clean slate</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              💡 Tip: Intelligence analysis creates more effective campaigns
            </div>
            <button 
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}