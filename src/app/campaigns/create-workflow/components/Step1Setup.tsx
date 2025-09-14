// src/app/campaigns/create-workflow/components/Step1Setup.tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, Sparkles, Target, Hash, FileText } from 'lucide-react';
import { useApi } from '@/lib/api';

export interface CampaignFormData {
  title: string;
  description: string;
  keywords: string[];
  target_audience: string;
}

interface Step1SetupProps {
  onComplete: (data: CampaignFormData) => void;
  isLoading?: boolean;
}

export default function Step1Setup({ onComplete, isLoading = false }: Step1SetupProps) {
  const router = useRouter();
  const api = useApi();
  
  const [formData, setFormData] = useState<CampaignFormData>({
    title: '',
    description: '',
    keywords: [],
    target_audience: ''
  });

  const [keywordInput, setKeywordInput] = useState('');

  const handleInputChange = (field: keyof CampaignFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create the campaign with simplified data
      const campaignData = {
        title: formData.title,
        description: formData.description,
        keywords: formData.keywords,
        target_audience: formData.target_audience
      };

      const campaign = await api.createCampaign(campaignData);
      
      // Navigate to inputs page for this campaign
      router.push(`/campaigns/${campaign.id}/inputs`);
      
    } catch (error) {
      console.error('Failed to create campaign:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Campaign</h2>
          <p className="text-gray-600">
            Set up your campaign basics. You&apos;ll add input sources in the next step.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campaign Title */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Campaign Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="e.g., Q4 Product Launch Campaign"
              required
              disabled={isLoading}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              <FileText className="h-4 w-4 inline mr-1" />
              Campaign Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Describe what this campaign is about..."
              rows={3}
              required
              disabled={isLoading}
            />
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              <Target className="h-4 w-4 inline mr-1" />
              Target Audience
            </label>
            <input
              type="text"
              value={formData.target_audience}
              onChange={(e) => handleInputChange('target_audience', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="e.g., Small business owners, Health enthusiasts"
              disabled={isLoading}
            />
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              <Hash className="h-4 w-4 inline mr-1" />
              Keywords
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={handleKeywordKeyPress}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Add keywords..."
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={addKeyword}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  disabled={isLoading || !keywordInput.trim()}
                >
                  Add
                </button>
              </div>
              
              {formData.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(keyword)}
                        className="text-purple-500 hover:text-purple-700"
                        disabled={isLoading}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={
                isLoading || 
                !formData.title.trim() || 
                !formData.description.trim()
              }
              className="flex items-center px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Campaign...
                </>
              ) : (
                <>
                  Create Campaign
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}