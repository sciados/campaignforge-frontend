'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Target, Users, Lightbulb, Sparkles } from 'lucide-react'

interface CampaignFormData {
  title: string
  description: string
  target_audience: string
  campaign_type: string
  tone: string
  style: string
  keywords: string[]
}

export default function CampaignStep1() {
  const router = useRouter()
  const [formData, setFormData] = useState<CampaignFormData>({
    title: '',
    description: '',
    target_audience: '',
    campaign_type: 'social_media',
    tone: 'conversational',
    style: 'modern',
    keywords: []
  })
  const [currentKeyword, setCurrentKeyword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const campaignTypes = [
    { value: 'social_media', label: 'Social Media Campaign', description: 'Posts, stories, and social content' },
    { value: 'email_marketing', label: 'Email Marketing', description: 'Email sequences and newsletters' },
    { value: 'video_content', label: 'Video Content', description: 'Video scripts and multimedia' },
    { value: 'blog_post', label: 'Blog Content', description: 'Articles and written content' },
    { value: 'advertisement', label: 'Advertisements', description: 'Paid ads and promotional content' },
    { value: 'multimedia', label: 'Multimedia Campaign', description: 'Mixed content types' }
  ]

  const tones = [
    { value: 'professional', label: 'Professional' },
    { value: 'conversational', label: 'Conversational' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'authoritative', label: 'Authoritative' },
    { value: 'humorous', label: 'Humorous' },
    { value: 'inspiring', label: 'Inspiring' }
  ]

  const styles = [
    { value: 'modern', label: 'Modern' },
    { value: 'classic', label: 'Classic' },
    { value: 'minimalist', label: 'Minimalist' },
    { value: 'bold', label: 'Bold' },
    { value: 'elegant', label: 'Elegant' },
    { value: 'creative', label: 'Creative' }
  ]

  const handleInputChange = (field: keyof CampaignFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addKeyword = () => {
    if (currentKeyword.trim() && !formData.keywords.includes(currentKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, currentKeyword.trim()]
      }))
      setCurrentKeyword('')
    }
  }

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }))
  }

  const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addKeyword()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Validation
    if (!formData.title.trim()) {
      setError('Campaign title is required')
      setIsLoading(false)
      return
    }

    if (!formData.description.trim()) {
      setError('Campaign description is required')
      setIsLoading(false)
      return
    }

    try {
      const token = localStorage.getItem('authToken')
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://campaign-backend-production-e2db.up.railway.app'

      const response = await fetch(`${API_BASE_URL}/api/campaigns`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          target_audience: formData.target_audience,
          campaign_type: formData.campaign_type,
          tone: formData.tone,
          style: formData.style,
          settings: {
            keywords: formData.keywords,
            step_completed: 1
          }
        })
      })

      if (response.ok) {
        const campaign = await response.json()
        // Navigate to step 2 with the campaign ID
        router.push(`/campaigns/${campaign.id}/step-2`)
      } else {
        const errorData = await response.json()
        setError(errorData.detail || 'Failed to create campaign')
      }
    } catch (error) {
      setError('Network error - please try again')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Sparkles className="h-8 w-8 mr-3 text-purple-600" />
                Create New Campaign
              </h1>
              <p className="text-gray-600 mt-2">Step 1 of 3: Define your campaign basics and goals</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
                <span className="text-sm text-purple-600 font-medium">Setup</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm">2</div>
                <span className="text-sm text-gray-500">Input Sources</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm">3</div>
                <span className="text-sm text-gray-500">Generate Content</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <Target className="h-6 w-6 mr-3 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Campaign Basics</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Q1 Product Launch Campaign"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your campaign goals, key messages, and what you want to achieve..."
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={formData.target_audience}
                  onChange={(e) => handleInputChange('target_audience', e.target.value)}
                  placeholder="e.g., Small business owners, tech enthusiasts, fitness professionals..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Campaign Type */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <Users className="h-6 w-6 mr-3 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Campaign Type</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaignTypes.map((type) => (
                <div
                  key={type.value}
                  onClick={() => handleInputChange('campaign_type', type.value)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.campaign_type === type.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h3 className="font-medium text-gray-900 mb-1">{type.label}</h3>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Voice & Style */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <Lightbulb className="h-6 w-6 mr-3 text-yellow-600" />
              <h2 className="text-xl font-semibold text-gray-900">Voice & Style</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tone of Voice
                </label>
                <select
                  value={formData.tone}
                  onChange={(e) => handleInputChange('tone', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {tones.map((tone) => (
                    <option key={tone.value} value={tone.value}>
                      {tone.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visual Style
                </label>
                <select
                  value={formData.style}
                  onChange={(e) => handleInputChange('style', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {styles.map((style) => (
                    <option key={style.value} value={style.value}>
                      {style.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Keywords */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Keywords & Tags</h2>
            
            <div className="mb-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={currentKeyword}
                  onChange={(e) => setCurrentKeyword(e.target.value)}
                  onKeyPress={handleKeywordKeyPress}
                  placeholder="Add keywords related to your campaign..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={addKeyword}
                  className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                >
                  {keyword}
                  <button
                    type="button"
                    onClick={() => removeKeyword(keyword)}
                    className="ml-2 text-purple-500 hover:text-purple-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              ) : (
                <ArrowRight className="h-5 w-5 mr-2" />
              )}
              {isLoading ? 'Creating Campaign...' : 'Continue to Input Sources'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}