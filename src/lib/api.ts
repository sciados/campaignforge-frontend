// src/lib/api.ts - Clean API Client for CampaignForge
/**
 * Streamlined API client with proper TypeScript support
 * Handles authentication, user types, and campaign management
 */

import { useState, useCallback, useEffect } from 'react'
import type { Campaign, CampaignCreateRequest } from './types/campaign'

const API_BASE_URL = 'https://campaign-backend-production-e2db.up.railway.app'

console.log('🔗 API Base URL:', API_BASE_URL)

// ============================================================================
// Response Types
// ============================================================================

export interface StandardResponse<T = any> {
  success: boolean
  status?: 'success' | 'error' | 'partial' | 'pending'
  message?: string
  data?: T
  config?: T
  error?: string
  error_code?: string
  timestamp?: string
  request_id?: string
  warnings?: string[]
}

export interface LegacyResponse<T = any> {
  data?: T
  message?: string
  error?: string
  [key: string]: any
}

export interface User {
  id: string
  email: string
  full_name: string
  user_type: string | null
  role: string
  user_type_display?: string
  onboarding_completed?: boolean
}

// ============================================================================
// API Error Classes
// ============================================================================

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class CreditError extends ApiError {
  constructor(message: string = 'Insufficient credits') {
    super(message, 402, 'INSUFFICIENT_CREDITS')
    this.name = 'CreditError'
  }
}

// ============================================================================
// Main API Client Class
// ============================================================================

