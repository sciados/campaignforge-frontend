// src/lib/api.ts
/**
 * Enhanced API client for CampaignForge with flexible workflow support
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://campaign-backend-production-e2db.up.railway.app'

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

  async getUserProfile(): Promise<User> {
    const response = await fetch(`${this.baseURL}/auth/profile`, {
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
  // DASHBOARD METHODS
  // ============================================================================

  async getDashboardStats(): Promise<{
    credits_used_this_month: number
    credits_remaining: number
    total_campaigns: number
    active_campaigns: number
  }> {
    const response = await fetch(`${this.baseURL}/api/campaigns/dashboard/stats`, {
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
    
    // Enhanced campaign operations
    createCampaign: apiClient.createCampaign.bind(apiClient),
    getCampaigns: apiClient.getCampaigns.bind(apiClient),
    getCampaign: apiClient.getCampaign.bind(apiClient),
    updateCampaign: apiClient.updateCampaign.bind(apiClient),
    deleteCampaign: apiClient.deleteCampaign.bind(apiClient),
    duplicateCampaign: apiClient.duplicateCampaign.bind(apiClient),
    
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
    
    // Dashboard
    getDashboardStats: apiClient.getDashboardStats.bind(apiClient),
    getCompanyStats: apiClient.getCompanyStats.bind(apiClient),
    getCompanyDetails: apiClient.getCompanyDetails.bind(apiClient),
    
    // Token management
    setAuthToken: apiClient.setAuthToken.bind(apiClient),
    clearAuthToken: apiClient.clearAuthToken.bind(apiClient)
  }
}