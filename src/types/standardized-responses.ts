// ============================================================================
// src/lib/types/standardized-responses.ts (NEW FILE)
// ============================================================================

export interface StandardResponse<T = any> {
  success: boolean
  status: 'success' | 'error' | 'partial' | 'pending'
  message: string
  data?: T
  error?: string
  error_code?: string
  timestamp: string
  request_id: string
  warnings?: string[]
  error_details?: {
    error_type: string
    description: string
    suggestions: string[]
    debug_info?: Record<string, any>
  }
}

export interface ContentGenerationData {
  content_id: string
  content_type: string
  generated_content: Record<string, any>
  smart_url?: string
  performance_predictions: Record<string, any>
  intelligence_sources_used: number
  generation_metadata: Record<string, any>
  ultra_cheap_stats: Record<string, any>
}

export type ContentGenerationResponse = StandardResponse<ContentGenerationData>

export interface ApiError extends Error {
  statusCode?: number
  errorCode?: string
  suggestions?: string[]
  requestId?: string
}