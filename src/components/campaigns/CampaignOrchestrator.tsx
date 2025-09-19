// src/components/campaigns/CampaignOrchestrator.tsx
"use client";

import React, { useState } from 'react';
import { useApi } from '@/lib/api';
import type {
  CampaignGenerationRequest,
  CompleteCampaign,
  CampaignType,
  AutomationLevel
} from '@/lib/types/modular';

interface CampaignOrchestratorProps {
  onCampaignGenerated?: (campaign: CompleteCampaign) => void;
}

const CAMPAIGN_TYPES = [
  {
    id: 'product_launch' as CampaignType,
    name: 'Product Launch',
    description: 'Complete product launch with pre-launch, launch, and post-launch phases',
    icon: '🚀',
    duration: 30,
    platforms: ['facebook', 'instagram', 'twitter', 'email']
  },
  {
    id: 'nurture_sequence' as CampaignType,
    name: 'Nurture Sequence',
    description: 'Educational content series to build trust and drive conversions',
    icon: '🌱',
    duration: 60,
    platforms: ['email', 'linkedin', 'blog']
  },
  {
    id: 're_engagement' as CampaignType,
    name: 'Re-engagement',
    description: 'Win back inactive customers with targeted content',
    icon: '🔄',
    duration: 21,
    platforms: ['email', 'facebook', 'instagram']
  },
  {
    id: 'brand_awareness' as CampaignType,
    name: 'Brand Awareness',
    description: 'Build brand recognition and reach new audiences',
    icon: '📢',
    duration: 45,
    platforms: ['instagram', 'tiktok', 'youtube', 'twitter']
  },
  {
    id: 'sales_conversion' as CampaignType,
    name: 'Sales Conversion',
    description: 'Drive direct sales with targeted promotional content',
    icon: '💰',
    duration: 14,
    platforms: ['facebook', 'instagram', 'email', 'ads']
  }
];

const AUTOMATION_LEVELS = [
  {
    id: 'manual' as AutomationLevel,
    name: 'Manual Review',
    description: 'Generate content and timeline, but require manual approval for each post',
    icon: '👤',
    price: '$0/month'
  },
  {
    id: 'semi_automated' as AutomationLevel,
    name: 'Semi-Automated',
    description: 'Auto-publish safe content, require approval for sensitive posts',
    icon: '⚡',
    price: '+$19/month'
  },
  {
    id: 'fully_automated' as AutomationLevel,
    name: 'Fully Automated',
    description: 'Complete automation with safety checks and monitoring',
    icon: '🤖',
    price: '+$49/month'
  },
  {
    id: 'ai_optimized' as AutomationLevel,
    name: 'AI Optimized',
    description: 'AI continuously optimizes timing, content, and performance',
    icon: '🧠',
    price: '+$99/month'
  }
];

