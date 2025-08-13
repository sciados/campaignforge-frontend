// src/lib/api.ts - Working Bridge API (Fixed with DashboardService)
/**
 * WORKING BRIDGE API - Maintains backward compatibility
 * 
 * This file provides a working bridge between the old monolithic API
 * and the new modular service structure. It uses the actual services
 * under the hood while maintaining the old interface.
 * 
 * ✅ FIXED: Added DashboardService for proper company data handling
 */

// Import the actual services
import { EmailService } from './api/services/emails.service'
import { CampaignService } from './api/services/campaigns.service'
import { IntelligenceService } from './api/services/intelligence.service'
import { AuthService } from './api/services/auth.service'
import { ContentService } from './api/services/content.service'
import { DashboardService } from './api/services/dashboard.service'  // ✅ NEW

// Import types
import type { 
  Campaign,
  User,
  GeneratedContent,
  EmailGenerationRequest,
  EmailGenerationResponse,
  PerformanceTrackingRequest,
  PerformanceTrackingResponse,
  LearningAnalyticsResponse,
  EmailSystemHealthResponse
} from './api'

import type { DemoPreference, DemoToggleResponse } from './types/emails'

// Import utilities
import { getAuthToken, setAuthToken, clearAuthToken } from './api/config'
import { ApiError, CreditError } from './types/api'

// ============================================================================
// WORKING API CLIENT CLASS
// ============================================================================

class WorkingApiClient {
  // Service instances
  private emailService = new EmailService()
  private campaignService = new CampaignService()
  private intelligenceService = new IntelligenceService()
  private authService = new AuthService()
  private contentService = new ContentService()
  private dashboardService = new DashboardService()  // ✅ NEW

  // ============================================================================
  // EMAIL GENERATION METHODS
  // ============================================================================
  
  async generateEnhancedEmails(request: EmailGenerationRequest): Promise<EmailGenerationResponse> {
    return this.emailService.generateEnhancedEmails(request)
  }
  
  async trackEmailPerformance(request: PerformanceTrackingRequest): Promise<PerformanceTrackingResponse> {
    return this.emailService.trackEmailPerformance(request)
  }
  
  async getEmailLearningAnalytics(): Promise<LearningAnalyticsResponse> {
    return this.emailService.getLearningAnalytics()
  }
  
  async getEmailSystemHealth(): Promise<EmailSystemHealthResponse> {
    return this.emailService.getSystemHealth()
  }
  
  async seedEmailTemplates(forceReseed: boolean = false) {
    return this.emailService.seedTemplates(forceReseed)
  }
  
  async triggerEmailLearning(daysBack: number = 7) {
    return this.emailService.triggerLearning(daysBack)
  }
  
  async testEnhancedEmailGeneration(productName: string = 'TestProduct', sequenceLength: number = 3, useLearning: boolean = true) {
    return this.emailService.testGeneration(productName, sequenceLength, useLearning)
  }
  
  async getEnhancedEmailSystemStatus() {
    return this.emailService.getSystemStatus()
  }

  // ============================================================================
  // CAMPAIGN METHODS
  // ============================================================================
  
  async createCampaign(campaignData: any): Promise<Campaign> {
    return this.campaignService.createCampaign(campaignData)
  }
  
  async getCampaigns(params?: {
    page?: number
    limit?: number
    status_filter?: string
    search?: string
    skip?: number
  }): Promise<Campaign[]> {
    return this.campaignService.getCampaigns(params)
  }
  
  async getCampaign(campaignId: string): Promise<Campaign> {
    return this.campaignService.getCampaign(campaignId)
  }
  
  async updateCampaign(campaignId: string, updates: Partial<Campaign>): Promise<Campaign> {
    return this.campaignService.updateCampaign(campaignId, updates)
  }
  
  async deleteCampaign(campaignId: string): Promise<{ message: string }> {
    return this.campaignService.deleteCampaign(campaignId)
  }

  async duplicateCampaign(campaignId: string): Promise<Campaign> {
    return this.campaignService.duplicateCampaign(campaignId)
  }

  // ============================================================================
  // AUTHENTICATION METHODS
  // ============================================================================
  
  async login(credentials: { email: string; password: string }) {
    return this.authService.login(credentials)
  }
  
  async register(data: { email: string; password: string; full_name: string }) {
    return this.authService.register(data)
  }
  
  async logout(): Promise<void> {
    return this.authService.logout()
  }
  
