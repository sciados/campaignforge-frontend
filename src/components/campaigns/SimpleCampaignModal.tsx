import React, { useState } from 'react'
import { X, Plus, Hash, Sparkles, Target, ArrowRight } from 'lucide-react'

interface SimpleCampaignModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateCampaign: (campaignData: {
    title: string
    description: string
    keywords: string[]
    target_audience: string
  }) => Promise<void>
}

export default function SimpleCampaignModal({ 
  isOpen, 
  onClose, 
  onCreateCampaign 
}: SimpleCampaignModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    keywords: [] as string[],
    target_audience: ''
  })
  const [keywordInput, setKeywordInput] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }))
      setKeywordInput('')
    }
  }

  const handleRemoveKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }))
  }

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      setError('Campaign title is required')
      return
    }
    
    if (!formData.description.trim()) {
      setError('Campaign description is required')
      return
    }
    
    setIsCreating(true)
    setError(null)
    
    try {
      await onCreateCampaign(formData)
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        keywords: [],
        target_audience: ''
      })
      
      onClose()
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign')
    } finally {
      setIsCreating(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      action()
    }
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
                Start with campaign basics, add content sources later
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
        <div className="p-6 space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Campaign Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter campaign title..."
              disabled={isCreating}
              onKeyPress={(e) => handleKeyPress(e, handleSubmit)}
            />
          </div>

          {/* Campaign Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Describe your campaign goals and objectives..."
              disabled={isCreating}
            />
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keywords (Optional)
            </label>
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, handleAddKeyword)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Add keywords..."
                  disabled={isCreating}
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  disabled={!keywordInput.trim() || isCreating}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
              
              {formData.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                    >
                      <Hash className="w-3 h-3 mr-1" />
                      {keyword}
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(keyword)}
                        disabled={isCreating}
                        className="ml-2 text-purple-600 hover:text-purple-800 disabled:opacity-50"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Audience (Optional)
            </label>
            <input
              type="text"
              value={formData.target_audience}
              onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Small business owners, Marketing professionals..."
              disabled={isCreating}
            />
          </div>

          {/* Next Steps Preview */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <Sparkles className="h-4 w-4 mr-2 text-purple-600" />
              What is Next?
            </h4>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-medium mr-3">
                  1
                </div>
                <span>Campaign created</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-gray-300 text-white rounded-full flex items-center justify-center text-xs font-medium mr-3">
                  2
                </div>
                <span>Add input sources (VSL, webpages, docs, etc.)</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-gray-300 text-white rounded-full flex items-center justify-center text-xs font-medium mr-3">
                  3
                </div>
                <span>AI extracts marketing intelligence</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-gray-300 text-white rounded-full flex items-center justify-center text-xs font-medium mr-3">
                  4
                </div>
                <span>Generate promotional content</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isCreating || !formData.title.trim() || !formData.description.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isCreating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating Campaign...
              </>
            ) : (
              <>
                Create Campaign
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              💡 You can add input sources immediately after creation or return later
            </div>
            <button 
              onClick={onClose}
              disabled={isCreating}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}