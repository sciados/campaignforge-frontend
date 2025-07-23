// src/lib/api.ts - ENHANCED WITH DEMO PREFERENCE CONTROL
/**
 * Enhanced API client for RodgersDigital with PostgreSQL ClickBank integration
 * 🆕 NEW: Demo preference management system with smart user control
 */

import { useState, useCallback, useEffect } from 'react'

const API_BASE_URL = 'https://campaign-backend-production-e2db.up.railway.app'

console.log('🔍 Environment check:')
console.log('- process.env.NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL)
console.log('- API_BASE_URL being used:', API_BASE_URL)
console.log('- Window location:', typeof window !== 'undefined' ? window.location.href : 'SSR')

// ============================================================================
// TYPES (Enhanced with Demo Preference Types)
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
  
  // 🆕 NEW: Demo campaign fields
  is_demo?: boolean
  
  // Legacy fields for backward compatibility
  content?: any
  confidence_score?: number
  last_activity?: string
}

// 🆕 NEW: Demo Preference Types
export interface DemoPreference {
  show_demo_campaigns: boolean
  demo_available: boolean
  real_campaigns_count: number
  demo_campaigns_count: number
}

export interface DemoToggleResponse {
  success: boolean
  show_demo_campaigns: boolean
  message: string
  action: string
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

export interface GeneratedContentItem {
  id: string
  content_type: string
  content_title: string
  content_body: string
  content_metadata: any
  generation_settings: any
  intelligence_used: any
  performance_data?: any
  user_rating?: number
  is_published?: boolean
  published_at?: string
  created_at: string
  updated_at?: string
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

// ✅ CLICKBANK TYPES FOR POSTGRESQL INTEGRATION
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
  data_source?: string
  is_real_product?: boolean
  // PostgreSQL enhanced fields
  category_priority?: number
  target_audience?: string
  commission_range?: string
}

export interface ClickBankCategory {
  id: string
  name: string
  primary_url: string
  backup_urls_count: number
  priority_level: number
  target_audience: string
  commission_range: string
  validation_status: string
  last_validated_at?: string
  is_active: boolean
}

export interface LiveClickBankResponse {
  category: string
  category_name: string
  products_requested: number
  products_found: number
  products: ClickBankProduct[]
  scraping_metadata: {
    scraped_at: string
    scraping_time_seconds: number
    data_source: string
    primary_url: string
    backup_urls: string[]
    priority_level: number
    target_audience: string
    commission_range: string
    validation_status: string
    is_live_data: boolean
    environment: string
  }
  success: boolean
}

export interface AllCategoriesResponse {
  categories_scraped: string[]
  total_categories_attempted: number
  products_per_category: number
  total_products_found: number
  priority_filter?: number
  results: Record<string, {
    category_name: string
    priority_level: number
    target_audience: string
    commission_range: string
    products: any[]
    products_found: number
  }>
  scraping_metadata: {
    scraped_at: string
    total_scraping_time_seconds: number
    data_source: string
    is_live_data: boolean
    environment: string
  }
  success: boolean
}

export interface PostgreSQLCategoriesResponse {
  categories: ClickBankCategory[]
  total_categories: number
  data_source: string
  active_categories: number
  priority_breakdown: {
    high_priority: number
    medium_priority: number
    low_priority: number
  }
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
// API CLIENT CLASS (Enhanced with Demo Preferences)
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
  // 🆕 NEW: DEMO PREFERENCE MANAGEMENT METHODS
  // ============================================================================

