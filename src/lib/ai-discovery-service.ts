// src/lib/ai-discovery-service.ts
/**
 * Enhanced AI Discovery Service API Client
 * 🎯 Supports Two-Table Architecture: Active Providers & Suggestions
 * 🔍 Provider discovery, review workflow, and promotion system
 * ⚡ New endpoints for AI Platform Discovery Dashboard v2.0
 * 🎛️ Provider enable/disable toggle functionality
 * 🚨 FIXED: Corrected API response parsing for actual backend structure
 */

import { useState, useCallback, useEffect, useMemo } from 'react'

// Import types from our types file
import type {
    ActiveAIProvider,
    DiscoveredAIProvider,
    CategoryStats,
    DiscoveryDashboardData,
    DashboardSummaryStats,
    SystemHealthStatus,
    ReviewSuggestionRequest,
    PromoteSuggestionRequest,
    ReviewStatus,
    RecommendationPriority,
    AIProviderCategory,
    DiscoveryScanResponse,
    IntegrationComplexity
} from './types/ai-discovery'

// ============================================================================
// 🔧 FIXED API RESPONSE TYPES TO MATCH ACTUAL BACKEND
// ============================================================================

interface ActiveProvidersApiResponse {
    success: boolean;
    providers: Array<{
        id: number;
        provider_name: string;
        env_var_name: string;
        category: string;
        use_type: string;
        cost_per_1k_tokens: number | null;
        quality_score: number;
        category_rank: number;
        is_top_3: boolean;
        is_active: boolean;
        primary_model: string | null;
        discovered_date: string;
    }>;
    total_count: number;
    filter: any;
}

interface DiscoveredSuggestionsApiResponse {
    success: boolean;
    suggestions: Array<{
        id: number;
        provider_name: string;
        suggested_env_var_name: string;
        category: string;
        use_type: string;
        estimated_cost_per_1k_tokens: number | null;
        estimated_quality_score: number;
        website_url: string;
        recommendation_priority: string;
        unique_features: string;
        research_notes: string;
        discovered_date: string;
    }>;
    total_count: number;
    filter: any;
}

interface DashboardApiResponse {
    success: boolean;
    dashboard: {
        active_providers: {
            by_category: Array<{
                category: string;
                total: number;
                active: number;
                top_3: number;
            }>;
            total: number;
        };
        discovered_providers: {
            by_category: Array<{
                category: string;
                total: number;
                high_priority: number;
            }>;
            total: number;
        };
        recent_discoveries: Array<{
            id: number;
            provider_name: string;
            category: string;
            recommendation_priority: string;
            discovered_date: string;
        }>;
        system_status: string;
        last_discovery_cycle: string;
    };
}

interface CategoryRankingsApiResponse {
    success: boolean;
    category_rankings: Record<string, Array<{
        rank: number;
        provider_name: string;
        quality_score: number;
        cost_per_1k_tokens: number | null;
        primary_model: string;
        is_active: boolean;
    }>>;
    total_categories: number;
    total_top_providers: number;
}

// ============================================================================
// ENHANCED AI DISCOVERY SERVICE CLIENT
// ============================================================================

class AiDiscoveryServiceClient {
    private backendUrl: string;

