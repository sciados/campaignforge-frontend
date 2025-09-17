// src/app/campaigns/[id]/page.tsx - FIXED VERSION
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Settings,
  Eye,
  Download,
  Share2,
  CheckCircle,
  Clock,
  Brain,
  Sparkles,
  FileText,
  Mail,
  MessageSquare,
  BarChart3,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Plus,
  Loader2,
} from "lucide-react";
import { useApi } from "@/lib/api";

interface CampaignDetailPageProps {
  params: {
    id: string;
  };
}

interface Campaign {
  id: string;
  title: string;
  description?: string;
  campaign_type?: string;
  status: string;
  created_at: string;
  keywords?: string[];
  target_audience?: string;
  salespage_url?: string;
  product_name?: string;
  auto_analysis_enabled?: boolean;
}

interface WorkflowState {
  campaign_id: string;
  workflow_state: string;
  completion_percentage: number;
  current_step: number;
  total_steps: number;
  auto_analysis: {
    enabled: boolean;
    status: "pending" | "processing" | "completed" | "failed";
    confidence_score: number;
    error_message?: string;
  };
  can_generate_content: boolean;
  metrics: {
    content_count: number;
    sources_count: number;
    intelligence_count: number;
  };
}

interface GeneratedContent {
  id: string;
  content_type: string;
  content_title: string;
  content_body: string;
  created_at: string;
  is_published: boolean;
}