  /**
   * Get user's current demo campaign preferences
   */
  async getDemoPreferences(): Promise<DemoPreference> {
    try {
      const response = await fetch(`${this.baseURL}/api/campaigns/demo/preferences`, {
        method: 'GET',
        headers: this.getHeaders(),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to get demo preferences: ${response.statusText}`)
      }
      
      return response.json()
    } catch (error) {
      console.error('Error getting demo preferences:', error)
      throw error
    }
  }

  /**
   * Update user's demo campaign preferences
   */
  async updateDemoPreferences(showDemo: boolean): Promise<DemoPreference> {
    try {
      const response = await fetch(`${this.baseURL}/api/campaigns/demo/preferences`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({
          show_demo_campaigns: showDemo
        })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to update demo preferences: ${response.statusText}`)
      }
      
      return response.json()
    } catch (error) {
      console.error('Error updating demo preferences:', error)
      throw error
    }
  }

  /**
   * Quick toggle demo campaign visibility
   */
  async toggleDemoVisibility(): Promise<DemoToggleResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/campaigns/demo/toggle`, {
        method: 'POST',
        headers: this.getHeaders(),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to toggle demo visibility: ${response.statusText}`)
      }
      
      return response.json()
    } catch (error) {
      console.error('Error toggling demo visibility:', error)
      throw error
    }
  }

  /**
   * Get demo campaign management information (admin)
   */
  async getDemoManagementInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/api/campaigns/demo/status`, {
        method: 'GET',
        headers: this.getHeaders(),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to get demo management info: ${response.statusText}`)
      }
      
      return response.json()
    } catch (error) {
      console.error('Error getting demo management info:', error)
      throw error
    }
  }

  /**
   * Create demo campaign manually (admin/testing)
   */
  async createDemoManually(): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/api/campaigns/demo/create`, {
        method: 'POST',
        headers: this.getHeaders(),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to create demo campaign: ${response.statusText}`)
      }
      
      return response.json()
    } catch (error) {
      console.error('Error creating demo campaign:', error)
      throw error
    }
  }

  /**
   * Get campaigns including demo campaigns (admin view)
   */
  async getCampaignsWithDemo(skip = 0, limit = 100): Promise<Campaign[]> {
    try {
      const params = new URLSearchParams({
        skip: skip.toString(),
        limit: limit.toString()
      })
      
      const response = await fetch(`${this.baseURL}/api/campaigns?${params}`, {
        method: 'GET',
        headers: this.getHeaders(),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to get campaigns with demo: ${response.statusText}`)
      }
      
      return response.json()
    } catch (error) {
      console.error('Error getting campaigns with demo:', error)
      throw error
    }
  }

  // ============================================================================
  // CAMPAIGN METHODS (Enhanced)
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

  // 🆕 ENHANCED: Updated getCampaigns method with demo awareness
  async getCampaigns(params?: {
    page?: number
    limit?: number
    status_filter?: string
    search?: string
    skip?: number
  }): Promise<Campaign[]> {
    const baseUrl = `${this.baseURL}/api/campaigns`
    
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.skip) searchParams.set('skip', params.skip.toString())
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
      
      // Add helpful logging for demo campaigns
      if (Array.isArray(data)) {
        const demoCampaigns = data.filter((c: any) => c.is_demo)
        const realCampaigns = data.filter((c: any) => !c.is_demo)
        
        console.log(`📊 Campaigns loaded: ${realCampaigns.length} real, ${demoCampaigns.length} demo`)
      }
      
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
      return []
    }
  }

  // ============================================================================
  // CONTENT MANAGEMENT METHODS
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
  // WORKFLOW METHODS
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
  // ✅ POSTGRESQL CLICKBANK METHODS (PROPERLY ORGANIZED)
  // ============================================================================

  // Primary PostgreSQL ClickBank methods
  async getLiveClickBankProductsEnhanced(
    category: string, 
    limit: number = 10
  ): Promise<LiveClickBankResponse> {
    console.log(`🔍 Scraping live ClickBank products with PostgreSQL: ${category} (limit: ${limit})`)
    
    const response = await fetch(`${this.baseURL}/api/intelligence/clickbank/live-products/${category}?limit=${limit}`, {
      headers: this.getHeaders()
    })
    
    const result = await this.handleResponse<LiveClickBankResponse>(response)
    console.log(`✅ PostgreSQL scraping complete: ${result.products_found} products`)
    
    return result
  }

  async getClickBankCategoriesFromDB(): Promise<PostgreSQLCategoriesResponse> {
    console.log('🔍 Loading ClickBank categories from PostgreSQL...')
    
    const response = await fetch(`${this.baseURL}/api/intelligence/clickbank/categories`, {
      headers: this.getHeaders()
    })
    
    const result = await this.handleResponse<PostgreSQLCategoriesResponse>(response)
    console.log(`✅ Loaded ${result.total_categories} categories from PostgreSQL`)
    
    return result
  }

  async getAllCategoriesLiveWithPriority(
    productsPerCategory: number = 5,
    priorityFilter?: number
  ): Promise<AllCategoriesResponse> {
    console.log(`🔍 Scraping multiple ClickBank categories (${productsPerCategory} products each, priority >= ${priorityFilter || 'any'})`)
    
    const params = new URLSearchParams()
    params.set('products_per_category', productsPerCategory.toString())
    if (priorityFilter) params.set('priority_filter', priorityFilter.toString())
    
    const response = await fetch(`${this.baseURL}/api/intelligence/clickbank/all-live-categories?${params}`, {
      headers: this.getHeaders()
    })
    
    const result = await this.handleResponse<AllCategoriesResponse>(response)
    console.log(`✅ Bulk scraping complete: ${result.total_products_found} total products from ${result.categories_scraped.length} categories`)
    
    return result
  }

  async validateClickBankCategory(category: string): Promise<{
    category: string
    category_name: string
    total_urls_tested: number
    working_urls: number
    test_results: Array<{
      url: string
      status_code: number
      is_working: boolean
      has_products: boolean
    }>
    validation_status: string
    recommendation: string
    tested_at: string
  }> {
    console.log(`🔍 Validating URLs for category: ${category}`)
    
    const response = await fetch(`${this.baseURL}/api/intelligence/clickbank/validate-category/${category}`, {
      method: 'POST',
      headers: this.getHeaders()
    })
    
    const result = await this.handleResponse<{
      category: string
      category_name: string
      total_urls_tested: number
      working_urls: number
      test_results: Array<{
        url: string
        status_code: number
        is_working: boolean
        has_products: boolean
      }>
      validation_status: string
      recommendation: string
      tested_at: string
    }>(response)
    console.log(`✅ URL validation complete for ${category}: ${result.working_urls}/${result.total_urls_tested} URLs working`)
    
    return result
  }

  async getClickBankScrapingStatusEnhanced(): Promise<{
    scraper_status: string
    environment: string
    database_connection: string
    category_stats: {
      total_categories: number
      active_categories: number
      high_priority_categories: number
      categories_with_backup_urls: number
    }
    supported_categories: string[]
    features: string[]
    data_quality: {
      uses_real_database_urls: boolean
      keyword_based_searches: boolean
      target_audience_aware: boolean
      commission_range_realistic: boolean
    }
    last_updated: string
  }> {
    const response = await fetch(`${this.baseURL}/api/intelligence/clickbank/scraping-status`, {
      headers: this.getHeaders()
    })
    
    return this.handleResponse<{
      scraper_status: string
      environment: string
      database_connection: string
      category_stats: {
        total_categories: number
        active_categories: number
        high_priority_categories: number
        categories_with_backup_urls: number
      }
      supported_categories: string[]
      features: string[]
      data_quality: {
        uses_real_database_urls: boolean
        keyword_based_searches: boolean
        target_audience_aware: boolean
        commission_range_realistic: boolean
      }
      last_updated: string
    }>(response)
  }

  async testClickBankConnectionEnhanced(): Promise<{
    environment: string
    database_categories_loaded: number
    test_results: Record<string, {
      category_name: string
      priority_level: number
      target_audience: string
      commission_range: string
      url_tests: Array<{
        url: string
        status_code: number
        is_working: boolean
      }>
      has_working_url: boolean
      validation_status: string
    }>
    overall_status: string
    database_connection: string
  }> {
    console.log('🔍 Testing ClickBank connection with PostgreSQL categories...')
    
    const response = await fetch(`${this.baseURL}/api/intelligence/clickbank/test-connection`, {
      headers: this.getHeaders()
    })
    
    const result = await this.handleResponse<{
      environment: string
      database_categories_loaded: number
      test_results: Record<string, {
        category_name: string
        priority_level: number
        target_audience: string
        commission_range: string
        url_tests: Array<{
          url: string
          status_code: number
          is_working: boolean
        }>
        has_working_url: boolean
        validation_status: string
      }>
      overall_status: string
      database_connection: string
    }>(response)
    console.log(`✅ Connection test complete: ${result.overall_status}`)
    
    return result
  }

  // Convenience methods that use PostgreSQL integration
  async fetchClickBankProducts(category: string, useLiveData: boolean = true): Promise<ClickBankProduct[]> {
    if (useLiveData) {
      console.log(`🚀 Using PostgreSQL live scraping for category: ${category}`)
      
      try {
        const result = await this.getLiveClickBankProductsEnhanced(category, 10)
        return result.products
      } catch (error) {
        console.error('❌ PostgreSQL live scraping failed, falling back to legacy API:', error)
        return this.fetchClickBankProductsLegacy(category)
      }
    } else {
      return this.fetchClickBankProductsLegacy(category)
    }
  }

  async getClickBankCategories(): Promise<ClickBankCategory[]> {
    const result = await this.getClickBankCategoriesFromDB()
    return result.categories
  }

  async refreshAllCategories(): Promise<Record<string, ClickBankProduct[]>> {
    console.log('🔄 Refreshing all ClickBank categories with PostgreSQL live data...')
    
    const result = await this.getAllCategoriesLiveWithPriority(8, 8) // 8 products from categories with priority >= 8
    
    // Transform the response to match your frontend expectations
    const categorizedProducts: Record<string, ClickBankProduct[]> = {}
    
    for (const [category, categoryData] of Object.entries(result.results)) {
      if (categoryData.products) {
        categorizedProducts[category] = categoryData.products.map((product: any, index: number) => ({
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
          created_at: product.scraped_at,
          data_source: 'postgresql_scraping',
          is_real_product: product.is_live_data,
          // PostgreSQL enhanced fields
          category_priority: categoryData.priority_level,
          target_audience: categoryData.target_audience,
          commission_range: categoryData.commission_range
        }))
      }
    }
    
    console.log(`✅ Refreshed ${Object.keys(categorizedProducts).length} categories with ${result.total_products_found} total products`)
    
    return categorizedProducts
  }

  async validateSalesPageURL(url: string): Promise<URLValidationResponse> {
    const response = await fetch(`${this.baseURL}/api/intelligence/clickbank/validate-sales-url?url=${encodeURIComponent(url)}`, {
      headers: this.getHeaders()
    })
    
    return this.handleResponse<URLValidationResponse>(response)
  }

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

  // Legacy ClickBank methods (for backward compatibility)
  private async fetchClickBankProductsLegacy(category: string): Promise<ClickBankProduct[]> {
    const response = await fetch(`${this.baseURL}/api/intelligence/clickbank/top-products?type=${category}&use_live_data=false`, {
      headers: this.getHeaders()
    })
    
    return this.handleResponse(response)
  }

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

  async getClickBankProductAnalysis(productId: string): Promise<ClickBankAnalysis> {
    const response = await fetch(`${this.baseURL}/api/intelligence/clickbank/products/${productId}/analysis`, {
      headers: this.getHeaders()
    })
    
    return this.handleResponse(response)
  }

  async addClickBankFavorite(productId: string, notes?: string): Promise<{message: string}> {
    const response = await fetch(`${this.baseURL}/api/intelligence/clickbank/favorites/${productId}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ notes })
    })
    
    return this.handleResponse(response)
  }

  async removeClickBankFavorite(productId: string): Promise<{message: string}> {
    const response = await fetch(`${this.baseURL}/api/intelligence/clickbank/favorites/${productId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    })
    
    return this.handleResponse(response)
  }

  async getClickBankFavorites(): Promise<ClickBankFavorite[]> {
    const response = await fetch(`${this.baseURL}/api/intelligence/clickbank/favorites`, {
      headers: this.getHeaders()
    })
    
    return this.handleResponse(response)
  }

  async createCampaignFromClickBank(campaignData: {
    title: string
    description: string
    clickbank_product_id: string
    selected_angles: string[]
    tone: string
    style: string
    settings: any
  }): Promise<Campaign> {
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
  // DASHBOARD METHODS (Enhanced with Demo Info)
  // ============================================================================

  async getDashboardStats(): Promise<{
    total_campaigns_created: number
    real_campaigns: number
    demo_campaigns: number
    active_campaigns: number
    draft_campaigns: number
    completed_campaigns: number
    total_sources: number
    total_content: number
    avg_completion: number
    recent_activity: any[]
    demo_system?: {
      demo_available: boolean
      user_demo_preference: boolean
      demo_visible_in_current_view: boolean
      can_toggle_demo: boolean
      helps_onboarding: boolean
      user_control: string
    }
    user_experience?: {
      is_new_user: boolean
      demo_recommended: boolean
      onboarding_complete: boolean
    }
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
    total_campaigns_created: number
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
    total_campaigns_created: number
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
  // AFFILIATE METHODS
  // ============================================================================

  async getAffiliatePreferences(): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/affiliate/preferences`, {
      headers: this.getHeaders()
    })
    
    if (response.status === 404) {
      return null
    }
    
    return this.handleResponse(response)
  }

  async saveAffiliatePreferences(preferences: any): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/affiliate/preferences`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(preferences)
    })
    
    return this.handleResponse(response)
  }

  async generateAffiliateLink(request: any): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/affiliate/generate-link`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request)
    })
    
    return this.handleResponse(response)
  }

  async trackAffiliateClick(clickData: any): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/affiliate/track-click`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(clickData)
    })
    
    return this.handleResponse(response)
  }

  async getAffiliatePerformance(days: number = 30): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/affiliate/performance?days=${days}`, {
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
// 🆕 NEW: DEMO PREFERENCE REACT HOOK
// ============================================================================

export function useDemoPreferences() {
  const [preferences, setPreferences] = useState<DemoPreference | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const api = useApi()

  const loadPreferences = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const prefs = await api.getDemoPreferences()
      setPreferences(prefs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preferences')
      console.error('Error loading demo preferences:', err)
    } finally {
      setIsLoading(false)
    }
  }, [api])

  const updatePreferences = useCallback(async (showDemo: boolean) => {
    try {
      setError(null)
      const updatedPrefs = await api.updateDemoPreferences(showDemo)
      setPreferences(updatedPrefs)
      return updatedPrefs
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences')
      throw err
    }
  }, [api])

  const toggleVisibility = useCallback(async () => {
    try {
      setError(null)
      const result = await api.toggleDemoVisibility()
      
      // Update local preferences
      if (preferences) {
        setPreferences({
          ...preferences,
          show_demo_campaigns: result.show_demo_campaigns
        })
      }
      
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle visibility')
      throw err
    }
  }, [api, preferences])

  useEffect(() => {
    loadPreferences()
  }, [loadPreferences])

  return {
    preferences,
    isLoading,
    error,
    updatePreferences,
    toggleVisibility,
    reload: loadPreferences
  }
}

