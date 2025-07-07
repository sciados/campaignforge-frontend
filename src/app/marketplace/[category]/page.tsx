// src/app/marketplace/[category]/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ArrowLeft, Filter, SortAsc, Star, ChevronDown, ChevronRight, TrendingUp, DollarSign, Lightbulb, X, Target, Palette, Type } from 'lucide-react'

// ============================================================================
// TYPES
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

// ============================================================================
// COMPONENTS
// ============================================================================

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
        {[...Array(8)].map((_, i) => (
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

  if (products.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-black mb-2">No products found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your filters or check back later for new products.</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh Products
          </Button>
        </div>
      </Card>
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
                        <TrendingUp className="w-4 h-4" />
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
// MAIN CATEGORY PAGE
// ============================================================================

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const api = useApi()
  
  const category = params.category as string
  const [products, setProducts] = useState<ClickBankProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<ClickBankProduct | null>(null)
  const [showCampaignCreator, setShowCampaignCreator] = useState(false)
  const [userFavorites, setUserFavorites] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('gravity')
  const [showAnalyzedOnly, setShowAnalyzedOnly] = useState(false)

  const loadCategoryProducts = async () => {
    try {
      setIsLoading(true)
      const productsData = await api.fetchClickBankProducts(category)
      
      // Apply client-side filtering and sorting
      let filteredProducts = productsData
      
      if (showAnalyzedOnly) {
        filteredProducts = filteredProducts.filter(p => p.is_analyzed)
      }
      
      // Sort products
      filteredProducts.sort((a, b) => {
        switch (sortBy) {
          case 'gravity':
            return b.gravity - a.gravity
          case 'commission':
            return b.commission_rate - a.commission_rate
          case 'date':
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          default:
            return 0
        }
      })
      
      setProducts(filteredProducts)
    } catch (error) {
      console.error('Error loading category products:', error)
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCategoryProducts()
  }, [category, sortBy, showAnalyzedOnly]) // eslint-disable-line react-hooks/exhaustive-deps

  const getCategoryName = (categoryId: string) => {
    const names = {
      new: 'New Products',
      top: 'Top Performers',
      health: 'Health & Fitness',
      ebusiness: 'E-Business & Marketing',
      selfhelp: 'Self-Help',
      business: 'Business & Investing',
      green: 'Green Products'
    }
    return names[categoryId as keyof typeof names] || categoryId
  }

  const getCategoryDescription = (categoryId: string) => {
    const descriptions = {
      new: 'Latest ClickBank product releases',
      top: 'Highest gravity and best-performing products',
      health: 'Health, fitness, and wellness products',
      ebusiness: 'Online business and marketing tools',
      selfhelp: 'Personal development and self-improvement',
      business: 'Business and investment opportunities',
      green: 'Eco-friendly and sustainable products'
    }
    return descriptions[categoryId as keyof typeof descriptions] || `Products in ${categoryId} category`
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
    // TODO: Implement favorites functionality
  }

  const handleAnalyzeProduct = async (productId: string) => {
    console.log('Analyze product:', productId)
    // TODO: Implement product analysis
  }

  const categoryName = getCategoryName(category)
  const categoryDescription = getCategoryDescription(category)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/marketplace')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Marketplace</span>
          </Button>
          
          <div>
            <h1 className="text-3xl font-light text-black">{categoryName}</h1>
            <p className="text-gray-600 mt-1">{categoryDescription}</p>
            <p className="text-sm text-gray-500 mt-1">{products.length} products available</p>
          </div>
        </div>

        {/* Filters & Sort */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAnalyzedOnly(!showAnalyzedOnly)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showAnalyzedOnly
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4 mr-2 inline" />
            {showAnalyzedOnly ? 'Analyzed Only' : 'All Products'}
          </button>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="gravity">Sort by Gravity</option>
            <option value="commission">Sort by Commission</option>
            <option value="date">Sort by Date</option>
          </select>
        </div>
      </div>

      {/* Products List */}
      <ProductAccordion
        products={products}
        onCreateCampaign={handleCreateCampaign}
        onToggleFavorite={handleToggleFavorite}
        onAnalyzeProduct={handleAnalyzeProduct}
        userFavorites={userFavorites}
        isLoading={isLoading}
      />

      {/* Campaign Creator Modal */}
      <ClickBankCampaignCreator
        isOpen={showCampaignCreator}
        onClose={() => setShowCampaignCreator(false)}
        product={selectedProduct}
        onCreateCampaign={handleCampaignCreate}
      />
    </div>
  )
}