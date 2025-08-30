// src/app/campaigns/create-workflow/components/Step2ContentGeneration.tsx
"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  Mail,
  MessageSquare,
  FileText,
  Video,
  Megaphone,
  ExternalLink,
  BookOpen,
  Check,
  Target,
  Loader2,
  AlertCircle,
  Database,
  Brain,
} from "lucide-react";
import { useApi } from "@/lib/api";
import { GeneratedContent } from "@/lib/types/output";

interface ContentType {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  estimatedTime: string;
  popular: boolean;
}

interface GeneratedContentItem {
  id: string;
  type: string;
  title: string;
  preview: string;
  generated_at: string;
}

interface Step2ContentGenerationProps {
  campaignId: string;
  campaignTitle: string;
  sourcesAnalyzed: number;
  onContentGenerated: () => void;
  analysisComplete: boolean;
  intelligenceEnhanced?: boolean;
  getEnhancedIntelligence?: (campaignId: string) => Promise<any>;
}

// Core AI Tools - Foundation Layer
const TEXT_AI_TOOLS: ContentType[] = [
  {
    id: "email_sequence",
    name: "Email Sequence",
    description: "Multi-email nurture campaign",
    icon: Mail,
    estimatedTime: "2-3 min",
    popular: true,
  },
  {
    id: "ad_copy",
    name: "Ad Copy",
    description: "Paid advertising variations",
    icon: Megaphone,
    estimatedTime: "1-2 min",
    popular: true,
  },
];

const IMAGE_AI_TOOLS: ContentType[] = [
  {
    id: "ai_images",
    name: "AI Images",
    description: "Ultra-cheap image generation ($0.004/image)",
    icon: FileText,
    estimatedTime: "30 sec",
    popular: true,
  },
];

const VIDEO_AI_TOOLS: ContentType[] = [
  {
    id: "ai_videos",
    name: "AI Videos",
    description: "Social media video generation",
    icon: Video,
    estimatedTime: "2-5 min",
    popular: true,
  },
];

// Composite Tools - Built on Foundation
const COMPOSITE_TOOLS: ContentType[] = [
  {
    id: "social_media_campaign",
    name: "Social Media Campaign",
    description: "Text + Images + Videos combined",
    icon: MessageSquare,
    estimatedTime: "5-8 min",
    popular: true,
  },
  {
    id: "blog_post_complete",
    name: "Complete Blog Post",
    description: "Article + custom images",
    icon: FileText,
    estimatedTime: "8-12 min",
    popular: false,
  },
  {
    id: "full_campaign",
    name: "Full Campaign Package",
    description: "Everything: Text + Images + Videos",
    icon: Target,
    estimatedTime: "15-20 min",
    popular: false,
  },
];

