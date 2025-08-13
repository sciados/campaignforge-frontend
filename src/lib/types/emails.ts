// src/lib/types/emails.ts - Enhanced Email Generation Types

// ============================================================================
// EMAIL GENERATION REQUEST/RESPONSE TYPES
// ============================================================================

export interface EmailGenerationRequest {
  campaign_id: string
  preferences?: Record<string, any>
  use_database_templates?: boolean
  enable_learning?: boolean
}

export interface EmailData {
  email_number: number
  subject: string
  body: string
  send_delay: string
  strategic_angle: string
  angle_name?: string
  subject_metadata?: {
    performance_record_id: string
    method: string
    category_used: string
    reference_count?: number
    is_fallback?: boolean
  }
  campaign_focus?: string
  product_name?: string
}

export interface LearningMetadata {
  email_number: number
  performance_record_id: string
  can_learn_from: boolean
  template_version?: string
}

export interface EmailGenerationResponse {
  success: boolean
  emails: EmailData[]
  learning_metadata?: LearningMetadata[]
  generation_info: {
    database_enhanced: boolean
    unique_subjects: number
    total_emails: number
    learning_enabled?: boolean
    generation_method: string
  }
  message: string
}

// ============================================================================
// PERFORMANCE TRACKING TYPES
// ============================================================================

export interface PerformanceTrackingRequest {
  performance_data: Array<{
    performance_record_id: string
    emails_sent: number
    emails_opened: number
    click_rate?: number
  }>
}

export interface PerformanceTrackingResponse {
  success: boolean
  performance_updates: Array<{
    performance_record_id: string
    open_rate: number
    updated: boolean
    high_performer: boolean
    error?: string
  }>
  learning_results: {
    evaluated_count: number
    stored_as_templates: number
    promoted_to_high_performing: number
    promoted_to_top_tier: number
    new_templates: Array<{
      template_text: string
      category: string
      performance_level: string
      open_rate: number
    }>
  }
  message: string
}

// ============================================================================
// LEARNING ANALYTICS TYPES
// ============================================================================

export interface LearningAnalyticsResponse {
  template_stats: Array<{
    source: string
    performance_level: string
    count: number
    avg_open_rate: number
  }>
  ai_performance: {
    total_ai_subjects: number
    avg_ai_open_rate: number
    high_performing_count: number
    top_tier_count: number
  }
  top_templates: Array<{
    template_text: string
    avg_open_rate: number
    performance_level: string
    source: string
  }>
  learning_active: boolean
  system_status: string
}

// ============================================================================
// SYSTEM HEALTH & MANAGEMENT TYPES
// ============================================================================

export interface EmailSystemHealthResponse {
  status: 'healthy' | 'error' | 'unavailable'
  enhanced_email_system?: {
    router_available: boolean
    models_available: boolean
    generator_ready: boolean
    template_database: {
      total_templates: number
      active_templates: number
      templates_seeded: boolean
    }
  }
  capabilities?: {
    ai_subject_generation: boolean
    database_learning: boolean
    performance_tracking: boolean
    self_improvement: boolean
    universal_product_support: boolean
  }
  expected_performance?: {
    open_rates: string
    continuous_improvement: string
    template_growth: string
  }
  error?: string
  message?: string
}

export interface EmailTemplateSeeedResponse {
  success: boolean
  message: string
  templates_seeded: number
  total_templates: number
}

export interface EmailLearningTriggerResponse {
  success: boolean
  learning_results: any
  message: string
}

export interface EmailTestResponse {
  success: boolean
  test_result: string
  emails_generated: number
  sample_subjects: string[]
  generation_method: string
  features_tested: any
  expected_performance: any
}

export interface EmailSystemStatusResponse {
  system_ready: boolean
  learning_active: boolean
  template_database: any
  performance_tracking: any
  status_message: string
}

// ============================================================================
// DEMO PREFERENCE TYPES
// ============================================================================

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

// ============================================================================
// EMAIL CONSTANTS & ENUMS
// ============================================================================

export const EMAIL_PERFORMANCE_THRESHOLDS = {
  EXCELLENT: 35,
  GOOD: 25,
  POOR: 15,
} as const

export const EMAIL_SEQUENCE_LENGTHS = {
  SHORT: 3,
  STANDARD: 5,
  LONG: 7,
} as const

export const EMAIL_LEARNING_SETTINGS = {
  MIN_SENDS_FOR_LEARNING: 50,
  MIN_OPEN_RATE_FOR_STORAGE: 25,
  HIGH_PERFORMANCE_THRESHOLD: 30,
  TOP_TIER_THRESHOLD: 35,
} as const

export const EMAIL_STRATEGIC_ANGLES = [
  'scientific_authority',
  'emotional_transformation', 
  'community_social_proof',
  'urgency_scarcity',
  'lifestyle_confidence'
] as const

export const EMAIL_TEMPLATE_CATEGORIES = [
  'curiosity_gap',
  'urgency_scarcity',
  'social_proof',
  'personal_benefit',
  'transformation',
  'authority_scientific',
  'emotional_triggers',
  'value_promise'
] as const

export type EmailStrategicAngle = typeof EMAIL_STRATEGIC_ANGLES[number]
export type EmailTemplateCategory = typeof EMAIL_TEMPLATE_CATEGORIES[number]