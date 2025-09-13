// lib/waitlist-api.ts
// TypeScript API client for waitlist functionality

import { getApiUrl } from './config'

// ============================================================================
// ✅ TYPE DEFINITIONS
// ============================================================================

export interface WaitlistJoinRequest {
  email: string
  referrer?: string
}

export interface WaitlistJoinResponse {
  message: string
  total_signups: number
  position: number
  email: string
}

export interface WaitlistCheckResponse {
  on_waitlist: boolean
  message?: string
  position?: number
  total_signups?: number
  joined_date?: string
  is_notified?: boolean
}

export interface WaitlistEntry {
  id: number
  email: string
  created_at: string
  ip_address?: string
  is_notified: boolean
}

export interface WaitlistStatsResponse {
  total: number
  today: number
  this_week: number
  this_month: number
  recent_signups: Array<{
    email: string
    created_at: string
    id: number
  }>
  daily_stats: Array<{
    date: string
    count: number
  }>
}

export interface WaitlistExportResponse {
  emails: Array<{
    id: number
    email: string
    joined_date: string
    is_notified: boolean
    referrer?: string
  }>
  total: number
  export_date: string
}

// ============================================================================
// ✅ CUSTOM ERROR CLASS
// ============================================================================

export class WaitlistApiError extends Error {
  public status: number
  
  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = 'WaitlistApiError'
  }
}

// ============================================================================
// ✅ API CALL HELPER
// ============================================================================

interface ApiCallOptions extends RequestInit {
  headers?: Record<string, string>
}

async function waitlistApiCall<T>(endpoint: string, options: ApiCallOptions = {}): Promise<T> {
  const url = getApiUrl(`/api/waitlist${endpoint}`)
  
  // Get auth token for admin endpoints
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }
  
  try {
    const response = await fetch(url, config)
    const data = await response.json()
    
    if (!response.ok) {
      throw new WaitlistApiError(
        data.detail || data.message || 'An error occurred', 
        response.status
      )
    }
    
    return data as T
  } catch (error) {
    if (error instanceof WaitlistApiError) {
      throw error
    }
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new WaitlistApiError('Network error. Please check your connection.', 0)
    }
    
    throw new WaitlistApiError('An unexpected error occurred.', 0)
  }
}

// ============================================================================
// ✅ WAITLIST API FUNCTIONS
// ============================================================================

export const waitlistApi = {
  /**
   * Join the waitlist
   */
  join: async (email: string, referrer?: string): Promise<WaitlistJoinResponse> => {
    return waitlistApiCall<WaitlistJoinResponse>('/join', {
      method: 'POST',
      body: JSON.stringify({ email, referrer }),
    })
  },
  
  /**
   * Check if an email is on the waitlist
   */
  check: async (email: string): Promise<WaitlistCheckResponse> => {
    return waitlistApiCall<WaitlistCheckResponse>(`/check/${encodeURIComponent(email)}`)
  },
  
  /**
   * Get waitlist statistics (admin only)
   */
  getStats: async (): Promise<WaitlistStatsResponse> => {
    return waitlistApiCall<WaitlistStatsResponse>('/stats')
  },
  
  /**
   * Export all emails (admin only)
   */
  export: async (): Promise<WaitlistExportResponse> => {
    return waitlistApiCall<WaitlistExportResponse>('/export')
  },
  
  /**
   * Get paginated waitlist entries (admin only)
   */
  getList: async (skip: number = 0, limit: number = 100): Promise<WaitlistEntry[]> => {
    return waitlistApiCall<WaitlistEntry[]>(`/list?skip=${skip}&limit=${limit}`)
  }
}

// ============================================================================
// ✅ REACT HOOK FOR WAITLIST (Optional)
// ============================================================================

import { useState, useCallback } from 'react'

export interface UseWaitlistReturn {
  isLoading: boolean
  error: string | null
  success: boolean
  joinWaitlist: (email: string, referrer?: string) => Promise<WaitlistJoinResponse | null>
  checkEmail: (email: string) => Promise<WaitlistCheckResponse | null>
  clearState: () => void
}

export const useWaitlist = (): UseWaitlistReturn => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const clearState = useCallback(() => {
    setError(null)
    setSuccess(false)
  }, [])

  const joinWaitlist = useCallback(async (email: string, referrer?: string) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await waitlistApi.join(email, referrer)
      setSuccess(true)
      return result
    } catch (err) {
      if (err instanceof WaitlistApiError) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred')
      }
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const checkEmail = useCallback(async (email: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await waitlistApi.check(email)
      return result
    } catch (err) {
      if (err instanceof WaitlistApiError) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred')
      }
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isLoading,
    error,
    success,
    joinWaitlist,
    checkEmail,
    clearState
  }
}

// ============================================================================
// ✅ UTILITY FUNCTIONS
// ============================================================================

export const waitlistUtils = {
  /**
   * Validate email format
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },
  
  /**
   * Format position with ordinal suffix
   */
  formatPosition: (position: number): string => {
    const suffix = ['th', 'st', 'nd', 'rd']
    const v = position % 100
    return position + (suffix[(v - 20) % 10] || suffix[v] || suffix[0])
  },
  
  /**
   * Download CSV from export data
   */
  downloadCSV: (data: WaitlistExportResponse): void => {
    const csv = [
      'Email,Joined Date,Is Notified,Referrer',
      ...data.emails.map(e => 
        `${e.email},${new Date(e.joined_date).toLocaleDateString()},${e.is_notified},${e.referrer || 'direct'}`
      )
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `waitlist-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }
}

export default waitlistApi