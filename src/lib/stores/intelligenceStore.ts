// src/lib/stores/intelligenceStore.ts - FIXED TYPE COMPATIBILITY
'use client'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { apiClient, CampaignIntelligenceResponse } from "../api"

interface IntelligenceSource {
  id: string
  source_title: string
  source_type: string
  source_url?: string
  confidence_score: number
  usage_count?: number
  analysis_status: string
  created_at: string
  updated_at?: string
  offer_intelligence?: Record<string, any>
  psychology_intelligence?: Record<string, any>
  content_intelligence?: Record<string, any>
  competitive_intelligence?: Record<string, any>
  brand_intelligence?: Record<string, any>
}

// 🔧 FIX: Use API response type directly instead of custom interface
interface IntelligenceStore {
  // State - use API response type
  intelligence: Record<string, CampaignIntelligenceResponse>
  currentCampaignIntelligence: CampaignIntelligenceResponse | null
  isAnalyzing: boolean
  isGenerating: boolean
  error: string | null
  
  // Analysis state
  analysisProgress: number
  currentAnalysisStep: string
  
  // Keywords
  keywords: string[]
  suggestedKeywords: string[]
  
  // Actions
  loadCampaignIntelligence: (campaignId: string) => Promise<void>
  analyzeURL: (campaignId: string, url: string) => Promise<IntelligenceSource>
  uploadDocument: (campaignId: string, file: File) => Promise<IntelligenceSource>
  generateContent: (intelligenceId: string, contentType: string, preferences?: any) => Promise<any>
  updateKeywords: (campaignId: string, keywords: string[]) => Promise<void>
  clearError: () => void
  resetAnalysis: () => void
  
  // Computed - updated return types
  getIntelligenceForCampaign: (campaignId: string) => CampaignIntelligenceResponse | null
  getAnalyzedSources: (campaignId: string) => IntelligenceSource[]
  getAverageConfidence: (campaignId: string) => number
}

