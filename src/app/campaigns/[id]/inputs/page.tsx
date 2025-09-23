// src/app/campaigns/[id]/inputs/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, FileDown, Loader2, X, CheckCircle } from 'lucide-react';
import { useApi } from '@/lib/api';
import SimplifiedInputsManager from '@/components/campaigns/SimplifiedInputsManager';

interface CampaignInput {
  id: string;
  type: string;
  label: string;
  value: string;
  status: 'pending' | 'valid' | 'invalid';
  error?: string;
}

interface CampaignInputsPageProps {
  params: {
    id: string;
  };
}

export default function CampaignInputsPage({ params }: CampaignInputsPageProps) {
  const router = useRouter();
  const api = useApi();
  const [campaign, setCampaign] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [inputs, setInputs] = useState<CampaignInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [analysisCompleted, setAnalysisCompleted] = useState(false);
  const progressPollingRef = useRef<NodeJS.Timeout | null>(null);
  const pollCountRef = useRef(0);
  
  // Rate limiting for page loads
  const isLoadingRef = useRef(false);
  const lastLoadTime = useRef(0);

  useEffect(() => {
    // Prevent rapid reloads but allow normal page navigation
    const now = Date.now();
    const timeSinceLastLoad = now - lastLoadTime.current;

    console.log('🔄 INPUTS useEffect running for ID:', params.id);

    // Allow immediate first load, then require 1 second between reloads
    if (lastLoadTime.current > 0 && timeSinceLastLoad < 1000) {
      console.log('🔄 Rate limiting: Waiting before reload...');
      return;
    }

    lastLoadTime.current = now;

    // If already loading, don't start another request
    if (isLoadingRef.current) {
      console.warn('⚠️ Already loading, skipping duplicate request');
      return;
    }

    const loadCampaignAndProfile = async () => {
      try {
        isLoadingRef.current = true;
        setLoading(true);

        // Load campaign and user profile in parallel
        const [campaignResponse, profileResponse] = await Promise.all([
          api.getCampaign(params.id),
          api.getUserProfile()
        ]);

        setCampaign(campaignResponse);
        setUserProfile(profileResponse);

      } catch (err) {
        console.error('Failed to load campaign or profile:', err);
        setError('Failed to load campaign information');
      } finally {
        isLoadingRef.current = false;
        setLoading(false);
      }
    };

    loadCampaignAndProfile();
    // Note: Deliberately NOT including api in dependencies to prevent re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]); // Only re-run when campaign ID changes

  const handleInputsChange = useCallback((newInputs: CampaignInput[]) => {
    console.log('📝 handleInputsChange called with:', newInputs);
    setInputs(newInputs);
  }, []); // Remove inputs dependency to prevent re-renders

  // Simple completion polling
  const pollForCompletion = useCallback(async (analysisId: string) => {
    try {
      const progressResponse = await api.get(`/api/intelligence/progress/${analysisId}`);

      console.log('🔍 Progress response:', progressResponse);

      if (progressResponse.success && progressResponse.data) {
        const { completed, stage } = progressResponse.data;
        console.log('🔍 Progress data:', { completed, stage, data: progressResponse.data });

        // If analysis is completed, stop polling and navigate
        if (completed === true || stage === 'completed') {
          console.log('✅ Analysis completed detected, stopping polling');
          if (progressPollingRef.current) {
            clearInterval(progressPollingRef.current);
            progressPollingRef.current = null;
          }
          setAnalyzing(false);
          setAnalysisCompleted(true);

          // Navigate to content generation page
          console.log('✅ Analysis completed, navigating to content generation');
          router.push(`/campaigns/${params.id}/generate`);
        } else {
          console.log('🔄 Analysis still in progress, continuing to poll');
        }
      } else {
        console.log('❌ Invalid progress response:', progressResponse);
      }
    } catch (err) {
      console.error('Failed to poll analysis completion:', err);
      // Continue polling even if individual requests fail
    }
  }, [api, params.id, router]);

  // Start simple completion polling
  const startCompletionPolling = useCallback((analysisId: string) => {
    // Clear any existing polling
    if (progressPollingRef.current) {
      clearInterval(progressPollingRef.current);
    }

    pollCountRef.current = 0;
    const maxPolls = 60; // Maximum 5 minutes (60 * 5 seconds)

    // Poll every 5 seconds (less frequent since we're just checking completion)
    progressPollingRef.current = setInterval(() => {
      pollCountRef.current++;
      console.log(`🔄 Polling attempt ${pollCountRef.current}/${maxPolls} for analysis ${analysisId}`);

      if (pollCountRef.current >= maxPolls) {
        console.log('⏰ Polling timeout reached, stopping and navigating to results');
        if (progressPollingRef.current) {
          clearInterval(progressPollingRef.current);
          progressPollingRef.current = null;
        }
        setAnalyzing(false);
        setAnalysisCompleted(true);
        router.push(`/campaigns/${params.id}/generate`);
        return;
      }

      pollForCompletion(analysisId);
    }, 5000);

    // Also poll immediately
    pollForCompletion(analysisId);
  }, [pollForCompletion, params.id, router]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (progressPollingRef.current) {
        clearInterval(progressPollingRef.current);
      }
    };
  }, []);

  const handleAnalyze = async () => {
    try {
      console.log('🚀 Starting analysis - setting analyzing state to true');
      setAnalyzing(true);

      console.log('🔍 handleAnalyze called with inputs:', inputs);
      console.log('🔍 Input count:', inputs.length);
      console.log('🔍 Current analyzing state:', analyzing);
      inputs.forEach((input, index) => {
        console.log(`🔍 Input ${index}:`, {
          id: input.id,
          type: input.type,
          value: input.value,
          status: input.status
        });
      });

      // Validation: Check if we have any inputs
      if (inputs.length === 0) {
        throw new Error('No inputs provided. Please add at least one input source.');
      }

      // Validation: Check if we have any valid inputs
      const validInputs = inputs.filter(input => input.status === 'valid' && input.value.trim());
      if (validInputs.length === 0) {
        throw new Error('No valid inputs found. Please enter valid input data before analyzing.');
      }

      // Step 1: Convert inputs to format expected by analysis API
      const inputsData = inputs.reduce((acc, input) => {
        if (input.value.trim()) {  // Only include inputs with values
          acc[input.type] = input.value;
        }
        return acc;
      }, {} as Record<string, string>);

      const analysisData = {
        campaign_id: params.id,
        ...inputsData  // Flatten inputs to top level
      };

      console.log('🚀 Starting intelligence analysis with inputs:', analysisData);

      // Step 2: Run intelligence analysis (now async)
      const analysisResponse = await api.runIntelligenceAnalysis(analysisData);

      if (!analysisResponse.success) {
        throw new Error(analysisResponse.error || 'Intelligence analysis failed');
      }

      // If we get an analysis_id, start completion polling
      if (analysisResponse.data?.analysis_id) {
        console.log('🔄 Starting completion polling for analysis:', analysisResponse.data.analysis_id);
        startCompletionPolling(analysisResponse.data.analysis_id);
      } else {
        // Fallback: analysis completed immediately
        console.log('✅ Intelligence analysis completed immediately!');
        setAnalyzing(false);
        setAnalysisCompleted(true);
        router.push(`/campaigns/${params.id}/generate`);
      }
      
    } catch (err) {
      console.error('Intelligence analysis failed:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to complete intelligence analysis. Please try again.'
      );
      setAnalyzing(false);
    }
  };

  // Generate comprehensive PDF report
  const handleGenerateReport = async () => {
    if (!campaign || !analysisCompleted) return;

    setIsGeneratingReport(true);
    setError(null);

    try {
      // Request PDF report generation from backend (direct binary response)
      const response = await fetch(`https://campaign-backend-production-e2db.up.railway.app/api/intelligence/campaigns/${params.id}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          format: 'pdf',
          include_sections: [
            'executive_summary',
            'product_analysis',
            'target_audience',
            'competition_analysis',
            'marketing_strategy',
            'content_recommendations',
            'sales_psychology',
            'conversion_opportunities',
            'actionable_insights'
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Get the PDF blob from the response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${campaign.title}_Intelligence_Report.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Report generation error:", err);
      setError(
        `Report generation failed: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Determine user type from profile
  const getUserType = (): 'affiliate' | 'business' | 'creator' | 'agency' | null => {
    if (!userProfile) return null;

    // Map profile user types to input manager types
    if (userProfile.user_type) {
      const userType = userProfile.user_type;
      console.log('🔍 Mapping user type:', userType, 'from profile:', userProfile);

      // Handle different user type naming conventions
      if (userType === 'affiliate_marketer' || userType === 'affiliate') {
        console.log('✅ Mapped to affiliate');
        return 'affiliate';
      }
      if (userType === 'business_owner' || userType === 'business') {
        return 'business';
      }
      if (userType === 'content_creator' || userType === 'creator') {
        return 'creator';
      }
      if (userType === 'agency') {
        return 'agency';
      }

      // Return as-is if it matches expected types
      if (['affiliate', 'business', 'creator', 'agency'].includes(userType)) {
        return userType as 'affiliate' | 'business' | 'creator' | 'agency';
      }
    }

    // Default to affiliate for now
    console.log('🔍 getUserType() defaulting to affiliate, userProfile:', userProfile);
    return 'affiliate';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {campaign?.title || 'Campaign Setup'}
          </h1>
          <p className="text-gray-600">
            Add input sources to power AI analysis and content generation for your campaign
          </p>
          {campaign?.description && (
            <p className="text-sm text-gray-500 mt-2">{campaign.description}</p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <SimplifiedInputsManager
            campaignId={params.id}
            userType={getUserType()}
            onInputsChange={handleInputsChange}
            onAnalyze={handleAnalyze}
            isAnalyzing={analyzing}
          />
        </div>

        {/* PDF Report Section */}
        {analysisCompleted && (
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Intelligence Report
                </h3>
                <p className="text-gray-600">
                  Download a comprehensive PDF report with analysis insights and marketing strategies.
                </p>
              </div>
              <button
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isGeneratingReport ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4" />
                    <span>Download Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                Tips for Better Analysis
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Add your main sales/landing page URL for product insights</li>
                <li>• Include competitor pages to understand market positioning</li>
                <li>• Upload existing marketing materials for tone consistency</li>
                <li>• Add performance data to optimize for proven strategies</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}