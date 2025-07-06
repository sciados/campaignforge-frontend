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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-sm max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-8 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-light text-black">Create Campaign</h3>
              <p className="text-gray-600 mt-1 font-light">
                Start with the basics, add content sources later
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Campaign Title */}
          <div>
            <label className="block text-sm font-medium text-black mb-3">
              Campaign Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="Enter campaign title..."
              disabled={isCreating}
              onKeyPress={(e) => handleKeyPress(e, handleSubmit)}
            />
          </div>

          {/* Campaign Description */}
          <div>
            <label className="block text-sm font-medium text-black mb-3">
              Campaign Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
              placeholder="Describe your campaign goals and objectives..."
              disabled={isCreating}
            />
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium text-black mb-3">
              Keywords
              <span className="text-gray-500 font-light ml-1">(Optional)</span>
            </label>
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, handleAddKeyword)}
                  className="flex-1 px-4 py-2 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="Add keywords..."
                  disabled={isCreating}
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  disabled={!keywordInput.trim() || isCreating}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Add
                </button>
              </div>
              
              {formData.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      <Hash className="w-3 h-3 mr-1" />
                      {keyword}
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(keyword)}
                        disabled={isCreating}
                        className="ml-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors"
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
            <label className="block text-sm font-medium text-black mb-3">
              Target Audience
              <span className="text-gray-500 font-light ml-1">(Optional)</span>
            </label>
            <input
              type="text"
              value={formData.target_audience}
              onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="e.g., Small business owners, Marketing professionals..."
              disabled={isCreating}
            />
          </div>

          {/* Next Steps Preview */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-medium text-black mb-4 flex items-center">
              <Sparkles className="h-4 w-4 mr-2 text-gray-600" />
              What happens next?
            </h4>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs font-medium mr-3">
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
        </div>

        {/* Footer */}
        <div className="p-8 pt-0">
          <div className="flex space-x-3">
            <button 
              onClick={onClose}
              disabled={isCreating}
              className="flex-1 py-3 px-6 bg-gray-100 text-black rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isCreating || !formData.title.trim() || !formData.description.trim()}
              className="flex-1 bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  Create Campaign
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              💡 You can add input sources immediately after creation
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}