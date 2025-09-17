// src/app/campaigns/[id]/inputs/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles } from 'lucide-react';
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
  }, [params.id, api]); // Include api in dependencies

  const handleInputsChange = useCallback((newInputs: CampaignInput[]) => {
    console.log('📝 handleInputsChange called with:', newInputs);
    console.log('📝 Previous inputs:', inputs);
    setInputs(newInputs);
  }, [inputs]);

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);

      console.log('🔍 handleAnalyze called with inputs:', inputs);
      console.log('🔍 Input count:', inputs.length);
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
      const analysisData = {
        campaign_id: params.id,
        inputs: inputs.reduce((acc, input) => {
          if (input.value.trim()) {  // Only include inputs with values
            acc[input.type] = input.value;
          }
          return acc;
        }, {} as Record<string, string>)
      };

      console.log('🚀 Starting intelligence analysis with inputs:', analysisData);
      
      // Step 2: Run intelligence analysis
      const analysisResponse = await api.runIntelligenceAnalysis(params.id, analysisData);
      
      if (!analysisResponse.success) {
        throw new Error(analysisResponse.error || 'Intelligence analysis failed');
      }

      console.log('✅ Intelligence analysis completed successfully!');

      // Navigate to campaign detail page to show analysis results
      // Content generation will be a separate step initiated by user
      router.push(`/campaigns/${params.id}?tab=intelligence&analysis=completed`);
      
    } catch (err) {
      console.error('Intelligence analysis failed:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to complete intelligence analysis. Please try again.'
      );
    } finally {
      setAnalyzing(false);
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
                Analyzing Intelligence Sources
              </h3>
              <p className="text-gray-600">
                Processing your input sources and extracting marketing intelligence...
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This analysis will power your content generation later.
              </p>
            </div>
          ) : (
            <SimplifiedInputsManager
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