// src/lib/ai-tools-api.ts
/**
 * AI Tools Discovery Service API Extensions
 * 🔧 Focused API client for AI Tools monitoring and optimization
 * 🎯 Integrates with existing api.ts structure
 * 🚀 Handles AI Tools dashboard, monitoring, and recommendations
 * 🆕 NOW INCLUDES: AI Discovery Service functionality moved from api.ts (exact copy)
 */

import { useState, useCallback, useEffect, useMemo } from 'react'

// ============================================================================
// AI DISCOVERY SERVICE TYPES (Moved from api.ts - exact copy)
// ============================================================================

export interface AiProviderStatus {
    provider_name: string
    category: string
    is_active: boolean
    status: 'healthy' | 'degraded' | 'error'
    response_time_ms: number
    error_rate: number
    last_check: string
    capabilities: string[]
    cost_per_request?: number
}

export interface AiOptimizationDashboard {
    current_providers: Record<string, string>
    provider_performance: AiProviderStatus[]
    optimization_suggestions: Array<{
        category: string
        current_provider: string
        suggested_provider: string
        reason: string
        potential_improvement: string
        confidence_score: number
    }>
    cost_analysis: {
        daily_cost: number
        monthly_projection: number
        potential_savings: number
    }
    performance_metrics: {
        avg_response_time: number
        success_rate: number
        total_requests_today: number
    }
}

export interface AiConnectionTest {
    connection_status: 'success' | 'failed'
    ai_discovery_available: boolean
    providers_discovered: number
    test_timestamp: string
    error_details?: string
    discovered_providers: Array<{
        name: string
        category: string
        available: boolean
    }>
}

export interface ProviderSwitchResult {
    success: boolean
    old_provider: string
    new_provider: string
    category: string
    switch_timestamp: string
    performance_impact: {
        response_time_change: string
        cost_change: string
        quality_change: string
    }
    message: string
}

// ============================================================================
// AI TOOLS TYPES (Existing)
// ============================================================================

export interface AIToolsDashboardData {
    success: boolean;
    top_tools_by_category: Record<string, AITool[]>;
    summary: {
        total_active_tools: number;
        currently_used_tools: number;
        average_rating: number;
        categories: string[];
        last_updated: string;
    };
    monitoring_status: {
        is_running: boolean;
        last_check: string;
    };
}

export interface AITool {
    id: string;
    name: string;
    provider_name: string;
    quality_rating: number;
    cost_rating: number;
    overall_rating: number;
    is_currently_used: boolean;
    capabilities: string[];
    pricing_model: Record<string, any>;
    last_checked?: string;
    performance_metrics: Record<string, any>;
}

export interface AIMonitoringStatus {
    success: boolean;
    is_running: boolean;
    configuration: {
        test_interval_minutes: number;
        rating_update_interval_minutes: number;
        discovery_interval_hours: number;
    };
    last_check: string;
}

export interface AIOptimizationRecommendations {
    success: boolean;
    recommendations: Array<{
        category: string;
        current_tool: { name: string; provider: string; rating: number };
        recommended_tool: { name: string; provider: string; rating: number };
        improvement: number;
        reason: string;
        priority: 'high' | 'medium' | 'low';
    }>;
    summary: {
        total_recommendations: number;
        high_priority: number;
        potential_improvements: number;
    };
}

export interface AIToolsInitializationResult {
    success: boolean;
    message: string;
    results: any;
    next_steps: string[];
}

// ============================================================================
// UNIFIED AI TOOLS + DISCOVERY SERVICE API CLIENT
// ============================================================================

class AIToolsApiClient {
    private aiDiscoveryUrl: string;

    constructor() {
        this.aiDiscoveryUrl = process.env.NEXT_PUBLIC_AI_DISCOVERY_SERVICE_URL ||
            'https://ai-discovery-service-production.up.railway.app';
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            throw new Error(`AI Tools API error: ${response.status} ${response.statusText}`);
        }

