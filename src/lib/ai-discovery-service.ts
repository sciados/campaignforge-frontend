// src/lib/enhanced-ai-discovery-service.ts
/**
 * Enhanced AI Discovery Service API Client
 * 🎯 Supports Two-Table Architecture: Active Providers & Suggestions
 * 🔍 Provider discovery, review workflow, and promotion system
 * ⚡ New endpoints for AI Platform Discovery Dashboard v2.0
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
    SystemIssue,
    ReviewSuggestionRequest,
    ReviewSuggestionResponse,
    PromoteSuggestionRequest,
    PromoteSuggestionResponse,
    ReviewStatus,
    RecommendationPriority,
    AIProviderCategory,
    DiscoveryScanResponse
} from './types/ai-discovery'

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
     * Get active providers (Table 1)
     */
    async getActiveProviders(): Promise<ActiveAIProvider[]> {
        try {
            const response = await fetch(`${this.backendUrl}/api/admin/ai-discovery/active-providers`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            return this.handleResponse(response);
        } catch (error) {
            console.error('❌ Failed to fetch active providers:', error);
            throw error;
        }
    }

    /**
     * Get discovered suggestions (Table 2)
     */
    async getDiscoveredSuggestions(): Promise<DiscoveredAIProvider[]> {
        try {
            const response = await fetch(`${this.backendUrl}/api/admin/ai-discovery/discovered-suggestions`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            return this.handleResponse(response);
        } catch (error) {
            console.error('❌ Failed to fetch discovered suggestions:', error);
            throw error;
        }
    }

    /**
     * Get category rankings (top 3 per category)
     */
    async getCategoryRankings(): Promise<CategoryStats[]> {
        try {
            const response = await fetch(`${this.backendUrl}/api/admin/ai-discovery/category-rankings`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            return this.handleResponse(response);
        } catch (error) {
            console.error('❌ Failed to fetch category rankings:', error);
            throw error;
        }
    }

    /**
     * Get complete dashboard data
     */
    async getDashboardData(): Promise<DiscoveryDashboardData> {
        try {
            const [activeProviders, discoveredSuggestions, categoryStats] = await Promise.all([
                this.getActiveProviders(),
                this.getDiscoveredSuggestions(),
                this.getCategoryRankings()
            ]);

            const pendingSuggestions = discoveredSuggestions.filter(s => s.review_status === 'pending');
            const highPrioritySuggestions = discoveredSuggestions.filter(s => s.recommendation_priority === 'high');

            return {
                active_providers: activeProviders,
                discovered_suggestions: discoveredSuggestions,
                category_stats: categoryStats,
                summary_stats: {
                    total_active: activeProviders.length,
                    pending_suggestions: pendingSuggestions.length,
                    high_priority_suggestions: highPrioritySuggestions.length,
                    monthly_cost: categoryStats.reduce((sum, c) => sum + c.total_monthly_cost, 0),
                    avg_quality_score: categoryStats.reduce((sum, c) => sum + c.avg_quality_score, 0) / Math.max(categoryStats.length, 1)
                },
                last_updated: new Date().toISOString()
            };
        } catch (error) {
            console.error('❌ Failed to fetch dashboard data:', error);
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
     * Get AI analysis for a specific provider
     */
    async getProviderAnalysis(providerId: string): Promise<{
        provider_id: string;
        ai_analysis: any;
        market_analysis: any;
        competitive_analysis: any;
        recommendation: string;
    }> {
        try {
            const response = await fetch(`${this.backendUrl}/api/admin/ai-discovery/provider-analysis/${providerId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            return this.handleResponse(response);
        } catch (error) {
            console.error('❌ Failed to get provider analysis:', error);
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

    getPriorityColor: (priority: string): string => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    },

    getIntegrationComplexityColor: (complexity: string): string => {
        switch (complexity) {
            case 'easy': return 'bg-green-100 text-green-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'hard': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    },

    getReviewStatusColor: (status: string): string => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
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
    },

    getRankBadge: (rank: number): string => {
        const badges = ['🥇', '🥈', '🥉'];
        return badges[rank - 1] || `#${rank}`;
    },

    calculateCostSavings: (currentCost: number, newCost: number): {
        savings: number;
        percentage: number;
        isSignificant: boolean;
    } => {
        const savings = currentCost - newCost;
        const percentage = currentCost > 0 ? (savings / currentCost) * 100 : 0;
        return {
            savings,
            percentage,
            isSignificant: Math.abs(percentage) > 10
        };
    },

    sortProvidersByRank: (providers: ActiveAIProvider[]): ActiveAIProvider[] => {
        return [...providers].sort((a, b) => {
            // Top 3 providers first
            if (a.is_top_3 && !b.is_top_3) return -1;
            if (!a.is_top_3 && b.is_top_3) return 1;

            // Within top 3, sort by rank
            if (a.is_top_3 && b.is_top_3) {
                return a.category_rank - b.category_rank;
            }

            // For others, sort by quality score
            return b.quality_score - a.quality_score;
        });
    },

    filterSuggestionsByPriority: (
        suggestions: DiscoveredAIProvider[],
        priority?: string
    ): DiscoveredAIProvider[] => {
        if (!priority) return suggestions;
        return suggestions.filter(s => s.recommendation_priority === priority);
    },

    groupProvidersByCategory: (providers: ActiveAIProvider[]): Record<string, ActiveAIProvider[]> => {
        return providers.reduce((groups, provider) => {
            const category = provider.category;
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(provider);
            return groups;
        }, {} as Record<string, ActiveAIProvider[]>);
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
            const data = await client.getDashboardData();
            setDashboardData(data);
            setLastUpdated(new Date());
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [client]);

    const reviewSuggestion = useCallback(async (
        suggestionId: string,
        action: 'approve' | 'reject',
        adminNotes?: string
    ) => {
        try {
            setError(null);
            const result = await client.reviewSuggestion(suggestionId, {
                action,
                admin_notes: adminNotes
            });

            // Update local state
            if (dashboardData) {
                const updatedSuggestions = dashboardData.discovered_suggestions.map(suggestion =>
                    suggestion.id === suggestionId
                        ? {
                            ...suggestion,
                            review_status: (action === 'approve' ? 'approved' : 'rejected') as ReviewStatus,
                            admin_notes: adminNotes || '',
                            reviewed_at: new Date().toISOString()
                        }
                        : suggestion
                );
                setDashboardData({
                    ...dashboardData,
                    discovered_suggestions: updatedSuggestions
                });
            }

            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to review suggestion';
            setError(errorMessage);
            throw err;
        }
    }, [client, dashboardData]);

    const promoteSuggestion = useCallback(async (
        suggestionId: string,
        options: PromoteSuggestionRequest = {}
    ) => {
        try {
            setError(null);
            const result = await client.promoteSuggestion(suggestionId, options);

            // Refresh dashboard data after promotion
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

            // Refresh dashboard data after scan
            await loadDashboardData();

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

            // Refresh dashboard data after ranking update
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

            // Refresh dashboard data after bulk promotion
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
            loadDashboardData().catch(err => {
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
        reviewSuggestion,
        promoteSuggestion,
        runDiscoveryScan,
        updateRankings,
        bulkPromoteSuggestions,

        // Computed values
        activeProviders: dashboardData?.active_providers || [],
        discoveredSuggestions: dashboardData?.discovered_suggestions || [],
        categoryStats: dashboardData?.category_stats || [],
        summaryStats: dashboardData?.summary_stats || {
            total_active: 0,
            pending_suggestions: 0,
            high_priority_suggestions: 0,
            monthly_cost: 0,
            avg_quality_score: 0
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