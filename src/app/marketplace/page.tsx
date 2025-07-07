// Enhanced marketplace page with live ClickBank scraping
// Replace your existing marketplace page.tsx with this

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useApi } from '@/lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles, TrendingUp, ShoppingBag, Star, ChevronDown, ChevronRight, 
  DollarSign, Users, Lightbulb, X, Target, Palette, Type, ArrowRight,
  RefreshCw, Zap, AlertCircle, CheckCircle, Clock, ExternalLink
} from 'lucide-react'
import { useRouter } from 'next/navigation'

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
  data_source?: string
  is_real_product?: boolean
}

interface Category {
  id: string
  name: string
  description: string
  isNew?: boolean
  isTrending?: boolean
}

interface ScrapingStatus {
  category: string
  status: 'idle' | 'scraping' | 'completed' | 'error'
  products_found: number
  scraping_time: number
  error_message?: string
}

interface CampaignCreationData {
  title: string
  description: string
  tone: string
  style: string
  target_audience: string
  clickbank_product_id: string
  selected_angles: string[]
  settings: Record<string, any>
}

// ============================================================================
// COMPONENTS
// ============================================================================

function LiveScrapingBanner({
  onRefreshAll,
  isRefreshing,
  lastRefresh
}: {
  onRefreshAll: () => void
  isRefreshing: boolean
  lastRefresh?: string
}) {
  return (
    <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              {isRefreshing ? (
                <RefreshCw className="w-5 h-5 text-green-600 animate-spin" />
              ) : (
                <Zap className="w-5 h-5 text-green-600" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-green-900">
                {isRefreshing ? 'Scraping Live Data...' : 'Live ClickBank Data'}
              </h3>
              <p className="text-xs text-green-700">
                {isRefreshing 
                  ? 'Fetching top performers from ClickBank marketplace...'
                  : lastRefresh 
                    ? `Last updated: ${new Date(lastRefresh).toLocaleTimeString()}`
                    : 'Real-time product data with actual sales page URLs'
                }
              </p>
            </div>
          </div>
          
          <Button
            onClick={onRefreshAll}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="bg-white hover:bg-green-50"
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Scraping...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh All
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function CategoryGrid({
  categories,
  selectedCategory,
  onCategorySelect,
  scrapingStatuses,
  onRefreshCategory
}: {
  categories: Category[]
  selectedCategory?: string
  onCategorySelect: (categoryId: string) => void
  scrapingStatuses: Record<string, ScrapingStatus>
  onRefreshCategory: (categoryId: string) => void
}) {
  const CATEGORY_ICONS = {
    new: <Sparkles className="w-6 h-6" />,
    top: <TrendingUp className="w-6 h-6" />,
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
        const status = scrapingStatuses[category.id]
        
        return (
          <Card
            key={category.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
              isSelected ? 'ring-2 ring-black shadow-lg' : ''
            }`}
            onClick={() => onCategorySelect(category.id)}
          >
            <CardHeader className="text-center relative">
              {/* Scraping Status Indicator */}
              {status && (
                <div className="absolute top-2 right-2">
                  {status.status === 'scraping' && (
                    <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                  )}
                  {status.status === 'completed' && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  {status.status === 'error' && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              )}
              
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white shadow-lg`}>
                {icon}
              </div>
              
              <CardTitle className="text-lg font-semibold text-black mb-2">
                {category.name}
              </CardTitle>
              
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {category.description}
              </p>
              
              <div className="flex items-center justify-center space-x-2 mb-3">
                {status && status.products_found > 0 && (
                  <Badge variant="info">
                    {status.products_found} live products
                  </Badge>
                )}
                
                {category.isNew && (
                  <Badge variant="purple">
                    New
                  </Badge>
                )}
                
                {category.isTrending && (
                  <Badge variant="destructive">
                    Trending
                  </Badge>
                )}
              </div>
              
              {/* Refresh Button */}
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  onRefreshCategory(category.id)
                }}
                disabled={status?.status === 'scraping'}
                variant="ghost"
                size="sm"
                className="text-xs"
              >
                {status?.status === 'scraping' ? (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    Scraping...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Refresh
                  </>
                )}
              </Button>
            </CardHeader>
          </Card>
        )
      })}
    </div>
  )
}