// ============================================================================
// 🆕 NEW: DEMO CAMPAIGN UTILITY FUNCTIONS
// ============================================================================

export const demoUtils = {
  /**
   * Check if a campaign is a demo campaign
   */
  isDemoCampaign: (campaign: any): boolean => {
    return campaign?.is_demo === true
  },

  /**
   * Filter campaigns by type
   */
  filterCampaigns: (campaigns: any[], showDemo: boolean) => {
    if (showDemo) {
      return campaigns // Show all
    }
    return campaigns.filter(c => !demoUtils.isDemoCampaign(c)) // Hide demos
  },

  /**
   * Sort campaigns with smart demo positioning
   */
  sortCampaigns: (campaigns: any[], hasRealCampaigns: boolean) => {
    return campaigns.sort((a, b) => {
      const aIsDemo = demoUtils.isDemoCampaign(a)
      const bIsDemo = demoUtils.isDemoCampaign(b)
      
      if (hasRealCampaigns) {
        // Real campaigns first, then demos
        if (aIsDemo !== bIsDemo) {
          return aIsDemo ? 1 : -1
        }
      } else {
        // Demo campaigns first for new users
        if (aIsDemo !== bIsDemo) {
          return aIsDemo ? -1 : 1
        }
      }
      
      // Sort by updated_at within same type
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })
  },

  /**
   * Get demo campaign benefits text
   */
  getDemoBenefits: () => [
    "Reference high-quality analysis examples",
    "Compare your campaigns with best practices", 
    "Learn from professionally written content",
    "Great for training new team members",
    "See the full platform capabilities",
    "Perfect templates to inspire your own campaigns"
  ],

  /**
   * Get smart default for demo preference
   */
  getSmartDefault: (realCampaignsCount: number): boolean => {
    // Show demo for new users (0-2 real campaigns)
    // Hide demo for experienced users (3+ real campaigns)
    return realCampaignsCount < 3
  }
}

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
// REACT HOOK FOR API ACCESS (Enhanced)
// ============================================================================

