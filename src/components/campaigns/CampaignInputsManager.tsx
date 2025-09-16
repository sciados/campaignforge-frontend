// src/components/campaigns/CampaignInputsManager.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
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

interface CampaignInputsManagerProps {
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
    label: 'Salespage URL',
    description: 'The main sales/landing page you\'re promoting',
    placeholder: 'https://example.com/product',
    suggestedFor: ['affiliate', 'business'],
    priority: 1
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
    description: 'Analytics, conversion rates, or performance metrics',
    placeholder: 'Paste analytics data or performance metrics...',
    suggestedFor: ['affiliate', 'business', 'agency'],
    priority: 6
  }
];

export default function CampaignInputsManager({ 
  campaignId, 
  userType, 
  onInputsChange, 
  onAnalyze 
}: CampaignInputsManagerProps) {
  const [inputs, setInputs] = useState<CampaignInput[]>([]);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [validatingInput, setValidatingInput] = useState<string | null>(null);

  // Get suggested input types based on user type
  const getSuggestedInputs = useCallback(() => {
    if (!userType) return INPUT_TYPES;

    const filtered = INPUT_TYPES
      .filter(inputType => inputType.suggestedFor.includes(userType))
      .sort((a, b) => a.priority - b.priority);

    // Fallback to all inputs if filtered result is empty
    return filtered.length > 0 ? filtered : INPUT_TYPES;
  }, [userType]);

  // Get available input types (not yet added)
  const getAvailableInputs = () => {
    const existingTypes = inputs.map(input => input.type);
    const suggested = getSuggestedInputs();
    const available = suggested.filter(inputType =>
      !existingTypes.includes(inputType.id)
    );

    console.log('🔍 Available inputs calculation:', {
      existingTypes,
      suggestedInputs: suggested.map(s => s.id),
      availableInputs: available.map(a => a.id)
    });

    return available;
  };

  // Add new input
  const addInput = useCallback((inputType: InputType) => {
    const newInput: CampaignInput = {
      id: `${inputType.id}_${Date.now()}`,
      type: inputType.id,
      label: inputType.label,
      value: '',
      status: 'pending'
    };

    const updatedInputs = [...inputs, newInput];
    setInputs(updatedInputs);
    onInputsChange(updatedInputs);
    setShowAddMenu(false);
  }, [inputs, onInputsChange]);

  // Update input value
  const updateInput = async (inputId: string, value: string) => {
    setValidatingInput(inputId);
    
    const updatedInputs = inputs.map(input => 
      input.id === inputId 
        ? { ...input, value, status: 'pending' as const, error: undefined }
        : input
    );
    
    setInputs(updatedInputs);
    onInputsChange(updatedInputs);

    // Validate input after a short delay
    setTimeout(() => {
      validateInput(inputId, value);
    }, 500);
  };

  // Validate individual input
  const validateInput = (inputId: string, value: string) => {
    const input = inputs.find(i => i.id === inputId);
    if (!input) return;

    const inputType = INPUT_TYPES.find(t => t.id === input.type);
    let isValid = true;
    let error: string | undefined;

    if (!value.trim()) {
      isValid = false;
      error = 'This field is required';
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
            status: isValid ? 'valid' as const : 'invalid' as const,
            error 
          }
        : input
    );
    
    setInputs(updatedInputs);
    onInputsChange(updatedInputs);
    setValidatingInput(null);
  };

  // Remove input
  const removeInput = (inputId: string) => {
    const updatedInputs = inputs.filter(input => input.id !== inputId);
    setInputs(updatedInputs);
    onInputsChange(updatedInputs);
  };

  // Auto-suggest first input based on user type (temporarily disabled)
  useEffect(() => {
    console.log('🔄 Auto-suggest effect (DISABLED):', { userType, inputsLength: inputs.length });
    // Temporarily disabled to avoid conflicts with modal
    // if (userType && inputs.length === 0) {
    //   const suggestedInputs = INPUT_TYPES
    //     .filter(inputType => inputType.suggestedFor.includes(userType))
    //     .sort((a, b) => a.priority - b.priority);

    //   console.log('📝 Suggested inputs for', userType, ':', suggestedInputs.map(i => i.label));

    //   if (suggestedInputs.length > 0) {
    //     const inputType = suggestedInputs[0];
    //     const newInput: CampaignInput = {
    //       id: `${inputType.id}_${Date.now()}`,
    //       type: inputType.id,
    //       label: inputType.label,
    //       value: '',
    //       status: 'pending'
    //     };

    //     console.log('➕ Adding suggested input:', newInput);

    //     const updatedInputs = [newInput];
    //     setInputs(updatedInputs);
    //     onInputsChange(updatedInputs);
    //   }
    // }
  }, [userType, inputs.length, onInputsChange]);

  const hasValidInputs = inputs.some(input => input.status === 'valid');
  const hasInvalidInputs = inputs.some(input => input.status === 'invalid');

  return (
    <div className="space-y-6">
      {/* Debug Info (temporary - remove after testing) */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
        <strong>Debug Info:</strong> UserType: {userType || 'null'},
        Inputs: {inputs.length},
        Available inputs: {getAvailableInputs().length}
        <br />
        <small className="text-gray-600">
          This debug info will be removed after testing.
        </small>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Campaign Inputs</h3>
          <p className="text-sm text-gray-600 mt-1">
            Add sources for AI analysis and content generation
            {userType && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <Sparkles className="w-3 h-3 mr-1" />
                {userType} recommendations
              </span>
            )}
          </p>
        </div>
        
        <button
          onClick={() => setShowAddMenu(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Input
        </button>
      </div>

      {/* Empty state */}
      {inputs.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No inputs added yet</h4>
          <p className="text-gray-600 mb-4">
            Add your first input source to begin AI analysis
          </p>
          <button
            onClick={() => setShowAddMenu(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Your First Input
          </button>
        </div>
      )}

      {/* Existing Inputs */}
      <div className="space-y-4">
        {inputs.map((input) => {
          const inputType = INPUT_TYPES.find(t => t.id === input.type);
          const Icon = inputType?.icon || FileText;
          
          return (
            <div 
              key={input.id}
              className="border border-gray-200 rounded-lg p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-gray-500" />
                  <span className="font-medium text-gray-900">{input.label}</span>
                  
                  {/* Status indicator */}
                  {validatingInput === input.id ? (
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  ) : input.status === 'valid' ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : input.status === 'invalid' ? (
                    <X className="w-4 h-4 text-red-500" />
                  ) : null}
                </div>
                
                <button
                  onClick={() => removeInput(input.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Input field */}
              {inputType?.type === 'text' || inputType?.type === 'analytics' ? (
                <textarea
                  value={input.value}
                  onChange={(e) => updateInput(input.id, e.target.value)}
                  placeholder={inputType?.placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                />
              ) : inputType?.type === 'file' ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
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
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {input.value || "Click to upload or drag and drop files here"}
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
              
              {/* Description */}
              {inputType?.description && (
                <p className="text-xs text-gray-500">{inputType.description}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Input Menu */}
      {showAddMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Add Input</h4>
              <button
                onClick={() => setShowAddMenu(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              {getAvailableInputs().map((inputType) => {
                const Icon = inputType.icon;
                return (
                  <button
                    key={inputType.id}
                    onClick={() => addInput(inputType)}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="font-medium text-gray-900">{inputType.label}</div>
                        <div className="text-sm text-gray-500">{inputType.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
              
              {/* Fallback: If filtered inputs are empty, show all available inputs */}
              {getAvailableInputs().length === 0 && INPUT_TYPES.filter(inputType =>
                !inputs.map(i => i.type).includes(inputType.id)
              ).length > 0 && (
                <>
                  <div className="border-t border-gray-200 pt-3 mb-3">
                    <p className="text-xs text-gray-500 text-center">All input types:</p>
                  </div>
                  {INPUT_TYPES.filter(inputType =>
                    !inputs.map(i => i.type).includes(inputType.id)
                  ).map((inputType) => {
                    const Icon = inputType.icon;
                    return (
                      <button
                        key={inputType.id}
                        onClick={() => addInput(inputType)}
                        className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-gray-500" />
                          <div>
                            <div className="font-medium text-gray-900">{inputType.label}</div>
                            <div className="text-sm text-gray-500">{inputType.description}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </>
              )}

              {/* Show message only when truly no inputs are available */}
              {INPUT_TYPES.filter(inputType =>
                !inputs.map(i => i.type).includes(inputType.id)
              ).length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  All input types have been added
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Analysis Button */}
      {hasValidInputs && (
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={onAnalyze}
            disabled={hasInvalidInputs}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              hasInvalidInputs
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Run AI Analysis
          </button>
        </div>
      )}
    </div>
  );
}