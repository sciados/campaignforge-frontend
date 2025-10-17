// src/lib/api.ts - Clean API Client for CampaignForge
/**
 * Streamlined API client with proper TypeScript support
 * Handles authentication, user types, and campaign management
 * ENHANCED: Added platform-specific image generation methods
 */

import { useState, useCallback, useEffect, useMemo } from 'react'
import type { Campaign, CampaignCreateRequest } from './types/campaign'
import type {
  CampaignGenerationRequest,
  CompleteCampaign,
  CampaignPublishRequest,
  CampaignPublishingResult,
  PublishingTimeline,
  PlatformIntegration,
  OAuthFlowResult,
  PublishResult,
  TextGenerationRequest,
  ImageGenerationRequest,
  VideoGenerationRequest,
  GeneratedContent,
  UsageAnalytics,
  GenerationHistory,
  // ENHANCED: Import platform-specific image types (if they exist in modular.ts)
  PlatformImageRequest,
  MultiPlatformImageRequest,
  PlatformSpec
} from './types/modular'

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
  company?: {
    id: string
    company_name: string
    company_slug: string
    subscription_tier: string
    monthly_credits_used?: number
    monthly_credits_limit?: number
    company_size?: string
  }
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
// Clickbank Auto Daily Update
// ============================================================================

export async function connectClickBank(nickname: string, apiKey: string) {
  const token = localStorage.getItem('authToken')

  return fetch(`${API_BASE_URL}/api/clickbank/connect`, {
    method: "POST",
    body: JSON.stringify({ nickname, api_key: apiKey }),
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  }).then(res => res.json());
}

export async function getClickBankCredentials() {
  const token = localStorage.getItem('authToken')

  return fetch(`${API_BASE_URL}/api/clickbank/credentials`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }).then(res => res.json());
}

export async function getClickBankSales(days: number = 30) {
  return fetch(`/api/clickbank/sales?user_id=1&days=${days}`) // replace with logged-in user_id
    .then(res => res.json());
}

// ============================================================================
// Analytics API Functions
// ============================================================================

export async function getAnalyticsDashboard() {
  const token = localStorage.getItem('authToken')

  return fetch(`${API_BASE_URL}/api/analytics/dashboard`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  }).then(res => res.json());
}

export async function refreshAnalytics(platform?: string, days: number = 30) {
  const token = localStorage.getItem('authToken')

  return fetch(`${API_BASE_URL}/api/analytics/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      platform: platform || null,
      days
    })
  }).then(res => res.json());
}

export async function getPlatformAnalytics(platform: string, days: number = 30) {
  const token = localStorage.getItem('authToken')

  return fetch(`${API_BASE_URL}/api/analytics/platforms/${platform}?days=${days}`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  }).then(res => res.json());
}

export async function getProductAnalytics(platform?: string, productId?: string) {
  const token = localStorage.getItem('authToken')
  const params = new URLSearchParams()
  if (platform) params.append('platform', platform)
  if (productId) params.append('product_id', productId)

  return fetch(`${API_BASE_URL}/api/analytics/products?${params.toString()}`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  }).then(res => res.json());
}

// ============================================================================
// CampaignForge Value Attribution API Functions
// ============================================================================

export async function trackCampaignUsage(data: {
  campaign_id: string;
  affiliate_user_id: string;
  product_sku: string;
  platform: string;
  content_types_used: string[];
  ai_features_used: string[];
}) {
  const token = localStorage.getItem('authToken')

  return fetch(`${API_BASE_URL}/api/intelligence/track-campaign-usage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data)
  }).then(res => res.json());
}

export async function trackPerformanceAttribution(data: {
  campaign_id: string;
  performance_metrics: Record<string, any>;
  attribution_markers: Record<string, any>;
}) {
  const token = localStorage.getItem('authToken')

  return fetch(`${API_BASE_URL}/api/intelligence/track-performance-attribution`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data)
  }).then(res => res.json());
}

export async function getCreatorValueReport(creatorUserId: string, days: number = 30) {
  const token = localStorage.getItem('authToken')

  return fetch(`${API_BASE_URL}/api/intelligence/creator-value-report/${creatorUserId}?days=${days}`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  }).then(res => res.json());
}

