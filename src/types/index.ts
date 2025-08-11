// src/types/index.ts
/**
 * TypeScript types for RodgersDigital frontend
 * Matches backend models and API responses
 */

// =============================================================================
// USER & AUTH TYPES
// =============================================================================

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  company_id: string;
  role: 'admin' | 'owner' | 'member' | 'viewer';
  is_active: boolean;
  is_verified: boolean;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
  company: Company;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  company_name: string;
}

// =============================================================================
// COMPANY TYPES
// =============================================================================

export interface Company {
  id: string;
  company_name: string;
  company_slug: string;
  industry?: string;
  company_size: 'solo' | 'small' | 'medium' | 'large' | 'enterprise';
  website_url?: string;
  subscription_tier: 'free' | 'growth' | 'professional' | 'agency';
  subscription_status: 'active' | 'inactive' | 'trial' | 'cancelled';
  monthly_credits_used: number;
  monthly_credits_limit: number;
  total_campaigns_created: number;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// CAMPAIGN TYPES
// =============================================================================

export type CampaignType = 
  | 'social_media' 
  | 'email_marketing' 
  | 'video_content' 
  | 'blog_post' 
  | 'advertisement' 
  | 'product_launch' 
  | 'brand_awareness' 
  | 'multimedia'
    'universal';

export type CampaignStatus = 
  | 'draft' 
  | 'in_progress' 
  | 'review' 
  | 'active' 
  | 'completed' 
  | 'archived';

export interface Campaign {
  id: string;
  title: string;
  description?: string;
  target_audience?: string;
  campaign_type: CampaignType;
  status: CampaignStatus;
  tone?: string;
  style?: string;
  brand_voice?: string;
  content: Record<string, any>;
  settings: Record<string, any>;
  campaign_metadata: Record<string, any>;
  user_id: string;
  company_id: string;
  created_at: string;
  updated_at: string;
  
