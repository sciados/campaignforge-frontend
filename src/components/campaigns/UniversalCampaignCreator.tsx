import React, { useState } from 'react'
import { Video, FileText, Globe, Target, Hash, Users } from 'lucide-react'

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
    await onCreateCampaign(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Campaign Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Campaign Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Enter campaign title..."
          required
        />
      </div>

      {/* Campaign Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Campaign Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Describe your campaign goals and objectives..."
          required
        />
      </div>

      {/* Keywords */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Campaign Keywords (Optional)
        </label>
        <div className="flex space-x-2 mb-2">
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Add keywords..."
          />
          <button
            type="button"
            onClick={handleAddKeyword}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
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
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="e.g., Small business owners, Marketing professionals..."
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !formData.title.trim() || !formData.description.trim()}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Creating Campaign...' : 'Create Universal Campaign'}
      </button>
    </form>
  )
}