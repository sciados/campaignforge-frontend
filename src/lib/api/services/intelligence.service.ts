// src/lib/api/services/intelligence.service.ts - Complete Intelligence & Analysis Service (Fixed)

import { BaseApiClient } from '../core/client'
import { ENDPOINTS } from '../config'
import type { 
  CampaignIntelligenceResponse,
  URLAnalysisRequest,
  URLAnalysisResponse,
  DocumentUploadResponse,
  IntelligenceSearchResponse,
  ActionableInsightsResponse
} from '../../types/intelligence-api'

/**
 * Intelligence Service - Complete analysis and intelligence gathering
 * Handles URL analysis, document processing, competitive intelligence, and insights
 */
export class IntelligenceService extends BaseApiClient {

  // ============================================================================
  // URL ANALYSIS
  // ============================================================================

  /**
   * Analyze a URL for marketing intelligence
   */
  async analyzeURL(data: URLAnalysisRequest): Promise<URLAnalysisResponse> {
    console.log('🔍 Analyzing URL:', data.url)
    
    try {
      const response = await fetch(`${this.baseURL}${ENDPOINTS.INTELLIGENCE.ANALYZE_URL}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        throw new Error(`URL analysis failed: ${response.statusText}`)
      }
      
      const result = await response.json()
      console.log('✅ URL analysis completed with confidence:', result.confidence_score)
      
      return result
    } catch (error) {
      console.error('❌ URL analysis error:', error)
      throw error
    }
  }

  /**
   * Batch analyze multiple URLs
   */
  async batchAnalyzeURLs(urls: URLAnalysisRequest[]): Promise<Array<{
    url: string
    intelligence_id?: string
    analysis_status: string
    confidence_score?: number
    error?: string
  }>> {
    console.log('📄 Batch analyzing', urls.length, 'URLs')
    
    const results = await Promise.allSettled(
      urls.map(data => this.analyzeURL(data))
    )
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return {
          url: urls[index].url,
          intelligence_id: result.value.intelligence_id,
          analysis_status: result.value.analysis_status,
          confidence_score: result.value.confidence_score
        }
      } else {
        return {
          url: urls[index].url,
          analysis_status: 'failed',
          error: result.reason.message
        }
      }
    })
  }

  /**
   * Re-analyze URL with different settings
   */
  async reanalyzeURL(intelligenceId: string, newSettings?: {
    analysis_depth?: 'shallow' | 'standard' | 'deep'
    focus_areas?: string[]
  }): Promise<{
    intelligence_id: string
    analysis_status: string
    confidence_score: number
    improvements: string[]
  }> {
    return this.post(`${ENDPOINTS.INTELLIGENCE.ANALYZE_URL}/${intelligenceId}/reanalyze`, newSettings || {})
  }

  // ============================================================================
  // DOCUMENT PROCESSING
  // ============================================================================

  /**
   * Upload and analyze a document
   */
  async uploadDocument(file: File, campaignId: string, options?: {
    analysis_type?: 'content' | 'competitive' | 'market'
    extract_insights?: boolean
    generate_summaries?: boolean
  }): Promise<DocumentUploadResponse> {
    console.log('📄 Uploading document:', file.name, `(${file.size} bytes)`)
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('campaign_id', campaignId)
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        formData.append(key, value.toString())
      })
    }

    try {
      const response = await fetch(`${this.baseURL}${ENDPOINTS.INTELLIGENCE.UPLOAD_DOCUMENT}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`
        },
        body: formData
      })
      
      if (!response.ok) {
        throw new Error(`Document upload failed: ${response.statusText}`)
      }
      
      const result = await response.json()
      console.log('✅ Document processed, extracted', result.insights_extracted, 'insights')
      
      return result
    } catch (error) {
      console.error('❌ Document upload error:', error)
      throw error
    }
  }

  /**
   * Process multiple documents in batch
   */
  async batchUploadDocuments(files: Array<{
    file: File
    campaign_id: string
    options?: any
  }>): Promise<Array<{
    filename: string
    intelligence_id?: string
    status: string
    insights_extracted?: number
    error?: string
  }>> {
    console.log('📄 Batch uploading', files.length, 'documents')
    
    const results = await Promise.allSettled(
      files.map(({ file, campaign_id, options }) => 
        this.uploadDocument(file, campaign_id, options)
      )
    )
    
    return results.map((result, index) => {
      const filename = files[index].file.name
      if (result.status === 'fulfilled') {
        return {
          filename,
          intelligence_id: result.value.intelligence_id,
          status: result.value.status,
          insights_extracted: result.value.insights_extracted
        }
      } else {
        return {
          filename,
          status: 'failed',
          error: result.reason.message
        }
      }
    })
  }

  // ============================================================================
  // INTELLIGENCE RETRIEVAL
  // ============================================================================

  /**
   * Get campaign intelligence with filtering
   */
  async getCampaignIntelligence(
    campaignId: string, 
    options?: {
      skip?: number
      limit?: number
      intelligence_type?: string
      min_confidence?: number
      source_type?: string
      date_from?: string
      date_to?: string
    }
  ): Promise<{
    campaign_id: string
    intelligence_entries: Array<{
      id: string
      source_type: string
      source_url?: string
      source_title?: string
      confidence_score: number
      analysis_status: string
      offer_intelligence: Record<string, any>
      psychology_intelligence: Record<string, any>
      processing_metadata: Record<string, any>
      created_at: string
      updated_at?: string
    }>
    pagination: {
      skip: number
      limit: number
      total: number
      returned: number
    }
    summary: {
      total_intelligence_entries: number
      available_types: string[]
      campaign_title: string
      auto_analysis_status: string
      analysis_confidence_score: number
    }
    is_demo: boolean
  }> {
    const params: Record<string, string> = {
      skip: (options?.skip || 0).toString(),
      limit: (options?.limit || 50).toString()
    }
    
    if (options?.intelligence_type) params.intelligence_type = options.intelligence_type
    if (options?.min_confidence) params.min_confidence = options.min_confidence.toString()
    if (options?.source_type) params.source_type = options.source_type
    if (options?.date_from) params.date_from = options.date_from
    if (options?.date_to) params.date_to = options.date_to
    
    return this.get(ENDPOINTS.CAMPAIGNS.INTELLIGENCE(campaignId), params)
  }

  /**
   * Get intelligence by ID
   */
  async getIntelligenceById(intelligenceId: string): Promise<{
    id: string
    campaign_id: string
    source_type: string
    source_url?: string
    source_title: string
    confidence_score: number
    analysis_status: string
    offer_intelligence: Record<string, any>
    psychology_intelligence: Record<string, any>
    content_intelligence: Record<string, any>
    competitive_intelligence: Record<string, any>
    brand_intelligence: Record<string, any>
    processing_metadata: Record<string, any>
    insights: Array<{
      type: string
      content: string
      confidence: number
      actionable: boolean
    }>
    created_at: string
    updated_at?: string
  }> {
    return this.get(`/api/intelligence/${intelligenceId}`)
  }

  /**
   * Search intelligence across campaigns
   */
  async searchIntelligence(query: string, filters?: {
    campaign_ids?: string[]
    source_types?: string[]
    min_confidence?: number
    analysis_status?: string
    date_from?: string
    date_to?: string
  }): Promise<IntelligenceSearchResponse> {
    const params: Record<string, string> = { q: query }
    
    if (filters) {
      if (filters.campaign_ids) params.campaign_ids = filters.campaign_ids.join(',')
      if (filters.source_types) params.source_types = filters.source_types.join(',')
      if (filters.min_confidence) params.min_confidence = filters.min_confidence.toString()
      if (filters.analysis_status) params.analysis_status = filters.analysis_status
      if (filters.date_from) params.date_from = filters.date_from
      if (filters.date_to) params.date_to = filters.date_to
    }
    
    return this.get('/api/intelligence/search', params)
  }

  // ============================================================================
  // COMPETITIVE INTELLIGENCE
  // ============================================================================

  /**
   * Analyze competitor
   */
  async analyzeCompetitor(data: {
    competitor_url: string
    campaign_id: string
    analysis_depth?: 'basic' | 'standard' | 'comprehensive'
    focus_areas?: string[]
  }): Promise<{
    competitor_id: string
    analysis_status: string
    competitive_insights: {
      strengths: string[]
      weaknesses: string[]
      opportunities: string[]
      threats: string[]
      positioning: Record<string, any>
      messaging_analysis: Record<string, any>
      pricing_intelligence: Record<string, any>
    }
    recommendations: Array<{
      type: string
      priority: 'high' | 'medium' | 'low'
      action: string
      rationale: string
    }>
    confidence_score: number
  }> {
    return this.post('/api/intelligence/competitive/analyze', data)
  }

  /**
   * Get competitive landscape
   */
  async getCompetitiveLandscape(campaignId: string): Promise<{
    campaign_id: string
    competitors: Array<{
      id: string
      name: string
      url: string
      market_position: string
      threat_level: 'high' | 'medium' | 'low'
      strengths: string[]
      weaknesses: string[]
      last_analyzed: string
    }>
    market_insights: {
      market_size: string
      growth_trends: string[]
      key_players: string[]
      emerging_threats: string[]
    }
    opportunities: Array<{
      type: string
      description: string
      potential_impact: 'high' | 'medium' | 'low'
      effort_required: 'high' | 'medium' | 'low'
    }>
  }> {
    return this.get(`/api/intelligence/competitive/landscape/${campaignId}`)
  }

  // ============================================================================
  // MARKET INTELLIGENCE
  // ============================================================================

  /**
   * Analyze market trends
   */
  async analyzeMarketTrends(data: {
    industry: string
    keywords: string[]
    geographic_scope?: string
    time_period?: string
  }): Promise<{
    trend_analysis: {
      trending_up: string[]
      trending_down: string[]
      stable_trends: string[]
      emerging_opportunities: string[]
    }
    market_data: {
      market_size: number
      growth_rate: number
      key_segments: Record<string, any>
      seasonal_patterns: Record<string, any>
    }
    recommendations: Array<{
      trend: string
      recommendation: string
      confidence: number
      timeline: string
    }>
    data_sources: string[]
    analysis_date: string
  }> {
    return this.post('/api/intelligence/market/trends', data)
  }

  /**
   * Get audience insights
   */
  async getAudienceInsights(campaignId: string, audienceData?: {
    demographics?: Record<string, any>
    psychographics?: Record<string, any>
    behavioral_data?: Record<string, any>
  }): Promise<{
    audience_profile: {
      primary_segments: Array<{
        name: string
        size: number
        characteristics: Record<string, any>
        preferences: string[]
        pain_points: string[]
      }>
      communication_preferences: {
        channels: string[]
        messaging_style: string
        content_types: string[]
        timing_preferences: Record<string, any>
      }
    }
    insights: Array<{
      insight: string
      confidence: number
      actionable_steps: string[]
    }>
    recommendations: {
      messaging_strategy: string[]
      channel_strategy: string[]
      content_strategy: string[]
    }
  }> {
    const requestData = { campaign_id: campaignId, ...audienceData }
    return this.post('/api/intelligence/audience/insights', requestData)
  }

  // ============================================================================
  // INTELLIGENCE MANAGEMENT
  // ============================================================================

  /**
   * Update intelligence entry
   */
  async updateIntelligence(intelligenceId: string, updates: {
    tags?: string[]
    notes?: string
    confidence_override?: number
    status?: string
    custom_metadata?: Record<string, any>
  }): Promise<{
    intelligence_id: string
    updated_fields: string[]
    message: string
    updated_at: string
  }> {
    return this.put(`/api/intelligence/${intelligenceId}`, updates)
  }

  /**
   * Delete intelligence entry
   */
  async deleteIntelligence(intelligenceId: string): Promise<{
    intelligence_id: string
    message: string
  }> {
    return this.delete(`/api/intelligence/${intelligenceId}`)
  }

  /**
   * Archive intelligence entry
   */
  async archiveIntelligence(intelligenceId: string): Promise<{
    intelligence_id: string
    status: string
    message: string
  }> {
    return this.post(`/api/intelligence/${intelligenceId}/archive`)
  }

  /**
   * Export intelligence data
   */
  async exportIntelligence(campaignId: string, format: 'json' | 'csv' | 'pdf' = 'json'): Promise<{
    export_id: string
    format: string
    download_url: string
    expires_at: string
  }> {
    return this.post(`/api/intelligence/export/${campaignId}`, { format })
  }

  // ============================================================================
  // INTELLIGENCE INSIGHTS & RECOMMENDATIONS
  // ============================================================================

  /**
   * Get actionable insights from intelligence - FIXED
   */
  async getActionableInsights(campaignId: string, focus?: string[]): Promise<ActionableInsightsResponse> {
    const params: Record<string, string> = {}
    
    if (focus && focus.length > 0) {
      params.focus_areas = focus.join(',')
    }
    
    return this.get(`/api/intelligence/${campaignId}/insights`, params)
  }

  /**
   * Generate intelligence report
   */
  async generateIntelligenceReport(campaignId: string, reportType: 'executive' | 'detailed' | 'competitive' | 'market'): Promise<{
    report_id: string
    report_type: string
    status: 'generating' | 'completed' | 'failed'
    download_url?: string
    sections: Array<{
      title: string
      status: 'completed' | 'processing'
      insights_count: number
    }>
    estimated_completion: string
  }> {
    return this.post(`/api/intelligence/${campaignId}/reports`, { report_type: reportType })
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Validate URL for analysis
   */
  validateUrlForAnalysis(url: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    try {
      const urlObj = new URL(url)
      
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        errors.push('URL must use HTTP or HTTPS protocol')
      }
      
      if (urlObj.hostname === 'localhost' || urlObj.hostname.startsWith('127.')) {
        errors.push('Cannot analyze localhost URLs')
      }
      
    } catch {
      errors.push('Invalid URL format')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Calculate intelligence confidence score
   */
  calculateConfidenceScore(factors: {
    source_reliability: number  // 0-1
    data_freshness: number     // 0-1
    analysis_depth: number     // 0-1
    verification_status: number // 0-1
  }): number {
    const weights = {
      source_reliability: 0.3,
      data_freshness: 0.2,
      analysis_depth: 0.3,
      verification_status: 0.2
    }
    
    const score = Object.entries(factors).reduce((total, [key, value]) => {
      return total + (value * weights[key as keyof typeof weights])
    }, 0)
    
    return Math.round(score * 100)
  }

  /**
   * Get intelligence quality metrics
   */
  getIntelligenceQualityMetrics(intelligence: any): {
    overall_quality: 'excellent' | 'good' | 'fair' | 'poor'
    quality_score: number
    factors: {
      completeness: number
      accuracy: number
      relevance: number
      actionability: number
    }
    recommendations: string[]
  } {
    const factors = {
      completeness: this.calculateCompleteness(intelligence),
      accuracy: intelligence.confidence_score || 0,
      relevance: this.calculateRelevance(intelligence),
      actionability: this.calculateActionability(intelligence)
    }
    
    const quality_score = Object.values(factors).reduce((sum, score) => sum + score, 0) / 4
    
    let overall_quality: 'excellent' | 'good' | 'fair' | 'poor'
    if (quality_score >= 85) overall_quality = 'excellent'
    else if (quality_score >= 70) overall_quality = 'good'
    else if (quality_score >= 50) overall_quality = 'fair'
    else overall_quality = 'poor'
    
    const recommendations = this.generateQualityRecommendations(factors)
    
    return {
      overall_quality,
      quality_score,
      factors,
      recommendations
    }
  }

  /**
   * Calculate data completeness score
   */
  private calculateCompleteness(intelligence: any): number {
    const requiredFields = [
      'offer_intelligence',
      'psychology_intelligence',
      'source_title',
      'source_type'
    ]
    
    const optionalFields = [
      'competitive_intelligence',
      'content_intelligence',
      'brand_intelligence'
    ]
    
    let score = 0
    const totalWeight = requiredFields.length * 20 + optionalFields.length * 5
    
    // Required fields (20 points each)
    requiredFields.forEach(field => {
      if (intelligence[field] && Object.keys(intelligence[field]).length > 0) {
        score += 20
      }
    })
    
    // Optional fields (5 points each)
    optionalFields.forEach(field => {
      if (intelligence[field] && Object.keys(intelligence[field]).length > 0) {
        score += 5
      }
    })
    
    return Math.min((score / totalWeight) * 100, 100)
  }

  /**
   * Calculate relevance score
   */
  private calculateRelevance(intelligence: any): number {
    let score = 50 // Base score
    
    // Boost score based on intelligence richness
    if (intelligence.offer_intelligence?.main_benefits) score += 15
    if (intelligence.psychology_intelligence?.emotional_triggers) score += 15
    if (intelligence.competitive_intelligence) score += 10
    if (intelligence.source_url && intelligence.source_url.includes('https')) score += 5
    if (intelligence.processing_metadata?.keywords_extracted > 10) score += 5
    
    return Math.min(score, 100)
  }

  /**
   * Calculate actionability score
   */
  private calculateActionability(intelligence: any): number {
    let score = 0
    
    // Check for actionable insights
    if (intelligence.campaign_suggestions?.length > 0) score += 30
    if (intelligence.competitive_opportunities?.length > 0) score += 25
    if (intelligence.offer_intelligence?.key_features) score += 20
    if (intelligence.psychology_intelligence?.target_audience) score += 15
    if (intelligence.processing_metadata?.action_items) score += 10
    
    return Math.min(score, 100)
  }

  /**
   * Generate quality improvement recommendations
   */
  private generateQualityRecommendations(factors: Record<string, number>): string[] {
    const recommendations: string[] = []
    
    if (factors.completeness < 70) {
      recommendations.push('Gather more comprehensive data from additional sources')
    }
    
    if (factors.accuracy < 70) {
      recommendations.push('Verify intelligence with multiple sources')
    }
    
    if (factors.relevance < 70) {
      recommendations.push('Focus analysis on campaign-specific insights')
    }
    
    if (factors.actionability < 70) {
      recommendations.push('Generate more specific, actionable recommendations')
    }
    
    return recommendations
  }

  /**
   * Extract key insights from intelligence data
   */
  extractKeyInsights(intelligence: any): Array<{
    type: string
    insight: string
    confidence: number
    source: string
  }> {
    const insights: Array<{
      type: string
      insight: string
      confidence: number
      source: string
    }> = []
    
    // Extract from offer intelligence
    if (intelligence.offer_intelligence?.main_benefits) {
      insights.push({
        type: 'value_proposition',
        insight: `Key benefits: ${intelligence.offer_intelligence.main_benefits}`,
        confidence: intelligence.confidence_score || 0,
        source: 'offer_analysis'
      })
    }
    
    // Extract from psychology intelligence
    if (intelligence.psychology_intelligence?.emotional_triggers) {
      insights.push({
        type: 'psychology',
        insight: `Emotional triggers: ${intelligence.psychology_intelligence.emotional_triggers}`,
        confidence: intelligence.confidence_score || 0,
        source: 'psychology_analysis'
      })
    }
    
    // Extract from competitive intelligence
    if (intelligence.competitive_opportunities?.length > 0) {
      insights.push({
        type: 'competitive',
        insight: `Opportunities: ${intelligence.competitive_opportunities.join(', ')}`,
        confidence: intelligence.confidence_score || 0,
        source: 'competitive_analysis'
      })
    }
    
    return insights
  }

  /**
   * Format intelligence for different output types
   */
  formatIntelligence(intelligence: any, format: 'summary' | 'detailed' | 'actionable'): string {
    switch (format) {
      case 'summary':
        return this.formatIntelligenceSummary(intelligence)
      case 'detailed':
        return this.formatIntelligenceDetailed(intelligence)
      case 'actionable':
        return this.formatIntelligenceActionable(intelligence)
      default:
        return JSON.stringify(intelligence, null, 2)
    }
  }

  /**
   * Format intelligence as summary
   */
  private formatIntelligenceSummary(intelligence: any): string {
    const insights = this.extractKeyInsights(intelligence)
    const keyPoints = insights.map(insight => `• ${insight.insight}`).join('\n')
    
    return `# Intelligence Summary: ${intelligence.source_title}

**Source:** ${intelligence.source_type}
**Confidence:** ${intelligence.confidence_score}%
**Analyzed:** ${intelligence.created_at}

## Key Insights
${keyPoints}

## Quick Actions
${intelligence.campaign_suggestions?.slice(0, 3).map((s: string) => `• ${s}`).join('\n') || 'No specific actions identified'}
`
  }

  /**
   * Format intelligence as detailed report
   */
  private formatIntelligenceDetailed(intelligence: any): string {
    return `# Detailed Intelligence Report: ${intelligence.source_title}

## Source Information
- **Type:** ${intelligence.source_type}
- **URL:** ${intelligence.source_url || 'N/A'}
- **Confidence Score:** ${intelligence.confidence_score}%
- **Analysis Date:** ${intelligence.created_at}

## Offer Intelligence
${JSON.stringify(intelligence.offer_intelligence, null, 2)}

## Psychology Intelligence
${JSON.stringify(intelligence.psychology_intelligence, null, 2)}

## Competitive Analysis
${intelligence.competitive_opportunities?.length > 0 ? 
  intelligence.competitive_opportunities.map((opp: string) => `- ${opp}`).join('\n') : 
  'No competitive opportunities identified'}

## Recommendations
${intelligence.campaign_suggestions?.map((suggestion: string) => `- ${suggestion}`).join('\n') || 'No specific recommendations'}

## Processing Metadata
${JSON.stringify(intelligence.processing_metadata, null, 2)}
`
  }

  /**
   * Format intelligence as actionable checklist
   */
  private formatIntelligenceActionable(intelligence: any): string {
    const actions = intelligence.campaign_suggestions || []
    const opportunities = intelligence.competitive_opportunities || []
    
    return `# Actionable Intelligence: ${intelligence.source_title}

## Immediate Actions
${actions.slice(0, 5).map((action: string, index: number) => `${index + 1}. ${action}`).join('\n')}

## Competitive Opportunities
${opportunities.slice(0, 3).map((opp: string, index: number) => `${index + 1}. ${opp}`).join('\n')}

## Key Messaging Insights
${intelligence.psychology_intelligence?.emotional_triggers ? 
  `- Focus on: ${intelligence.psychology_intelligence.emotional_triggers}` : 
  '- No specific messaging insights available'}

## Value Proposition
${intelligence.offer_intelligence?.main_benefits ? 
  `- Highlight: ${intelligence.offer_intelligence.main_benefits}` : 
  '- No value proposition insights available'}

---
*Confidence Level: ${intelligence.confidence_score}% | Generated: ${intelligence.created_at}*
`
  }
}