export default function CampaignDetailPage({
  params,
}: CampaignDetailPageProps) {
  const router = useRouter();
  const api = useApi();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [workflowState, setWorkflowState] = useState<WorkflowState | null>(
    null
  );
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);

  // Load campaign data function - extracted for reuse
  const loadCampaignData = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      // Load campaign details
      const campaignData = await api.getCampaign(params.id);
      setCampaign(campaignData);

      // Load workflow state
      try {
        console.log('🔄 Attempting to load workflow state for campaign:', params.id);
        const workflowData = await api.getWorkflowState(params.id);
        // Map status to allowed union type
        const allowedStatuses = [
          "pending",
          "processing",
          "completed",
          "failed",
        ] as const;
        const mappedStatus = allowedStatuses.includes(
          workflowData.auto_analysis.status as any
        )
          ? (workflowData.auto_analysis.status as
              | "pending"
              | "processing"
              | "completed"
              | "failed")
          : "pending";
        setWorkflowState({
          ...workflowData,
          auto_analysis: {
            ...workflowData.auto_analysis,
            status: mappedStatus,
          },
        });
      } catch (workflowError) {
        console.warn("Workflow state not available:", workflowError);
        console.warn("This is likely the source of the login redirect. Error details:", {
          message: workflowError instanceof Error ? workflowError.message : 'Unknown error',
          error: workflowError
        });
        // Create default workflow state if endpoint doesn't exist
        setWorkflowState({
          campaign_id: params.id,
          workflow_state: "setup_complete",
          completion_percentage: 25, // Step 1 of 4 completed
          current_step: 1,
          total_steps: 4,
          auto_analysis: {
            enabled: false,
            status: "pending",
            confidence_score: 0,
          },
          can_generate_content: false, // Need input sources first
          metrics: {
            content_count: 0,
            sources_count: 0, // No sources added yet
            intelligence_count: 0,
          },
        });
      }

      // TEMPORARILY DISABLED: Load generated content if available
      // This API call was causing login redirects due to backend error: 'list' object has no attribute 'get'
      try {
        console.log('⏸️ getGeneratedContent temporarily disabled due to backend error');
        setGeneratedContent([]);

        // Uncomment when backend is fixed:
        // console.log('🔄 Attempting to load generated content for campaign:', params.id);
        // const contentData = await api.getGeneratedContent(params.id);
        // setGeneratedContent(Array.isArray(contentData) ? contentData : []);
      } catch (contentError) {
        console.warn("Generated content not available:", contentError);
        console.warn("This could be the source of the login redirect. Error details:", {
          message: contentError instanceof Error ? contentError.message : 'Unknown error',
          error: contentError
        });
        setGeneratedContent([]);
      }
    } catch (err) {
      console.error("Error loading campaign data:", err);
      setError(err instanceof Error ? err.message : "Failed to load campaign");
    } finally {
      setIsLoading(false);
    }
  }, [api, params.id]);

  // Load campaign data on component mount
  useEffect(() => {
    if (!params.id) return;

    console.log('🔄 Campaign useEffect running for ID:', params.id);
    loadCampaignData();
  }, [params.id, loadCampaignData]); // Include loadCampaignData in dependencies

  // Generate content (Step 2 of workflow)
  const handleGenerateContent = async () => {
    if (!campaign || !workflowState?.can_generate_content) return;

    setIsGeneratingContent(true);
    setError(null);

    try {
      // Generate multiple content types
      const contentTypes = ["email", "social_post", "blog_post", "ad_copy"];

      for (const contentType of contentTypes) {
        try {
          await api.generateContent({
            campaign_id: params.id,
            content_type: contentType,
            preferences: {
              use_enhanced_intelligence: workflowState.auto_analysis.enabled,
            },
          });
        } catch (contentError) {
          console.warn(`Failed to generate ${contentType}:`, contentError);
        }
      }

      // Refresh data after generation
      await loadCampaignData();
    } catch (err) {
      console.error("Content generation error:", err);
      setError(
        `Content generation failed: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setIsGeneratingContent(false);
    }
  };

  // Retry auto-analysis if failed
  const handleRetryAnalysis = async () => {
    if (!campaign || !campaign.salespage_url) return;

    try {
      setError(null);
      await api.analyzeURL({
        url: campaign.salespage_url,
        campaign_id: params.id,
        analysis_type: "comprehensive",
      });

      // Refresh data after a delay by reloading the page or triggering a re-render
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error("Analysis retry error:", err);
      setError(
        `Analysis retry failed: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  };

  const getWorkflowStepStatus = (step: number) => {
    if (!workflowState) return "pending";

    switch (step) {
      case 1:
        return "completed"; // Setup is always completed if we're viewing the campaign
      case 2:
        // Input Sources step - check if we have sources
        return workflowState.metrics.sources_count > 0 ? "completed" : "pending";
      case 3:
        if (!workflowState.auto_analysis.enabled) return "skipped";
        switch (workflowState.auto_analysis.status) {
          case "completed":
            return "completed";
          case "processing":
            return "active";
          case "failed":
            return "failed";
          default:
            return "pending";
        }
      case 4:
        return workflowState.metrics.content_count > 0
          ? "completed"
          : workflowState.can_generate_content
          ? "ready"
          : "pending";
      default:
        return "pending";
    }
  };

  const getStepIcon = (step: number, status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case "active":
        return <RefreshCw className="h-6 w-6 text-blue-600 animate-spin" />;
      case "ready":
        return <Sparkles className="h-6 w-6 text-purple-600" />;
      case "failed":
        return <AlertCircle className="h-6 w-6 text-red-600" />;
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">{step}</span>
          </div>
        );
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case "email":
      case "email_sequence":
        return <Mail className="h-5 w-5" />;
      case "social_post":
      case "social_posts":
        return <MessageSquare className="h-5 w-5" />;
      case "blog_post":
        return <FileText className="h-5 w-5" />;
      case "ad_copy":
        return <BarChart3 className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading campaign details...</p>
        </div>
      </div>
    );
  }

  if (error && !campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Campaign
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/campaigns")}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
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
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/campaigns")}
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {campaign?.title || "Campaign"}
              </h1>
              <p className="text-sm text-gray-500">
                {campaign?.campaign_type || "Universal"} Campaign •{" "}
                {campaign?.created_at
                  ? new Date(campaign.created_at).toLocaleDateString()
                  : "Recently created"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push(`/campaigns/${params.id}/settings`)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>

            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2">
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* 2-Step Workflow Progress */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Campaign Workflow
              </h2>

              <div className="space-y-6">
                {/* Step 1: Campaign Setup */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getStepIcon(1, getWorkflowStepStatus(1))}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      Campaign Setup
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Basic campaign information and source configuration
                    </p>
                    <div className="mt-2 text-sm text-green-600">
                      Setup complete
                    </div>
                  </div>
                </div>

                {/* Step 2: Input Sources */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getStepIcon(2, getWorkflowStepStatus(2))}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      Input Sources
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Add sales pages, documents, or other source materials
                    </p>

                    {getWorkflowStepStatus(2) === "pending" && (
                      <button
                        onClick={() => router.push(`/campaigns/${params.id}/inputs`)}
                        className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Input Sources</span>
                      </button>
                    )}

                    {getWorkflowStepStatus(2) === "completed" && (
                      <div className="mt-2 text-sm text-green-600">
                        {workflowState?.metrics.sources_count || 0} source(s) added
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 3: Auto-Analysis (if enabled) */}
                {workflowState?.auto_analysis.enabled && (
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getStepIcon(3, getWorkflowStepStatus(3))}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        AI Analysis & Intelligence
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Automatic content analysis and intelligence enhancement
                      </p>

                      {workflowState.auto_analysis.status === "processing" && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center space-x-2">
                            <Brain className="h-4 w-4 text-blue-600" />
                            <span className="text-sm text-blue-700">
                              Analyzing content...
                            </span>
                          </div>
                        </div>
                      )}

                      {workflowState.auto_analysis.status === "completed" && (
                        <div className="mt-3">
                          <div className="text-sm text-green-600">
                            Analysis complete (confidence:{" "}
                            {Math.round(
                              workflowState.auto_analysis.confidence_score * 100
                            )}
                            %)
                          </div>
                        </div>
                      )}

                      {workflowState.auto_analysis.status === "failed" && (
                        <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-red-700">
                              {workflowState.auto_analysis.error_message ||
                                "Analysis failed"}
                            </span>
                            <button
                              onClick={handleRetryAnalysis}
                              className="text-sm text-red-600 hover:text-red-800 font-medium"
                            >
                              Retry
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 4: Content Generation */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getStepIcon(4, getWorkflowStepStatus(4))}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      Content Generation
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Generate emails, social posts, ads, and more
                    </p>

                    {workflowState?.can_generate_content &&
                      workflowState.metrics.content_count === 0 && (
                        <button
                          onClick={handleGenerateContent}
                          disabled={isGeneratingContent || getWorkflowStepStatus(2) === "pending"}
                          className="mt-3 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          {isGeneratingContent ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Generating...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" />
                              <span>Generate Content</span>
                            </>
                          )}
                        </button>
                      )}

                    {getWorkflowStepStatus(2) === "pending" && (
                      <div className="mt-2 text-sm text-amber-600">
                        Add input sources first to enable content generation
                      </div>
                    )}

                    {workflowState?.metrics &&
                      workflowState.metrics.content_count > 0 && (
                        <div className="mt-2 text-sm text-green-600">
                          {workflowState.metrics.content_count} content pieces
                          generated
                        </div>
                      )}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Overall Progress
                  </span>
                  <span className="text-sm text-gray-600">
                    {workflowState?.completion_percentage || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${workflowState?.completion_percentage || 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Generated Content */}
            {generatedContent.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Generated Content
                  </h2>
                  <button
                    onClick={() =>
                      router.push(`/campaigns/${params.id}/content`)
                    }
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    View All
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {generatedContent.slice(0, 4).map((content) => (
                    <div
                      key={content.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                          {getContentIcon(content.content_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {content.content_title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {content.content_body.substring(0, 100)}...
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs text-gray-500">
                              {new Date(
                                content.created_at
                              ).toLocaleDateString()}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                content.is_published
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {content.is_published ? "published" : "draft"}
                            </span>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Campaign Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Campaign Details
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <div
                    className={`mt-1 inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      campaign?.status === "active"
                        ? "bg-green-100 text-green-800"
                        : campaign?.status === "completed"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {campaign?.status || "draft"}
                  </div>
                </div>

                {campaign?.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <p className="mt-1 text-sm text-gray-600">
                      {campaign.description}
                    </p>
                  </div>
                )}

                {campaign?.keywords && campaign.keywords.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Keywords
                    </label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {campaign.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {campaign?.target_audience && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Target Audience
                    </label>
                    <p className="mt-1 text-sm text-gray-600">
                      {campaign.target_audience}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>

              <div className="space-y-3">
                {workflowState?.can_generate_content && (
                  <button
                    onClick={handleGenerateContent}
                    disabled={isGeneratingContent}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Generate More Content</span>
                  </button>
                )}

                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Export Campaign</span>
                </button>

                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>View Analytics</span>
                </button>
              </div>
            </div>

            {/* Source Information */}
            {(campaign?.salespage_url || campaign?.product_name) && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Source Information
                </h3>

                <div className="space-y-3">
                  {campaign.product_name && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Product
                      </label>
                      <p className="mt-1 text-sm text-gray-600">
                        {campaign.product_name}
                      </p>
                    </div>
                  )}

                  {campaign.salespage_url && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Sales Page
                      </label>
                      <a
                        href={campaign.salespage_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 text-sm text-purple-600 hover:text-purple-700 flex items-center space-x-1"
                      >
                        <span className="truncate">
                          {campaign.salespage_url}
                        </span>
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
