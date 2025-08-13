// src/lib/api/hooks/useEmails.ts - Enhanced Email Generation Hook (Fixed)

import { useState, useCallback, useEffect, useMemo } from 'react'
import { EmailService } from '../services/emails.service'
// Import from existing types structure
import type {
  EmailGenerationRequest,
  EmailGenerationResponse,
  PerformanceTrackingRequest,
  PerformanceTrackingResponse,
  LearningAnalyticsResponse,
  EmailSystemHealthResponse,
  LearningMetadata
} from '../../types/emails'

/**
 * Enhanced Email Generation React Hook
 * Provides state management and actions for email generation features
 * Integrates with existing type structure and can work alongside Zustand stores
 */
export function useEnhancedEmailGeneration() {
  // State
  const [isGenerating, setIsGenerating] = useState(false)
  const [isTracking, setIsTracking] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [systemHealth, setSystemHealth] = useState<EmailSystemHealthResponse | null>(null)
  const [analytics, setAnalytics] = useState<LearningAnalyticsResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Service instance - memoized to prevent recreating on every render
  const emailService = useMemo(() => new EmailService(), [])

  // ============================================================================
  // SYSTEM MANAGEMENT ACTIONS
  // ============================================================================

  const loadSystemHealth = useCallback(async (): Promise<EmailSystemHealthResponse> => {
    try {
      setError(null)
      const health = await emailService.getSystemHealth()
      setSystemHealth(health)
      return health
    } catch (err) {
      setError(err instanceof Error ? err.message : 'System health check failed')
      throw err
    }
  }, [emailService])

  const loadAnalytics = useCallback(async (): Promise<LearningAnalyticsResponse> => {
    try {
      setError(null)
      const analyticsData = await emailService.getLearningAnalytics()
      setAnalytics(analyticsData)
      return analyticsData
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analytics loading failed')
      throw err
    }
  }, [emailService])

  const seedTemplates = useCallback(async (forceReseed = false) => {
    try {
      setError(null)
      const result = await emailService.seedTemplates(forceReseed)
      // Refresh system health after seeding
      await loadSystemHealth()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Template seeding failed')
      throw err
    }
  }, [emailService, loadSystemHealth])

  const triggerLearning = useCallback(async (daysBack = 7) => {
    try {
      setError(null)
      const result = await emailService.triggerLearning(daysBack)
      // Refresh analytics after learning
      await loadAnalytics()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Learning trigger failed')
      throw err
    }
  }, [emailService, loadAnalytics])

  const testSystem = useCallback(async (productName = 'TestProduct', sequenceLength = 3) => {
    try {
      setError(null)
      const result = await emailService.testGeneration(productName, sequenceLength, true)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'System test failed')
      throw err
    }
  }, [emailService])

  const initializeSystem = useCallback(async (): Promise<boolean> => {
    try {
      setIsInitializing(true)
      setError(null)
      const success = await emailService.initializeSystem()
      if (success) {
        await loadSystemHealth()
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'System initialization failed')
      return false
    } finally {
      setIsInitializing(false)
    }
  }, [emailService, loadSystemHealth])

  // ============================================================================
  // EMAIL GENERATION ACTIONS
  // ============================================================================

  const generateEmails = useCallback(async (request: EmailGenerationRequest): Promise<EmailGenerationResponse> => {
    try {
      setIsGenerating(true)
      setError(null)
      const result = await emailService.generateEnhancedEmails(request)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Email generation failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsGenerating(false)
    }
  }, [emailService])

  const trackPerformance = useCallback(async (request: PerformanceTrackingRequest): Promise<PerformanceTrackingResponse> => {
    try {
      setIsTracking(true)
      setError(null)
      const result = await emailService.trackEmailPerformance(request)
      
      // Refresh analytics after tracking performance
      loadAnalytics().catch(console.warn)
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Performance tracking failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsTracking(false)
    }
  }, [emailService, loadAnalytics])


  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    // Load system health on mount
    loadSystemHealth().catch(console.error)
  }, [loadSystemHealth])

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isSystemReady = systemHealth?.status === 'healthy'
  const hasTemplates = systemHealth?.enhanced_email_system?.template_database?.templates_seeded ?? false
  const templateCount = systemHealth?.enhanced_email_system?.template_database?.total_templates ?? 0

  const systemReadiness = (() => {
    if (!systemHealth) return { ready: false, message: 'Checking system status...' }
    
    if (systemHealth.status !== 'healthy') {
      return {
        ready: false,
        message: 'Enhanced email system not available',
        action: 'Check system configuration'
      }
    }

    if (!systemHealth.enhanced_email_system?.models_available) {
      return {
        ready: false,
        message: 'Email models not loaded',
        action: 'Contact support'
      }
    }

    if (!systemHealth.enhanced_email_system?.template_database?.templates_seeded) {
      return {
        ready: false,
        message: 'Templates need to be seeded',
        action: 'Seed templates database'
      }
    }

    return {
      ready: true,
      message: 'Enhanced email system ready'
    }
  })()

  const learningProgress = analytics ? (() => {
    const totalTemplates = analytics.template_stats.reduce((sum, stat) => sum + stat.count, 0)
    const aiGenerated = analytics.template_stats
      .filter(stat => stat.source.includes('ai_learned'))
      .reduce((sum, stat) => sum + stat.count, 0)
    
    return {
      totalTemplates,
      aiGenerated,
      topPerformers: analytics.ai_performance.top_tier_count || 0,
      averageOpenRate: analytics.ai_performance.avg_ai_open_rate || 0
    }
  })() : null

  // ============================================================================
  // RETURN HOOK INTERFACE
  // ============================================================================

  return {
    // State
    isGenerating,
    isTracking,
    isInitializing,
    systemHealth,
    analytics,
    error,
    
    // Actions
    generateEmails,
    trackPerformance,
    loadSystemHealth,
    loadAnalytics,
    seedTemplates,
    triggerLearning,
    testSystem,
    initializeSystem,
    
    // Computed values
    isSystemReady,
    hasTemplates,
    templateCount,
    systemReadiness,
    learningProgress,
    
    // Utilities
    clearError: () => setError(null),
    
    // Quick access methods
    checkSystemReady: emailService.isSystemReady.bind(emailService),
    getTemplateCount: emailService.getTemplateCount.bind(emailService)
  }
}