export class ApiClient {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('authToken') || localStorage.getItem('access_token')
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    const token = this.getAuthToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    return headers
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      if (response.status === 401) {
        // Clear invalid tokens and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken')
          localStorage.removeItem('access_token')
          window.location.href = '/login'
        }
        throw new ApiError('Authentication required', 401, 'UNAUTHORIZED')
      }

      if (response.status === 402) {
        throw new CreditError()
      }

      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch {
        // Ignore JSON parse errors for error responses
      }

      throw new ApiError(errorMessage, response.status)
    }

    const data = await response.json()

    // Handle StandardResponse format
    if (typeof data === 'object' && data !== null && 'success' in data) {
      if (!data.success) {
        throw new ApiError(data.error || data.message || 'API call failed', response.status)
      }
      return data.data || data.config || data
    }

    // Handle direct data response
    return data
  }

  // ============================================================================
  // Authentication
  // ============================================================================

  async login(email: string, password: string): Promise<{ access_token: string; user: User }> {
    const response = await fetch(`${this.baseURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const data = await this.handleResponse<{ access_token: string; user: User }>(response)

    // Store token
    if (typeof window !== 'undefined' && data.access_token) {
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('authToken', data.access_token)
    }

    return data
  }

  async register(userData: {
    email: string
    password: string
    full_name: string
    user_type?: string
  }): Promise<{ access_token: string; user: User }> {
    const response = await fetch(`${this.baseURL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })

    return this.handleResponse(response)
  }

  async getProfile(): Promise<User> {
    const response = await fetch(`${this.baseURL}/api/auth/profile`, {
      headers: this.getHeaders()
    })

    return this.handleResponse(response)
  }

  async getUserProfile(): Promise<User> {
    // Alias for getProfile to match existing codebase usage
    return this.getProfile()
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${this.baseURL}/api/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders()
      })
    } catch (error) {
      console.warn('Logout API call failed:', error)
    } finally {
      // Always clear local tokens
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token')
        localStorage.removeItem('authToken')
      }
    }
  }

  // ============================================================================
  // User Type Configuration
  // ============================================================================

  async getUserTypeConfig(userType?: string): Promise<any> {
    console.log(`📊 API: Getting dashboard config for user type: "${userType}"`)

    // Get user type from profile if not provided
    if (!userType) {
      try {
        const profile = await this.getProfile()
        userType = profile.role === 'admin' ? 'admin' : profile.user_type
        console.log(`📊 API: Got user type from profile: "${userType}"`)
      } catch (error) {
        console.warn('🔍 Error getting profile, using fallback config:', error)
        userType = 'affiliate_marketer'
      }
    }

    try {
      let response: Response

      // For product creators, use the specific product creator dashboard endpoint
      if (userType === 'product_creator') {
        console.log(`📊 API: Calling product creator dashboard endpoint`)
        response = await fetch(`${this.baseURL}/api/admin/intelligence/product-creator/dashboard`, {
          headers: this.getHeaders()
        })
      } else {
        // For other user types, use the general dashboard config endpoint
        console.log(`📊 API: Calling general dashboard config endpoint`)
        response = await fetch(`${this.baseURL}/api/user-types/dashboard-config`, {
          headers: this.getHeaders()
        })
      }

      if (!response.ok) {
        console.warn(`📊 API: Dashboard config API failed (${response.status}), using fallback`)
        return this.getFallbackConfig(userType)
      }

      const responseData = await response.json()
      console.log(`📊 API: Dashboard config response:`, responseData)

      // Handle different response formats
      if (responseData.success && responseData.data) {
        // Product creator endpoint format
        return this.transformProductCreatorConfig(responseData.data)
      } else if (responseData.success && responseData.config) {
        // Standard dashboard config format
        return responseData.config
      } else if (responseData.data) {
        // Direct data format
        return responseData.data
      } else {
        console.warn(`📊 API: Unexpected response format, using fallback`)
        return this.getFallbackConfig(userType)
      }
    } catch (error) {
      console.warn(`📊 API: Dashboard config request failed:`, error)
      return this.getFallbackConfig(userType)
    }
  }

  private getFallbackConfig(userType: string) {
    const configs = {
      admin: {
        user_profile: {
          user_type_display: "Administrator",
          user_type: "admin",
          dashboard_route: "/admin",
          usage_summary: {
            campaigns: { used: 0, limit: 999999, percentage: 0 },
            analysis: { used: 0, limit: 999999, percentage: 0 }
          }
        },
        primary_widgets: ["users", "companies", "revenue", "settings"],
        dashboard_title: "Admin Dashboard",
        main_cta: "Manage Platform",
        theme_color: "red"
      },
      affiliate_marketer: {
        user_profile: {
          user_type_display: "Affiliate Marketer",
          user_type: "affiliate_marketer",
          dashboard_route: "/dashboard/affiliate",
          usage_summary: {
            campaigns: { used: 2, limit: 10, percentage: 20 },
            analysis: { used: 5, limit: 25, percentage: 20 }
          }
        },
        primary_widgets: ["campaigns", "analytics", "intelligence", "content"],
        dashboard_title: "Affiliate Command Center",
        main_cta: "Track Competitors",
        theme_color: "blue"
      },
      content_creator: {
        user_profile: {
          user_type_display: "Content Creator",
          user_type: "content_creator",
          dashboard_route: "/dashboard/creator",
          usage_summary: {
            campaigns: { used: 4, limit: 15, percentage: 27 },
            analysis: { used: 8, limit: 30, percentage: 27 }
          }
        },
        primary_widgets: ["content", "campaigns", "analytics", "intelligence"],
        dashboard_title: "Creator Studio Pro",
        main_cta: "Analyze Viral Content",
        theme_color: "purple"
      },
      business_owner: {
        user_profile: {
          user_type_display: "Business Owner",
          user_type: "business_owner",
          dashboard_route: "/dashboard/business",
          usage_summary: {
            campaigns: { used: 6, limit: 20, percentage: 30 },
            analysis: { used: 10, limit: 35, percentage: 29 }
          }
        },
        primary_widgets: ["campaigns", "intelligence", "analytics", "content"],
        dashboard_title: "Business Growth Hub",
        main_cta: "Generate Leads",
        theme_color: "green"
      },
      product_creator: {
        user_profile: {
          user_type_display: "Product Creator",
          user_type: "product_creator",
          dashboard_route: "/dashboard/product-creator",
          usage_summary: {
            campaigns: { used: 0, limit: 50, percentage: 0 },
            analysis: { used: 0, limit: 5000, percentage: 0 }
          }
        },
        primary_widgets: ["url_submission", "content_library", "analytics", "submissions"],
        dashboard_title: "Product Creator Hub",
        main_cta: "Submit Sales Page",
        theme_color: "emerald"
      }
    }

    const config = configs[userType as keyof typeof configs] || configs.affiliate_marketer
    console.log(`📊 API: Using fallback config for user type: "${userType}"`)
    return config
  }

  private transformProductCreatorConfig(apiData: any) {
    console.log(`📊 API: Transforming product creator API data:`, apiData)

    return {
      user_profile: {
        user_type_display: "Product Creator",
        user_type: "product_creator",
        dashboard_route: "/dashboard/product-creator",
        usage_summary: {
          campaigns: {
            used: apiData.submission_stats?.total_submitted || 0,
            limit: apiData.restrictions?.max_url_submissions || 50,
            percentage: 0
          },
          analysis: {
            used: apiData.submission_stats?.total_submitted || 0,
            limit: 5000,
            percentage: 0
          }
        }
      },
      primary_widgets: ["url_submission", "content_library", "analytics", "submissions"],
      dashboard_title: "Product Creator Hub",
      main_cta: "Submit Sales Page",
      theme_color: "emerald",
      restrictions: apiData.restrictions,
      submission_stats: apiData.submission_stats,
      available_tools: apiData.available_tools
    }
  }

  // ============================================================================
  // User Type Management
  // ============================================================================

  async selectUserType(userType: string): Promise<User> {
    const response = await fetch(`${this.baseURL}/api/user-types/select`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ user_type: userType })
    })

    return this.handleResponse(response)
  }

  async completeOnboarding(goals: string[], experienceLevel: string): Promise<User> {
    const response = await fetch(`${this.baseURL}/api/users/complete-onboarding`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        goals,
        experience_level: experienceLevel,
        onboarding_completed: true
      })
    })

    return this.handleResponse(response)
  }

  // ============================================================================
  // Campaign Management
  // ============================================================================

  async createCampaign(data: CampaignCreateRequest): Promise<Campaign> {
    const response = await fetch(`${this.baseURL}/api/campaigns/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    })

    return this.handleResponse(response)
  }

  async getCampaigns(options: { limit?: number } = {}): Promise<Campaign[]> {
    const searchParams = new URLSearchParams()
    if (options.limit) searchParams.append('limit', options.limit.toString())

    const url = `${this.baseURL}/api/campaigns/${searchParams.toString() ? '?' + searchParams.toString() : ''}`
    const response = await fetch(url, {
      headers: this.getHeaders()
    })

    return this.handleResponse(response)
  }

  async getCampaign(id: string): Promise<Campaign> {
    const response = await fetch(`${this.baseURL}/api/campaigns/${id}`, {
      headers: this.getHeaders()
    })

    return this.handleResponse(response)
  }

  async deleteCampaign(id: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/campaigns/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    })

    await this.handleResponse(response)
  }

  async duplicateCampaign(id: string): Promise<Campaign> {
    const response = await fetch(`${this.baseURL}/api/campaigns/${id}/duplicate`, {
      method: 'POST',
      headers: this.getHeaders()
    })

    return this.handleResponse(response)
  }

  // ============================================================================
  // Intelligence & Analysis
  // ============================================================================

  async analyzeUrl(url: string, analysisMethod: string = 'ENHANCED'): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/intelligence/analyze`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        url,
        analysis_method: analysisMethod
      })
    })

    return this.handleResponse(response)
  }

  async analyzeURL(url: string, analysisMethod: string = 'ENHANCED'): Promise<any> {
    // Alias for analyzeUrl to match existing codebase usage
    return this.analyzeUrl(url, analysisMethod)
  }

  async runIntelligenceAnalysis(data: any): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/intelligence/analyze`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    })

    return this.handleResponse(response)
  }

  async getRecommendedPlatforms(): Promise<{ recommended_platforms: string[] }> {
    const response = await fetch(`${this.baseURL}/api/intelligence/recommended-platforms`, {
      headers: this.getHeaders()
    })

    return this.handleResponse(response)
  }

  async getWorkflowState(campaignId: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/campaigns/${campaignId}/workflow`, {
      headers: this.getHeaders()
    })

    return this.handleResponse(response)
  }

  // ============================================================================
  // Content Generation
  // ============================================================================

  async generateContent(contentType: string, intelligenceId: string, options: any = {}): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/content/generate`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        content_type: contentType,
        intelligence_id: intelligenceId,
        ...options
      })
    })

    return this.handleResponse(response)
  }

  async getGeneratedContent(campaignId: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/content/campaigns/${campaignId}/content`, {
      headers: this.getHeaders()
    })

    return this.handleResponse(response)
  }

  // ============================================================================
  // Demo & User Preferences
  // ============================================================================

  async createDemoManually(): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/demo/create`, {
      method: 'POST',
      headers: this.getHeaders()
    })

    return this.handleResponse(response)
  }

  async getDemoPreferences(): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/demo/preferences`, {
      headers: this.getHeaders()
    })

    return this.handleResponse(response)
  }

  async toggleDemoVisibility(visible: boolean): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/demo/visibility`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ visible })
    })

    return this.handleResponse(response)
  }

  // ============================================================================
  // File Upload & Storage
  // ============================================================================

  async uploadDocument(file: File): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${this.baseURL}/api/storage/upload`, {
      method: 'POST',
      headers: {
        Authorization: this.getHeaders().Authorization as string,
        // Don't set Content-Type for FormData - browser will set it with boundary
      },
      body: formData
    })

    return this.handleResponse(response)
  }

  // ============================================================================
  // Social Media Integration
  // ============================================================================

  async addSocialProfile(platform: string, data: any): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/user-social/profiles`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        platform,
        ...data
      })
    })

    return this.handleResponse(response)
  }
}

// ============================================================================
// Singleton Instance & Hook
// ============================================================================

const apiClient = new ApiClient()

export const useApi = () => {
  return {
    // Authentication
    login: apiClient.login.bind(apiClient),
    register: apiClient.register.bind(apiClient),
    getProfile: apiClient.getProfile.bind(apiClient),
    getUserProfile: apiClient.getUserProfile.bind(apiClient),
    logout: apiClient.logout.bind(apiClient),

    // User Type Management
    getUserTypeConfig: apiClient.getUserTypeConfig.bind(apiClient),
    selectUserType: apiClient.selectUserType.bind(apiClient),
    completeOnboarding: apiClient.completeOnboarding.bind(apiClient),

    // Campaign Management
    createCampaign: apiClient.createCampaign.bind(apiClient),
    getCampaigns: apiClient.getCampaigns.bind(apiClient),
    getCampaign: apiClient.getCampaign.bind(apiClient),
    deleteCampaign: apiClient.deleteCampaign.bind(apiClient),
    duplicateCampaign: apiClient.duplicateCampaign.bind(apiClient),
    getWorkflowState: apiClient.getWorkflowState.bind(apiClient),

    // Intelligence & Analysis
    analyzeUrl: apiClient.analyzeUrl.bind(apiClient),
    analyzeURL: apiClient.analyzeURL.bind(apiClient),
    runIntelligenceAnalysis: apiClient.runIntelligenceAnalysis.bind(apiClient),
    getRecommendedPlatforms: apiClient.getRecommendedPlatforms.bind(apiClient),

    // Content Generation
    generateContent: apiClient.generateContent.bind(apiClient),
    getGeneratedContent: apiClient.getGeneratedContent.bind(apiClient),

    // Demo & User Preferences
    createDemoManually: apiClient.createDemoManually.bind(apiClient),
    getDemoPreferences: apiClient.getDemoPreferences.bind(apiClient),
    toggleDemoVisibility: apiClient.toggleDemoVisibility.bind(apiClient),

    // File Upload & Storage
    uploadDocument: apiClient.uploadDocument.bind(apiClient),

    // Social Media Integration
    addSocialProfile: apiClient.addSocialProfile.bind(apiClient),
  }
}

// Export the client instance for direct use
export default apiClient

// Re-export types for convenience
export type { Campaign, CampaignCreateRequest }