export async function getPlatformEffectivenessMetrics(creatorUserId: string) {
  const token = localStorage.getItem('authToken')

  return fetch(`${API_BASE_URL}/api/intelligence/platform-effectiveness-metrics/${creatorUserId}`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  }).then(res => res.json());
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
  // Generic HTTP Methods
  // ============================================================================

  async get<T = any>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders()
    })

    return this.handleResponse<T>(response)
  }

  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined
    })

    return this.handleResponse<T>(response)
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
        userType = profile.role === 'admin' ? 'admin' : (profile.user_type || undefined)
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
        // For other user types, use fallback config directly (no backend endpoint exists)
        console.log(`📊 API: Using fallback config for user type: ${userType}`)
        return this.getFallbackConfig(userType || 'affiliate_marketer')
      }

      if (!response.ok) {
        console.warn(`📊 API: Dashboard config API failed (${response.status}), using fallback`)
        return this.getFallbackConfig(userType || 'affiliate_marketer')
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
        return this.getFallbackConfig(userType || 'affiliate_marketer')
      }
    } catch (error) {
      console.warn(`📊 API: Dashboard config request failed:`, error)
      return this.getFallbackConfig(userType || 'affiliate_marketer')
    }
  }

  private getFallbackConfig(userType: string) {
    const configs = {
      admin: {
        user_profile: {
          user_type_display: "Administrator",
          user_type: "admin",
          dashboard_route: "/admin",
          welcome_message: "Welcome to the Admin Dashboard. Manage your platform effectively.",
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
          welcome_message: "Welcome to your Affiliate Command Center. Find and promote winning products!",
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
          welcome_message: "Welcome to Creator Studio Pro. Create viral content that converts!",
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
          welcome_message: "Welcome to your Business Growth Hub. Scale your business with AI insights!",
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
          welcome_message: "Welcome to your Product Creator Hub! Submit your sales pages for analysis and generate high-converting content.",
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
        welcome_message: `Welcome back, ${apiData.user_email || 'Product Creator'}! Ready to optimize your sales pages?`,
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
      usage_stats: {
        urls_submitted: apiData.submission_stats?.total_submitted || 0,
        max_urls_allowed: apiData.restrictions?.max_url_submissions || 50,
        remaining_urls: (apiData.restrictions?.max_url_submissions || 50) - (apiData.submission_stats?.total_submitted || 0),
        usage_percentage: Math.round(((apiData.submission_stats?.total_submitted || 0) / (apiData.restrictions?.max_url_submissions || 50)) * 100)
      },
      recent_activity: apiData.recent_activity || [],
      available_tools: apiData.available_tools || [],
      dashboard_config: {
        dashboard_type: "product_creator",
        show_billing: true,
        show_analytics: true,
        show_campaigns: false,
        show_content_generation: true,
        show_intelligence_analysis: true,
        primary_actions: ["url_submission", "content_generation"],
        restricted_features: [],
        welcome_message: `Welcome back, ${apiData.user_email || 'Product Creator'}! Ready to optimize your sales pages?`,
        help_links: [
          { title: "Getting Started", url: "/help/getting-started" },
          { title: "URL Submission Guide", url: "/help/url-submission" }
        ]
      },
      primary_widgets: ["url_submission", "content_library", "analytics", "submissions"],
      dashboard_title: "Product Creator Hub",
      main_cta: "Submit Sales Page",
      theme_color: "emerald",
      restrictions: apiData.restrictions,
      submission_stats: apiData.submission_stats
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
  // Campaign Orchestration & Automation
  // ============================================================================

  async generateCompleteCampaign(request: CampaignGenerationRequest): Promise<CompleteCampaign> {
    console.log('🚀 API: Generating complete campaign (using existing backend + simulation)')
    try {
      // For now, create a campaign and simulate orchestration
      const campaign = await this.createCampaign({
        title: request.title,
        description: request.description,
        campaign_type: request.campaign_type || 'affiliate_promotion',
        target_audience: request.target_audience,
        keywords: request.key_messages
      })

      // Simulate complete campaign response
      return {
        campaign_id: campaign.id,
        strategy: {
          campaign_type: request.campaign_type,
          target_audience: { demographics: {}, interests: [], behaviors: [], pain_points: [], preferred_platforms: request.platforms },
          key_messages: request.key_messages || [],
          content_themes: ['awareness', 'engagement', 'conversion'],
          platform_strategy: {},
          timeline_strategy: { posting_schedule: 'daily', peak_engagement_times: [], campaign_phases: [] },
          success_metrics: { primary_kpis: ['reach', 'engagement'], engagement_targets: {}, conversion_goals: {} },
          performance_prediction: { estimated_reach: 50000, estimated_engagement: 3500, estimated_conversions: 150, confidence_score: 0.85 }
        },
        content_calendar: {
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + request.duration_days * 24 * 60 * 60 * 1000).toISOString(),
          items: [],
          total_content_pieces: request.duration_days * 2,
          content_distribution: { by_type: {}, by_platform: {}, by_date: {} }
        },
        content: { items: {}, total_pieces: 0, content_distribution: { by_type: {}, by_platform: {}, by_date: {} }, brand_consistency_score: 0.9 },
        timeline: { items: [], total_posts: 0, platform_distribution: {}, estimated_reach: 50000, optimization_score: 0.85 },
        estimated_performance: { estimated_reach: 50000, estimated_engagement: 3500, estimated_conversions: 150, confidence_score: 0.85 }
      }
    } catch (error) {
      console.error('Campaign generation failed:', error)
      throw error
    }
  }

  async publishCampaign(campaignId: string, publishRequest: CampaignPublishRequest): Promise<CampaignPublishingResult> {
    console.log('📤 API: Publishing complete campaign (simulation)')
    // Simulate publishing result until backend endpoint is available
    return {
      campaign_id: campaignId,
      total_items: 10,
      successful_items: 8,
      failed_items: 2,
      results: [],
      failed_timeline_items: []
    }
  }

  async getCampaignTimeline(campaignId: string): Promise<PublishingTimeline> {
    console.log('📅 API: Fetching campaign timeline (simulation)')
    // Simulate timeline until backend endpoint is available
    return {
      items: [],
      total_posts: 0,
      platform_distribution: {},
      estimated_reach: 50000,
      optimization_score: 0.85
    }
  }

  async updateCampaignTimeline(campaignId: string, timeline: PublishingTimeline): Promise<PublishingTimeline> {
    console.log('📝 API: Updating campaign timeline (simulation)')
    // Return the updated timeline until backend endpoint is available
    return timeline
  }

  // ============================================================================
  // Platform Integration & OAuth
  // ============================================================================

  async getPlatformIntegrations(): Promise<PlatformIntegration[]> {
    console.log('🔗 API: Fetching platform integrations')
    const response = await fetch(`${this.baseURL}/api/integrations/platforms`, {
      headers: this.getHeaders()
    })
    return this.handleResponse<PlatformIntegration[]>(response)
  }

  async initiatePlatformConnection(platform: string, redirectUri: string): Promise<OAuthFlowResult> {
    console.log(`🔐 API: Initiating OAuth flow for ${platform}`)
    const response = await fetch(`${this.baseURL}/api/integrations/${platform}/connect`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ redirect_uri: redirectUri })
    })
    return this.handleResponse<OAuthFlowResult>(response)
  }

  async disconnectPlatform(platform: string): Promise<void> {
    console.log(`🔌 API: Disconnecting platform ${platform}`)
    const response = await fetch(`${this.baseURL}/api/integrations/${platform}/disconnect`, {
      method: 'DELETE',
      headers: this.getHeaders()
    })
    return this.handleResponse<void>(response)
  }

  async publishToPlatform(contentId: string, platform: string, scheduleTime?: string): Promise<PublishResult> {
    console.log(`📱 API: Publishing content to ${platform}`)
    const response = await fetch(`${this.baseURL}/api/integrations/${platform}/publish`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        content_id: contentId,
        schedule_time: scheduleTime
      })
    })
    return this.handleResponse<PublishResult>(response)
  }

  // ============================================================================
  // Enhanced Content Generation with Intelligence
  // ============================================================================

  async generateTextContent(campaignId: string, request: TextGenerationRequest): Promise<GeneratedContent> {
    console.log('✍️ API: Generating text content with intelligence (using existing backend)')
    const response = await fetch(`${this.baseURL}/api/intelligence/generate-content`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        content_type: request.content_type || 'social_post',
        campaign_id: campaignId,
        preferences: {
          user_prompt: request.user_prompt,
          tone: request.tone,
          length: request.length,
          include_hashtags: request.include_hashtags,
          include_cta: request.include_cta
        }
      })
    })
    return this.handleResponse<GeneratedContent>(response)
  }

  async generateImageContent(campaignId: string, request: ImageGenerationRequest): Promise<GeneratedContent> {
    console.log('🎨 API: Generating image content (fallback to content generation)')
    const response = await fetch(`${this.baseURL}/api/content/generate/${campaignId}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        content_type: 'image',
        specifications: {
          user_prompt: request.user_prompt,
          style: request.style,
          dimensions: request.dimensions,
          include_text: request.include_text,
          brand_colors: request.brand_colors
        }
      })
    })
    return this.handleResponse<GeneratedContent>(response)
  }

  async generateVideoContent(campaignId: string, request: VideoGenerationRequest): Promise<GeneratedContent> {
    console.log('🎥 API: Generating video content (fallback to content generation)')
    const response = await fetch(`${this.baseURL}/api/content/generate/${campaignId}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        content_type: 'video',
        specifications: {
          user_prompt: request.user_prompt,
          duration: request.duration,
          style: request.style,
          include_audio: request.include_audio,
          aspect_ratio: request.aspect_ratio
        }
      })
    })
    return this.handleResponse<GeneratedContent>(response)
  }

  async getUsageAnalytics(): Promise<UsageAnalytics> {
    console.log('📊 API: Fetching usage analytics (using existing backend endpoints)')
    try {
      // Get user limits and content service metrics
      const [limitsResponse, metricsResponse] = await Promise.all([
        fetch(`${this.baseURL}/api/content/user-limits`, { headers: this.getHeaders() }),
        fetch(`${this.baseURL}/api/intelligence/content-service/metrics`, { headers: this.getHeaders() })
      ])

      const limits = await this.handleResponse<any>(limitsResponse)
      const metrics = await this.handleResponse<any>(metricsResponse)

      // Transform to expected format
      return {
        monthly_usage: {
          text_generations: metrics.text_generations || 15,
          image_generations: metrics.image_generations || 3,
          video_generations: metrics.video_generations || 1,
          total_cost: metrics.total_cost || 2.45
        },
        cost_breakdown: {
          by_content_type: metrics.cost_breakdown || { text: 1.25, image: 0.80, video: 0.40 },
          by_provider: metrics.provider_costs || {},
          by_campaign: metrics.campaign_costs || {}
        },
        provider_performance: {
          response_times: metrics.response_times || {},
          success_rates: metrics.success_rates || {},
          quality_scores: metrics.quality_scores || {}
        },
        recommendations: metrics.recommendations || []
      }
    } catch (error) {
      console.warn('Using fallback analytics data:', error)
      // Return mock data if backend endpoints not available
      return {
        monthly_usage: { text_generations: 15, image_generations: 3, video_generations: 1, total_cost: 2.45 },
        cost_breakdown: { by_content_type: { text: 1.25, image: 0.80, video: 0.40 }, by_provider: {}, by_campaign: {} },
        provider_performance: { response_times: {}, success_rates: {}, quality_scores: {} },
        recommendations: []
      }
    }
  }

  async getGenerationHistory(campaignId?: string): Promise<GenerationHistory[]> {
    console.log('📜 API: Fetching content generation history (using existing backend)')
    try {
      const url = campaignId
        ? `${this.baseURL}/api/content/results/${campaignId}`
        : `${this.baseURL}/api/intelligence/content-service/metrics`
      const response = await fetch(url, {
        headers: this.getHeaders()
      })
      const data = await this.handleResponse<any>(response)

      // Transform to expected format
      return Array.isArray(data) ? data : (data.history || [])
    } catch (error) {
      console.warn('Generation history not available:', error)
      return []
    }
  }

  // ============================================================================
  // ENHANCED: Platform-Specific Image Generation Methods
  // ============================================================================

  async getPlatformSpecs(): Promise<StandardResponse<{ platform_specs: Record<string, PlatformSpec> }>> {
    console.log('🎨 API: Fetching platform specifications')
    const response = await fetch(`${this.baseURL}/api/content/enhanced-images/platform-specs`, {
      headers: this.getHeaders()
    })
    return this.handleResponse(response)
  }

  async calculateImageCost(platforms: string[], userTier: string = 'professional'): Promise<StandardResponse<{ cost_calculation: any }>> {
    console.log('💰 API: Calculating image generation cost')
    const platformsQuery = platforms.join(',')
    const response = await fetch(`${this.baseURL}/api/content/enhanced-images/cost-calculator?platforms=${platformsQuery}&user_tier=${userTier}`, {
      headers: this.getHeaders()
    })
    return this.handleResponse(response)
  }

  async generatePlatformImage(request: PlatformImageRequest): Promise<StandardResponse> {
    console.log(`🎨 API: Generating platform-specific image for ${request.platform_format}`)
    const response = await fetch(`${this.baseURL}/api/content/enhanced-images/generate-platform`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request)
    })
    return this.handleResponse(response)
  }

  async generateMultiPlatformImages(request: MultiPlatformImageRequest): Promise<StandardResponse> {
    console.log(`🎨 API: Generating multi-platform image batch for ${request.platforms.length} platforms`)
    const response = await fetch(`${this.baseURL}/api/content/enhanced-images/generate-batch`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request)
    })
    return this.handleResponse(response)
  }

  async getImageGeneratorStats(): Promise<StandardResponse> {
    console.log('📊 API: Fetching image generator statistics')
    const response = await fetch(`${this.baseURL}/api/content/enhanced-images/generator-stats`, {
      headers: this.getHeaders()
    })
    return this.handleResponse(response)
  }

  // ============================================================================
  // Campaign Management
  // ============================================================================

  async createCampaign(data: CampaignCreateRequest): Promise<Campaign> {
    // Transform frontend data to match backend expectations
    const transformedData = {
      ...data,
      name: data.title, // Backend expects 'name', frontend sends 'title'
      campaign_type: data.campaign_type || 'affiliate_promotion', // Use valid enum value instead of 'universal'
      // Remove title to avoid confusion - backend will get company_id from user session
      title: undefined
    }

    const response = await fetch(`${this.baseURL}/api/campaigns/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(transformedData)
    })

    const result = await this.handleResponse<any>(response)

    // Backend returns { success: true, message: string, campaign: {...} }
    // Transform to expected Campaign format
    if (result.campaign && result.campaign.id) {
      return {
        id: result.campaign.id,
        name: result.campaign.name || data.title,
        title: result.campaign.name || data.title,
        description: data.description || '',
        campaign_type: data.campaign_type || 'affiliate_promotion',
        status: result.campaign.status || 'draft',
        created_at: result.campaign.created_at || new Date().toISOString(),
        updated_at: result.campaign.updated_at || new Date().toISOString(),
        workflow_step: 'INITIAL',
        is_workflow_complete: false,
        // Add required fields with defaults
        user_id: '',
        company_id: '',
        settings: {}
      } as Campaign
    }

    throw new Error('Invalid response format from campaign creation')
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

  async updateCampaign(id: string, data: Partial<Campaign>): Promise<Campaign> {
    const response = await fetch(`${this.baseURL}/api/campaigns/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
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

  async analyzeURL(data: any): Promise<any> {
    // Handle both object and string parameters for backwards compatibility
    if (typeof data === 'string') {
      return this.analyzeUrl(data, 'ENHANCED')
    }

    // Handle object parameter format
    const { url, campaign_id, analysis_type = 'ENHANCED' } = data
    const response = await fetch(`${this.baseURL}/api/intelligence/analyze-url`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        url,
        campaign_id,
        analysis_type,
        analysis_method: analysis_type
      })
    })

    return this.handleResponse(response)
  }

  async runIntelligenceAnalysis(data: any): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/intelligence/analyze`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    })

    return this.handleResponse(response)
  }

  async getCampaignIntelligence(campaignId: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/intelligence/campaigns/${campaignId}`, {
      headers: this.getHeaders()
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
  // Product Image Scraper
  // ============================================================================

  /**
   * Scrape product images from sales page
   * Saves images to R2 storage and database
   */
  async scrapeProductImages(data: {
    campaign_id: string
    sales_page_url: string
    max_images?: number
  }): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/intelligence/product-images/scrape`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    })

    return this.handleResponse(response)
  }

  /**
   * Get scraped images for a campaign
   * Optional filter by type: hero, product, lifestyle
   */
  async getScrapedImages(
    campaignId: string,
    imageType?: 'hero' | 'product' | 'lifestyle'
  ): Promise<any> {
    const params = imageType ? `?image_type=${imageType}` : ''
    const response = await fetch(
      `${this.baseURL}/api/intelligence/product-images/${campaignId}${params}`,
      {
        headers: this.getHeaders()
      }
    )

    return this.handleResponse(response)
  }

  /**
   * Delete a scraped image
   */
  async deleteScrapedImage(campaignId: string, imageId: string): Promise<any> {
    const response = await fetch(
      `${this.baseURL}/api/intelligence/product-images/${campaignId}/${imageId}`,
      {
        method: 'DELETE',
        headers: this.getHeaders()
      }
    )

    return this.handleResponse(response)
  }

  /**
   * Analyze images on page without saving (preview mode)
   */
  async analyzeProductImagesOnPage(url: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/intelligence/product-images/analyze-url`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ url })
    })

    return this.handleResponse(response)
  }

  // ============================================================================
  // Content Generation
  // ============================================================================

  async generateContent(data: any): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/content/generate`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    })

    return this.handleResponse(response)
  }

  async getGeneratedContent(campaignId: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/content/campaigns/${campaignId}/content`, {
      headers: this.getHeaders()
    })

    return this.handleResponse(response)
  }

  async getContentList(campaignId: string, includeDemo: boolean = false): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/content/list/${campaignId}?include_demo=${includeDemo}`, {
      headers: this.getHeaders()
    })

    return this.handleResponse(response)
  }

  async getContentDetail(campaignId: string, contentId: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/content/detail/${campaignId}/${contentId}`, {
      headers: this.getHeaders()
    })

    return this.handleResponse(response)
  }

  async updateContent(campaignId: string, contentId: string, updateData: any): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/content/update/${campaignId}/${contentId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updateData)
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

  async toggleDemoVisibility(visible?: boolean): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/demo/visibility`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(visible !== undefined ? { visible } : {})
    })

    return this.handleResponse(response)
  }

  // ============================================================================
  // File Upload & Storage
  // ============================================================================

  async uploadDocument(file: File, campaignId?: string): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)
    if (campaignId) {
      formData.append('campaign_id', campaignId)
    }

    const response = await fetch(`${this.baseURL}/api/storage/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
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

  // ============================================================================
  // Mockup Creation System
  // ============================================================================
  async fetchMockupTemplates() {
    return this.get("/api/mockups/templates");
  }

  async createMockup(userId: string, templateName: string, productImageUrl: string) {
    return this.post("/api/mockups/", {
      user_id: userId,
      template_name: templateName,
      product_image_url: productImageUrl,
    });
  }

  async fetchUserMockups(userId: string) {
    return this.get(`/api/mockups/user/${userId}`);
  }
}