export const useIntelligenceStore = create<IntelligenceStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      intelligence: {},
      currentCampaignIntelligence: null,
      isAnalyzing: false,
      isGenerating: false,
      error: null,
      analysisProgress: 0,
      currentAnalysisStep: '',
      keywords: [],
      suggestedKeywords: [],

      // Actions
      loadCampaignIntelligence: async (campaignId: string) => {
        set({ isAnalyzing: true, error: null })
        
        try {
          const intelligence = await apiClient.getCampaignIntelligence(campaignId)
          
          // 🔧 FIX: Now types match perfectly
          set((state) => ({
            intelligence: {
              ...state.intelligence,
              [campaignId]: intelligence
            },
            currentCampaignIntelligence: intelligence,
            isAnalyzing: false
          }))
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load intelligence'
          set({ error: errorMessage, isAnalyzing: false })
          throw error
        }
      },

      analyzeURL: async (campaignId: string, url: string) => {
        set({ 
          isAnalyzing: true, 
          error: null,
          analysisProgress: 0,
          currentAnalysisStep: 'Connecting to URL...'
        })
        
        try {
          // Simulate progress updates
          const progressSteps = [
            { progress: 20, step: 'Fetching content...' },
            { progress: 40, step: 'Analyzing structure...' },
            { progress: 60, step: 'Extracting insights...' },
            { progress: 80, step: 'Processing intelligence...' },
            { progress: 100, step: 'Complete!' }
          ]

          for (const { progress, step } of progressSteps) {
            set({ analysisProgress: progress, currentAnalysisStep: step })
            await new Promise(resolve => setTimeout(resolve, 500))
          }

          const result = await apiClient.analyzeURL({
            url,
            campaign_id: campaignId,
            analysis_type: 'sales_page'
          })

          const newSource: IntelligenceSource = {
            id: result.intelligence_id,
            source_title: url,
            source_type: 'url',
            source_url: url,
            confidence_score: result.confidence_score,
            analysis_status: 'completed',
            created_at: new Date().toISOString(),
            offer_intelligence: result.offer_intelligence,
            psychology_intelligence: result.psychology_intelligence,
            competitive_intelligence: result.competitive_opportunities
          }

          // 🔧 FIX: Update to match API response structure
          set((state) => {
            const existingIntelligence = state.intelligence[campaignId]
            if (existingIntelligence) {
              const updatedIntelligence: CampaignIntelligenceResponse = {
                ...existingIntelligence,
                intelligence_entries: [...existingIntelligence.intelligence_entries, {
                  id: newSource.id,
                  source_type: newSource.source_type,
                  source_url: newSource.source_url,
                  source_title: newSource.source_title,
                  confidence_score: newSource.confidence_score,
                  analysis_status: newSource.analysis_status,
                  offer_intelligence: newSource.offer_intelligence || {},
                  psychology_intelligence: newSource.psychology_intelligence || {},
                  processing_metadata: {},
                  created_at: newSource.created_at,
                  updated_at: newSource.updated_at
                }],
                summary: {
                  ...existingIntelligence.summary,
                  total_intelligence_entries: existingIntelligence.intelligence_entries.length + 1
                }
              }
              
              return {
                intelligence: {
                  ...state.intelligence,
                  [campaignId]: updatedIntelligence
                },
                currentCampaignIntelligence: updatedIntelligence,
                isAnalyzing: false,
                analysisProgress: 0,
                currentAnalysisStep: ''
              }
            }
            
            return {
              isAnalyzing: false,
              analysisProgress: 0,
              currentAnalysisStep: ''
            }
          })

          return newSource
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to analyze URL'
          set({ 
            error: errorMessage, 
            isAnalyzing: false,
            analysisProgress: 0,
            currentAnalysisStep: ''
          })
          throw error
        }
      },

      uploadDocument: async (campaignId: string, file: File) => {
        set({ 
          isAnalyzing: true, 
          error: null,
          analysisProgress: 0,
          currentAnalysisStep: 'Uploading document...'
        })
        
        try {
          // Simulate upload progress
          const progressSteps = [
            { progress: 25, step: 'Processing document...' },
            { progress: 50, step: 'Extracting text...' },
            { progress: 75, step: 'Analyzing content...' },
            { progress: 100, step: 'Complete!' }
          ]

          for (const { progress, step } of progressSteps) {
            set({ analysisProgress: progress, currentAnalysisStep: step })
            await new Promise(resolve => setTimeout(resolve, 800))
          }

          const result = await apiClient.uploadDocument(file, campaignId)

          const newSource: IntelligenceSource = {
            id: result.intelligence_id,
            source_title: file.name,
            source_type: 'document',
            confidence_score: 0.85, // Default confidence for documents
            analysis_status: 'completed',
            created_at: new Date().toISOString()
          }

          // 🔧 FIX: Update to match API response structure
          set((state) => {
            const existingIntelligence = state.intelligence[campaignId]
            if (existingIntelligence) {
              const updatedIntelligence: CampaignIntelligenceResponse = {
                ...existingIntelligence,
                intelligence_entries: [...existingIntelligence.intelligence_entries, {
                  id: newSource.id,
                  source_type: newSource.source_type,
                  source_title: newSource.source_title,
                  confidence_score: newSource.confidence_score,
                  analysis_status: newSource.analysis_status,
                  offer_intelligence: {},
                  psychology_intelligence: {},
                  processing_metadata: {},
                  created_at: newSource.created_at
                }],
                summary: {
                  ...existingIntelligence.summary,
                  total_intelligence_entries: existingIntelligence.intelligence_entries.length + 1
                }
              }
              
              return {
                intelligence: {
                  ...state.intelligence,
                  [campaignId]: updatedIntelligence
                },
                currentCampaignIntelligence: updatedIntelligence,
                isAnalyzing: false,
                analysisProgress: 0,
                currentAnalysisStep: ''
              }
            }
            
            return {
              isAnalyzing: false,
              analysisProgress: 0,
              currentAnalysisStep: ''
            }
          })

          return newSource
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to upload document'
          set({ 
            error: errorMessage, 
            isAnalyzing: false,
            analysisProgress: 0,
            currentAnalysisStep: ''
          })
          throw error
        }
      },

      generateContent: async (intelligenceId: string, contentType: string, preferences = {}) => {
        set({ isGenerating: true, error: null })
        
        try {
          const result = await apiClient.generateContent({
            intelligence_id: intelligenceId,
            content_type: contentType,
            preferences,
            campaign_id: ''
          })

          set({ isGenerating: false })
          return result
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to generate content'
          set({ error: errorMessage, isGenerating: false })
          throw error
        }
      },

      updateKeywords: async (campaignId: string, keywords: string[]) => {
        try {
          // This would typically call an API to update keywords
          // For now, just update local state
          set({ keywords })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update keywords'
          set({ error: errorMessage })
          throw error
        }
      },

      clearError: () => {
        set({ error: null })
      },

      resetAnalysis: () => {
        set({ 
          isAnalyzing: false,
          isGenerating: false,
          analysisProgress: 0,
          currentAnalysisStep: '',
          error: null 
        })
      },

      // 🔧 FIX: Updated computed properties with correct return types
      getIntelligenceForCampaign: (campaignId: string) => {
        return get().intelligence[campaignId] || null
      },

      getAnalyzedSources: (campaignId: string) => {
        const intelligence = get().intelligence[campaignId]
        if (!intelligence?.intelligence_entries) return []
        
        // Convert API entries to IntelligenceSource format
        return intelligence.intelligence_entries
          .filter(entry => entry.analysis_status === 'completed')
          .map(entry => ({
            id: entry.id,
            source_title: entry.source_title || 'Unknown Source',
            source_type: entry.source_type,
            source_url: entry.source_url,
            confidence_score: entry.confidence_score,
            analysis_status: entry.analysis_status,
            created_at: entry.created_at,
            updated_at: entry.updated_at,
            offer_intelligence: entry.offer_intelligence,
            psychology_intelligence: entry.psychology_intelligence
          }))
      },

      getAverageConfidence: (campaignId: string) => {
        const sources = get().getAnalyzedSources(campaignId)
        if (sources.length === 0) return 0
        
        const total = sources.reduce((sum, source) => sum + source.confidence_score, 0)
        return total / sources.length
      }
    }),
    {
      name: 'intelligence-store',
      partialize: (state: { intelligence: any; keywords: any }) => ({
        // Only persist intelligence data, not loading states
        intelligence: state.intelligence,
        keywords: state.keywords
      })
    }
  )
)

// 🔧 FIX: Updated hooks with correct return types
export const useCampaignIntelligence = (campaignId: string) => {
  return useIntelligenceStore(state => state.getIntelligenceForCampaign(campaignId))
}

export const useAnalyzedSources = (campaignId: string) => {
  return useIntelligenceStore(state => state.getAnalyzedSources(campaignId))
}

export const useAverageConfidence = (campaignId: string) => {
  return useIntelligenceStore(state => state.getAverageConfidence(campaignId))
}

// Hook for analysis state
export const useAnalysisState = () => {
  return useIntelligenceStore(state => ({
    isAnalyzing: state.isAnalyzing,
    isGenerating: state.isGenerating,
    progress: state.analysisProgress,
    currentStep: state.currentAnalysisStep,
    error: state.error
  }))
}