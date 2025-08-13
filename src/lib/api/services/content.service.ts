// src/lib/api/services/content.service.ts - Complete Content Management Service

import { BaseApiClient } from '../core/client'
import { ENDPOINTS } from '../config'
import { handleContentGenerationResponse } from '../core/response-handler'
import type { GeneratedContent } from '../../types/output'
import type { BulkActionResponse } from '../../types/api'

/**
 * Content Service - Complete content generation and management
 * Handles content generation, CRUD operations, rating, publishing, and bulk actions
 */
export class ContentService extends BaseApiClient {

  // ============================================================================
  // BASE API METHODS (inherited and enhanced)
  // ============================================================================

  /**
   * Enhanced response handler with proper error handling
   */
  protected async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
    
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return await response.json()
    }
    
    // For non-JSON responses, return as text
    return await response.text() as unknown as T
  }

  // ============================================================================
  // CONTENT GENERATION
  // ============================================================================

  /**
   * Generate content using AI with robust response handling
   */
  async generateContent(data: {
    content_type: string
    campaign_id: string
    preferences?: Record<string, any>
  }): Promise<GeneratedContent> {
    console.log('🎯 Generating content with data:', data)
    
    const requestData = {
      content_type: data.content_type,
      campaign_id: data.campaign_id,
      preferences: data.preferences || {},
      prompt: `Generate ${data.content_type} content`
    }
    
    console.log('📡 Sending request to backend:', requestData)
    
    const response = await fetch(`${this.baseURL}${ENDPOINTS.CONTENT.GENERATE}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(requestData)
    })
    
    const result = await handleContentGenerationResponse(response)
    console.log('✅ Content generation successful:', result)
    
    return result
  }

  /**
   * Generate multiple content pieces in batch
   */
  async generateBatchContent(requests: Array<{
    content_type: string
    campaign_id: string
    preferences?: Record<string, any>
  }>): Promise<GeneratedContent[]> {
    console.log('🔄 Generating batch content:', requests.length, 'items')
    
    const results = await Promise.allSettled(
      requests.map(request => this.generateContent(request))
    )
    
    const successful: GeneratedContent[] = []
    const failed: any[] = []
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successful.push(result.value)
      } else {
        failed.push({
          index,
          request: requests[index],
          error: result.reason
        })
      }
    })
    
    if (failed.length > 0) {
      console.warn(`⚠️ ${failed.length}/${requests.length} content generations failed:`, failed)
    }
    
    console.log(`✅ Batch generation completed: ${successful.length}/${requests.length} successful`)
    return successful
  }

  // ============================================================================
  // CONTENT RETRIEVAL
  // ============================================================================

  /**
   * Get generated content for a campaign
   */
  async getGeneratedContent(campaignId: string): Promise<any[]> {
    console.log('🔍 Getting generated content for campaign:', campaignId)
    
    try {
      const response = await fetch(`${this.baseURL}${ENDPOINTS.CONTENT.LIST(campaignId)}`, {
        headers: this.getHeaders()
      })
      
      console.log('✅ Content response status:', response.status)
      
      if (!response.ok) {
        if (response.status === 404) {
          console.warn('⚠️ Content endpoint not found, returning empty array')
          return []
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      // Use the proper handleResponse method
      const data = await this.handleResponse<any[]>(response)
      console.log('✅ Retrieved', Array.isArray(data) ? data.length : 'unknown', 'content items')
      
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('❌ getGeneratedContent error:', error)
      return []
    }
  }

  /**
   * Get content list with filtering options
   */
  async getContentList(campaignId: string, includeBody?: boolean, contentType?: string | undefined, options?: {
  includeBody?: boolean
  contentType?: string
  limit?: number
  offset?: number
}): Promise<{
    campaign_id: string
    total_content: number
    content_items: any[]
  }> {
    const params: Record<string, string> = {}
    
    if (options?.includeBody) params.include_body = 'true'
    if (options?.contentType) params.content_type = options.contentType
    if (options?.limit) params.limit = options.limit.toString()
    if (options?.offset) params.offset = options.offset.toString()
    
    return this.get(ENDPOINTS.CONTENT.LIST(campaignId), params)
  }

  /**
   * Get detailed content by ID
   */
  async getContentDetail(campaignId: string, contentId: string): Promise<{
    id: string
    campaign_id: string
    content_type: string
    content_title: string
    content_body: string
    parsed_content: any
    content_metadata: any
    generation_settings: any
    intelligence_used: any
    performance_data: any
    user_rating?: number
    is_published: boolean
    published_at?: string
    created_at: string
    updated_at?: string
    intelligence_source?: {
      id: string
      source_title: string
      source_url?: string
      confidence_score: number
      source_type: string
    }
  }> {
    return this.get(ENDPOINTS.CONTENT.DETAIL(campaignId, contentId))
  }

  // ============================================================================
  // CONTENT MANAGEMENT
  // ============================================================================

  /**
   * Update content
   */
  async updateContent(campaignId: string, contentId: string, updateData: {
    content_title?: string
    content_body?: string
    content_metadata?: any
    user_rating?: number
    is_published?: boolean
  }): Promise<{
    id: string
    message: string
    updated_at: string
  }> {
    return this.put(ENDPOINTS.CONTENT.DETAIL(campaignId, contentId), updateData)
  }

  /**
   * Delete content
   */
  async deleteContent(campaignId: string, contentId: string): Promise<{ message: string }> {
    return this.delete(ENDPOINTS.CONTENT.DETAIL(campaignId, contentId))
  }

  /**
   * Rate content
   */
  async rateContent(campaignId: string, contentId: string, rating: number): Promise<{
    id: string
    rating: number
    message: string
  }> {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5')
    }
    
    return this.post(ENDPOINTS.CONTENT.RATE(campaignId, contentId), { rating })
  }

  /**
   * Publish content
   */
  async publishContent(campaignId: string, contentId: string, publishedAt?: string): Promise<{
    id: string
    is_published: boolean
    published_at: string
    message: string
  }> {
    return this.post(ENDPOINTS.CONTENT.PUBLISH(campaignId, contentId), {
      published_at: publishedAt || new Date().toISOString()
    })
  }

  /**
   * Unpublish content
   */
  async unpublishContent(campaignId: string, contentId: string): Promise<{
    id: string
    is_published: boolean
    message: string
  }> {
    return this.post(ENDPOINTS.CONTENT.PUBLISH(campaignId, contentId), {
      published_at: null
    })
  }

  /**
   * Duplicate content
   */
  async duplicateContent(campaignId: string, contentId: string, title?: string): Promise<{
    id: string
    original_id: string
    title: string
    message: string
  }> {
    return this.post(ENDPOINTS.CONTENT.DUPLICATE(campaignId, contentId), { title })
  }

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  /**
   * Perform bulk action on multiple content items
   */
  async bulkContentAction(
    campaignId: string, 
    contentIds: string[], 
    action: 'publish' | 'unpublish' | 'delete' | 'rate',
    params: any = {}
  ): Promise<BulkActionResponse> {
    if (contentIds.length === 0) {
      throw new Error('No content IDs provided for bulk action')
    }
    
    if (contentIds.length > 100) {
      throw new Error('Bulk action limited to 100 items at a time')
    }
    
    return this.post(ENDPOINTS.CONTENT.BULK_ACTION(campaignId), {
      content_ids: contentIds,
      action,
      params
    })
  }

  /**
   * Bulk publish content
   */
  async bulkPublishContent(campaignId: string, contentIds: string[]): Promise<BulkActionResponse> {
    return this.bulkContentAction(campaignId, contentIds, 'publish')
  }

  /**
   * Bulk unpublish content
   */
  async bulkUnpublishContent(campaignId: string, contentIds: string[]): Promise<BulkActionResponse> {
    return this.bulkContentAction(campaignId, contentIds, 'unpublish')
  }

  /**
   * Bulk delete content
   */
  async bulkDeleteContent(campaignId: string, contentIds: string[]): Promise<BulkActionResponse> {
    return this.bulkContentAction(campaignId, contentIds, 'delete')
  }

  /**
   * Bulk rate content
   */
  async bulkRateContent(campaignId: string, contentIds: string[], rating: number): Promise<BulkActionResponse> {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5')
    }
    
    return this.bulkContentAction(campaignId, contentIds, 'rate', { rating })
  }

  // ============================================================================
  // CONTENT STATISTICS
  // ============================================================================

  /**
   * Get content statistics for a campaign
   */
  async getContentStats(campaignId: string): Promise<{
    campaign_id: string
    total_content: number
    published_content: number
    unpublished_content: number
    rated_content: number
    average_rating: number
    amplified_content: number
    recent_content: number
    content_by_type: Record<string, number>
    performance_metrics: {
      publication_rate: number
      rating_rate: number
      amplification_rate: number
    }
  }> {
    return this.get(ENDPOINTS.CONTENT.STATS(campaignId))
  }

  /**
   * Get content performance analytics
   */
  async getContentAnalytics(campaignId: string, timeframe?: 'week' | 'month' | 'quarter'): Promise<{
    content_performance: Array<{
      content_id: string
      content_type: string
      views: number
      engagement: number
      conversion_rate?: number
      created_at: string
    }>
    trends: {
      total_generated: number
      publication_trend: number
      rating_trend: number
      type_distribution: Record<string, number>
    }
    top_performers: Array<{
      content_id: string
      title: string
      type: string
      rating: number
      performance_score: number
    }>
  }> {
    const params: Record<string, string> = {}
    if (timeframe) {
      params.timeframe = timeframe
    }
    return this.get(`${ENDPOINTS.CONTENT.STATS(campaignId)}/analytics`, params)
  }

  // ============================================================================
  // CONTENT SEARCH & FILTERING
  // ============================================================================

  /**
   * Search content within a campaign
   */
  async searchContent(campaignId: string, query: string, filters?: {
    contentType?: string
    published?: boolean
    minRating?: number
    maxRating?: number
    dateFrom?: string
    dateTo?: string
  }): Promise<{
    results: any[]
    total: number
    query: string
    filters_applied: Record<string, any>
  }> {
    const params: Record<string, string> = { q: query }
    
    if (filters?.contentType) params.content_type = filters.contentType
    if (filters?.published !== undefined) params.published = filters.published.toString()
    if (filters?.minRating) params.min_rating = filters.minRating.toString()
    if (filters?.maxRating) params.max_rating = filters.maxRating.toString()
    if (filters?.dateFrom) params.date_from = filters.dateFrom
    if (filters?.dateTo) params.date_to = filters.dateTo
    
    return this.get(`${ENDPOINTS.CONTENT.LIST(campaignId)}/search`, params)
  }

  /**
   * Get content by type
   */
  async getContentByType(campaignId: string, contentType: string): Promise<any[]> {
    const result = await this.get(ENDPOINTS.CONTENT.LIST(campaignId), { content_type: contentType })
    return Array.isArray(result) ? result : (result as any)?.content_items || []
  }

  /**
   * Get published content only
   */
  async getPublishedContent(campaignId: string): Promise<any[]> {
    const result = await this.get(ENDPOINTS.CONTENT.LIST(campaignId), { published: 'true' })
    return Array.isArray(result) ? result : (result as any)?.content_items || []
  }

  /**
   * Get top-rated content
   */
  async getTopRatedContent(campaignId: string, minRating: number = 4): Promise<any[]> {
    const result = await this.get(ENDPOINTS.CONTENT.LIST(campaignId), { min_rating: minRating.toString() })
    return Array.isArray(result) ? result : (result as any)?.content_items || []
  }

  // ============================================================================
  // CONTENT TEMPLATES & OPTIMIZATION
  // ============================================================================

  /**
   * Create content template from existing content
   */
  async createTemplate(campaignId: string, contentId: string, templateName: string): Promise<{
    template_id: string
    name: string
    content_type: string
    created_from: string
    message: string
  }> {
    return this.post(`${ENDPOINTS.CONTENT.DETAIL(campaignId, contentId)}/create-template`, {
      template_name: templateName
    })
  }

  /**
   * Generate content from template
   */
  async generateFromTemplate(campaignId: string, templateId: string, customizations?: Record<string, any>): Promise<GeneratedContent> {
    const requestData = {
      template_id: templateId,
      campaign_id: campaignId,
      customizations: customizations || {}
    }
    
    // Fixed: Use proper method name
    return this.generateContentFromTemplate(requestData)
  }

  /**
   * Helper method for template-based content generation
   */
  private async generateContentFromTemplate(requestData: any): Promise<GeneratedContent> {
    const response = await fetch(`${this.baseURL}${ENDPOINTS.CONTENT.GENERATE}/from-template`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(requestData)
    })
    
    return await handleContentGenerationResponse(response)
  }

  /**
   * Optimize content for better performance
   */
  async optimizeContent(campaignId: string, contentId: string, optimizationGoals?: string[]): Promise<{
    optimized_content: GeneratedContent
    optimization_suggestions: Array<{
      type: string
      suggestion: string
      confidence: number
    }>
    performance_prediction: {
      estimated_improvement: number
      confidence_score: number
    }
  }> {
    return this.post(`${ENDPOINTS.CONTENT.DETAIL(campaignId, contentId)}/optimize`, {
      optimization_goals: optimizationGoals || ['engagement', 'conversion']
    })
  }

  // ============================================================================
  // COMMENT & SHARING METHODS
  // ============================================================================

  /**
   * Add comment to content
   */
  async addContentComment(campaignId: string, contentId: string, comment: {
    text: string
    author?: string
    metadata?: Record<string, any>
  }): Promise<{
    id: string
    content_id: string
    text: string
    author: string
    created_at: string
    metadata?: Record<string, any>
  }> {
    return this.post(`${ENDPOINTS.CONTENT.DETAIL(campaignId, contentId)}/comments`, comment)
  }

  /**
   * Get comments for content
   */
  async getContentComments(campaignId: string, contentId: string): Promise<Array<{
    id: string
    content_id: string
    text: string
    author: string
    created_at: string
    metadata?: Record<string, any>
  }>> {
    return this.get(`${ENDPOINTS.CONTENT.DETAIL(campaignId, contentId)}/comments`)
  }

  /**
   * Share content
   */
  async shareContent(campaignId: string, contentId: string, shareData: {
    platform?: string
    recipients?: string[]
    message?: string
    schedule_at?: string
  }): Promise<{
    share_id: string
    content_id: string
    platform: string
    status: 'pending' | 'scheduled' | 'sent' | 'failed'
    shared_at?: string
    recipients_count: number
  }> {
    return this.post(`${ENDPOINTS.CONTENT.DETAIL(campaignId, contentId)}/share`, shareData)
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Validate content data
   */
  validateContentData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (!data.content_type) {
      errors.push('Content type is required')
    }
    
    if (!data.campaign_id) {
      errors.push('Campaign ID is required')
    }
    
    if (data.content_title && data.content_title.length < 3) {
      errors.push('Content title must be at least 3 characters')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Format content for export
   */
  formatContentForExport(content: any, format: 'json' | 'csv' | 'markdown' = 'json'): string {
    switch (format) {
      case 'csv':
        const headers = ['ID', 'Type', 'Title', 'Published', 'Rating', 'Created']
        const rows = [
          headers.join(','),
          [
            content.id,
            content.content_type,
            `"${content.content_title}"`,
            content.is_published,
            content.user_rating || 'N/A',
            content.created_at
          ].join(',')
        ]
        return rows.join('\n')
      
      case 'markdown':
        return `# ${content.content_title}

**Type:** ${content.content_type}
**Published:** ${content.is_published ? 'Yes' : 'No'}
**Rating:** ${content.user_rating ? content.user_rating + '/5' : 'Not rated'}
**Created:** ${content.created_at}

## Content

${content.content_body}
`
      
      default:
        return JSON.stringify(content, null, 2)
    }
  }

  /**
   * Calculate content performance score
   */
  calculatePerformanceScore(content: any): number {
    let score = 0
    
    // Base score from rating
    if (content.user_rating) {
      score += (content.user_rating / 5) * 40
    }
    
    // Publication status
    if (content.is_published) {
      score += 20
    }
    
    // Performance data
    if (content.performance_data) {
      const { views = 0, engagement = 0, conversion_rate = 0 } = content.performance_data
      score += Math.min(views / 1000 * 10, 20) // Up to 20 points for views
      score += Math.min(engagement * 100, 10) // Up to 10 points for engagement
      score += Math.min(conversion_rate * 100, 10) // Up to 10 points for conversion
    }
    
    return Math.round(Math.min(score, 100))
  }

  /**
   * Get content type recommendations
   */
  getContentTypeRecommendations(campaignData: any): Array<{
    type: string
    priority: 'high' | 'medium' | 'low'
    reason: string
  }> {
    const recommendations = []
    
    // Email is always recommended
    recommendations.push({
      type: 'email',
      priority: 'high' as const,
      reason: 'Essential for direct customer communication'
    })
    
    // Social posts for audience engagement
    recommendations.push({
      type: 'social_post',
      priority: 'high' as const,
      reason: 'Builds audience engagement and brand awareness'
    })
    
    // Ad copy for paid campaigns
    if (campaignData?.budget && campaignData.budget > 1000) {
      recommendations.push({
        type: 'ad_copy',
        priority: 'high' as const,
        reason: 'Optimize paid advertising performance'
      })
    }
    
    // Blog posts for SEO
    recommendations.push({
      type: 'blog_post',
      priority: 'medium' as const,
      reason: 'Improves SEO and thought leadership'
    })
    
    return recommendations
  }
}