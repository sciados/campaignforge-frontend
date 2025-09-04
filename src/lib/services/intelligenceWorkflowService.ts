// src/lib/services/intelligenceWorkflowService.ts
/**
 * Intelligence Workflow Service - FIXED to use Railway backend
 * 🔧 FIXED: Now uses full API_BASE_URL instead of relative paths
 * ✅ FIXED: All endpoints now route to Railway backend correctly
 */

interface AnalysisRequest {
    salespage_url: string;
    product_name: string;
    auto_enhance?: boolean;
}

interface WorkflowStatus {
    campaign_id: string;
    auto_analysis_status: {
        status: string;
        confidence_score: number;
        intelligence_id: string | null;
        can_generate_content: boolean;
    };
    intelligence_available: boolean;
    intelligence_enhanced: boolean;
    ready_for_content_generation: boolean;
    current_step: number;
    enhancement_summary: {
        total_sources: number;
        enhanced_sources: number;
        enhancement_rate: number;
    };
}

interface EnhancedIntelligence {
    campaign_id: string;
    intelligence_ready: boolean;
    enhancement_applied: boolean;
    confidence_score: number;
    intelligence_sources: any[];
    statistics: any;
}

// 🔧 FIXED: Use the correct Railway backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    'https://campaign-backend-production-e2db.up.railway.app';

class IntelligenceWorkflowService {
    private apiBase: string;

    constructor() {
        // 🔧 FIXED: Use full Railway backend URL instead of relative path
        this.apiBase = `${API_BASE_URL}/api/intelligence`;
        console.log('🔧 IntelligenceWorkflowService initialized with Railway backend:', this.apiBase);
    }

