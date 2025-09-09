// src/app/campaigns/create-workflow/components/Step2ContentGeneration.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Mail,
  MessageSquare,
  FileText,
  BarChart3,
  CheckCircle,
  Loader2,
  Brain,
  Target,
  Zap,
  ArrowRight,
  Download,
  Eye,
  Copy,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useApi } from "@/lib/api";

interface Step2ContentGenerationProps {
  campaignId: string;
  campaignTitle: string;
  sourcesAnalyzed: number;
  onContentGenerated: () => void;
  analysisComplete: boolean;
  intelligenceEnhanced: boolean;
  getEnhancedIntelligence?: (campaignId: string) => Promise<any>;
}

interface ContentType {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  estimatedTime: string;
  enabled: boolean;
}

interface GeneratedContent {
  id: string;
  type: string;
  title: string;
  content: string;
  preview: string;
  status: "generating" | "completed" | "failed";
  created_at: string;
}

const CONTENT_TYPES: ContentType[] = [
  {
    id: "email_sequence",
    name: "Email Sequence",
    description: "5-email nurture sequence with follow-ups",
    icon: Mail,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    estimatedTime: "60s",
    enabled: true,
  },
  {
    id: "social_posts",
    name: "Social Media Posts",
    description: "Platform-optimized posts for all networks",
    icon: MessageSquare,
    color: "text-green-600",
    bgColor: "bg-green-50",
    estimatedTime: "45s",
    enabled: true,
  },
  {
    id: "blog_post",
    name: "Blog Article",
    description: "SEO-optimized long-form content",
    icon: FileText,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    estimatedTime: "90s",
    enabled: true,
  },
  {
    id: "ad_copy",
    name: "Ad Copy Variations",
    description: "Facebook, Google, and native ad copy",
    icon: BarChart3,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    estimatedTime: "30s",
    enabled: true,
  },
];

