// src/lib/types/api.ts - API-specific types (Fixed LegacyResponse)

// ============================================================================
// STANDARD RESPONSE TYPES
// ============================================================================

export interface StandardResponse<T = any> {
  success: boolean
  status?: 'success' | 'error' | 'partial' | 'pending'
  message?: string
  data?: T
  error?: string
  error_code?: string
  timestamp?: string
  request_id?: string
  warnings?: string[]
  error_details?: {
    error_type: string
    description: string
    suggestions: string[]
    debug_info?: Record<string, any>
  }
}

export interface LegacyResponse {
  content_id?: string
  campaign_id?: string
  content_type?: string
  generated_content?: any
  smart_url?: string
  performance_predictions?: any
  intelligence_sources_used?: number
  generation_metadata?: any
  ultra_cheap_stats?: any
  error?: string
  message?: string
  // Additional properties that may exist in legacy responses
  template_used?: string
  quality_score?: number
  title?: string
  content?: any
  status?: string
  created_at?: string
  updated_at?: string
  published_at?: string
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public data?: any,
    public errorCode?: string,
    public suggestions?: string[],
    public requestId?: string
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
// PAGINATION & GENERIC TYPES
// ============================================================================

export interface PaginationParams {
  page?: number
  limit?: number
  skip?: number
  offset?: number
}

export interface PaginationResponse {
  skip: number
  limit: number
  total: number
  returned: number
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface ListResponse<T> {
  items: T[]
  pagination: PaginationResponse
  total: number
}

// ============================================================================
// REQUEST CONFIG TYPES
// ============================================================================

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export interface RequestConfig {
  method?: RequestMethod
  headers?: Record<string, string>
  body?: any
  params?: Record<string, string | number>
}

export interface ApiClientConfig {
  baseURL: string
  timeout?: number
  defaultHeaders?: Record<string, string>
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

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

// ============================================================================
// WORKFLOW AND CAMPAIGN TYPES (restored from original api.ts)
// ============================================================================

export interface WorkflowStateResponse {
  campaign_id: string
  workflow_state: string
  completion_percentage: number
  total_steps: number
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

export interface WorkflowProgressData {
  workflow_state?: string
  completion_percentage?: number
  step_data?: Record<string, any>
  auto_analysis_enabled?: boolean
  generate_content_after_analysis?: boolean
}

export interface CampaignStats {
  total_campaigns_created: number
  active_campaigns: number
  draft_campaigns: number
  completed_campaigns: number
  total_sources: number
  total_content: number
  avg_completion: number
}

// ============================================================================
// ERROR UTILITY FUNCTIONS
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