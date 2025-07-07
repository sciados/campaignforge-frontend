// src/app/marketplace/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useApi } from '@/lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, TrendingUp, ShoppingBag, Star, ChevronDown, ChevronRight, TrendingUp as TrendingUpIcon, DollarSign, Users, Lightbulb, X, Target, Palette, Type, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

// ============================================================================
// INLINE COMPONENTS (to avoid import path issues)
// ============================================================================

interface ClickBankProduct {
  id: string
  title: string
  vendor: string
  description: string
  gravity: number
  commission_rate: number
  salespage_url: string
  product_id?: string
  vendor_id?: string
  category: string
  analysis_status: 'pending' | 'processing' | 'completed' | 'failed'
  analysis_score?: number
  key_insights: string[]
  recommended_angles: string[]
  is_analyzed: boolean
  created_at: string
}

interface Category {
  id: string
  name: string
  description: string
  isNew?: boolean
  isTrending?: boolean
}

// CategoryGrid Component
function CategoryGrid({
  categories,
  selectedCategory,
  onCategorySelect,
}: {
  categories: Category[]
  selectedCategory?: string
  onCategorySelect: (categoryId: string) => void
}) {
  const CATEGORY_ICONS = {
    new: <Sparkles className="w-6 h-6" />,
    top: <TrendingUpIcon className="w-6 h-6" />,
    health: <Users className="w-6 h-6" />,
    ebusiness: <Lightbulb className="w-6 h-6" />,
    selfhelp: <Target className="w-6 h-6" />,
    business: <DollarSign className="w-6 h-6" />,
    green: <Star className="w-6 h-6" />
  }

  const CATEGORY_COLORS = {
    new: 'from-purple-500 to-pink-500',
    top: 'from-red-500 to-orange-500',
    health: 'from-green-500 to-teal-500',
    ebusiness: 'from-blue-500 to-indigo-500',
    selfhelp: 'from-yellow-500 to-orange-500',
    business: 'from-gray-600 to-gray-800',
    green: 'from-green-400 to-emerald-500'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {categories.map((category) => {
        const isSelected = selectedCategory === category.id
        const icon = CATEGORY_ICONS[category.id as keyof typeof CATEGORY_ICONS]
        const colorClass = CATEGORY_COLORS[category.id as keyof typeof CATEGORY_COLORS]
        
        return (
          <Card
            key={category.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
              isSelected ? 'ring-2 ring-black shadow-lg' : ''
            }`}
            onClick={() => onCategorySelect(category.id)}
          >
            <CardHeader className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white shadow-lg`}>
                {icon}
              </div>
              
              <CardTitle className="text-lg font-semibold text-black mb-2">
                {category.name}
              </CardTitle>
              
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {category.description}
              </p>
              
              <div className="flex items-center justify-center space-x-2">
                {category.isNew && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    New
                  </span>
                )}
                
                {category.isTrending && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Trending
                  </span>
                )}
              </div>
            </CardHeader>
          </Card>
        )
      })}
    </div>
  )
}

