// src/components/marketplace/ClickBankCampaignCreator.tsx
import React, { useState } from 'react'
import { X, Lightbulb, Target, Palette, Type } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface ClickBankProduct {
  id: string
  title: string
  vendor: string
  description: string
  salespage_url: string
  key_insights: string[]
  recommended_angles: string[]
  target_audience?: any
}

interface ClickBankCampaignCreatorProps {
  isOpen: boolean
  onClose: () => void
  product: ClickBankProduct | null
  onCreateCampaign: (campaignData: any) => void
}

export default function ClickBankCampaignCreator({
  isOpen,
  onClose,
  product,
  onCreateCampaign
}: ClickBankCampaignCreatorProps) {
  const [campaignTitle, setCampaignTitle] = useState('')
  const [campaignDescription, setCampaignDescription] = useState('')
  const [selectedAngles, setSelectedAngles] = useState<string[]>([])
  const [selectedTone, setSelectedTone] = useState('conversational')
  const [selectedStyle, setSelectedStyle] = useState('modern')

  React.useEffect(() => {
    if (product) {
      setCampaignTitle(`${product.title} Campaign`)
      setCampaignDescription(`Promote ${product.title} by ${product.vendor} using AI-generated marketing content.`)
      setSelectedAngles(product.recommended_angles.slice(0, 3))
    }
  }, [product])

  if (!isOpen || !product) return null

  const handleCreate = () => {
    const campaignData = {
      title: campaignTitle,
      description: campaignDescription,
      keywords: selectedAngles,
      tone: selectedTone,
      style: selectedStyle,
      campaign_type: 'universal',
      clickbank_product_id: product.id,
      settings: {
        clickbank_integration: true,
        source_url: product.salespage_url,
        selected_angles: selectedAngles,
        product_vendor: product.vendor
      }
    }
    
    onCreateCampaign(campaignData)
  }

  const toggleAngle = (angle: string) => {
    setSelectedAngles(prev => 
      prev.includes(angle) 
        ? prev.filter(a => a !== angle)
        : [...prev, angle]
    )
  }

  const tones = [
    { id: 'conversational', name: 'Conversational', description: 'Friendly and approachable' },
    { id: 'professional', name: 'Professional', description: 'Formal and authoritative' },
    { id: 'casual', name: 'Casual', description: 'Relaxed and informal' },
    { id: 'persuasive', name: 'Persuasive', description: 'Compelling and action-oriented' }
  ]

  const styles = [
    { id: 'modern', name: 'Modern', description: 'Clean and contemporary' },
    { id: 'classic', name: 'Classic', description: 'Timeless and traditional' },
    { id: 'bold', name: 'Bold', description: 'Strong and impactful' },
    { id: 'minimalist', name: 'Minimalist', description: 'Simple and focused' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-light text-black">Create Campaign</h3>
              <p className="text-gray-600 mt-1">From ClickBank product: {product.title}</p>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black transition-colors rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Campaign Basics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Type className="w-5 h-5" />
                <span>Campaign Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Title
                </label>
                <input
                  type="text"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter campaign title..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Description
                </label>
                <textarea
                  value={campaignDescription}
                  onChange={(e) => setCampaignDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your campaign goals..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Campaign Angles */}
          {product.recommended_angles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5" />
                  <span>Recommended Campaign Angles</span>
                </CardTitle>
                <p className="text-sm text-gray-600">Select angles to focus your campaign messaging</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {product.recommended_angles.map((angle, idx) => (
                    <button
                      key={idx}
                      onClick={() => toggleAngle(angle)}
                      className={`p-3 text-left border rounded-lg transition-all ${
                        selectedAngles.includes(angle)
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{angle}</span>
                        {selectedAngles.includes(angle) && (
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tone & Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tone Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Campaign Tone</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {tones.map((tone) => (
                    <button
                      key={tone.id}
                      onClick={() => setSelectedTone(tone.id)}
                      className={`w-full p-3 text-left border rounded-lg transition-all ${
                        selectedTone === tone.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-sm">{tone.name}</div>
                      <div className="text-xs text-gray-500">{tone.description}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Style Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="w-5 h-5" />
                  <span>Campaign Style</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {styles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`w-full p-3 text-left border rounded-lg transition-all ${
                        selectedStyle === style.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-sm">{style.name}</div>
                      <div className="text-xs text-gray-500">{style.description}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Insights Preview */}
          {product.key_insights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Product Insights</CardTitle>
                <p className="text-sm text-gray-600">AI-extracted insights that will inform your content</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {product.key_insights.slice(0, 4).map((insight, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span className="text-sm text-gray-700">{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              💡 Campaign will be pre-populated with ClickBank product intelligence
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={!campaignTitle.trim()}>
                Create Campaign
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}