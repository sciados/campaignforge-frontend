// src/lib/api/index.ts - Fixed Main API Entry Point

import { useCallback, useEffect, useMemo, useState } from 'react'
import { BaseApiClient } from './core/client'
import { AuthService } from './services/auth.service'
import { CampaignService } from './services/campaigns.service'
import { ContentService } from './services/content.service'
import { EmailService } from './services/emails.service'
import { IntelligenceService } from './services/intelligence.service'

// ============================================================================
// CORE EXPORTS
// ============================================================================

export { BaseApiClient } from './core/client'
export { handleResponse, handleContentGenerationResponse } from './core/response-handler'

// ============================================================================
// TYPE EXPORTS (Resolved circular dependency issues)
// ============================================================================

// Core business types first
export type * from '../types/campaign'
export type * from '../types/inputSource'
export type * from '../types/output'

// API infrastructure types
// export type * from '../types/api'
export type * from '../types/emails'  
export type * from '../types/auth'

// Intelligence types (choose one to avoid conflicts)
// Since intelligence-api.ts re-exports intelligence.ts, we only need intelligence-api
// export type * from '../types/intelligence-api'

// If you prefer to use the base intelligence types instead, uncomment this and comment the line above:
export type * from '../types/intelligence'

// ============================================================================
// SERVICE EXPORTS
// ============================================================================

export { EmailService } from './services/emails.service'
export { CampaignService } from './services/campaigns.service'
export { AuthService } from './services/auth.service'
export { ContentService } from './services/content.service'
export { IntelligenceService } from './services/intelligence.service'

// ============================================================================
// HOOK EXPORTS
// ============================================================================

export { useEnhancedEmailGeneration, emailUtils } from './hooks/useEmails'

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

export { 
  getApiBaseUrl, 
  getAuthToken, 
  setAuthToken, 
  clearAuthToken,
  ENDPOINTS,
  API_CONFIG
} from './config'

// ============================================================================
// UNIFIED API CLIENT (Complete Production Version)
// ============================================================================

/**
 * Complete Unified API Client with all services
 * Production-ready with full feature set
 */
class ApiClient extends BaseApiClient {
  public email: EmailService
  public campaigns: CampaignService
  public auth: AuthService
  public content: ContentService
  public intelligence: IntelligenceService

  constructor() {
    super()
    this.email = new EmailService()
    this.campaigns = new CampaignService()
    this.auth = new AuthService()
    this.content = new ContentService()
    this.intelligence = new IntelligenceService()
  }

  // ============================================================================
  // LEGACY METHODS (For backward compatibility with existing api.ts)
  // ============================================================================

  // Email methods
  async generateEnhancedEmails(...args: Parameters<EmailService['generateEnhancedEmails']>) {
    return this.email.generateEnhancedEmails(...args)
  }

  async trackEmailPerformance(...args: Parameters<EmailService['trackEmailPerformance']>) {
    return this.email.trackEmailPerformance(...args)
  }

  async getEmailLearningAnalytics() {
    return this.email.getLearningAnalytics()
  }

  async getEmailSystemHealth() {
    return this.email.getSystemHealth()
  }

  async seedEmailTemplates(forceReseed?: boolean) {
    return this.email.seedTemplates(forceReseed)
  }

  async triggerEmailLearning(daysBack?: number) {
    return this.email.triggerLearning(daysBack)
  }

  async testEnhancedEmailGeneration(productName?: string, sequenceLength?: number, useLearning?: boolean) {
    return this.email.testGeneration(productName, sequenceLength, useLearning)
  }

  async getEnhancedEmailSystemStatus() {
    return this.email.getSystemStatus()
  }

  // Auth methods
  async login(...args: Parameters<AuthService['login']>) {
    return this.auth.login(...args)
  }

  async register(...args: Parameters<AuthService['register']>) {
    return this.auth.register(...args)
  }

  async logout() {
    return this.auth.logout()
  }

  async getUserProfile() {
    return this.auth.getUserProfile()
  }

  // Campaign methods
  async createCampaign(...args: Parameters<CampaignService['createCampaign']>) {
    return this.campaigns.createCampaign(...args)
  }

  async getCampaigns(...args: Parameters<CampaignService['getCampaigns']>) {
    return this.campaigns.getCampaigns(...args)
  }

