// src/components/marketplace/ProductAccordion.tsx
import React, { useState } from 'react'
import { Star, ChevronDown, ChevronRight, TrendingUp, DollarSign, Users, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ClickBankProduct {
  id: string
  title: string
  vendor: string
  description: string
  gravity: number
  commission_rate: number
  salespage_url: string
  analysis_status: string
  analysis_score?: number
  key_insights: string[]
  recommended_angles: string[]
  is_analyzed: boolean
}

interface ProductAccordionProps {
  products: ClickBankProduct[]
  onCreateCampaign: (product: ClickBankProduct) => void
  onToggleFavorite: (productId: string) => void
  onAnalyzeProduct: (productId: string) => void
  userFavorites: string[]
  isLoading?: boolean
}

export default function ProductAccordion({
  products,
  onCreateCampaign,
  onToggleFavorite,
  onAnalyzeProduct,
  userFavorites,
  isLoading = false
}: ProductAccordionProps) {
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
            {/* Main Product Row */}
            <div className="p-6">
              <div className="flex items-center justify-between">
                {/* Left Side: Star + Product Info */}
                <div className="flex items-center space-x-4 flex-1">
                  {/* Star Icon */}
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
                  
                  {/* Product Title + Vendor */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-black truncate">{product.title}</h3>
                      <span className="text-sm text-gray-500">by {product.vendor}</span>
                      
                      {/* Analysis Status Badge */}
                      {product.is_analyzed && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Lightbulb className="w-3 h-3 mr-1" />
                          Analyzed
                        </span>
                      )}
                    </div>
                    
                    {/* Quick Stats */}
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
                
                {/* Right Side: Actions */}
                <div className="flex items-center space-x-3">
                  {/* Create Campaign Button */}
                  <Button
                    onClick={() => onCreateCampaign(product)}
                    className="bg-black text-white hover:bg-gray-900"
                  >
                    Create Campaign
                  </Button>
                  
                  {/* Expand Button */}
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
            
            {/* Expanded Details */}
            {isExpanded && (
              <div className="border-t border-gray-200 bg-gray-50 p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column: Product Details */}
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
                  
                  {/* Right Column: Analysis Insights */}
                  <div>
                    {product.is_analyzed ? (
                      <>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">AI Insights</h4>
                        
                        {/* Key Insights */}
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
                        
                        {/* Recommended Angles */}
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
                        
                        {/* Analysis Score */}
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