function ProductAccordion({
  products,
  onCreateCampaign,
  onToggleFavorite,
  onAnalyzeProduct,
  onValidateURL,
  userFavorites,
  isLoading = false
}: {
  products: ClickBankProduct[]
  onCreateCampaign: (product: ClickBankProduct) => void
  onToggleFavorite: (productId: string) => void
  onAnalyzeProduct: (productId: string) => void
  onValidateURL: (url: string) => void
  userFavorites: string[]
  isLoading?: boolean
}) {
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set())
  const [validatingURLs, setValidatingURLs] = useState<Set<string>>(new Set())

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

  const handleValidateURL = async (product: ClickBankProduct) => {
    setValidatingURLs(prev => {
      const newSet = new Set(prev)
      newSet.add(product.id)
      return newSet
    })
    try {
      await onValidateURL(product.salespage_url)
    } finally {
      setValidatingURLs(prev => {
        const newSet = new Set(prev)
        newSet.delete(product.id)
        return newSet
      })
    }
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
          <p className="text-gray-600 mb-6">Click refresh to scrape fresh products from ClickBank marketplace.</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
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
        const isValidating = validatingURLs.has(product.id)
        
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
                      
                      {/* Live Data Badge */}
                      {product.data_source === 'live_scraping' && (
                        <Badge variant="success">
                          <Zap className="w-3 h-3 mr-1" />
                          Live
                        </Badge>
                      )}
                      
                      {product.is_analyzed && (
                        <Badge variant="info">
                          <Lightbulb className="w-3 h-3 mr-1" />
                          Analyzed
                        </Badge>
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
                    
                    <div className="flex items-center space-x-4 mb-4">
                      <a
                        href={product.salespage_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View Sales Page
                      </a>
                      
                      <Button
                        onClick={() => handleValidateURL(product)}
                        disabled={isValidating}
                        variant="outline"
                        size="sm"
                      >
                        {isValidating ? (
                          <>
                            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                            Validating...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Validate URL
                          </>
                        )}
                      </Button>
                      
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
                    
                    {/* Live Data Metadata */}
                    <div className="text-xs text-gray-500 bg-white p-2 rounded border">
                      <div className="flex items-center space-x-2 mb-1">
                        <Clock className="w-3 h-3" />
                        <span>Scraped: {new Date(product.created_at).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Zap className="w-3 h-3" />
                        <span>Source: Live ClickBank Marketplace</span>
                      </div>
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
                                <Badge key={idx} variant="info">
                                  {angle}
                                </Badge>
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
                        <p className="text-xs text-gray-400 mt-1">Click &quot;Analyze Product&quot; to extract insights from this live product</p>
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

function CampaignCreatorModal({
  product,
  isOpen,
  onClose,
  onCreate
}: {
  product: ClickBankProduct
  isOpen: boolean
  onClose: () => void
  onCreate: (campaignData: CampaignCreationData) => void
}) {
  const [formData, setFormData] = useState<CampaignCreationData>({
    title: `${product.title} Campaign`,
    description: `Marketing campaign for ${product.title} by ${product.vendor}`,
    tone: 'professional',
    style: 'persuasive',
    target_audience: '',
    clickbank_product_id: product.product_id || product.id,
    selected_angles: [],
    settings: {
      clickbank_integration: true,
      product_url: product.salespage_url,
      commission_rate: product.commission_rate
    }
  })

  const [isCreating, setIsCreating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    
    try {
      await onCreate(formData)
    } catch (error) {
      console.error('Failed to create campaign:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleChange = (field: keyof CampaignCreationData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-light text-black">Create Campaign</h3>
              <p className="text-gray-600">From live ClickBank product: {product.title}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Campaign Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Enter campaign title"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe your campaign goals"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tone">Tone</Label>
                <select
                  id="tone"
                  value={formData.tone}
                  onChange={(e) => handleChange('tone', e.target.value)}
                  className="flex h-12 w-full rounded-lg border-none bg-gray-100 px-4 py-3 text-sm"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="urgent">Urgent</option>
                  <option value="friendly">Friendly</option>
                  <option value="authoritative">Authoritative</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="style">Style</Label>
                <select
                  id="style"
                  value={formData.style}
                  onChange={(e) => handleChange('style', e.target.value)}
                  className="flex h-12 w-full rounded-lg border-none bg-gray-100 px-4 py-3 text-sm"
                >
                  <option value="persuasive">Persuasive</option>
                  <option value="educational">Educational</option>
                  <option value="emotional">Emotional</option>
                  <option value="logical">Logical</option>
                  <option value="story-driven">Story-driven</option>
                </select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="target_audience">Target Audience</Label>
              <Input
                id="target_audience"
                value={formData.target_audience}
                onChange={(e) => handleChange('target_audience', e.target.value)}
                placeholder="e.g., Health-conscious adults 30-50"
              />
            </div>
            
            {/* Product Information Display */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-3">ClickBank Product Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Gravity Score:</span>
                  <span className="font-medium">{product.gravity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Commission Rate:</span>
                  <span className="font-medium">{product.commission_rate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vendor:</span>
                  <span className="font-medium">{product.vendor}</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1"
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Create Campaign
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN MARKETPLACE PAGE
// ============================================================================

export default function EnhancedMarketplacePage() {
  const router = useRouter()
  const api = useApi()
  
  const [categories] = useState<Category[]>([
    { id: 'new', name: 'New Products', description: 'Latest ClickBank releases', isNew: true },
    { id: 'top', name: 'Top Performers', description: 'Highest gravity products', isTrending: true },
    { id: 'health', name: 'Health & Fitness', description: 'Health and wellness products' },
    { id: 'ebusiness', name: 'E-Business & Marketing', description: 'Online business tools' },
    { id: 'selfhelp', name: 'Self-Help', description: 'Personal development' },
    { id: 'business', name: 'Business & Investing', description: 'Business and investment' },
    { id: 'green', name: 'Green Products', description: 'Environmental products' }
  ])
  
  const [liveProducts, setLiveProducts] = useState<ClickBankProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [userFavorites, setUserFavorites] = useState<string[]>([])
  const [selectedProduct, setSelectedProduct] = useState<ClickBankProduct | null>(null)
  const [showCampaignCreator, setShowCampaignCreator] = useState(false)
  const [scrapingStatuses, setScrapingStatuses] = useState<Record<string, ScrapingStatus>>({})
  const [lastRefresh, setLastRefresh] = useState<string>()
  const [isRefreshingAll, setIsRefreshingAll] = useState(false)

  const updateScrapingStatus = useCallback((
    category: string, 
    status: ScrapingStatus['status'], 
    products_found: number = 0,
    scraping_time: number = 0,
    error_message?: string
  ) => {
    setScrapingStatuses(prev => ({
      ...prev,
      [category]: {
        category,
        status,
        products_found,
        scraping_time,
        error_message
      }
    }))
  }, [])

  const loadLiveProducts = useCallback(async (category: string = 'top') => {
    try {
      setIsLoading(true)
      updateScrapingStatus(category, 'scraping', 0)
      
      const startTime = Date.now()
      const result = await api.getLiveClickBankProducts(category, 10)
      const endTime = Date.now()
      
      setLiveProducts(result.products)
      updateScrapingStatus(category, 'completed', result.products_found, (endTime - startTime) / 1000)
      setLastRefresh(new Date().toISOString())
      
    } catch (error) {
      console.error('Error loading live products:', error)
      updateScrapingStatus(category, 'error', 0, 0, error instanceof Error ? error.message : 'Scraping failed')
      setLiveProducts([])
    } finally {
      setIsLoading(false)
    }
  }, [api, updateScrapingStatus]) // Removed updateScrapingStatus dependency to break the loop

  const refreshAllCategories = useCallback(async () => {
    try {
      setIsRefreshingAll(true)
      
      // Mark all categories as scraping
      categories.forEach(cat => {
        updateScrapingStatus(cat.id, 'scraping', 0)
      })
      
      const result = await api.getAllCategoriesLive(8)
      
      // Update status for all categories
      categories.forEach(cat => {
        const categoryProducts = result.results[cat.id] || []
        updateScrapingStatus(cat.id, 'completed', categoryProducts.length)
      })
      
      setLastRefresh(new Date().toISOString())
      
      // Show top products
      if (result.results.top && result.results.top.length > 0) {
        // Transform the scraped data to match our ClickBankProduct interface
        const transformedProducts = result.results.top.slice(0, 10).map((product: any, index: number) => ({
          id: `live_${product.product_id}_top_${index}`,
          title: product.title,
          vendor: product.vendor,
          description: product.description,
          gravity: product.gravity,
          commission_rate: product.commission_rate,
          salespage_url: product.salespage_url,
          product_id: product.product_id,
          vendor_id: product.vendor_id,
          category: 'top',
          analysis_status: 'pending' as const,
          analysis_score: undefined,
          key_insights: [],
          recommended_angles: [],
          is_analyzed: false,
          created_at: product.scraped_at,
          data_source: 'live_scraping',
          is_real_product: true
        }))
        setLiveProducts(transformedProducts)
      }
      
    } catch (error) {
      console.error('Error refreshing all categories:', error)
      categories.forEach(cat => {
        updateScrapingStatus(cat.id, 'error', 0, 0, 'Refresh failed')
      })
    } finally {
      setIsRefreshingAll(false)
    }
  }, [api, categories, updateScrapingStatus]) // Removed updateScrapingStatus dependency

  const refreshCategory = useCallback(async (categoryId: string) => {
    await loadLiveProducts(categoryId)
  }, [loadLiveProducts])

  // Add error boundary for initial load
  useEffect(() => {
    // Only run once on mount
    const loadInitialData = async () => {
      try {
        await loadLiveProducts('top')
      } catch (error) {
        console.error('Failed to load initial data:', error)
        // Set some fallback state if needed
        setIsLoading(false)
      }
    }
    
    loadInitialData()
  }, [loadLiveProducts]) // Empty dependency array - only run once on mount

  const handleCategorySelect = useCallback((categoryId: string) => {
    // Load products for this category
    loadLiveProducts(categoryId)
  }, [loadLiveProducts])

  const handleCreateCampaign = useCallback((product: ClickBankProduct) => {
    setSelectedProduct(product)
    setShowCampaignCreator(true)
  }, [])

  const handleCampaignCreate = useCallback(async (campaignData: CampaignCreationData) => {
    try {
      // Use the standard createCampaign method with ClickBank context
      const campaign = await api.createCampaign({
        title: campaignData.title,
        description: campaignData.description,
        target_audience: campaignData.target_audience,
        campaign_type: 'universal',
        tone: campaignData.tone,
        style: campaignData.style,
        settings: {
          ...campaignData.settings,
          clickbank_integration: true,
          clickbank_product_id: campaignData.clickbank_product_id,
          auto_analyze_product: true
        }
      })
      
      setShowCampaignCreator(false)
      setSelectedProduct(null)
      router.push(`/campaigns/${campaign.id}`)
    } catch (error) {
      console.error('Error creating campaign:', error)
      // Handle error - you might want to show a toast notification here
    }
  }, [api, router])

  const handleToggleFavorite = useCallback(async (productId: string) => {
    try {
      const isFavorited = userFavorites.includes(productId)
      
      if (isFavorited) {
        // Remove from favorites
        setUserFavorites(prev => prev.filter(id => id !== productId))
        // If you have a backend endpoint for favorites, call it here
        // await api.removeClickBankFavorite(productId)
      } else {
        // Add to favorites
        setUserFavorites(prev => [...prev, productId])
        // If you have a backend endpoint for favorites, call it here
        // await api.addClickBankFavorite(productId)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }, [userFavorites])

  const handleAnalyzeProduct = useCallback(async (productId: string) => {
    try {
      // This would call your product analysis endpoint if available
      console.log('Analyze product:', productId)
      // await api.analyzeClickBankProduct(productId)
      
      // For now, just show a message
      alert('Product analysis feature coming soon!')
    } catch (error) {
      console.error('Error analyzing product:', error)
    }
  }, [])

  const handleValidateURL = useCallback(async (url: string) => {
    try {
      const validation = await api.validateSalesPageURL(url)
      console.log('URL validation result:', validation)
      
      // You could show a toast notification here with the results
      if (validation.is_accessible) {
        alert(`✅ URL is valid and accessible!\nPage Title: ${validation.page_title || 'N/A'}\nStatus: ${validation.status_code}`)
      } else {
        alert(`❌ URL validation failed!\nStatus: ${validation.status_code}\nError: ${validation.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('URL validation failed:', error)
      alert('❌ URL validation failed due to network error')
    }
  }, [api])

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
        <CardHeader className="text-center py-12">
          <CardTitle className="text-3xl font-light mb-4">
            Live ClickBank Marketplace
          </CardTitle>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Real-time scraping of top-performing ClickBank products with actual sales page URLs
          </p>
        </CardHeader>
      </Card>

      {/* Live Scraping Banner */}
      <LiveScrapingBanner
        onRefreshAll={refreshAllCategories}
        isRefreshing={isRefreshingAll}
        lastRefresh={lastRefresh}
      />

      {/* Latest Live Products Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-black">Live Top Performers</h2>
              <p className="text-gray-600">Scraped directly from ClickBank marketplace</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => loadLiveProducts('top')}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Scraping...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Top Products
              </>
            )}
          </Button>
        </div>
        
        <ProductAccordion
          products={liveProducts}
          onCreateCampaign={handleCreateCampaign}
          onToggleFavorite={handleToggleFavorite}
          onAnalyzeProduct={handleAnalyzeProduct}
          onValidateURL={handleValidateURL}
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
            <h2 className="text-2xl font-semibold text-black">Browse Live Categories</h2>
            <p className="text-gray-600">Each category is scraped in real-time from ClickBank</p>
          </div>
        </div>
        
        <CategoryGrid
          categories={categories}
          onCategorySelect={handleCategorySelect}
          scrapingStatuses={scrapingStatuses}
          onRefreshCategory={refreshCategory}
        />
      </div>

      {/* Campaign Creator Modal */}
      {selectedProduct && (
        <CampaignCreatorModal
          product={selectedProduct}
          isOpen={showCampaignCreator}
          onClose={() => {
            setShowCampaignCreator(false)
            setSelectedProduct(null)
          }}
          onCreate={handleCampaignCreate}
        />
      )}
    </div>
  )
}