"use client";

import React, { useState } from "react";
import { X, Mail, MessageSquare, FileText, BarChart3, Image, Edit3, Video, Sparkles, Loader2 } from "lucide-react";
import { useApi } from "@/lib/api";

interface ContentGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  onContentGenerated?: () => void;
}

export default function ContentGenerationModal({
  isOpen,
  onClose,
  campaignId,
  onContentGenerated
}: ContentGenerationModalProps) {
  const api = useApi();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSuccess, setGenerationSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const contentTypes = [
    {
      id: "email_sequence",
      icon: Mail,
      label: "Email Sequence",
      description: "7-email sales psychology sequence",
      color: "text-blue-600 bg-blue-50 hover:bg-blue-100"
    },
    {
      id: "social_post",
      icon: MessageSquare,
      label: "Social Posts",
      description: "Engaging social media content",
      color: "text-green-600 bg-green-50 hover:bg-green-100"
    },
    {
      id: "blog_article",
      icon: FileText,
      label: "Blog Article",
      description: "SEO-optimized long-form content",
      color: "text-purple-600 bg-purple-50 hover:bg-purple-100"
    },
    {
      id: "ad_copy",
      icon: BarChart3,
      label: "Ad Copy",
      description: "Conversion-focused advertisements",
      color: "text-orange-600 bg-orange-50 hover:bg-orange-100"
    },
    {
      id: "image",
      icon: Image,
      label: "Marketing Image",
      description: "AI-generated promotional images",
      color: "text-pink-600 bg-pink-50 hover:bg-pink-100"
    },
    {
      id: "video_script",
      icon: Edit3,
      label: "Video Script",
      description: "Professional video scripts",
      color: "text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
    }
  ];

  const handleGenerate = async () => {
    if (!selectedType) return;

    setIsGenerating(true);
    setGenerationSuccess(false);
    setError(null);

    try {
      // Match the working generate page - let backend fetch user_id/company_id from campaign
      const requestData = {
        campaign_id: campaignId,
        content_type: selectedType,
        target_audience: ""
      };

      console.log("🚀 Generating content with:", requestData);

      // Call integrated content generation API
      const response = await api.generateContent(requestData);

      console.log("✅ Generation response:", response);

      if (!response.success) {
        throw new Error(response.error || "Generation failed");
      }

      setGenerationSuccess(true);

      // Wait a moment to show success, then close
      setTimeout(() => {
        if (onContentGenerated) {
          onContentGenerated();
        }
        onClose();
        setSelectedType(null);
        setGenerationSuccess(false);
        setError(null);
      }, 1500);

    } catch (error) {
      console.error("Generation error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate content";
      setError(errorMessage);

      // Show error for a few seconds, then allow retry
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Generate Content</h2>
              <p className="text-sm text-gray-600">Choose a content type to generate</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contentTypes.map((type) => {
              const IconComponent = type.icon;
              const isSelected = selectedType === type.id;

              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  disabled={isGenerating}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-purple-300"
                  } ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className={`w-12 h-12 ${type.color} rounded-lg flex items-center justify-center mb-3`}>
                    <IconComponent className={`h-6 w-6 ${type.color.split(' ')[0]}`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{type.label}</h3>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </button>
              );
            })}
          </div>

          {/* Generate Button */}
          <div className="mt-6 flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={!selectedType || isGenerating}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : generationSuccess ? (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Success!</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Content</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
