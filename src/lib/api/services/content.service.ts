// src/lib/api/services/content.service.ts - Improved with proper TypeScript and validation

import { getAuthToken } from '../config'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ContentGenerationRequest {
  content_type: string
  campaign_id: string
  preferences?: Record<string, any>
}

export interface GeneratedContent {
  content_id: string
  content_type: string
  campaign_id: string
  generated_content: {
    title: string
    content: any
    metadata: Record<string, any>
  }
  smart_url?: string
  performance_predictions: Record<string, any>
}

export interface ContentUpdateData {
  title?: string
  content?: any
  metadata?: Record<string, any>
  status?: 'draft' | 'published' | 'archived'
  rating?: number
}

export interface ContentListOptions {
  include_body?: boolean
  content_type?: string
  status?: string
  limit?: number
  offset?: number
}

export interface BulkActionOptions {
  rating?: number
  status?: string
  metadata?: Record<string, any>
}

export interface ShareOptions {
  recipients?: string[]
  permissions?: 'view' | 'edit' | 'admin'
  expiry_date?: string
  message?: string
}

export interface ContentStats {
  total_content: number
  published_content: number
  draft_content: number
  average_rating: number
  content_by_type?: Record<string, number>
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

// ============================================================================
// CONTENT SERVICE
// ============================================================================

/**
 * Content Service - Complete implementation with proper TypeScript and validation
 */
export class ContentService {
  private readonly baseURL = 'https://campaign-backend-production-e2db.up.railway.app'

  private getHeaders(): Record<string, string> {
    const token = getAuthToken()
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  }

  private validateId(id: string, fieldName: string): void {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      throw new Error(`${fieldName} is required and must be a non-empty string`)
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      try {
        const errorText = await response.text()
        if (errorText) {
          errorMessage = `HTTP ${response.status}: ${errorText}`
        }
      } catch {
        // Use default error message if response.text() fails
      }
      throw new Error(errorMessage)
    }

    try {
      return await response.json()
    } catch (error) {
      throw new Error('Invalid JSON response from server')
    }
  }

  // ============================================================================
  // CORE CONTENT METHODS
  // ============================================================================

  /**
   * Generate content - with proper validation and typing
   */
  async generateContent(data: ContentGenerationRequest): Promise<GeneratedContent> {
    // Validate input
    const validation = this.validateContentData(data)
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
    }

    console.log('🎯 Generating content with data:', data)

    const requestData = {
      content_type: data.content_type,
      campaign_id: data.campaign_id,
      preferences: data.preferences || {},
      prompt: `Generate ${data.content_type} content`
    }

