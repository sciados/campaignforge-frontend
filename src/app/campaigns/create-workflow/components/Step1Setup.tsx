// src/app/campaigns/create-workflow/components/Step1Setup.tsx
'use client'
import React, { useState } from 'react'
import { ArrowRight, Target, Users, Hash, Lock, CheckCircle, Plus } from 'lucide-react'

interface Step1SetupProps {
  onComplete: (data: {
    title: string
    description: string
    keywords: string[]
    target_audience: string
  }) => Promise<void>
  isLoading: boolean
  initialData: {
    title: string
    description: string
    keywords: string[]
    target_audience: string
  }
  isLocked: boolean
}

export default function Step1Setup({ 
  onComplete, 
  isLoading, 
  initialData, 
  isLocked 
}: Step1SetupProps) {
  const [formData, setFormData] = useState(initialData)
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddKeyword()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!formData.title.trim()) {
      setError('Campaign title is required')
      return
    }

    if (!formData.description.trim()) {
      setError('Campaign description is required')
      return
    }

    try {
      await onComplete(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign')
    }
  }

  // Locked state display
  if (isLocked) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Campaign Created</h2>
              <p className="text-gray-600">Step 1 completed and locked</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-gray-500">
            <Lock className="h-5 w-5" />
            <span className="text-sm font-medium">Locked</span>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-green-900 mb-4">✅ Campaign Details (Locked)</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-green-800 mb-1">Title</label>
              <p className="text-green-900 font-medium">{formData.title}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-green-800 mb-1">Description</label>
              <p className="text-green-900">{formData.description}</p>
            </div>
            
            {formData.target_audience && (
              <div>
                <label className="block text-sm font-medium text-green-800 mb-1">Target Audience</label>
                <p className="text-green-900">{formData.target_audience}</p>
              </div>
            )}
            
            {formData.keywords.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-green-800 mb-1">Keywords</label>
                <div className="flex flex-wrap gap-2">
                  {formData.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                    >
                      <Hash className="w-3 h-3 mr-1" />
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-white rounded-lg border border-green-200">
            <p className="text-sm text-green-700">
              <strong>Campaign setup complete!</strong> Your campaign details are now locked and cannot be edited. 
              Proceed to Step 2 to add source materials for AI analysis.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Editable form
  return (
    <div className="p-8">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
          <Target className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Create Your Campaign</h2>
          <p className="text-gray-600">Define your campaign basics and goals</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Campaign Title */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Campaign Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            placeholder="e.g., Q1 Product Launch Campaign"
            required
            disabled={isLoading}
          />
        </div>

        {/* Campaign Description */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Campaign Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
            placeholder="Describe your campaign goals, key messages, and what you want to achieve..."
            required
            disabled={isLoading}
          />
        </div>

        {/* Target Audience */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Target Audience
            <span className="text-gray-500 font-normal ml-1">(Optional)</span>
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={formData.target_audience}
              onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="e.g., Small business owners, Marketing professionals..."
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Keywords */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Keywords
            <span className="text-gray-500 font-normal ml-1">(Optional)</span>
          </label>
          <div className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Add keywords..."
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                disabled={!keywordInput.trim() || isLoading}
                className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            
            {formData.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                  >
                    <Hash className="w-3 h-3 mr-1" />
                    {keyword}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(keyword)}
                      disabled={isLoading}
                      className="ml-2 text-purple-500 hover:text-purple-700 disabled:opacity-50 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Warning about locking */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Lock className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Important Notice</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Once you click &quot;Next&quot;, these campaign details will be <strong>locked and cannot be edited</strong>. 
                Please review your information carefully before proceeding.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isLoading || !formData.title.trim() || !formData.description.trim()}
            className="flex items-center px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating Campaign...
              </>
            ) : (
              <>
                Create & Continue
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}