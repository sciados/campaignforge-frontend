// src/app/campaigns/[id]/inputs/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useApi } from '@/lib/api';
import CampaignInputsManager from '@/components/campaigns/CampaignInputsManager';

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

  useEffect(() => {
    const loadCampaignAndProfile = async () => {
      try {
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
        setLoading(false);
      }
    };

    loadCampaignAndProfile();
  }, [params.id]); // Only depend on params.id, no api dependency

  const handleInputsChange = useCallback((newInputs: CampaignInput[]) => {
    setInputs(newInputs);
  }, []);

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      
      // Step 1: Convert inputs to format expected by analysis API
      const analysisData = {
        campaign_id: params.id,
        inputs: inputs.reduce((acc, input) => {
          acc[input.type] = input.value;
          return acc;
        }, {} as Record<string, string>)
      };

      console.log('Starting intelligence analysis with inputs:', analysisData);
      
      // Step 2: Run intelligence analysis
      const analysisResponse = await api.runIntelligenceAnalysis(params.id, analysisData);
      
      if (!analysisResponse.success) {
        throw new Error(analysisResponse.error || 'Intelligence analysis failed');
      }

      console.log('Intelligence analysis completed, triggering content generation...');
      
      // Step 3: Trigger content generation based on intelligence results
      const contentResponse = await api.triggerContentGeneration(params.id);
      
      if (!contentResponse.success) {
        throw new Error(contentResponse.error || 'Content generation failed to start');
      }

      console.log('Content generation started:', contentResponse);
      
      // Step 4: Navigate to content generation status page
      router.push(`/campaigns/${params.id}/content/generating`);
      
    } catch (err) {
      console.error('Analysis and content generation failed:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Failed to start analysis and content generation. Please try again.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  // Determine user type from profile
  const getUserType = (): 'affiliate' | 'business' | 'creator' | 'agency' | null => {
    if (!userProfile) return null;
    
    // This would typically come from user profile/preferences
    // For now, we'll use some heuristics or default
    if (userProfile.user_type) {
      return userProfile.user_type;
    }
    
    // Default to affiliate for now - could be smarter
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
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
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {analyzing ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Starting AI Analysis
              </h3>
              <p className="text-gray-600">
                Processing your inputs and generating campaign intelligence...
              </p>
            </div>
          ) : (
            <CampaignInputsManager
              campaignId={params.id}
              userType={getUserType()}
              onInputsChange={handleInputsChange}
              onAnalyze={handleAnalyze}
            />
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
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