const CampaignOrchestrator: React.FC<CampaignOrchestratorProps> = ({
  onCampaignGenerated
}) => {
  const api = useApi();
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedCampaign, setGeneratedCampaign] = useState<CompleteCampaign | null>(null);

  // Form state
  const [campaignData, setCampaignData] = useState({
    title: '',
    description: '',
    campaign_type: 'product_launch' as CampaignType,
    duration_days: 30,
    platforms: [] as string[],
    automation_level: 'manual' as AutomationLevel,
    target_audience: '',
    key_messages: [] as string[],
    company_id: ''
  });

  const [newKeyMessage, setNewKeyMessage] = useState('');

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const addKeyMessage = () => {
    if (newKeyMessage.trim()) {
      setCampaignData(prev => ({
        ...prev,
        key_messages: [...prev.key_messages, newKeyMessage.trim()]
      }));
      setNewKeyMessage('');
    }
  };

  const removeKeyMessage = (index: number) => {
    setCampaignData(prev => ({
      ...prev,
      key_messages: prev.key_messages.filter((_, i) => i !== index)
    }));
  };

  const togglePlatform = (platform: string) => {
    setCampaignData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  const generateCampaign = async () => {
    try {
      setGenerating(true);
      setError(null);

      const request: CampaignGenerationRequest = {
        title: campaignData.title,
        description: campaignData.description,
        campaign_type: campaignData.campaign_type,
        duration_days: campaignData.duration_days,
        platforms: campaignData.platforms,
        automation_level: campaignData.automation_level,
        target_audience: campaignData.target_audience,
        key_messages: campaignData.key_messages,
        company_id: campaignData.company_id || undefined
      };

      const campaign = await api.generateCompleteCampaign(request);
      setGeneratedCampaign(campaign);
      setStep(5); // Move to results step

      if (onCampaignGenerated) {
        onCampaignGenerated(campaign);
      }

    } catch (err) {
      console.error('Campaign generation failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate campaign');
    } finally {
      setGenerating(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Campaign Basics</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Campaign Title
        </label>
        <input
          type="text"
          value={campaignData.title}
          onChange={(e) => setCampaignData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="e.g., 'New Product Launch Q4 2024'"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Campaign Description
        </label>
        <textarea
          value={campaignData.description}
          onChange={(e) => setCampaignData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe your campaign goals, target audience, and key objectives..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Target Audience
        </label>
        <input
          type="text"
          value={campaignData.target_audience}
          onChange={(e) => setCampaignData(prev => ({ ...prev, target_audience: e.target.value }))}
          placeholder="e.g., 'Tech-savvy millennials interested in productivity tools'"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Key Messages
        </label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={newKeyMessage}
              onChange={(e) => setNewKeyMessage(e.target.value)}
              placeholder="Add a key message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && addKeyMessage()}
            />
            <button
              onClick={addKeyMessage}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          {campaignData.key_messages.map((message, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <span className="flex-1 text-sm">{message}</span>
              <button
                onClick={() => removeKeyMessage(index)}
                className="text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Campaign Type</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CAMPAIGN_TYPES.map((type) => (
          <div
            key={type.id}
            onClick={() => setCampaignData(prev => ({
              ...prev,
              campaign_type: type.id,
              duration_days: type.duration,
              platforms: type.platforms
            }))}
            className={`cursor-pointer p-4 border-2 rounded-lg transition-all ${
              campaignData.campaign_type === type.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{type.icon}</span>
              <div>
                <h4 className="font-semibold text-gray-900">{type.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                <div className="mt-2 flex gap-2">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {type.duration} days
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {type.platforms.length} platforms
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Campaign Duration (days)
        </label>
        <input
          type="number"
          value={campaignData.duration_days}
          onChange={(e) => setCampaignData(prev => ({
            ...prev,
            duration_days: parseInt(e.target.value) || 30
          }))}
          min="1"
          max="365"
          className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Automation Level</h3>

      <div className="space-y-4">
        {AUTOMATION_LEVELS.map((level) => (
          <div
            key={level.id}
            onClick={() => setCampaignData(prev => ({
              ...prev,
              automation_level: level.id
            }))}
            className={`cursor-pointer p-4 border-2 rounded-lg transition-all ${
              campaignData.automation_level === level.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{level.icon}</span>
                <div>
                  <h4 className="font-semibold text-gray-900">{level.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{level.description}</p>
                </div>
              </div>
              <span className="text-sm font-medium text-blue-600">{level.price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Review & Generate</h3>

      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <div>
          <h4 className="font-semibold text-gray-900">Campaign Overview</h4>
          <p className="text-gray-700">{campaignData.title}</p>
          <p className="text-sm text-gray-600">{campaignData.description}</p>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900">Type & Duration</h4>
          <p className="text-gray-700">
            {CAMPAIGN_TYPES.find(t => t.id === campaignData.campaign_type)?.name}
            • {campaignData.duration_days} days
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900">Automation</h4>
          <p className="text-gray-700">
            {AUTOMATION_LEVELS.find(l => l.id === campaignData.automation_level)?.name}
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900">Platforms ({campaignData.platforms.length})</h4>
          <div className="flex flex-wrap gap-2 mt-1">
            {campaignData.platforms.map(platform => (
              <span key={platform} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                {platform}
              </span>
            ))}
          </div>
        </div>

        {campaignData.key_messages.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900">Key Messages</h4>
            <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
              {campaignData.key_messages.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">🚀 What happens next?</h4>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• AI analyzes your campaign requirements</li>
          <li>• Complete content calendar is generated</li>
          <li>• Publishing timeline is optimized for each platform</li>
          <li>• All content is created using your brand intelligence</li>
          <li>• Campaign is ready for review and publishing</li>
        </ul>
      </div>
    </div>
  );

  const renderResults = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🎉</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Campaign Generated Successfully!</h3>
        <p className="text-gray-600">Your complete marketing campaign is ready</p>
      </div>

      {generatedCampaign && (
        <div className="bg-gray-50 p-6 rounded-lg space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900">Campaign Overview</h4>
            <p className="text-gray-700">Campaign ID: {generatedCampaign.campaign_id}</p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900">Content Generated</h4>
            <p className="text-gray-700">
              {generatedCampaign.content.total_pieces} pieces of content across {generatedCampaign.timeline.total_posts} scheduled posts
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900">Estimated Performance</h4>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="bg-white p-3 rounded border">
                <div className="text-2xl font-bold text-blue-600">
                  {generatedCampaign.estimated_performance.estimated_reach.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Estimated Reach</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-2xl font-bold text-green-600">
                  {generatedCampaign.estimated_performance.estimated_engagement.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Estimated Engagement</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={() => {
            setStep(1);
            setGeneratedCampaign(null);
            setCampaignData({
              title: '',
              description: '',
              campaign_type: 'product_launch',
              duration_days: 30,
              platforms: [],
              automation_level: 'manual',
              target_audience: '',
              key_messages: [],
              company_id: ''
            });
          }}
          className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Create Another Campaign
        </button>
        <button
          onClick={() => window.location.href = `/campaigns/${generatedCampaign?.campaign_id}`}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          View Campaign Details
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Campaign Orchestrator
        </h2>
        <p className="text-gray-600">
          Generate complete marketing campaigns with AI-powered content and automated scheduling
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4, 5].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {stepNum}
              </div>
              {stepNum < 5 && (
                <div
                  className={`w-16 h-1 mx-2 ${
                    step > stepNum ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>Basics</span>
          <span>Type</span>
          <span>Automation</span>
          <span>Review</span>
          <span>Results</span>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderResults()}
      </div>

      {/* Navigation */}
      {step < 5 && (
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>

          {step === 4 ? (
            <button
              onClick={generateCampaign}
              disabled={generating || !campaignData.title || !campaignData.description}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? 'Generating Campaign...' : 'Generate Campaign'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={step === 1 && (!campaignData.title || !campaignData.description)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CampaignOrchestrator;