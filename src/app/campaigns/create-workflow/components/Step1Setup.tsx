// src/app/campaigns/create-workflow/components/Step1Setup.tsx
'use client'
import React, { useState } from 'react'
import { ArrowRight, Target, Users, Hash, Lock, CheckCircle, Plus, Globe, Link2, Package } from 'lucide-react'

interface Step1SetupProps {
  onComplete: (data: {
    title: string
    description: string
    keywords: string[]
    target_audience: string
    product_name: string
    salespage_url: string
    affiliate_link: string
  }) => Promise<void>
  isLoading: boolean
  initialData: {
    title: string
    description: string
    keywords: string[]
    target_audience: string
    product_name?: string
    salespage_url?: string
    affiliate_link?: string
  }
  isLocked: boolean
}

export default function Step1Setup({ 
  onComplete, 
  isLoading, 
  initialData, 
  isLocked 
}: Step1SetupProps) {
  const [formData, setFormData] = useState({
    ...initialData,
    product_name: initialData.product_name || '',
    salespage_url: initialData.salespage_url || '',
    affiliate_link: initialData.affiliate_link || ''
  })
  const [keywordInput, setKeywordInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [urlValidation, setUrlValidation] = useState({
    salespage_url: { isValidating: false, isValid: false },
    affiliate_link: { isValidating: false, isValid: false }
  })

  // URL validation function
  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  // Handle URL validation with debouncing
  const handleUrlValidation = (field: 'salespage_url' | 'affiliate_link', value: string) => {
    if (!value) {
      setUrlValidation(prev => ({ ...prev, [field]: { isValidating: false, isValid: false } }))
      return
    }

    setUrlValidation(prev => ({ ...prev, [field]: { isValidating: true, isValid: false } }))
    
    setTimeout(() => {
      const isValid = isValidUrl(value)
      setUrlValidation(prev => ({ ...prev, [field]: { isValidating: false, isValid } }))
    }, 500)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear errors when user starts typing
    if (error) setError(null)
    
    // Handle URL validation
    if (field === 'salespage_url' || field === 'affiliate_link') {
      handleUrlValidation(field as 'salespage_url' | 'affiliate_link', value)
    }
  }

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

    // Enhanced validation
    if (!formData.title.trim()) {
      setError('Campaign title is required')
      return
    }

    if (!formData.description.trim()) {
      setError('Campaign description is required')
      return
    }

    if (!formData.product_name.trim()) {
      setError('Product name is required')
      return
    }

    if (!formData.salespage_url.trim()) {
      setError('Salespage URL is required')
      return
    }

    if (!isValidUrl(formData.salespage_url)) {
      setError('Please enter a valid salespage URL (including https://)')
      return
    }

    if (!formData.affiliate_link.trim()) {
      setError('Affiliate link is required')
      return
    }

    if (!isValidUrl(formData.affiliate_link)) {
      setError('Please enter a valid affiliate link (including https://)')
      return
    }

    try {
      await onComplete({
        title: formData.title,
        description: formData.description,
        keywords: formData.keywords,
        target_audience: formData.target_audience,
        product_name: formData.product_name,
        salespage_url: formData.salespage_url,
        affiliate_link: formData.affiliate_link
      })
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-green-800 mb-1">Campaign Title</label>
                <p className="text-green-900 font-medium">{formData.title}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-green-800 mb-1">Product Name</label>
                <p className="text-green-900 font-medium">{formData.product_name}</p>
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
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-green-800 mb-1">Salespage URL</label>
                <p className="text-green-900 break-all">{formData.salespage_url}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-green-800 mb-1">Affiliate Link</label>
                <p className="text-green-900 break-all">{formData.affiliate_link}</p>
              </div>
              
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
          <p className="text-gray-600">Define your campaign basics and product details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Campaign Title */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Campaign Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="e.g., Q1 Product Launch Campaign"
                required
                disabled={isLoading}
              />
            </div>

            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                <Package className="h-4 w-4 inline mr-1" />
                Product Name *
              </label>
              <input
                type="text"
                value={formData.product_name}
                onChange={(e) => handleInputChange('product_name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="e.g., Weight Loss Miracle Course"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                The exact name of the product you are promoting
              </p>
            </div>

            {/* Campaign Description */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Campaign Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
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
                  onChange={(e) => handleInputChange('target_audience', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="e.g., Small business owners, Marketing professionals..."
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Salespage URL */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                <Globe className="h-4 w-4 inline mr-1" />
                Salespage URL *
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={formData.salespage_url}
                  onChange={(e) => handleInputChange('salespage_url', e.target.value)}
                  className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    urlValidation.salespage_url.isValid ? 'border-green-300' : 'border-gray-300'
                  }`}
                  placeholder="https://example.com/salespage"
                  required
                  disabled={isLoading}
                />
                {urlValidation.salespage_url.isValidating && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                {!urlValidation.salespage_url.isValidating && urlValidation.salespage_url.isValid && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                We will analyze this page to understand the product and create targeted content
              </p>
            </div>

            {/* Affiliate Link */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                <Link2 className="h-4 w-4 inline mr-1" />
                Your Affiliate Link *
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={formData.affiliate_link}
                  onChange={(e) => handleInputChange('affiliate_link', e.target.value)}
                  className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    urlValidation.affiliate_link.isValid ? 'border-green-300' : 'border-gray-300'
                  }`}
                  placeholder="https://youraffiliatelink.com/product?id=123"
                  required
                  disabled={isLoading}
                />
                {urlValidation.affiliate_link.isValidating && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                {!urlValidation.affiliate_link.isValidating && urlValidation.affiliate_link.isValid && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                This link will be included in all generated promotional content
              </p>
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
          </div>
        </div>

        {/* Key Information Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">📋 What happens next?</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
            <div>
              <div className="font-medium">Step 2: Analysis</div>
              <div>We will analyze your salespage to extract key insights and strategies</div>
            </div>
            <div>
              <div className="font-medium">Step 3: Generation</div>
              <div>Create unique content using AI-enhanced intelligence</div>
            </div>
            <div>
              <div className="font-medium">Your Link</div>
              <div>All content will include your affiliate link automatically</div>
            </div>
          </div>
        </div>

        {/* Warning about locking */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Lock className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Important Notice</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Once you click Create & Continue, these campaign details will be <strong>locked and cannot be edited</strong>. 
                Please review your information carefully before proceeding.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={
              isLoading || 
              !formData.title.trim() || 
              !formData.description.trim() || 
              !formData.product_name.trim() ||
              !formData.salespage_url.trim() ||
              !formData.affiliate_link.trim() ||
              !urlValidation.salespage_url.isValid ||
              !urlValidation.affiliate_link.isValid
            }
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