  async getUserProfile(): Promise<User> {
    return this.authService.getUserProfile()
  }

  // ============================================================================
  // CONTENT METHODS
  // ============================================================================
  
  async generateContent(data: {
    content_type: string
    campaign_id: string
    preferences?: Record<string, any>
  }): Promise<GeneratedContent> {
    return this.contentService.generateContent(data)
  }
  
  async getGeneratedContent(campaignId: string): Promise<any[]> {
  // ✅ FIX: Use the direct method that works
  return this.contentService.getGeneratedContent(campaignId)  // This method uses direct fetch
}

async getContentList(campaignId: string, includeBody = false, contentType?: string) {
  // ✅ FIX: Use the proper service method
  return this.contentService.getContentList(campaignId, includeBody, contentType)
}

  async getContentDetail(campaignId: string, contentId: string) {
    return this.contentService.getContentDetail(campaignId, contentId)
  }

  async updateContent(campaignId: string, contentId: string, updateData: any) {
    return this.contentService.updateContent(campaignId, contentId, updateData)
  }

  async deleteContent(campaignId: string, contentId: string) {
    return this.contentService.deleteContent(campaignId, contentId)
  }

  // ============================================================================
  // INTELLIGENCE METHODS
  // ============================================================================
  
  async analyzeURL(data: {
    url: string
    campaign_id: string
    analysis_type?: string
  }) {
    return this.intelligenceService.analyzeURL(data)
  }
  
  async uploadDocument(file: File, campaignId: string) {
    return this.intelligenceService.uploadDocument(file, campaignId)
  }
  
  async getCampaignIntelligence(
    campaignId: string, 
    skip: number = 0, 
    limit: number = 50,
    intelligenceType?: string
  ) {
    return this.intelligenceService.getCampaignIntelligence(campaignId, {
      skip,
      limit,
      intelligence_type: intelligenceType
    })
  }

  // ============================================================================
  // WORKFLOW METHODS
  // ============================================================================
  
  async getWorkflowState(campaignId: string) {
    return this.campaignService.getWorkflowState(campaignId)
  }
  
  async saveWorkflowProgress(campaignId: string, progressData: any) {
    return this.campaignService.saveWorkflowProgress(campaignId, progressData)
  }

  // ============================================================================
  // DASHBOARD METHODS - FIXED WITH PROPER SERVICE ARCHITECTURE
  // ============================================================================

  async getDashboardStats() {
    return this.campaignService.getDashboardStats()  // Campaign-specific stats
  }

  async getCampaignStats() {
    return this.campaignService.getCampaignStats()   // Campaign-specific stats
  }

  // ✅ FIXED: Use DashboardService for company data
  async getCompanyStats() {
    return this.dashboardService.getCompanyStats()   // Uses /api/dashboard/stats
  }

  async getCompanyDetails() {
    return this.dashboardService.getCompanyDetails() // Uses /api/dashboard/company
  }

  // ✅ NEW: Additional system methods
  async getSystemHealth() {
    return this.dashboardService.getSystemHealth()
  }

  async getSystemStatus() {
    return this.dashboardService.getSystemStatus()
  }

  // ============================================================================
  // DEMO METHODS
  // ============================================================================
  
  async getDemoPreferences(): Promise<DemoPreference> {
    return this.campaignService.getDemoPreferences()
  }
  
  async updateDemoPreferences(preferences: Partial<DemoPreference>): Promise<DemoPreference> {
    return this.campaignService.updateDemoPreferences(preferences)
  }
  
  async toggleDemoVisibility(): Promise<DemoToggleResponse> {
    return this.campaignService.toggleDemoVisibility()
  }

  async getDemoManagementInfo() {
    return this.campaignService.getDemoManagementInfo()
  }

  async createDemoManually() {
    return this.campaignService.createDemoManually()
  }

  async getCampaignsWithDemo(skip = 0, limit = 100) {
    return this.campaignService.getCampaignsWithDemo(skip, limit)
  }

  // ============================================================================
  // TOKEN MANAGEMENT
  // ============================================================================
  