// ProductAccordion Component
function ProductAccordion({
  products,
  onCreateCampaign,
  onToggleFavorite,
  onAnalyzeProduct,
  userFavorites,
  isLoading = false
}: {
  products: ClickBankProduct[]
  onCreateCampaign: (product: ClickBankProduct) => void
  onToggleFavorite: (productId: string) => void
  onAnalyzeProduct: (productId: string) => void
  userFavorites: string[]
  isLoading?: boolean
}) {
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set())

  const toggleExpanded = (productId: string) => {
    const newExpanded = new Set(expandedProducts)
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId)
    } else {
      newExpanded.add(productId)
    }
    setExpandedProducts(newExpanded)
  }

  const formatGravity = (gravity: number) => {
    if (gravity > 100) return "🔥 Hot"
    if (gravity > 50) return "📈 Strong"
    if (gravity > 20) return "✅ Good"
    return "⚡ New"
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-6 h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-64"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {products.map((product) => {
        const isExpanded = expandedProducts.has(product.id)
        const isFavorited = userFavorites.includes(product.id)
        
        return (
          <Card key={product.id} className="overflow-hidden transition-all duration-200 hover:shadow-md">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <button
                    onClick={() => onToggleFavorite(product.id)}
                    className={`w-6 h-6 transition-colors ${
                      isFavorited 
                        ? 'text-yellow-500 hover:text-yellow-600' 
                        : 'text-gray-300 hover:text-yellow-400'
                    }`}
                  >
                    <Star className={`w-6 h-6 ${isFavorited ? 'fill-current' : ''}`} />
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-black truncate">{product.title}</h3>
                      <span className="text-sm text-gray-500">by {product.vendor}</span>
                      
                      {product.is_analyzed && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Lightbulb className="w-3 h-3 mr-1" />
                          Analyzed
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <TrendingUpIcon className="w-4 h-4" />
                        <span>{formatGravity(product.gravity)}</span>
                        <span className="text-gray-400">({product.gravity})</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        <span>{product.commission_rate}% commission</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={() => onCreateCampaign(product)}
                    className="bg-black text-white hover:bg-gray-900"
                  >
                    Create Campaign
                  </Button>
                  
                  <button
                    onClick={() => toggleExpanded(product.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {isExpanded && (
              <div className="border-t border-gray-200 bg-gray-50 p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Product Description</h4>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      {product.description || 'No description available'}
                    </p>
                    
                    <div className="flex items-center space-x-4">
                      <a
                        href={product.salespage_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View Sales Page →
                      </a>
                      
                      {!product.is_analyzed && (
                        <Button
                          onClick={() => onAnalyzeProduct(product.id)}
                          variant="outline"
                          size="sm"
                        >
                          Analyze Product
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    {product.is_analyzed ? (
                      <>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">AI Insights</h4>
                        
                        {product.key_insights.length > 0 && (
                          <div className="mb-4">
                            <h5 className="text-xs font-medium text-gray-700 mb-2">Key Insights:</h5>
                            <ul className="space-y-1">
                              {product.key_insights.slice(0, 3).map((insight, idx) => (
                                <li key={idx} className="text-sm text-gray-600 flex items-start">
                                  <span className="text-green-500 mr-2">•</span>
                                  {insight}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {product.recommended_angles.length > 0 && (
                          <div className="mb-4">
                            <h5 className="text-xs font-medium text-gray-700 mb-2">Campaign Angles:</h5>
                            <div className="flex flex-wrap gap-2">
                              {product.recommended_angles.slice(0, 3).map((angle, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {angle}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {product.analysis_score && (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">Confidence Score:</span>
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{ width: `${product.analysis_score * 100}%` }}
                                ></div>
                              </div>
                              <span className="ml-2 text-xs text-gray-600">
                                {Math.round(product.analysis_score * 100)}%
                              </span>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <Lightbulb className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No analysis available yet</p>
                        <p className="text-xs text-gray-400 mt-1">Click &quot;Analyze Product&quot; to extract insights</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}

// ClickBankCampaignCreator Component
function ClickBankCampaignCreator({
  isOpen,
  onClose,
  product,
  onCreateCampaign
}: {
  isOpen: boolean
  onClose: () => void
  product: ClickBankProduct | null
  onCreateCampaign: (campaignData: any) => void
}) {
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
      settings: {
        clickbank_integration: true,
        clickbank_product_id: product.id,
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

// ============================================================================
// MAIN MARKETPLACE PAGE
// ============================================================================

export default function MarketplacePage() {
  const router = useRouter()
  const api = useApi()
  
  const [categories, setCategories] = useState<Category[]>([])
  const [newProducts, setNewProducts] = useState<ClickBankProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userFavorites, setUserFavorites] = useState<string[]>([])
  const [selectedProduct, setSelectedProduct] = useState<ClickBankProduct | null>(null)
  const [showCampaignCreator, setShowCampaignCreator] = useState(false)

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setIsLoading(true)
      
      // Load new products
      const newProductsData = await api.fetchClickBankProducts('new').catch(() => [])
      
      setCategories([
        { id: 'new', name: 'New Products', description: 'Latest ClickBank releases', isNew: true },
        { id: 'top', name: 'Top Performers', description: 'Highest gravity products', isTrending: true },
        { id: 'health', name: 'Health & Fitness', description: 'Health and wellness products' },
        { id: 'ebusiness', name: 'E-Business & Marketing', description: 'Online business tools' },
        { id: 'selfhelp', name: 'Self-Help', description: 'Personal development' },
        { id: 'business', name: 'Business & Investing', description: 'Business and investment' },
        { id: 'green', name: 'Green Products', description: 'Environmental products' }
      ])
      
      setNewProducts(newProductsData.slice(0, 10))
      
    } catch (error) {
      console.error('Error loading marketplace data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCategorySelect = (categoryId: string) => {
    router.push(`/marketplace/${categoryId}`)
  }

  const handleCreateCampaign = (product: ClickBankProduct) => {
    setSelectedProduct(product)
    setShowCampaignCreator(true)
  }

  const handleCampaignCreate = async (campaignData: any) => {
    try {
      const campaign = await api.createCampaign(campaignData)
      setShowCampaignCreator(false)
      router.push(`/campaigns/${campaign.id}`)
    } catch (error) {
      console.error('Error creating campaign:', error)
    }
  }

  const handleToggleFavorite = async (productId: string) => {
    console.log('Toggle favorite:', productId)
  }

  const handleAnalyzeProduct = async (productId: string) => {
    console.log('Analyze product:', productId)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Marketplace Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-light text-black">ClickBank Marketplace</h1>
              <p className="text-gray-600 mt-2">Discover high-converting products to promote</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardHeader className="text-center py-12">
              <CardTitle className="text-3xl font-light mb-4">
                Discover High-Converting Products
              </CardTitle>
              <p className="text-blue-100 text-lg max-w-2xl mx-auto">
                Browse curated ClickBank products, get AI-powered insights, and create campaigns that convert
              </p>
            </CardHeader>
          </Card>

          {/* New Products Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-black">Latest Products</h2>
                  <p className="text-gray-600">Fresh opportunities to explore</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push('/marketplace/new')}
              >
                View All New Products
              </Button>
            </div>
            
            <ProductAccordion
              products={newProducts}
              onCreateCampaign={handleCreateCampaign}
              onToggleFavorite={handleToggleFavorite}
              onAnalyzeProduct={handleAnalyzeProduct}
              userFavorites={userFavorites}
              isLoading={isLoading}
            />
          </div>

          {/* Categories Section */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-black">Browse by Category</h2>
                <p className="text-gray-600">Find products in your preferred niches</p>
              </div>
            </div>
            
            <CategoryGrid
              categories={categories}
              onCategorySelect={handleCategorySelect}
            />
          </div>

          {/* Campaign Creator Modal */}
          <ClickBankCampaignCreator
            isOpen={showCampaignCreator}
            onClose={() => setShowCampaignCreator(false)}
            product={selectedProduct}
            onCreateCampaign={handleCampaignCreate}
          />
        </div>
      </div>
    </div>
  )
}