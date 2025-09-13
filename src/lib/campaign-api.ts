// src/lib/campaign-api.ts
/**
 * Campaign API Service
 * Handles campaign operations including demo campaign visibility controls
 */

import { getApiUrl } from './config'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Campaign {
  id: string
  name: string
  description?: string
  campaign_type: string
  status: string
  target_audience?: string
  goals?: string[]
  settings?: {
    is_demo?: boolean
    demo_hidden?: boolean
    [key: string]: any
  }
  created_at?: string
  updated_at?: string
}

export interface CampaignsResponse {
  campaigns: Campaign[]
  total: number
  include_hidden_demos: boolean
  success: boolean
}

export interface DemoToggleResponse {
  message: string
  hidden: boolean
  success: boolean
}

// ============================================================================
// API ERROR CLASS
// ============================================================================

export class CampaignApiError extends Error {
  public status: number
  
  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = 'CampaignApiError'
  }
}

// ============================================================================
// API HELPER
// ============================================================================

async function campaignApiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = getApiUrl(endpoint)
  
  // Get auth token
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...((options.headers as Record<string, string>) || {}),
    },
    ...options,
  }
  
  try {
    const response = await fetch(url, config)
    const data = await response.json()
    
    if (!response.ok) {
      throw new CampaignApiError(
        data.detail || data.message || 'An error occurred', 
        response.status
      )
    }
    
    return data as T
  } catch (error) {
    if (error instanceof CampaignApiError) {
      throw error
    }
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new CampaignApiError('Network error. Please check your connection.', 0)
    }
    
    throw new CampaignApiError('An unexpected error occurred.', 0)
  }
}

// ============================================================================
// CAMPAIGN API FUNCTIONS
// ============================================================================

export const campaignApi = {
  /**
   * Get user campaigns with optional inclusion of hidden demos
   */
  getCampaigns: async (includeHiddenDemos: boolean = false): Promise<CampaignsResponse> => {
    return campaignApiCall<CampaignsResponse>(
      `/api/campaigns/list?include_hidden_demos=${includeHiddenDemos}`
    )
  },

  /**
   * Toggle demo campaign visibility
   */
  toggleDemoVisibility: async (hidden: boolean): Promise<DemoToggleResponse> => {
    return campaignApiCall<DemoToggleResponse>('/api/campaigns/demo/toggle-visibility', {
      method: 'POST',
      body: JSON.stringify({ hidden }),
    })
  },

  /**
   * Hide demo campaign
   */
  hideDemo: async (): Promise<DemoToggleResponse> => {
    return campaignApi.toggleDemoVisibility(true)
  },

  /**
   * Show demo campaign
   */
  showDemo: async (): Promise<DemoToggleResponse> => {
    return campaignApi.toggleDemoVisibility(false)
  },

  /**
   * Debug: Create demo campaign manually
   */
  debugCreateDemo: async (): Promise<any> => {
    return campaignApiCall<any>('/api/debug/create-demo-campaign', {
      method: 'POST',
    })
  }
}

// ============================================================================
// REACT HOOK FOR CAMPAIGN OPERATIONS
// ============================================================================

import { useState, useCallback } from 'react'

export interface UseCampaignReturn {
  campaigns: Campaign[]
  isLoading: boolean
  error: string | null
  success: boolean
  loadCampaigns: (includeHiddenDemos?: boolean) => Promise<void>
  hideDemo: () => Promise<void>
  showDemo: () => Promise<void>
  clearState: () => void
}

export const useCampaign = (): UseCampaignReturn => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const clearState = useCallback(() => {
    setError(null)
    setSuccess(false)
  }, [])

  const loadCampaigns = useCallback(async (includeHiddenDemos: boolean = false) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await campaignApi.getCampaigns(includeHiddenDemos)
      setCampaigns(result.campaigns)
      setSuccess(true)
    } catch (err) {
      if (err instanceof CampaignApiError) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred')
      }
      setCampaigns([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const hideDemo = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await campaignApi.hideDemo()
      setSuccess(true)
      // Reload campaigns to reflect the change
      await loadCampaigns(false)
    } catch (err) {
      if (err instanceof CampaignApiError) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }, [loadCampaigns])

  const showDemo = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await campaignApi.showDemo()
      setSuccess(true)
      // Reload campaigns to reflect the change
      await loadCampaigns(false)
    } catch (err) {
      if (err instanceof CampaignApiError) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }, [loadCampaigns])

  return {
    campaigns,
    isLoading,
    error,
    success,
    loadCampaigns,
    hideDemo,
    showDemo,
    clearState
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const campaignUtils = {
  /**
   * Check if a campaign is a demo campaign
   */
  isDemo: (campaign: Campaign): boolean => {
    return campaign.settings?.is_demo === true
  },

  /**
   * Check if a demo campaign is hidden
   */
  isDemoHidden: (campaign: Campaign): boolean => {
    return campaign.settings?.is_demo === true && campaign.settings?.demo_hidden === true
  },

  /**
   * Get visible campaigns (excludes hidden demos)
   */
  getVisibleCampaigns: (campaigns: Campaign[]): Campaign[] => {
    return campaigns.filter(campaign => 
      !campaignUtils.isDemoHidden(campaign)
    )
  },

  /**
   * Get demo campaigns only
   */
  getDemoCampaigns: (campaigns: Campaign[]): Campaign[] => {
    return campaigns.filter(campaign => 
      campaignUtils.isDemo(campaign)
    )
  },

  /**
   * Get non-demo campaigns only
   */
  getRealCampaigns: (campaigns: Campaign[]): Campaign[] => {
    return campaigns.filter(campaign => 
      !campaignUtils.isDemo(campaign)
    )
  }
}

export default campaignApi