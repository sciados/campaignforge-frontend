// frontend/src/components/ContentGenerator.tsx
import React, { useState, useCallback } from 'react'
import { 
  Wand2, 
  Mail, 
  MessageSquare, 
  FileText, 
  Globe, 
  Video, 
  Megaphone,
  Settings,
  Copy,
  Download,
  Eye,
  TrendingUp,
  Star,
  Loader2,
  CheckCircle,
  Lightbulb,
  AlertCircle
} from 'lucide-react'

interface IntelligenceSource {
  id: string
  source_title: string
  source_type: string
  confidence_score: number
}

interface ContentGeneratorProps {
  campaignId: string
  intelligenceSources: IntelligenceSource[]
}

interface GeneratedContent {
  content_id: string
  content_type: string
  generated_content: {
    title: string
    content: any
    metadata?: any
    usage_tips?: string[]
  }
  smart_url?: string
  performance_predictions: any
}

const CONTENT_TYPES = [
  {
    id: 'email_sequence',
    name: 'Email Sequence',
    icon: Mail,
    description: 'Multi-email nurture sequence',
    credits: 3,
    color: 'bg-blue-500'
  },
  {
    id: 'SOCIAL_POSTS',
    name: 'Social Media Posts',
    icon: MessageSquare,
    description: '10+ social media posts',
    credits: 2,
    color: 'bg-green-500'
  },
  {
    id: 'ad_copy',
    name: 'Ad Copy',
    icon: Megaphone,
    description: 'Multiple ad variations',
    credits: 2,
    color: 'bg-red-500'
  },
  {
    id: 'blog_post',
    name: 'Blog Post',
    icon: FileText,
    description: 'SEO-optimized article',
    credits: 4,
    color: 'bg-purple-500'
  },
  {
    id: 'LANDING_PAGE',
    name: 'Landing Page',
    icon: Globe,
    description: 'Conversion-optimized page',
    credits: 5,
    color: 'bg-orange-500'
  },
  {
    id: 'video_script',
    name: 'Video Script',
    icon: Video,
    description: 'Engaging video content',
    credits: 3,
    color: 'bg-indigo-500'
  }
]