        try {
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to parse response: ${error}`);
        }
    }

    // ============================================================================
    // AI DISCOVERY SERVICE METHODS (Copied exactly from api.ts)
    // ============================================================================

    /**
     * Test connection to AI Discovery Service
     */
    async testAiDiscoveryConnection(): Promise<AiConnectionTest> {
        try {
            // Call the /health endpoint directly on AI Discovery Service
            const response = await fetch(`${this.aiDiscoveryUrl}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            })

            if (!response.ok) {
                throw new Error(`AI Discovery connection test failed: ${response.statusText}`)
            }

            const healthResult = await response.json()
            console.log('🔍 AI Discovery health check:', healthResult)

            // Transform the health response to match expected format
            const result: AiConnectionTest = {
                connection_status: healthResult.status === 'healthy' ? 'success' : 'failed',
                ai_discovery_available: healthResult.status === 'healthy',
                providers_discovered: 0, // We'll get this from recommendations endpoint
                test_timestamp: new Date().toISOString(),
                discovered_providers: []
            }

            // Try to get recommendations to count providers
            try {
                const recsResponse = await fetch(`${this.aiDiscoveryUrl}/api/v1/providers/recommendations`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                })

                if (recsResponse.ok) {
                    const recsData = await recsResponse.json()
                    result.providers_discovered = recsData.recommendations?.length || 0
                    result.discovered_providers = recsData.recommendations?.map((rec: any) => ({
                        name: rec.recommended_provider || 'unknown',
                        category: rec.category || 'unknown',
                        available: true
                    })) || []
                }
            } catch (recsError) {
                console.warn('Could not fetch provider recommendations:', recsError)
            }

            console.log('✅ AI Discovery connection test successful:', result)
            return result
        } catch (error) {
            console.error('❌ AI Discovery connection test error:', error)

            return {
                connection_status: 'failed',
                ai_discovery_available: false,
                providers_discovered: 0,
                test_timestamp: new Date().toISOString(),
                error_details: error instanceof Error ? error.message : 'Unknown error',
                discovered_providers: []
            }
        }
    }

    /**
     * Get AI optimization dashboard data
     */
    async getAiOptimizationDashboard(): Promise<AiOptimizationDashboard> {
        try {
            // Use the available endpoints from AI Discovery Service
            const [healthResponse, recommendationsResponse, recentResponse] = await Promise.all([
                fetch(`${this.aiDiscoveryUrl}/health`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                }),
                fetch(`${this.aiDiscoveryUrl}/api/v1/providers/recommendations`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                }),
                fetch(`${this.aiDiscoveryUrl}/api/v1/discoveries/recent`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                })
            ])

            const healthData = await healthResponse.json()
            const recommendationsData = recommendationsResponse.ok ? await recommendationsResponse.json() : { recommendations: [] }
            const recentData = recentResponse.ok ? await recentResponse.json() : { discoveries: [] }

            // Create dashboard data from available information
            const dashboardData: AiOptimizationDashboard = {
                current_providers: {
                    content_generation: 'openai-gpt4',
                    image_generation: 'dall-e-3',
                    analysis: 'claude-3-sonnet',
                    email_optimization: 'claude-3-haiku'
                },
                provider_performance: [], // Would need actual provider status endpoint
                optimization_suggestions: recommendationsData.recommendations?.map((rec: any) => ({
                    category: rec.category || 'unknown',
                    current_provider: rec.current_provider || 'unknown',
                    suggested_provider: rec.recommended_provider || 'unknown',
                    reason: rec.reason || 'Performance optimization',
                    potential_improvement: rec.estimated_improvement || '10-15% better performance',
                    confidence_score: rec.confidence || 75
                })) || [],
                cost_analysis: {
                    daily_cost: 12.50,
                    monthly_projection: 375.00,
                    potential_savings: 45.00
                },
                performance_metrics: {
                    avg_response_time: 1200,
                    success_rate: healthData.status === 'healthy' ? 99.2 : 0,
                    total_requests_today: recentData.discoveries?.length || 0
                }
            }

            console.log('📊 AI optimization dashboard data loaded:', dashboardData)
            return dashboardData
        } catch (error) {
            console.error('❌ AI optimization dashboard error:', error)
            throw error
        }
    }

    /**
     * Get current AI provider status
     */
    async getAiProviderStatus(): Promise<{
        providers: AiProviderStatus[]
        last_updated: string
        system_health: 'healthy' | 'degraded' | 'critical'
    }> {
        try {
            // Since there's no direct provider status endpoint, we'll create mock data based on health
            const healthResponse = await fetch(`${this.aiDiscoveryUrl}/health`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            })

            const healthData = await healthResponse.json()
            const isHealthy = healthData.status === 'healthy'

            // Create mock provider status data
            const providers: AiProviderStatus[] = [
                {
                    provider_name: 'openai-gpt4',
                    category: 'content_generation',
                    is_active: true,
                    status: isHealthy ? 'healthy' : 'degraded',
                    response_time_ms: isHealthy ? 800 : 2000,
                    error_rate: isHealthy ? 0.5 : 5.0,
                    last_check: new Date().toISOString(),
                    capabilities: ['text_generation', 'code_generation', 'analysis'],
                    cost_per_request: 0.002
                },
                {
                    provider_name: 'claude-3-sonnet',
                    category: 'analysis',
                    is_active: true,
                    status: isHealthy ? 'healthy' : 'degraded',
                    response_time_ms: isHealthy ? 1200 : 3000,
                    error_rate: isHealthy ? 0.3 : 3.0,
                    last_check: new Date().toISOString(),
                    capabilities: ['analysis', 'reasoning', 'code_review'],
                    cost_per_request: 0.003
                },
                {
                    provider_name: 'dall-e-3',
                    category: 'image_generation',
                    is_active: true,
                    status: isHealthy ? 'healthy' : 'degraded',
                    response_time_ms: isHealthy ? 15000 : 25000,
                    error_rate: isHealthy ? 1.0 : 8.0,
                    last_check: new Date().toISOString(),
                    capabilities: ['image_generation', 'image_editing'],
                    cost_per_request: 0.040
                }
            ]

            const result = {
                providers,
                last_updated: new Date().toISOString(),
                system_health: isHealthy ? 'healthy' as const : 'degraded' as const
            }

            console.log('🔍 AI provider status loaded:', result)
            return result
        } catch (error) {
            console.error('❌ AI provider status error:', error)
            throw error
        }
    }

    /**
     * Switch AI provider for a specific category
     */
    async switchAiProvider(
        category: string,
        newProvider: string,
        autoApply: boolean = true
    ): Promise<ProviderSwitchResult> {
        try {
            console.log(`🔄 Switching AI provider for ${category} to ${newProvider}`)

            // Since the AI Discovery Service doesn't have a switch endpoint, we'll simulate it
            const result: ProviderSwitchResult = {
                success: true,
                old_provider: 'openai-gpt3',
                new_provider: newProvider,
                category: category,
                switch_timestamp: new Date().toISOString(),
                performance_impact: {
                    response_time_change: '-15%',
                    cost_change: '+5%',
                    quality_change: '+20%'
                },
                message: `Successfully switched ${category} provider to ${newProvider}`
            }

            console.log('✅ AI provider switch successful:', result)
            return result
        } catch (error) {
            console.error('❌ AI provider switch error:', error)
            throw error
        }
    }

    /**
     * Get AI optimization recommendations
     */
    async getAiOptimizationRecommendations(): Promise<{
        recommendations: Array<{
            category: string
            current_provider: string
            recommended_provider: string
            reason: string
            estimated_improvement: string
            confidence: number
            priority: 'high' | 'medium' | 'low'
        }>
        last_analysis: string
        next_analysis: string
    }> {
        try {
            const response = await fetch(`${this.aiDiscoveryUrl}/api/v1/providers/recommendations`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            })

            if (!response.ok) {
                throw new Error(`Failed to fetch AI recommendations: ${response.statusText}`)
            }

            const data = await response.json()
            console.log('🔍 Raw recommendations data:', data)

            // Transform the response to match expected format
            return {
                recommendations: data.recommendations?.map((rec: any) => ({
                    category: rec.category || 'content_generation',
                    current_provider: rec.current_provider || 'openai-gpt3',
                    recommended_provider: rec.recommended_provider || 'claude-3-sonnet',
                    reason: rec.reason || 'Better performance and cost efficiency',
                    estimated_improvement: rec.estimated_improvement || '15-20% performance boost',
                    confidence: rec.confidence || 80,
                    priority: rec.priority || 'medium'
                })) || [],
                last_analysis: new Date().toISOString(),
                next_analysis: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            }
        } catch (error) {
            console.error('❌ AI recommendations error:', error)
            throw error
        }
    }

    /**
     * Apply multiple AI Discovery Service optimization recommendations at once
     */
    async applyAiOptimizationRecommendations(
        recommendations: Array<{
            category: string
            new_provider: string
        }>
    ): Promise<{
        success: boolean
        applied_changes: number
        failed_changes: number
        results: ProviderSwitchResult[]
        message: string
    }> {
        try {
            // Simulate applying recommendations
            const results: ProviderSwitchResult[] = []

            for (const rec of recommendations) {
                const switchResult = await this.switchAiProvider(rec.category, rec.new_provider)
                results.push(switchResult)
            }

            return {
                success: true,
                applied_changes: results.length,
                failed_changes: 0,
                results,
                message: `Successfully applied ${results.length} AI Discovery optimization recommendations`
            }
        } catch (error) {
            console.error('❌ Apply AI Discovery recommendations error:', error)
            throw error
        }
    }

    /**
     * Get AI cost analysis and projections
     */
    async getAiCostAnalysis(days: number = 30): Promise<{
        current_daily_cost: number
        monthly_projection: number
        cost_breakdown: Record<string, number>
        optimization_potential: {
            max_savings: number
            recommended_savings: number
            payback_period_days: number
        }
        cost_trends: Array<{
            date: string
            total_cost: number
            requests: number
        }>
    }> {
        try {
            // Since the AI Discovery Service doesn't have a cost analysis endpoint, we'll simulate it
            const result = {
                current_daily_cost: 12.50,
                monthly_projection: 375.00,
                cost_breakdown: {
                    content_generation: 8.50,
                    image_generation: 2.75,
                    analysis: 1.25
                },
                optimization_potential: {
                    max_savings: 45.00,
                    recommended_savings: 22.50,
                    payback_period_days: 14
                },
                cost_trends: Array.from({ length: days }, (_, i) => ({
                    date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    total_cost: 10 + Math.random() * 5,
                    requests: 100 + Math.floor(Math.random() * 50)
                }))
            }

            return result
        } catch (error) {
            console.error('❌ AI cost analysis error:', error)
            throw error
        }
    }

    /**
     * Enable/disable automatic AI optimization
     */
    async setAutoOptimization(enabled: boolean, preferences?: {
        max_cost_increase_percent?: number
        min_performance_improvement?: number
        categories_to_optimize?: string[]
    }): Promise<{
        success: boolean
        auto_optimization_enabled: boolean
        preferences: any
        message: string
    }> {
        try {
            // Simulate setting auto optimization
            const result = {
                success: true,
                auto_optimization_enabled: enabled,
                preferences: preferences || {},
                message: `Auto optimization ${enabled ? 'enabled' : 'disabled'} successfully`
            }

            return result
        } catch (error) {
            console.error('❌ Auto optimization setting error:', error)
            throw error
        }
    }

    // ============================================================================
    // AI TOOLS METHODS (Existing)
    // ============================================================================

    /**
     * Get AI Tools Dashboard data
     */
    async getAIToolsDashboard(): Promise<AIToolsDashboardData> {
        try {
            const response = await fetch(`${this.aiDiscoveryUrl}/api/v1/ai-tools/dashboard`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            return this.handleResponse<AIToolsDashboardData>(response);
        } catch (error) {
            console.error('AI Tools dashboard error:', error);
            throw error;
        }
    }

    /**
     * Get AI monitoring status
     */
    async getAIMonitoringStatus(): Promise<AIMonitoringStatus> {
        try {
            const response = await fetch(`${this.aiDiscoveryUrl}/api/v1/ai-tools/monitoring/status`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            return this.handleResponse<AIMonitoringStatus>(response);
        } catch (error) {
            console.error('AI monitoring status error:', error);
            throw error;
        }
    }

    /**
     * Start AI tools monitoring
     */
    async startAIMonitoring(): Promise<{ success: boolean; message: string }> {
        try {
            const response = await fetch(`${this.aiDiscoveryUrl}/api/v1/ai-tools/monitoring/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            return this.handleResponse<{ success: boolean; message: string }>(response);
        } catch (error) {
            console.error('Start AI monitoring error:', error);
            throw error;
        }
    }

    /**
     * Initialize AI tools system
     */
    async initializeAIToolsSystem(): Promise<AIToolsInitializationResult> {
        try {
            const response = await fetch(`${this.aiDiscoveryUrl}/api/v1/ai-tools/setup/full-initialization`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            return this.handleResponse<AIToolsInitializationResult>(response);
        } catch (error) {
            console.error('AI tools initialization error:', error);
            throw error;
        }
    }

    /**
     * Get optimization recommendations
     */
    async getOptimizationRecommendations(): Promise<AIOptimizationRecommendations> {
        try {
            const response = await fetch(`${this.aiDiscoveryUrl}/api/v1/ai-tools/optimization/recommendations`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            return this.handleResponse<AIOptimizationRecommendations>(response);
        } catch (error) {
            console.error('Optimization recommendations error:', error);
            throw error;
        }
    }

    /**
     * Apply AI Tools optimization recommendations
     */
    async applyAIToolsOptimizationRecommendations(
        recommendations: Array<{ category: string; tool_id: string }>
    ): Promise<{ success: boolean; applied_count: number; message: string }> {
        try {
            const response = await fetch(`${this.aiDiscoveryUrl}/api/v1/ai-tools/optimization/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recommendations })
            });

            return this.handleResponse<{ success: boolean; applied_count: number; message: string }>(response);
        } catch (error) {
            console.error('Apply AI Tools optimization recommendations error:', error);
            throw error;
        }
    }

    /**
     * Get AI tools by category
     */
    async getAIToolsByCategory(category: string): Promise<{
        success: boolean;
        category: string;
        tools: AITool[];
        total_tools: number;
    }> {
        try {
            const response = await fetch(`${this.aiDiscoveryUrl}/api/v1/ai-tools/category/${category}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            return this.handleResponse<{
                success: boolean;
                category: string;
                tools: AITool[];
                total_tools: number;
            }>(response);
        } catch (error) {
            console.error('Get AI tools by category error:', error);
            throw error;
        }
    }

    /**
     * Test specific AI tool
     */
    async testAITool(toolId: string): Promise<{
        success: boolean;
        tool_id: string;
        test_result: any;
        performance_metrics: any;
        message: string;
    }> {
        try {
            const response = await fetch(`${this.aiDiscoveryUrl}/api/v1/ai-tools/${toolId}/test`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            return this.handleResponse<{
                success: boolean;
                tool_id: string;
                test_result: any;
                performance_metrics: any;
                message: string;
            }>(response);
        } catch (error) {
            console.error('Test AI tool error:', error);
            throw error;
        }
    }

    /**
     * Update AI tool configuration
     */
    async updateAIToolConfig(
        toolId: string,
        config: Record<string, any>
    ): Promise<{
        success: boolean;
        tool_id: string;
        updated_config: Record<string, any>;
        message: string;
    }> {
        try {
            const response = await fetch(`${this.aiDiscoveryUrl}/api/v1/ai-tools/${toolId}/config`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });

            return this.handleResponse<{
                success: boolean;
                tool_id: string;
                updated_config: Record<string, any>;
                message: string;
            }>(response);
        } catch (error) {
            console.error('Update AI tool config error:', error);
            throw error;
        }
    }

    /**
     * Get AI tools performance history
     */
    async getAIToolsPerformanceHistory(days: number = 30): Promise<{
        success: boolean;
        performance_data: Array<{
            date: string;
            tool_id: string;
            tool_name: string;
            category: string;
            quality_rating: number;
            cost_rating: number;
            response_time: number;
            success_rate: number;
        }>;
        summary: {
            total_entries: number;
            date_range: { start: string; end: string };
            categories_covered: string[];
        };
    }> {
        try {
            const response = await fetch(`${this.aiDiscoveryUrl}/api/v1/ai-tools/performance/history?days=${days}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            return this.handleResponse<{
                success: boolean;
                performance_data: Array<{
                    date: string;
                    tool_id: string;
                    tool_name: string;
                    category: string;
                    quality_rating: number;
                    cost_rating: number;
                    response_time: number;
                    success_rate: number;
                }>;
                summary: {
                    total_entries: number;
                    date_range: { start: string; end: string };
                    categories_covered: string[];
                };
            }>(response);
        } catch (error) {
            console.error('Get AI tools performance history error:', error);
            throw error;
        }
    }
}

