// src/lib/api.ts - COMPLETE UPDATED VERSION WITH STABILITY AI IMAGE GENERATION
/**
 * Enhanced API client for CampaignForge with flexible workflow support, content management, and ultra-cheap AI image generation
 */

const API_BASE_URL = 'https://campaign-backend-production-e2db.up.railway.app'
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://campaign-backend-production-e2db.up.railway.app'

// Add this right after the API_BASE_URL declaration
console.log('🔍 Environment check:')
console.log('- process.env.NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL)
console.log('- API_BASE_URL being used:', API_BASE_URL)
console.log('- Window location:', typeof window !== 'undefined' ? window.location.href : 'SSR')

// ============================================================================
// TYPES
// ============================================================================

export interface Campaign {
  id: string
  title: string
  description: string
  keywords?: string[]
  target_audience?: string
  campaign_type: string
  status: string
  tone?: string
  style?: string
  settings: Record<string, any>
  created_at: string
  updated_at: string
  user_id: string
  company_id: string
  
  // Enhanced workflow fields
  workflow_state?: string
  workflow_preference?: string
  completion_percentage?: number
  sources_count?: number
  intelligence_count?: number
  generated_content_count?: number
  
  // Legacy fields for backward compatibility
  content?: any
  confidence_score?: number
  last_activity?: string
}

export interface WorkflowState {
  campaign_id: string
  workflow_state: string
  workflow_preference: string
  current_session: Record<string, any>
  available_actions: Array<{
    step: number
    action: string
    title: string
    description: string
    can_access: boolean
    is_complete: boolean
    suggested?: boolean
    prerequisites?: string[]
  }>
  quick_actions: Array<{
    action: string
    title: string
    description: string
  }>
  primary_suggestion: string
  suggested_step: number
  progress_summary: {
    sources_added: number
    sources_analyzed: number
    content_generated: number
    completion_percentage: number
  }
  progress: {
    steps: {
      step_1: number
      step_2: number
      step_3: number
      step_4: number
    }
  }
  user_settings: {
    quick_mode: boolean
    auto_advance: boolean
    detailed_guidance: boolean
    save_frequently: boolean
  }
  resume_info: {
    last_action?: string
    time_spent_today?: string
    suggested_session_length: string
    can_quick_complete: boolean
  }
}

export interface IntelligenceSource {
  id: string
  source_title: string
  source_type: string
  source_url?: string
  confidence_score: number
  usage_count?: number
  analysis_status: string
  created_at: string
  updated_at?: string
  offer_intelligence?: Record<string, any>
  psychology_intelligence?: Record<string, any>
  content_intelligence?: Record<string, any>
  competitive_intelligence?: Record<string, any>
  brand_intelligence?: Record<string, any>
}

export interface GeneratedContent {
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

// ✅ NEW: Enhanced content types for content management
export interface GeneratedContentItem {
  id: string
  content_type: string
  content_title: string
  content_body: string // JSON string containing the actual content
  content_metadata: any
  generation_settings: any
  intelligence_used: any
  performance_data?: any
  user_rating?: number
  is_published?: boolean
  published_at?: string
  created_at: string
  updated_at?: string
  // Amplification context
  amplification_context?: {
    generated_from_amplified_intelligence: boolean
    amplification_metadata: any
  }
}

export interface ContentListResponse {
  campaign_id: string
  total_content: number
  content_items: GeneratedContentItem[]
}

export interface ContentDetailResponse {
  id: string
  campaign_id: string
  content_type: string
  content_title: string
  content_body: string
  parsed_content: any
  content_metadata: any
  generation_settings: any
  intelligence_used: any
  performance_data: any
  user_rating?: number
  is_published: boolean
  published_at?: string
  created_at: string
  updated_at?: string
  intelligence_source?: {
    id: string
    source_title: string
    source_url?: string
    confidence_score: number
    source_type: string
  }
}

export interface ContentStats {
  campaign_id: string
  total_content: number
  published_content: number
  unpublished_content: number
  rated_content: number
  average_rating: number
  amplified_content: number
  recent_content: number
  content_by_type: Record<string, number>
  performance_metrics: {
    publication_rate: number
    rating_rate: number
    amplification_rate: number
  }
}

export interface BulkActionResponse {
  campaign_id: string
  action: string
  total_items: number
  successful: number
  failed: number
  results: Array<{
    id: string
    action: string
    success: boolean
    error?: string
    rating?: number
  }>
}

export interface User {
  id: string
  email: string
  full_name: string
  role: string
  is_active: boolean
  is_verified: boolean
  company: {
    id: string
    company_name: string
    company_slug: string
    subscription_tier: string
    monthly_credits_used: number
    monthly_credits_limit: number
    company_size?: string
  }
}

// ✅ NEW: Live ClickBank scraping methods
export interface LiveClickBankResponse {
  category: string
  products_requested: number
  products_found: number
  products: ClickBankProduct[]
  scraping_metadata: {
    scraped_at: string
    scraping_time_seconds: number
    data_source: string
    marketplace_url: string
    is_live_data: boolean
  }
  success: boolean
}

export interface AllCategoriesResponse {
  categories_scraped: string[]
  products_per_category: number
  total_products_found: number
  results: Record<string, any[]>
  scraping_metadata: {
    scraped_at: string
    total_scraping_time_seconds: number
    data_source: string
    is_live_data: boolean
  }
  success: boolean
}

export interface URLValidationResponse {
  url: string
  status_code: number
  is_accessible: boolean
  response_time_ms?: number
  content_length: number
  page_title?: string
  has_order_button?: boolean
  has_clickbank_links?: boolean
  is_likely_clickbank_product?: boolean
  total_links?: number
  total_images?: number
  has_video?: boolean
  validated_at: string
  error?: string
}

// ✅ NEW: ClickBank Types (add to your existing types section)
export interface ClickBankProduct {
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

export interface ClickBankCategory {
  id: string
  name: string
  description: string
}

export interface ClickBankAnalysis {
  product_id: string
  analysis_status: string
  confidence_score?: number
  key_insights: string[]
  recommended_angles: string[]
  target_audience?: any
  analysis_data?: any
  last_analyzed?: string
}

export interface ClickBankFavorite {
  product_id: string
  notes?: string
  added_at: string
}




// ============================================================================
// ERROR CLASSES
// ============================================================================

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class CreditError extends Error {
  constructor(public data: any) {
    super(data.detail || 'Credit limit exceeded')
    this.name = 'CreditError'
  }
}

// ============================================================================
// API CLIENT CLASS
// ============================================================================

class ApiClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>

  constructor() {
    this.baseURL = API_BASE_URL
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('access_token') || localStorage.getItem('authToken')
  }

  private getHeaders(): Record<string, string> {
    const token = this.getAuthToken()
    return {
      ...this.defaultHeaders,
      ...(token && { Authorization: `Bearer ${token}` })
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.ok) {
      try {
        return await response.json()
      } catch {
        return {} as T
      }
    }

    // Handle error responses
    let errorData: any
    try {
      errorData = await response.json()
    } catch {
      errorData = {
        detail: `HTTP ${response.status}: ${response.statusText}`,
        status_code: response.status,
      }
    }

    // Special handling for different error types
    if (response.status === 402) {
      throw new CreditError(errorData)
    }

    if (response.status === 401) {
      // Clear tokens and redirect to login
      this.clearAuthToken()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      throw new ApiError('Authentication required', 401, errorData)
    }

    throw new ApiError(
      errorData.detail || errorData.message || 'An error occurred',
      response.status,
      errorData
    )
  }

  setAuthToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token)
      localStorage.setItem('authToken', token)
    }
  }

  clearAuthToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('authToken')
    }
  }

