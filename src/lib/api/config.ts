// src/lib/api/config.ts - Merged API Configuration (Preserves Working Elements + New Endpoints)

// ============================================================================
// BASE CONFIGURATION
// ============================================================================

export const API_CONFIG = {
  BASE_URL: 'https://campaign-backend-production-e2db.up.railway.app',
  TIMEOUT: 30000,
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
} as const

// Legacy constant for backward compatibility
export const API_BASE_URL = API_CONFIG.BASE_URL

// ============================================================================
// ENVIRONMENT CONFIGURATION
// ============================================================================

export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    console.log('🔍 Environment check:')
    console.log('- process.env.NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL)
    console.log('- API_BASE_URL being used:', API_CONFIG.BASE_URL)
    console.log('- Window location:', window.location.href)
  }
  
  return process.env.NEXT_PUBLIC_API_URL || API_CONFIG.BASE_URL
}

// ============================================================================
// TOKEN MANAGEMENT
// ============================================================================

export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  AUTH_TOKEN: 'authToken',
} as const

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN) || localStorage.getItem(TOKEN_KEYS.AUTH_TOKEN)
}

export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, token)
    localStorage.setItem(TOKEN_KEYS.AUTH_TOKEN, token)
  }
}

export const clearAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(TOKEN_KEYS.AUTH_TOKEN)
  }
}

// ============================================================================
// API ENDPOINTS - COMPREHENSIVE MERGED VERSION
// ============================================================================

export const ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    PROFILE: '/api/auth/profile',
    REFRESH: '/api/auth/refresh', // Preserved from old
  },
  
  // Campaigns
  CAMPAIGNS: {
    BASE: '/api/campaigns',
    STATS: '/api/campaigns/stats/stats', // Updated from new
    DETAIL: (id: string) => `/api/campaigns/${id}`, // Preserved from old
    DUPLICATE: (id: string) => `/api/campaigns/${id}/duplicate`,
    WORKFLOW_STATE: (id: string) => `/api/campaigns/${id}/workflow-state`,
    WORKFLOW_PROGRESS: (id: string) => `/api/campaigns/${id}/workflow/save-progress`,
    INTELLIGENCE: (id: string) => `/api/campaigns/${id}/intelligence`,
    SAVE_PROGRESS: (id: string) => `/api/campaigns/${id}/workflow/save-progress`, // Preserved from old
  },
  
  // Enhanced Email Generation - Updated endpoints
  EMAILS: {
    GENERATE: '/api/intelligence/emails/enhanced-emails/generate', // Updated from new
    GENERATE_ENHANCED: '/api/intelligence/emails/enhanced-emails/generate', // Preserved alias
    TRACK_PERFORMANCE: '/api/intelligence/emails/enhanced-emails/track-performance',
    LEARNING_ANALYTICS: '/api/intelligence/emails/enhanced-emails/learning-analytics',
    SYSTEM_HEALTH: '/api/emails/system-health',
    SEED_TEMPLATES: '/api/intelligence/emails/enhanced-emails/seed-templates',
    TRIGGER_LEARNING: '/api/intelligence/emails/enhanced-emails/trigger-learning',
    TEST_GENERATION: '/api/intelligence/emails/test-enhanced-generation',
    SYSTEM_STATUS: '/api/intelligence/emails/enhanced-emails/system-status',
  },
  
  // Content Management - Updated endpoints
  CONTENT: {
    GENERATE: '/api/intelligence/content/generate',
    LIST: (campaignId: string) => `/api/intelligence/content/${campaignId}`,
    DETAIL: (campaignId: string, contentId: string) => `/api/intelligence/content/${campaignId}/content/${contentId}`,
    RATE: (campaignId: string, contentId: string) => `/api/campaigns/${campaignId}/content/${contentId}/rate`,
    PUBLISH: (campaignId: string, contentId: string) => `/api/campaigns/${campaignId}/content/${contentId}/publish`,
    BULK_ACTION: (campaignId: string) => `/api/campaigns/${campaignId}/content/bulk-action`,
    STATS: (campaignId: string) => `/api/campaigns/${campaignId}/content/stats`,
    DUPLICATE: (campaignId: string, contentId: string) => `/api/campaigns/${campaignId}/content/${contentId}/duplicate`,
    TEST_GENERATION: '/api/intelligence/content/test-generation', // Preserved from old
  },
  
  // Intelligence & Analysis
  INTELLIGENCE: {
    ANALYZE_URL: '/api/intelligence/analysis/url', // Updated from new
    UPLOAD_DOCUMENT: '/api/intelligence/upload-document',
    SEARCH: '/api/intelligence/search', // Preserved from old
  },
  
  // Dashboard & Company Stats - Enhanced
  DASHBOARD: {
    STATS: '/api/dashboard/stats',
    COMPANY: '/api/dashboard/company',
    ANALYTICS: '/api/dashboard/analytics', // Preserved from old
    TRENDS: '/api/dashboard/trends', // Preserved from old
    BILLING: '/api/dashboard/billing', // Preserved from old
    CREDITS: '/api/dashboard/credits', // Preserved from old
    TEAM: '/api/dashboard/team', // Preserved from old
    SETTINGS: '/api/dashboard/settings', // Preserved from old
  },
  
  // System Health & Monitoring
  SYSTEM: {
    HEALTH: '/api/health',
    STATUS: '/api/status',
    DEBUG_ROUTES: '/api/debug/routes',
    DEBUG_CORS: '/api/debug/cors-test',
  },
  
  // Health & Status - Preserved from old
  HEALTH: {
    ROOT: '/health',
    API: '/api/health',
    STATUS: '/api/status',
    CONTENT_SYSTEM: '/api/content/system-health',
    EMAIL_SYSTEM: '/api/emails/system-health'
  },
  
  // Demo Management
  DEMO: {
    PREFERENCES: '/api/campaigns/demo/preferences',
    TOGGLE: '/api/campaigns/demo/toggle',
    STATUS: '/api/campaigns/demo/status',
    CREATE: '/api/campaigns/demo/create',
  },
  
  // Affiliate - Preserved from old
  AFFILIATE: {
    PREFERENCES: '/api/affiliate/preferences',
    GENERATE_LINK: '/api/affiliate/generate-link',
    TRACK_CLICK: '/api/affiliate/track-click',
    PERFORMANCE: '/api/affiliate/performance',
  },
} as const