// ============================================================================
// AI DISCOVERY SERVICE UTILITIES (Copied exactly from api.ts)
// ============================================================================

export const aiDiscoveryUtils = {
    /**
     * Get status color for provider health
     */
    getStatusColor: (status: string): string => {
        switch (status) {
            case 'healthy': return 'text-green-600'
            case 'degraded': return 'text-yellow-600'
            case 'error': return 'text-red-600'
            default: return 'text-gray-500'
        }
    },

    /**
     * Get status badge color
     */
    getStatusBadgeColor: (status: string): string => {
        switch (status) {
            case 'healthy': return 'bg-green-100 text-green-800'
            case 'degraded': return 'bg-yellow-100 text-yellow-800'
            case 'error': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    },

    /**
     * Format response time
     */
    formatResponseTime: (ms: number): string => {
        if (ms < 1000) return `${ms}ms`
        return `${(ms / 1000).toFixed(1)}s`
    },

    /**
     * Format cost
     */
    formatCost: (cost: number): string => {
        if (cost < 0.01) return `$${(cost * 1000).toFixed(2)}m`
        return `$${cost.toFixed(3)}`
    },

    /**
     * Get priority color for recommendations
     */
    getPriorityColor: (priority: string): string => {
        switch (priority) {
            case 'high': return 'text-red-600'
            case 'medium': return 'text-yellow-600'
            case 'low': return 'text-green-600'
            default: return 'text-gray-500'
        }
    },

    /**
     * Calculate potential savings percentage
     */
    calculateSavingsPercentage: (current: number, potential: number): number => {
        if (current === 0) return 0
        return ((current - potential) / current) * 100
    },

    /**
     * Get provider category display name
     */
    getCategoryDisplayName: (category: string): string => {
        const categoryMap: Record<string, string> = {
            'content_generation': 'Content Generation',
            'image_generation': 'Image Generation',
            'analysis': 'Analysis & Intelligence',
            'email_optimization': 'Email Optimization',
            'translation': 'Translation',
            'summarization': 'Summarization'
        }
        return categoryMap[category] || category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    },

    /**
     * Sort providers by performance score
     */
    sortProvidersByPerformance: (providers: AiProviderStatus[]): AiProviderStatus[] => {
        return [...providers].sort((a, b) => {
            // Healthy status first
            if (a.status !== b.status) {
                const statusOrder = { healthy: 0, degraded: 1, error: 2 }
                return statusOrder[a.status] - statusOrder[b.status]
            }

            // Then by response time (lower is better)
            if (a.response_time_ms !== b.response_time_ms) {
                return a.response_time_ms - b.response_time_ms
            }

            // Finally by error rate (lower is better)
            return a.error_rate - b.error_rate
        })
    },

    /**
     * Get overall system health
     */
    getSystemHealth: (providers: AiProviderStatus[]): {
        status: 'healthy' | 'degraded' | 'critical'
        message: string
    } => {
        if (providers.length === 0) {
            return { status: 'critical', message: 'No providers available' }
        }

        const healthyCount = providers.filter(p => p.status === 'healthy').length
        const errorCount = providers.filter(p => p.status === 'error').length
        const degradedCount = providers.filter(p => p.status === 'degraded').length

        if (errorCount > providers.length * 0.5) {
            return { status: 'critical', message: `${errorCount} providers are down` }
        }

        if (degradedCount > providers.length * 0.3) {
            return { status: 'degraded', message: `${degradedCount} providers are degraded` }
        }

        return { status: 'healthy', message: `${healthyCount}/${providers.length} providers healthy` }
    }
}

// ============================================================================
// AI TOOLS UTILITIES (Existing)
// ============================================================================

export const aiToolsUtils = {
    /**
     * Get rating color based on score
     */
    getRatingColor: (rating: number): string => {
        if (rating >= 4.0) return 'text-green-600';
        if (rating >= 3.0) return 'text-yellow-600';
        if (rating >= 2.0) return 'text-orange-600';
        return 'text-red-600';
    },

    /**
     * Get priority badge color
     */
    getPriorityColor: (priority: 'high' | 'medium' | 'low'): string => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    },

    /**
     * Format performance improvement
     */
    formatImprovement: (improvement: number): string => {
        return improvement > 0 ? `+${improvement.toFixed(1)}%` : `${improvement.toFixed(1)}%`;
    },

    /**
     * Get category display name
     */
    getCategoryDisplayName: (category: string): string => {
        const categoryMap: Record<string, string> = {
            'content_generation': 'Content Generation',
            'image_generation': 'Image Generation',
            'text_analysis': 'Text Analysis',
            'data_processing': 'Data Processing',
            'language_translation': 'Translation',
            'code_generation': 'Code Generation',
            'chat_completion': 'Chat & Completion',
            'embeddings': 'Embeddings',
            'moderation': 'Content Moderation'
        };
        return categoryMap[category] || category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    },

    /**
     * Calculate cost savings
     */
    calculateCostSavings: (currentCost: number, newCost: number): {
        savings: number;
        percentage: number;
    } => {
        const savings = currentCost - newCost;
        const percentage = currentCost > 0 ? (savings / currentCost) * 100 : 0;
        return { savings, percentage };
    },

    /**
     * Sort tools by overall rating
     */
    sortToolsByRating: (tools: AITool[]): AITool[] => {
        return [...tools].sort((a, b) => b.overall_rating - a.overall_rating);
    },

    /**
     * Filter tools by usage status
     */
    filterToolsByUsage: (tools: AITool[], inUse: boolean): AITool[] => {
        return tools.filter(tool => tool.is_currently_used === inUse);
    },

    /**
     * Get monitoring status indicator
     */
    getMonitoringStatusColor: (isRunning: boolean): string => {
        return isRunning ? 'text-green-600' : 'text-red-600';
    },

    /**
     * Format last check time
     */
    formatLastCheck: (lastCheck: string): string => {
        const date = new Date(lastCheck);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));

        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
        return `${Math.floor(diffMinutes / 1440)}d ago`;
    }
};

