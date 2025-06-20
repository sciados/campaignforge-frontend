// src/app/campaigns/[id]/page.tsx
'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Settings, 
  BarChart3, 
  Brain, 
  Zap,
  Database,
  FileText,
  Target,
  Sparkles,
  Users,
  TrendingUp,
  Calendar,
  ExternalLink,
  Loader2,
  Clock
} from 'lucide-react'
import { useApi } from '@/lib/api'
import { Campaign } from '@/lib/api'
import SalesPageIntelligenceEngine from '@/components/intelligence/SalesPageIntelligenceEngine'
import UniversalInputCollector from '@/components/input-sources/UniversalInputCollector'

interface CampaignOverviewProps {
  campaign: Campaign
}

export default function CampaignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const api = useApi()
  
  const campaignId = params.id as string
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'inputs' | 'intelligence' | 'generate' | 'settings'>('overview')
  const [intelligenceData, setIntelligenceData] = useState<any[]>([])
  const [inputSources, setInputSources] = useState<any[]>([])

  // Load campaign data
  useEffect(() => {
    const loadCampaign = async () => {
      try {
        setIsLoading(true)
        const campaignData = await api.getCampaign(campaignId)
        setCampaign(campaignData)
        
        // Load campaign intelligence
        const intelligence = await api.getCampaignIntelligence(campaignId)
        setIntelligenceData(intelligence.intelligence_sources || [])
        
      } catch (err) {
        console.error('Failed to load campaign:', err)
        setError(err instanceof Error ? err.message : 'Failed to load campaign')
      } finally {
        setIsLoading(false)
      }
    }

    if (campaignId) {
      loadCampaign()
    }
  }, [campaignId, api])

  const handleIntelligenceGenerated = useCallback((intelligence: any) => {
    setIntelligenceData(prev => [...prev, intelligence])
    // Auto-switch to intelligence tab when new intelligence is generated
    if (activeTab === 'inputs') {
      setActiveTab('intelligence')
    }
  }, [activeTab])

  const handleSourceAdded = useCallback((source: any) => {
    setInputSources(prev => [...prev, source])
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaign...</p>
        </div>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <FileText className="h-12 w-12 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Campaign Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The campaign you\'re looking for doesn\'t exist.'}</p>
          <button
            onClick={() => router.push('/campaigns')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Campaigns
          </button>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3, count: null },
    { id: 'inputs', label: 'Input Sources', icon: Database, count: inputSources.length },
    { id: 'intelligence', label: 'Intelligence', icon: Brain, count: intelligenceData.length },
    { id: 'generate', label: 'Generate Content', icon: Sparkles, count: null },
    { id: 'settings', label: 'Settings', icon: Settings, count: null }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/campaigns')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{campaign.title}</h1>
                <p className="text-sm text-gray-500">{campaign.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-500">
                Created {new Date(campaign.created_at).toLocaleDateString()}
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                campaign.status === 'active' 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {campaign.status}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.count !== null && tab.count > 0 && (
                    <span className="bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <CampaignOverview campaign={campaign} />
        )}
        
        {activeTab === 'inputs' && (
          <div className="space-y-6">
            <UniversalInputCollector
              campaignId={campaignId}
              onSourceAdded={handleSourceAdded}
              onIntelligenceGenerated={handleIntelligenceGenerated}
              existingSources={inputSources}
            />
          </div>
        )}
        
        {activeTab === 'intelligence' && (
          <div className="space-y-6">
            <SalesPageIntelligenceEngine
              campaignId={campaignId}
              onIntelligenceGenerated={handleIntelligenceGenerated}
              onError={setError}
            />
            
            {intelligenceData.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Intelligence History ({intelligenceData.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {intelligenceData.map((intel, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{intel.source_title}</h4>
                        <span className="text-sm text-purple-600">
                          {Math.round(intel.confidence_score * 100)}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {intel.campaign_suggestions?.length || 0} campaign suggestions
                      </p>
                      <div className="text-xs text-gray-500">
                        {new Date(intel.created_at || Date.now()).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'generate' && (
          <div className="text-center py-12">
            <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Content Generation</h3>
            <p className="text-gray-600 mb-6">
              Generate marketing content from your collected intelligence
            </p>
            <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all">
              Start Generating Content
            </button>
          </div>
        )}
        
        {activeTab === 'settings' && (
          <CampaignSettings campaign={campaign} onUpdate={setCampaign} />
        )}
      </div>
    </div>
  )
}

// Campaign Overview Component
function CampaignOverview({ campaign }: CampaignOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <Database className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">
                {campaign.intelligence_count || 0}
              </p>
              <p className="text-sm text-gray-500">Intelligence Sources</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">
                {campaign.generated_content_count || 0}
              </p>
              <p className="text-sm text-gray-500">Generated Content</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">
                {campaign.confidence_score ? Math.round(campaign.confidence_score * 100) : 0}%
              </p>
              <p className="text-sm text-gray-500">Avg Confidence</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-2xl font-semibold text-gray-900">
                {campaign.last_activity ? new Date(campaign.last_activity).toLocaleDateString() : 'Today'}
              </p>
              <p className="text-sm text-gray-500">Last Activity</p>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Details</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Target Audience</label>
              <p className="text-gray-900">{campaign.target_audience || 'General audience'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Campaign Type</label>
              <p className="text-gray-900 capitalize">{campaign.campaign_type.replace('_', ' ')}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Tone</label>
              <p className="text-gray-900 capitalize">{campaign.tone || 'Professional'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Style</label>
              <p className="text-gray-900 capitalize">{campaign.style || 'Modern'}</p>
            </div>
            {campaign.keywords && campaign.keywords.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-700">Keywords</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {campaign.keywords.map((keyword, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <div className="flex items-center">
                <Brain className="h-5 w-5 text-purple-600 mr-3" />
                <span className="font-medium text-purple-900">Add Intelligence Source</span>
              </div>
              <ExternalLink className="h-4 w-4 text-purple-600" />
            </button>
            
            <button className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <div className="flex items-center">
                <Sparkles className="h-5 w-5 text-blue-600 mr-3" />
                <span className="font-medium text-blue-900">Generate Content</span>
              </div>
              <ExternalLink className="h-4 w-4 text-blue-600" />
            </button>
            
            <button className="w-full flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <div className="flex items-center">
                <Target className="h-5 w-5 text-green-600 mr-3" />
                <span className="font-medium text-green-900">View Analytics</span>
              </div>
              <ExternalLink className="h-4 w-4 text-green-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Brain className="h-4 w-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">Campaign created</p>
              <p className="text-xs text-gray-500">{new Date(campaign.created_at).toLocaleString()}</p>
            </div>
          </div>
          
          {campaign.intelligence_count && campaign.intelligence_count > 0 && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Zap className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Intelligence sources added</p>
                <p className="text-xs text-gray-500">{campaign.intelligence_count} sources analyzed</p>
              </div>
            </div>
          )}
          
          {campaign.generated_content_count && campaign.generated_content_count > 0 && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <FileText className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Content generated</p>
                <p className="text-xs text-gray-500">{campaign.generated_content_count} pieces created</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Campaign Settings Component
interface CampaignSettingsProps {
  campaign: Campaign
  onUpdate: (campaign: Campaign) => void
}

function CampaignSettings({ campaign, onUpdate }: CampaignSettingsProps) {
  const api = useApi()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    title: campaign.title,
    description: campaign.description,
    target_audience: campaign.target_audience || '',
    tone: campaign.tone || '',
    style: campaign.style || '',
    keywords: campaign.keywords || []
  })
  const [newKeyword, setNewKeyword] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const updatedCampaign = await api.updateCampaign(campaign.id, editData)
      onUpdate(updatedCampaign)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update campaign:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const addKeyword = () => {
    if (newKeyword.trim() && !editData.keywords.includes(newKeyword.trim())) {
      setEditData(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()]
      }))
      setNewKeyword('')
    }
  }

  const removeKeyword = (keyword: string) => {
    setEditData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }))
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Campaign Settings</h3>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Edit Campaign
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Save Changes
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Title
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{campaign.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              {isEditing ? (
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{campaign.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Audience
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.target_audience}
                  onChange={(e) => setEditData(prev => ({ ...prev, target_audience: e.target.value }))}
                  placeholder="e.g., Small business owners, Marketing professionals"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">
                  {campaign.target_audience || 'Not specified'}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tone
              </label>
              {isEditing ? (
                <select
                  value={editData.tone}
                  onChange={(e) => setEditData(prev => ({ ...prev, tone: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select tone...</option>
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="friendly">Friendly</option>
                  <option value="authoritative">Authoritative</option>
                  <option value="conversational">Conversational</option>
                </select>
              ) : (
                <p className="text-gray-900 p-3 bg-gray-50 rounded-lg capitalize">
                  {campaign.tone || 'Not specified'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Style
              </label>
              {isEditing ? (
                <select
                  value={editData.style}
                  onChange={(e) => setEditData(prev => ({ ...prev, style: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select style...</option>
                  <option value="modern">Modern</option>
                  <option value="classic">Classic</option>
                  <option value="creative">Creative</option>
                  <option value="minimalist">Minimalist</option>
                  <option value="bold">Bold</option>
                </select>
              ) : (
                <p className="text-gray-900 p-3 bg-gray-50 rounded-lg capitalize">
                  {campaign.style || 'Not specified'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keywords
              </label>
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                      placeholder="Add keyword..."
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      onClick={addKeyword}
                      className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Add
                    </button>
                  </div>
                  {editData.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {editData.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                        >
                          {keyword}
                          <button
                            onClick={() => removeKeyword(keyword)}
                            className="ml-2 text-purple-600 hover:text-purple-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg">
                  {campaign.keywords && campaign.keywords.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {campaign.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No keywords specified</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-lg p-6 border border-red-200">
        <h3 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-red-700">Delete this campaign</p>
            <p className="text-xs text-red-600">This action cannot be undone</p>
          </div>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Delete Campaign
          </button>
        </div>
      </div>
    </div>
  )
}