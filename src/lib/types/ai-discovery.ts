// src/lib/types/ai-discovery.ts
/**
 * AI Discovery System Types
 * 🎯 Two-table architecture types and interfaces
 * 📊 Active providers, suggestions, and dashboard data
 * ⚡ Enhanced with AI analysis and review workflow
 */

// ============================================================================
// CORE PROVIDER TYPES
// ============================================================================

export type AIProviderCategory =
    | 'text_generation'
    | 'image_generation'
    | 'video_generation'
    | 'audio_generation'
    | 'multimodal';

export type RecommendationPriority = 'high' | 'medium' | 'low';
export type IntegrationComplexity = 'easy' | 'medium' | 'hard';
export type ReviewStatus = 'pending' | 'approved' | 'rejected';

// ============================================================================
// ACTIVE PROVIDERS (TABLE 1)
// ============================================================================

export interface ActiveAIProvider {
    id: string;
    provider_name: string;
    category: AIProviderCategory;
    category_rank: number; // 1-3 for top providers
    is_top_3: boolean;
    env_var_name: string;
    api_endpoint: string;
    cost_per_1k_tokens: number;
    quality_score: number; // 1-5 rating
    response_time_ms: number;
    monthly_usage: number;
    last_tested: string;
    is_active: boolean;
    ai_analysis: ActiveProviderAnalysis;
    created_at: string;
    updated_at: string;
}

export interface ActiveProviderAnalysis {
    strengths: string[];
    weaknesses: string[];
    use_cases: string[];
    competitive_edge: string;
    performance_metrics?: {
        reliability_score: number;
        speed_score: number;
        cost_efficiency: number;
    };
    optimization_suggestions?: string[];
}

// ============================================================================
// DISCOVERED PROVIDERS (TABLE 2)
// ============================================================================

export interface DiscoveredAIProvider {
    id: string;
    provider_name: string;
    category: AIProviderCategory;
    discovery_source: string;
    recommendation_priority: RecommendationPriority;
    estimated_cost_per_1k: number;
    estimated_quality: number;
    unique_features: string[];
    market_positioning: string;
    competitive_advantages: string[];
    integration_complexity: IntegrationComplexity;
    review_status: ReviewStatus;
    admin_notes: string;
    ai_analysis: DiscoveredProviderAnalysis;
    discovered_at: string;
    reviewed_at?: string;
    promoted_at?: string;
}

export interface DiscoveredProviderAnalysis {
    market_gap: string;
    adoption_recommendation: string;
    risk_assessment: string;
    implementation_timeline: string;
    potential_impact?: {
        cost_savings_estimate: number;
        performance_improvement: number;
        new_capabilities: string[];
    };
    competitive_comparison?: {
        vs_current_leader: string;
        differentiating_factors: string[];
        market_adoption_rate: number;
    };
}

// ============================================================================
// CATEGORY & DASHBOARD TYPES
// ============================================================================

export interface CategoryStats {
    category: AIProviderCategory;
    active_count: number;
    top_3_providers: ActiveAIProvider[];
    total_monthly_cost: number;
    avg_quality_score: number;
    suggestion_count: number;
    performance_metrics?: {
        avg_response_time: number;
        total_monthly_usage: number;
        cost_per_category: number;
    };
}

export interface DiscoveryDashboardData {
    active_providers: ActiveAIProvider[];
    discovered_suggestions: DiscoveredAIProvider[];
    category_stats: CategoryStats[];
    summary_stats: DashboardSummaryStats;
    system_health?: SystemHealthStatus;
    last_updated: string;
}

export interface DashboardSummaryStats {
    total_active: number;
    pending_suggestions: number;
    high_priority_suggestions: number;
    monthly_cost: number;
    avg_quality_score: number;
    categories_covered?: number;
    total_monthly_usage?: number;
    cost_optimization_potential?: number;
}

export interface SystemHealthStatus {
    overall_status: 'healthy' | 'degraded' | 'critical';
    active_providers_healthy: number;
    total_providers: number;
    last_health_check: string;
    issues?: SystemIssue[];
}