// Get live ClickBank products from marketplace
async getLiveClickBankProducts(
  category: string, 
  limit: number = 10
): Promise<LiveClickBankResponse> {
  console.log(`🔍 Scraping live ClickBank products: ${category} (limit: ${limit})`)
  
  const response = await fetch(`${this.baseURL}/api/intelligence/clickbank/live-products/${category}?limit=${limit}`, {
    headers: this.getHeaders()
  })
  
  const result = await this.handleResponse<LiveClickBankResponse>(response)
  console.log(`✅ Live scraping complete: ${result.products_found} products in ${result.scraping_metadata.scraping_time_seconds}s`)
  
  return result
}

// Get live products from all categories
async getAllCategoriesLive(
  productsPerCategory: number = 5
): Promise<AllCategoriesResponse> {
  console.log(`🔍 Scraping all ClickBank categories (${productsPerCategory} products each)`)
  
  const response = await fetch(`${this.baseURL}/api/intelligence/clickbank/live-all-categories?products_per_category=${productsPerCategory}`, {
    headers: this.getHeaders()
  })
  
  const result = await this.handleResponse<AllCategoriesResponse>(response)
  console.log(`✅ All categories scraped: ${result.total_products_found} total products`)
  
  return result
}

// Validate a sales page URL
async validateSalesPageURL(url: string): Promise<URLValidationResponse> {
  const response = await fetch(`${this.baseURL}/api/intelligence/clickbank/validate-sales-url?url=${encodeURIComponent(url)}`, {
    headers: this.getHeaders()
  })
  
  return this.handleResponse<URLValidationResponse>(response)
}

// Get scraping status and capabilities
async getScrapingStatus(): Promise<{
  scraper_status: string
  supported_categories: string[]
  category_urls: Record<string, string>
  max_products_per_request: number
  features: string[]
  limitations: string[]
  last_updated: string
}> {
  const response = await fetch(`${this.baseURL}/api/intelligence/clickbank/scraping-status`, {
    headers: this.getHeaders()
  })
  
  return this.handleResponse(response)
}

// ✅ UPDATED: Enhanced fetchClickBankProducts with live scraping
async fetchClickBankProducts(category: string, useLiveData: boolean = true): Promise<ClickBankProduct[]> {
  if (useLiveData) {
    console.log(`🚀 Using live scraping for category: ${category}`)
    
    try {
      const result = await this.getLiveClickBankProducts(category, 10)
      return result.products
    } catch (error) {
      console.error('❌ Live scraping failed, falling back to API:', error)
      // Fallback to regular API
      return this.fetchClickBankProductsLegacy(category)
    }
  } else {
    return this.fetchClickBankProductsLegacy(category)
  }
}

// Legacy method (keep as fallback)
private async fetchClickBankProductsLegacy(category: string): Promise<ClickBankProduct[]> {
  const response = await fetch(`${this.baseURL}/api/intelligence/clickbank/top-products?type=${category}&use_live_data=false`, {
    headers: this.getHeaders()
  })
  
  return this.handleResponse(response)
}

