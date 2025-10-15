// src/app/campaigns/[id]/images/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useApi } from '@/lib/api';
import ProductImagesTab from '@/components/campaigns/ProductImagesTab';

interface CampaignImagesPageProps {
  params: {
    id: string;
  };
}

export default function CampaignImagesPage({ params }: CampaignImagesPageProps) {
  const router = useRouter();
  const api = useApi();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const campaignData = await api.getCampaign(params.id);
        setCampaign(campaignData);
      } catch (error) {
        console.error('Failed to load campaign:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params.id, api]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Campaign not found</p>
          <button
            onClick={() => router.push('/campaigns')}
            className="text-purple-600 hover:text-purple-700"
          >
            Back to Campaigns
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push(`/campaigns/${params.id}`)}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{campaign.title}</h1>
              <p className="text-gray-600 mt-1">Product Images</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductImagesTab
          campaignId={params.id}
          salesPageUrl={campaign.salespage_url}
        />
      </div>
    </div>
  );
}