  setAuthToken = setAuthToken
  clearAuthToken = clearAuthToken
  getAuthToken = getAuthToken
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const apiClient = new WorkingApiClient()

// ============================================================================
// REACT HOOK
// ============================================================================

export const useApi = () => {
  return {
    // Authentication
    login: apiClient.login.bind(apiClient),
    register: apiClient.register.bind(apiClient),
    logout: apiClient.logout.bind(apiClient),
    getUserProfile: apiClient.getUserProfile.bind(apiClient),
    
    // Enhanced email generation methods
    generateEnhancedEmails: apiClient.generateEnhancedEmails.bind(apiClient),
    trackEmailPerformance: apiClient.trackEmailPerformance.bind(apiClient),
    getEmailLearningAnalytics: apiClient.getEmailLearningAnalytics.bind(apiClient),
    getEmailSystemHealth: apiClient.getEmailSystemHealth.bind(apiClient),
    seedEmailTemplates: apiClient.seedEmailTemplates.bind(apiClient),
    triggerEmailLearning: apiClient.triggerEmailLearning.bind(apiClient),
    testEnhancedEmailGeneration: apiClient.testEnhancedEmailGeneration.bind(apiClient),
    getEnhancedEmailSystemStatus: apiClient.getEnhancedEmailSystemStatus.bind(apiClient),
    
    // Demo preference methods
    getDemoPreferences: apiClient.getDemoPreferences.bind(apiClient),
    updateDemoPreferences: apiClient.updateDemoPreferences.bind(apiClient),
    toggleDemoVisibility: apiClient.toggleDemoVisibility.bind(apiClient),
    getDemoManagementInfo: apiClient.getDemoManagementInfo.bind(apiClient),
    createDemoManually: apiClient.createDemoManually.bind(apiClient),
    getCampaignsWithDemo: apiClient.getCampaignsWithDemo.bind(apiClient),
    
    // Campaign operations
    createCampaign: apiClient.createCampaign.bind(apiClient),
    getCampaigns: apiClient.getCampaigns.bind(apiClient),
    getCampaign: apiClient.getCampaign.bind(apiClient),
    updateCampaign: apiClient.updateCampaign.bind(apiClient),
    deleteCampaign: apiClient.deleteCampaign.bind(apiClient),
    duplicateCampaign: apiClient.duplicateCampaign.bind(apiClient),
    
    // Content management
    getGeneratedContent: apiClient.getGeneratedContent.bind(apiClient),
    getContentList: apiClient.getContentList.bind(apiClient),
    getContentDetail: apiClient.getContentDetail.bind(apiClient),
    updateContent: apiClient.updateContent.bind(apiClient),
    deleteContent: apiClient.deleteContent.bind(apiClient),
    
    // Workflow operations
    getWorkflowState: apiClient.getWorkflowState.bind(apiClient),
    saveWorkflowProgress: apiClient.saveWorkflowProgress.bind(apiClient),
    
    // Intelligence operations
    analyzeURL: apiClient.analyzeURL.bind(apiClient),
    uploadDocument: apiClient.uploadDocument.bind(apiClient),
    generateContent: apiClient.generateContent.bind(apiClient),
    getCampaignIntelligence: apiClient.getCampaignIntelligence.bind(apiClient),
    
    // Dashboard - proper service architecture
    getDashboardStats: apiClient.getDashboardStats.bind(apiClient),
    getCampaignStats: apiClient.getCampaignStats.bind(apiClient),
    getCompanyStats: apiClient.getCompanyStats.bind(apiClient),      // ✅ Now uses DashboardService
    getCompanyDetails: apiClient.getCompanyDetails.bind(apiClient),  // ✅ Now uses DashboardService
    getSystemHealth: apiClient.getSystemHealth.bind(apiClient),      // ✅ NEW
    getSystemStatus: apiClient.getSystemStatus.bind(apiClient),      // ✅ NEW
    
    // Token management
    setAuthToken: apiClient.setAuthToken,
    clearAuthToken: apiClient.clearAuthToken,
    getAuthToken: apiClient.getAuthToken
  }
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

// Re-export types for backward compatibility
export type {
  Campaign,
  User,
  GeneratedContent,
  EmailGenerationRequest,
  EmailGenerationResponse,
  PerformanceTrackingRequest,
  PerformanceTrackingResponse,
  LearningAnalyticsResponse,
  EmailSystemHealthResponse,
  DemoPreference,
  DemoToggleResponse
} from './api/'

export type { DemoPreference as DemoPreferenceType, DemoToggleResponse as DemoToggleResponseType } from './types/emails'

// ============================================================================
// ERROR UTILITIES
// ============================================================================

export { ApiError, CreditError }

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

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default apiClient