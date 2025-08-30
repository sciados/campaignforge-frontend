// src/lib/services/intelligenceWorkflowService.ts
/**
 * Intelligence Workflow Service - Missing integration layer
 * Fills Gap 2: Frontend workflow integration with backend storage and enhancement
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

class IntelligenceWorkflowService {
    private apiBase: string;

    constructor(apiBase: string = '/api/intelligence') {
        this.apiBase = apiBase;
    }

    /**
     * MISSING FUNCTION: Complete analysis workflow with storage and enhancement
     * This integrates Steps 2, 3, and 4 of the intended workflow
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

            const response = await fetch(`${this.apiBase}/campaigns/${campaignId}/analyze-and-store`, {
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
     * MISSING FUNCTION: Get workflow status for UI updates
     */
    async getWorkflowStatus(campaignId: string): Promise<WorkflowStatus> {
        try {
            const response = await fetch(`${this.apiBase}/campaigns/${campaignId}/workflow-status`, {
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
            console.error('Failed to get workflow status:', error);
            throw error;
        }
    }

    /**
     * MISSING FUNCTION: Get enhanced intelligence for content generation
     */
    async getEnhancedIntelligence(campaignId: string): Promise<EnhancedIntelligence> {
        try {
            const response = await fetch(`${this.apiBase}/campaigns/${campaignId}/enhanced-intelligence`, {
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
            console.error('Failed to get enhanced intelligence:', error);
            throw error;
        }
    }

    /**
     * MISSING FUNCTION: Poll workflow status until completion
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
     * Trigger manual enhancement (if auto-enhancement failed or user wants to retry)
     */
    async triggerManualEnhancement(
        campaignId: string,
        intelligenceId: string,
        preferences?: any
    ): Promise<any> {
        try {
            const response = await fetch(
                `${this.apiBase}/campaigns/${campaignId}/intelligence/${intelligenceId}/manual-enhance`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.getAuthToken()}`
                    },
                    body: JSON.stringify(preferences || {})
                }
            );

            if (!response.ok) {
                throw new Error(`Manual enhancement failed: ${response.status}`);
            }

            const result = await response.json();

            console.log('✨ Manual enhancement result:', result);

            return result;
        } catch (error) {
            console.error('Manual enhancement failed:', error);
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

            // Step 1: Trigger complete analysis workflow
            const analysisResult = await intelligenceWorkflowService.analyzeAndStoreWithEnhancement(
                campaignId,
                analysisRequest
            );

            setAnalysisProgress(30);
            setCurrentStep('Analysis complete, processing intelligence...');
            if (onProgress) onProgress(30, 'Analysis complete, processing intelligence...');

            // Step 2: Poll for completion (includes auto-enhancement)
            const finalStatus = await intelligenceWorkflowService.pollWorkflowStatus(
                campaignId,
                (status) => {
                    // Update progress based on workflow status
                    let progress = 30;
                    let step = 'Processing...';

                    if (status.auto_analysis_status?.status === 'COMPLETED') {
                        progress = 70;
                        step = 'Analysis completed';

                        if (status.intelligence_enhanced) {
                            progress = 90;
                            step = 'Intelligence enhanced';
                        }
                    }

                    setAnalysisProgress(progress);
                    setCurrentStep(step);
                    if (onProgress) onProgress(progress, step);
                }
            );

            // Step 3: Final completion
            setAnalysisProgress(100);
            setCurrentStep('Workflow completed successfully');
            if (onProgress) onProgress(100, 'Workflow completed successfully');

            return {
                success: true,
                intelligence_id: analysisResult.intelligence_id,
                confidence_score: finalStatus.auto_analysis_status?.confidence_score || 0,
                enhanced: finalStatus.intelligence_enhanced,
                ready_for_content: finalStatus.ready_for_content_generation
            };

        } catch (error) {
            console.error('Complete workflow failed:', error);
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
            console.error('Failed to get enhanced intelligence:', error);
            throw error;
        }
    }, []);

    return {
        isAnalyzing,
        analysisProgress,
        currentStep,
        error,
        runCompleteWorkflow,
        getEnhancedIntelligenceForContent
    };
}