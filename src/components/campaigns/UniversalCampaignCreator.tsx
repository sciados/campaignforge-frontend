import React, { useState } from 'react'
import { Video, FileText, Globe, Target, Hash, Users, Plus } from 'lucide-react'

interface UniversalCampaignCreatorProps {
  onCreateCampaign: (data: UniversalCampaignData) => Promise<void>
  isLoading?: boolean
}

interface UniversalCampaignData {
  title: string
  description: string
  keywords: string[]
  target_audience: string
  initial_input_method?: string
}

export default function UniversalCampaignCreator({ 
  onCreateCampaign, 
  isLoading = false 
}: UniversalCampaignCreatorProps) {
  const [formData, setFormData] = useState<UniversalCampaignData>({
    title: '',
    description: '',
    keywords: [],
    target_audience: ''
  })
  const [keywordInput, setKeywordInput] = useState('')
  const [error, setError] = useState<string | null>(null)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      setError('Campaign title is required')
      return
    }
    
    if (!formData.description.trim()) {
      setError('Campaign description is required')
      return
    }
    
    setError(null)
    
    try {
      await onCreateCampaign(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddKeyword()
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
      {/* Header */}
      <div className="mb-8">
        <h3 className="text-2xl font-light text-black mb-2">Create Universal Campaign</h3>
        <p className="text-gray-600 font-light">
          Build a comprehensive campaign with flexible input options
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
            required
            disabled={isLoading}
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
            required
            disabled={isLoading}
          />
        </div>

        {/* Keywords */}
        <div>
          <label className="block text-sm font-medium text-black mb-3">
            Campaign Keywords
            <span className="text-gray-500 font-light ml-1">(Optional)</span>
          </label>
          <div className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-4 py-2 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="Add keywords..."
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                disabled={!keywordInput.trim() || isLoading}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
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
                      disabled={isLoading}
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
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={formData.target_audience}
              onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="e.g., Small business owners, Marketing professionals..."
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Input Method Preview */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-medium text-black mb-4 flex items-center">
            <Target className="h-4 w-4 mr-2 text-gray-600" />
            Supported Input Sources
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Video className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Video Sales Letters</p>
                <p className="text-xs text-gray-500">VSL analysis</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Globe className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Web Pages</p>
                <p className="text-xs text-gray-500">URL scraping</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Documents</p>
                <p className="text-xs text-gray-500">PDF, DOC, TXT</p>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 mt-3">
            Add input sources after campaign creation to begin intelligence extraction
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !formData.title.trim() || !formData.description.trim()}
          className="w-full bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Creating Campaign...
            </>
          ) : (
            'Create Universal Campaign'
          )}
        </button>
      </form>
    </div>
  )
}