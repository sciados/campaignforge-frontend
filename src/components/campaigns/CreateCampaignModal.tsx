import React, { useState } from 'react'
import { Video, FileText, Globe, X, Plus } from 'lucide-react'

interface CreateCampaignModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateCampaign?: (type: string, method: string) => void
}

const INTELLIGENCE_METHODS = [
  {
    id: 'video',
    title: 'From Video',
    description: 'YouTube, TikTok, Vimeo, VSLs',
    icon: Video,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  {
    id: 'document',
    title: 'From Document',
    description: 'PDF, Word, PowerPoint, Spreadsheets',
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    id: 'website',
    title: 'From Website',
    description: 'Sales pages, landing pages, articles',
    icon: Globe,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100'
  }
]

export default function CreateCampaignModal({ 
  isOpen, 
  onClose, 
  onCreateCampaign 
}: CreateCampaignModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('')

  if (!isOpen) return null

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method)
    // Create universal campaign with selected input method
    onCreateCampaign?.('universal', method)
    onClose()
  }

  const handleBlankCampaign = () => {
    onCreateCampaign?.('universal', 'blank')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Create New Campaign</h3>
              <p className="text-sm text-gray-600 mt-1">
                Universal campaign system - supports any content type
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Intelligence Method Selection */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Start with Intelligence Analysis
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Analyze competitor content to extract winning strategies and generate unique campaign angles
              </p>
              <div className="space-y-3">
                {INTELLIGENCE_METHODS.map((method) => {
                  const Icon = method.icon
                  return (
                    <button 
                      key={method.id}
                      onClick={() => handleMethodSelect(method.id)}
                      className="w-full flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all group"
                    >
                      <div className={`w-12 h-12 ${method.bgColor} rounded-lg flex items-center justify-center group-hover:bg-white transition-colors`}>
                        <Icon className={`w-6 h-6 ${method.color}`} />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-medium text-gray-900">{method.title}</div>
                        <div className="text-sm text-gray-500">{method.description}</div>
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

            {/* Blank Campaign Option */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Or Start from Scratch
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Create a blank campaign and add content sources later
              </p>
              <button 
                onClick={handleBlankCampaign}
                className="w-full p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all text-left group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-white transition-colors">
                    <Plus className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Blank Campaign</div>
                    <div className="text-sm text-gray-500">Start with a clean slate and add inputs later</div>
                  </div>
                  <div className="text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
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
              💡 Universal campaigns can generate any content type from any input source
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