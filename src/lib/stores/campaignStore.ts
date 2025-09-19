// src/lib/stores/campaignStore.ts - Enhanced Implementation
'use client'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Api } from "../api"
import { Campaign, CampaignType } from "../types/campaign"

// Create API instance for store usage
const api = new Api()

interface CampaignCreateRequest {
  title: string
  description: string
  campaign_type?: CampaignType
  target_audience?: string
  keywords?: string[]
  tone?: string
  style?: string
  settings?: Record<string, any>
}

interface CampaignStore {
  // State
  currentCampaign: Campaign | null
  campaigns: Campaign[]
  isLoading: boolean
  error: string | null
  lastUpdated: Date | null
  
  // Actions
  createCampaign: (data: CampaignCreateRequest) => Promise<Campaign>
  updateCampaign: (id: string, data: Partial<Campaign>) => Promise<Campaign>
  deleteCampaign: (id: string) => Promise<void>
  loadCampaigns: () => Promise<void>
  loadCampaign: (id: string) => Promise<void>
  clearError: () => void
  setCurrentCampaign: (campaign: Campaign | null) => void
  
  // Computed
  activeCampaigns: () => Campaign[]
  draftCampaigns: () => Campaign[]
  completedCampaigns: () => Campaign[]
}

export const useCampaignStore = create<CampaignStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentCampaign: null,
      campaigns: [],
      isLoading: false,
      error: null,
      lastUpdated: null,

      // Actions
      createCampaign: async (data: CampaignCreateRequest) => {
        set({ isLoading: true, error: null })
        
        try {
          const campaign = await api.createCampaign({
            ...data,
            campaign_type: data.campaign_type || 'universal'
          })
          
          set((state) => ({
            campaigns: [...state.campaigns, campaign],
            currentCampaign: campaign,
            isLoading: false,
            lastUpdated: new Date()
          }))
          
          return campaign
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create campaign'
          set({ error: errorMessage, isLoading: false })
          throw error
        }
      },

      updateCampaign: async (id: string, data: Partial<Campaign>) => {
        set({ isLoading: true, error: null })
        
        try {
          const updatedCampaign = await api.updateCampaign(id, data)
          
          set((state) => ({
            campaigns: state.campaigns.map(c => c.id === id ? updatedCampaign : c),
            currentCampaign: state.currentCampaign?.id === id ? updatedCampaign : state.currentCampaign,
            isLoading: false,
            lastUpdated: new Date()
          }))
          
          return updatedCampaign
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update campaign'
          set({ error: errorMessage, isLoading: false })
          throw error
        }
      },

      deleteCampaign: async (id: string) => {
        set({ isLoading: true, error: null })
        
        try {
          await api.deleteCampaign(id)
          
          set((state) => ({
            campaigns: state.campaigns.filter(c => c.id !== id),
            currentCampaign: state.currentCampaign?.id === id ? null : state.currentCampaign,
            isLoading: false,
            lastUpdated: new Date()
          }))
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete campaign'
          set({ error: errorMessage, isLoading: false })
          throw error
        }
      },

      loadCampaigns: async () => {
        set({ isLoading: true, error: null })
        
        try {
          const campaigns = await api.getCampaigns({ limit: 100 })
          
          set({
            campaigns,
            isLoading: false,
            lastUpdated: new Date()
          })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load campaigns'
          set({ error: errorMessage, isLoading: false })
          throw error
        }
      },

      loadCampaign: async (id: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const campaign = await api.getCampaign(id)
          
          set((state) => ({
            currentCampaign: campaign,
            campaigns: state.campaigns.some(c => c.id === id) 
              ? state.campaigns.map(c => c.id === id ? campaign : c)
              : [...state.campaigns, campaign],
            isLoading: false,
            lastUpdated: new Date()
          }))
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load campaign'
          set({ error: errorMessage, isLoading: false })
          throw error
        }
      },

      clearError: () => {
        set({ error: null })
      },

      setCurrentCampaign: (campaign: Campaign | null) => {
        set({ currentCampaign: campaign })
      },

      // Computed properties
      activeCampaigns: () => {
        return get().campaigns.filter(c => 
          c.status === 'active' || c.status === 'processing'
        )
      },

      draftCampaigns: () => {
        return get().campaigns.filter(c => c.status === 'draft')
      },

      completedCampaigns: () => {
        return get().campaigns.filter(c => c.status === 'completed')
      }
    }),
    {
      name: 'campaign-store',
      partialize: (state: { campaigns: any; lastUpdated: any }) => ({
        // Only persist non-sensitive data
        campaigns: state.campaigns,
        lastUpdated: state.lastUpdated
      })
    }
  )
)

// Hooks for easy access to computed values
export const useActiveCampaigns = () => useCampaignStore(state => state.activeCampaigns())
export const useDraftCampaigns = () => useCampaignStore(state => state.draftCampaigns())
export const useCompletedCampaigns = () => useCampaignStore(state => state.completedCampaigns())

// Hook for campaign stats
export const useCampaignStats = () => {
  const campaigns = useCampaignStore(state => state.campaigns)
  
  return {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'active' || c.status === 'processing').length,
    draft: campaigns.filter(c => c.status === 'draft').length,
    completed: campaigns.filter(c => c.status === 'completed').length,
    archived: campaigns.filter(c => c.status === 'archived').length
  }
}