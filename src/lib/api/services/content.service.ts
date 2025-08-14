// src/lib/api/services/content.service.ts - FIXED to match original working backend

import { getAuthToken } from '../config'

/**
 * Content Service - Matches original working backend exactly
 * Uses same patterns as api.ts.backup that was working
 */
export class ContentService {
  private baseURL = 'https://campaign-backend-production-e2db.up.railway.app'

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      ...(getAuthToken() && { Authorization: `Bearer ${getAuthToken()}` })
    }
  }

  /**
   * ✅ Generate content - matches original working api.ts.backup exactly
   */
  async generateContent(data: {
    content_type: string
    campaign_id: string
    preferences?: Record<string, any>
  }) {
    console.log('🎯 Generating content with data:', data)

    const requestData = {
      content_type: data.content_type,
      campaign_id: data.campaign_id,
      preferences: data.preferences || {},
      prompt: `Generate ${data.content_type} content`
    }

    console.log('📡 Sending request to backend:', requestData)

    // ✅ Exact same URL as working api.ts.backup
    const response = await fetch(`${this.baseURL}/api/intelligence/content/generate`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(requestData)
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    const result = await response.json()
    console.log('✅ Content generation successful:', result)

    // ✅ Exact same response transformation as working api.ts.backup
    return {
      content_id: result.content_id || 'generated-content-id',
      content_type: result.content_type || data.content_type,
      campaign_id: data.campaign_id,
      generated_content: {
        title: result.generated_content?.title || `Generated ${data.content_type}`,
        content: result.generated_content?.content || result.generated_content || {},
        metadata: result.generation_metadata || {}
      },
      smart_url: result.smart_url || undefined,
      performance_predictions: result.performance_predictions || {}
    }
  }

  /**
   * ✅ Get generated content - matches original working api.ts.backup exactly
   */
  async getGeneratedContent(campaignId: string): Promise<any[]> {
    console.log('🔍 Getting generated content for campaign:', campaignId)

    try {
      // ✅ Exact same URL as working api.ts.backup
      const response = await fetch(`${this.baseURL}/api/intelligence/content/${campaignId}`, {
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

      const data = await response.json()
      console.log('✅ Retrieved', Array.isArray(data) ? data.length : 'unknown', 'content items')

      // ✅ Exact same response handling as working api.ts.backup
      if (Array.isArray(data)) {
        return data
      } else if (data && data.content_items && Array.isArray(data.content_items)) {
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
   * ✅ Get content list - matches working pattern
   */
  async getContentList(campaignId: string, includeBody = false, contentType?: string) {
    const params = new URLSearchParams()
    if (includeBody) params.set('include_body', 'true')
    if (contentType) params.set('content_type', contentType)

    const url = `${this.baseURL}/api/intelligence/content/${campaignId}`
    const fullUrl = params.toString() ? `${url}?${params}` : url

    const response = await fetch(fullUrl, {
      headers: this.getHeaders()
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * ✅ Get content detail - matches working pattern
   */
  async getContentDetail(campaignId: string, contentId: string) {
    const url = `${this.baseURL}/api/intelligence/content/${campaignId}/content/${contentId}`

    const response = await fetch(url, {
      headers: this.getHeaders()
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * ✅ Update content - matches working pattern
   */
  async updateContent(campaignId: string, contentId: string, updateData: any) {
    const url = `${this.baseURL}/api/intelligence/content/${campaignId}/content/${contentId}`

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updateData)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * ✅ Delete content - matches working pattern
   */
  async deleteContent(campaignId: string, contentId: string) {
    const url = `${this.baseURL}/api/intelligence/content/${campaignId}/content/${contentId}`

    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders()
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }
}