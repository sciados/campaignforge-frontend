// =====================================
// File: src/lib/types/intelligence-content.ts
// =====================================

/**
 * Type definitions for 3-step intelligence-driven content generation
 */

export interface IntelligenceContentRequest {
  content_type: string;
  campaign_id?: string;
  company_id?: string;
  preferences?: Record<string, any>;
}

export interface ThreeStepProcess {
  step1_intelligence_sources: number;
  step2_prompt_optimization: number;
  step3_generation_provider: string;
}

export interface IntelligenceContentMetadata {
  generated_by: string;
  intelligence_utilization: number;
  prompt_optimization_score: number;
  generation_cost: number;
  total_generation_time: number;
  intelligence_sources_used: number;
  product_name: string;
  campaign_id?: string;
  generated_at: string;
  ai_optimization?: {
    provider_used: string;
    generation_cost: number;
    quality_score: number;
    generation_time: number;
    enhanced_routing_enabled: boolean;
    optimization_metadata: Record<string, any>;
    fallback_used: boolean;
  };
}

export interface IntelligenceContentResponse {
  success: boolean;
  content_type: string;
  content: Record<string, any>;
  intelligence_driven: boolean;
  three_step_process: ThreeStepProcess;
  metadata: IntelligenceContentMetadata;
}

export interface ServiceMetrics {
  service: string;
  version: string;
  process: string;
  metrics: {
    step1_extractions: number;
    step2_optimizations: number;
    step3_generations: number;
    total_cost: number;
    intelligence_utilization: number;
    total_operations: number;
    avg_cost_per_generation: number;
    intelligence_utilization_score: number;
  };
  process_description: {
    step1: string;
    step2: string;
    step3: string;
  };
}

export interface IntelligenceSource {
  intelligence_id: string;
  product_name: string;
  source_url: string;
  confidence_score: number;
  analysis_method: string;
  created_at: string;
  product_data: {
    features: string[];
    benefits: string[];
    ingredients: string[];
    conditions: string[];
    usage_instructions: string[];
  };
  market_data: {
    category?: string;
    positioning?: string;
    competitive_advantages: string[];
    target_audience?: string;
  };
  research_links: Array<{
    research_id: string;
    content: string;
    research_type: string;
    relevance_score: number;
    source_metadata: Record<string, any>;
  }>;
}

export interface ExtractedInsights {
  product_features: string[];
  product_benefits: string[];
  target_audiences: string[];
  competitive_advantages: string[];
  market_positioning: string[];
  usage_contexts: string[];
  emotional_triggers: string[];
  scientific_backing: string[];
}

export interface PromptOptimizationResult {
  optimized_prompt: string;
  system_message: string;
  prompt_strategy: string;
  intelligence_integration: Record<string, number>;
  optimization_score: number;
  content_type: string;
  product_name: string;
  optimization_timestamp: string;
}

export interface ContentGenerationError {
  success: false;
  content_type: string;
  content: {
    error: string;
    fallback?: boolean;
  };
  intelligence_driven: false;
  fallback_used: true;
  error: string;
}

export type ContentGenerationResult = IntelligenceContentResponse | ContentGenerationError;

// Content type definitions
export const CONTENT_TYPES = {
  EMAIL_SEQUENCE: 'email_sequence',
  EMAIL_CAMPAIGN: 'email_campaign', 
  SOCIAL_POSTS: 'social_posts',
  SOCIAL_MEDIA: 'social_media',
  AD_COPY: 'ad_copy',
  ADS: 'ads',
  BLOG_POST: 'blog_post',
  ARTICLE: 'article',
  LANDING_PAGE: 'landing_page',
  VIDEO_SCRIPT: 'video_script'
} as const;

export type ContentType = typeof CONTENT_TYPES[keyof typeof CONTENT_TYPES];

// Step status for UI components
export interface StepStatus {
  step: number;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  icon: React.ComponentType<any>;
  details?: string;
}

// API response wrapper
export interface APIResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors?: string[];
}

// Intelligence content service client
export class IntelligenceContentClient {
  private baseURL: string;
  private authToken?: string;

  constructor(baseURL: string = '/api/intelligence', authToken?: string) {
    this.baseURL = baseURL;
    this.authToken = authToken;
  }

  private async makeRequest<T>(
    endpoint: string, 
    method: 'GET' | 'POST' = 'GET', 
    body?: any
  ): Promise<APIResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async generateContent(request: IntelligenceContentRequest): Promise<APIResponse<IntelligenceContentResponse>> {
    return this.makeRequest<IntelligenceContentResponse>('/generate-content', 'POST', request);
  }

  async getServiceMetrics(): Promise<APIResponse<ServiceMetrics>> {
    return this.makeRequest<ServiceMetrics>('/content-service/metrics');
  }

  setAuthToken(token: string): void {
    this.authToken = token;
  }
}

// Utility functions
export const formatCost = (cost: number): string => {
  return `$${cost.toFixed(4)}`;
};

export const formatPercentage = (value: number): string => {
  return `${Math.round(value * 100)}%`;
};

export const getContentTypeLabel = (contentType: string): string => {
  const labels: Record<string, string> = {
    email_sequence: 'Email Sequence',
    email_campaign: 'Email Campaign',
    social_posts: 'Social Media Posts',
    social_media: 'Social Media Content',
    ad_copy: 'Ad Copy',
    ads: 'Advertisement Copy',
    blog_post: 'Blog Post',
    article: 'Article',
    landing_page: 'Landing Page',
    video_script: 'Video Script'
  };

  return labels[contentType] || contentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const calculateCostSavings = (actualCost: number, baselineCost: number = 0.030): number => {
  return Math.max(0, (baselineCost - actualCost) / baselineCost);
};

export const getProviderDisplayName = (provider: string): string => {
  const displayNames: Record<string, string> = {
    'groq': 'Groq (Ultra-Fast)',
    'deepseek': 'DeepSeek (Ultra-Cheap)',
    'together': 'Together AI',
    'anthropic': 'Claude (Premium)',
    'ultra_cheap': 'Ultra-Cheap Provider',
    'smart_router': 'Smart Router',
    'emergency_fallback': 'Emergency Fallback'
  };

  return displayNames[provider] || provider;
};