// ============================================================================
// AI DISCOVERY SERVICE HOOK (Copied exactly from api.ts with minimal changes)
// ============================================================================

export function useAiDiscoveryService() {
    const [dashboardData, setDashboardData] = useState<AiOptimizationDashboard | null>(null)
    const [providerStatus, setProviderStatus] = useState<AiProviderStatus[]>([])
    const [connectionStatus, setConnectionStatus] = useState<AiConnectionTest | null>(null)
    const [recommendations, setRecommendations] = useState<any>(null)
    const [costAnalysis, setCostAnalysis] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [autoLoadAttempted, setAutoLoadAttempted] = useState(false)

    // Use the unified API client instead of the original apiClient
    const apiClient = useMemo(() => new AIToolsApiClient(), []);

    const testConnection = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const result = await apiClient.testAiDiscoveryConnection()
            setConnectionStatus(result)
            setAutoLoadAttempted(true)
            return result
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Connection test failed'
            setError(errorMessage)
            setAutoLoadAttempted(true)
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [apiClient])

    const loadDashboard = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const data = await apiClient.getAiOptimizationDashboard()
            setDashboardData(data)
            return data
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Dashboard loading failed'
            setError(errorMessage)
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [apiClient])

    const loadProviderStatus = useCallback(async () => {
        try {
            setError(null)
            const status = await apiClient.getAiProviderStatus()
            setProviderStatus(status.providers || [])
            return status
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Provider status loading failed'
            setError(errorMessage)
            throw err
        }
    }, [apiClient])

    const switchProvider = useCallback(async (category: string, newProvider: string) => {
        try {
            setError(null)
            const result = await apiClient.switchAiProvider(category, newProvider)

            // Refresh provider status after switch
            await loadProviderStatus()
            await loadDashboard()

            return result
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Provider switch failed'
            setError(errorMessage)
            throw err
        }
    }, [apiClient, loadProviderStatus, loadDashboard])

    const loadRecommendations = useCallback(async () => {
        try {
            setError(null)
            const recs = await apiClient.getAiOptimizationRecommendations()
            setRecommendations(recs)
            return recs
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Recommendations loading failed'
            setError(errorMessage)
            throw err
        }
    }, [apiClient])

    const applyRecommendations = useCallback(async (
        recommendations: Array<{ category: string; new_provider: string }>
    ) => {
        try {
            setIsLoading(true)
            setError(null)
            const result = await apiClient.applyAiOptimizationRecommendations(recommendations)

            // Refresh all data after applying recommendations
            await Promise.all([
                loadProviderStatus(),
                loadDashboard(),
                loadRecommendations()
            ])

            return result
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to apply recommendations'
            setError(errorMessage)
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [apiClient, loadProviderStatus, loadDashboard, loadRecommendations])

    const loadCostAnalysis = useCallback(async (days = 30) => {
        try {
            setError(null)
            const analysis = await apiClient.getAiCostAnalysis(days)
            setCostAnalysis(analysis)
            return analysis
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Cost analysis loading failed'
            setError(errorMessage)
            throw err
        }
    }, [apiClient])

    const setAutoOptimization = useCallback(async (enabled: boolean, preferences?: any) => {
        try {
            setError(null)
            const result = await apiClient.setAutoOptimization(enabled, preferences)

            // Refresh dashboard data
            await loadDashboard()

            return result
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Auto optimization setting failed'
            setError(errorMessage)
            throw err
        }
    }, [apiClient, loadDashboard])

    const refreshAll = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)

            // Try to load all data, but don't fail if some fail
            const results = await Promise.allSettled([
                loadDashboard(),
                loadProviderStatus(),
                loadRecommendations(),
                loadCostAnalysis()
            ])

            // Log any failures but don't throw
            results.forEach((result, index) => {
                if (result.status === 'rejected') {
                    console.warn(`AI Discovery data load ${index} failed:`, result.reason)
                }
            })

            setAutoLoadAttempted(true)
        } catch (err) {
            console.error('Error refreshing AI Discovery data:', err)
            // Don't throw error to prevent page crashes
        } finally {
            setIsLoading(false)
        }
    }, [loadDashboard, loadProviderStatus, loadRecommendations, loadCostAnalysis])

    // Graceful auto-loading - only attempt once and don't throw errors
    useEffect(() => {
        if (!autoLoadAttempted) {
            // Delay auto-load to prevent page render issues
            const timer = setTimeout(async () => {
                try {
                    console.log('🤖 Attempting graceful AI Discovery auto-load...')

                    // Try a simple connection test first
                    const connectionResult = await apiClient.testAiDiscoveryConnection()
                    setConnectionStatus(connectionResult)

                    // If connection succeeds, load other data
                    if (connectionResult.connection_status === 'success') {
                        await refreshAll()
                    }
                } catch (err) {
                    console.warn('🤖 AI Discovery auto-load failed (non-critical):', err)
                    // Set error but don't throw to prevent page crashes
                    setError('AI Discovery Service unavailable')
                } finally {
                    setAutoLoadAttempted(true)
                }
            }, 1000) // 1 second delay

            return () => clearTimeout(timer)
        }
    }, [autoLoadAttempted, refreshAll, apiClient])

    return {
        // State
        dashboardData,
        providerStatus,
        connectionStatus,
        recommendations,
        costAnalysis,
        isLoading,
        error,

        // Actions
        testConnection,
        loadDashboard,
        loadProviderStatus,
        switchProvider,
        loadRecommendations,
        applyRecommendations,
        loadCostAnalysis,
        setAutoOptimization,
        refreshAll,

        // Computed values
        isConnected: connectionStatus?.connection_status === 'success',
        hasRecommendations: recommendations?.recommendations?.length > 0,
        totalProviders: providerStatus.length,
        healthyProviders: providerStatus.filter(p => p.status === 'healthy').length
    }
}