// ============================================================================
// EMAIL UTILITY FUNCTIONS (Compatible with existing patterns)
// ============================================================================

export const emailUtils = {
  /**
   * Calculate estimated open rate improvement
   */
  calculateOpenRateImprovement: (currentRate: number, systemRate: number = 30): number => {
    return Math.max(0, systemRate - currentRate)
  },

  /**
   * Get email generation benefits
   */
  getBenefits: () => [
    "25-35% open rates using proven subject line templates",
    "AI learns from your successful emails automatically", 
    "Continuous improvement without manual work",
    "Universal product support for any sales page",
    "Database of high-converting psychology patterns",
    "Performance tracking and learning analytics"
  ],

  /**
   * Format learning metadata for display
   */
  formatLearningMetadata: (metadata: LearningMetadata[]): string => {
    const learningCount = metadata.filter(m => m.can_learn_from).length
    const totalCount = metadata.length
    
    if (learningCount === 0) {
      return "Standard generation (no learning enabled)"
    }
    
    return `${learningCount}/${totalCount} emails can improve AI performance`
  },

  /**
   * Get performance level color class (for Tailwind CSS)
   */
  getPerformanceLevelColor: (level: string): string => {
    switch (level.toLowerCase()) {
      case 'top_tier': return 'text-green-600'
      case 'high_performing': return 'text-blue-600'
      case 'good': return 'text-yellow-600'
      case 'experimental': return 'text-gray-600'
      default: return 'text-gray-500'
    }
  },

  /**
   * Get performance level badge class (for UI components)
   */
  getPerformanceLevelBadge: (level: string): string => {
    switch (level.toLowerCase()) {
      case 'top_tier': return 'bg-green-100 text-green-800'
      case 'high_performing': return 'bg-blue-100 text-blue-800'
      case 'good': return 'bg-yellow-100 text-yellow-800'
      case 'experimental': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-500'
    }
  },

  /**
   * Format open rate for display
   */
  formatOpenRate: (rate: number): string => {
    return `${rate.toFixed(1)}%`
  },

  /**
   * Determine if system needs seeding
   */
  needsSeeding: (health: EmailSystemHealthResponse): boolean => {
    return health.enhanced_email_system?.template_database?.templates_seeded === false
  },

  /**
   * Format strategic angle for display
   */
  formatStrategicAngle: (angle: string): string => {
    return angle.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  },

  /**
   * Get email sequence recommendations
   */
  getSequenceRecommendations: (productType?: string) => {
    const base = [
      { length: 3, name: 'Quick Launch', description: 'Fast market test' },
      { length: 5, name: 'Standard Campaign', description: 'Balanced approach' },
      { length: 7, name: 'Deep Nurture', description: 'Maximum conversion' }
    ]
    
    // Could customize based on product type in the future
    return base
  },

  /**
   * Validate email generation request
   */
  validateEmailRequest: (request: EmailGenerationRequest): { valid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    if (!request.campaign_id) {
      errors.push('Campaign ID is required')
    }
    
    if (request.preferences && typeof request.preferences !== 'object') {
      errors.push('Preferences must be an object')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
}