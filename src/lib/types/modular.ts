// src/lib/types/modular.ts
// Type definitions for the modular structure components

import type { CampaignType } from './campaign';

export interface CampaignGenerationRequest {
  title: string
  description: string
  campaign_type: CampaignType
  duration_days: number
  platforms: string[]
  automation_level: AutomationLevel
  company_id?: string
  target_audience?: string
  key_messages?: string[]
  budget_constraints?: {
    total_budget: number
    cost_per_generation: number
  }
}

export interface CompleteCampaign {
  campaign_id: string
  strategy: CampaignStrategy
  content_calendar: ContentCalendar
  content: CampaignContent
  timeline: PublishingTimeline
  automation?: AutomationSetup
  estimated_performance: PerformancePrediction
}

export interface CampaignStrategy {
  campaign_type: CampaignType
  target_audience: TargetAudience
  key_messages: string[]
  content_themes: string[]
  platform_strategy: Record<string, PlatformStrategy>
  timeline_strategy: TimelineStrategy
  success_metrics: SuccessMetrics
  performance_prediction: PerformancePrediction
}

export interface ContentCalendar {
  start_date: string
  end_date: string
  items: CalendarItem[]
  total_content_pieces: number
  content_distribution: ContentDistribution
}

export interface CalendarItem {
  id: string
  date: string
  content_type: string
  platform: string
  title: string
  description: string
  priority: number
  dependencies?: string[]
}

export interface CampaignContent {
  items: Record<string, ContentItem>
  total_pieces: number
  content_distribution: ContentDistribution
  brand_consistency_score: number
}

export interface ContentItem {
  id: string
  type: string
  platform_type: string
  text?: string
  images?: Array<{ url: string; alt: string }>
  video?: { url: string; thumbnail: string; duration: number }
  metadata: ContentMetadata
  generation_data: GenerationData
}

export interface ContentMetadata {
  created_at: string
  provider: string
  cost: number
  quality_score: number
  estimated_performance: number
}

export interface GenerationData {
  prompt_used: string
  intelligence_context: Record<string, any>
  provider_response: Record<string, any>
  generation_time: number
}

export interface PublishingTimeline {
  items: TimelineItem[]
  total_posts: number
  platform_distribution: Record<string, number>
  estimated_reach: number
  optimization_score: number
}

export interface TimelineItem {
  content_id: string
  platform: string
  scheduled_time: string
  priority_score: number
  expected_engagement: number
  status: 'scheduled' | 'published' | 'failed' | 'draft'
}

export interface CampaignPublishRequest {
  timeline_adjustments?: Partial<PublishingTimeline>
  platform_preferences?: Record<string, boolean>
  automation_settings?: AutomationSettings
}

export interface CampaignPublishingResult {
  campaign_id: string
  total_items: number
  successful_items: number
  failed_items: number
  results: PublishResult[]
  failed_timeline_items: TimelineItem[]
}

export interface PublishResult {
  success: boolean
  platform_post_id?: string
  platform: string
  published_url?: string
  error?: string
  retry_after?: number
}

// Platform Integration Types
export interface PlatformIntegration {
  id: string
  user_id: string
  platform: string
  platform_user_id: string
  platform_username: string
  scopes: string[]
  is_active: boolean
  connected_at: string
  last_used_at?: string
}

export interface OAuthFlowResult {
  oauth_url: string
  state: string
  expires_at: string
}

export interface OAuthCallbackResult {
  success: boolean
  platform_user_info?: PlatformUserInfo
  scopes_granted?: string[]
  error?: string
}

export interface PlatformUserInfo {
  user_id: string
  username: string
  display_name: string
  profile_picture?: string
  follower_count?: number
}

// Enhanced Content Generation Types
export interface TextGenerationRequest {
  user_prompt: string
  content_type?: string
  tone?: string
  length?: 'short' | 'medium' | 'long'
  include_hashtags?: boolean
  include_cta?: boolean
}

export interface ImageGenerationRequest {
  user_prompt: string
  style?: string
  dimensions?: string
  include_text?: boolean
  brand_colors?: string[]
}

