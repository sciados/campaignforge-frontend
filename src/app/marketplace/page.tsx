// Enhanced marketplace page with PostgreSQL category loading - COMPLETE VERSION
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
  RefreshCw, Zap, AlertCircle, CheckCircle, Clock, ExternalLink, Link,
  Database, Loader2
} from 'lucide-react'
import { useRouter } from 'next/navigation'

// ============================================================================
// TYPES (Enhanced for PostgreSQL)
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
  // New PostgreSQL fields
  category_priority?: number
  target_audience?: string
  commission_range?: string
}

interface Category {
  id: string
  name: string
  description: string
  isNew?: boolean
  isTrending?: boolean
  // Enhanced PostgreSQL fields
  priority_level: number
  target_audience: string
  commission_range: string
  validation_status: string
  backup_urls_count: number
  is_active: boolean
  last_validated_at?: string
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
  lastRefresh,
  databaseStatus
}: {
  onRefreshAll: () => void
  isRefreshing: boolean
  lastRefresh?: string
  databaseStatus: 'loading' | 'connected' | 'error'
}) {
  return (
    <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              {isRefreshing ? (
                <RefreshCw className="w-5 h-5 text-green-600 animate-spin" />
              ) : databaseStatus === 'loading' ? (
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              ) : databaseStatus === 'connected' ? (
                <Database className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-green-900">
                {isRefreshing ? 'Scraping Live Data...' : 
                 databaseStatus === 'loading' ? 'Loading Categories...' :
                 databaseStatus === 'connected' ? 'PostgreSQL Categories Loaded' : 'Database Connection Issue'}
              </h3>
              <p className="text-xs text-green-700">
                {isRefreshing 
                  ? 'Fetching top performers from ClickBank marketplace...'
                  : databaseStatus === 'loading'
                    ? 'Loading categories from PostgreSQL database...'
                    : lastRefresh 
                      ? `Last updated: ${new Date(lastRefresh).toLocaleTimeString()}`
                      : 'Real-time product data with keyword-based searches'
                }
              </p>
            </div>
          </div>
          
          <Button
            onClick={onRefreshAll}
            disabled={isRefreshing || databaseStatus === 'loading'}
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
  onRefreshCategory,
  isLoading
}: {
  categories: Category[]
  selectedCategory?: string
  onCategorySelect: (categoryId: string) => void
  scrapingStatuses: Record<string, ScrapingStatus>
  onRefreshCategory: (categoryId: string) => void
  isLoading: boolean
}) {
  const PRIORITY_COLORS = {
    10: 'from-red-500 to-orange-500',      // Highest priority - red/orange
    9: 'from-purple-500 to-pink-500',      // High priority - purple/pink
    8: 'from-blue-500 to-indigo-500',      // Medium-high - blue/indigo
    7: 'from-green-500 to-teal-500',       // Medium - green/teal
    6: 'from-yellow-500 to-orange-500',    // Lower - yellow/orange
    5: 'from-gray-500 to-gray-600'         // Lowest - gray
  }

  const PRIORITY_ICONS = {
    10: <Zap className="w-6 h-6" />,        // Highest priority
    9: <TrendingUp className="w-6 h-6" />,  // High priority
    8: <Target className="w-6 h-6" />,      // Medium-high
    7: <Users className="w-6 h-6" />,       // Medium
    6: <Lightbulb className="w-6 h-6" />,   // Lower
    5: <Star className="w-6 h-6" />         // Lowest
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded-2xl mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-black mb-2">No categories loaded</h3>
          <p className="text-gray-600">Unable to load categories from database.</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {categories.map((category) => {
        const isSelected = selectedCategory === category.id
        const priority = category.priority_level
        const icon = PRIORITY_ICONS[priority as keyof typeof PRIORITY_ICONS] || PRIORITY_ICONS[5]
        const colorClass = PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS[5]
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
              {/* Priority Badge */}
              <div className="absolute top-2 left-2">
                <Badge variant={priority >= 9 ? "destructive" : priority >= 7 ? "default" : "secondary"}>
                  P{priority}
                </Badge>
              </div>

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
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {category.commission_range}
                  </Badge>
                  
                  {status && status.products_found > 0 && (
                    <Badge variant="info" className="text-xs">
                      {status.products_found} products
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-center space-x-2">
                  {category.validation_status === 'working' && (
                    <Badge variant="success" className="text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Validated
                    </Badge>
                  )}
                  
                  {category.backup_urls_count > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {category.backup_urls_count + 1} URLs
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Target Audience */}
              <p className="text-xs text-gray-500 mb-3 italic">
                Target: {category.target_audience}
              </p>
              
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
  onGenerateAffiliateLink,
  userFavorites,
  isLoading = false
}: {
  products: ClickBankProduct[]
  onCreateCampaign: (product: ClickBankProduct) => void
  onToggleFavorite: (productId: string) => void
  onAnalyzeProduct: (productId: string) => void
  onValidateURL: (url: string) => void
  onGenerateAffiliateLink: (product: ClickBankProduct) => void
  userFavorites: string[]
  isLoading?: boolean
}) {
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set())
  const [validatingURLs, setValidatingURLs] = useState<Set<string>>(new Set())
  const [generatingLinks, setGeneratingLinks] = useState<Set<string>>(new Set())

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

  const handleGenerateAffiliateLink = async (product: ClickBankProduct) => {
    setGeneratingLinks(prev => {
      const newSet = new Set(prev)
      newSet.add(product.id)
      return newSet
    })
    try {
      await onGenerateAffiliateLink(product)
    } finally {
      setGeneratingLinks(prev => {
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
        const isGeneratingLink = generatingLinks.has(product.id)
        
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
                      
                      {/* PostgreSQL Data Badge */}
                      {product.data_source === 'postgresql_scraping' && (
                        <Badge variant="success">
                          <Database className="w-3 h-3 mr-1" />
                          PostgreSQL
                        </Badge>
                      )}
                      
                      {/* Priority Badge */}
                      {product.category_priority && (
                        <Badge variant={product.category_priority >= 9 ? "destructive" : "default"}>
                          P{product.category_priority}
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
                      {product.commission_range && (
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <span>({product.commission_range} range)</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Target Audience */}
                    {product.target_audience && (
                      <div className="mt-1">
                        <span className="text-xs text-gray-500 italic">
                          Target: {product.target_audience.split(',')[0]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={() => onCreateCampaign(product)}
                    className="bg-black text-white hover:bg-gray-900"
                    size="sm"
                  >
                    Create Campaign
                  </Button>
                  
                  <Button
                    onClick={() => handleGenerateAffiliateLink(product)}
                    disabled={isGeneratingLink}
                    className="bg-green-600 text-white hover:bg-green-700"
                    size="sm"
                  >
                    {isGeneratingLink ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Link className="w-4 h-4 mr-2" />
                        Get Affiliate Link
                      </>
                    )}
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
                    
                    {/* PostgreSQL Data Metadata */}
                    <div className="text-xs text-gray-500 bg-white p-2 rounded border">
                      <div className="flex items-center space-x-2 mb-1">
                        <Clock className="w-3 h-3" />
                        <span>Scraped: {new Date(product.created_at).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-2 mb-1">
                        <Database className="w-3 h-3" />
                        <span>Source: PostgreSQL Categories</span>
                      </div>
                      {product.category_priority && (
                        <div className="flex items-center space-x-2">
                          <Target className="w-3 h-3" />
                          <span>Priority Level: {product.category_priority}</span>
                        </div>
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
                        <p className="text-xs text-gray-400 mt-1">Click &quot;Analyze Product&quot; to extract insights from this PostgreSQL product</p>
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
    target_audience: product.target_audience || '',
    clickbank_product_id: product.product_id || product.id,
    selected_angles: [],
    settings: {
      clickbank_integration: true,
      product_url: product.salespage_url,
      commission_rate: product.commission_rate,
      // PostgreSQL enhanced data
      category_priority: product.category_priority,
      commission_range: product.commission_range
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
              <p className="text-gray-600">From PostgreSQL ClickBank product: {product.title}</p>
              {product.category_priority && (
                <Badge variant={product.category_priority >= 9 ? "destructive" : "default"} className="mt-1">
                  Priority Level {product.category_priority}
                </Badge>
              )}
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
              {product.target_audience && (
                <p className="text-xs text-gray-500 mt-1">
                  Suggested from PostgreSQL: {product.target_audience}
                </p>
              )}
            </div>
            
            {/* Enhanced Product Information Display */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-3">PostgreSQL ClickBank Product Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Gravity Score:</span>
                  <span className="font-medium">{product.gravity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Commission Rate:</span>
                  <span className="font-medium">{product.commission_rate}%</span>
                </div>
                {product.commission_range && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Commission Range:</span>
                    <span className="font-medium">{product.commission_range}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Vendor:</span>
                  <span className="font-medium">{product.vendor}</span>
                </div>
                {product.category_priority && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category Priority:</span>
                    <span className="font-medium">Level {product.category_priority}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Data Source:</span>
                  <span className="font-medium">PostgreSQL Database</span>
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
  
  // PostgreSQL-loaded categories
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [databaseStatus, setDatabaseStatus] = useState<'loading' | 'connected' | 'error'>('loading')
  
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

  const loadLiveProducts = useCallback(async (category: string) => {
    try {
      setIsLoading(true)
      updateScrapingStatus(category, 'scraping', 0)
      
      const startTime = Date.now()
      console.log(`🔍 Loading products for category: ${category}`)
      
      // Use the enhanced PostgreSQL-aware method
      const result = await api.getLiveClickBankProductsEnhanced(category, 10)
      const endTime = Date.now()
      
      setLiveProducts(result.products)
      updateScrapingStatus(category, 'completed', result.products_found, (endTime - startTime) / 1000)
      setLastRefresh(new Date().toISOString())
      
      console.log(`✅ Loaded ${result.products_found} products for ${category}`)
      
    } catch (error) {
      console.error('❌ Error loading live products:', error)
      updateScrapingStatus(category, 'error', 0, 0, error instanceof Error ? error.message : 'Scraping failed')
      setLiveProducts([])
    } finally {
      setIsLoading(false)
    }
  }, [api, updateScrapingStatus])

  // Load categories from PostgreSQL on mount
  useEffect(() => {
    const loadCategoriesFromDB = async () => {
      try {
        setIsLoadingCategories(true)
        setDatabaseStatus('loading')
        
        console.log('🔍 Loading categories from PostgreSQL...')
        const result = await api.getClickBankCategoriesFromDB()
        
        // Transform PostgreSQL data to Category interface
        const transformedCategories = result.categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          description: `${cat.target_audience.split(',')[0]} • ${cat.commission_range} commission`,
          isNew: cat.priority_level >= 9,
          isTrending: cat.validation_status === 'working',
          priority_level: cat.priority_level,
          target_audience: cat.target_audience,
          commission_range: cat.commission_range,
          validation_status: cat.validation_status,
          backup_urls_count: cat.backup_urls_count,
          is_active: cat.is_active,
          last_validated_at: cat.last_validated_at
        }))
        
        // Sort by priority level (highest first)
        transformedCategories.sort((a, b) => b.priority_level - a.priority_level)
        
        setCategories(transformedCategories)
        setDatabaseStatus('connected')
        
        console.log(`✅ Loaded ${transformedCategories.length} categories from PostgreSQL`)
        console.log('Categories by priority:', transformedCategories.map(c => `${c.name} (P${c.priority_level})`))
        
        // Auto-load products from highest priority category
        if (transformedCategories.length > 0) {
          const topCategory = transformedCategories[0]
          console.log(`🚀 Auto-loading products from top priority category: ${topCategory.name}`)
          await loadLiveProducts(topCategory.id)
        }
        
      } catch (error) {
        console.error('❌ Error loading categories from database:', error)
        setDatabaseStatus('error')
        // You could add fallback categories here if needed
      } finally {
        setIsLoadingCategories(false)
      }
    }
    
    loadCategoriesFromDB()
  }, [api, loadLiveProducts])

  const refreshAllCategories = useCallback(async () => {
    try {
      setIsRefreshingAll(true)
      
      // Mark categories as scraping
      categories.forEach(cat => {
        updateScrapingStatus(cat.id, 'scraping', 0)
      })
      
      console.log('🔄 Refreshing all high-priority categories...')
      
      // Use priority-based bulk scraping (priority 8 and above)
      const result = await api.getAllCategoriesLiveWithPriority(8, 8)
      
      // Update status for all categories
      Object.entries(result.results).forEach(([category, data]) => {
        updateScrapingStatus(category, 'completed', data.products_found)
      })
      
      setLastRefresh(new Date().toISOString())
      
      // Show products from highest priority category that has results
      const categoriesWithProducts = Object.entries(result.results)
        .filter(([, data]) => data.products_found > 0)
        .sort(([,a], [,b]) => b.priority_level - a.priority_level)
      
      if (categoriesWithProducts.length > 0) {
        const [categoryId, categoryData] = categoriesWithProducts[0]
        console.log(`📊 Showing products from: ${categoryData.category_name} (${categoryData.products_found} products)`)
        
        // Transform products for display
        const transformedProducts = categoryData.products.map((product: any, index: number) => ({
          id: `live_${product.product_id}_${categoryId}_${index}`,
          title: product.title,
          vendor: product.vendor,
          description: product.description,
          gravity: product.gravity,
          commission_rate: product.commission_rate,
          salespage_url: product.salespage_url,
          product_id: product.product_id,
          vendor_id: product.vendor_id,
          category: categoryId,
          analysis_status: 'pending' as const,
          analysis_score: undefined,
          key_insights: [],
          recommended_angles: [],
          is_analyzed: false,
          created_at: product.scraped_at,
          data_source: 'postgresql_scraping',
          is_real_product: product.is_live_data,
          // PostgreSQL enhanced fields
          category_priority: categoryData.priority_level,
          target_audience: categoryData.target_audience,
          commission_range: categoryData.commission_range
        }))
        
        setLiveProducts(transformedProducts)
      }
      
      console.log(`✅ Refreshed ${Object.keys(result.results).length} categories, total products: ${result.total_products_found}`)
      
    } catch (error) {
      console.error('❌ Error refreshing all categories:', error)
      categories.forEach(cat => {
        updateScrapingStatus(cat.id, 'error', 0, 0, 'Refresh failed')
      })
    } finally {
      setIsRefreshingAll(false)
    }
  }, [api, categories, updateScrapingStatus])

  const refreshCategory = useCallback(async (categoryId: string) => {
    await loadLiveProducts(categoryId)
  }, [loadLiveProducts])

  const handleCategorySelect = useCallback((categoryId: string) => {
    console.log(`📂 Selected category: ${categoryId}`)
    loadLiveProducts(categoryId)
  }, [loadLiveProducts])

  const handleCreateCampaign = useCallback((product: ClickBankProduct) => {
    setSelectedProduct(product)
    setShowCampaignCreator(true)
  }, [])

  const handleCampaignCreate = useCallback(async (campaignData: CampaignCreationData) => {
    try {
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
          auto_analyze_product: true,
          postgresql_enhanced: true
        }
      })
      
      setShowCampaignCreator(false)
      setSelectedProduct(null)
      router.push(`/campaigns/${campaign.id}`)
    } catch (error) {
      console.error('Error creating campaign:', error)
    }
  }, [api, router])

  const handleToggleFavorite = useCallback(async (productId: string) => {
    try {
      const isFavorited = userFavorites.includes(productId)
      
      if (isFavorited) {
        setUserFavorites(prev => prev.filter(id => id !== productId))
      } else {
        setUserFavorites(prev => [...prev, productId])
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }, [userFavorites])

  const handleAnalyzeProduct = useCallback(async (productId: string) => {
    try {
      console.log('Analyze product:', productId)
      alert('Product analysis feature coming soon!')
    } catch (error) {
      console.error('Error analyzing product:', error)
    }
  }, [])

  const handleValidateURL = useCallback(async (url: string) => {
    try {
      const validation = await api.validateSalesPageURL(url)
      console.log('URL validation result:', validation)
      
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

  const handleGenerateAffiliateLink = useCallback(async (product: ClickBankProduct) => {
    try {
      console.log('Generate affiliate link for:', product.title)
      alert('Affiliate link generation feature coming soon!')
    } catch (error) {
      console.error('Error generating affiliate link:', error)
    }
  }, [])

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
        <CardHeader className="text-center py-12">
          <CardTitle className="text-3xl font-light mb-4">
            Live ClickBank Marketplace
          </CardTitle>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            PostgreSQL-powered category management with priority-based scraping and keyword searches
          </p>
        </CardHeader>
      </Card>

      {/* Live Scraping Banner */}
      <LiveScrapingBanner
        onRefreshAll={refreshAllCategories}
        isRefreshing={isRefreshingAll}
        lastRefresh={lastRefresh}
        databaseStatus={databaseStatus}
      />

      {/* Latest Live Products Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-black">Live Products from PostgreSQL</h2>
              <p className="text-gray-600">
                {categories.length > 0 
                  ? `${categories.length} categories loaded from PostgreSQL database`
                  : 'Loading categories from PostgreSQL database...'
                }
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              if (categories.length > 0) {
                loadLiveProducts(categories[0].id)
              }
            }}
            disabled={isLoading || categories.length === 0}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Scraping...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Top Priority
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
          onGenerateAffiliateLink={handleGenerateAffiliateLink}
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
            <h2 className="text-2xl font-semibold text-black">PostgreSQL Categories</h2>
            <p className="text-gray-600">
              Priority-ordered categories with keyword-based scraping and audience targeting
            </p>
          </div>
        </div>
        
        <CategoryGrid
          categories={categories}
          onCategorySelect={handleCategorySelect}
          scrapingStatuses={scrapingStatuses}
          onRefreshCategory={refreshCategory}
          isLoading={isLoadingCategories}
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