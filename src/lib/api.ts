// src/lib/api.ts
/**
 * Centralized API client for CampaignForge
 * Handles all backend communication with proper error handling and typing
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://campaign-backend-production-e2db.up.railway.app'

// ============================================================================
// TYPES
// ============================================================================

interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

export interface Campaign {
  id: string
  title: string
  description: string
  keywords?: string[]  // NEW: Add keywords
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
  content?: any
  intelligence_count?: number
  generated_content_count?: number
  confidence_score?: number
  last_activity?: string
}

export interface IntelligenceSource {
  id: string
  source_title: string
  source_type: string
  confidence_score: number
  usage_count?: number
  created_at: string
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

// NEW: Enhanced Intelligence Types
export interface EnhancedSalesPageIntelligence {
  intelligence_id: string
  confidence_score: number
  source_url: string
  source_title: string
  analysis_timestamp: string
  
  // Core Intelligence Areas
  offer_analysis: {
    primary_offer: string
    pricing_strategy: string[]
    value_propositions: string[]
    guarantees: string[]
    bonuses: string[]
    urgency_tactics: string[]
    pricing_details?: {
      price_points: string[]
      payment_options: string[]
      discount_strategies: string[]
    }
  }
  
  psychology_analysis: {
    emotional_triggers: string[]
    persuasion_techniques: string[]
    social_proof_elements: string[]
    authority_indicators: string[]
    scarcity_elements: string[]
    cognitive_biases_used: string[]
  }
  
  content_strategy: {
    headline_patterns: string[]
    story_elements: string[]
    objection_handling: string[]
    call_to_action_analysis: string[]
    content_flow: string[]
    messaging_hierarchy: string[]
  }
  
  competitive_intelligence: {
    unique_differentiators: string[]
    market_gaps: string[]
    improvement_opportunities: string[]
    competitive_advantages: string[]
    weakness_analysis: string[]
  }
  
  // Video Sales Letter Detection
  vsl_analysis?: {
    has_video: boolean
    video_length_estimate: string
    video_type: 'vsl' | 'demo' | 'testimonial' | 'other'
    transcript_available: boolean
    key_video_elements: string[]
    video_url?: string
    thumbnail_analysis?: string[]
  }
  
  // Campaign Angle Generation
  campaign_angles: {
    primary_angle: string
    alternative_angles: string[]
    positioning_strategy: string
    target_audience_insights: string[]
    messaging_framework: string[]
    differentiation_strategy: string
  }
  
  // Actionable Insights
  actionable_insights: {
    immediate_opportunities: string[]
    content_creation_ideas: string[]
    campaign_strategies: string[]
    testing_recommendations: string[]
    implementation_priorities: string[]
  }
  
  // Technical Analysis
  technical_analysis?: {
    page_load_speed: string
    mobile_optimization: boolean
    conversion_elements: string[]
    trust_signals: string[]
    checkout_analysis?: string[]
  }
}

export interface VSLTranscriptionResult {
  transcript_id: string
  video_url: string
  transcript_text: string
  key_moments: {
    timestamp: string
    description: string
    importance_score: number
  }[]
  psychological_hooks: string[]
  offer_mentions: {
    timestamp: string
    offer_details: string
  }[]
  call_to_actions: {
    timestamp: string
    cta_text: string
    urgency_level: 'low' | 'medium' | 'high'
  }[]
}

export interface CampaignAngleRequest {
  campaign_id: string
  intelligence_sources: string[] // Array of intelligence_ids
  target_audience?: string
  industry?: string
  tone_preferences?: string[]
  unique_value_props?: string[]
  avoid_angles?: string[]
}

export interface MultiSourceIntelligence {
  campaign_id: string
  consolidated_intelligence: {
    top_opportunities: string[]
    consistent_patterns: string[]
    conflicting_insights: string[]
    confidence_weighted_insights: any
  }
  source_comparison: {
    intelligence_id: string
    source_url: string
    key_insights: string[]
    confidence_score: number
  }[]
  recommended_campaign_strategy: {
    primary_positioning: string
    messaging_pillars: string[]
    content_recommendations: string[]
    testing_priorities: string[]
  }
}

// ============================================================================
// CUSTOM ERROR CLASSES
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
      // Also set authToken for backward compatibility
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
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: this.defaultHeaders,
      body: JSON.stringify(credentials)
    })
    
    const result = await this.handleResponse<any>(response)
    
    // Store token
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
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: this.defaultHeaders,
      body: JSON.stringify(data)
    })
    
    return this.handleResponse(response)
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${this.baseURL}/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders()
      })
    } finally {
      this.clearAuthToken()
    }
  }

  // ============================================================================
  // USER PROFILE METHODS
  // ============================================================================

  async getUserProfile(): Promise<User> {
    const response = await fetch(`${this.baseURL}/auth/profile`, {
      headers: this.getHeaders()
    })
    
    return this.handleResponse<User>(response)
  }

  // ============================================================================
  // CAMPAIGN METHODS
  // ============================================================================

  async createCampaign(campaignData: {
    title: string
    description: string
    keywords?: string[]  // NEW: Add keywords support
    target_audience?: string
    campaign_type?: string  // Make optional
    tone?: string
    style?: string
    settings?: Record<string, any>
  }): Promise<Campaign> {
    // Set default campaign_type if not provided
    const dataWithDefaults = {
      campaign_type: 'social_media', // Backend default
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
  }): Promise<{
    campaigns: Campaign[]
    total: number
    page: number
    limit: number
  }> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.status_filter) searchParams.set('status_filter', params.status_filter)
    if (params?.search) searchParams.set('search', params.search)

    const response = await fetch(`${this.baseURL}/api/campaigns?${searchParams}`, {
      headers: this.getHeaders()
    })
    
    return this.handleResponse(response)
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

  // ============================================================================
  // INTELLIGENCE METHODS (EXISTING)
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
    const response = await fetch(`${this.baseURL}/api/intelligence/analyze-url`, {
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
    const response = await fetch(`${this.baseURL}/api/intelligence/generate-content`, {
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
    }
  }> {
    const response = await fetch(`${this.baseURL}/api/intelligence/campaign/${campaignId}/intelligence`, {
      headers: this.getHeaders()
    })
    
    return this.handleResponse(response)
  }

  // ============================================================================
  // ENHANCED INTELLIGENCE METHODS (NEW)
  // ============================================================================

  /**
   * Enhanced sales page analysis with comprehensive intelligence extraction
   */
  async analyzeSalesPageEnhanced(data: {
    url: string
    campaign_id: string
    analysis_depth?: 'basic' | 'comprehensive' | 'competitive'
    include_vsl_detection?: boolean
    custom_analysis_points?: string[]
  }): Promise<EnhancedSalesPageIntelligence> {
    const response = await fetch(`${this.baseURL}/api/intelligence/analyze-sales-page-enhanced`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        ...data,
        analysis_depth: data.analysis_depth || 'comprehensive',
        include_vsl_detection: data.include_vsl_detection ?? true
      })
    })
    
    return this.handleResponse<EnhancedSalesPageIntelligence>(response)
  }

  /**
   * Detect and analyze Video Sales Letters
   */
  async detectAndAnalyzeVSL(data: {
    url: string
    campaign_id: string
    extract_transcript?: boolean
    analyze_psychological_hooks?: boolean
  }): Promise<VSLTranscriptionResult> {
    const response = await fetch(`${this.baseURL}/api/intelligence/vsl-analysis`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        ...data,
        extract_transcript: data.extract_transcript ?? true,
        analyze_psychological_hooks: data.analyze_psychological_hooks ?? true
      })
    })
    
    return this.handleResponse<VSLTranscriptionResult>(response)
  }

  /**
   * Generate unique campaign angles based on intelligence
   */
  async generateCampaignAngles(data: CampaignAngleRequest): Promise<{
    primary_angle: {
      angle: string
      reasoning: string
      target_audience: string
      key_messages: string[]
      differentiation_points: string[]
    }
    alternative_angles: {
      angle: string
      reasoning: string
      strength_score: number
      use_case: string
    }[]
    positioning_strategy: {
      market_position: string
      competitive_advantage: string
      value_proposition: string
      messaging_framework: string[]
    }
    implementation_guide: {
      content_priorities: string[]
      channel_recommendations: string[]
      testing_suggestions: string[]
    }
  }> {
    const response = await fetch(`${this.baseURL}/api/intelligence/generate-campaign-angles`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    })
    
    return this.handleResponse(response)
  }

  /**
   * Consolidate intelligence from multiple sources
   */
  async consolidateMultiSourceIntelligence(campaignId: string, options?: {
    weight_by_confidence?: boolean
    include_conflicting_insights?: boolean
    generate_unified_strategy?: boolean
  }): Promise<MultiSourceIntelligence> {
    const response = await fetch(`${this.baseURL}/api/intelligence/consolidate/${campaignId}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(options || {})
    })
    
    return this.handleResponse<MultiSourceIntelligence>(response)
  }

  /**
   * Batch analyze multiple competitor URLs
   */
  async batchAnalyzeCompetitors(data: {
    urls: string[]
    campaign_id: string
    analysis_type?: 'quick' | 'detailed'
    compare_results?: boolean
  }): Promise<{
    analyses: EnhancedSalesPageIntelligence[]
    comparative_analysis: {
      common_strategies: string[]
      unique_approaches: {
        url: string
        unique_elements: string[]
      }[]
      market_gaps: string[]
      opportunity_matrix: {
        opportunity: string
        difficulty: 'low' | 'medium' | 'high'
        impact: 'low' | 'medium' | 'high'
      }[]
    }
  }> {
    const response = await fetch(`${this.baseURL}/api/intelligence/batch-analyze`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    })
    
    return this.handleResponse(response)
  }

  /**
   * Smart URL validation and pre-analysis
   */
  async validateAndPreAnalyzeURL(url: string): Promise<{
    is_valid: boolean
    is_accessible: boolean
    page_type: 'sales_page' | 'landing_page' | 'website' | 'blog' | 'social' | 'unknown'
    analysis_readiness: {
      content_extractable: boolean
      video_detected: boolean
      estimated_analysis_time: string
      confidence_prediction: number
    }
    optimization_suggestions: string[]
    analysis_recommendations: {
      recommended_analysis_type: string
      expected_insights: string[]
      potential_limitations: string[]
    }
  }> {
    const response = await fetch(`${this.baseURL}/api/intelligence/validate-url`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ url })
    })
    
    return this.handleResponse(response)
  }

  // ============================================================================
  // DASHBOARD METHODS
  // ============================================================================

  async getDashboardStats(): Promise<{
    credits_used_this_month: number
    credits_remaining: number
    total_campaigns: number
    active_campaigns: number
  }> {
    const response = await fetch(`${this.baseURL}/api/dashboard/stats`, {
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
    
    // Campaign operations
    createCampaign: apiClient.createCampaign.bind(apiClient),
    getCampaigns: apiClient.getCampaigns.bind(apiClient),
    getCampaign: apiClient.getCampaign.bind(apiClient),
    updateCampaign: apiClient.updateCampaign.bind(apiClient),
    deleteCampaign: apiClient.deleteCampaign.bind(apiClient),
    duplicateCampaign: apiClient.duplicateCampaign.bind(apiClient),
    
    // Intelligence operations (existing)
    analyzeURL: apiClient.analyzeURL.bind(apiClient),
    uploadDocument: apiClient.uploadDocument.bind(apiClient),
    generateContent: apiClient.generateContent.bind(apiClient),
    getCampaignIntelligence: apiClient.getCampaignIntelligence.bind(apiClient),
    
    // Enhanced intelligence operations (new)
    analyzeSalesPageEnhanced: apiClient.analyzeSalesPageEnhanced.bind(apiClient),
    detectAndAnalyzeVSL: apiClient.detectAndAnalyzeVSL.bind(apiClient),
    generateCampaignAngles: apiClient.generateCampaignAngles.bind(apiClient),
    consolidateMultiSourceIntelligence: apiClient.consolidateMultiSourceIntelligence.bind(apiClient),
    batchAnalyzeCompetitors: apiClient.batchAnalyzeCompetitors.bind(apiClient),
    validateAndPreAnalyzeURL: apiClient.validateAndPreAnalyzeURL.bind(apiClient),
    
    // Dashboard
    getDashboardStats: apiClient.getDashboardStats.bind(apiClient),
    getCompanyStats: apiClient.getCompanyStats.bind(apiClient),
    getCompanyDetails: apiClient.getCompanyDetails.bind(apiClient),
    
    // Token management
    setAuthToken: apiClient.setAuthToken.bind(apiClient),
    clearAuthToken: apiClient.clearAuthToken.bind(apiClient)
  }
}