// src/app/campaigns/[id]/settings/page.tsx - Functional Campaign Settings
// Updated: Campaign settings now fully functional with all 4 sections active
"use client";

import React, { useState, useEffect } from 'react'
import { notFound, useRouter } from 'next/navigation'
import { ArrowLeft, Settings, Target, Hash, User, Globe, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useApi } from '@/lib/api'
import type { Campaign } from '@/lib/types/campaign'

interface SettingsPageProps {
  params: {
    id: string
  }
}

export default function CampaignSettingsPage({ params }: SettingsPageProps) {
  const { id } = params
  const router = useRouter()
  const api = useApi()

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    keywords: '',
    target_audience: '',
    tone: 'professional',
    style: 'modern',
    // Brand Voice settings
    brand_voice: 'professional',
    brand_personality: '',
    messaging_style: 'informative',
    // Advanced preferences
    content_length: 'medium',
    ai_creativity: 'balanced',
    include_emojis: false,
    include_calls_to_action: true,
    content_focus: 'benefits'
  })

  if (!id) {
    notFound()
  }

  // Load campaign data
  useEffect(() => {
    const loadCampaign = async () => {
      try {
        setLoading(true)
        const campaignData = await api.getCampaign(id)
        setCampaign(campaignData)

        // Populate form with existing data
        setFormData({
          title: campaignData.title || '',
          description: campaignData.description || '',
          keywords: campaignData.keywords ? campaignData.keywords.join(', ') : '',
          target_audience: campaignData.target_audience || '',
          tone: campaignData.tone || 'professional',
          style: campaignData.style || 'modern',
          // Brand Voice settings
          brand_voice: campaignData.settings?.brand_voice || 'professional',
          brand_personality: campaignData.settings?.brand_personality || '',
          messaging_style: campaignData.settings?.messaging_style || 'informative',
          // Advanced preferences
          content_length: campaignData.settings?.content_length || 'medium',
          ai_creativity: campaignData.settings?.ai_creativity || 'balanced',
          include_emojis: campaignData.settings?.include_emojis || false,
          include_calls_to_action: campaignData.settings?.include_calls_to_action || true,
          content_focus: campaignData.settings?.content_focus || 'benefits'
        })
      } catch (err) {
        console.error('Failed to load campaign:', err)
        setError('Failed to load campaign data')
      } finally {
        setLoading(false)
      }
    }

    loadCampaign()
  }, [id, api])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear messages when user starts typing
    setError(null)
    setSuccessMessage(null)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)

      const updateData = {
        title: formData.title,
        description: formData.description,
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
        target_audience: formData.target_audience,
        tone: formData.tone,
        style: formData.style,
        settings: {
          ...campaign?.settings,
          brand_voice: formData.brand_voice,
          brand_personality: formData.brand_personality,
          messaging_style: formData.messaging_style,
          content_length: formData.content_length,
          ai_creativity: formData.ai_creativity,
          include_emojis: formData.include_emojis,
          include_calls_to_action: formData.include_calls_to_action,
          content_focus: formData.content_focus
        }
      }

      await api.updateCampaign(id, updateData)
      setSuccessMessage('Campaign settings saved successfully!')

      // Update local campaign state
      setCampaign(prev => prev ? { ...prev, ...updateData } : null)

      // Auto-hide success message
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error('Failed to save campaign:', err)
      setError('Failed to save campaign settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading campaign settings...</p>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Campaign Not Found</h2>
          <p className="text-gray-600 mb-4">The campaign you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/campaigns" className="text-purple-600 hover:text-purple-700">
            Return to Campaigns
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href={`/campaigns/${id}`}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Campaign Settings</h1>
                <p className="text-sm text-gray-600">
                  Configure {campaign.title} preferences and parameters
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {successMessage && (
                <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-1 rounded-lg">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">{successMessage}</span>
                </div>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>{saving ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Basic Information */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Basic Information</h2>
            <p className="text-gray-600">Configure the core details of your campaign</p>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter campaign title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Describe your campaign goals and strategy"
              />
            </div>
          </div>
        </div>

        {/* Keywords Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Hash className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Keywords</h2>
                <p className="text-gray-600">Manage target keywords and phrases for content optimization</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Keywords</label>
              <input
                type="text"
                value={formData.keywords}
                onChange={(e) => handleInputChange('keywords', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="marketing, digital, strategy, affiliate (comma-separated)"
              />
              <p className="text-xs text-gray-500 mt-1">Separate keywords with commas. These will be used for content optimization and SEO.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content Focus</label>
              <select
                value={formData.content_focus}
                onChange={(e) => handleInputChange('content_focus', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="benefits">Focus on Benefits</option>
                <option value="features">Focus on Features</option>
                <option value="problems">Focus on Problem-Solving</option>
                <option value="transformation">Focus on Transformation</option>
                <option value="social_proof">Focus on Social Proof</option>
              </select>
            </div>
          </div>
        </div>

        {/* Audience Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Audience</h2>
                <p className="text-gray-600">Define target audience demographics and psychographics</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience Description</label>
              <textarea
                value={formData.target_audience}
                onChange={(e) => handleInputChange('target_audience', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Describe your ideal customer: demographics, interests, pain points, goals, and behaviors..."
              />
              <p className="text-xs text-gray-500 mt-1">Include age, interests, challenges, and what motivates them to buy.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content Tone</label>
                <select
                  value={formData.tone}
                  onChange={(e) => handleInputChange('tone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="friendly">Friendly</option>
                  <option value="authoritative">Authoritative</option>
                  <option value="conversational">Conversational</option>
                  <option value="enthusiastic">Enthusiastic</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content Style</label>
                <select
                  value={formData.style}
                  onChange={(e) => handleInputChange('style', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="modern">Modern</option>
                  <option value="classic">Classic</option>
                  <option value="creative">Creative</option>
                  <option value="minimalist">Minimalist</option>
                  <option value="bold">Bold</option>
                  <option value="elegant">Elegant</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Voice Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Brand Voice</h2>
                <p className="text-gray-600">Configure brand voice, tone, and messaging preferences</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand Voice</label>
              <select
                value={formData.brand_voice}
                onChange={(e) => handleInputChange('brand_voice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="professional">Professional & Expert</option>
                <option value="friendly">Friendly & Approachable</option>
                <option value="authoritative">Authoritative & Trustworthy</option>
                <option value="innovative">Innovative & Forward-thinking</option>
                <option value="caring">Caring & Supportive</option>
                <option value="bold">Bold & Confident</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand Personality</label>
              <textarea
                value={formData.brand_personality}
                onChange={(e) => handleInputChange('brand_personality', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Describe your brand's personality traits, values, and how you want to be perceived..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Messaging Style</label>
              <select
                value={formData.messaging_style}
                onChange={(e) => handleInputChange('messaging_style', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="informative">Informative & Educational</option>
                <option value="persuasive">Persuasive & Action-oriented</option>
                <option value="storytelling">Storytelling & Narrative</option>
                <option value="direct">Direct & To-the-point</option>
                <option value="inspirational">Inspirational & Motivating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Globe className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Preferences</h2>
                <p className="text-gray-600">Set campaign-wide preferences and AI generation parameters</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content Length</label>
                <select
                  value={formData.content_length}
                  onChange={(e) => handleInputChange('content_length', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="short">Short & Concise</option>
                  <option value="medium">Medium Length</option>
                  <option value="long">Long & Detailed</option>
                  <option value="varies">Varies by Content Type</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">AI Creativity Level</label>
                <select
                  value={formData.ai_creativity}
                  onChange={(e) => handleInputChange('ai_creativity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="conservative">Conservative & Safe</option>
                  <option value="balanced">Balanced</option>
                  <option value="creative">Creative & Innovative</option>
                  <option value="experimental">Experimental & Bold</option>
                </select>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Include Emojis</label>
                  <p className="text-xs text-gray-500">Add emojis to make content more engaging</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.include_emojis}
                    onChange={(e) => handleInputChange('include_emojis', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Include Calls-to-Action</label>
                  <p className="text-xs text-gray-500">Automatically include CTAs in generated content</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.include_calls_to_action}
                    onChange={(e) => handleInputChange('include_calls_to_action', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Product Information (if available) */}
        {campaign.product_info && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Product Information</h2>
              <p className="text-gray-600">Product details from Content Library</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <p className="text-gray-900">{campaign.product_info.product_name || campaign.product_info.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                  <p className="text-gray-900 capitalize">{campaign.product_info.platform}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                  <p className="text-gray-900">{campaign.product_info.vendor_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commission Rate</label>
                  <p className="text-gray-900">{campaign.product_info.commission_rate}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Link
            href={`/campaigns/${id}`}
            className="inline-flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span>Cancel</span>
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}