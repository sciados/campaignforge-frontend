// src/lib/api/services/auth.service.ts - Complete Authentication Service

import { BaseApiClient } from '../core/client'
import { ENDPOINTS, setAuthToken, clearAuthToken } from '../config'
import type { 
  User, 
  LoginCredentials, 
  LoginResponse, 
  RegisterData, 
  RegisterResponse,
  CompanyStats,
  CompanyDetails 
} from '../../types/auth'

/**
 * Authentication Service - Complete user and company management
 * Handles authentication, user profile, and company operations
 */
export class AuthService extends BaseApiClient {

  // ============================================================================
  // AUTHENTICATION OPERATIONS
  // ============================================================================

  /**
   * User login with automatic token management
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    console.log('🔐 Attempting login for:', credentials.email)
    
    try {
      const response = await fetch(`${this.baseURL}${ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(credentials)
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Login failed: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.access_token) {
        setAuthToken(result.access_token)
        console.log('✅ Login successful, token stored')
      }
      
      return result
    } catch (error) {
      console.error('❌ Login error:', error)
      throw error
    }
  }

  /**
   * User registration
   */
  async register(data: RegisterData): Promise<RegisterResponse> {
    console.log('📝 Registering user:', data.email)
    
    try {
      const response = await fetch(`${this.baseURL}${ENDPOINTS.AUTH.REGISTER}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Registration failed: ${response.statusText}`)
      }
      
      const result = await response.json()
      console.log('✅ Registration successful')
      
      return result
    } catch (error) {
      console.error('❌ Registration error:', error)
      throw error
    }
  }

  /**
   * User logout with token cleanup
   */
  async logout(): Promise<void> {
    console.log('🚪 Logging out user')
    
    try {
      await fetch(`${this.baseURL}${ENDPOINTS.AUTH.LOGOUT}`, {
        method: 'POST',
        headers: this.getHeaders()
      })
      console.log('✅ Logout request sent')
    } catch (error) {
      console.warn('⚠️ Logout request failed, but clearing token anyway:', error)
    } finally {
      clearAuthToken()
      console.log('✅ Token cleared')
    }
  }

  /**
   * Get current user profile
   */
  async getUserProfile(): Promise<User> {
    return this.get<User>(ENDPOINTS.AUTH.PROFILE)
  }

  /**
   * Update user profile
   */
  async updateUserProfile(updates: Partial<User>): Promise<User> {
    return this.put<User>(ENDPOINTS.AUTH.PROFILE, updates)
  }

  // ============================================================================
  // COMPANY MANAGEMENT
  // ============================================================================

  /**
   * Get company statistics
   */
  async getCompanyStats(): Promise<CompanyStats> {
    return this.get<CompanyStats>(ENDPOINTS.DASHBOARD.STATS)
  }

  /**
   * Get company details
   */
  async getCompanyDetails(): Promise<CompanyDetails> {
    return this.get<CompanyDetails>(ENDPOINTS.DASHBOARD.COMPANY)
  }

  /**
   * Update company details
   */
  async updateCompanyDetails(updates: Partial<CompanyDetails>): Promise<CompanyDetails> {
    return this.put<CompanyDetails>(ENDPOINTS.DASHBOARD.COMPANY, updates)
  }

  // ============================================================================
  // TOKEN MANAGEMENT
  // ============================================================================

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getAuthToken() !== null
  }

  /**
   * Get current auth token
   */
  getCurrentToken(): string | null {
    return this.getAuthToken()
  }

  /**
   * Check if token is expired (basic check)
   */
  isTokenExpired(): boolean {
    const token = this.getAuthToken()
    if (!token) return true
    
    try {
      // Basic JWT expiration check
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      return payload.exp < currentTime
    } catch {
      // If we can't parse the token, consider it expired
      return true
    }
  }

  /**
   * Refresh authentication state
   */
  async refreshAuth(): Promise<boolean> {
    try {
      if (!this.isAuthenticated() || this.isTokenExpired()) {
        clearAuthToken()
        return false
      }
      
      // Verify token by getting user profile
      await this.getUserProfile()
      return true
    } catch {
      clearAuthToken()
      return false
    }
  }

  // ============================================================================
  // PASSWORD MANAGEMENT
  // ============================================================================

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    return this.post('/api/auth/password-reset/request', { email })
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return this.post('/api/auth/password-reset/confirm', { 
      token, 
      new_password: newPassword 
    })
  }

  /**
   * Change password for authenticated user
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return this.post('/api/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword
    })
  }

  // ============================================================================
  // EMAIL VERIFICATION
  // ============================================================================

  /**
   * Request email verification
   */
  async requestEmailVerification(): Promise<{ message: string }> {
    return this.post('/api/auth/verify-email/request')
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    return this.post('/api/auth/verify-email/confirm', { token })
  }

  // ============================================================================
  // USER PREFERENCES
  // ============================================================================

  /**
   * Get user preferences
   */
  async getUserPreferences(): Promise<Record<string, any>> {
    try {
      return await this.get('/api/auth/preferences')
    } catch (error) {
      // Return default preferences if none exist
      return {}
    }
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(preferences: Record<string, any>): Promise<Record<string, any>> {
    return this.post('/api/auth/preferences', preferences)
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate registration data
   */
  validateRegistrationData(data: RegisterData): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (!data.email) {
      errors.push('Email is required')
    } else if (!this.validateEmail(data.email)) {
      errors.push('Invalid email format')
    }
    
    if (!data.full_name) {
      errors.push('Full name is required')
    } else if (data.full_name.length < 2) {
      errors.push('Full name must be at least 2 characters')
    }
    
    if (!data.password) {
      errors.push('Password is required')
    } else {
      const passwordValidation = this.validatePassword(data.password)
      if (!passwordValidation.valid) {
        errors.push(...passwordValidation.errors)
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Get user role permissions
   */
  getUserPermissions(user: User): string[] {
    const permissions: string[] = []
    
    switch (user.role) {
      case 'admin':
        permissions.push('manage_users', 'manage_company', 'view_analytics', 'manage_campaigns')
        break
      case 'manager':
        permissions.push('manage_campaigns', 'view_analytics', 'manage_team')
        break
      case 'user':
        permissions.push('manage_campaigns', 'view_own_analytics')
        break
      default:
        permissions.push('view_campaigns')
    }
    
    return permissions
  }

  /**
   * Check if user has permission
   */
  hasPermission(user: User, permission: string): boolean {
    const userPermissions = this.getUserPermissions(user)
    return userPermissions.includes(permission)
  }
}