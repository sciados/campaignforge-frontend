// src/lib/types/auth.ts - Authentication Types (New addition to existing types/)

// ============================================================================
// USER TYPES
// ============================================================================

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
// AUTHENTICATION REQUEST/RESPONSE TYPES
// ============================================================================

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
  user_id: string
}

export interface RegisterData {
  email: string
  password: string
  full_name: string
}

export interface RegisterResponse {
  message: string
  user_id: string
  company_id: string
}

// ============================================================================
// TOKEN TYPES
// ============================================================================

export interface TokenData {
  access_token: string
  refresh_token?: string
  token_type: 'Bearer'
  expires_in: number
  user_id: string
  issued_at?: string
}

export interface TokenPayload {
  sub: string // user_id
  email: string
  company_id: string
  role: string
  exp: number
  iat: number
}

// ============================================================================
// COMPANY & DASHBOARD TYPES
// ============================================================================

export interface CompanyStats {
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
}

export interface CompanyDetails {
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
}

export interface DashboardStats {
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
}