export default function Step2ContentGeneration({
  campaignId,
  campaignTitle,
  sourcesAnalyzed,
  onContentGenerated,
  analysisComplete,
  intelligenceEnhanced = false,
  getEnhancedIntelligence,
}: Step2ContentGenerationProps) {
  const api = useApi();
  const [generatedContent, setGeneratedContent] = useState<
    GeneratedContentItem[]
  >([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingType, setGeneratingType] = useState<string | null>(null);

  // Enhanced intelligence integration
  const [intelligenceData, setIntelligenceData] = useState<any>(null);
  const [intelligenceError, setIntelligenceError] = useState<string | null>(
    null
  );
  const [loadingIntelligence, setLoadingIntelligence] = useState(false);

  // Load enhanced intelligence when component mounts
  const loadEnhancedIntelligence = useCallback(async () => {
    if (!getEnhancedIntelligence) return;

    try {
      setLoadingIntelligence(true);
      setIntelligenceError(null);

      console.log("Loading enhanced intelligence for campaign:", campaignId);
      const intelligence = await getEnhancedIntelligence(campaignId);

      console.log("Enhanced intelligence loaded:", {
        sources: intelligence.intelligence_sources?.length || 0,
        enhanced: intelligence.enhancement_applied,
        confidence: intelligence.confidence_score,
      });

      setIntelligenceData(intelligence);
    } catch (error) {
      console.error("Failed to load enhanced intelligence:", error);
      setIntelligenceError(
        error instanceof Error
          ? error.message
          : "Failed to load intelligence data"
      );
    } finally {
      setLoadingIntelligence(false);
    }
  }, [getEnhancedIntelligence, campaignId]);

  useEffect(() => {
    if (getEnhancedIntelligence && analysisComplete) {
      loadEnhancedIntelligence();
    }
  }, [
    campaignId,
    analysisComplete,
    getEnhancedIntelligence,
    loadEnhancedIntelligence,
  ]);

  // Enhanced handleGenerateContent with intelligence context
  const handleGenerateContent = async (contentType: string) => {
    setIsGenerating(true);
    setGeneratingType(contentType);

    try {
      console.log("Generating content:", contentType);

      // Enhanced: Include intelligence data if available
      const generationRequest: any = {
        content_type: contentType,
        campaign_id: campaignId,
        preferences: {
          style: "engaging",
          tone: "professional",
          length: "medium",
        },
      };

      // If enhanced intelligence is available, include it in the request
      if (
        intelligenceData &&
        intelligenceData.intelligence_sources?.length > 0
      ) {
        generationRequest.intelligence_context = {
          confidence_score: intelligenceData.confidence_score,
          enhancement_applied: intelligenceData.enhancement_applied,
          source_count: intelligenceData.intelligence_sources.length,
        };
      }

      const result = await api.generateContent(generationRequest);

      console.log("Content generated:", result);

      const newContent: GeneratedContentItem = {
        id: result.content_id,
        type: contentType,
        title:
          result.generated_content?.title ||
          `Generated ${getContentTitle(contentType)}`,
        preview: getContentPreview(result.generated_content?.content),
        generated_at: new Date().toISOString(),
      };

      setGeneratedContent((prev) => [...prev, newContent]);
      onContentGenerated();
    } catch (error) {
      console.error("Content generation failed:", error);

      let errorMessage = "Unknown error";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      if (errorMessage.includes("No analysis data found")) {
        alert("Please run analysis first by adding a salespage URL in Step 1.");
      } else if (
        errorMessage.includes("Campaign") &&
        errorMessage.includes("not found")
      ) {
        alert("Campaign not found. Please refresh the page and try again.");
      } else {
        alert(`Failed to generate content: ${errorMessage}`);
      }
    } finally {
      setIsGenerating(false);
      setGeneratingType(null);
    }
  };

  const getContentPreview = (content: any): string => {
    if (typeof content === "string") {
      return content.substring(0, 150) + (content.length > 150 ? "..." : "");
    }
    if (Array.isArray(content) && content.length > 0) {
      const firstItem = content[0];
      if (typeof firstItem === "object" && firstItem.text) {
        return firstItem.text.substring(0, 150) + "...";
      }
      if (typeof firstItem === "object" && firstItem.body) {
        return firstItem.body.substring(0, 150) + "...";
      }
    }
    return "Content generated successfully";
  };

  const getContentTitle = (type: string) => {
    const titles: Record<string, string> = {
      email_sequence: "Email Marketing Sequence",
      ad_copy: "Advertisement Copy",
      ai_images: "AI Generated Images",
      ai_videos: "AI Generated Videos",
      social_media_campaign: "Social Media Campaign",
      blog_post_complete: "Complete Blog Post",
      full_campaign: "Full Campaign Package",
    };
    return titles[type] || "Generated Content";
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const generated = new Date(dateString);
    const diffInMinutes = Math.floor(
      (now.getTime() - generated.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes === 1) return "1 minute ago";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    return generated.toLocaleTimeString();
  };

  if (!analysisComplete) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Auto-Analysis in Progress
        </h3>
        <p className="text-gray-600 mb-4">
          Your salespage URL is being analyzed automatically. This usually takes
          1-3 minutes.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
          <div className="text-sm text-blue-700">
            <div className="flex items-center justify-between mb-2">
              <span>Analyzing salespage page...</span>
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full animate-pulse"
                style={{ width: "60%" }}
              ></div>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          Step 2 will unlock automatically when analysis completes
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
          <Sparkles className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Step 2: Generate Content
          </h2>
          <p className="text-gray-600">
            Create marketing content using AI analysis from your salespage
          </p>
        </div>
      </div>

      {/* Campaign Summary - Updated for Streamlined Workflow */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-green-900 mb-1">
          Campaign: {campaignTitle}
        </h3>
        <p className="text-sm text-green-700">
          Auto-analysis complete! Your salespage has been analyzed and
          intelligence extracted. Choose content types below to create your
          marketing materials using the insights.
        </p>
        {sourcesAnalyzed > 0 && (
          <div className="mt-2 flex items-center text-sm text-green-600">
            <Check className="h-4 w-4 mr-1" />
            <span>
              {sourcesAnalyzed} source{sourcesAnalyzed !== 1 ? "s" : ""}{" "}
              analyzed and ready for content generation
            </span>
          </div>
        )}
      </div>

      {/* Enhanced Intelligence Status */}
      {loadingIntelligence ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-blue-800 font-medium">
              Loading enhanced intelligence...
            </span>
          </div>
        </div>
      ) : intelligenceError ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div>
              <div className="font-medium text-yellow-800">
                Intelligence Loading Issue
              </div>
              <div className="text-sm text-yellow-700">{intelligenceError}</div>
              <button
                onClick={loadEnhancedIntelligence}
                className="text-yellow-600 hover:text-yellow-800 text-sm font-medium mt-1"
              >
                Retry Loading
              </button>
            </div>
          </div>
        </div>
      ) : intelligenceData &&
        intelligenceData.intelligence_sources?.length > 0 ? (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Database className="h-5 w-5 text-purple-600 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-2">
                <span className="font-medium text-purple-900">
                  Enhanced Intelligence Available
                </span>
                <span className="text-sm text-purple-700">
                  {Math.round((intelligenceData.confidence_score || 0) * 100)}%
                  confidence
                </span>
                {intelligenceData.enhancement_applied && (
                  <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                    <Brain className="h-3 w-3 mr-1" />
                    AI Enhanced
                  </span>
                )}
              </div>

              <div className="text-sm text-purple-700">
                Intelligence data loaded from{" "}
                {intelligenceData.intelligence_sources.length} source
                {intelligenceData.intelligence_sources.length !== 1 ? "s" : ""}
                {intelligenceData.enhancement_applied
                  ? " with AI enhancement applied"
                  : ""}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Foundation Tools - Core AI */}
      <div className="space-y-8">
        {/* Text AI Tools - Working */}
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Text AI - Foundation Layer
            </h3>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              WORKING
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {TEXT_AI_TOOLS.map((contentType) => {
              const Icon = contentType.icon;
              const isGeneratingThis = generatingType === contentType.id;

              return (
                <button
                  key={contentType.id}
                  onClick={() => handleGenerateContent(contentType.id)}
                  disabled={isGenerating}
                  className="relative p-6 border-2 rounded-lg text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed border-green-200 bg-green-50 hover:border-green-300 hover:bg-green-100"
                >
                  <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                    READY
                  </span>

                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-100">
                      <Icon className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-xs text-gray-500 font-medium">
                      {contentType.estimatedTime}
                    </span>
                  </div>

                  <h4 className="font-semibold text-gray-900 mb-1">
                    {contentType.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    {contentType.description}
                  </p>

                  {isGeneratingThis ? (
                    <div className="flex items-center text-green-600">
                      <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span className="text-sm font-medium">
                        Generating unique content...
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center text-green-600">
                      <Sparkles className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">Generate Now</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Image AI Tools - Next to Build */}
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Image AI - Foundation Layer
            </h3>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              NEXT TO BUILD
            </span>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-blue-900 mb-2">
              Ultra-Cheap Image Generation Ready
            </h4>
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="text-lg font-semibold text-blue-600">
                  $0.004
                </div>
                <div className="text-blue-700">Per image (Stability AI)</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-red-600">$0.040</div>
                <div className="text-red-700">Per image (DALL-E)</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-green-600">90%</div>
                <div className="text-green-700">Cost savings</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-6">
            {IMAGE_AI_TOOLS.map((contentType) => {
              const Icon = contentType.icon;

              return (
                <div
                  key={contentType.id}
                  className="relative p-6 border-2 rounded-lg border-blue-200 bg-blue-50 opacity-75"
                >
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                    IMPLEMENTING
                  </span>

                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-xs text-gray-500 font-medium">
                      {contentType.estimatedTime}
                    </span>
                  </div>

                  <h4 className="font-semibold text-gray-900 mb-1">
                    {contentType.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    {contentType.description}
                  </p>

                  <div className="flex items-center text-blue-600">
                    <span className="text-sm font-medium">
                      Stability API Integration in Progress
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Video AI Tools - After Images */}
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Video className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Video AI - Foundation Layer
            </h3>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
              AFTER IMAGES
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-6">
            {VIDEO_AI_TOOLS.map((contentType) => {
              const Icon = contentType.icon;

              return (
                <div
                  key={contentType.id}
                  className="relative p-6 border-2 rounded-lg border-purple-200 bg-purple-50 opacity-75"
                >
                  <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                    QUEUED
                  </span>

                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-100">
                      <Icon className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="text-xs text-gray-500 font-medium">
                      {contentType.estimatedTime}
                    </span>
                  </div>

                  <h4 className="font-semibold text-gray-900 mb-1">
                    {contentType.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    {contentType.description}
                  </p>

                  <div className="flex items-center text-purple-600">
                    <span className="text-sm font-medium">
                      DeepSeek/MiniMax APIs Ready
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Composite Tools - Future */}
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Target className="h-5 w-5 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Composite Tools - Advanced Layer
            </h3>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
              AFTER FOUNDATION
            </span>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-yellow-900 mb-2">
              Built on Foundation Layer
            </h4>
            <p className="text-sm text-yellow-700">
              These advanced tools combine Text AI + Image AI + Video AI to
              create complete campaigns. Available after all foundation tools
              are working perfectly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {COMPOSITE_TOOLS.map((contentType) => {
              const Icon = contentType.icon;

              return (
                <div
                  key={contentType.id}
                  className="relative p-6 border-2 rounded-lg border-yellow-200 bg-yellow-50 opacity-75"
                >
                  <span className="absolute -top-2 -right-2 bg-yellow-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                    FUTURE
                  </span>

                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-yellow-100">
                      <Icon className="h-5 w-5 text-yellow-600" />
                    </div>
                    <span className="text-xs text-gray-500 font-medium">
                      {contentType.estimatedTime}
                    </span>
                  </div>

                  <h4 className="font-semibold text-gray-900 mb-1">
                    {contentType.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    {contentType.description}
                  </p>

                  <div className="flex items-center text-yellow-600">
                    <span className="text-sm font-medium">
                      Requires All Foundation Tools
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Development Roadmap */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">
            Development Roadmap
          </h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900">
                Phase 1: Text AI Foundation
              </span>
              <span className="text-xs text-green-600 font-medium">
                COMPLETE
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                2
              </div>
              <span className="text-sm font-medium text-gray-900">
                Phase 2: Image AI Foundation
              </span>
              <span className="text-xs text-blue-600 font-medium">
                IN PROGRESS
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                3
              </div>
              <span className="text-sm font-medium text-gray-900">
                Phase 3: Video AI Foundation
              </span>
              <span className="text-xs text-purple-600 font-medium">NEXT</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                4
              </div>
              <span className="text-sm font-medium text-gray-900">
                Phase 4: Composite Tools
              </span>
              <span className="text-xs text-yellow-600 font-medium">
                FUTURE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Content Display */}
      {generatedContent.length > 0 && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Generated Content ({generatedContent.length})
            </h3>
            <button
              onClick={() =>
                window.open(`/campaigns/${campaignId}/content`, "_blank")
              }
              className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              View All Content
              <ExternalLink className="h-4 w-4 ml-1" />
            </button>
          </div>

          <div className="space-y-4">
            {generatedContent.map((content) => {
              const allContentTypes = [
                ...TEXT_AI_TOOLS,
                ...IMAGE_AI_TOOLS,
                ...VIDEO_AI_TOOLS,
                ...COMPOSITE_TOOLS,
              ];
              const contentTypeInfo = allContentTypes.find(
                (t) => t.id === content.type
              );
              const Icon = contentTypeInfo?.icon || FileText;

              return (
                <div
                  key={content.id}
                  className="bg-white border border-gray-200 rounded-lg p-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Icon className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {content.title}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {contentTypeInfo?.name} • Generated{" "}
                          {formatTimeAgo(content.generated_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        <Check className="h-3 w-3 mr-1" />
                        Complete
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {content.preview}
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() =>
                        window.open(
                          `/campaigns/${campaignId}/content`,
                          "_blank"
                        )
                      }
                      className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                    >
                      View & Edit
                    </button>
                    <button
                      onClick={() => handleGenerateContent(content.type)}
                      disabled={isGenerating}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      Generate More
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Campaign Complete */}
      {generatedContent.length > 0 && (
        <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Campaign Complete!
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You&apos;ve successfully created unique marketing content using
              streamlined AI analysis. Access your Content Library to view,
              edit, and manage all generated materials.
            </p>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() =>
                  window.open(`/campaigns/${campaignId}/content`, "_blank")
                }
                className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                <BookOpen className="h-4 w-4 mr-2 inline" />
                Open Content Library
              </button>
              <button
                onClick={() =>
                  window.open("/campaigns/create-workflow", "_blank")
                }
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Create New Campaign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {generatedContent.length === 0 && !isGenerating && (
        <div className="text-center py-12">
          <Sparkles className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Ready to Generate Content
          </h3>
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            Choose a content type above to generate your first marketing
            material using the AI analysis from your salespage.
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-sm mx-auto">
            <p className="text-sm font-medium text-gray-700 mb-1">Pro Tip</p>
            <p className="text-xs text-gray-600">
              Start with Email Sequence or Ad Copy - they generate the fastest
              and work great for testing your audience.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
