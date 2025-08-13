// src/lib/api/config.ts - API Configuration (Merged with existing patterns)

export const API_CONFIG = {
  BASE_URL: 'https://campaign-backend-production-e2db.up.railway.app',
  TIMEOUT: 30000,
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
} as const

// Environment configuration
export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    console.log('🔍 Environment check:')
    console.log('- process.env.NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL)
    console.log('- API_BASE_URL being used:', API_CONFIG.BASE_URL)
    console.log('- Window location:', window.location.href)
  }
  
  return process.env.NEXT_PUBLIC_API_URL || API_CONFIG.BASE_URL
}

// Token management utilities
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

// API Endpoints organized by domain
export const ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    PROFILE: '/api/auth/profile',
  },
  
  // Campaigns
  CAMPAIGNS: {
    BASE: '/api/campaigns',
    STATS: '/api/campaigns/stats/stats',
    DUPLICATE: (id: string) => `/api/campaigns/${id}/duplicate`,
    WORKFLOW_STATE: (id: string) => `/api/campaigns/${id}/workflow-state`,
    WORKFLOW_PROGRESS: (id: string) => `/api/campaigns/${id}/workflow/save-progress`,
    INTELLIGENCE: (id: string) => `/api/campaigns/${id}/intelligence`,
  },
  
  // Enhanced Email Generation
  EMAILS: {
    GENERATE: '/api/intelligence/emails/enhanced-emails/generate',
    TRACK_PERFORMANCE: '/api/intelligence/emails/enhanced-emails/track-performance',
    LEARNING_ANALYTICS: '/api/intelligence/emails/enhanced-emails/learning-analytics',
    SYSTEM_HEALTH: '/api/emails/system-health',
    SEED_TEMPLATES: '/api/intelligence/emails/enhanced-emails/seed-templates',
    TRIGGER_LEARNING: '/api/intelligence/emails/enhanced-emails/trigger-learning',
    TEST_GENERATION: '/api/intelligence/emails/test-enhanced-generation',
    SYSTEM_STATUS: '/api/intelligence/emails/enhanced-emails/system-status',
  },
  
  // Content Management
  CONTENT: {
    LIST: (campaignId: string) => `/api/intelligence/content/${campaignId}`,
    DETAIL: (campaignId: string, contentId: string) => `/api/intelligence/content/${campaignId}/content/${contentId}`,
    GENERATE: '/api/intelligence/content/generate',
    RATE: (campaignId: string, contentId: string) => `/api/campaigns/${campaignId}/content/${contentId}/rate`,
    PUBLISH: (campaignId: string, contentId: string) => `/api/campaigns/${campaignId}/content/${contentId}/publish`,
    BULK_ACTION: (campaignId: string) => `/api/campaigns/${campaignId}/content/bulk-action`,
    STATS: (campaignId: string) => `/api/campaigns/${campaignId}/content/stats`,
    DUPLICATE: (campaignId: string, contentId: string) => `/api/campaigns/${campaignId}/content/${contentId}/duplicate`,
  },
  
  // Intelligence & Analysis
  INTELLIGENCE: {
    ANALYZE_URL: '/api/intelligence/analysis/url',
    UPLOAD_DOCUMENT: '/api/intelligence/upload-document',
  },
  
  // Dashboard & Stats
  DASHBOARD: {
    STATS: '/api/dashboard/stats',
    COMPANY: '/api/dashboard/company',
  },
  
  // Demo Management
  DEMO: {
    PREFERENCES: '/api/campaigns/demo/preferences',
    TOGGLE: '/api/campaigns/demo/toggle',
    STATUS: '/api/campaigns/demo/status',
    CREATE: '/api/campaigns/demo/create',
  },
  
  // Affiliate (existing)
  AFFILIATE: {
    PREFERENCES: '/api/affiliate/preferences',
    GENERATE_LINK: '/api/affiliate/generate-link',
    TRACK_CLICK: '/api/affiliate/track-click',
    PERFORMANCE: '/api/affiliate/performance',
  },
} as const