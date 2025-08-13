// src/lib/api/core/response-handler.ts - Response Handling (Updated to use output.ts types)

import { ApiError, CreditError, StandardResponse, LegacyResponse } from '../../types/api'
import { clearAuthToken } from '../config'
// Import from output.ts instead of api.ts
import type { GeneratedContent, ContentType, ContentStatus } from '../../types/output'

// ============================================================================
// RESPONSE TYPE DETECTION UTILITIES
// ============================================================================

function isStandardResponse(response: any): response is StandardResponse {
  return response && typeof response === 'object' && 'success' in response
}

function isLegacyResponse(response: any): response is LegacyResponse {
  return response && typeof response === 'object' && (
    'content_id' in response || 
    'generated_content' in response ||
    'content_type' in response
  )
}

function hasErrorIndicators(response: any): boolean {
  if (!response || typeof response !== 'object') return false
  
  return (
    response.error ||
    response.success === false ||
    response.status === 'error' ||
    (response.message && response.message.toLowerCase().includes('error')) ||
    (response.message && response.message.toLowerCase().includes('failed'))
  )
}

function extractErrorMessage(response: any): string {
  if (response.error) return response.error
  if (response.message && hasErrorIndicators(response)) return response.message
  if (response.detail) return response.detail
  return 'Unknown error occurred'
}

// Helper function to safely cast content type
function normalizeContentType(contentType: string): ContentType {
  const validTypes: ContentType[] = [
    'email', 'email_series', 'video_script', 'social_post', 'blog_post', 
    'ad_copy', 'lead_magnet', 'sales_material', 'newsletter', 'case_study', 
    'whitepaper', 'presentation'
  ]
  
  return validTypes.includes(contentType as ContentType) 
    ? contentType as ContentType 
    : 'email'
}

// Helper function to safely cast content status
function normalizeContentStatus(status?: string): ContentStatus {
  const validStatuses: ContentStatus[] = [
    'draft', 'review', 'approved', 'published', 'archived', 'generating', 'failed'
  ]
  
  return validStatuses.includes(status as ContentStatus) 
    ? status as ContentStatus 
    : 'draft'
}

// ============================================================================
// MAIN RESPONSE HANDLERS
// ============================================================================

/**
 * 🎯 ROBUST RESPONSE HANDLER - Handles Multiple Backend Response Formats
 */
export async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    try {
      const responseData = await response.json()
      
      // 🎯 ROBUST: Handle standardized responses
      if (isStandardResponse(responseData)) {
        if (!responseData.success) {
          throw new ApiError(
            responseData.error || responseData.message || 'Operation failed',
            response.status,
            responseData,
            responseData.error_code,
            responseData.error_details?.suggestions,
            responseData.request_id
          )
        }
        // Return the data portion for standardized responses
        return responseData.data as T
      }
      
      // 🎯 ROBUST: Handle legacy responses
      if (isLegacyResponse(responseData)) {
        // Check for error indicators in legacy format
        if (hasErrorIndicators(responseData)) {
          throw new ApiError(
            extractErrorMessage(responseData),
            response.status,
            responseData
          )
        }
        // Return the whole object for legacy responses
        return responseData as T
      }
      
      // 🎯 ROBUST: Handle plain JSON responses
      return responseData as T
      
    } catch (jsonError) {
      if (jsonError instanceof ApiError) {
        throw jsonError
      }
      // If JSON parsing fails, return empty object
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
    clearAuthToken()
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

/**
 * 🎯 ROBUST CONTENT GENERATION HANDLER
 * Maps various response formats to the GeneratedContent type from output.ts
 */
export async function handleContentGenerationResponse(response: Response): Promise<GeneratedContent> {
  let responseData: any
  
  try {
    responseData = await response.json()
    console.log('🔍 Raw backend response:', responseData)
  } catch (jsonError) {
    console.error('❌ JSON parsing failed:', jsonError)
    throw new ApiError(`Invalid JSON response: ${jsonError}`)
  }

  // 🎯 ROBUST: Check for error conditions first
  if (!response.ok) {
    const errorMessage = extractErrorMessage(responseData)
    throw new ApiError(errorMessage, response.status, responseData)
  }

  // 🎯 ROBUST: Handle standardized success response
  if (isStandardResponse(responseData)) {
    if (!responseData.success) {
      throw new ApiError(
        responseData.error || responseData.message || 'Content generation failed',
        response.status,
        responseData,
        responseData.error_code,
        responseData.error_details?.suggestions,
        responseData.request_id
      )
    }
    
    // Extract data from standardized response and map to GeneratedContent type
    const data = responseData.data
    
    return {
      content_id: data.content_id || data.id || 'generated-content-id',
      campaign_id: data.campaign_id || 'default-campaign',
      content_type: data.content_type || 'email',
      generated_content: {
        title: data.generated_content?.title || data.title || `Generated ${data.content_type || 'Content'}`,
        content: (() => {
          // Handle different content formats
          if (data.generated_content?.content) {
            return data.generated_content.content;
          }
          if (data.content) {
            return data.content;
          }
          if (data.generated_content && typeof data.generated_content === 'object') {
            return data.generated_content;
          }
          return data.generated_content || {};
        })(),
        metadata: data.generation_metadata || data.generated_content?.metadata || {},
        usage_tips: data.generated_content?.usage_tips || []
      },
      smart_url: data.smart_url,
      performance_predictions: data.performance_predictions || {}
    }
  }

  // 🎯 ROBUST: Handle legacy response format
  if (isLegacyResponse(responseData)) {
    // Check for error indicators
    if (hasErrorIndicators(responseData)) {
      throw new ApiError(extractErrorMessage(responseData), response.status, responseData)
    }

    // Check for required fields
    if (!responseData.content_id && !responseData.generated_content) {
      throw new ApiError('Invalid response: missing content data', response.status, responseData)
    }

    // Transform legacy response to GeneratedContent format
    return {
      content_id: responseData.content_id || 'legacy-content-id',
      campaign_id: responseData.campaign_id || 'default-campaign',
      content_type: responseData.content_type || 'email',
      generated_content: {
        title: responseData.generated_content?.title || 'Generated Content',
        content: responseData.generated_content?.content || responseData.generated_content || {},
        metadata: responseData.generation_metadata || {},
        usage_tips: responseData.generated_content?.usage_tips || []
      },
      smart_url: responseData.smart_url,
      performance_predictions: responseData.performance_predictions || {}
    }
  }

  // 🎯 ROBUST: Fallback for unexpected response format
  console.warn('⚠️ Unexpected response format, attempting to extract content:', responseData)
  
  return {
    content_id: responseData.id || responseData.content_id || 'unknown-id',
    campaign_id: responseData.campaign_id || 'default-campaign',
    content_type: responseData.content_type || 'email',
    generated_content: {
      title: responseData.title || 'Generated Content',
      content: responseData.content || responseData.generated_content || responseData,
      metadata: responseData.metadata || {},
      usage_tips: []
    },
    smart_url: responseData.smart_url,
    performance_predictions: responseData.performance_predictions || {}
  }
}