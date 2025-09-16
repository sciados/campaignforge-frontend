// src/components/campaigns/SimplifiedInputsManager.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Link2,
  FileText,
  Upload,
  Package,
  Target,
  BarChart3,
  Globe,
  Check,
  X,
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface InputType {
  id: string;
  type: 'url' | 'text' | 'file' | 'product' | 'analytics';
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  placeholder?: string;
  suggestedFor: string[]; // User types that this input is suggested for
  priority: number; // Lower = higher priority
}

interface CampaignInput {
  id: string;
  type: string;
  label: string;
  value: string;
  status: 'pending' | 'valid' | 'invalid';
  error?: string;
}

interface SimplifiedInputsManagerProps {
  campaignId: string;
  userType: 'affiliate' | 'business' | 'creator' | 'agency' | null;
  onInputsChange: (inputs: CampaignInput[]) => void;
  onAnalyze: () => void;
}

const INPUT_TYPES: InputType[] = [
  {
    id: 'salespage_url',
    type: 'url',
    icon: Globe,
    label: 'Sales/Landing Page URL',
    description: 'The main sales or landing page you\'re promoting',
    placeholder: 'https://example.com/product',
    suggestedFor: ['affiliate', 'business'],
    priority: 1
  },
  {
    id: 'product_description',
    type: 'text',
    icon: Package,
    label: 'Product Details',
    description: 'Detailed description of your product or service',
    placeholder: 'Enter product features, benefits, pricing...',
    suggestedFor: ['business', 'creator'],
    priority: 2
  },
  {
    id: 'competitor_url',
    type: 'url',
    icon: Target,
    label: 'Competitor Page',
    description: 'Competitor sales page or marketing material',
    placeholder: 'https://competitor.com/similar-product',
    suggestedFor: ['business', 'agency'],
    priority: 3
  },
  {
    id: 'existing_content',
    type: 'text',
    icon: FileText,
    label: 'Existing Marketing Copy',
    description: 'Any existing ads, emails, or marketing content',
    placeholder: 'Paste your existing marketing content...',
    suggestedFor: ['business', 'agency', 'creator'],
    priority: 4
  },
  {
    id: 'brand_guidelines',
    type: 'file',
    icon: Upload,
    label: 'Brand Guidelines',
    description: 'Brand guidelines, style guide, or brand assets',
    suggestedFor: ['business', 'agency'],
    priority: 5
  },
  {
    id: 'performance_data',
    type: 'analytics',
    icon: BarChart3,
    label: 'Performance Data',
    description: 'Past campaign performance, analytics, or conversion data',
    placeholder: 'Enter analytics data, conversion rates, performance metrics...',
    suggestedFor: ['business', 'agency'],
    priority: 6
  }
];

export default function SimplifiedInputsManager({
  campaignId,
  userType,
  onInputsChange,
  onAnalyze
}: SimplifiedInputsManagerProps) {
  // Initialize inputs with empty values for all relevant input types
  const [inputs, setInputs] = useState<CampaignInput[]>([]);
  const [validatingInput, setValidatingInput] = useState<string | null>(null);

  // Get input types to display based on user type
  const getRelevantInputTypes = useCallback(() => {
    if (!userType) {
      // Show top priority inputs if no user type
      return INPUT_TYPES.slice(0, 3).sort((a, b) => a.priority - b.priority);
    }

    return INPUT_TYPES
      .filter(inputType => inputType.suggestedFor.includes(userType))
      .sort((a, b) => a.priority - b.priority);
  }, [userType]);

  // Initialize inputs when component mounts or user type changes
  useEffect(() => {
    const relevantInputTypes = getRelevantInputTypes();

    const initialInputs: CampaignInput[] = relevantInputTypes.map(inputType => ({
      id: `${inputType.id}_${Date.now()}`,
      type: inputType.id,
      label: inputType.label,
      value: '',
      status: 'pending' as const
    }));

    setInputs(initialInputs);
    onInputsChange(initialInputs);
  }, [userType, onInputsChange, getRelevantInputTypes]);

  // Update input value with validation
  const updateInput = async (inputId: string, value: string) => {
    setValidatingInput(inputId);

    // Find the input type for validation
    const input = inputs.find(i => i.id === inputId);
    const inputType = INPUT_TYPES.find(t => t.id === input?.type);

    // Simple validation
    let isValid = true;
    let error = '';

    if (value.trim() === '') {
      // Empty is OK - not required
      isValid = true;
    } else if (inputType?.type === 'url') {
      try {
        new URL(value);
      } catch {
        isValid = false;
        error = 'Please enter a valid URL (including https://)';
      }
    }

    const updatedInputs = inputs.map(input =>
      input.id === inputId
        ? {
            ...input,
            value,
            status: isValid ? 'valid' as const : 'invalid' as const,
            error
          }
        : input
    );

    setInputs(updatedInputs);
    onInputsChange(updatedInputs);
    setValidatingInput(null);
  };

  const hasValidInputs = inputs.some(input => input.status === 'valid' && input.value.trim() !== '');
  const hasInvalidInputs = inputs.some(input => input.status === 'invalid');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Campaign Input Sources</h3>
        <p className="text-sm text-gray-600 mt-1">
          Fill in any sources you have to power AI analysis and content generation
          {userType && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <Sparkles className="w-3 h-3 mr-1" />
              {userType} optimized
            </span>
          )}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          You don't need to fill all fields - just add what you have available
        </p>
      </div>

      {/* Input Cards */}
      <div className="space-y-4">
        {inputs.map((input) => {
          const inputType = INPUT_TYPES.find(t => t.id === input.type);
          const Icon = inputType?.icon || FileText;

          return (
            <div
              key={input.id}
              className="border border-gray-200 rounded-lg p-4 space-y-3 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-gray-500" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{input.label}</span>

                    {/* Status indicator */}
                    {validatingInput === input.id ? (
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    ) : input.status === 'valid' && input.value.trim() !== '' ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : input.status === 'invalid' ? (
                      <X className="w-4 h-4 text-red-500" />
                    ) : null}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-500 mt-1">{inputType?.description}</p>
                </div>
              </div>

              {/* Input field */}
              {inputType?.type === 'text' || inputType?.type === 'analytics' ? (
                <textarea
                  value={input.value}
                  onChange={(e) => updateInput(input.id, e.target.value)}
                  placeholder={inputType?.placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
              ) : inputType?.type === 'file' ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    id={`file-${input.id}`}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        updateInput(input.id, file.name);
                      }
                    }}
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                  />
                  <label
                    htmlFor={`file-${input.id}`}
                    className="cursor-pointer block"
                  >
                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {input.value || "Click to upload file"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, DOC, TXT, or image files
                    </p>
                  </label>
                </div>
              ) : (
                <input
                  type="url"
                  value={input.value}
                  onChange={(e) => updateInput(input.id, e.target.value)}
                  placeholder={inputType?.placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}

              {/* Error message */}
              {input.error && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  {input.error}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Analysis Button */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {hasValidInputs ? (
              <span className="text-green-600 font-medium">
                ✓ Ready for analysis
              </span>
            ) : (
              <span>Add at least one input source to analyze</span>
            )}
          </div>

          <button
            onClick={onAnalyze}
            disabled={!hasValidInputs || hasInvalidInputs}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              hasValidInputs && !hasInvalidInputs
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            Analyze Sources
          </button>
        </div>
      </div>
    </div>
  );
}