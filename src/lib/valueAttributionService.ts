// src/lib/valueAttributionService.ts
/**
 * CampaignForge Value Attribution Service
 *
 * Tracks the effectiveness and value that CampaignForge provides to product creators
 * by measuring platform usage, AI feature adoption, and attributed performance.
 */

import { trackCampaignUsage, trackPerformanceAttribution } from './api'

export interface ValueAttributionData {
  campaign_id: string
  affiliate_user_id: string
  product_sku: string
  platform: string
  content_types_used: string[]
  ai_features_used: string[]
}

export interface PerformanceAttributionData {
  campaign_id: string
  performance_metrics: {
    clicks?: number
    conversions?: number
    revenue_attributed?: number
    content_performance?: Record<string, any>
  }
  attribution_markers: {
    confidence_score?: number
    ai_enhancement_impact?: Record<string, any>
  }
}

class ValueAttributionService {
  /**
   * Track when an affiliate creates a campaign using CampaignForge features
   */
  async trackCampaignCreation(data: ValueAttributionData): Promise<void> {
    try {
      await trackCampaignUsage(data)
      console.log('✅ Campaign usage tracked for value attribution:', data.campaign_id)
    } catch (error) {
      console.error('❌ Failed to track campaign usage:', error)
      // Don't throw - this shouldn't break the main workflow
    }
  }

  /**
   * Track performance that can be attributed to CampaignForge platform features
   */
  async trackAttributedPerformance(data: PerformanceAttributionData): Promise<void> {
    try {
      await trackPerformanceAttribution(data)
      console.log('✅ Performance attribution tracked:', data.campaign_id)
    } catch (error) {
      console.error('❌ Failed to track performance attribution:', error)
      // Don't throw - this shouldn't break the main workflow
    }
  }

  /**
   * Track content generation usage for value attribution
   */
  async trackContentGeneration(
    campaignId: string,
    affiliateUserId: string,
    productSku: string,
    platform: string,
    contentType: 'email' | 'social_media' | 'ad_copy' | 'landing_page',
    aiFeatures: string[]
  ): Promise<void> {
    const data: ValueAttributionData = {
      campaign_id: campaignId,
      affiliate_user_id: affiliateUserId,
      product_sku: productSku,
      platform: platform,
      content_types_used: [contentType],
      ai_features_used: aiFeatures
    }

    await this.trackCampaignCreation(data)
  }

  /**
   * Track AI analysis usage for value attribution
   */
  async trackIntelligenceUsage(
    campaignId: string,
    affiliateUserId: string,
    productSku: string,
    platform: string,
    analysisTypes: string[]
  ): Promise<void> {
    const data: ValueAttributionData = {
      campaign_id: campaignId,
      affiliate_user_id: affiliateUserId,
      product_sku: productSku,
      platform: platform,
      content_types_used: ['intelligence_analysis'],
      ai_features_used: analysisTypes
    }

    await this.trackCampaignCreation(data)
  }

  /**
   * Helper to determine AI features used based on campaign workflow
   */
  getAiFeaturesFromWorkflow(workflow: {
    hasIntelligenceAnalysis?: boolean
    hasContentGeneration?: boolean
    hasOptimization?: boolean
    hasPersonalization?: boolean
  }): string[] {
    const features: string[] = []

    if (workflow.hasIntelligenceAnalysis) {
      features.push('ai_analysis', 'product_intelligence')
    }
    if (workflow.hasContentGeneration) {
      features.push('content_generation', 'ai_copywriting')
    }
    if (workflow.hasOptimization) {
      features.push('content_optimization')
    }
    if (workflow.hasPersonalization) {
      features.push('personalization')
    }

    return features
  }

  /**
   * Helper to determine platform from URL
   */
  getPlatformFromUrl(url: string): string {
    const urlLower = url.toLowerCase()

    if (urlLower.includes('clickbank')) return 'clickbank'
    if (urlLower.includes('jvzoo')) return 'jvzoo'
    if (urlLower.includes('warriorplus')) return 'warriorplus'

    return 'unknown'
  }

  /**
   * Calculate attribution confidence based on CampaignForge feature usage
   */
  calculateAttributionConfidence(aiFeatures: string[], contentTypes: string[]): number {
    let confidence = 0.5 // Base confidence

    // Increase confidence based on AI feature usage
    if (aiFeatures.includes('ai_analysis')) confidence += 0.2
    if (aiFeatures.includes('content_generation')) confidence += 0.2
    if (aiFeatures.includes('content_optimization')) confidence += 0.1
    if (aiFeatures.includes('personalization')) confidence += 0.1

    // Cap at 0.95 to remain realistic
    return Math.min(confidence, 0.95)
  }
}

// Global service instance
export const valueAttributionService = new ValueAttributionService()

export default valueAttributionService