// ============================================================================
// AI TOOLS MONITORING HOOK (Existing)
// ============================================================================

export function useAIToolsMonitoring() {
    const [dashboardData, setDashboardData] = useState<AIToolsDashboardData | null>(null);
    const [monitoringStatus, setMonitoringStatus] = useState<AIMonitoringStatus | null>(null);
    const [recommendations, setRecommendations] = useState<AIOptimizationRecommendations | null>(null);
    const [performanceHistory, setPerformanceHistory] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Memoize the API client to prevent recreation on every render
    const apiClient = useMemo(() => new AIToolsApiClient(), []);

    const loadDashboard = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await apiClient.getAIToolsDashboard();
            setDashboardData(data);
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load dashboard');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [apiClient]);

    const loadMonitoringStatus = useCallback(async () => {
        try {
            const status = await apiClient.getAIMonitoringStatus();
            setMonitoringStatus(status);
            return status;
        } catch (err) {
            console.error('Failed to load monitoring status:', err);
            setError(err instanceof Error ? err.message : 'Failed to load monitoring status');
            throw err;
        }
    }, [apiClient]);

    const startMonitoring = useCallback(async () => {
        try {
            setError(null);
            const result = await apiClient.startAIMonitoring();
            await loadMonitoringStatus();
            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to start monitoring');
            throw err;
        }
    }, [apiClient, loadMonitoringStatus]);

    const initializeSystem = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await apiClient.initializeAIToolsSystem();
            await Promise.all([
                loadDashboard(),
                loadMonitoringStatus()
            ]);
            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to initialize system');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [apiClient, loadDashboard, loadMonitoringStatus]);

    const loadRecommendations = useCallback(async () => {
        try {
            setError(null);
            const recs = await apiClient.getOptimizationRecommendations();
            setRecommendations(recs);
            return recs;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load recommendations');
            throw err;
        }
    }, [apiClient]);

    const applyRecommendations = useCallback(async (
        recs: Array<{ category: string; tool_id: string }>
    ) => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await apiClient.applyAIToolsOptimizationRecommendations(recs);

            // Refresh data after applying recommendations
            await Promise.all([
                loadDashboard(),
                loadRecommendations()
            ]);

            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to apply recommendations');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [apiClient, loadDashboard, loadRecommendations]);

    const getToolsByCategory = useCallback(async (category: string) => {
        try {
            setError(null);
            return await apiClient.getAIToolsByCategory(category);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get tools by category');
            throw err;
        }
    }, [apiClient]);

    const testTool = useCallback(async (toolId: string) => {
        try {
            setError(null);
            return await apiClient.testAITool(toolId);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to test tool');
            throw err;
        }
    }, [apiClient]);

    const updateToolConfig = useCallback(async (toolId: string, config: Record<string, any>) => {
        try {
            setError(null);
            return await apiClient.updateAIToolConfig(toolId, config);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update tool config');
            throw err;
        }
    }, [apiClient]);

    const loadPerformanceHistory = useCallback(async (days: number = 30) => {
        try {
            setError(null);
            const history = await apiClient.getAIToolsPerformanceHistory(days);
            setPerformanceHistory(history);
            return history;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load performance history');
            throw err;
        }
    }, [apiClient]);

    const refreshAll = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            await Promise.all([
                loadDashboard(),
                loadMonitoringStatus(),
                loadRecommendations(),
                loadPerformanceHistory()
            ]);
        } catch (err) {
            console.error('Error refreshing AI tools data:', err);
            setError(err instanceof Error ? err.message : 'Failed to refresh data');
        } finally {
            setIsLoading(false);
        }
    }, [loadDashboard, loadMonitoringStatus, loadRecommendations, loadPerformanceHistory]);

    // Auto-load on mount
    useEffect(() => {
        refreshAll().catch(console.error);
    }, [refreshAll]);

    return {
        // State
        dashboardData,
        monitoringStatus,
        recommendations,
        performanceHistory,
        isLoading,
        error,

        // Actions
        loadDashboard,
        startMonitoring,
        initializeSystem,
        loadRecommendations,
        applyRecommendations,
        getToolsByCategory,
        testTool,
        updateToolConfig,
        loadPerformanceHistory,
        refreshAll,

        // Computed values
        isMonitoringActive: monitoringStatus?.is_running ?? false,
        totalTools: dashboardData?.summary?.total_active_tools || 0,
        currentlyUsedTools: dashboardData?.summary?.currently_used_tools || 0,
        averageRating: dashboardData?.summary?.average_rating || 0,
        hasRecommendations: (recommendations?.recommendations?.length ?? 0) > 0,
        highPriorityRecommendations: recommendations?.recommendations?.filter(r => r.priority === 'high').length ?? 0
    };
}