  // Relationships (populated when needed)
  intelligence_entries?: CampaignIntelligence[];
  generated_content?: GeneratedContent[];
  smart_urls?: SmartURL[];
  assets?: CampaignAsset[];
}

export type AssetType = 
  | 'image' 
  | 'video' 
  | 'audio' 
  | 'text' 
  | 'logo' 
  | 'social_post' 
  | 'email_template' 
  | 'blog_post' 
  | 'ad_copy';

export interface CampaignAsset {
  id: string;
  asset_type: AssetType;
  filename?: string;
  file_url?: string;
  file_size?: number;
  prompt_used?: string;
  generation_settings: Record<string, any>;
  asset_metadata: Record<string, any>;
  campaign_id: string;
  user_id: string;
  company_id: string;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// INTELLIGENCE TYPES
// =============================================================================

export type IntelligenceSourceType = 
  | 'sales_page' 
  | 'document' 
  | 'audio' 
  | 'video' 
  | 'website' 
  | 'competitor_analysis';

export type AnalysisStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed';

export interface CampaignIntelligence {
  id: string;
  source_url?: string;
  source_type: IntelligenceSourceType;
  source_title?: string;
  analysis_status: AnalysisStatus;
  offer_intelligence: Record<string, any>;
  psychology_intelligence: Record<string, any>;
  content_intelligence: Record<string, any>;
  competitive_intelligence: Record<string, any>;
  brand_intelligence: Record<string, any>;
  confidence_score: number;
  usage_count: number;
  success_rate: number;
  raw_content?: string;
  processing_metadata: Record<string, any>;
  campaign_id: string;
  user_id: string;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export interface GeneratedContent {
  id: string;
  content_type: string;
  content_title?: string;
  content_body: string;
  content_metadata: Record<string, any>;
  generation_prompt?: string;
  generation_settings: Record<string, any>;
  intelligence_used: Record<string, any>;
  performance_data: Record<string, any>;
  user_rating?: number;
  is_published: boolean;
  published_at?: string;
  campaign_id: string;
  intelligence_id?: string;
  user_id: string;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export interface SmartURL {
  id: string;
  short_code: string;
  original_url: string;
  tracking_url: string;
  tracking_parameters: Record<string, any>;
  expiration_date?: string;
  is_active: boolean;
  click_count: number;
  unique_clicks: number;
  conversion_count: number;
  revenue_attributed: number;
  click_analytics: Record<string, any>;
  conversion_analytics: Record<string, any>;
  campaign_id: string;
  generated_content_id?: string;
  user_id: string;
  company_id: string;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// API REQUEST/RESPONSE TYPES
// =============================================================================

// Intelligence Analysis
export interface AnalyzeURLRequest {
  url: string;
  campaign_id: string;
  analysis_type?: 'sales_page' | 'website' | 'salespage';
}

export interface AnalysisResponse {
  intelligence_id: string;
  analysis_status: string;
  confidence_score: number;
  offer_intelligence: Record<string, any>;
  psychology_intelligence: Record<string, any>;
  competitive_opportunities: Array<Record<string, any>>;
  campaign_suggestions: string[];
}

// Content Generation
export interface GenerateContentRequest {
  intelligence_id: string;
  content_type: string;
  preferences: Record<string, any>;
  campaign_id: string;
}

export interface ContentGenerationResponse {
  content_id: string;
  content_type: string;
  generated_content: Record<string, any>;
  smart_url?: string;
  performance_predictions: Record<string, any>;
}

// Dashboard Stats
export interface CompanyStatsResponse {
  company_name: string;
  subscription_tier: string;
  monthly_credits_used: number;
  monthly_credits_limit: number;
  credits_remaining: number;
  total_campaigns_created: number;
  active_campaigns: number;
  team_members: number;
  campaigns_this_month: number;
  usage_percentage: number;
}

// Usage Stats
export interface UsageStats {
  current_usage: {
    analyses_this_month: number;
    generations_this_month: number;
    credits_used: number;
    credits_limit: number;
  };
  tier_limits: {
    tier: string;
    analysis_limit: number;
    generation_limit: number;
    analyses_remaining: number;
    generations_remaining: number;
  };
  upgrade_suggestions: {
    should_upgrade: boolean;
    next_tier?: string;
    upgrade_benefits: string[];
  };
}

// Campaign Intelligence Summary
export interface CampaignIntelligenceSummary {
  campaign_id: string;
  intelligence_entries: Array<{
    id: string;
    source_type: IntelligenceSourceType;
    source_title?: string;
    source_url?: string;
    confidence_score: number;
    usage_count: number;
    created_at: string;
    key_insights: number;
  }>;
  generated_content: Array<{
    id: string;
    content_type: string;
    content_title?: string;
    user_rating?: number;
    is_published: boolean;
    created_at: string;
  }>;
  summary: {
    total_intelligence_entries: number;
    total_generated_content: number;
    avg_confidence_score: number;
  };
}

// =============================================================================
// UI STATE TYPES
// =============================================================================

export interface UIState {
  isLoading: boolean;
  error?: string | null;
  success?: string | null;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Form Types
export interface CampaignFormData {
  title: string;
  description?: string;
  target_audience?: string;
  campaign_type: CampaignType;
  tone?: string;
  style?: string;
  brand_voice?: string;
}

export interface AnalysisFormData {
  url: string;
  analysis_type: 'sales_page' | 'website' | 'salespage';
}

export interface ContentGenerationFormData {
  content_type: string;
  preferences: {
    tone?: string;
    length?: string;
    platform?: string;
    audience?: string;
    style?: string;
    count?: number;
  };
}

// =============================================================================
// ERROR TYPES
// =============================================================================

export interface APIError {
  detail: string;
  error?: string;
  path?: string;
  status_code?: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface CreditError {
  message: string;
  credits_required: number;
  credits_remaining: number;
  current_tier: string;
  upgrade_suggestion: {
    next_tier: string;
    price: string;
    benefits: string[];
  };
}

// =============================================================================
// COMPONENT PROP TYPES
// =============================================================================

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps extends BaseComponentProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// =============================================================================
// TIER CONFIGURATION TYPES
// =============================================================================

export interface TierConfig {
  name: string;
  price: string;
  credits: number;
  features: {
    analyses: number;
    generations: number;
    document_uploads: number;
    smart_urls: number;
    support: string;
    api_access: boolean;
    white_label: boolean;
    team_size: number;
  };
  popular?: boolean;
}

export const TIER_CONFIGS: Record<string, TierConfig> = {
  free: {
    name: 'Free',
    price: '$0',
    credits: 50,
    features: {
      analyses: 5,
      generations: 10,
      document_uploads: 3,
      smart_urls: 10,
      support: 'Community',
      api_access: false,
      white_label: false,
      team_size: 1,
    },
  },
  growth: {
    name: 'Growth',
    price: '$39',
    credits: 500,
    features: {
      analyses: 50,
      generations: 100,
      document_uploads: 25,
      smart_urls: 100,
      support: 'Email',
      api_access: false,
      white_label: false,
      team_size: 1,
    },
    popular: true,
  },
  professional: {
    name: 'Professional',
    price: '$79',
    credits: 2000,
    features: {
      analyses: 200,
      generations: 500,
      document_uploads: 100,
      smart_urls: 500,
      support: 'Priority',
      api_access: true,
      white_label: true,
      team_size: 5,
    },
  },
  agency: {
    name: 'Agency',
    price: '$199',
    credits: -1, // Unlimited
    features: {
      analyses: -1,
      generations: -1,
      document_uploads: -1,
      smart_urls: -1,
      support: 'Dedicated',
      api_access: true,
      white_label: true,
      team_size: -1,
    },
  },
};

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: T[P] };
export type XOR<T, U> = T | U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;

// Branded types for better type safety
export type UserId = string & { readonly brand: unique symbol };
export type CompanyId = string & { readonly brand: unique symbol };
export type CampaignId = string & { readonly brand: unique symbol };
export type IntelligenceId = string & { readonly brand: unique symbol };