export interface SystemIssue {
    severity: 'low' | 'medium' | 'high' | 'critical';
    provider_id?: string;
    description: string;
    recommended_action: string;
    detected_at: string;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface ReviewSuggestionRequest {
    action: 'approve' | 'reject';
    admin_notes?: string;
    review_criteria?: {
        cost_acceptable: boolean;
        quality_sufficient: boolean;
        integration_feasible: boolean;
        strategic_fit: boolean;
    };
}

export interface ReviewSuggestionResponse {
    success: boolean;
    message: string;
    updated_suggestion: DiscoveredAIProvider;
    next_actions?: string[];
}

export interface PromoteSuggestionRequest {
    api_key?: string;
    env_var_name?: string;
    activate_immediately?: boolean;
    initial_usage_limit?: number;
    monitoring_level?: 'basic' | 'enhanced' | 'comprehensive';
}

export interface PromoteSuggestionResponse {
    success: boolean;
    message: string;
    new_active_provider: ActiveAIProvider;
    removed_suggestion_id: string;
    integration_steps?: IntegrationStep[];
    estimated_setup_time?: string;
}

export interface IntegrationStep {
    step_number: number;
    description: string;
    estimated_duration: string;
    required_permissions: string[];
    dependencies: string[];
    validation_criteria: string[];
}

export interface DiscoveryScanRequest {
    categories?: AIProviderCategory[];
    priority_filter?: RecommendationPriority;
    max_results?: number;
    include_experimental?: boolean;
    cost_threshold?: number;
    quality_threshold?: number;
}

export interface DiscoveryScanResponse {
    scan_id: string;
    providers_discovered: number;
    high_priority_count: number;
    categories_covered: AIProviderCategory[];
    scan_duration_ms: number;
    next_scan_scheduled: string;
    discovered_providers: DiscoveredAIProvider[];
    scan_metadata?: ScanMetadata;
}

export interface ScanMetadata {
    sources_checked: string[];
    total_providers_evaluated: number;
    filters_applied: string[];
    ai_analysis_version: string;
    market_data_freshness: string;
}

export interface UpdateRankingsRequest {
    categories?: AIProviderCategory[];
    force_recalculation?: boolean;
    ranking_criteria?: RankingCriteria;
}

export interface UpdateRankingsResponse {
    success: boolean;
    message: string;
    updated_categories: CategoryStats[];
    ranking_changes?: RankingChange[];
    next_update_scheduled?: string;
}

export interface RankingCriteria {
    cost_weight: number; // 0-1
    quality_weight: number; // 0-1
    performance_weight: number; // 0-1
    reliability_weight: number; // 0-1
    innovation_weight: number; // 0-1
}

export interface RankingChange {
    provider_id: string;
    provider_name: string;
    category: AIProviderCategory;
    old_rank: number;
    new_rank: number;
    reason: string;
    impact_assessment?: string;
}

export interface BulkPromoteRequest {
    suggestion_ids: string[];
    activate_immediately?: boolean;
    batch_size?: number;
    continue_on_error?: boolean;
    notification_preferences?: NotificationPreferences;
}

export interface BulkPromoteResponse {
    success: boolean;
    promoted_count: number;
    failed_count: number;
    results: BulkPromoteResult[];
    batch_summary?: BatchSummary;
}

export interface BulkPromoteResult {
    suggestion_id: string;
    success: boolean;
    message: string;
    new_provider_id?: string;
    error_details?: string;
    integration_status?: 'queued' | 'in_progress' | 'completed' | 'failed';
}

export interface BatchSummary {
    total_processed: number;
    successful_promotions: number;
    failed_promotions: number;
    categories_affected: AIProviderCategory[];
    estimated_cost_impact: number;
    estimated_performance_impact: string;
}

export interface NotificationPreferences {
    email_updates: boolean;
    slack_notifications: boolean;
    dashboard_alerts: boolean;
    webhook_url?: string;
}

// ============================================================================
// FILTER & SEARCH TYPES
// ============================================================================

export interface ProviderFilters {
    categories?: AIProviderCategory[];
    priority_levels?: RecommendationPriority[];
    review_statuses?: ReviewStatus[];
    integration_complexities?: IntegrationComplexity[];
    cost_range?: {
        min: number;
        max: number;
    };
    quality_range?: {
        min: number;
        max: number;
    };
    search_term?: string;
}

export interface SortOptions {
    field: 'provider_name' | 'category' | 'cost_per_1k_tokens' | 'quality_score' | 'category_rank' | 'discovered_at' | 'recommendation_priority';
    direction: 'asc' | 'desc';
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface PaginationOptions {
    page: number;
    limit: number;
    total?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        current_page: number;
        total_pages: number;
        total_items: number;
        items_per_page: number;
        has_next: boolean;
        has_previous: boolean;
    };
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    timestamp: string;
    request_id?: string;
}

export interface ErrorDetails {
    code: string;
    message: string;
    details?: Record<string, any>;
    stack_trace?: string;
    user_message: string;
    recovery_suggestions?: string[];
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface DiscoveryConfiguration {
    scan_frequency: 'daily' | 'weekly' | 'monthly';
    auto_approve_threshold: number; // 0-10
    notification_settings: NotificationSettings;
    quality_thresholds: QualityThresholds;
    cost_thresholds: CostThresholds;
    categories_to_monitor: AIProviderCategory[];
}

export interface NotificationSettings {
    email_enabled: boolean;
    slack_enabled: boolean;
    webhook_enabled: boolean;
    notification_levels: ('info' | 'warning' | 'error' | 'critical')[];
}

export interface QualityThresholds {
    minimum_quality_score: number; // 1-5
    minimum_reliability: number; // 0-1
    maximum_response_time: number; // ms
    minimum_uptime: number; // 0-1
}

export interface CostThresholds {
    maximum_cost_per_1k: number;
    maximum_monthly_budget: number;
    cost_increase_alert_threshold: number; // percentage
    roi_threshold: number; // minimum ROI
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

// Main entity exports
export type {
    ActiveAIProvider as Provider,
    DiscoveredAIProvider as Suggestion,
    CategoryStats as Category,
    DiscoveryDashboardData as DashboardData,
    DashboardSummaryStats as SummaryStats,
    SystemHealthStatus as SystemHealth
};

// Common type unions
export type ProviderEntity = ActiveAIProvider | DiscoveredAIProvider;
export type AnalysisType = ActiveProviderAnalysis | DiscoveredProviderAnalysis;
export type RequestType = ReviewSuggestionRequest | PromoteSuggestionRequest | DiscoveryScanRequest;
export type ResponseType = ReviewSuggestionResponse | PromoteSuggestionResponse | DiscoveryScanResponse;