// File: src/lib/types/output.ts

/* export interface GeneratedContent {
  id: string
  campaign_id: string
  content_type: ContentType
  title: string
  content: string | ContentStructure
  status: ContentStatus
  template_used?: string
  generation_parameters?: GenerationParameters
  quality_score?: number
  performance_metrics?: PerformanceMetrics
  created_at: string
  updated_at: string
  published_at?: string
} */

export interface GeneratedContent {
  content_id: string     // ✅ Added
  campaign_id: string    // ✅ Added (was missing)
  content_type: string   // ✅ Added
  generated_content: {   // ✅ Added
    title: string
    content: any
    metadata?: any
    usage_tips?: string[]
  }
  smart_url?: string           // ✅ Added
  performance_predictions: any // ✅ Added
}

export interface ContentStructure {
  // Email Content
  subject_line?: string
  preview_text?: string
  body_text?: string
  html_content?: string
  
  // Video Script
  hook?: string
  script_sections?: ScriptSection[]
  call_to_action?: string
  duration_estimate?: string
  
  // Social Media
  platform?: SocialPlatform
  post_text?: string
  hashtags?: string[]
  media_suggestions?: string[]
  
  // Blog Content
  headline?: string
  meta_description?: string
  blog_sections?: BlogSection[]
  word_count?: number
  
  // Ad Copy
  headlines?: string[]
  descriptions?: string[]
  call_to_actions?: string[]
  
  // Lead Magnet
  magnet_type?: string
  title?: string
  outline?: string[]
  
  // Sales Material
  material_type?: string
  key_points?: string[]
  sales_sections?: SalesSection[]
}

export interface ScriptSection {
  title: string
  content: string
  duration?: string
  notes?: string
}

export interface BlogSection {
  heading: string
  content: string
  word_count?: number
  keywords?: string[]
}

export interface SalesSection {
  section_type: 'introduction' | 'problem' | 'solution' | 'benefits' | 'proof' | 'cta'
  title: string
  content: string
  talking_points?: string[]
}

export interface GenerationParameters {
  tone?: string
  style?: string
  target_audience?: string
  keywords?: string[]
  length?: 'short' | 'medium' | 'long'
  format_preferences?: Record<string, any>
  include_cta?: boolean
  personalization?: PersonalizationOptions
}

export interface PersonalizationOptions {
  company_name?: string
  industry?: string
  target_pain_points?: string[]
  unique_value_props?: string[]
  brand_voice?: string
}

export interface PerformanceMetrics {
  engagement_score?: number
  readability_score?: number
  seo_score?: number
  conversion_potential?: number
  social_shareability?: number
}

export interface ContentGenerationRequest {
  campaign_id: string
  content_type: ContentType
  template?: string
  generation_parameters?: GenerationParameters
  intelligence_entries?: string[]
  customization?: Record<string, any>
  batch_generation?: boolean
}

export interface EmailSeriesRequest extends ContentGenerationRequest {
  series_length: number
  email_frequency: 'daily' | 'every_other_day' | 'weekly'
  series_goal: 'nurture' | 'onboarding' | 'sales' | 'educational'
  automation_triggers?: string[]
}

export interface VideoScriptRequest extends ContentGenerationRequest {
  video_type: 'vsl' | 'demo' | 'explainer' | 'testimonial' | 'social'
  target_duration: string
  include_visuals?: boolean
  script_format?: 'teleprompter' | 'outline' | 'full_script'
}

export interface SocialContentRequest extends ContentGenerationRequest {
  platforms: SocialPlatform[]
  post_count: number
  campaign_theme?: string
  include_visuals?: boolean
  posting_schedule?: PostingSchedule
}

export interface BlogContentRequest extends ContentGenerationRequest {
  target_word_count: number
  seo_focus_keywords?: string[]
  content_pillars?: string[]
  include_images?: boolean
  internal_links?: string[]
}

