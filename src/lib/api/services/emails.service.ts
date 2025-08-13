// src/lib/api/services/emails.service.ts - Email Service (Uses existing types structure)

import { BaseApiClient } from '../core/client'
import { ENDPOINTS } from '../config'
// Import from existing types structure
import type {
  EmailGenerationRequest,
  EmailGenerationResponse,
  PerformanceTrackingRequest,
  PerformanceTrackingResponse,
  LearningAnalyticsResponse,
  EmailSystemHealthResponse,
  EmailTemplateSeeedResponse,
  EmailLearningTriggerResponse,
  EmailTestResponse,
  EmailSystemStatusResponse
} from '../../types/emails'

/**
 * Enhanced Email Generation Service
 * Handles AI-powered email generation with learning capabilities
 * Integrates with existing type structure
 */
export class EmailService extends BaseApiClient {

  // ============================================================================
  // EMAIL GENERATION METHODS
  // ============================================================================

  /**
   * Generate enhanced email sequence with AI learning
   */
  async generateEnhancedEmails(request: EmailGenerationRequest): Promise<EmailGenerationResponse> {
    console.log('📧 Generating enhanced emails:', request)
    
    try {
      const response = await fetch(`${this.baseURL}${ENDPOINTS.EMAILS.GENERATE}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request)
      })
      
      if (!response.ok) {
        throw new Error(`Enhanced email generation failed: ${response.statusText}`)
      }
      
      const result = await response.json()
      console.log('✅ Enhanced emails generated successfully:', result)
      
      return result
    } catch (error) {
      console.error('❌ Enhanced email generation error:', error)
      throw error
    }
  }

  /**
   * Track email performance for learning system
   */
  async trackEmailPerformance(request: PerformanceTrackingRequest): Promise<PerformanceTrackingResponse> {
    console.log('📊 Tracking email performance:', request)
    
    try {
      const response = await fetch(`${this.baseURL}${ENDPOINTS.EMAILS.TRACK_PERFORMANCE}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request)
      })
      
      if (!response.ok) {
        throw new Error(`Performance tracking failed: ${response.statusText}`)
      }
      
      const result = await response.json()
      console.log('✅ Performance tracking successful:', result)
      
      return result
    } catch (error) {
      console.error('❌ Performance tracking error:', error)
      throw error
    }
  }

  // ============================================================================
  // LEARNING ANALYTICS METHODS
  // ============================================================================

  /**
   * Get learning analytics from email system
   */
  async getLearningAnalytics(): Promise<LearningAnalyticsResponse> {
    try {
      const response = await fetch(`${this.baseURL}${ENDPOINTS.EMAILS.LEARNING_ANALYTICS}`, {
        method: 'GET',
        headers: this.getHeaders()
      })
      
      if (!response.ok) {
        throw new Error(`Learning analytics failed: ${response.statusText}`)
      }
      
      return response.json()
    } catch (error) {
      console.error('❌ Learning analytics error:', error)
      throw error
    }
  }

  /**
   * Manually trigger learning evaluation
   */
  async triggerLearning(daysBack: number = 7): Promise<EmailLearningTriggerResponse> {
    try {
      const response = await fetch(`${this.baseURL}${ENDPOINTS.EMAILS.TRIGGER_LEARNING}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ days_back: daysBack })
      })
      
      if (!response.ok) {
        throw new Error(`Learning trigger failed: ${response.statusText}`)
      }
      
      return response.json()
    } catch (error) {
      console.error('❌ Learning trigger error:', error)
      throw error
    }
  }

  // ============================================================================
  // SYSTEM MANAGEMENT METHODS
  // ============================================================================

  /**
   * Get email system health status
   */
  async getSystemHealth(): Promise<EmailSystemHealthResponse> {
    try {
      const response = await fetch(`${this.baseURL}${ENDPOINTS.EMAILS.SYSTEM_HEALTH}`, {
        method: 'GET',
        headers: this.getHeaders()
      })
      
      if (!response.ok) {
        throw new Error(`Email system health check failed: ${response.statusText}`)
      }
      
      return response.json()
    } catch (error) {
      console.error('❌ Email system health check error:', error)
      throw error
    }
  }

  /**
   * Seed email templates database
   */
  async seedTemplates(forceReseed: boolean = false): Promise<EmailTemplateSeeedResponse> {
    try {
      const response = await fetch(`${this.baseURL}${ENDPOINTS.EMAILS.SEED_TEMPLATES}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ force_reseed: forceReseed })
      })
      
      if (!response.ok) {
        throw new Error(`Template seeding failed: ${response.statusText}`)
      }
      
      return response.json()
    } catch (error) {
      console.error('❌ Template seeding error:', error)
      throw error
    }
  }

  /**
   * Get enhanced email system status
   */
  async getSystemStatus(): Promise<EmailSystemStatusResponse> {
    try {
      const response = await fetch(`${this.baseURL}${ENDPOINTS.EMAILS.SYSTEM_STATUS}`, {
        method: 'GET',
        headers: this.getHeaders()
      })
      
      if (!response.ok) {
        throw new Error(`System status check failed: ${response.statusText}`)
      }
      
      return response.json()
    } catch (error) {
      console.error('❌ System status check error:', error)
      throw error
    }
  }

  // ============================================================================
  // TESTING METHODS
  // ============================================================================

  /**
   * Test enhanced email generation system
   */
  async testGeneration(
    productName: string = 'TestProduct',
    sequenceLength: number = 3,
    useLearning: boolean = true
  ): Promise<EmailTestResponse> {
    try {
      const response = await fetch(`${this.baseURL}${ENDPOINTS.EMAILS.TEST_GENERATION}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          product_name: productName,
          sequence_length: sequenceLength,
          use_learning: useLearning
        })
      })
      
      if (!response.ok) {
        throw new Error(`Enhanced email test failed: ${response.statusText}`)
      }
      
      return response.json()
    } catch (error) {
      console.error('❌ Enhanced email test error:', error)
      throw error
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Check if email system is ready
   */
  async isSystemReady(): Promise<boolean> {
    try {
      const health = await this.getSystemHealth()
      return health.status === 'healthy' && 
             health.enhanced_email_system?.template_database?.templates_seeded === true
    } catch {
      return false
    }
  }

  /**
   * Get template count
   */
  async getTemplateCount(): Promise<number> {
    try {
      const health = await this.getSystemHealth()
      return health.enhanced_email_system?.template_database?.total_templates || 0
    } catch {
      return 0
    }
  }

  /**
   * Initialize email system (seed templates if needed)
   */
  async initializeSystem(): Promise<boolean> {
    try {
      const health = await this.getSystemHealth()
      
      if (!health.enhanced_email_system?.template_database?.templates_seeded) {
        console.log('🌱 Seeding email templates...')
        await this.seedTemplates(false)
        return true
      }
      
      return true
    } catch (error) {
      console.error('❌ Failed to initialize email system:', error)
      return false
    }
  }
}