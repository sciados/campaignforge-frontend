// src/lib/api/services/campaigns.service.ts - Complete Campaign Service

import { BaseApiClient } from '../core/client'
import { ENDPOINTS } from '../config'
import type { Campaign } from '../../types/campaign'
import type { 
  WorkflowStateResponse,
  WorkflowProgressData,
  CampaignStats 
} from '../../types/api'
import type { DashboardStats } from '@/lib/types/auth'
import type { DemoPreference, DemoToggleResponse } from '../../types/emails'

/**
 * Campaign Service - Complete campaign management
 * Handles all campaign CRUD operations, workflow management, and demo features
 */
export class CampaignService extends BaseApiClient {

  // ============================================================================
  // CAMPAIGN CRUD OPERATIONS
  // ============================================================================

  /**
   * Create a new campaign with enhanced workflow support
   */
  async createCampaign(campaignData: any): Promise<Campaign> {
    const dataWithDefaults = {
      campaign_type: 'universal',
      auto_analysis_enabled: campaignData.auto_analysis_enabled ?? true,
      content_types: campaignData.content_types || ["email", "social_post", "ad_copy"],
      content_tone: campaignData.content_tone || "conversational",
      content_style: campaignData.content_style || "modern",
      generate_content_after_analysis: campaignData.generate_content_after_analysis ?? false,
      ...campaignData
    }
    
    console.log('🚀 Creating campaign with data:', dataWithDefaults)
    
    return this.post<Campaign>(ENDPOINTS.CAMPAIGNS.BASE, dataWithDefaults)
  }

  /**
   * Get campaigns with pagination and filtering
   */
  async getCampaigns(params?: {
    page?: number
    limit?: number
    status_filter?: string
    search?: string
    skip?: number
  }): Promise<Campaign[]> {
    console.log('🔍 Getting campaigns with params:', params)
    
    try {
      const campaigns = await this.get<Campaign[]>(ENDPOINTS.CAMPAIGNS.BASE, params)
      
      if (Array.isArray(campaigns)) {
        const demoCampaigns = campaigns.filter((c: Campaign) => c.is_demo)
        const realCampaigns = campaigns.filter((c: Campaign) => !c.is_demo)
        const autoAnalysisEnabled = campaigns.filter((c: Campaign) => c.auto_analysis_enabled).length
        
        console.log(`📊 Campaigns loaded: ${realCampaigns.length} real, ${demoCampaigns.length} demo`)
        console.log(`🔬 Auto-analysis enabled: ${autoAnalysisEnabled}/${campaigns.length} campaigns`)
      }
      
      return campaigns
    } catch (error) {
      console.error('❌ getCampaigns error:', error)
      throw error
    }
  }

  /**
   * Get a single campaign by ID
   */
  async getCampaign(campaignId: string): Promise<Campaign> {
    return this.get<Campaign>(`${ENDPOINTS.CAMPAIGNS.BASE}/${campaignId}`)
  }

  /**
   * Update campaign data
   */
  async updateCampaign(campaignId: string, updates: Partial<Campaign>): Promise<Campaign> {
    return this.put<Campaign>(`${ENDPOINTS.CAMPAIGNS.BASE}/${campaignId}`, updates)
  }