export interface AdCopyRequest extends ContentGenerationRequest {
  ad_platform: 'google' | 'facebook' | 'linkedin' | 'twitter' | 'tiktok'
  ad_format: 'search' | 'display' | 'video' | 'carousel' | 'collection'
  budget_range?: string
  target_demographics?: Demographics
}

export interface LeadMagnetRequest extends ContentGenerationRequest {
  magnet_type: 'ebook' | 'checklist' | 'template' | 'webinar' | 'quiz' | 'tool'
  target_problem?: string
  value_proposition?: string
  delivery_method?: 'download' | 'email' | 'members_area'
}

export interface SalesMaterialRequest extends ContentGenerationRequest {
  material_type: 'proposal' | 'one_pager' | 'presentation' | 'brochure' | 'case_study'
  target_decision_maker?: string
  sales_stage?: 'awareness' | 'consideration' | 'decision'
  competitive_context?: string[]
}

export interface PostingSchedule {
  frequency: 'daily' | 'weekly' | 'bi_weekly' | 'custom'
  best_times?: string[]
  timezone?: string
}

export interface Demographics {
  age_range?: string
  gender?: string
  location?: string[]
  interests?: string[]
  income_level?: string
}

export interface BatchGenerationRequest {
  campaign_id: string
  content_types: ContentType[]
  shared_parameters?: GenerationParameters
  individual_requests?: ContentGenerationRequest[]
}

export interface ContentTemplate {
  id: string
  name: string
  content_type: ContentType
  structure: any
  variables: TemplateVariable[]
  is_custom: boolean
}

export interface TemplateVariable {
  name: string
  type: 'text' | 'number' | 'select' | 'multiselect'
  description: string
  required: boolean
  default_value?: any
  options?: string[]
}

export interface GenerationQueue {
  id: string
  campaign_id: string
  request_type: string
  status: GenerationStatus
  progress: number
  estimated_completion?: string
  error_message?: string
  created_at: string
}

export interface ContentLibrary {
  id: string
  campaign_id: string
  content_items: GeneratedContent[]
  folders: ContentFolder[]
  tags: string[]
  total_items: number
}

export interface ContentFolder {
  id: string
  name: string
  content_type?: ContentType
  item_count: number
  created_at: string
}

export interface ExportOptions {
  format: 'docx' | 'pdf' | 'html' | 'txt' | 'csv' | 'json'
  include_metadata?: boolean
  template_style?: string
  custom_branding?: boolean
}

export interface ContentAnalytics {
  content_id: string
  views: number
  engagement_rate: number
  conversion_rate?: number
  performance_score: number
  feedback: ContentFeedback[]
}

export interface ContentFeedback {
  type: 'positive' | 'negative' | 'neutral'
  comment: string
  source: string
  timestamp: string
}

// Enums and Type Unions
export type ContentType = 
  | 'email'
  | 'email_series'
  | 'video_script'
  | 'social_post'
  | 'blog_post'
  | 'ad_copy'
  | 'lead_magnet'
  | 'sales_material'
  | 'newsletter'
  | 'case_study'
  | 'whitepaper'
  | 'presentation'

export type ContentStatus = 
  | 'draft'
  | 'review'
  | 'approved'
  | 'published'
  | 'archived'
  | 'generating'
  | 'failed'

export type GenerationStatus = 
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'

export type SocialPlatform = 
  | 'facebook'
  | 'instagram'
  | 'twitter'
  | 'linkedin'
  | 'tiktok'
  | 'youtube'
  | 'pinterest'

// Response Types
export interface ContentGenerationResponse {
  content_id: string
  campaign_id: string
  content: GeneratedContent
  generation_time: number
  quality_metrics: PerformanceMetrics
  suggestions?: string[]
}

export interface BatchGenerationResponse {
  batch_id: string
  total_items: number
  completed_items: number
  failed_items: number
  results: ContentGenerationResponse[]
  estimated_completion?: string
}

export interface ContentExportResponse {
  export_id: string
  download_url: string
  file_size: number
  expires_at: string
}