export const useApi = () => {
  return {
    // Authentication
    login: apiClient.login.bind(apiClient),
    register: apiClient.register.bind(apiClient),
    logout: apiClient.logout.bind(apiClient),
    getUserProfile: apiClient.getUserProfile.bind(apiClient),
    
    // 🆕 NEW: Demo preference methods
    getDemoPreferences: apiClient.getDemoPreferences.bind(apiClient),
    updateDemoPreferences: apiClient.updateDemoPreferences.bind(apiClient),
    toggleDemoVisibility: apiClient.toggleDemoVisibility.bind(apiClient),
    getDemoManagementInfo: apiClient.getDemoManagementInfo.bind(apiClient),
    createDemoManually: apiClient.createDemoManually.bind(apiClient),
    getCampaignsWithDemo: apiClient.getCampaignsWithDemo.bind(apiClient),
    
    // Campaign operations (enhanced)
    createCampaign: apiClient.createCampaign.bind(apiClient),
    getCampaigns: apiClient.getCampaigns.bind(apiClient),
    getCampaign: apiClient.getCampaign.bind(apiClient),
    updateCampaign: apiClient.updateCampaign.bind(apiClient),
    deleteCampaign: apiClient.deleteCampaign.bind(apiClient),
    duplicateCampaign: apiClient.duplicateCampaign.bind(apiClient),
    
    // Content management
    getGeneratedContent: apiClient.getGeneratedContent.bind(apiClient),
    getContentList: apiClient.getContentList.bind(apiClient),
    getContentDetail: apiClient.getContentDetail.bind(apiClient),
    updateContent: apiClient.updateContent.bind(apiClient),
    deleteContent: apiClient.deleteContent.bind(apiClient),
    rateContent: apiClient.rateContent.bind(apiClient),
    publishContent: apiClient.publishContent.bind(apiClient),
    bulkContentAction: apiClient.bulkContentAction.bind(apiClient),
    getContentStats: apiClient.getContentStats.bind(apiClient),
    duplicateContent: apiClient.duplicateContent.bind(apiClient),
    
    // Workflow operations
    getWorkflowState: apiClient.getWorkflowState.bind(apiClient),
    setWorkflowPreference: apiClient.setWorkflowPreference.bind(apiClient),
    advanceCampaignStep: apiClient.advanceCampaignStep.bind(apiClient),
    saveProgress: apiClient.saveProgress.bind(apiClient),
    quickCompleteCampaign: apiClient.quickCompleteCampaign.bind(apiClient),
    
    // Intelligence operations
    analyzeURL: apiClient.analyzeURL.bind(apiClient),
    uploadDocument: apiClient.uploadDocument.bind(apiClient),
    generateContent: apiClient.generateContent.bind(apiClient),
    getCampaignIntelligence: apiClient.getCampaignIntelligence.bind(apiClient),
    
    // Dashboard (enhanced with demo info)
    getDashboardStats: apiClient.getDashboardStats.bind(apiClient),
    getCampaignStats: apiClient.getCampaignStats.bind(apiClient),
    getCompanyStats: apiClient.getCompanyStats.bind(apiClient),
    getCompanyDetails: apiClient.getCompanyDetails.bind(apiClient),
    
    // Token management
    setAuthToken: apiClient.setAuthToken.bind(apiClient),
    clearAuthToken: apiClient.clearAuthToken.bind(apiClient),

    // ✅ PRIMARY POSTGRESQL CLICKBANK METHODS
    getLiveClickBankProductsEnhanced: apiClient.getLiveClickBankProductsEnhanced.bind(apiClient),
    getClickBankCategoriesFromDB: apiClient.getClickBankCategoriesFromDB.bind(apiClient),
    getAllCategoriesLiveWithPriority: apiClient.getAllCategoriesLiveWithPriority.bind(apiClient),
    validateClickBankCategory: apiClient.validateClickBankCategory.bind(apiClient),
    getClickBankScrapingStatusEnhanced: apiClient.getClickBankScrapingStatusEnhanced.bind(apiClient),
    testClickBankConnectionEnhanced: apiClient.testClickBankConnectionEnhanced.bind(apiClient),
    
    // Convenience methods (use PostgreSQL under the hood)
    fetchClickBankProducts: apiClient.fetchClickBankProducts.bind(apiClient),
    getClickBankCategories: apiClient.getClickBankCategories.bind(apiClient),
    refreshAllCategories: apiClient.refreshAllCategories.bind(apiClient),
    validateSalesPageURL: apiClient.validateSalesPageURL.bind(apiClient),
    validateMultipleURLs: apiClient.validateMultipleURLs.bind(apiClient),
    
    // Legacy ClickBank methods (for backward compatibility)
    getClickBankProductsByCategory: apiClient.getClickBankProductsByCategory.bind(apiClient),
    analyzeClickBankProduct: apiClient.analyzeClickBankProduct.bind(apiClient),
    getClickBankProductAnalysis: apiClient.getClickBankProductAnalysis.bind(apiClient),
    addClickBankFavorite: apiClient.addClickBankFavorite.bind(apiClient),
    removeClickBankFavorite: apiClient.removeClickBankFavorite.bind(apiClient),
    getClickBankFavorites: apiClient.getClickBankFavorites.bind(apiClient),
    createCampaignFromClickBank: apiClient.createCampaignFromClickBank.bind(apiClient),

    // Affiliate methods
    getAffiliatePreferences: apiClient.getAffiliatePreferences.bind(apiClient),
    saveAffiliatePreferences: apiClient.saveAffiliatePreferences.bind(apiClient),
    generateAffiliateLink: apiClient.generateAffiliateLink.bind(apiClient),
    trackAffiliateClick: apiClient.trackAffiliateClick.bind(apiClient),
    getAffiliatePerformance: apiClient.getAffiliatePerformance.bind(apiClient)
  }
}

export default apiClient