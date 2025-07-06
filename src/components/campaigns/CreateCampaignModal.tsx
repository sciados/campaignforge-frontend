// src/components/campaigns/CreateCampaignModal.tsx - Apple Design System
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
    description: 'Wistia, TikTok, Vimeo, VSLs',
    icon: Video,
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  {
    id: 'document',
    title: 'From Document',
    description: 'PDF, Word, PowerPoint, Spreadsheets',
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    id: 'website',
    title: 'From Website',
    description: 'Sales pages, landing pages, articles',
    icon: Globe,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  }
]

export default function AppleCreateCampaignModal({ 
  isOpen, 
  onClose, 
  onCreateCampaign 
}: CreateCampaignModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('')

  if (!isOpen) return null

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method)
    onCreateCampaign?.('universal', method)
    onClose()
  }

  const handleBlankCampaign = () => {
    onCreateCampaign?.('universal', 'blank')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Apple-style Header */}
        <div className="p-8 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-light text-black">Create New Campaign</h3>
              <p className="text-sm text-apple-gray mt-2 font-medium">
                Universal campaign system - supports any content type
              </p>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-apple-gray hover:text-black transition-colors rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-8">
          <div className="space-y-8">
            {/* Intelligence Method Selection */}
            <div>
              <h4 className="text-xl font-medium text-black mb-2">
                Start with Intelligence Analysis
              </h4>
              <p className="text-sm text-apple-gray mb-6 font-medium">
                Analyze competitor content to extract winning strategies and generate unique campaign angles
              </p>
              <div className="space-y-3">
                {INTELLIGENCE_METHODS.map((method) => {
                  const Icon = method.icon
                  return (
                    <button 
                      key={method.id}
                      onClick={() => handleMethodSelect(method.id)}
                      className="w-full flex items-center space-x-4 p-6 border border-gray-200 rounded-2xl hover:border-gray-400 hover:shadow-md transition-all group"
                    >
                      <div className={`w-12 h-12 ${method.bgColor} rounded-xl flex items-center justify-center group-hover:shadow-sm transition-all`}>
                        <Icon className={`w-6 h-6 ${method.color}`} />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-medium text-black">{method.title}</div>
                        <div className="text-sm text-apple-gray font-medium">{method.description}</div>
                      </div>
                      <div className="text-apple-gray opacity-0 group-hover:opacity-100 transition-opacity">
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
            <div className="border-t border-gray-200 pt-8">
              <h4 className="text-xl font-medium text-black mb-2">
                Or Start from Scratch
              </h4>
              <p className="text-sm text-apple-gray mb-6 font-medium">
                Create a blank campaign and add content sources later
              </p>
              <button 
                onClick={handleBlankCampaign}
                className="w-full p-6 border border-gray-200 rounded-2xl hover:border-gray-400 hover:shadow-md transition-all text-left group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:shadow-sm transition-all">
                    <Plus className="w-6 h-6 text-apple-gray" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-black">Blank Campaign</div>
                    <div className="text-sm text-apple-gray font-medium">Start with a clean slate and add inputs later</div>
                  </div>
                  <div className="text-apple-gray opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Apple-style Footer */}
        <div className="px-8 py-6 border-t border-gray-200 bg-apple-light rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div className="text-xs text-apple-gray font-medium">
              💡 Universal campaigns can generate any content type from any input source
            </div>
            <button 
              onClick={onClose}
              className="px-4 py-2 text-sm text-apple-gray hover:text-black transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}