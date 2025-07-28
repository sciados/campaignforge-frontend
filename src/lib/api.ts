// src/lib/api.ts - ENHANCED WITH DEMO PREFERENCE CONTROL & NEW WORKFLOW SUPPORT
/**
 * Enhanced API client for CampaignForge with streamlined 2-step workflow
 * 🆕 NEW: Demo preference management system with smart user control
 * 🔧 FIXED: Updated for streamlined 2-step workflow with auto-analysis
 */

import { useState, useCallback, useEffect } from 'react'

const API_BASE_URL = 'https://campaign-backend-production-e2db.up.railway.app'

console.log('🔍 Environment check:')
console.log('- process.env.NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL)
console.log('- API_BASE_URL being used:', API_BASE_URL)
console.log('- Window location:', typeof window !== 'undefined' ? window.location.href : 'SSR')

// ============================================================================
// 🔧 UPDATED TYPES FOR NEW WORKFLOW
// ============================================================================

export interface Campaign {
  generated_content_count: number
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
  
  // 🆕 NEW: Auto-Analysis Fields (matching backend CampaignResponse)
  salespage_url?: string
  auto_analysis_enabled?: boolean
  auto_analysis_status?: string
  analysis_confidence_score?: number
  
  // Enhanced workflow fields for 2-step process
  workflow_state?: string
  completion_percentage?: number
  sources_count?: number
  intelligence_count?: number
  content_count?: number
  total_steps?: number
  
  // 🆕 NEW: Auto-analysis workflow fields
  content_types?: string[]
  content_tone?: string
  content_style?: string
  generate_content_after_analysis?: boolean
  
  // Demo campaign fields
  is_demo?: boolean
  
  // Legacy fields for backward compatibility
  content?: any
  confidence_score?: number
  last_activity?: string
}

// 🔧 UPDATED: Campaign creation interface
interface CampaignCreateData {
  title: string
  description?: string
  keywords?: string[]
  target_audience?: string
  tone?: string
  style?: string
  
  // 🆕 NEW: Auto-Analysis Fields for streamlined workflow
  salespage_url?: string
  auto_analysis_enabled?: boolean
  content_types?: string[]
  content_tone?: string
  content_style?: string
  generate_content_after_analysis?: boolean
  
  settings?: Record<string, any>
}

// Demo Preference Types
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

// 🔧 UPDATED: Workflow State for 2-step process
export interface WorkflowStateResponse {
  campaign_id: string
  workflow_state: string
  completion_percentage: number
  total_steps: number  // Should be 2 for streamlined workflow
  current_step: number
  
  metrics: {
    sources_count: number
    intelligence_count: number
    content_count: number
  }
  
  auto_analysis: {
    enabled: boolean
    status: string
    confidence_score: number
    url?: string
    started_at?: string
    completed_at?: string
    error_message?: string
  }
  
  next_steps: Array<{
    action: string
    label: string
    description: string
    priority: string
  }>
  
  can_analyze: boolean
  can_generate_content: boolean
  is_demo: boolean
  step_states: Record<string, any>
  created_at: string
  updated_at: string
}

// 🆕 NEW: Workflow progress data for save progress
export interface WorkflowProgressData {
  workflow_state?: string
  completion_percentage?: number
  step_data?: Record<string, any>
  auto_analysis_enabled?: boolean
  generate_content_after_analysis?: boolean
}

// 🔧 UPDATED: Campaign Intelligence Response
export interface CampaignIntelligenceResponse {
  campaign_id: string
  intelligence_entries: Array<{
    id: string
    source_type: string
    source_url?: string
    source_title?: string
    confidence_score: number
    analysis_status: string
    offer_intelligence: Record<string, any>
    psychology_intelligence: Record<string, any>
    processing_metadata: Record<string, any>
    created_at: string
    updated_at?: string
  }>
  pagination: {
    skip: number
    limit: number
    total: number
    returned: number
  }
  summary: {
    total_intelligence_entries: number
    available_types: string[]
    campaign_title: string
    auto_analysis_status: string
    analysis_confidence_score: number
  }
  is_demo: boolean
}

// Legacy WorkflowState interface (for backward compatibility)
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
// API CLIENT CLASS (Enhanced with Demo Preferences & New Workflow)
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
  // 🆕 DEMO PREFERENCE MANAGEMENT METHODS
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
  // 🔧 UPDATED CAMPAIGN METHODS FOR NEW WORKFLOW
  // ============================================================================

  async createCampaign(campaignData: CampaignCreateData): Promise<Campaign> {
    const dataWithDefaults = {
      campaign_type: 'universal',
      // 🆕 NEW: Auto-analysis defaults for streamlined workflow
      auto_analysis_enabled: campaignData.auto_analysis_enabled ?? true,
      content_types: campaignData.content_types || ["email", "social_post", "ad_copy"],
      content_tone: campaignData.content_tone || "conversational",
      content_style: campaignData.content_style || "modern",
      generate_content_after_analysis: campaignData.generate_content_after_analysis ?? false,
      ...campaignData
    }
    
    console.log('🚀 Creating campaign with streamlined workflow data:', dataWithDefaults)
    
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
      
      // Add helpful logging for demo campaigns and new workflow
      if (Array.isArray(data)) {
        const demoCampaigns = data.filter((c: any) => c.is_demo)
        const realCampaigns = data.filter((c: any) => !c.is_demo)
        const autoAnalysisEnabled = data.filter((c: any) => c.auto_analysis_enabled).length
        
        console.log(`📊 Campaigns loaded: ${realCampaigns.length} real, ${demoCampaigns.length} demo`)
        console.log(`🔬 Auto-analysis enabled: ${autoAnalysisEnabled}/${data.length} campaigns`)
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
  // 🔧 UPDATED WORKFLOW METHODS FOR 2-STEP PROCESS
  // ============================================================================

  async getWorkflowState(campaignId: string): Promise<WorkflowStateResponse> {
    const response = await fetch(`${this.baseURL}/api/campaigns/${campaignId}/workflow-state`, {
      headers: this.getHeaders()
    })
    
    return this.handleResponse<WorkflowStateResponse>(response)
  }

  // 🆕 NEW: Save workflow progress for streamlined workflow
  async saveWorkflowProgress(campaignId: string, progressData: WorkflowProgressData): Promise<{
    success: boolean
    message: string
    campaign_id: string
    updated_workflow_state: string
    completion_percentage: number
    step_states: Record<string, any>
    auto_analysis_status: string
    updated_at: string
    is_demo: boolean
  }> {
    const response = await fetch(`${this.baseURL}/api/campaigns/${campaignId}/workflow/save-progress`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(progressData)
    })
    
    return this.handleResponse(response)
  }

  // Legacy workflow methods (for backward compatibility)
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
  // 🔧 UPDATED INTELLIGENCE METHODS
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

  // 🔧 UPDATED: Campaign intelligence method with proper parameters
  async getCampaignIntelligence(
    campaignId: string, 
    skip: number = 0, 
    limit: number = 50,
    intelligenceType?: string
  ): Promise<CampaignIntelligenceResponse> {
    const params = new URLSearchParams()
    params.set('skip', skip.toString())
    params.set('limit', limit.toString())
    if (intelligenceType) params.set('intelligence_type', intelligenceType)
    
    const response = await fetch(`${this.baseURL}/api/campaigns/${campaignId}/intelligence?${params}`, {
      headers: this.getHeaders()
    })
    
    return this.handleResponse<CampaignIntelligenceResponse>(response)
  }

  // ============================================================================
  // 🔧 UPDATED DASHBOARD METHODS (Enhanced with Demo Info & New Workflow)
  // ============================================================================

  async getDashboardStats(): Promise<{
    total_campaigns_created: number
    real_campaigns: number
    demo_campaigns: number
    workflow_type: string
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
    // 🔧 FIXED: Use correct endpoint path matching backend
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
// 🔧 UPDATED REACT HOOK FOR API ACCESS (Enhanced with New Workflow)
// ============================================================================

export const useApi = () => {
  return {
    // Authentication
    login: apiClient.login.bind(apiClient),
    register: apiClient.register.bind(apiClient),
    logout: apiClient.logout.bind(apiClient),
    getUserProfile: apiClient.getUserProfile.bind(apiClient),
    
    // 🆕 Demo preference methods
    getDemoPreferences: apiClient.getDemoPreferences.bind(apiClient),
    updateDemoPreferences: apiClient.updateDemoPreferences.bind(apiClient),
    toggleDemoVisibility: apiClient.toggleDemoVisibility.bind(apiClient),
    getDemoManagementInfo: apiClient.getDemoManagementInfo.bind(apiClient),
    createDemoManually: apiClient.createDemoManually.bind(apiClient),
    getCampaignsWithDemo: apiClient.getCampaignsWithDemo.bind(apiClient),
    
    // 🔧 Campaign operations (enhanced for new workflow)
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
    
    // 🔧 Workflow operations (updated for 2-step process)
    getWorkflowState: apiClient.getWorkflowState.bind(apiClient),
    saveWorkflowProgress: apiClient.saveWorkflowProgress.bind(apiClient),
    
    // Legacy workflow methods (for backward compatibility)
    setWorkflowPreference: apiClient.setWorkflowPreference.bind(apiClient),
    advanceCampaignStep: apiClient.advanceCampaignStep.bind(apiClient),
    saveProgress: apiClient.saveProgress.bind(apiClient),
    quickCompleteCampaign: apiClient.quickCompleteCampaign.bind(apiClient),
    
    // 🔧 Intelligence operations (updated)
    analyzeURL: apiClient.analyzeURL.bind(apiClient),
    uploadDocument: apiClient.uploadDocument.bind(apiClient),
    generateContent: apiClient.generateContent.bind(apiClient),
    getCampaignIntelligence: apiClient.getCampaignIntelligence.bind(apiClient),
    
    // 🔧 Dashboard (enhanced with demo info & new workflow)
    getDashboardStats: apiClient.getDashboardStats.bind(apiClient),
    getCampaignStats: apiClient.getCampaignStats.bind(apiClient),
    getCompanyStats: apiClient.getCompanyStats.bind(apiClient),
    getCompanyDetails: apiClient.getCompanyDetails.bind(apiClient),
    
    // Token management
    setAuthToken: apiClient.setAuthToken.bind(apiClient),
    clearAuthToken: apiClient.clearAuthToken.bind(apiClient),

    // Affiliate methods
    getAffiliatePreferences: apiClient.getAffiliatePreferences.bind(apiClient),
    saveAffiliatePreferences: apiClient.saveAffiliatePreferences.bind(apiClient),
    generateAffiliateLink: apiClient.generateAffiliateLink.bind(apiClient),
    trackAffiliateClick: apiClient.trackAffiliateClick.bind(apiClient),
    getAffiliatePerformance: apiClient.getAffiliatePerformance.bind(apiClient)
  }
}

export default apiClient