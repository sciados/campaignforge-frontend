// File: src/lib/types/campaign.ts - Updated with missing properties

import { InputSource } from './inputSource'
import { CampaignIntelligence } from './intelligence'
import { GeneratedContent } from './output'

export interface Campaign {
  id: string
  title: string
  description: string
  keywords?: string[]
  target_audience?: string
  campaign_type: CampaignType
  status: CampaignStatus
  tone?: string
  style?: string
  settings: CampaignSettings
  created_at: string
  updated_at: string
  user_id: string
  company_id: string
  
  // Missing properties from original api.ts (restored)
  is_demo?: boolean
  auto_analysis_enabled?: boolean
  auto_analysis_status?: string
  analysis_confidence_score?: number
  salespage_url?: string
  content_types?: string[]
  content_tone?: string
  content_style?: string
  generate_content_after_analysis?: boolean
  
  // Enhanced workflow fields for 2-step process
  workflow_state?: string
  completion_percentage?: number
  sources_count?: number
  intelligence_count?: number
  content_count?: number
  total_steps?: number
  
  // Related data (populated via joins or separate queries)
  input_sources?: InputSource[]
  intelligence?: CampaignIntelligence[]
  generated_content?: GeneratedContent[]
  
  // Computed fields
  generated_content_count?: number
  confidence_score?: number
  last_activity?: string
  processing_status?: 'idle' | 'processing' | 'generating' | 'analyzing'
}

export interface CampaignSettings {
  // Universal campaign settings
  campaign_type?: CampaignType
  input_source_type?: string
  created_from?: string
  
  // Analysis preferences
  auto_analyze_inputs?: boolean
  analysis_depth?: 'basic' | 'comprehensive' | 'deep'
  include_vsl_detection?: boolean
  
  // Content generation preferences
  default_tone?: string
  default_style?: string
  content_preferences?: ContentPreferences
  
  // Intelligence settings
  keyword_extraction?: boolean
  competitive_analysis?: boolean
  campaign_angle_generation?: boolean
  
  // Processing settings
  auto_process_uploads?: boolean
  batch_processing_enabled?: boolean
  notification_preferences?: NotificationSettings
  
  // Custom settings
  custom_fields?: Record<string, any>
  integrations?: IntegrationSettings
}

export interface ContentPreferences {
  preferred_lengths?: {
    email?: 'short' | 'medium' | 'long'
    blog?: 'short' | 'medium' | 'long'
    social?: 'short' | 'medium' | 'long'
  }
  include_cta?: boolean
  brand_voice?: string
  avoid_topics?: string[]
  required_elements?: string[]
}

export interface NotificationSettings {
  email_notifications?: boolean
  analysis_complete?: boolean
  content_generated?: boolean
  processing_errors?: boolean
  weekly_summary?: boolean
}

export interface IntegrationSettings {
  google_drive?: boolean
  dropbox?: boolean
  slack?: boolean
  zapier?: boolean
  webhook_url?: string
}

export interface CampaignCreateRequest {
  title: string
  description: string
  keywords?: string[]
  target_audience?: string
  campaign_type?: CampaignType
  tone?: string
  style?: string
  settings?: Partial<CampaignSettings>
  
  // Auto-analysis fields for streamlined workflow
  salespage_url?: string
  auto_analysis_enabled?: boolean
  content_types?: string[]
  content_tone?: string
  content_style?: string
  generate_content_after_analysis?: boolean
}

export interface CampaignUpdateRequest {
  title?: string
  description?: string
  keywords?: string[]
  target_audience?: string
  tone?: string
  style?: string
  settings?: Partial<CampaignSettings>
  status?: CampaignStatus
  
  // Auto-analysis updates
  auto_analysis_enabled?: boolean
  content_types?: string[]
  content_tone?: string
  content_style?: string
  generate_content_after_analysis?: boolean
}

export interface CampaignStats {
  campaign_id: string
  total_inputs: number
  processed_inputs: number
  failed_inputs: number
  total_intelligence: number
  confidence_avg: number
  total_content: number
  content_by_type: Record<string, number>
  last_activity: string
  processing_time_avg: number
}

export interface CampaignActivity {
  id: string
  campaign_id: string
  activity_type: ActivityType
  description: string
  metadata?: Record<string, any>
  created_at: string
  user_id?: string
}

export interface CampaignSummary {
  campaign: Campaign
  stats: CampaignStats
  recent_activity: CampaignActivity[]
  quick_insights: QuickInsight[]
}

export interface QuickInsight {
  type: 'success' | 'warning' | 'info' | 'error'
  title: string
  description: string
  action_required?: boolean
  action_text?: string
  action_url?: string
}

export interface CampaignFilter {
  status?: CampaignStatus[]
  campaign_type?: CampaignType[]
  created_after?: string
  created_before?: string
  has_intelligence?: boolean
  has_content?: boolean
  search_query?: string
  sort_by?: 'created_at' | 'updated_at' | 'title' | 'confidence_score'
  sort_order?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export interface CampaignListResponse {
  campaigns: Campaign[]
  total_count: number
  filtered_count: number
  has_more: boolean
  next_offset?: number
}

export interface CampaignBulkAction {
  action: 'delete' | 'archive' | 'activate' | 'export' | 'duplicate'
  campaign_ids: string[]
  options?: Record<string, any>
}

export interface CampaignTemplate {
  id: string
  name: string
  description: string
  campaign_type: CampaignType
  default_settings: CampaignSettings
  suggested_inputs: string[]
  content_templates: string[]
  is_public: boolean
  created_by: string
}

export interface CampaignCloneRequest {
  source_campaign_id: string
  new_title: string
  clone_inputs?: boolean
  clone_intelligence?: boolean
  clone_content?: boolean
  clone_settings?: boolean
}

// Enums and Type Unions
export type CampaignType = 
  | 'universal'
  | 'social_media'
  | 'email_marketing'
  | 'content_marketing'
  | 'paid_advertising'
  | 'seo'
  | 'influencer'
  | 'video_marketing'
  | 'lead_generation'
  | 'sales_enablement'
  | 'brand_awareness'
  | 'competitive_analysis'

export type CampaignStatus = 
  | 'draft'
  | 'active'
  | 'paused'
  | 'completed'
  | 'archived'
  | 'processing'
  | 'error'

export type ActivityType = 
  | 'campaign_created'
  | 'campaign_updated'
  | 'input_added'
  | 'input_processed'
  | 'intelligence_generated'
  | 'content_generated'
  | 'settings_changed'
  | 'campaign_shared'
  | 'export_completed'
  | 'error_occurred'

// API Response Types
export interface CampaignResponse {
  success: boolean
  campaign: Campaign
  message?: string
}

export interface CampaignListApiResponse {
  success: boolean
  data: CampaignListResponse
  message?: string
}

export interface CampaignStatsResponse {
  success: boolean
  stats: CampaignStats
  message?: string
}

export interface CampaignActivityResponse {
  success: boolean
  activities: CampaignActivity[]
  total_count: number
  message?: string
}