export default function Step2ContentGeneration({
  campaignId,
  campaignTitle,
  sourcesAnalyzed,
  onContentGenerated,
  analysisComplete,
  intelligenceEnhanced,
  getEnhancedIntelligence,
}: Step2ContentGenerationProps) {
  const router = useRouter();
  const api = useApi();

  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>(
    []
  );
  const [enhancedIntelligence, setEnhancedIntelligence] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentGeneratingType, setCurrentGeneratingType] = useState<
    string | null
  >(null);

  // Load enhanced intelligence on mount if available
  useEffect(() => {
    if (analysisComplete && intelligenceEnhanced && getEnhancedIntelligence) {
      loadEnhancedIntelligence();
    }
  }, [analysisComplete, getEnhancedIntelligence, intelligenceEnhanced]);

  const loadEnhancedIntelligence = async () => {
    try {
      if (getEnhancedIntelligence) {
        const intelligence = await getEnhancedIntelligence(campaignId);
        setEnhancedIntelligence(intelligence);
      }
    } catch (err) {
      console.error("Failed to load enhanced intelligence:", err);
    }
  };

  const handleTypeToggle = (typeId: string) => {
    setSelectedTypes((prev) =>
      prev.includes(typeId)
        ? prev.filter((id) => id !== typeId)
        : [...prev, typeId]
    );
  };

  const selectAllTypes = () => {
    setSelectedTypes(
      CONTENT_TYPES.filter((type) => type.enabled).map((type) => type.id)
    );
  };

  const clearSelection = () => {
    setSelectedTypes([]);
  };

  const generateContent = async () => {
    if (selectedTypes.length === 0) return;

    setIsGenerating(true);
    setError(null);
    setGenerationProgress(0);
    setGeneratedContent([]);

    try {
      const totalTypes = selectedTypes.length;
      let completedTypes = 0;

      // Generate content for each selected type
      for (const typeId of selectedTypes) {
        setCurrentGeneratingType(typeId);

        // Create placeholder content item
        const placeholderContent: GeneratedContent = {
          id: `temp-${typeId}`,
          type: typeId,
          title: `Generating ${
            CONTENT_TYPES.find((t) => t.id === typeId)?.name
          }...`,
          content: "",
          preview: "Content generation in progress...",
          status: "generating",
          created_at: new Date().toISOString(),
        };

        setGeneratedContent((prev) => [...prev, placeholderContent]);

        try {
          // Call the actual content generation API
          const result = await api.generateContent({
            campaign_id: campaignId,
            content_type: typeId,
            preferences: {
              enhanced_intelligence: intelligenceEnhanced,
              intelligence_data: enhancedIntelligence,
            },
          });

          // Update with actual generated content from your API
          setGeneratedContent((prev) =>
            prev.map((item) =>
              item.id === `temp-${typeId}`
                ? {
                    ...item,
                    id: result.content_id,
                    title: result.generated_content.title,
                    content: result.generated_content.content,
                    preview:
                      typeof result.generated_content.content === "string"
                        ? result.generated_content.content.substring(0, 150) +
                          "..."
                        : result.generated_content.metadata?.preview ||
                          "Content generated successfully",
                    status: "completed" as const,
                  }
                : item
            )
          );
        } catch (err) {
          // Mark as failed
          setGeneratedContent((prev) =>
            prev.map((item) =>
              item.id === `temp-${typeId}`
                ? {
                    ...item,
                    title: `Failed to generate ${
                      CONTENT_TYPES.find((t) => t.id === typeId)?.name
                    }`,
                    preview: `Generation failed: ${
                      err instanceof Error ? err.message : "Unknown error"
                    }`,
                    status: "failed" as const,
                  }
                : item
            )
          );
        }

        completedTypes++;
        setGenerationProgress((completedTypes / totalTypes) * 100);
      }

      setCurrentGeneratingType(null);
      onContentGenerated();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Content generation failed"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const getTypeIcon = (typeId: string) => {
    const type = CONTENT_TYPES.find((t) => t.id === typeId);
    if (!type) return <FileText className="h-5 w-5" />;
    const Icon = type.icon;
    return <Icon className="h-5 w-5" />;
  };

  const getTypeColor = (typeId: string) => {
    const type = CONTENT_TYPES.find((t) => t.id === typeId);
    return type?.color || "text-gray-600";
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Generate Campaign Content
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create high-converting content using AI-enhanced intelligence from
            your analyzed sources.
            {intelligenceEnhanced &&
              " Enhanced with AI amplification for maximum impact."}
          </p>
        </div>

        {/* Intelligence Summary */}
        {analysisComplete && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">
                  Intelligence Analysis Complete
                </h3>
                <p className="text-blue-700">
                  {sourcesAnalyzed} source analyzed •{" "}
                  {intelligenceEnhanced ? "AI Enhanced" : "Standard Analysis"}
                </p>
              </div>
              {intelligenceEnhanced && (
                <div className="ml-auto">
                  <div className="flex items-center space-x-2 bg-purple-100 px-3 py-1 rounded-full">
                    <Zap className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">
                      AI Enhanced
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="text-sm font-medium text-blue-900 mb-1">
                  Campaign
                </div>
                <div className="text-blue-700">{campaignTitle}</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="text-sm font-medium text-blue-900 mb-1">
                  Intelligence Level
                </div>
                <div className="text-blue-700">
                  {intelligenceEnhanced ? "Enhanced" : "Standard"}
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="text-sm font-medium text-blue-900 mb-1">
                  Ready for
                </div>
                <div className="text-blue-700">Content Generation</div>
              </div>
            </div>
          </div>
        )}

        {/* Content Type Selection */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Select Content Types to Generate
            </h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={selectAllTypes}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Select All
              </button>
              <button
                onClick={clearSelection}
                className="text-sm text-gray-600 hover:text-gray-700 font-medium"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {CONTENT_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedTypes.includes(type.id);

              return (
                <button
                  key={type.id}
                  onClick={() => handleTypeToggle(type.id)}
                  disabled={!type.enabled}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  } ${
                    !type.enabled
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`w-12 h-12 ${type.bgColor} rounded-lg flex items-center justify-center`}
                    >
                      <Icon className={`h-6 w-6 ${type.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {type.name}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {type.estimatedTime}
                          </span>
                          {isSelected && (
                            <CheckCircle className="h-5 w-5 text-purple-600" />
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        {type.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Generation Progress */}
        {isGenerating && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center space-x-4 mb-4">
              <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
              <div>
                <h3 className="font-semibold text-blue-900">
                  Generating Content...
                </h3>
                <p className="text-blue-700">
                  {currentGeneratingType
                    ? `Creating ${
                        CONTENT_TYPES.find(
                          (t) => t.id === currentGeneratingType
                        )?.name
                      }...`
                    : "Processing your content generation request"}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">
                  Progress
                </span>
                <span className="text-sm text-blue-700">
                  {Math.round(generationProgress)}%
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Generated Content Preview */}
        {generatedContent.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Generated Content
            </h3>

            <div className="space-y-4">
              {generatedContent.map((content) => (
                <div
                  key={content.id}
                  className="bg-white border border-gray-200 rounded-lg p-6"
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        content.status === "completed"
                          ? "bg-green-100"
                          : content.status === "failed"
                          ? "bg-red-100"
                          : "bg-gray-100"
                      }`}
                    >
                      {content.status === "generating" ? (
                        <Loader2 className="h-5 w-5 text-gray-600 animate-spin" />
                      ) : content.status === "failed" ? (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      ) : (
                        <div className={getTypeColor(content.type)}>
                          {getTypeIcon(content.type)}
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {content.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          {content.status === "completed" && (
                            <>
                              <button className="text-gray-400 hover:text-gray-600">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="text-gray-400 hover:text-gray-600">
                                <Copy className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              content.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : content.status === "failed"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {content.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{content.preview}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            onClick={() => router.push("/campaigns")}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
          >
            Back to Campaigns
          </button>

          <div className="flex items-center space-x-4">
            {selectedTypes.length > 0 && !isGenerating && (
              <div className="text-sm text-gray-600">
                {selectedTypes.length} content type
                {selectedTypes.length !== 1 ? "s" : ""} selected
              </div>
            )}

            {generatedContent.length > 0 && !isGenerating && (
              <button
                onClick={() => router.push(`/campaigns/${campaignId}`)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <CheckCircle className="h-5 w-5" />
                <span>View Campaign</span>
              </button>
            )}

            <button
              onClick={generateContent}
              disabled={selectedTypes.length === 0 || isGenerating}
              className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
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