export default function ContentGenerator({ campaignId, intelligenceSources }: ContentGeneratorProps) {
  const [selectedContentType, setSelectedContentType] = useState<string | null>(null)
  const [selectedIntelligence, setSelectedIntelligence] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [showPreferences, setShowPreferences] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Content preferences state
  const [preferences, setPreferences] = useState({
    tone: 'conversational',
    length: 'medium',
    audience: 'general',
    style: 'engaging',
    platform: 'general'
  })

  const generateContent = useCallback(async () => {
    if (!selectedContentType || !selectedIntelligence) return
    
    setIsGenerating(true)
    setError(null)
    
    try {
      const response = await fetch('/intelligence/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          intelligence_id: selectedIntelligence,
          content_type: selectedContentType,
          preferences: preferences,
          campaign_id: campaignId
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Content generation failed')
      }
      
      const result = await response.json()
      setGeneratedContent(result)
      
    } catch (error) {
      console.error('Content generation error:', error)
      setError(error instanceof Error ? error.message : 'Content generation failed')
    } finally {
      setIsGenerating(false)
    }
  }, [selectedContentType, selectedIntelligence, preferences, campaignId])

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // Show success toast - you can implement toast notification here
      console.log('Content copied to clipboard')
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }, [])

  const downloadContent = useCallback((content: any, filename: string) => {
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [])

  if (intelligenceSources.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <Wand2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Intelligence Sources</h3>
        <p className="text-gray-600">
          Analyze competitor content first to generate intelligence-driven marketing materials.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Wand2 className="h-6 w-6 mr-2 text-purple-600" />
              Content Generator
            </h2>
            <p className="text-gray-600 mt-1">
              Generate marketing content using competitive intelligence
            </p>
          </div>
          <button
            onClick={() => setShowPreferences(!showPreferences)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings className="h-4 w-4 mr-2" />
            Preferences
          </button>
        </div>

        {/* Preferences Panel */}
        {showPreferences && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-medium text-gray-900 mb-4">Content Preferences</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tone</label>
                <select
                  value={preferences.tone}
                  onChange={(e) => setPreferences({...preferences, tone: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="professional">Professional</option>
                  <option value="conversational">Conversational</option>
                  <option value="enthusiastic">Enthusiastic</option>
                  <option value="educational">Educational</option>
                  <option value="humorous">Humorous</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Length</label>
                <select
                  value={preferences.length}
                  onChange={(e) => setPreferences({...preferences, length: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
                <select
                  value={preferences.audience}
                  onChange={(e) => setPreferences({...preferences, audience: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="general">General</option>
                  <option value="beginners">Beginners</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Style</label>
                <select
                  value={preferences.style}
                  onChange={(e) => setPreferences({...preferences, style: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="engaging">Engaging</option>
                  <option value="informative">Informative</option>
                  <option value="persuasive">Persuasive</option>
                  <option value="inspiring">Inspiring</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                <select
                  value={preferences.platform}
                  onChange={(e) => setPreferences({...preferences, platform: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="general">General</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="twitter">Twitter</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Intelligence Source Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-medium text-gray-900 mb-4">Select Intelligence Source</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {intelligenceSources.map((source) => (
            <div
              key={source.id}
              onClick={() => setSelectedIntelligence(source.id)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedIntelligence === source.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 truncate">{source.source_title}</h4>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm font-medium text-gray-600">
                    {Math.round(source.confidence_score * 100)}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 capitalize">{source.source_type.replace('_', ' ')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Content Type Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-medium text-gray-900 mb-4">Choose Content Type</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {CONTENT_TYPES.map((contentType) => {
            const IconComponent = contentType.icon
            return (
              <div
                key={contentType.id}
                onClick={() => setSelectedContentType(contentType.id)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedContentType === contentType.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center mb-3">
                  <div className={`p-2 rounded-lg ${contentType.color} text-white mr-3`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{contentType.name}</h4>
                    <p className="text-sm text-gray-600">{contentType.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{contentType.credits} credits</span>
                  {selectedContentType === contentType.id && (
                    <CheckCircle className="h-4 w-4 text-purple-600" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-center">
        <button
          onClick={generateContent}
          disabled={!selectedContentType || !selectedIntelligence || isGenerating}
          className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-lg"
        >
          {isGenerating ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : (
            <Wand2 className="h-5 w-5 mr-2" />
          )}
          {isGenerating ? 'Generating Content...' : 'Generate Content'}
        </button>
      </div>

      {/* Generated Content Display */}
      {generatedContent && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {generatedContent.generated_content?.title || 'Generated Content'}
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => copyToClipboard(JSON.stringify(generatedContent.generated_content, null, 2))}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </button>
              <button
                onClick={() => downloadContent(generatedContent.generated_content, `${generatedContent.content_type}.json`)}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </button>
            </div>
          </div>

          {/* Performance Predictions */}
          {generatedContent.performance_predictions && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-3">
                <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                <h4 className="font-medium text-gray-900">Performance Predictions</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(generatedContent.performance_predictions).map(([key, value]) => {
                  if (key === 'optimization_suggestions' || key === 'success_factors') return null
                  return (
                    <div key={key} className="text-center">
                      <div className="text-lg font-bold text-gray-900">
                        {typeof value === 'number' 
                          ? `${Math.round(value * 100)}%` 
                          : String(value)}
                      </div>
                      <div className="text-sm text-gray-600 capitalize">
                        {key.replace(/_/g, ' ')}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Smart URL */}
          {generatedContent.smart_url && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-2">
                <Globe className="h-5 w-5 text-blue-600 mr-2" />
                <h4 className="font-medium text-gray-900">Smart Tracking URL</h4>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={generatedContent.smart_url}
                  readOnly
                  className="flex-1 p-2 bg-white border border-gray-300 rounded-md text-sm"
                />
                <button
                  onClick={() => copyToClipboard(generatedContent.smart_url || '')}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  Copy URL
                </button>
              </div>
            </div>
          )}

          {/* Content Display */}
          <div className="space-y-4">
            {/* Email Sequence Display */}
            {generatedContent.content_type === 'email_sequence' && (
              <div className="space-y-4">
                {generatedContent.generated_content.content?.map((email: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-gray-900">Email #{email.email_number || index + 1}</h5>
                      <button
                        onClick={() => copyToClipboard(`Subject: ${email.subject || 'No subject'}\n\n${email.body || 'No content'}`)}
                        className="text-sm text-purple-600 hover:text-purple-700"
                      >
                        Copy Email
                      </button>
                    </div>
                    <div className="bg-gray-50 rounded-md p-3 mb-3">
                      <strong className="text-sm text-gray-700">Subject: </strong>
                      <span className="text-sm">{email.subject || 'No subject'}</span>
                    </div>
                    <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                      {email.body || 'No content available'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Social Posts Display */}
            {generatedContent.content_type === 'SOCIAL_POSTS' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedContent.generated_content.content?.map((post: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-gray-900">Post #{index + 1}</h5>
                      <button
                        onClick={() => copyToClipboard(post.text || '')}
                        className="text-sm text-purple-600 hover:text-purple-700"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="whitespace-pre-wrap text-sm text-gray-700 mb-3">
                      {post.text || 'No content available'}
                    </div>
                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.hashtags.map((hashtag: string, idx: number) => (
                          <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {hashtag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Ad Copy Display */}
            {generatedContent.content_type === 'ad_copy' && (
              <div className="space-y-6">
                {Object.entries(generatedContent.generated_content.content || {}).map(([section, items]) => (
                  <div key={section} className="border border-gray-200 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-3 capitalize">
                      {section.replace(/_/g, ' ')}
                    </h5>
                    <div className="space-y-2">
                      {Array.isArray(items) && items.map((item: string, index: number) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 rounded-md p-3">
                          <span className="text-sm text-gray-700">{item}</span>
                          <button
                            onClick={() => copyToClipboard(item)}
                            className="text-xs text-purple-600 hover:text-purple-700"
                          >
                            Copy
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Blog Post Display */}
            {generatedContent.content_type === 'blog_post' && (
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-3">Blog Post Content</h5>
                  <div className="prose max-w-none">
                    <h1 className="text-2xl font-bold mb-4">
                      {generatedContent.generated_content.content?.headline || 'Blog Post Title'}
                    </h1>
                    {generatedContent.generated_content.content?.sections?.map((section: any, index: number) => (
                      <div key={index} className="mb-6">
                        <h2 className="text-xl font-semibold mb-2">{section.title || `Section ${index + 1}`}</h2>
                        <div className="whitespace-pre-wrap text-gray-700">{section.content || 'No content available'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Landing Page Display */}
            {generatedContent.content_type === 'LANDING_PAGE' && (
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-3">Landing Page Sections</h5>
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-md p-4">
                      <h3 className="text-xl font-bold text-gray-900">
                        {generatedContent.generated_content.content?.headline || 'Landing Page Headline'}
                      </h3>
                      {generatedContent.generated_content.content?.subheadline && (
                        <p className="text-gray-600 mt-2">
                          {generatedContent.generated_content.content.subheadline}
                        </p>
                      )}
                    </div>
                    {generatedContent.generated_content.content?.sections?.map((section: string, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-md p-3">
                        <h4 className="font-medium text-gray-900">{section}</h4>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Video Script Display */}
            {generatedContent.content_type === 'video_script' && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-3">Video Script</h5>
                <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                  {generatedContent.generated_content.content?.script || 
                   generatedContent.generated_content.content ||
                   'No script content available'}
                </div>
              </div>
            )}

            {/* Generic Content Display */}
            {!['email_sequence', 'SOCIAL_POSTS', 'ad_copy', 'blog_post', 'LANDING_PAGE', 'video_script'].includes(generatedContent.content_type) && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-3">Generated Content</h5>
                <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                  {typeof generatedContent.generated_content.content === 'string' 
                    ? generatedContent.generated_content.content
                    : JSON.stringify(generatedContent.generated_content.content, null, 2)
                  }
                </div>
              </div>
            )}
          </div>

          {/* Usage Tips */}
          {generatedContent.generated_content.usage_tips && generatedContent.generated_content.usage_tips.length > 0 && (
            <div className="mt-6 bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Lightbulb className="h-5 w-5 text-yellow-600 mr-2" />
                <h4 className="font-medium text-gray-900">Usage Tips</h4>
              </div>
              <ul className="space-y-1">
                {generatedContent.generated_content.usage_tips.map((tip: string, index: number) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex space-x-3 pt-4 border-t border-gray-200">
            <button 
              onClick={() => {
                // Save content to campaign
                console.log('Saving content to campaign:', generatedContent)
              }}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-all"
            >
              Save to Campaign
            </button>
            <button 
              onClick={() => {
                // Generate more variations with same settings
                generateContent()
              }}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Generate More Variations
            </button>
            <button 
              onClick={() => {
                // Preview content in new window or modal
                console.log('Previewing content:', generatedContent)
              }}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              <Eye className="h-4 w-4 mr-2 inline" />
              Preview
            </button>
          </div>
        </div>
      )}
    </div>
  )
}