// ============================================================================
// LEGACY EXPORTS FOR BACKWARD COMPATIBILITY
// ============================================================================

// Export individual endpoint groups for easier imports
export const AUTH_ENDPOINTS = ENDPOINTS.AUTH
export const CAMPAIGN_ENDPOINTS = ENDPOINTS.CAMPAIGNS
export const EMAIL_ENDPOINTS = ENDPOINTS.EMAILS
export const CONTENT_ENDPOINTS = ENDPOINTS.CONTENT
export const INTELLIGENCE_ENDPOINTS = ENDPOINTS.INTELLIGENCE
export const DASHBOARD_ENDPOINTS = ENDPOINTS.DASHBOARD
export const DEMO_ENDPOINTS = ENDPOINTS.DEMO
export const AFFILIATE_ENDPOINTS = ENDPOINTS.AFFILIATE

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Build full URL from endpoint
 */
export const buildUrl = (endpoint: string, baseUrl?: string): string => {
  const base = baseUrl || getApiBaseUrl()
  return `${base}${endpoint}`
}

/**
 * Get headers with optional auth token
 */
export const getHeaders = (includeAuth: boolean = true): Record<string, string> => {
  const headers: Record<string, string> = { ...API_CONFIG.DEFAULT_HEADERS }
  
  if (includeAuth) {
    const token = getAuthToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }
  
  return headers
}

/**
 * Build query string from parameters
 */
export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, value.toString())
    }
  })
  
  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

/**
 * Create a fetch request with default configuration
 */
export const createRequest = (
  endpoint: string,
  options: RequestInit = {},
  includeAuth: boolean = true
): Request => {
  const url = buildUrl(endpoint)
  const headers = getHeaders(includeAuth)
  
  return new Request(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  })
}