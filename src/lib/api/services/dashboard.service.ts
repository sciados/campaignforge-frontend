// src/lib/api/services/dashboard.service.ts - Dashboard Service Implementation

import { BaseApiClient } from '../core/client'
import { ENDPOINTS } from '../config'

/**
 * Dashboard Service - Complete dashboard and company data management
 * Handles all dashboard-related operations, company stats, and system health
 */
export class DashboardService extends BaseApiClient {

  // ============================================================================
  // COMPANY STATISTICS
  // ============================================================================

  /**
   * Get company statistics and dashboard overview
   */
  async getCompanyStats(): Promise<{
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
  }> {
    return this.get(ENDPOINTS.DASHBOARD.STATS)
  }

  /**
   * Get detailed company information
   */
  async getCompanyDetails(): Promise<{
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
  }> {
    return this.get(ENDPOINTS.DASHBOARD.COMPANY)
  }

  // ============================================================================
  // SYSTEM HEALTH & MONITORING
  // ============================================================================

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<{
    status: string
    version: string
    features: Record<string, boolean>
    timestamp: string
  }> {
    return this.get('/api/health')
  }

  /**
   * Get detailed system status
   */
  async getSystemStatus(): Promise<{
    application: string
    version: string
    environment: string
    database: string
    routers: Record<string, boolean>
    models: Record<string, boolean>
    systems: Record<string, any>
  }> {
    return this.get('/api/status')
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Check if company is on trial
   */
  isOnTrial(companyStats: any): boolean {
    return companyStats.subscription_tier === 'trial' || 
           companyStats.subscription_status === 'trial'
  }

  /**
   * Calculate usage percentage
   */
  calculateUsagePercentage(used: number, limit: number): number {
    if (limit === 0) return 0
    return Math.min((used / limit) * 100, 100)
  }

  /**
   * Get usage status (low/medium/high/critical)
   */
  getUsageStatus(percentage: number): 'low' | 'medium' | 'high' | 'critical' {
    if (percentage < 50) return 'low'
    if (percentage < 75) return 'medium'
    if (percentage < 90) return 'high'
    return 'critical'
  }

  /**
   * Format credits for display
   */
  formatCredits(credits: number): string {
    if (credits >= 1000000) {
      return `${(credits / 1000000).toFixed(1)}M`
    }
    if (credits >= 1000) {
      return `${(credits / 1000).toFixed(1)}K`
    }
    return credits.toLocaleString()
  }

  /**
   * Get subscription tier color
   */
  getSubscriptionTierColor(tier: string): string {
    switch (tier.toLowerCase()) {
      case 'enterprise': return 'text-purple-600'
      case 'professional': return 'text-blue-600'
      case 'starter': return 'text-green-600'
      case 'trial': return 'text-yellow-600'
      case 'free': return 'text-gray-600'
      default: return 'text-gray-500'
    }
  }

  /**
   * Check if upgrade is recommended
   */
  shouldRecommendUpgrade(stats: any): boolean {
    const usagePercentage = this.calculateUsagePercentage(
      stats.monthly_credits_used, 
      stats.monthly_credits_limit
    )
    
    return usagePercentage > 80 || 
           stats.subscription_tier === 'trial' ||
           stats.subscription_tier === 'free'
  }
}