  async getCampaign(campaignId: string) {
    return this.campaigns.getCampaign(campaignId)
  }

  async updateCampaign(...args: Parameters<CampaignService['updateCampaign']>) {
    return this.campaigns.updateCampaign(...args)
  }

  async deleteCampaign(campaignId: string) {
    return this.campaigns.deleteCampaign(campaignId)
  }

  async duplicateCampaign(campaignId: string) {
    return this.campaigns.duplicateCampaign(campaignId)
  }

  async getWorkflowState(campaignId: string) {
    return this.campaigns.getWorkflowState(campaignId)
  }

  async saveWorkflowProgress(...args: Parameters<CampaignService['saveWorkflowProgress']>) {
    return this.campaigns.saveWorkflowProgress(...args)
  }

  async getDashboardStats() {
    return this.campaigns.getDashboardStats()
  }

  async getCampaignStats() {
    return this.campaigns.getCampaignStats()
  }

  async getCompanyStats() {
    return this.auth.getCompanyStats()
  }

  async getCompanyDetails() {
    return this.auth.getCompanyDetails()
  }

  // Demo methods
  async getDemoPreferences() {
    return this.campaigns.getDemoPreferences()
  }

  async updateDemoPreferences(...args: Parameters<CampaignService['updateDemoPreferences']>) {
    return this.campaigns.updateDemoPreferences(...args)
  }

  async toggleDemoVisibility() {
    return this.campaigns.toggleDemoVisibility()
  }

  // Content methods
  async generateContent(...args: Parameters<ContentService['generateContent']>) {
    return this.content.generateContent(...args)
  }

  async getGeneratedContent(campaignId: string) {
    return this.content.getGeneratedContent(campaignId)
  }

  async getContentList(...args: Parameters<ContentService['getContentList']>) {
    return this.content.getContentList(...args)
  }

  async getContentDetail(...args: Parameters<ContentService['getContentDetail']>) {
    return this.content.getContentDetail(...args)
  }

  async updateContent(...args: Parameters<ContentService['updateContent']>) {
    return this.content.updateContent(...args)
  }

  async deleteContent(...args: Parameters<ContentService['deleteContent']>) {
    return this.content.deleteContent(...args)
  }

  async rateContent(...args: Parameters<ContentService['rateContent']>) {
    return this.content.rateContent(...args)
  }

  async publishContent(...args: Parameters<ContentService['publishContent']>) {
    return this.content.publishContent(...args)
  }

  async bulkContentAction(...args: Parameters<ContentService['bulkContentAction']>) {
    return this.content.bulkContentAction(...args)
  }

  async getContentStats(campaignId: string) {
    return this.content.getContentStats(campaignId)
  }

  async duplicateContent(...args: Parameters<ContentService['duplicateContent']>) {
    return this.content.duplicateContent(...args)
  }

  // Intelligence methods
  async analyzeURL(...args: Parameters<IntelligenceService['analyzeURL']>) {
    return this.intelligence.analyzeURL(...args)
  }

  async uploadDocument(...args: Parameters<IntelligenceService['uploadDocument']>) {
    return this.intelligence.uploadDocument(...args)
  }

  async getCampaignIntelligence(...args: Parameters<IntelligenceService['getCampaignIntelligence']>) {
    return this.intelligence.getCampaignIntelligence(...args)
  }

  async searchIntelligence(...args: Parameters<IntelligenceService['searchIntelligence']>) {
    return this.intelligence.searchIntelligence(...args)
  }