  /**
   * Delete a campaign
   */
  async deleteCampaign(campaignId: string): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`${ENDPOINTS.CAMPAIGNS.BASE}/${campaignId}`)
  }

  /**
   * Duplicate a campaign
   */
  async duplicateCampaign(campaignId: string): Promise<Campaign> {
    return this.post<Campaign>(ENDPOINTS.CAMPAIGNS.DUPLICATE(campaignId))
  }

  // ============================================================================
  // WORKFLOW MANAGEMENT
  // ============================================================================

  /**
   * Get workflow state for a campaign
   */
  async getWorkflowState(campaignId: string): Promise<WorkflowStateResponse> {
    return this.get<WorkflowStateResponse>(ENDPOINTS.CAMPAIGNS.WORKFLOW_STATE(campaignId))
  }

  /**
   * Save workflow progress
   */
  async saveWorkflowProgress(campaignId: string, progressData: WorkflowProgressData): Promise<{
    success: boolean
    message: string
    campaign_id: string
    updated_workflow_state: string
    completion_percentage: number
    step_states: Record<string, any>
    auto_analysis_status: string
    updated_at: string
    is_demo: boolean
  }> {
    return this.post(ENDPOINTS.CAMPAIGNS.WORKFLOW_PROGRESS(campaignId), progressData)
  }

  // ============================================================================
  // CAMPAIGN STATISTICS
  // ============================================================================

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    return this.get<DashboardStats>(ENDPOINTS.CAMPAIGNS.STATS)
  }

  /**
   * Get campaign statistics
   */
  async getCampaignStats(): Promise<CampaignStats> {
    return this.get<CampaignStats>(ENDPOINTS.CAMPAIGNS.STATS)
  }

  // ============================================================================
  // DEMO CAMPAIGN MANAGEMENT
  // ============================================================================

  /**
   * Get user's demo preferences
   */
  async getDemoPreferences(): Promise<DemoPreference> {
    return this.get<DemoPreference>(ENDPOINTS.DEMO.PREFERENCES)
  }

  /**
   * Update demo preferences
   */
  async updateDemoPreferences(preferences: Partial<DemoPreference>): Promise<DemoPreference> {
    return this.post<DemoPreference>(ENDPOINTS.DEMO.PREFERENCES, preferences)
  }

  /**
   * Toggle demo campaign visibility
   */
  async toggleDemoVisibility(): Promise<DemoToggleResponse> {
    return this.post<DemoToggleResponse>(ENDPOINTS.DEMO.TOGGLE)
  }

  /**
   * Get demo management information
   */
  async getDemoManagementInfo(): Promise<any> {
    return this.get(ENDPOINTS.DEMO.STATUS)
  }

  /**
   * Create demo campaign manually
   */
  async createDemoManually(): Promise<any> {
    return this.post(ENDPOINTS.DEMO.CREATE)
  }

  /**
   * Get campaigns including demo campaigns
   */
  async getCampaignsWithDemo(skip = 0, limit = 100): Promise<Campaign[]> {
    const params = { skip: skip.toString(), limit: limit.toString() }
    return this.get<Campaign[]>(ENDPOINTS.CAMPAIGNS.BASE, params)
  }

  // ============================================================================
  // CAMPAIGN INTELLIGENCE INTEGRATION
  // ============================================================================

  /**
   * Get campaign intelligence
   */
  async getCampaignIntelligence(
    campaignId: string, 
    skip: number = 0, 
    limit: number = 50,
    intelligenceType?: string
  ) {
    const params: Record<string, string> = {
      skip: skip.toString(),
      limit: limit.toString()
    }
    if (intelligenceType) params.intelligence_type = intelligenceType
    
    return this.get(ENDPOINTS.CAMPAIGNS.INTELLIGENCE(campaignId), params)
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Check if campaign is a demo campaign
   */
  isDemoCampaign(campaign: Campaign): boolean {
    return campaign?.is_demo === true
  }

  /**
   * Filter campaigns by type
   */
  filterCampaigns(campaigns: Campaign[], showDemo: boolean): Campaign[] {
    if (showDemo) {
      return campaigns // Show all
    }
    return campaigns.filter(c => !this.isDemoCampaign(c)) // Hide demos
  }

  /**
   * Sort campaigns with smart demo positioning
   */
  sortCampaigns(campaigns: Campaign[], hasRealCampaigns: boolean): Campaign[] {
    return campaigns.sort((a, b) => {
      const aIsDemo = this.isDemoCampaign(a)
      const bIsDemo = this.isDemoCampaign(b)
      
      if (hasRealCampaigns) {
        // Real campaigns first, then demos
        if (aIsDemo !== bIsDemo) {
          return aIsDemo ? 1 : -1
        }
      } else {
        // Demo campaigns first for new users
        if (aIsDemo !== bIsDemo) {
          return aIsDemo ? -1 : 1
        }
      }
      
      // Sort by updated_at within same type
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })
  }

  /**
   * Get smart default for demo preference
   */
  getSmartDemoDefault(realCampaignsCount: number): boolean {
    // Show demo for new users (0-2 real campaigns)
    // Hide demo for experienced users (3+ real campaigns)
    return realCampaignsCount < 3
  }

  /**
   * Validate campaign data before creation
   */
  validateCampaignData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (!data.title) {
      errors.push('Campaign title is required')
    }
    
    if (data.title && data.title.length < 3) {
      errors.push('Campaign title must be at least 3 characters')
    }
    
    if (data.salespage_url && !this.isValidUrl(data.salespage_url)) {
      errors.push('Invalid sales page URL')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Check if URL is valid
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }
}