export interface VideoGenerationRequest {
  user_prompt: string
  duration?: number
  style?: string
  include_audio?: boolean
  aspect_ratio?: string
}

export interface GeneratedContent {
  id: string
  content: string | { url: string; type: string }
  metadata: ContentMetadata
  usage_data: UsageData
}

export interface UsageData {
  generations_used: number
  generations_remaining: number
  cost_this_month: number
  tier: string
}

export interface UsageAnalytics {
  monthly_usage: MonthlyUsage
  cost_breakdown: CostBreakdown
  provider_performance: ProviderPerformance
  recommendations: UsageRecommendation[]
}

export interface MonthlyUsage {
  text_generations: number
  image_generations: number
  video_generations: number
  total_cost: number
}

export interface CostBreakdown {
  by_content_type: Record<string, number>
  by_provider: Record<string, number>
  by_campaign: Record<string, number>
}

export interface ProviderPerformance {
  response_times: Record<string, number>
  success_rates: Record<string, number>
  quality_scores: Record<string, number>
}

export interface UsageRecommendation {
  id: string
  type: 'cost_optimization' | 'quality_improvement' | 'usage_pattern'
  message: string
  potential_savings?: number
  action_required?: boolean
}

export interface GenerationHistory {
  id: string
  campaign_id: string
  content_type: string
  provider: string
  cost: number
  quality_score: number
  created_at: string
  user_rating?: number
}

// Enum Types
// CampaignType is now unified in ./campaign.ts
// Import it instead of defining as enum
export type { CampaignType } from './campaign';

export enum AutomationLevel {
  MANUAL = 'manual',
  SEMI_AUTOMATED = 'semi_automated',
  FULLY_AUTOMATED = 'fully_automated',
  AI_OPTIMIZED = 'ai_optimized'
}

// Additional supporting types
export interface TargetAudience {
  demographics: Record<string, any>
  interests: string[]
  behaviors: string[]
  pain_points: string[]
  preferred_platforms: string[]
}

export interface PlatformStrategy {
  posting_frequency: string
  optimal_times: string[]
  content_types: string[]
  engagement_tactics: string[]
}

export interface TimelineStrategy {
  posting_schedule: string
  peak_engagement_times: string[]
  campaign_phases: CampaignPhase[]
}

export interface CampaignPhase {
  name: string
  duration_days: number
  objectives: string[]
  content_focus: string[]
}

export interface SuccessMetrics {
  primary_kpis: string[]
  engagement_targets: Record<string, number>
  conversion_goals: Record<string, number>
}

export interface PerformancePrediction {
  estimated_reach: number
  estimated_engagement: number
  estimated_conversions: number
  confidence_score: number
}

export interface ContentDistribution {
  by_type: Record<string, number>
  by_platform: Record<string, number>
  by_date: Record<string, number>
}

export interface AutomationSetup {
  level: AutomationLevel
  settings: AutomationSettings
  safety_checks: SafetyCheck[]
  monitoring_config: MonitoringConfig
}

export interface AutomationSettings {
  auto_publish: boolean
  approval_required: boolean
  retry_failed: boolean
  optimize_timing: boolean
}

export interface SafetyCheck {
  type: string
  enabled: boolean
  threshold?: number
  action: string
}

export interface MonitoringConfig {
  performance_tracking: boolean
  cost_alerts: boolean
  quality_monitoring: boolean
  alert_thresholds: Record<string, number>
}

// Add these to your existing modular.ts file:

export interface PlatformImageRequest {
  campaign_id: string
  platform_format: string
  image_type?: string
  style_preferences?: Record<string, any>
  user_tier?: string
}

export interface MultiPlatformImageRequest {
  campaign_id: string
  platforms: string[]
  image_type?: string
  batch_style?: Record<string, any>
  user_tier?: string
}

export interface PlatformSpec {
  platform: string
  dimensions: string
  aspect_ratio: string
  format: string
  max_file_size_mb: number
  recommended_style: string
  optimal_text_zones: Array<{ x: number; y: number; width: number; height: number }>
  color_profile: string
  use_case: string
}