    const response = await fetch(`${this.baseURL}/api/intelligence/content/generate`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(requestData)
    })

    const result = await this.handleResponse<any>(response)
    console.log('✅ Content generation successful:', result)

    return {
      content_id: result.content_id || 'generated-content-id',
      content_type: result.content_type || data.content_type,
      campaign_id: data.campaign_id,
      generated_content: {
        title: result.generated_content?.title || `Generated ${data.content_type}`,
        content: result.generated_content?.content || result.generated_content || {},
        metadata: result.generation_metadata || {}
      },
      smart_url: result.smart_url,
      performance_predictions: result.performance_predictions || {}
    }
  }

  /**
   * Generate batch content
   */
  async generateBatchContent(requests: ContentGenerationRequest[]): Promise<GeneratedContent[]> {
    if (!Array.isArray(requests) || requests.length === 0) {
      throw new Error('Requests must be a non-empty array')
    }

    // Validate all requests
    for (const request of requests) {
      const validation = this.validateContentData(request)
      if (!validation.isValid) {
        throw new Error(`Validation failed for request: ${validation.errors.join(', ')}`)
      }
    }

    const response = await fetch(`${this.baseURL}/api/intelligence/content/generate/batch`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ requests })
    })

    return this.handleResponse<GeneratedContent[]>(response)
  }

  /**
   * Get generated content with proper error handling
   */
  async getGeneratedContent(campaignId: string): Promise<any[]> {
    this.validateId(campaignId, 'campaignId')

    try {
      const response = await fetch(`${this.baseURL}/api/intelligence/content/${campaignId}`, {
        headers: this.getHeaders()
      })

      if (response.status === 404) {
        console.warn('⚠️ Content endpoint not found, returning empty array')
        return []
      }

      const data = await this.handleResponse<any>(response)

      if (Array.isArray(data)) {
        return data
      } else if (data?.content_items && Array.isArray(data.content_items)) {
        return data.content_items
      } else {
        return []
      }
    } catch (error) {
      console.error('❌ getGeneratedContent error:', error)
      return []
    }
  }

  /**
   * Get content list with typed options
   */
  async getContentList(
    campaignId: string,
    options: ContentListOptions = {}
  ): Promise<any[]> {
    this.validateId(campaignId, 'campaignId')

    const params = new URLSearchParams()
    if (options.include_body) params.set('include_body', 'true')
    if (options.content_type) params.set('content_type', options.content_type)
    if (options.status) params.set('status', options.status)
    if (options.limit) params.set('limit', options.limit.toString())
    if (options.offset) params.set('offset', options.offset.toString())

    const url = `${this.baseURL}/api/intelligence/content/${campaignId}`
    const fullUrl = params.toString() ? `${url}?${params}` : url

    const response = await fetch(fullUrl, {
      headers: this.getHeaders()
    })

    return this.handleResponse<any[]>(response)
  }

  /**
   * Get content detail
   */
  async getContentDetail(campaignId: string, contentId: string): Promise<any> {
    this.validateId(campaignId, 'campaignId')
    this.validateId(contentId, 'contentId')

    const response = await fetch(
      `${this.baseURL}/api/intelligence/content/${campaignId}/content/${contentId}`,
      { headers: this.getHeaders() }
    )

    return this.handleResponse<any>(response)
  }

  /**
   * Update content with typed data
   */
  async updateContent(
    campaignId: string,
    contentId: string,
    updateData: ContentUpdateData
  ): Promise<any> {
    this.validateId(campaignId, 'campaignId')
    this.validateId(contentId, 'contentId')

    if (!updateData || typeof updateData !== 'object') {
      throw new Error('Update data is required and must be an object')
    }

    const response = await fetch(
      `${this.baseURL}/api/intelligence/content/${campaignId}/content/${contentId}`,
      {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(updateData)
      }
    )

    return this.handleResponse<any>(response)
  }

  /**
   * Delete content
   */
  async deleteContent(campaignId: string, contentId: string): Promise<any> {
    this.validateId(campaignId, 'campaignId')
    this.validateId(contentId, 'contentId')

    const response = await fetch(
      `${this.baseURL}/api/intelligence/content/${campaignId}/content/${contentId}`,
      {
        method: 'DELETE',
        headers: this.getHeaders()
      }
    )

    return this.handleResponse<any>(response)
  }

  // ============================================================================
  // CONTENT INTERACTION METHODS
  // ============================================================================

  /**
   * Rate content with validation
   */
  async rateContent(campaignId: string, contentId: string, rating: number): Promise<any> {
    this.validateId(campaignId, 'campaignId')
    this.validateId(contentId, 'contentId')

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      throw new Error('Rating must be a number between 1 and 5')
    }

    const response = await fetch(
      `${this.baseURL}/api/intelligence/content/${campaignId}/content/${contentId}/rate`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ rating })
      }
    )

    return this.handleResponse<any>(response)
  }

  /**
   * Publish content
   */
  async publishContent(campaignId: string, contentId: string): Promise<any> {
    this.validateId(campaignId, 'campaignId')
    this.validateId(contentId, 'contentId')

    const response = await fetch(
      `${this.baseURL}/api/intelligence/content/${campaignId}/content/${contentId}/publish`,
      {
        method: 'POST',
        headers: this.getHeaders()
      }
    )

    return this.handleResponse<any>(response)
  }

  /**
   * Unpublish content
   */
  async unpublishContent(campaignId: string, contentId: string): Promise<any> {
    this.validateId(campaignId, 'campaignId')
    this.validateId(contentId, 'contentId')

    const response = await fetch(
      `${this.baseURL}/api/intelligence/content/${campaignId}/content/${contentId}/unpublish`,
      {
        method: 'POST',
        headers: this.getHeaders()
      }
    )

    return this.handleResponse<any>(response)
  }

  /**
   * Duplicate content with options
   */
  async duplicateContent(
    campaignId: string,
    contentId: string,
    options: { title?: string } = {}
  ): Promise<any> {
    this.validateId(campaignId, 'campaignId')
    this.validateId(contentId, 'contentId')

    const response = await fetch(
      `${this.baseURL}/api/intelligence/content/${campaignId}/content/${contentId}/duplicate`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(options)
      }
    )

    return this.handleResponse<any>(response)
  }

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  /**
   * Bulk content action with validation
   */
  async bulkContentAction(
    campaignId: string,
    action: string,
    contentIds: string[],
    options: BulkActionOptions = {}
  ): Promise<any> {
    this.validateId(campaignId, 'campaignId')

    if (!Array.isArray(contentIds) || contentIds.length === 0) {
      throw new Error('Content IDs must be a non-empty array')
    }

    if (!action || typeof action !== 'string') {
      throw new Error('Action is required and must be a string')
    }

    // Validate all content IDs
    contentIds.forEach((id, index) => {
      this.validateId(id, `contentIds[${index}]`)
    })

    const response = await fetch(
      `${this.baseURL}/api/intelligence/content/${campaignId}/bulk`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          action,
          content_ids: contentIds,
          options
        })
      }
    )

    return this.handleResponse<any>(response)
  }

  async bulkPublishContent(campaignId: string, contentIds: string[]): Promise<any> {
    return this.bulkContentAction(campaignId, 'publish', contentIds)
  }

  async bulkUnpublishContent(campaignId: string, contentIds: string[]): Promise<any> {
    return this.bulkContentAction(campaignId, 'unpublish', contentIds)
  }

  async bulkDeleteContent(campaignId: string, contentIds: string[]): Promise<any> {
    return this.bulkContentAction(campaignId, 'delete', contentIds)
  }

  async bulkRateContent(campaignId: string, contentIds: string[], rating: number): Promise<any> {
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      throw new Error('Rating must be a number between 1 and 5')
    }
    return this.bulkContentAction(campaignId, 'rate', contentIds, { rating })
  }

  // ============================================================================
  // ANALYTICS AND STATS
  // ============================================================================

  /**
   * Get content stats with fallback
   */
  async getContentStats(campaignId: string): Promise<ContentStats> {
    this.validateId(campaignId, 'campaignId')

    try {
      const response = await fetch(
        `${this.baseURL}/api/intelligence/content/${campaignId}/stats`,
        { headers: this.getHeaders() }
      )

      if (response.status === 404) {
        return {
          total_content: 0,
          published_content: 0,
          draft_content: 0,
          average_rating: 0
        }
      }

      return this.handleResponse<ContentStats>(response)
    } catch (error) {
      console.warn('Failed to get content stats, returning defaults:', error)
      return {
        total_content: 0,
        published_content: 0,
        draft_content: 0,
        average_rating: 0
      }
    }
  }

  /**
   * Get content analytics
   */
  async getContentAnalytics(
    campaignId: string,
    options: { period?: string; content_type?: string } = {}
  ): Promise<any> {
    this.validateId(campaignId, 'campaignId')

    const params = new URLSearchParams()
    if (options.period) params.set('period', options.period)
    if (options.content_type) params.set('content_type', options.content_type)

    const url = `${this.baseURL}/api/intelligence/content/${campaignId}/analytics`
    const fullUrl = params.toString() ? `${url}?${params}` : url

    const response = await fetch(fullUrl, {
      headers: this.getHeaders()
    })

    return this.handleResponse<any>(response)
  }

  // ============================================================================
  // SEARCH AND FILTERING
  // ============================================================================

  /**
   * Search content
   */
  async searchContent(
    campaignId: string,
    query: string,
    filters: Record<string, any> = {}
  ): Promise<any[]> {
    this.validateId(campaignId, 'campaignId')

    if (!query || typeof query !== 'string') {
      throw new Error('Search query is required and must be a string')
    }

    const response = await fetch(
      `${this.baseURL}/api/intelligence/content/${campaignId}/search`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ query, filters })
      }
    )

    return this.handleResponse<any[]>(response)
  }

  async getContentByType(campaignId: string, contentType: string): Promise<any[]> {
    return this.getContentList(campaignId, { include_body: true, content_type: contentType })
  }

  async getPublishedContent(campaignId: string): Promise<any[]> {
    this.validateId(campaignId, 'campaignId')

    const response = await fetch(
      `${this.baseURL}/api/intelligence/content/${campaignId}/published`,
      { headers: this.getHeaders() }
    )

    return this.handleResponse<any[]>(response)
  }

  async getTopRatedContent(campaignId: string, limit = 10): Promise<any[]> {
    this.validateId(campaignId, 'campaignId')

    if (typeof limit !== 'number' || limit < 1) {
      throw new Error('Limit must be a positive number')
    }

    const response = await fetch(
      `${this.baseURL}/api/intelligence/content/${campaignId}/top-rated?limit=${limit}`,
      { headers: this.getHeaders() }
    )

    return this.handleResponse<any[]>(response)
  }

  // ============================================================================
  // TEMPLATES AND OPTIMIZATION
  // ============================================================================

  async createTemplate(campaignId: string, contentId: string, templateData: any): Promise<any> {
    this.validateId(campaignId, 'campaignId')
    this.validateId(contentId, 'contentId')

    const response = await fetch(
      `${this.baseURL}/api/intelligence/content/${campaignId}/templates`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          source_content_id: contentId,
          ...templateData
        })
      }
    )

    return this.handleResponse<any>(response)
  }

  async generateFromTemplate(
    campaignId: string,
    templateId: string,
    data: Record<string, any> = {}
  ): Promise<any> {
    this.validateId(campaignId, 'campaignId')
    this.validateId(templateId, 'templateId')

    const response = await fetch(
      `${this.baseURL}/api/intelligence/content/${campaignId}/templates/${templateId}/generate`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      }
    )

    return this.handleResponse<any>(response)
  }

  async optimizeContent(
    campaignId: string,
    contentId: string,
    optimizationType = 'performance'
  ): Promise<any> {
    this.validateId(campaignId, 'campaignId')
    this.validateId(contentId, 'contentId')

    const response = await fetch(
      `${this.baseURL}/api/intelligence/content/${campaignId}/content/${contentId}/optimize`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ optimization_type: optimizationType })
      }
    )

    return this.handleResponse<any>(response)
  }

  // ============================================================================
  // COLLABORATION
  // ============================================================================

  async addContentComment(campaignId: string, contentId: string, comment: string): Promise<any> {
    this.validateId(campaignId, 'campaignId')
    this.validateId(contentId, 'contentId')

    if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
      throw new Error('Comment is required and must be a non-empty string')
    }

    const response = await fetch(
      `${this.baseURL}/api/intelligence/content/${campaignId}/content/${contentId}/comments`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ comment: comment.trim() })
      }
    )

    return this.handleResponse<any>(response)
  }

  async getContentComments(campaignId: string, contentId: string): Promise<any[]> {
    this.validateId(campaignId, 'campaignId')
    this.validateId(contentId, 'contentId')

    const response = await fetch(
      `${this.baseURL}/api/intelligence/content/${campaignId}/content/${contentId}/comments`,
      { headers: this.getHeaders() }
    )

    return this.handleResponse<any[]>(response)
  }

  async shareContent(campaignId: string, contentId: string, shareOptions: ShareOptions): Promise<any> {
    this.validateId(campaignId, 'campaignId')
    this.validateId(contentId, 'contentId')

    if (!shareOptions || typeof shareOptions !== 'object') {
      throw new Error('Share options are required')
    }

    const response = await fetch(
      `${this.baseURL}/api/intelligence/content/${campaignId}/content/${contentId}/share`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(shareOptions)
      }
    )

    return this.handleResponse<any>(response)
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Validate content data with proper typing
   */
  validateContentData(data: any): ValidationResult {
    const errors: string[] = []

    if (!data || typeof data !== 'object') {
      errors.push('Data is required and must be an object')
      return { isValid: false, errors }
    }

    if (!data.content_type || typeof data.content_type !== 'string') {
      errors.push('Content type is required and must be a string')
    }

    if (!data.campaign_id || typeof data.campaign_id !== 'string') {
      errors.push('Campaign ID is required and must be a string')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Format content for export with proper typing
   */
  formatContentForExport(content: any, format: 'json' | 'csv' | 'pdf' = 'json'): string | object {
    if (!content) {
      throw new Error('Content is required for export')
    }

    switch (format) {
      case 'csv':
        const headers = Object.keys(content)
        const values = Object.values(content).map(v =>
          typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : String(v)
        )
        return `${headers.join(',')}\n${values.join(',')}`

      case 'pdf':
        return {
          title: content.title || 'Content Export',
          content: content,
          format: 'pdf'
        }

      default:
        return JSON.stringify(content, null, 2)
    }
  }

  /**
   * Calculate performance score with validation
   */
  calculatePerformanceScore(content: any): number {
    if (!content || typeof content !== 'object') {
      return 0
    }

    const predictions = content.performance_predictions
    if (!predictions || typeof predictions !== 'object') {
      return 0
    }

    let score = 0
    let factors = 0

    if (typeof predictions.engagement_rate === 'number' && predictions.engagement_rate >= 0) {
      score += predictions.engagement_rate * 0.3
      factors++
    }

    if (typeof predictions.conversion_rate === 'number' && predictions.conversion_rate >= 0) {
      score += predictions.conversion_rate * 0.4
      factors++
    }

    if (typeof predictions.reach_estimate === 'number' && predictions.reach_estimate >= 0) {
      score += Math.min(predictions.reach_estimate / 10000, 1) * 0.3
      factors++
    }

    return factors > 0 ? Math.round((score / factors) * 100) : 0
  }

  /**
   * Get content type recommendations with proper typing
   */
  getContentTypeRecommendations(campaignData?: any): string[] {
    const baseTypes = ['email', 'social_post', 'blog_post', 'ad_copy']

    if (!campaignData || typeof campaignData !== 'object') {
      return baseTypes
    }

    const recommendations = [...baseTypes]

    // Add specific recommendations based on campaign data
    if (campaignData.industry === 'ecommerce') {
      recommendations.push('product_description', 'review_template')
    }

    if (campaignData.target_audience &&
      Array.isArray(campaignData.target_audience) &&
      campaignData.target_audience.includes('business')) {
      recommendations.push('whitepaper', 'case_study')
    }

    if (campaignData.budget && typeof campaignData.budget === 'number' && campaignData.budget > 10000) {
      recommendations.push('video_script', 'podcast_outline')
    }

    return Array.from(new Set(recommendations)) // Remove duplicates
  }

  /**
   * Validate URL for content analysis
   */
  validateUrl(url: string): ValidationResult {
    const errors: string[] = []

    if (!url || typeof url !== 'string') {
      errors.push('URL is required and must be a string')
      return { isValid: false, errors }
    }

    try {
      const urlObj = new URL(url)
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        errors.push('URL must use HTTP or HTTPS protocol')
      }
    } catch {
      errors.push('URL format is invalid')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Check if content exists
   */
  async contentExists(campaignId: string, contentId: string): Promise<boolean> {
    try {
      await this.getContentDetail(campaignId, contentId)
      return true
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return false
      }
      throw error // Re-throw non-404 errors
    }
  }

  /**
   * Get content summary for dashboard
   */
  async getContentSummary(campaignId: string): Promise<{
    total: number
    published: number
    drafts: number
    recentActivity: any[]
  }> {
    this.validateId(campaignId, 'campaignId')

    try {
      const [stats, recentContent] = await Promise.all([
        this.getContentStats(campaignId),
        this.getContentList(campaignId, { limit: 5 })
      ])

      return {
        total: stats.total_content || 0,
        published: stats.published_content || 0,
        drafts: stats.draft_content || 0,
        recentActivity: recentContent || []
      }
    } catch (error) {
      console.warn('Failed to get content summary:', error)
      return {
        total: 0,
        published: 0,
        drafts: 0,
        recentActivity: []
      }
    }
  }

  /**
   * Backup content data
   */
  async backupContent(campaignId: string, options: {
    include_drafts?: boolean
    format?: 'json' | 'csv'
  } = {}): Promise<string> {
    this.validateId(campaignId, 'campaignId')

    const allContent = await this.getContentList(campaignId, {
      include_body: true
    })

    let contentToBackup = allContent
    if (!options.include_drafts) {
      contentToBackup = allContent.filter(c => c.status === 'published')
    }

    const format = options.format || 'json'

    if (format === 'csv') {
      if (contentToBackup.length === 0) {
        return 'id,title,content_type,status,created_at\n'
      }

      const headers = ['id', 'title', 'content_type', 'status', 'created_at']
      const rows = contentToBackup.map(content =>
        headers.map(header => {
          const value = content[header] || ''
          return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : String(value)
        }).join(',')
      )

      return `${headers.join(',')}\n${rows.join('\n')}`
    }

    return JSON.stringify({
      campaign_id: campaignId,
      backup_date: new Date().toISOString(),
      content_count: contentToBackup.length,
      content: contentToBackup
    }, null, 2)
  }
}