// ============================================================================
// Singleton Instance & Hook
// ============================================================================

const apiClient = new ApiClient()

export const useApi = () => {
  return useMemo(() => ({
    // Generic HTTP Methods
    get: apiClient.get.bind(apiClient),
    post: apiClient.post.bind(apiClient),

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

    // Campaign Orchestration & Automation
    generateCompleteCampaign: apiClient.generateCompleteCampaign.bind(apiClient),
    publishCampaign: apiClient.publishCampaign.bind(apiClient),
    getCampaignTimeline: apiClient.getCampaignTimeline.bind(apiClient),
    updateCampaignTimeline: apiClient.updateCampaignTimeline.bind(apiClient),

    // Platform Integration & OAuth
    getPlatformIntegrations: apiClient.getPlatformIntegrations.bind(apiClient),
    initiatePlatformConnection: apiClient.initiatePlatformConnection.bind(apiClient),
    disconnectPlatform: apiClient.disconnectPlatform.bind(apiClient),
    publishToPlatform: apiClient.publishToPlatform.bind(apiClient),

    // Enhanced Content Generation with Intelligence
    generateTextContent: apiClient.generateTextContent.bind(apiClient),
    generateImageContent: apiClient.generateImageContent.bind(apiClient),
    generateVideoContent: apiClient.generateVideoContent.bind(apiClient),
    getUsageAnalytics: apiClient.getUsageAnalytics.bind(apiClient),
    getGenerationHistory: apiClient.getGenerationHistory.bind(apiClient),

    // ENHANCED: Platform-Specific Image Generation
    getPlatformSpecs: apiClient.getPlatformSpecs.bind(apiClient),
    calculateImageCost: apiClient.calculateImageCost.bind(apiClient),
    generatePlatformImage: apiClient.generatePlatformImage.bind(apiClient),
    generateMultiPlatformImages: apiClient.generateMultiPlatformImages.bind(apiClient),
    getImageGeneratorStats: apiClient.getImageGeneratorStats.bind(apiClient),

    // Campaign Management
    createCampaign: apiClient.createCampaign.bind(apiClient),
    getCampaigns: apiClient.getCampaigns.bind(apiClient),
    getCampaign: apiClient.getCampaign.bind(apiClient),
    updateCampaign: apiClient.updateCampaign.bind(apiClient),
    deleteCampaign: apiClient.deleteCampaign.bind(apiClient),
    duplicateCampaign: apiClient.duplicateCampaign.bind(apiClient),
    getWorkflowState: apiClient.getWorkflowState.bind(apiClient),

    // Intelligence & Analysis
    analyzeUrl: apiClient.analyzeUrl.bind(apiClient),
    analyzeURL: apiClient.analyzeURL.bind(apiClient),
    runIntelligenceAnalysis: apiClient.runIntelligenceAnalysis.bind(apiClient),
    getCampaignIntelligence: apiClient.getCampaignIntelligence.bind(apiClient),
    getRecommendedPlatforms: apiClient.getRecommendedPlatforms.bind(apiClient),

    // Product Image Scraper
    scrapeProductImages: apiClient.scrapeProductImages.bind(apiClient),
    getScrapedImages: apiClient.getScrapedImages.bind(apiClient),
    deleteScrapedImage: apiClient.deleteScrapedImage.bind(apiClient),
    analyzeProductImagesOnPage: apiClient.analyzeProductImagesOnPage.bind(apiClient),

    // Content Generation
    generateContent: apiClient.generateContent.bind(apiClient),
    getGeneratedContent: apiClient.getGeneratedContent.bind(apiClient),
    getContentList: apiClient.getContentList.bind(apiClient),
    getContentDetail: apiClient.getContentDetail.bind(apiClient),
    updateContent: apiClient.updateContent.bind(apiClient),

    // Demo & User Preferences
    createDemoManually: apiClient.createDemoManually.bind(apiClient),
    getDemoPreferences: apiClient.getDemoPreferences.bind(apiClient),
    toggleDemoVisibility: apiClient.toggleDemoVisibility.bind(apiClient),

    //Mockup Creation
    fetchMockupTemplates: apiClient.fetchMockupTemplates.bind(apiClient),
    createMockup: apiClient.createMockup.bind(apiClient),
    fetchUserMockups: apiClient.fetchUserMockups.bind(apiClient),

    // File Upload & Storage
    uploadDocument: apiClient.uploadDocument.bind(apiClient),

    // Social Media Integration
    addSocialProfile: apiClient.addSocialProfile.bind(apiClient),
  }), [])
}

// Export the client instance for direct use
export default apiClient
export { apiClient }
export { ApiClient as Api }

// Re-export types for convenience
export type { Campaign, CampaignCreateRequest }