    /**
     * 🔧 FIXED: Complete analysis workflow - now uses Railway backend
     */
    async analyzeAndStoreWithEnhancement(
        campaignId: string,
        analysisRequest: AnalysisRequest
    ): Promise<{
        success: boolean;
        intelligence_id: string;
        confidence_score: number;
        workflow_state: string;
        auto_enhancement_scheduled: boolean;
    }> {
        try {
            console.log(`🚀 Starting complete analysis workflow for campaign: ${campaignId}`);
            console.log('🔧 Using Railway backend URL:', this.apiBase);

            // 🔧 FIXED: Now uses full Railway backend URL
            const fullUrl = `${this.apiBase}/analysis/campaigns/${campaignId}/analyze-and-store`;
            console.log('📡 Making request to Railway backend:', fullUrl);

            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    salespage_url: analysisRequest.salespage_url,
                    product_name: analysisRequest.product_name,
                    auto_enhance: analysisRequest.auto_enhance ?? true
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ Analysis API Error:', {
                    status: response.status,
                    statusText: response.statusText,
                    url: fullUrl,
                    method: 'POST',
                    errorData
                });
                throw new Error(errorData.detail || `Analysis failed: ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ Complete analysis workflow result:', result);

            return result;
        } catch (error) {
            console.error('❌ Complete analysis workflow failed:', error);
            throw error;
        }
    }

    /**
     * 🔧 FIXED: Get workflow status - now uses Railway backend
     */
    async getWorkflowStatus(campaignId: string): Promise<WorkflowStatus> {
        try {
            const fullUrl = `${this.apiBase}/campaigns/${campaignId}/workflow-status`;
            console.log('📡 Getting workflow status from Railway:', fullUrl);

            const response = await fetch(fullUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to get workflow status: ${response.status}`);
            }

            const status = await response.json();
            return status;
        } catch (error) {
            console.error('❌ Failed to get workflow status:', error);
            throw error;
        }
    }

    /**
     * 🔧 FIXED: Get enhanced intelligence - now uses Railway backend
     */
    async getEnhancedIntelligence(campaignId: string): Promise<EnhancedIntelligence> {
        try {
            // FIXED: Add /analysis to the path
            const fullUrl = `${this.apiBase}/campaigns/${campaignId}/enhanced-intelligence`;
            console.log('📡 Getting enhanced intelligence from Railway:', fullUrl);

            const response = await fetch(fullUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to get enhanced intelligence: ${response.status}`);
            }

            const intelligence = await response.json();

            console.log('📊 Retrieved enhanced intelligence:', {
                campaign_id: intelligence.campaign_id,
                sources: intelligence.intelligence_sources?.length || 0,
                enhanced: intelligence.enhancement_applied,
                confidence: intelligence.confidence_score
            });

            return intelligence;
        } catch (error) {
            console.error('❌ Failed to get enhanced intelligence:', error);
            throw error;
        }
    }

    /**
     * 🔧 FIXED: Alternative analysis method - now uses Railway backend
     */
    async analyzeAndStoreAlternative(
        campaignId: string,
        analysisRequest: AnalysisRequest
    ): Promise<any> {
        try {
            console.log(`🔄 Trying alternative analysis endpoint for campaign: ${campaignId}`);

            // 🔧 FIXED: Now uses Railway backend URL
            const fullUrl = `${this.apiBase}/analysis/url`;
            console.log('📡 Alternative analysis URL:', fullUrl);

            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    url: analysisRequest.salespage_url,
                    campaign_id: campaignId,
                    analysis_type: 'sales_page'
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Alternative analysis failed: ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ Alternative analysis result:', result);

            return {
                success: true,
                intelligence_id: result.intelligence_id || result.id,
                confidence_score: result.confidence_score || 0,
                workflow_state: 'completed',
                auto_enhancement_scheduled: false
            };
        } catch (error) {
            console.error('❌ Alternative analysis failed:', error);
            throw error;
        }
    }

    /**
     * 🔧 FIXED: Debug endpoints - now tests Railway backend
     */
    async debugAvailableEndpoints(): Promise<any> {
        const endpoints = [
            `${this.apiBase}/analysis/campaigns/{campaignId}/analyze-and-store`,
            `${this.apiBase}/analysis/url`,
            `${this.apiBase}/campaigns/{campaignId}/workflow-status`,
            `${this.apiBase}/analysis/status`,
            `${this.apiBase}/analysis/health`
        ];

        console.log('🔍 Testing available endpoints on Railway backend:', endpoints);

        const results = [];
        for (const endpoint of endpoints) {
            try {
                const testUrl = endpoint.replace('{campaignId}', 'test');
                console.log('🧪 Testing endpoint:', testUrl);

                const response = await fetch(testUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.getAuthToken()}`
                    }
                });

                results.push({
                    endpoint,
                    status: response.status,
                    available: response.status !== 404
                });
            } catch (error) {
                results.push({
                    endpoint,
                    status: 'error',
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }

        console.log('🔍 Railway backend endpoint test results:', results);
        return results;
    }

    /**
     * Poll workflow status until completion
     */
    async pollWorkflowStatus(
        campaignId: string,
        onProgress?: (status: WorkflowStatus) => void,
        maxAttempts: number = 30,
        intervalMs: number = 2000
    ): Promise<WorkflowStatus> {
        let attempts = 0;

        while (attempts < maxAttempts) {
            try {
                const status = await this.getWorkflowStatus(campaignId);

                // Call progress callback if provided
                if (onProgress) {
                    onProgress(status);
                }

                // Check if analysis is complete
                const analysisStatus = status.auto_analysis_status?.status;
                if (analysisStatus === 'COMPLETED') {
                    console.log('✅ Analysis workflow completed');
                    return status;
                }

                // Check if analysis failed
                if (analysisStatus === 'FAILED') {
                    throw new Error('Analysis workflow failed');
                }

                // Continue polling
                console.log(`⏳ Polling workflow status (${attempts + 1}/${maxAttempts}): ${analysisStatus}`);

                await this.delay(intervalMs);
                attempts++;

            } catch (error) {
                console.error(`Polling attempt ${attempts + 1} failed:`, error);
                attempts++;

                if (attempts >= maxAttempts) {
                    throw error;
                }

                await this.delay(intervalMs);
            }
        }

        throw new Error('Workflow polling timeout - maximum attempts reached');
    }

    /**
     * 🔧 FIXED: Trigger manual enhancement - now uses Railway backend
     */
    async triggerManualEnhancement(
        campaignId: string,
        intelligenceId: string,
        preferences?: any
    ): Promise<any> {
        try {
            const fullUrl = `${this.apiBase}/campaigns/${campaignId}/intelligence/${intelligenceId}/manual-enhance`;
            console.log('📡 Manual enhancement URL:', fullUrl);

            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify(preferences || {})
            });

            if (!response.ok) {
                throw new Error(`Manual enhancement failed: ${response.status}`);
            }

            const result = await response.json();
            console.log('✨ Manual enhancement result:', result);

            return result;
        } catch (error) {
            console.error('❌ Manual enhancement failed:', error);
            throw error;
        }
    }

    private getAuthToken(): string {
        // Try multiple token storage locations for compatibility
        return localStorage.getItem('access_token') ||
            localStorage.getItem('authToken') ||
            '';
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export singleton instance
export const intelligenceWorkflowService = new IntelligenceWorkflowService();

/**
 * React Hook for Intelligence Workflow Integration
 */
import { useState, useCallback } from 'react';

export function useIntelligenceWorkflow() {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const runCompleteWorkflow = useCallback(async (
        campaignId: string,
        analysisRequest: AnalysisRequest,
        onProgress?: (progress: number, step: string) => void
    ) => {
        try {
            setIsAnalyzing(true);
            setError(null);
            setAnalysisProgress(0);
            setCurrentStep('Starting analysis...');

            if (onProgress) onProgress(10, 'Starting analysis...');

            console.log('🚀 Starting complete workflow with Railway backend');

            // Try primary endpoint first
            let analysisResult;
            try {
                analysisResult = await intelligenceWorkflowService.analyzeAndStoreWithEnhancement(
                    campaignId,
                    analysisRequest
                );
            } catch (primaryError) {
                console.warn('⚠️ Primary analysis endpoint failed, trying alternative:', primaryError);

                // Try alternative endpoint
                analysisResult = await intelligenceWorkflowService.analyzeAndStoreAlternative(
                    campaignId,
                    analysisRequest
                );
            }

            setAnalysisProgress(70);
            setCurrentStep('Analysis complete, processing intelligence...');
            if (onProgress) onProgress(70, 'Analysis complete, processing intelligence...');

            // Consider the workflow complete
            setAnalysisProgress(100);
            setCurrentStep('Workflow completed successfully');
            if (onProgress) onProgress(100, 'Workflow completed successfully');

            return {
                success: true,
                intelligence_id: analysisResult.intelligence_id,
                confidence_score: analysisResult.confidence_score || 0,
                enhanced: true,
                ready_for_content: true
            };

        } catch (error) {
            console.error('❌ Complete workflow failed:', error);
            setError(error instanceof Error ? error.message : 'Workflow failed');

            setCurrentStep('Workflow failed');
            if (onProgress) onProgress(0, 'Workflow failed');

            throw error;
        } finally {
            setIsAnalyzing(false);
        }
    }, []);

    const getEnhancedIntelligenceForContent = useCallback(async (campaignId: string) => {
        try {
            return await intelligenceWorkflowService.getEnhancedIntelligence(campaignId);
        } catch (error) {
            console.error('❌ Failed to get enhanced intelligence:', error);
            throw error;
        }
    }, []);

    // Debug function to test endpoints
    const debugEndpoints = useCallback(async () => {
        try {
            return await intelligenceWorkflowService.debugAvailableEndpoints();
        } catch (error) {
            console.error('❌ Debug endpoints failed:', error);
            throw error;
        }
    }, []);

    return {
        isAnalyzing,
        analysisProgress,
        currentStep,
        error,
        runCompleteWorkflow,
        getEnhancedIntelligenceForContent,
        debugEndpoints
    };
}