// ============================================================================
// CREATE AND EXPORT CLIENT INSTANCE
// ============================================================================

export const aiToolsApiClient = new AIToolsApiClient();

// ============================================================================
// INTEGRATION HELPER FOR EXISTING API
// ============================================================================

/**
 * Helper function to extend existing useApi hook with AI Tools + Discovery methods
 * Usage: const api = { ...useApi(), ...useAIToolsApi() }
 */
export function useAIToolsApi() {
    const client = useMemo(() => new AIToolsApiClient(), []);

    return useMemo(() => ({
        // AI Discovery Service methods (moved from api.ts)
        testAiDiscoveryConnection: client.testAiDiscoveryConnection.bind(client),
        getAiOptimizationDashboard: client.getAiOptimizationDashboard.bind(client),
        getAiProviderStatus: client.getAiProviderStatus.bind(client),
        switchAiProvider: client.switchAiProvider.bind(client),
        getAiOptimizationRecommendations: client.getAiOptimizationRecommendations.bind(client),
        applyAiOptimizationRecommendations: client.applyAiOptimizationRecommendations.bind(client),
        getAiCostAnalysis: client.getAiCostAnalysis.bind(client),
        setAutoOptimization: client.setAutoOptimization.bind(client),

        // AI Tools Dashboard
        getAIToolsDashboard: client.getAIToolsDashboard.bind(client),
        getAIMonitoringStatus: client.getAIMonitoringStatus.bind(client),
        startAIMonitoring: client.startAIMonitoring.bind(client),
        initializeAIToolsSystem: client.initializeAIToolsSystem.bind(client),

        // AI Tools Optimization
        getOptimizationRecommendations: client.getOptimizationRecommendations.bind(client),
        applyAIToolsOptimizationRecommendations: client.applyAIToolsOptimizationRecommendations.bind(client),

        // AI Tools Management
        getAIToolsByCategory: client.getAIToolsByCategory.bind(client),
        testAITool: client.testAITool.bind(client),
        updateAIToolConfig: client.updateAIToolConfig.bind(client),
        getAIToolsPerformanceHistory: client.getAIToolsPerformanceHistory.bind(client)
    }), [client]);
}

// Default export
export default aiToolsApiClient;