// ✅ BATCH: Get fresh data for multiple categories
async refreshAllCategories(): Promise<Record<string, ClickBankProduct[]>> {
  console.log('🔄 Refreshing all ClickBank categories with live data...')
  
  const result = await this.getAllCategoriesLive(8) // 8 products per category
  
  // Transform the response to match your frontend expectations
  const categorizedProducts: Record<string, ClickBankProduct[]> = {}
  
  for (const [category, products] of Object.entries(result.results)) {
    categorizedProducts[category] = products.map((product: any, index: number) => ({
      id: `live_${product.product_id}_${category}_${index}`,
      title: product.title,
      vendor: product.vendor,
      description: product.description,
      gravity: product.gravity,
      commission_rate: product.commission_rate,
      salespage_url: product.salespage_url,
      product_id: product.product_id,
      vendor_id: product.vendor_id,
      category: category,
      analysis_status: 'pending' as const,
      analysis_score: undefined,
      key_insights: [],
      recommended_angles: [],
      is_analyzed: false,
      created_at: product.scraped_at
    }))
  }
  
  console.log(`✅ Refreshed ${Object.keys(categorizedProducts).length} categories with ${result.total_products_found} total products`)
  
  return categorizedProducts
}

// ✅ VALIDATION: Batch validate multiple URLs
async validateMultipleURLs(urls: string[]): Promise<URLValidationResponse[]> {
  console.log(`🔍 Validating ${urls.length} URLs...`)
  
  const validationPromises = urls.map(url => this.validateSalesPageURL(url))
  const results = await Promise.allSettled(validationPromises)
  
  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value
    } else {
      return {
        url: urls[index],
        status_code: 0,
        is_accessible: false,
        content_length: 0,
        validated_at: new Date().toISOString(),
        error: result.reason?.message || 'Validation failed'
      }
    }
  })
}

  // Get available ClickBank categories
async getClickBankCategories(): Promise<ClickBankCategory[]> {
  const response = await fetch(`${this.baseURL}/api/intelligence/clickbank/categories`, {
    headers: this.getHeaders()
  })
  
  return this.handleResponse(response)
}

// Get ClickBank products by category (enhanced endpoint)
async getClickBankProductsByCategory(
  category: string, 
  analyzedOnly: boolean = false, 
  limit: number = 20
): Promise<ClickBankProduct[]> {
  const params = new URLSearchParams()
  if (analyzedOnly) params.set('analyzed_only', 'true')
  params.set('limit', limit.toString())
  
  const response = await fetch(`${this.baseURL}/api/intelligence/clickbank/products/${category}?${params}`, {
    headers: this.getHeaders()
  })
  
  return this.handleResponse(response)
}

// Analyze a ClickBank product
async analyzeClickBankProduct(productId: string): Promise<{
  product_id: string
  analysis_status: string
  message: string
  estimated_completion?: string
}> {
  const response = await fetch(`${this.baseURL}/api/intelligence/clickbank/products/${productId}/analyze`, {
    method: 'POST',
    headers: this.getHeaders()
  })
  
  return this.handleResponse(response)
}

// Get ClickBank product analysis results
async getClickBankProductAnalysis(productId: string): Promise<ClickBankAnalysis> {
  const response = await fetch(`${this.baseURL}/api/intelligence/clickbank/products/${productId}/analysis`, {
    headers: this.getHeaders()
  })
  
  return this.handleResponse(response)
}

// Add product to favorites
async addClickBankFavorite(productId: string, notes?: string): Promise<{message: string}> {
  const response = await fetch(`${this.baseURL}/api/intelligence/clickbank/favorites/${productId}`, {
    method: 'POST',
    headers: this.getHeaders(),
    body: JSON.stringify({ notes })
  })
  
  return this.handleResponse(response)
}

// Remove product from favorites
async removeClickBankFavorite(productId: string): Promise<{message: string}> {
  const response = await fetch(`${this.baseURL}/api/intelligence/clickbank/favorites/${productId}`, {
    method: 'DELETE',
    headers: this.getHeaders()
  })
  
  return this.handleResponse(response)
}

// Get user's favorite products
async getClickBankFavorites(): Promise<ClickBankFavorite[]> {
  const response = await fetch(`${this.baseURL}/api/intelligence/clickbank/favorites`, {
    headers: this.getHeaders()
  })
  
  return this.handleResponse(response)
}

// Test ClickBank API connection
async testClickBankConnection(): Promise<{
  status: string
  message?: string
  api_key_configured: boolean
  api_key_length: number
  base_url?: string
  response_preview?: any
}> {
  const response = await fetch(`${this.baseURL}/api/intelligence/clickbank/test-connection`, {
    headers: this.getHeaders()
  })
  
  return this.handleResponse(response)
}

