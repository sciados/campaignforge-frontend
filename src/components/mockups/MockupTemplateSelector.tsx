"use client";

import React, { useState, useEffect } from 'react';
import { useApi } from '@/lib/api';
import { Loader2, Sparkles, Lock, Image as ImageIcon } from 'lucide-react';

interface MockupTemplate {
  uuid: string;
  name: string;
  description: string;
  category: string;
  preview_url?: string;
  smart_objects?: Array<{
    uuid: string;
    name: string;
  }>;
}

interface TierLimits {
  allowed: boolean;
  monthly_limit: number;
  cost_per_additional?: number;
  message: string;
}

interface MockupTemplateSelectorProps {
  imageUrl: string;
  onMockupGenerated: (mockupUrl: string, cost: number) => void;
  onClose: () => void;
}

export default function MockupTemplateSelector({
  imageUrl,
  onMockupGenerated,
  onClose
}: MockupTemplateSelectorProps) {
  const api = useApi();
  const [templates, setTemplates] = useState<MockupTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('supplement');
  const [selectedTemplate, setSelectedTemplate] = useState<MockupTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [userTier, setUserTier] = useState<string>('FREE');
  const [tierLimits, setTierLimits] = useState<TierLimits | null>(null);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { value: 'supplement', label: 'Supplement Bottles', icon: '💊' },
    { value: 'lifestyle', label: 'Lifestyle Scenes', icon: '🏋️' },
    { value: 'packaging', label: 'Product Packaging', icon: '📦' },
  ];

  useEffect(() => {
    fetchTemplatesAndTierInfo();
  }, [selectedCategory]);

  const fetchTemplatesAndTierInfo = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch templates for selected category
      console.log('Fetching mockup templates for category:', selectedCategory);
      const response = await api.get(`/api/content/mockups/templates?category=${selectedCategory}`);

      console.log('Mockup templates response:', response);
      console.log('Response data:', response.data);
      console.log('Response status:', response.status);

      if (response?.data?.success) {
        setTemplates(response.data.templates || []);
        setUserTier(response.data.user_tier);
        setTierLimits(response.data.tier_limits);
        console.log('Templates loaded:', response.data.templates?.length || 0);
        console.log('User tier:', response.data.user_tier);
        console.log('Tier limits:', response.data.tier_limits);
      } else {
        console.error('Response success was false or undefined:', response?.data);
        setError('Failed to load mockup templates');
      }
    } catch (err: any) {
      console.error('Error fetching templates:', err);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      setError(err.response?.data?.detail || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMockup = async () => {
    if (!selectedTemplate) return;

    // Check tier access
    if (!tierLimits?.allowed) {
      setError('Professional mockups require PRO or ENTERPRISE tier. Please upgrade.');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const response = await api.post('/api/content/mockups/generate', {
        image_url: imageUrl,
        mockup_uuid: selectedTemplate.uuid,
        smart_object_uuid: selectedTemplate.smart_objects?.[0]?.uuid,
      });

      if (response.data.success) {
        onMockupGenerated(response.data.mockup_url, response.data.cost);
        onClose();
      } else if (response.data.upgrade_required) {
        setError(response.data.error);
      } else {
        setError('Failed to generate mockup');
      }
    } catch (err: any) {
      console.error('Error generating mockup:', err);
      setError(err.response?.data?.detail || 'Failed to generate mockup');
    } finally {
      setGenerating(false);
    }
  };

  const isLocked = !tierLimits?.allowed;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                Professional Mockup Generator
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Transform your design into photo-realistic product mockups
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Tier Info Banner */}
          {tierLimits && (
            <div className={`mt-3 px-4 py-2 rounded-lg text-sm ${
              tierLimits.allowed
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-medium">{userTier} Tier: {tierLimits.message}</span>
                {!tierLimits.allowed && (
                  <button className="text-xs bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700">
                    Upgrade Now
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Category Tabs */}
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === cat.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : error && templates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No templates available in this category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <button
                  key={template.uuid}
                  onClick={() => !isLocked && setSelectedTemplate(template)}
                  disabled={isLocked}
                  className={`relative border-2 rounded-lg p-4 text-left transition-all ${
                    selectedTemplate?.uuid === template.uuid
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 bg-white'
                  } ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {/* Lock Overlay for non-PRO users */}
                  {isLocked && (
                    <div className="absolute inset-0 bg-gray-900/10 rounded-lg flex items-center justify-center">
                      <div className="bg-white rounded-full p-3 shadow-lg">
                        <Lock className="w-6 h-6 text-gray-600" />
                      </div>
                    </div>
                  )}

                  {/* Template Preview */}
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center">
                    {template.preview_url ? (
                      <img
                        src={template.preview_url}
                        alt={template.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>

                  {/* Template Info */}
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">
                      {template.name}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {template.description}
                    </p>
                  </div>

                  {/* Selected Indicator */}
                  {selectedTemplate?.uuid === template.uuid && !isLocked && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Generate Button */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          {error && (
            <div className="mb-3 px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedTemplate ? (
                <>
                  <span className="font-medium text-gray-900">Selected:</span> {selectedTemplate.name}
                </>
              ) : (
                'Select a template to continue'
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                Cancel
              </button>

              <button
                onClick={handleGenerateMockup}
                disabled={!selectedTemplate || generating || isLocked}
                className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 ${
                  !selectedTemplate || generating || isLocked
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : isLocked ? (
                  <>
                    <Lock className="w-4 h-4" />
                    Upgrade Required
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Mockup
                    {tierLimits?.cost_per_additional && tierLimits.monthly_limit > 0 && (
                      <span className="text-xs opacity-80">
                        (~${tierLimits.cost_per_additional})
                      </span>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