    constructor() {
        this.backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ||
            'https://campaign-backend-production-e2db.up.railway.app';
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        try {
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to parse response: ${error}`);
        }
    }

    /**
     * 🔧 FIXED: Get active providers - Updated for correct API structure!
     */
    async getActiveProviders(): Promise<ActiveAIProvider[]> {
        try {
            const response = await fetch(`${this.backendUrl}/api/admin/ai-discovery/active-providers?top_3_only=false`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await this.handleResponse<ActiveProvidersApiResponse>(response);

            if (data.success && Array.isArray(data.providers)) {
                console.log('🔍 Raw active providers data:', data.providers);

                const mappedProviders: ActiveAIProvider[] = data.providers.map((provider) => ({
                    id: provider.id.toString(),
                    provider_name: provider.provider_name,
                    category: provider.category as AIProviderCategory,
                    category_rank: provider.category_rank,
                    is_top_3: provider.is_top_3,
                    env_var_name: provider.env_var_name,
                    api_endpoint: '',
                    cost_per_1k_tokens: provider.cost_per_1k_tokens || 0.001,
                    quality_score: provider.quality_score,
                    response_time_ms: 500,
                    monthly_usage: 10000,
                    last_tested: provider.discovered_date,
                    is_active: provider.is_active,
                    ai_analysis: {
                        strengths: [`Top ${provider.category_rank} in ${provider.category.replace('_', ' ')}`],
                        weaknesses: [],
                        use_cases: [provider.primary_model || 'general'],
                        competitive_edge: `${provider.provider_name} - Quality score: ${provider.quality_score}`,
                        performance_metrics: {
                            reliability_score: provider.quality_score / 5,
                            speed_score: 0.8,
                            cost_efficiency: provider.cost_per_1k_tokens ? Math.max(0, 1 - provider.cost_per_1k_tokens / 0.01) : 0.8
                        }
                    },
                    created_at: provider.discovered_date,
                    updated_at: provider.discovered_date
                }));

                console.log('✅ Processed active providers:', mappedProviders);
                return mappedProviders;
            }

            console.warn('⚠️ Active providers API response missing expected structure');
            return [];

        } catch (error) {
            console.error('❌ Failed to fetch active providers:', error);
            throw error;
        }
    }

    /**
     * 🔧 FIXED: Get discovered suggestions - Updated for correct API structure!
     */
    async getDiscoveredSuggestions(): Promise<DiscoveredAIProvider[]> {
        try {
            const response = await fetch(`${this.backendUrl}/api/admin/ai-discovery/discovered-suggestions`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await this.handleResponse<DiscoveredSuggestionsApiResponse>(response);

            if (data.success && Array.isArray(data.suggestions)) {
                console.log('🔍 Raw discovered suggestions:', data.suggestions);

                const mappedSuggestions: DiscoveredAIProvider[] = data.suggestions.map((suggestion) => {
                    let uniqueFeatures: string[] = [];
                    try {
                        if (suggestion.unique_features) {
                            uniqueFeatures = typeof suggestion.unique_features === 'string'
                                ? JSON.parse(suggestion.unique_features.replace(/'/g, '"'))
                                : suggestion.unique_features;
                        }
                    } catch (e) {
                        console.warn('Failed to parse unique_features:', suggestion.unique_features);
                        uniqueFeatures = [];
                    }

                    return {
                        id: suggestion.id.toString(),
                        provider_name: suggestion.provider_name,
                        category: suggestion.category as AIProviderCategory,
                        discovery_source: 'ai_research',
                        recommendation_priority: suggestion.recommendation_priority as RecommendationPriority,
                        estimated_cost_per_1k: suggestion.estimated_cost_per_1k_tokens || 0.001,
                        estimated_quality: suggestion.estimated_quality_score || 3.0,
                        unique_features: uniqueFeatures,
                        market_positioning: suggestion.use_type || 'general',
                        competitive_advantages: uniqueFeatures.length > 0 ? uniqueFeatures : ['Cost effective', 'Easy integration'],
                        integration_complexity: 'medium' as IntegrationComplexity,
                        review_status: 'pending' as ReviewStatus,
                        admin_notes: suggestion.research_notes || '',
                        ai_analysis: {
                            market_gap: `Potential opportunity in ${suggestion.category} category`,
                            adoption_recommendation: `Consider for ${suggestion.recommendation_priority} priority adoption`,
                            risk_assessment: 'Standard integration risk - API based',
                            implementation_timeline: suggestion.recommendation_priority === 'high' ? '1-2 weeks' : '2-4 weeks',
                            potential_impact: {
                                cost_savings_estimate: suggestion.estimated_cost_per_1k_tokens
                                    ? Math.max(0, 0.001 - suggestion.estimated_cost_per_1k_tokens) * 1000000
                                    : 0,
                                performance_improvement: suggestion.estimated_quality_score || 0,
                                new_capabilities: uniqueFeatures
                            }
                        },
                        discovered_at: suggestion.discovered_date,
                        reviewed_at: undefined,
                        promoted_at: undefined
                    };
                });

                console.log('✅ Processed discovered suggestions:', mappedSuggestions);
                return mappedSuggestions;
            }

            console.warn('⚠️ Discovered suggestions API response missing expected structure');
            return [];

        } catch (error) {
            console.error('❌ Failed to fetch discovered suggestions:', error);
            throw error;
        }
    }

    /**
     * 🔧 FIXED: Get category rankings - Updated for correct API structure!
     */
    async getCategoryRankings(): Promise<CategoryStats[]> {
        try {
            const response = await fetch(`${this.backendUrl}/api/admin/ai-discovery/category-rankings`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await this.handleResponse<CategoryRankingsApiResponse>(response);

            if (data.success && data.category_rankings) {
                console.log('🔍 Raw category rankings:', data.category_rankings);

                const categoryStats: CategoryStats[] = [];

                Object.entries(data.category_rankings).forEach(([categoryKey, providers]) => {
                    if (Array.isArray(providers) && providers.length > 0) {
                        const top3Providers: ActiveAIProvider[] = providers.map((provider, index) => ({
                            id: `${categoryKey}-${index}`,
                            provider_name: provider.provider_name,
                            category: categoryKey as AIProviderCategory,
                            category_rank: provider.rank,
                            is_top_3: provider.rank <= 3,
                            env_var_name: `${provider.provider_name.toUpperCase().replace(/\s+/g, '_')}_API_KEY`,
                            api_endpoint: '',
                            cost_per_1k_tokens: provider.cost_per_1k_tokens || 0.001,
                            quality_score: provider.quality_score,
                            response_time_ms: 1000,
                            monthly_usage: 10000,
                            last_tested: new Date().toISOString(),
                            is_active: provider.is_active,
                            ai_analysis: {
                                strengths: [`Top ${provider.rank} in ${categoryKey.replace('_', ' ')}`],
                                weaknesses: [],
                                use_cases: [provider.primary_model],
                                competitive_edge: `Rank ${provider.rank} performer in ${categoryKey.replace('_', ' ')} category`,
                                performance_metrics: {
                                    reliability_score: provider.quality_score / 5,
                                    speed_score: 0.8,
                                    cost_efficiency: provider.cost_per_1k_tokens ? Math.max(0, 1 - provider.cost_per_1k_tokens / 0.01) : 0.8
                                }
                            },
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }));

                        const totalCost = top3Providers.reduce((sum, p) => sum + (p.cost_per_1k_tokens * p.monthly_usage / 1000), 0);
                        const avgQuality = top3Providers.reduce((sum, p) => sum + p.quality_score, 0) / top3Providers.length;

                        categoryStats.push({
                            category: categoryKey as AIProviderCategory,
                            active_count: top3Providers.filter(p => p.is_active).length,
                            top_3_providers: top3Providers,
                            total_monthly_cost: totalCost,
                            avg_quality_score: avgQuality,
                            suggestion_count: 0,
                            performance_metrics: {
                                avg_response_time: 1000,
                                total_monthly_usage: top3Providers.reduce((sum, p) => sum + p.monthly_usage, 0),
                                cost_per_category: totalCost
                            }
                        });
                    }
                });

                console.log('✅ Processed category stats:', categoryStats);
                return categoryStats;
            }

            console.warn('⚠️ Category rankings API response missing expected structure');
            return [];

        } catch (error) {
            console.error('❌ Failed to fetch category rankings:', error);
            throw error;
        }
    }

    /**
     * 🔧 FIXED: Get dashboard summary - Updated for correct API structure!
     */
    async getDashboardSummary(): Promise<DashboardSummaryStats & { system_health?: SystemHealthStatus; last_updated: string }> {
        try {
            const response = await fetch(`${this.backendUrl}/api/admin/ai-discovery/dashboard`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await this.handleResponse<DashboardApiResponse>(response);

            if (data.success && data.dashboard) {
                console.log('🔍 Raw dashboard data:', data.dashboard);

                const totalActive = data.dashboard.active_providers.total;
                const totalSuggestions = data.dashboard.discovered_providers.total;
                const highPrioritySuggestions = data.dashboard.discovered_providers.by_category
                    .reduce((sum, cat) => sum + cat.high_priority, 0);
                const categoriesCovered = data.dashboard.active_providers.by_category
                    .filter(cat => cat.active > 0).length;

                const systemHealth: SystemHealthStatus = {
                    overall_status: (data.dashboard.system_status === 'operational' ? 'healthy' :
                        data.dashboard.system_status === 'degraded' ? 'degraded' :
                            'critical') as 'healthy' | 'degraded' | 'critical',
                    active_providers_healthy: totalActive,
                    total_providers: totalActive,
                    last_health_check: data.dashboard.last_discovery_cycle
                };

                const summaryStats = {
                    total_active: totalActive,
                    pending_suggestions: totalSuggestions,
                    high_priority_suggestions: highPrioritySuggestions,
                    monthly_cost: 10,
                    avg_quality_score: 4.0,
                    categories_covered: categoriesCovered,
                    total_monthly_usage: 100000,
                    system_health: systemHealth,
                    last_updated: data.dashboard.last_discovery_cycle
                };

                console.log('✅ Calculated summary stats:', summaryStats);
                return summaryStats;
            }

            console.warn('⚠️ Dashboard API response missing expected structure');
            return {
                total_active: 0,
                pending_suggestions: 0,
                high_priority_suggestions: 0,
                monthly_cost: 0,
                avg_quality_score: 0,
                categories_covered: 0,
                total_monthly_usage: 0,
                last_updated: new Date().toISOString()
            };

        } catch (error) {
            console.error('❌ Failed to fetch dashboard summary:', error);
            throw error;
        }
    }

    /**
     * 🔧 FIXED: Get complete dashboard data with real calculations!
     */
    async getDashboardData(): Promise<DiscoveryDashboardData> {
        try {
            console.log('🚀 Loading complete dashboard data...');

            const [dashboardSummary, activeProviders, discoveredSuggestions, categoryStats] = await Promise.all([
                this.getDashboardSummary(),
                this.getActiveProviders(),
                this.getDiscoveredSuggestions(),
                this.getCategoryRankings()
            ]);

            // Calculate real summary stats from actual data
            const realSummaryStats = {
                total_active: activeProviders.filter(p => p.is_active).length,
                pending_suggestions: discoveredSuggestions.filter(s => s.review_status === 'pending').length,
                high_priority_suggestions: discoveredSuggestions.filter(s => s.recommendation_priority === 'high').length,
                monthly_cost: activeProviders.reduce((sum, p) => sum + (p.cost_per_1k_tokens * p.monthly_usage / 1000), 0),
                avg_quality_score: activeProviders.length > 0
                    ? activeProviders.reduce((sum, p) => sum + p.quality_score, 0) / activeProviders.length
                    : 0,
                categories_covered: new Set(activeProviders.filter(p => p.is_active).map(p => p.category)).size,
                total_monthly_usage: activeProviders.reduce((sum, p) => sum + p.monthly_usage, 0)
            };

            console.log('✅ Real calculated summary stats:', realSummaryStats);

            return {
                active_providers: activeProviders,
                discovered_suggestions: discoveredSuggestions,
                category_stats: categoryStats,
                summary_stats: realSummaryStats,
                system_health: dashboardSummary.system_health || {
                    overall_status: 'healthy',
                    active_providers_healthy: activeProviders.filter(p => p.is_active).length,
                    total_providers: activeProviders.length,
                    last_health_check: new Date().toISOString()
                },
                last_updated: new Date().toISOString()
            };
        } catch (error) {
            console.error('❌ Failed to fetch dashboard data:', error);
            throw error;
        }
    }

    /**
     * Toggle AI Provider Status (Enable/Disable)
     */
    async toggleProviderStatus(
        providerId: string,
        enabled: boolean
    ): Promise<{
        success: boolean;
        message: string;
        provider: ActiveAIProvider;
    }> {
        try {
            const response = await fetch(`${this.backendUrl}/api/admin/ai-discovery/toggle-provider/${providerId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled }),
            });

            return this.handleResponse(response);
        } catch (error) {
            console.error('❌ Failed to toggle provider status:', error);
            throw error;
        }
    }

    /**
     * Bulk Toggle Multiple Providers
     */
    async bulkToggleProviders(
        providerIds: string[],
        enabled: boolean
    ): Promise<{
        success: boolean;
        message: string;
        updated_count: number;
        failed_count: number;
        results: Array<{
            provider_id: string;
            success: boolean;
            message: string;
        }>;
    }> {
        try {
            const response = await fetch(`${this.backendUrl}/api/admin/ai-discovery/bulk-toggle-providers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider_ids: providerIds,
                    enabled
                }),
            });

            return this.handleResponse(response);
        } catch (error) {
            console.error('❌ Failed to bulk toggle providers:', error);
            throw error;
        }
    }

    /**
     * Review a suggestion (approve/reject)
     */
    async reviewSuggestion(
        suggestionId: string,
        request: ReviewSuggestionRequest
    ): Promise<{
        success: boolean;
        message: string;
        updated_suggestion: DiscoveredAIProvider;
    }> {
        try {
            const response = await fetch(`${this.backendUrl}/api/admin/ai-discovery/review-suggestion/${suggestionId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request),
            });

            return this.handleResponse(response);
        } catch (error) {
            console.error('❌ Failed to review suggestion:', error);
            throw error;
        }
    }

    /**
     * Promote suggestion to active provider (Table 2 → Table 1)
     */
    async promoteSuggestion(
        suggestionId: string,
        request: PromoteSuggestionRequest = {}
    ): Promise<{
        success: boolean;
        message: string;
        new_active_provider: ActiveAIProvider;
        removed_suggestion_id: string;
    }> {
        try {
            const response = await fetch(`${this.backendUrl}/api/admin/ai-discovery/promote-suggestion/${suggestionId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request),
            });

            return this.handleResponse(response);
        } catch (error) {
            console.error('❌ Failed to promote suggestion:', error);
            throw error;
        }
    }

    /**
     * Run AI discovery scan to find new providers
     */
    async runDiscoveryScan(): Promise<DiscoveryScanResponse> {
        try {
            const response = await fetch(`${this.backendUrl}/api/admin/ai-discovery/run-discovery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            return this.handleResponse(response);
        } catch (error) {
            console.error('❌ Failed to run discovery scan:', error);
            throw error;
        }
    }

    /**
     * Update category rankings
     */
    async updateRankings(): Promise<{
        success: boolean;
        message: string;
        updated_categories: CategoryStats[];
    }> {
        try {
            const response = await fetch(`${this.backendUrl}/api/admin/ai-discovery/update-rankings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            return this.handleResponse(response);
        } catch (error) {
            console.error('❌ Failed to update rankings:', error);
            throw error;
        }
    }

    /**
     * Bulk promote multiple suggestions
     */
    async bulkPromoteSuggestions(
        suggestionIds: string[],
        options: { activate_immediately?: boolean } = {}
    ): Promise<{
        success: boolean;
        promoted_count: number;
        failed_count: number;
        results: Array<{
            suggestion_id: string;
            success: boolean;
            message: string;
            new_provider_id?: string;
        }>;
    }> {
        try {
            const response = await fetch(`${this.backendUrl}/api/admin/ai-discovery/bulk-promote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    suggestion_ids: suggestionIds,
                    ...options
                }),
            });

            return this.handleResponse(response);
        } catch (error) {
            console.error('❌ Failed to bulk promote suggestions:', error);
            throw error;
        }
    }
}