  async getActionableInsights(...args: Parameters<IntelligenceService['getActionableInsights']>) {
    return this.intelligence.getActionableInsights(...args)
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// ============================================================================
// MAIN REACT HOOK FOR API ACCESS (Complete Version)
// ============================================================================

export const useApi = () => {
  return {
    // New organized structure
    email: {
      generateEnhanced: apiClient.email.generateEnhancedEmails.bind(apiClient.email),
      trackPerformance: apiClient.email.trackEmailPerformance.bind(apiClient.email),
      getLearningAnalytics: apiClient.email.getLearningAnalytics.bind(apiClient.email),
      getSystemHealth: apiClient.email.getSystemHealth.bind(apiClient.email),
      seedTemplates: apiClient.email.seedTemplates.bind(apiClient.email),
      triggerLearning: apiClient.email.triggerLearning.bind(apiClient.email),
      testGeneration: apiClient.email.testGeneration.bind(apiClient.email),
      getSystemStatus: apiClient.email.getSystemStatus.bind(apiClient.email),
      initializeSystem: apiClient.email.initializeSystem.bind(apiClient.email),
      isSystemReady: apiClient.email.isSystemReady.bind(apiClient.email),
      getTemplateCount: apiClient.email.getTemplateCount.bind(apiClient.email)
    },

    campaigns: {
      create: apiClient.campaigns.createCampaign.bind(apiClient.campaigns),
      getAll: apiClient.campaigns.getCampaigns.bind(apiClient.campaigns),
      getById: apiClient.campaigns.getCampaign.bind(apiClient.campaigns),
      update: apiClient.campaigns.updateCampaign.bind(apiClient.campaigns),
      delete: apiClient.campaigns.deleteCampaign.bind(apiClient.campaigns),
      duplicate: apiClient.campaigns.duplicateCampaign.bind(apiClient.campaigns),
      getWorkflowState: apiClient.campaigns.getWorkflowState.bind(apiClient.campaigns),
      saveWorkflowProgress: apiClient.campaigns.saveWorkflowProgress.bind(apiClient.campaigns),
      getDashboardStats: apiClient.campaigns.getDashboardStats.bind(apiClient.campaigns),
      getCampaignStats: apiClient.campaigns.getCampaignStats.bind(apiClient.campaigns),
      getCampaignIntelligence: apiClient.campaigns.getCampaignIntelligence.bind(apiClient.campaigns),
      // Demo methods
      getDemoPreferences: apiClient.campaigns.getDemoPreferences.bind(apiClient.campaigns),
      updateDemoPreferences: apiClient.campaigns.updateDemoPreferences.bind(apiClient.campaigns),
      toggleDemoVisibility: apiClient.campaigns.toggleDemoVisibility.bind(apiClient.campaigns),
      // Utility methods
      isDemoCampaign: apiClient.campaigns.isDemoCampaign.bind(apiClient.campaigns),
      filterCampaigns: apiClient.campaigns.filterCampaigns.bind(apiClient.campaigns),
      sortCampaigns: apiClient.campaigns.sortCampaigns.bind(apiClient.campaigns)
    },

    auth: {
      login: apiClient.auth.login.bind(apiClient.auth),
      register: apiClient.auth.register.bind(apiClient.auth),
      logout: apiClient.auth.logout.bind(apiClient.auth),
      getUserProfile: apiClient.auth.getUserProfile.bind(apiClient.auth),
      updateUserProfile: apiClient.auth.updateUserProfile.bind(apiClient.auth),
      getCompanyStats: apiClient.auth.getCompanyStats.bind(apiClient.auth),
      getCompanyDetails: apiClient.auth.getCompanyDetails.bind(apiClient.auth),
      updateCompanyDetails: apiClient.auth.updateCompanyDetails.bind(apiClient.auth),
      // Token methods
      isAuthenticated: apiClient.auth.isAuthenticated.bind(apiClient.auth),
      getCurrentToken: apiClient.auth.getCurrentToken.bind(apiClient.auth),
      isTokenExpired: apiClient.auth.isTokenExpired.bind(apiClient.auth),
      refreshAuth: apiClient.auth.refreshAuth.bind(apiClient.auth),
      // Password methods
      requestPasswordReset: apiClient.auth.requestPasswordReset.bind(apiClient.auth),
      resetPassword: apiClient.auth.resetPassword.bind(apiClient.auth),
      changePassword: apiClient.auth.changePassword.bind(apiClient.auth),
      // Preferences
      getUserPreferences: apiClient.auth.getUserPreferences.bind(apiClient.auth),
      updateUserPreferences: apiClient.auth.updateUserPreferences.bind(apiClient.auth),
      // Utility methods
      validateEmail: apiClient.auth.validateEmail.bind(apiClient.auth),
      validatePassword: apiClient.auth.validatePassword.bind(apiClient.auth),
      hasPermission: apiClient.auth.hasPermission.bind(apiClient.auth)
    },

    content: {
      generate: apiClient.content.generateContent.bind(apiClient.content),
      generateBatch: apiClient.content.generateBatchContent.bind(apiClient.content),
      getAll: apiClient.content.getGeneratedContent.bind(apiClient.content),
      getList: apiClient.content.getContentList.bind(apiClient.content),
      getById: apiClient.content.getContentDetail.bind(apiClient.content),
      update: apiClient.content.updateContent.bind(apiClient.content),
      delete: apiClient.content.deleteContent.bind(apiClient.content),
      rate: apiClient.content.rateContent.bind(apiClient.content),
      publish: apiClient.content.publishContent.bind(apiClient.content),
      unpublish: apiClient.content.unpublishContent.bind(apiClient.content),
      duplicate: apiClient.content.duplicateContent.bind(apiClient.content),
      // Bulk operations
      bulkAction: apiClient.content.bulkContentAction.bind(apiClient.content),
      bulkPublish: apiClient.content.bulkPublishContent.bind(apiClient.content),
      bulkUnpublish: apiClient.content.bulkUnpublishContent.bind(apiClient.content),
      bulkDelete: apiClient.content.bulkDeleteContent.bind(apiClient.content),
      bulkRate: apiClient.content.bulkRateContent.bind(apiClient.content),
      // Analytics
      getStats: apiClient.content.getContentStats.bind(apiClient.content),
      getAnalytics: apiClient.content.getContentAnalytics.bind(apiClient.content),
      // Search & filtering
      search: apiClient.content.searchContent.bind(apiClient.content),
      getByType: apiClient.content.getContentByType.bind(apiClient.content),
      getPublished: apiClient.content.getPublishedContent.bind(apiClient.content),
      getTopRated: apiClient.content.getTopRatedContent.bind(apiClient.content),
      // Templates & optimization
      createTemplate: apiClient.content.createTemplate.bind(apiClient.content),
      generateFromTemplate: apiClient.content.generateFromTemplate.bind(apiClient.content),
      optimize: apiClient.content.optimizeContent.bind(apiClient.content),
      // Collaboration
      addComment: apiClient.content.addContentComment.bind(apiClient.content),
      getComments: apiClient.content.getContentComments.bind(apiClient.content),
      share: apiClient.content.shareContent.bind(apiClient.content),
      // Utility methods
      validate: apiClient.content.validateContentData.bind(apiClient.content),
      formatForExport: apiClient.content.formatContentForExport.bind(apiClient.content),
      calculatePerformanceScore: apiClient.content.calculatePerformanceScore.bind(apiClient.content),
      getTypeRecommendations: apiClient.content.getContentTypeRecommendations.bind(apiClient.content)
    },

    intelligence: {
      analyzeURL: apiClient.intelligence.analyzeURL.bind(apiClient.intelligence),
      batchAnalyzeURLs: apiClient.intelligence.batchAnalyzeURLs.bind(apiClient.intelligence),
      reanalyzeURL: apiClient.intelligence.reanalyzeURL.bind(apiClient.intelligence),
      uploadDocument: apiClient.intelligence.uploadDocument.bind(apiClient.intelligence),
      batchUploadDocuments: apiClient.intelligence.batchUploadDocuments.bind(apiClient.intelligence),
      // Retrieval
      getCampaignIntelligence: apiClient.intelligence.getCampaignIntelligence.bind(apiClient.intelligence),
      getById: apiClient.intelligence.getIntelligenceById.bind(apiClient.intelligence),
      search: apiClient.intelligence.searchIntelligence.bind(apiClient.intelligence),
      // Competitive intelligence
      analyzeCompetitor: apiClient.intelligence.analyzeCompetitor.bind(apiClient.intelligence),
      getCompetitiveLandscape: apiClient.intelligence.getCompetitiveLandscape.bind(apiClient.intelligence),
      // Market intelligence
      analyzeMarketTrends: apiClient.intelligence.analyzeMarketTrends.bind(apiClient.intelligence),
      getAudienceInsights: apiClient.intelligence.getAudienceInsights.bind(apiClient.intelligence),
      // Management
      update: apiClient.intelligence.updateIntelligence.bind(apiClient.intelligence),
      delete: apiClient.intelligence.deleteIntelligence.bind(apiClient.intelligence),
      archive: apiClient.intelligence.archiveIntelligence.bind(apiClient.intelligence),
      export: apiClient.intelligence.exportIntelligence.bind(apiClient.intelligence),
      // Insights & recommendations
      getActionableInsights: apiClient.intelligence.getActionableInsights.bind(apiClient.intelligence),
      generateReport: apiClient.intelligence.generateIntelligenceReport.bind(apiClient.intelligence),
      // Utility methods
      validateUrl: apiClient.intelligence.validateUrlForAnalysis.bind(apiClient.intelligence),
      calculateConfidenceScore: apiClient.intelligence.calculateConfidenceScore.bind(apiClient.intelligence),
      getQualityMetrics: apiClient.intelligence.getIntelligenceQualityMetrics.bind(apiClient.intelligence),
      extractKeyInsights: apiClient.intelligence.extractKeyInsights.bind(apiClient.intelligence),
      format: apiClient.intelligence.formatIntelligence.bind(apiClient.intelligence)
    },
    
    // Legacy methods (for backward compatibility)
    generateEnhancedEmails: apiClient.generateEnhancedEmails.bind(apiClient),
    trackEmailPerformance: apiClient.trackEmailPerformance.bind(apiClient),
    getEmailLearningAnalytics: apiClient.getEmailLearningAnalytics.bind(apiClient),
    getEmailSystemHealth: apiClient.getEmailSystemHealth.bind(apiClient),
    seedEmailTemplates: apiClient.seedEmailTemplates.bind(apiClient),
    triggerEmailLearning: apiClient.triggerEmailLearning.bind(apiClient),
    testEnhancedEmailGeneration: apiClient.testEnhancedEmailGeneration.bind(apiClient),
    getEnhancedEmailSystemStatus: apiClient.getEnhancedEmailSystemStatus.bind(apiClient),
    login: apiClient.login.bind(apiClient),
    register: apiClient.register.bind(apiClient),
    logout: apiClient.logout.bind(apiClient),
    getUserProfile: apiClient.getUserProfile.bind(apiClient),
    createCampaign: apiClient.createCampaign.bind(apiClient),
    getCampaigns: apiClient.getCampaigns.bind(apiClient),
    getCampaign: apiClient.getCampaign.bind(apiClient),
    updateCampaign: apiClient.updateCampaign.bind(apiClient),
    deleteCampaign: apiClient.deleteCampaign.bind(apiClient),
    duplicateCampaign: apiClient.duplicateCampaign.bind(apiClient),
    getWorkflowState: apiClient.getWorkflowState.bind(apiClient),
    saveWorkflowProgress: apiClient.saveWorkflowProgress.bind(apiClient),
    getDashboardStats: apiClient.getDashboardStats.bind(apiClient),
    getCampaignStats: apiClient.getCampaignStats.bind(apiClient),
    getCompanyStats: apiClient.getCompanyStats.bind(apiClient),
    getCompanyDetails: apiClient.getCompanyDetails.bind(apiClient),
    getDemoPreferences: apiClient.getDemoPreferences.bind(apiClient),
    updateDemoPreferences: apiClient.updateDemoPreferences.bind(apiClient),
    toggleDemoVisibility: apiClient.toggleDemoVisibility.bind(apiClient),
    generateContent: apiClient.generateContent.bind(apiClient),
    getGeneratedContent: apiClient.getGeneratedContent.bind(apiClient),
    analyzeURL: apiClient.analyzeURL.bind(apiClient),
    uploadDocument: apiClient.uploadDocument.bind(apiClient),
    getCampaignIntelligence: apiClient.getCampaignIntelligence.bind(apiClient),
    
    // Token management
    setAuthToken: apiClient.setAuthToken.bind(apiClient),
    clearAuthToken: apiClient.clearAuthToken.bind(apiClient),
    getAuthToken: apiClient.getAuthToken.bind(apiClient)
  }
}

// ============================================================================
// SPECIALIZED REACT HOOKS
// ============================================================================

/**
 * Complete Campaign Management Hook
 */
export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const campaignService = useMemo(() => new CampaignService(), [])

  const loadCampaigns = useCallback(async (params?: any) => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await campaignService.getCampaigns(params)
      setCampaigns(data)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load campaigns')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [campaignService])

  const createCampaign = useCallback(async (data: any) => {
    try {
      setError(null)
      const newCampaign = await campaignService.createCampaign(data)
      setCampaigns(prev => [newCampaign, ...prev])
      return newCampaign
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign')
      throw err
    }
  }, [campaignService])

  const updateCampaign = useCallback(async (id: string, updates: any) => {
    try {
      setError(null)
      const updated = await campaignService.updateCampaign(id, updates)
      setCampaigns(prev => prev.map(c => c.id === id ? updated : c))
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update campaign')
      throw err
    }
  }, [campaignService])

  const deleteCampaign = useCallback(async (id: string) => {
    try {
      setError(null)
      await campaignService.deleteCampaign(id)
      setCampaigns(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete campaign')
      throw err
    }
  }, [campaignService])

  return {
    campaigns,
    isLoading,
    error,
    loadCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    clearError: () => setError(null)
  }
}

/**
 * Complete Authentication Hook
 */
export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const authService = useMemo(() => new AuthService(), [])

  const login = useCallback(async (credentials: any) => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await authService.login(credentials)
      const userProfile = await authService.getUserProfile()
      setUser(userProfile)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [authService])

  const register = useCallback(async (data: any) => {
    try {
      setIsLoading(true)
      setError(null)
      return await authService.register(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [authService])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
      setUser(null)
    } catch (err) {
      console.warn('Logout error:', err)
      // Still clear user even if logout request fails
      setUser(null)
    }
  }, [authService])

  const refreshAuth = useCallback(async () => {
    try {
      const isValid = await authService.refreshAuth()
      if (isValid) {
        const userProfile = await authService.getUserProfile()
        setUser(userProfile)
      } else {
        setUser(null)
      }
      return isValid
    } catch {
      setUser(null)
      return false
    }
  }, [authService])

  useEffect(() => {
    // Check auth on mount
    refreshAuth()
  }, [refreshAuth])

  return {
    user,
    isLoading,
    error,
    isAuthenticated: authService.isAuthenticated(),
    login,
    register,
    logout,
    refreshAuth,
    clearError: () => setError(null)
  }
}

/**
 * Complete Content Management Hook
 */
export function useContent(campaignId?: string) {
  const [content, setContent] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const contentService = useMemo(() => new ContentService(), [])

  const loadContent = useCallback(async (id?: string) => {
    const targetId = id || campaignId
    if (!targetId) return []
    
    try {
      setIsLoading(true)
      setError(null)
      const data = await contentService.getGeneratedContent(targetId)
      setContent(data)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [contentService, campaignId])

  const generateContent = useCallback(async (data: any) => {
    try {
      setError(null)
      const newContent = await contentService.generateContent(data)
      await loadContent() // Refresh list
      return newContent
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate content')
      throw err
    }
  }, [contentService, loadContent])

  const updateContent = useCallback(async (contentId: string, updates: any) => {
    if (!campaignId) throw new Error('Campaign ID required')
    
    try {
      setError(null)
      const updated = await contentService.updateContent(campaignId, contentId, updates)
      await loadContent() // Refresh list
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update content')
      throw err
    }
  }, [contentService, campaignId, loadContent])

  const deleteContent = useCallback(async (contentId: string) => {
    if (!campaignId) throw new Error('Campaign ID required')
    
    try {
      setError(null)
      await contentService.deleteContent(campaignId, contentId)
      setContent(prev => prev.filter(c => c.id !== contentId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete content')
      throw err
    }
  }, [contentService, campaignId])

  const rateContent = useCallback(async (contentId: string, rating: number) => {
    if (!campaignId) throw new Error('Campaign ID required')
    
    try {
      setError(null)
      const result = await contentService.rateContent(campaignId, contentId, rating)
      await loadContent() // Refresh list
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rate content')
      throw err
    }
  }, [contentService, campaignId, loadContent])

  const publishContent = useCallback(async (contentId: string) => {
    if (!campaignId) throw new Error('Campaign ID required')
    
    try {
      setError(null)
      const result = await contentService.publishContent(campaignId, contentId)
      await loadContent() // Refresh list
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish content')
      throw err
    }
  }, [contentService, campaignId, loadContent])

  useEffect(() => {
    if (campaignId) {
      loadContent()
    }
  }, [campaignId, loadContent])

  return {
    content,
    isLoading,
    error,
    loadContent,
    generateContent,
    updateContent,
    deleteContent,
    rateContent,
    publishContent,
    clearError: () => setError(null)
  }
}

/**
 * Complete Intelligence Hook
 */
export function useIntelligence(campaignId?: string) {
  const [intelligence, setIntelligence] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const intelligenceService = useMemo(() => new IntelligenceService(), [])

  const loadIntelligence = useCallback(async (id?: string, options?: any) => {
    const targetId = id || campaignId
    if (!targetId) return []
    
    try {
      setIsLoading(true)
      setError(null)
      const data = await intelligenceService.getCampaignIntelligence(targetId, options)
      setIntelligence(data.intelligence_entries || [])
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load intelligence')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [intelligenceService, campaignId])

  const analyzeURL = useCallback(async (url: string, analysisType?: string) => {
    if (!campaignId) throw new Error('Campaign ID required')
    
    try {
      setError(null)
      const result = await intelligenceService.analyzeURL({
        url,
        campaign_id: campaignId,
        analysis_type: analysisType
      })
      await loadIntelligence() // Refresh list
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze URL')
      throw err
    }
  }, [intelligenceService, campaignId, loadIntelligence])

  const uploadDocument = useCallback(async (file: File, options?: any) => {
    if (!campaignId) throw new Error('Campaign ID required')
    
    try {
      setError(null)
      const result = await intelligenceService.uploadDocument(file, campaignId, options)
      await loadIntelligence() // Refresh list
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload document')
      throw err
    }
  }, [intelligenceService, campaignId, loadIntelligence])

  const getActionableInsights = useCallback(async (focus?: string[]) => {
    if (!campaignId) throw new Error('Campaign ID required')
    
    try {
      setError(null)
      return await intelligenceService.getActionableInsights(campaignId, focus)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get insights')
      throw err
    }
  }, [intelligenceService, campaignId])

  useEffect(() => {
    if (campaignId) {
      loadIntelligence()
    }
  }, [campaignId, loadIntelligence])

  return {
    intelligence,
    isLoading,
    error,
    loadIntelligence,
    analyzeURL,
    uploadDocument,
    getActionableInsights,
    clearError: () => setError(null)
  }
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default apiClient

// ============================================================================
// INTEGRATION NOTES
// ============================================================================

/*
COMPLETE PRODUCTION-READY API SYSTEM:

âœ… FEATURES INCLUDED:
- Complete Email Generation with AI Learning
- Full Campaign Management with Demo Support
- Complete Authentication & User Management
- Comprehensive Content Generation & Management
- Advanced Intelligence & Analysis System
- Specialized React Hooks for each domain
- Full TypeScript Support
- Backward Compatibility with existing api.ts
- Error Handling & Response Processing
- Utility Functions & Validation

âœ… SERVICES IMPLEMENTED:
- EmailService: Enhanced email generation with learning
- CampaignService: Complete campaign CRUD and workflow
- AuthService: Authentication, users, and company management
- ContentService: Content generation, management, and optimization
- IntelligenceService: URL analysis, document processing, insights

âœ… HOOKS AVAILABLE:
- useEnhancedEmailGeneration: Email generation with state
- useCampaigns: Campaign management with state
- useAuth: Authentication with state
- useContent: Content management with state  
- useIntelligence: Intelligence gathering with state
- useApi: Main API hook with all services

âœ… USAGE EXAMPLES:

// New modular approach:
import { useEnhancedEmailGeneration } from '@/lib/api'
const { generateEmails, isSystemReady } = useEnhancedEmailGeneration()

// Organized by service:
import { useApi } from '@/lib/api'
const api = useApi()
await api.email.generateEnhanced(request)
await api.campaigns.create(data)
await api.content.generate(contentData)
await api.intelligence.analyzeURL(urlData)

// Legacy approach (still works):
await api.generateEnhancedEmails(request)
await api.createCampaign(data)
await api.generateContent(contentData)
await api.analyzeURL(urlData)

This is a complete, production-ready API system that provides:
- Modular architecture for better maintainability
- Full TypeScript safety
- Comprehensive error handling
- Backward compatibility
- Advanced features for all domains
- State management through hooks
- Utility functions for common operations
*/