// src/lib/types/intelligence-api.ts - Extended Intelligence Types for API
// This extends your existing intelligence types without conflicts

// Re-export everything from your existing intelligence types
export * from '../types/intelligence'

// Add API-specific intelligence types
export interface CampaignIntelligenceResponse {
  campaign_id: string
  intelligence_entries: Array<{
    id: string
    source_type: string
    source_url?: string
    source_title?: string
    confidence_score: number
    analysis_status: string
    offer_intelligence: Record<string, any>
    psychology_intelligence: Record<string, any>
    processing_metadata: Record<string, any>
    created_at: string
    updated_at?: string
  }>
  pagination: {
    skip: number
    limit: number
    total: number
    returned: number
  }
  summary: {
    total_intelligence_entries: number
    available_types: string[]
    campaign_title: string
    auto_analysis_status: string
    analysis_confidence_score: number
  }
  is_demo: boolean
}

export interface IntelligenceSource {
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

export interface URLAnalysisRequest {
  url: string
  campaign_id: string
  analysis_type?: string
}

export interface URLAnalysisResponse {
  intelligence_id: string
  analysis_status: string
  confidence_score: number
  offer_intelligence: any
  psychology_intelligence: any
  competitive_opportunities: any[]
  campaign_suggestions: string[]
}

export interface DocumentUploadResponse {
  intelligence_id: string
  status: string
  insights_extracted: number
  content_opportunities: string[]
  processing_metadata: {
    file_type: string
    file_size: number
    pages_processed?: number
    confidence_score: number
  }
}

export interface IntelligenceSearchResponse {
  results: Array<{
    intelligence_id: string
    campaign_id: string
    source_title: string
    source_type: string
    confidence_score: number
    relevance_score: number
    highlight: string
    created_at: string
  }>
  total: number
  query: string
  filters_applied: Record<string, any>
  suggestions: string[]
}

export interface ActionableInsightsResponse {
  campaign_id: string
  insights: Array<{
    id: string
    type: 'opportunity' | 'threat' | 'optimization' | 'trend'
    title: string
    description: string
    confidence: number
    priority: 'high' | 'medium' | 'low'
    effort_required: 'high' | 'medium' | 'low'
    potential_impact: number
    actionable_steps: Array<{
      step: string
      description: string
      resources_needed: string[]
      estimated_time: string
    }>
    supporting_data: Array<{
      source: string
      data_point: string
      confidence: number
    }>
    created_at: string
  }>
  summary: {
    total_insights: number
    high_priority_count: number
    avg_confidence: number
    estimated_impact: number
  }
  next_steps: string[]
}