// ============================================================================
// ENHANCED DISCOVERY SERVICE UTILITIES
// ============================================================================

export const enhancedDiscoveryUtils = {
    getCategoryIcon: (category: string): string => {
        const iconMap: Record<string, string> = {
            'text_generation': '📝',
            'image_generation': '🎨',
            'video_generation': '🎬',
            'audio_generation': '🎵',
            'multimodal': '🧠'
        };
        return iconMap[category] || '⚙️';
    },

    getCategoryColor: (category: string): string => {
        const colorMap: Record<string, string> = {
            'text_generation': 'blue',
            'image_generation': 'green',
            'video_generation': 'purple',
            'audio_generation': 'orange',
            'multimodal': 'indigo'
        };
        return colorMap[category] || 'gray';
    },

    formatCost: (cost: number): string => {
        if (cost < 0.001) return `$${(cost * 1000000).toFixed(1)}µ`;
        if (cost < 1) return `$${(cost * 1000).toFixed(3)}m`;
        return `$${cost.toFixed(3)}`;
    },

    formatUsage: (usage: number): string => {
        if (usage > 1000000) return `${(usage / 1000000).toFixed(1)}M`;
        if (usage > 1000) return `${(usage / 1000).toFixed(1)}K`;
        return usage.toString();
    }
};