// Enhanced campaign creation with ClickBank integration
async createCampaignFromClickBank(campaignData: {
  title: string
  description: string
  clickbank_product_id: string
  selected_angles: string[]
  tone: string
  style: string
  settings: any
}): Promise<Campaign> {
  // Enhanced campaign creation with ClickBank context
  const enhancedData = {
    ...campaignData,
    campaign_type: 'universal',
    settings: {
      ...campaignData.settings,
      clickbank_integration: true,
      auto_analyze_product: true,
      clickbank_product_id: campaignData.clickbank_product_id
    }
  }
  
  const response = await fetch(`${this.baseURL}/api/campaigns`, {
    method: 'POST',
    headers: this.getHeaders(),
    body: JSON.stringify(enhancedData)
  })
  
  return this.handleResponse<Campaign>(response)
}

  // ============================================================================
  // AUTHENTICATION METHODS
  // ============================================================================

  async login(credentials: { email: string; password: string }): Promise<{
    access_token: string
    token_type: string
    expires_in: number
    user_id: string
  }> {
    const response = await fetch(`${this.baseURL}/api/auth/login`, {
      method: 'POST',
      headers: this.defaultHeaders,
      body: JSON.stringify(credentials)
    })
    
    const result = await this.handleResponse<any>(response)
    
    if (result.access_token) {
      this.setAuthToken(result.access_token)
    }
    
    return result
  }

  async register(data: {
    email: string
    password: string
    full_name: string
  }): Promise<{
    message: string
    user_id: string
    company_id: string
  }> {
    const response = await fetch(`${this.baseURL}/api/auth/register`, {
      method: 'POST',
      headers: this.defaultHeaders,
      body: JSON.stringify(data)
    })
    
    return this.handleResponse(response)
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${this.baseURL}/api/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders()
      })
    } finally {
      this.clearAuthToken()
    }
  }

  async getUserProfile(): Promise<User> {
    const response = await fetch(`${this.baseURL}/api/auth/profile`, {
      headers: this.getHeaders()
    })
    
    return this.handleResponse<User>(response)
  }

  // ============================================================================
  // ENHANCED CAMPAIGN METHODS
  // ============================================================================

  async createCampaign(campaignData: {
    title: string
    description: string
    keywords?: string[]
    target_audience?: string
    campaign_type?: string
    tone?: string
    style?: string
    settings?: Record<string, any>
  }): Promise<Campaign> {
    const dataWithDefaults = {
      campaign_type: 'universal',
      ...campaignData
    }
    
    const response = await fetch(`${this.baseURL}/api/campaigns`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(dataWithDefaults)
    })
    
    return this.handleResponse<Campaign>(response)
  }

  async getCampaigns(params?: {
    page?: number
    limit?: number
    status_filter?: string
    search?: string
  }): Promise<Campaign[]> {
    const baseUrl = `${this.baseURL}/api/campaigns`
    
    // Build search params
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.status_filter) searchParams.set('status_filter', params.status_filter)
    if (params?.search) searchParams.set('search', params.search)

    const fullUrl = searchParams.toString() 
      ? `${baseUrl}?${searchParams.toString()}`
      : baseUrl
    
    console.log('🔍 getCampaigns URL:', fullUrl)
    
    try {
      const response = await fetch(fullUrl, {
        headers: this.getHeaders()
      })
      
      console.log('✅ getCampaigns response status:', response.status)
      
      if (!response.ok) {
        console.error('❌ getCampaigns failed:', response.status, response.statusText)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await this.handleResponse<Campaign[]>(response)
      console.log('✅ getCampaigns success, got', Array.isArray(data) ? data.length : 'unknown', 'campaigns')
      
      return data
      
    } catch (error) {
      console.error('❌ getCampaigns error:', error)
      throw error
    }
  }

  async getCampaign(campaignId: string): Promise<Campaign> {
    const response = await fetch(`${this.baseURL}/api/campaigns/${campaignId}`, {
      headers: this.getHeaders()
    })
    
    return this.handleResponse<Campaign>(response)
  }

  async updateCampaign(campaignId: string, updates: Partial<Campaign>): Promise<Campaign> {
    const response = await fetch(`${this.baseURL}/api/campaigns/${campaignId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates)
    })
    
    return this.handleResponse<Campaign>(response)
  }

  async deleteCampaign(campaignId: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseURL}/api/campaigns/${campaignId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    })
    
    return this.handleResponse(response)
  }

  async duplicateCampaign(campaignId: string): Promise<Campaign> {
    const response = await fetch(`${this.baseURL}/api/campaigns/${campaignId}/duplicate`, {
      method: 'POST',
      headers: this.getHeaders()
    })
    
    return this.handleResponse<Campaign>(response)
  }

  async getGeneratedContent(campaignId: string): Promise<any[]> {
    console.log('🔍 getGeneratedContent called for campaign:', campaignId)
    
    try {
      const response = await fetch(`${this.baseURL}/api/campaigns/${campaignId}/content`, {
        headers: this.getHeaders()
      })
      
      console.log('✅ getGeneratedContent response status:', response.status)
      
      if (!response.ok) {
        if (response.status === 404) {
          console.warn('⚠️ Content endpoint not found, returning empty array')
          return []
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await this.handleResponse<any[]>(response)
      console.log('✅ getGeneratedContent success, got', Array.isArray(data) ? data.length : 'unknown', 'content items')
      
      return data
      
    } catch (error) {
      console.error('❌ getGeneratedContent error:', error)
      // Return empty array instead of throwing to prevent infinite loops
      return []
    }
  }

  // ============================================================================
  // ✅ NEW: CONTENT MANAGEMENT METHODS
  // ============================================================================

  async getContentList(campaignId: string, includeBody = false, contentType?: string): Promise<ContentListResponse> {
    const params = new URLSearchParams()
    if (includeBody) params.set('include_body', 'true')
    if (contentType) params.set('content_type', contentType)
    
    const response = await fetch(`${this.baseURL}/api/campaigns/${campaignId}/content?${params}`, {
      headers: this.getHeaders()
    })
    
    return this.handleResponse<ContentListResponse>(response)
  }

  async getContentDetail(campaignId: string, contentId: string): Promise<ContentDetailResponse> {
    const response = await fetch(`${this.baseURL}/api/campaigns/${campaignId}/content/${contentId}`, {
      headers: this.getHeaders()
    })
    
    return this.handleResponse<ContentDetailResponse>(response)
  }

  async updateContent(campaignId: string, contentId: string, updateData: any): Promise<{
    id: string
    message: string
    updated_at: string
  }> {
    const response = await fetch(`${this.baseURL}/api/campaigns/${campaignId}/content/${contentId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updateData)
    })
    
    return this.handleResponse(response)
  }

  async deleteContent(campaignId: string, contentId: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseURL}/api/campaigns/${campaignId}/content/${contentId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    })
    
    return this.handleResponse(response)
  }

  async rateContent(campaignId: string, contentId: string, rating: number): Promise<{
    id: string
    rating: number
    message: string
  }> {
    const response = await fetch(`${this.baseURL}/api/campaigns/${campaignId}/content/${contentId}/rate`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ rating })
    })
    
    return this.handleResponse(response)
  }

  async publishContent(campaignId: string, contentId: string, publishedAt?: string): Promise<{
    id: string
    is_published: boolean
    published_at: string
    message: string
  }> {
    const response = await fetch(`${this.baseURL}/api/campaigns/${campaignId}/content/${contentId}/publish`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ published_at: publishedAt || 'Manual' })
    })
    
    return this.handleResponse(response)
  }

  async bulkContentAction(campaignId: string, contentIds: string[], action: string, params: any = {}): Promise<BulkActionResponse> {
    const response = await fetch(`${this.baseURL}/api/campaigns/${campaignId}/content/bulk-action`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ content_ids: contentIds, action, params })
    })
    
    return this.handleResponse<BulkActionResponse>(response)
  }

  async getContentStats(campaignId: string): Promise<ContentStats> {
    const response = await fetch(`${this.baseURL}/api/campaigns/${campaignId}/content/stats`, {
      headers: this.getHeaders()
    })
    
    return this.handleResponse<ContentStats>(response)
  }

  async duplicateContent(campaignId: string, contentId: string, title?: string): Promise<{
    id: string
    original_id: string
    title: string
    message: string
  }> {
    const response = await fetch(`${this.baseURL}/api/campaigns/${campaignId}/content/${contentId}/duplicate`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ title })
    })
    
    return this.handleResponse(response)
  }

  // ============================================================================
  // FLEXIBLE WORKFLOW METHODS
  // ============================================================================

  async getWorkflowState(campaignId: string): Promise<WorkflowState> {
    const response = await fetch(`${this.baseURL}/api/campaigns/${campaignId}/workflow-state`, {
      headers: this.getHeaders()
    })
    
    return this.handleResponse<WorkflowState>(response)
  }

  async setWorkflowPreference(campaignId: string, preferences: {
    workflow_preference?: 'quick' | 'methodical' | 'flexible'
    quick_mode?: boolean
    auto_advance?: boolean
    detailed_guidance?: boolean
  }): Promise<{
    campaign_id: string
    workflow_preference: string
    settings_updated: Record<string, any>
    message: string
  }> {
    const response = await fetch(`${this.baseURL}/api/campaigns/${campaignId}/workflow/set-preference`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(preferences)
    })
    
    return this.handleResponse(response)
  }

  async advanceCampaignStep(campaignId: string, stepData: Record<string, any> = {}): Promise<{
    campaign_id: string
    previous_step: number
    current_step: number
    workflow_state: string
    message: string
  }> {
    const response = await fetch(`${this.baseURL}/api/campaigns/${campaignId}/workflow/advance-step`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(stepData)
    })
    
    return this.handleResponse(response)
  }

  async saveProgress(campaignId: string, progressData: Record<string, any>): Promise<{
    campaign_id: string
    message: string
    saved_at: string
  }> {
    const response = await fetch(`${this.baseURL}/api/campaigns/${campaignId}/workflow/save-progress`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(progressData)
    })
    
    return this.handleResponse(response)
  }

  async quickCompleteCampaign(campaignId: string, options: Record<string, any> = {}): Promise<{
    campaign_id: string
    completion_plan: Array<{
      step: number
      action: string
      description: string
    }>
    estimated_time: string
    can_execute: boolean
    message: string
  }> {
    const response = await fetch(`${this.baseURL}/api/campaigns/${campaignId}/workflow/quick-complete`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(options)
    })
    
    return this.handleResponse(response)
  }

  // ============================================================================
  // INTELLIGENCE METHODS
  // ============================================================================

  async analyzeURL(data: {
    url: string
    campaign_id: string
    analysis_type?: string
  }): Promise<{
    intelligence_id: string
    analysis_status: string
    confidence_score: number
    offer_intelligence: any
    psychology_intelligence: any
    competitive_opportunities: any[]
    campaign_suggestions: string[]
  }> {
    const response = await fetch(`${this.baseURL}/api/intelligence/analysis/url`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    })
    
    return this.handleResponse(response)
  }

  async uploadDocument(file: File, campaignId: string): Promise<{
    intelligence_id: string
    status: string
    insights_extracted: number
    content_opportunities: string[]
  }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('campaign_id', campaignId)

    const response = await fetch(`${this.baseURL}/api/intelligence/upload-document`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.getAuthToken()}`
      },
      body: formData
    })
    
    return this.handleResponse(response)
  }

  async generateContent(data: {
    intelligence_id: string
    content_type: string
    preferences?: Record<string, any>
    campaign_id: string
  }): Promise<GeneratedContent> {
    const response = await fetch(`${this.baseURL}/api/intelligence/content/generate`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    })
    
    return this.handleResponse<GeneratedContent>(response)
  }

  async getCampaignIntelligence(campaignId: string): Promise<{
    campaign_id: string
    intelligence_sources: IntelligenceSource[]
    generated_content: any[]
    summary: {
      total_intelligence_sources: number
      total_generated_content: number
      avg_confidence_score: number
      amplification_summary?: {
        sources_amplified: number
        sources_available_for_amplification: number
        total_scientific_enhancements: number
        amplification_available: boolean
        amplification_coverage: string
      }
    }
  }> {
    const response = await fetch(`${this.baseURL}/api/campaigns/${campaignId}/intelligence`, {
    headers: this.getHeaders()
    })
    
    return this.handleResponse(response)
  }

  // ============================================================================
  // ENHANCED INTELLIGENCE METHODS
  // ============================================================================

  async analyzeSalesPageEnhanced(data: {
    url: string
    campaign_id: string
    analysis_depth?: 'basic' | 'comprehensive' | 'competitive'
    include_vsl_detection?: boolean
    custom_analysis_points?: string[]
  }): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/intelligence/analyze-sales-page-enhanced`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        ...data,
        analysis_depth: data.analysis_depth || 'comprehensive',
        include_vsl_detection: data.include_vsl_detection ?? true
      })
    })
    
    return this.handleResponse(response)
  }

  async detectAndAnalyzeVSL(data: {
    url: string
    campaign_id: string
    extract_transcript?: boolean
    analyze_psychological_hooks?: boolean
  }): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/intelligence/vsl-analysis`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        ...data,
        extract_transcript: data.extract_transcript ?? true,
        analyze_psychological_hooks: data.analyze_psychological_hooks ?? true
      })
    })
    
    return this.handleResponse(response)
  }

  async generateCampaignAngles(data: {
    campaign_id: string
    intelligence_sources: string[]
    target_audience?: string
    industry?: string
    tone_preferences?: string[]
    unique_value_props?: string[]
    avoid_angles?: string[]
  }): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/intelligence/generate-campaign-angles`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    })
    
    return this.handleResponse(response)
  }

  async consolidateMultiSourceIntelligence(campaignId: string, options?: {
    weight_by_confidence?: boolean
    include_conflicting_insights?: boolean
    generate_unified_strategy?: boolean
  }): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/intelligence/consolidate/${campaignId}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(options || {})
    })
    
    return this.handleResponse(response)
  }

  async batchAnalyzeCompetitors(data: {
    urls: string[]
    campaign_id: string
    analysis_type?: 'quick' | 'detailed'
    compare_results?: boolean
  }): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/intelligence/batch-analyze`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    })
    
    return this.handleResponse(response)
  }

  async validateAndPreAnalyzeURL(url: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/intelligence/validate-url`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ url })
    })
    
    return this.handleResponse(response)
  }

  // ============================================================================
  // DASHBOARD METHODS - FIXED TO MATCH BACKEND
  // ============================================================================

  async getDashboardStats(): Promise<{
    total_campaigns: number
    active_campaigns: number
    draft_campaigns: number
    completed_campaigns: number
    total_sources: number
    total_content: number
    avg_completion: number
    recent_activity: any[]
    user_id: string
    company_id: string
    generated_at: string
  }> {
    const response = await fetch(`${this.baseURL}/api/campaigns/dashboard/stats`, {
      headers: this.getHeaders()
    })
    
    return this.handleResponse(response)
  }

  async getCampaignStats(): Promise<{
    total_campaigns: number
    active_campaigns: number
    draft_campaigns: number
    completed_campaigns: number
    total_sources: number
    total_content: number
    avg_completion: number
  }> {
    const response = await fetch(`${this.baseURL}/api/campaigns/stats/overview`, {
      headers: this.getHeaders()
    })
    
    return this.handleResponse(response)
  }

  async getCompanyStats(): Promise<{
    company_name: string
    subscription_tier: string
    monthly_credits_used: number
    monthly_credits_limit: number
    credits_remaining: number
    total_campaigns: number
    active_campaigns: number
    team_members: number
    campaigns_this_month: number
    usage_percentage: number
  }> {
    const response = await fetch(`${this.baseURL}/api/dashboard/stats`, {
      headers: this.getHeaders()
    })
    
    return this.handleResponse(response)
  }

  async getCompanyDetails(): Promise<{
    id: string
    company_name: string
    company_slug: string
    industry?: string
    company_size?: string
    website_url?: string
    subscription_tier: string
    subscription_status: string
    monthly_credits_used: number
    monthly_credits_limit: number
    created_at: string
  }> {
    const response = await fetch(`${this.baseURL}/api/dashboard/company`, {
      headers: this.getHeaders()
    })
    
    return this.handleResponse(response)
  }

  // ============================================================================
  // ADMIN METHODS
  // ============================================================================

  async getAdminStats(): Promise<{
    total_users: number
    total_companies: number
    total_campaigns: number
    monthly_recurring_revenue: number
    subscription_breakdown: Record<string, number>
  }> {
    const response = await fetch(`${this.baseURL}/api/admin/stats`, {
      headers: this.getHeaders()
    })
    
    return this.handleResponse(response)
  }

  async getAdminUsers(params?: {
    page?: number
    limit?: number
    search?: string
    subscription_tier?: string
    is_active?: boolean
  }): Promise<{
    users: any[]
    total: number
    page: number
    limit: number
    pages: number
  }> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.search) searchParams.set('search', params.search)
    if (params?.subscription_tier) searchParams.set('subscription_tier', params.subscription_tier)
    if (params?.is_active !== undefined) searchParams.set('is_active', params.is_active.toString())

    const response = await fetch(`${this.baseURL}/api/admin/users?${searchParams}`, {
      headers: this.getHeaders()
    })
    
    return this.handleResponse(response)
  }

  async getAdminCompanies(params?: {
    page?: number
    limit?: number
    search?: string
    subscription_tier?: string
  }): Promise<{
    companies: any[]
    total: number
    page: number
    limit: number
    pages: number
  }> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.search) searchParams.set('search', params.search)
    if (params?.subscription_tier) searchParams.set('subscription_tier', params.subscription_tier)

    const response = await fetch(`${this.baseURL}/api/admin/companies?${searchParams}`, {
      headers: this.getHeaders()
    })
    
    return this.handleResponse(response)
  }

  async updateUserStatus(userId: string, isActive: boolean): Promise<{ message: string }> {
    const response = await fetch(`${this.baseURL}/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ is_active: isActive })
    })
    
    return this.handleResponse(response)
  }

  async updateUserRole(userId: string, newRole: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseURL}/api/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ new_role: newRole })
    })
    
    return this.handleResponse(response)
  }

  async updateCompanySubscription(companyId: string, data: {
    subscription_tier?: string
    monthly_credits_limit?: number
    subscription_status?: string
    reset_monthly_credits?: boolean
  }): Promise<{ message: string }> {
    const response = await fetch(`${this.baseURL}/api/admin/companies/${companyId}/subscription`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    })
    
    return this.handleResponse(response)
  }

  // ============================================================================
  // ✅ STABILITY AI IMAGE GENERATION METHODS
  // ============================================================================

  async generateSingleImage(data: {
    campaign_id: string
    prompt: string
    platform?: string
    style?: string
  }): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/intelligence/stability/generate-single-image`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    })
    
    return this.handleResponse(response)
  }

  async generateCampaignWithImages(data: {
    campaign_id: string
    platforms?: string[]
    content_count?: number
    image_style?: string
    generate_images?: boolean
  }): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/intelligence/stability/generate-campaign-with-images`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    })
    
    return this.handleResponse(response)
  }

  async testStabilityConnection(): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/intelligence/stability/test-connection`, {
      headers: this.getHeaders()
    })
    
    return this.handleResponse(response)
  }

  async calculateImageCosts(params: {
    platforms?: string
    posts_per_platform?: number
  }): Promise<any> {
    const searchParams = new URLSearchParams()
    if (params.platforms) searchParams.set('platforms', params.platforms)
    if (params.posts_per_platform) searchParams.set('posts_per_platform', params.posts_per_platform.toString())
    
    const response = await fetch(`${this.baseURL}/api/intelligence/stability/cost-calculator?${searchParams}`, {
      headers: this.getHeaders()
    })
    
    return this.handleResponse(response)
  }

  async downloadCampaignPackage(campaignId: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/intelligence/stability/${campaignId}/download-package`, {
      headers: this.getHeaders()
    })
    
    return this.handleResponse(response)
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const apiClient = new ApiClient()

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function isCreditError(error: unknown): error is CreditError {
  return error instanceof CreditError
}

export function getErrorMessage(error: unknown): string {
  if (isApiError(error) || isCreditError(error)) {
    return error.message
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return 'An unexpected error occurred'
}

// ============================================================================
// REACT HOOK FOR API ACCESS
// ============================================================================

export const useApi = () => {
  return {
    // Authentication
    login: apiClient.login.bind(apiClient),
    register: apiClient.register.bind(apiClient),
    logout: apiClient.logout.bind(apiClient),
    getUserProfile: apiClient.getUserProfile.bind(apiClient),
    
    // Enhanced campaign operations
    createCampaign: apiClient.createCampaign.bind(apiClient),
    getCampaigns: apiClient.getCampaigns.bind(apiClient),
    getCampaign: apiClient.getCampaign.bind(apiClient),
    updateCampaign: apiClient.updateCampaign.bind(apiClient),
    deleteCampaign: apiClient.deleteCampaign.bind(apiClient),
    duplicateCampaign: apiClient.duplicateCampaign.bind(apiClient),
    
    // Legacy content method (for backward compatibility)
    getGeneratedContent: apiClient.getGeneratedContent.bind(apiClient),
    
    // ✅ NEW: Enhanced content management methods
    getContentList: apiClient.getContentList.bind(apiClient),
    getContentDetail: apiClient.getContentDetail.bind(apiClient),
    updateContent: apiClient.updateContent.bind(apiClient),
    deleteContent: apiClient.deleteContent.bind(apiClient),
    rateContent: apiClient.rateContent.bind(apiClient),
    publishContent: apiClient.publishContent.bind(apiClient),
    bulkContentAction: apiClient.bulkContentAction.bind(apiClient),
    getContentStats: apiClient.getContentStats.bind(apiClient),
    duplicateContent: apiClient.duplicateContent.bind(apiClient),
    
    // Flexible workflow operations
    getWorkflowState: apiClient.getWorkflowState.bind(apiClient),
    setWorkflowPreference: apiClient.setWorkflowPreference.bind(apiClient),
    advanceCampaignStep: apiClient.advanceCampaignStep.bind(apiClient),
    saveProgress: apiClient.saveProgress.bind(apiClient),
    quickCompleteCampaign: apiClient.quickCompleteCampaign.bind(apiClient),
    
    // Intelligence operations (existing)
    analyzeURL: apiClient.analyzeURL.bind(apiClient),
    uploadDocument: apiClient.uploadDocument.bind(apiClient),
    generateContent: apiClient.generateContent.bind(apiClient),
    getCampaignIntelligence: apiClient.getCampaignIntelligence.bind(apiClient),
    
    // Enhanced intelligence operations
    analyzeSalesPageEnhanced: apiClient.analyzeSalesPageEnhanced.bind(apiClient),
    detectAndAnalyzeVSL: apiClient.detectAndAnalyzeVSL.bind(apiClient),
    generateCampaignAngles: apiClient.generateCampaignAngles.bind(apiClient),
    consolidateMultiSourceIntelligence: apiClient.consolidateMultiSourceIntelligence.bind(apiClient),
    batchAnalyzeCompetitors: apiClient.batchAnalyzeCompetitors.bind(apiClient),
    validateAndPreAnalyzeURL: apiClient.validateAndPreAnalyzeURL.bind(apiClient),
    
    // Dashboard - FIXED
    getDashboardStats: apiClient.getDashboardStats.bind(apiClient),
    getCampaignStats: apiClient.getCampaignStats.bind(apiClient),
    getCompanyStats: apiClient.getCompanyStats.bind(apiClient),
    getCompanyDetails: apiClient.getCompanyDetails.bind(apiClient),
    
    // Admin methods
    getAdminStats: apiClient.getAdminStats.bind(apiClient),
    getAdminUsers: apiClient.getAdminUsers.bind(apiClient),
    getAdminCompanies: apiClient.getAdminCompanies.bind(apiClient),
    updateUserStatus: apiClient.updateUserStatus.bind(apiClient),
    updateUserRole: apiClient.updateUserRole.bind(apiClient),
    updateCompanySubscription: apiClient.updateCompanySubscription.bind(apiClient),
    
    // ✅ NEW: Stability AI image generation methods
    generateSingleImage: apiClient.generateSingleImage.bind(apiClient),
    generateCampaignWithImages: apiClient.generateCampaignWithImages.bind(apiClient),
    testStabilityConnection: apiClient.testStabilityConnection.bind(apiClient),
    calculateImageCosts: apiClient.calculateImageCosts.bind(apiClient),
    downloadCampaignPackage: apiClient.downloadCampaignPackage.bind(apiClient),
    
    // Token management
    setAuthToken: apiClient.setAuthToken.bind(apiClient),
    clearAuthToken: apiClient.clearAuthToken.bind(apiClient),

   // ClickBank marketplace methods
    getClickBankCategories: apiClient.getClickBankCategories.bind(apiClient),    
    getClickBankProductsByCategory: apiClient.getClickBankProductsByCategory.bind(apiClient),
    analyzeClickBankProduct: apiClient.analyzeClickBankProduct.bind(apiClient),
    getClickBankProductAnalysis: apiClient.getClickBankProductAnalysis.bind(apiClient),
    addClickBankFavorite: apiClient.addClickBankFavorite.bind(apiClient),
    removeClickBankFavorite: apiClient.removeClickBankFavorite.bind(apiClient),
    getClickBankFavorites: apiClient.getClickBankFavorites.bind(apiClient),
    testClickBankConnection: apiClient.testClickBankConnection.bind(apiClient),
    createCampaignFromClickBank: apiClient.createCampaignFromClickBank.bind(apiClient),

    // ✅ NEW: Live ClickBank scraping methods
    getLiveClickBankProducts: apiClient.getLiveClickBankProducts.bind(apiClient),
    getAllCategoriesLive: apiClient.getAllCategoriesLive.bind(apiClient),
    validateSalesPageURL: apiClient.validateSalesPageURL.bind(apiClient),
    getScrapingStatus: apiClient.getScrapingStatus.bind(apiClient),
    refreshAllCategories: apiClient.refreshAllCategories.bind(apiClient),
    validateMultipleURLs: apiClient.validateMultipleURLs.bind(apiClient),
    
    // ✅ UPDATED: Enhanced ClickBank methods
    fetchClickBankProducts: apiClient.fetchClickBankProducts.bind(apiClient)
  }
}