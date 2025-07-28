// File: src/lib/types/intelligence.ts

export interface CampaignIntelligence {
  id: string
  campaign_id: string
  source_id: string
  intelligence_type: 'sales_page' | 'vsl' | 'competitive' | 'content' | 'keyword'
  confidence_score: number
  keywords: string[]
  insights: IntelligenceInsights
  analysis_metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface IntelligenceInsights {
  // Content Analysis
  content_themes?: string[]
  writing_style?: string
  tone_analysis?: string
  target_audience?: string
  
  // Competitive Intelligence
  unique_value_propositions?: string[]
  competitive_advantages?: string[]
  market_gaps?: string[]
  improvement_opportunities?: string[]
  
  // Psychology & Persuasion
  emotional_triggers?: string[]
  persuasion_techniques?: string[]
  objection_handling?: string[]
  trust_signals?: string[]
  
  // Offer Analysis
  pricing_strategy?: PricingStrategy
  offer_structure?: OfferStructure
  urgency_tactics?: string[]
  guarantee_details?: string[]
  
  // Campaign Angles
  primary_angle?: CampaignAngle
  alternative_angles?: CampaignAngle[]
  positioning_strategy?: PositioningStrategy
  
  // VSL Specific
  vsl_analysis?: VSLAnalysis
  
  // Actionable Insights
  immediate_opportunities?: string[]
  content_ideas?: string[]
  testing_recommendations?: string[]
}

export interface PricingStrategy {
  price_points?: number[]
  pricing_model?: string
  discount_strategy?: string
  payment_options?: string[]
  price_anchoring?: boolean
}

export interface OfferStructure {
  main_product?: string
  bonuses?: string[]
  guarantees?: string[]
  scarcity_elements?: string[]
  social_proof?: string[]
}

export interface CampaignAngle {
  angle: string
  reasoning: string
  target_audience: string
  key_messages: string[]
  differentiation_points: string[]
  strength_score?: number
  use_case?: string
}

export interface PositioningStrategy {
  market_position: string
  competitive_advantage: string
  value_proposition: string
  messaging_framework: string[]
}

export interface VSLAnalysis {
  video_detected: boolean
  video_length?: number
  transcript_available?: boolean
  key_moments?: VideoMoment[]
  psychological_hooks?: string[]
  call_to_actions?: CallToAction[]
  story_structure?: string[]
}

export interface VideoMoment {
  timestamp: string
  moment_type: 'hook' | 'problem' | 'solution' | 'proof' | 'cta' | 'objection'
  description: string
  effectiveness_score?: number
}

export interface CallToAction {
  text: string
  placement: string
  urgency_level: 'low' | 'medium' | 'high'
  effectiveness_score?: number
}

export interface IntelligenceAnalysisRequest {
  campaign_id: string
  source_ids: string[]
  analysis_type?: 'basic' | 'comprehensive' | 'competitive'
  include_vsl_detection?: boolean
  generate_angles?: boolean
}

export interface EnhancedAnalysisRequest {
  campaign_id: string
  url: string
  analysis_depth: 'basic' | 'comprehensive' | 'deep'
  include_vsl_detection?: boolean
  focus_areas?: ('content' | 'psychology' | 'offers' | 'competitive')[]
}

export interface BatchAnalysisRequest {
  campaign_id: string
  urls: string[]
  analysis_type: 'competitive' | 'market_research' | 'content_audit'
  batch_name?: string
}

export interface CampaignAngleRequest {
  campaign_id: string
  intelligence_entries: string[]
  target_audience?: string
  business_context?: string
  differentiation_focus?: string[]
}

export interface VSLAnalysisRequest {
  campaign_id: string
  url: string
  extract_transcript?: boolean
  analyze_moments?: boolean
}

export interface URLValidationRequest {
  url: string
  expected_type?: 'sales_page' | 'vsl' | 'general' | 'blog'
}

// Response Types
export interface EnhancedSalesPageIntelligence extends CampaignIntelligence {
  url_analysis: {
    page_type: string
    load_speed: string
    mobile_optimized: boolean
    seo_score?: number
  }
  technical_analysis: {
    conversion_elements: string[]
    trust_signals: string[]
    page_structure: string[]
  }
  actionable_insights: {
    immediate_opportunities: string[]
    content_creation_ideas: string[]
    campaign_strategies: string[]
    testing_recommendations: string[]
  }
}

export interface VSLTranscriptionResult {
  transcript_id: string
  video_url: string
  transcript_text?: string
  key_moments: VideoMoment[]
  psychological_hooks: string[]
  offer_mentions: OfferMention[]
  call_to_actions: CallToAction[]
}

export interface OfferMention {
  timestamp: string
  offer_type: string
  description: string
  price_mentioned?: number
}

export interface CampaignAngleResponse {
  primary_angle: CampaignAngle
  alternative_angles: CampaignAngle[]
  positioning_strategy: PositioningStrategy
  implementation_guide: {
    content_priorities: string[]
    channel_recommendations: string[]
    testing_suggestions: string[]
  }
}

export interface BatchAnalysisResponse {
  batch_id: string
  total_urls: number
  completed_analyses: number
  failed_analyses: number
  results: CampaignIntelligence[]
  summary_insights: {
    common_themes: string[]
    market_trends: string[]
    competitive_gaps: string[]
  }
}

export interface URLValidationResponse {
  url: string
  is_valid: boolean
  page_type: 'sales_page' | 'vsl' | 'blog' | 'homepage' | 'product' | 'unknown'
  confidence_score: number
  detected_elements: string[]
  recommended_analysis_type: string
  estimated_processing_time: string
}

export type IntelligenceType = 
  | 'sales_page' 
  | 'vsl' 
  | 'competitive' 
  | 'content' 
  | 'keyword'
  | 'batch'
  | 'enhanced'