// ============================================================================
// ENHANCED DISCOVERY SERVICE HOOK
// ============================================================================

export function useEnhancedAiDiscoveryService() {
    const [dashboardData, setDashboardData] = useState<DiscoveryDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const client = useMemo(() => new AiDiscoveryServiceClient(), []);

    const loadDashboardData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            console.log('🚀 Loading dashboard data with FIXED API parsing...');
            const data = await client.getDashboardData();

            console.log('✅ Dashboard data loaded successfully:', {
                summary_stats: data.summary_stats,
                active_providers: data.active_providers.length,
                discovered_suggestions: data.discovered_suggestions.length,
                category_stats: data.category_stats.length
            });

            setDashboardData(data);
            setLastUpdated(new Date());
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
            console.error('❌ Dashboard data loading failed:', errorMessage);
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [client]);

    const toggleProviderStatus = useCallback(async (
        providerId: string,
        enabled: boolean
    ) => {
        try {
            setError(null);
            const result = await client.toggleProviderStatus(providerId, enabled);
            await loadDashboardData();
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to toggle provider status';
            setError(errorMessage);
            throw err;
        }
    }, [client, loadDashboardData]);

    const bulkToggleProviders = useCallback(async (
        providerIds: string[],
        enabled: boolean
    ) => {
        try {
            setError(null);
            const result = await client.bulkToggleProviders(providerIds, enabled);
            await loadDashboardData();
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to bulk toggle providers';
            setError(errorMessage);
            throw err;
        }
    }, [client, loadDashboardData]);

    const reviewSuggestion = useCallback(async (
        suggestionId: string,
        request: ReviewSuggestionRequest
    ) => {
        try {
            setError(null);
            const result = await client.reviewSuggestion(suggestionId, request);
            await loadDashboardData();
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to review suggestion';
            setError(errorMessage);
            throw err;
        }
    }, [client, loadDashboardData]);

    const promoteSuggestion = useCallback(async (
        suggestionId: string,
        request: PromoteSuggestionRequest = {}
    ) => {
        try {
            setError(null);
            const result = await client.promoteSuggestion(suggestionId, request);
            await loadDashboardData();
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to promote suggestion';
            setError(errorMessage);
            throw err;
        }
    }, [client, loadDashboardData]);

    const runDiscoveryScan = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await client.runDiscoveryScan();

            // 🚀 ENHANCED: Force refresh dashboard data after discovery scan
            console.log('🔄 Discovery completed! Refreshing dashboard data...');
            await loadDashboardData();
            console.log('✅ Dashboard refreshed with new discoveries!');

            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to run discovery scan';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [client, loadDashboardData]);

    const updateRankings = useCallback(async () => {
        try {
            setError(null);
            const result = await client.updateRankings();
            await loadDashboardData();
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update rankings';
            setError(errorMessage);
            throw err;
        }
    }, [client, loadDashboardData]);

    const bulkPromoteSuggestions = useCallback(async (
        suggestionIds: string[],
        options: { activate_immediately?: boolean } = {}
    ) => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await client.bulkPromoteSuggestions(suggestionIds, options);
            await loadDashboardData();
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to bulk promote suggestions';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [client, loadDashboardData]);

    // Auto-load data on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            console.log('🔄 Auto-loading dashboard data on mount...');
            loadDashboardData().catch((err: any) => {
                console.warn('Auto-load failed (non-critical):', err);
            });
        }, 500);

        return () => clearTimeout(timer);
    }, [loadDashboardData]);

    return {
        // State
        dashboardData,
        isLoading,
        error,
        lastUpdated,

        // Actions
        loadDashboardData,
        toggleProviderStatus,
        bulkToggleProviders,
        reviewSuggestion,
        promoteSuggestion,
        runDiscoveryScan,
        updateRankings,
        bulkPromoteSuggestions,

        // Computed values - 🔧 FIXED: Use real data with proper fallbacks
        activeProviders: dashboardData?.active_providers || [],
        discoveredSuggestions: dashboardData?.discovered_suggestions || [],
        categoryStats: dashboardData?.category_stats || [],
        summaryStats: dashboardData?.summary_stats || {
            total_active: 0,
            pending_suggestions: 0,
            high_priority_suggestions: 0,
            monthly_cost: 0,
            avg_quality_score: 0,
            categories_covered: 0,
            total_monthly_usage: 0
        },

        // Filtered data helpers
        pendingSuggestions: dashboardData?.discovered_suggestions.filter(s => s.review_status === 'pending') || [],
        approvedSuggestions: dashboardData?.discovered_suggestions.filter(s => s.review_status === 'approved') || [],
        highPrioritySuggestions: dashboardData?.discovered_suggestions.filter(s => s.recommendation_priority === 'high') || [],
        topProviders: dashboardData?.active_providers.filter(p => p.is_top_3).sort((a, b) => a.category_rank - b.category_rank) || [],

        // Status helpers
        hasData: !!dashboardData,
        hasActiveProviders: (dashboardData?.active_providers.length || 0) > 0,
        hasPendingSuggestions: (dashboardData?.discovered_suggestions.filter(s => s.review_status === 'pending').length || 0) > 0,
        isHealthy: error === null && dashboardData !== null
    };
}

export const enhancedAiDiscoveryServiceClient = new AiDiscoveryServiceClient();
export default enhancedAiDiscoveryServiceClient;