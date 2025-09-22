// src/app/campaigns/[id]/page.tsx
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
  FileDown,
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
  const [intelligenceCount, setIntelligenceCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastLoadTime, setLastLoadTime] = useState(0);
  const [activeTab, setActiveTab] = useState<number>(1);

  // Rate limiting helper - prevent rapid retries
  const shouldAllowRequest = useCallback(() => {
    const now = Date.now();
    const timeSinceLastLoad = now - lastLoadTime;
    const minDelay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s, 8s...

    console.log('🔍 Rate limiting check:', {
      timeSinceLastLoad,
      minDelay,
      retryCount,
      shouldAllow: timeSinceLastLoad >= minDelay
    });

    return timeSinceLastLoad >= minDelay;
  }, [lastLoadTime, retryCount]);

  // Load campaign data function - extracted for reuse
  const loadCampaignData = useCallback(async () => {
    // Rate limiting check - prevent infinite loops
    if (!shouldAllowRequest()) {
      console.log('🚫 Request blocked by rate limiting - waiting for backoff period');
      return;
    }

    setLastLoadTime(Date.now());

    try {
      setError(null);
      setIsLoading(true);

      // Load campaign details
      const campaignData = await api.getCampaign(params.id);
      setCampaign(campaignData);

      // Load workflow state
      try {
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

      // Load generated content if available
      try {
        const contentData = await api.getGeneratedContent(params.id);
        setGeneratedContent(Array.isArray(contentData) ? contentData : []);
        setRetryCount(0); // Reset retry count on success
      } catch (contentError) {
        console.warn("Generated content not available:", contentError);

        // Check if it's a rate limit error (500 status)
        if (contentError instanceof Error && contentError.message.includes('500')) {
          console.error('🚨 500 Server Error - likely rate limiting. Increasing retry count.');
          setRetryCount(prev => Math.min(prev + 1, 5)); // Max 5 retries (32 second max delay)
          setError(`Server temporarily overloaded. Retrying in ${Math.pow(2, retryCount + 1)} seconds...`);
        } else {
          console.warn("Content error details:", {
            message: contentError instanceof Error ? contentError.message : 'Unknown error',
            error: contentError
          });
          setGeneratedContent([]);
        }
      }

      // Load intelligence count directly (for legacy campaigns where workflowState doesn't have correct count)
      try {
        const intelligenceData = await api.getCampaignIntelligence(params.id);
        const count = Array.isArray(intelligenceData) ? intelligenceData.length : 0;
        setIntelligenceCount(count);
      } catch (intelligenceError) {
        console.warn("Intelligence data not available:", intelligenceError);
        setIntelligenceCount(0);
      }

      setRetryCount(0); // Reset retry count for successful campaign/workflow loads
    } catch (err) {
      console.error("Error loading campaign data:", err);
      setError(err instanceof Error ? err.message : "Failed to load campaign");
    } finally {
      setIsLoading(false);
    }
  }, [api, params.id, retryCount, shouldAllowRequest]);

  // Load campaign data on component mount
  useEffect(() => {
    if (!params.id) return;

    loadCampaignData();
    // Note: Deliberately NOT including loadCampaignData in dependencies to prevent infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]); // Only re-run when campaign ID changes

  // Define getWorkflowStepStatus function before using it
  const getWorkflowStepStatus = useCallback((step: number): "pending" | "in_progress" | "completed" | "ready" | "active" | "failed" => {
    if (!workflowState) return "pending";

    switch (step) {
      case 1:
        return "completed"; // Setup is always completed if we're viewing the campaign
      case 2:
        // Input Sources step - if we have any intelligence data, input sources must have been provided
        // Since analysis completed automatically, Step 2 is completed when intelligence exists
        const hasIntelligenceData = workflowState.metrics.intelligence_count > 0 || intelligenceCount > 0;
        const hasDirectInputs = workflowState.metrics.sources_count > 0 || campaign?.salespage_url;
        const autoAnalysisCompleted = workflowState.auto_analysis.enabled && workflowState.auto_analysis.status === "completed";
        return (hasIntelligenceData || hasDirectInputs || autoAnalysisCompleted) ? "completed" : "pending";
      case 3:
        // Analysis step - if we have intelligence data OR auto-analysis completed, analysis is done
        if (workflowState.auto_analysis.enabled) {
          switch (workflowState.auto_analysis.status) {
            case "completed":
              return "completed";
            case "processing":
              return "active";
            case "failed":
              return "failed";
            default:
              // If we have intelligence data but auto-analysis shows pending, it was completed previously
              return (workflowState.metrics.intelligence_count > 0 || intelligenceCount > 0) ? "completed" : "pending";
          }
        } else {
          // Manual analysis or legacy campaigns - check if intelligence data exists
          return (workflowState.metrics.intelligence_count > 0 || intelligenceCount > 0) ? "completed" : "pending";
        }
      case 4:
        // Content Generation - depends on intelligence being available
        const step3Complete = getWorkflowStepStatus(3) === "completed";
        return workflowState.metrics.content_count > 0
          ? "completed"
          : step3Complete
          ? "ready"
          : "pending";
      default:
        return "pending";
    }
  }, [workflowState, intelligenceCount, campaign?.salespage_url]);

  // Auto-set active tab based on workflow progress
  useEffect(() => {
    if (!workflowState) return;

    // Determine the appropriate active tab
    const step1Status = getWorkflowStepStatus(1);
    const step2Status = getWorkflowStepStatus(2);
    const step3Status = getWorkflowStepStatus(3);
    const step4Status = getWorkflowStepStatus(4);

    if (step4Status === "ready" || step4Status === "completed") {
      setActiveTab(4);
    } else if (step3Status === "active" || step3Status === "completed") {
      setActiveTab(3);
    } else if (step2Status === "completed") {
      setActiveTab(3); // Move to analysis tab when URL is submitted
    } else if (step1Status === "completed") {
      setActiveTab(2); // Move to source input tab after setup
    } else {
      setActiveTab(1);
    }
  }, [workflowState, intelligenceCount, getWorkflowStepStatus]);

  // Generate content using Universal Sales Engine (Step 4 of workflow)
  const handleGenerateContent = async () => {
    if (!campaign || getWorkflowStepStatus(3) !== "completed") return;

    setIsGeneratingContent(true);
    setError(null);

    try {
      // Use the Universal Sales Engine to generate sales-focused content
      const contentTypes = [
        { type: "email", format: "EMAIL" },
        { type: "social_post", format: "SOCIAL_POST" },
        { type: "blog_post", format: "BLOG_POST" },
        { type: "ad_copy", format: "AD_COPY" }
      ];

      for (const { type, format } of contentTypes) {
        try {
          // Try the new Universal Sales Engine endpoint first
          try {
            await api.post('/content/universal/generate', {
              campaign_id: params.id,
              format: format,
              psychology_stage: 'AWARENESS', // Default to awareness stage
              specific_requirements: {
                content_length: 'medium',
                tone: 'professional',
                include_cta: true
              }
            });
          } catch (universalError) {
            // Fallback to legacy content generation if Universal Engine not available
            console.warn(`Universal Engine not available for ${type}, falling back to legacy:`, universalError);
            await api.generateContent({
              campaign_id: params.id,
              content_type: type,
              preferences: {
                use_enhanced_intelligence: workflowState?.auto_analysis.enabled || false,
                sales_focused: true, // Ensure all content is sales-focused
              },
            });
          }
        } catch (contentError) {
          console.warn(`Failed to generate ${type}:`, contentError);
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

  // Generate comprehensive PDF report
  const handleGenerateReport = async () => {
    if (!campaign || getWorkflowStepStatus(3) !== "completed") return;

    setIsGeneratingReport(true);
    setError(null);

    try {
      // Request PDF report generation from backend
      const response = await api.post(`/intelligence/campaigns/${params.id}/report`, {
        format: 'pdf',
        include_sections: [
          'executive_summary',
          'product_analysis',
          'target_audience',
          'competition_analysis',
          'marketing_strategy',
          'content_recommendations',
          'sales_psychology',
          'conversion_opportunities',
          'actionable_insights'
        ]
      });

      // Handle different response formats
      if (response.data && response.data.download_url) {
        // If backend returns a download URL
        window.open(response.data.download_url, '_blank');
      } else if (response.data && response.data.pdf_data) {
        // If backend returns base64 PDF data
        const blob = new Blob([atob(response.data.pdf_data)], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${campaign.title}_Intelligence_Report.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        // If response is the PDF blob directly
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${campaign.title}_Intelligence_Report.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }

    } catch (err) {
      console.error("Report generation error:", err);
      setError(
        `Report generation failed: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const calculateDynamicProgress = () => {
    if (!workflowState) return 0;

    let completedSteps = 0;
    const totalSteps = 4;

    // Count completed steps
    for (let i = 1; i <= totalSteps; i++) {
      const status = getWorkflowStepStatus(i);
      if (status === "completed") {
        completedSteps++;
      }
    }

    return Math.round((completedSteps / totalSteps) * 100);
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

  const getTabClasses = (tabNumber: number) => {
    const status = getWorkflowStepStatus(tabNumber);
    const isActive = activeTab === tabNumber;
    const isClickable = status === "completed" || isActive;

    if (isActive) {
      return "bg-green-600 text-white border-green-600 shadow-lg"; // Active = Green
    } else if (status === "completed") {
      return "bg-purple-600 text-white border-purple-600 cursor-pointer hover:bg-purple-700"; // Completed = Purple
    } else if (status === "pending") {
      return "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"; // Pending = Gray
    } else if (status === "active") {
      return "bg-blue-100 text-blue-700 border-blue-300 animate-pulse"; // Processing = Blue
    } else {
      return "bg-gray-50 text-gray-500 border-gray-200"; // Default
    }
  };

  const isTabClickable = (tabNumber: number) => {
    const status = getWorkflowStepStatus(tabNumber);
    return status === "completed" || activeTab === tabNumber || activeTab > tabNumber;
  };

  const handleTabClick = (tabNumber: number) => {
    if (isTabClickable(tabNumber)) {
      setActiveTab(tabNumber);
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
            {/* Tab-Based Workflow */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Campaign Workflow
              </h2>

              {/* Tab Navigation */}
              <div className="flex space-x-2 mb-6 overflow-x-auto">
                {[1, 2, 3, 4].map((tabNumber) => {
                  const status = getWorkflowStepStatus(tabNumber);
                  const isActive = activeTab === tabNumber;
                  const tabLabels = ["Setup", "Source", "Analysis", "Content"];

                  return (
                    <button
                      key={tabNumber}
                      onClick={() => handleTabClick(tabNumber)}
                      disabled={!isTabClickable(tabNumber)}
                      className={`flex items-center space-x-2 px-4 py-3 rounded-lg border-2 font-medium text-sm transition-all duration-200 whitespace-nowrap min-w-0 ${getTabClasses(tabNumber)}`}
                    >
                      <span className="w-6 h-6 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-xs font-bold">
                        {tabNumber}
                      </span>
                      <span>{tabLabels[tabNumber - 1]}</span>
                      {status === "completed" && !isActive && (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      {status === "active" && (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Progress Bar */}
              <div className="mb-6 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-600 to-green-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${calculateDynamicProgress()}%`,
                  }}
                />
              </div>

              {/* Tab Content */}
              <div className="min-h-[300px]">
                {activeTab === 1 && (
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">Campaign Setup Complete</h3>
                        <p className="text-gray-600 mt-1">
                          Your campaign has been created and configured successfully.
                        </p>
                        <div className="mt-4 p-4 bg-green-50 rounded-lg">
                          <div className="text-sm text-green-800">
                            ✅ Campaign: {campaign?.title}<br/>
                            ✅ Type: {campaign?.campaign_type || "Universal"}<br/>
                            ✅ Created: {campaign?.created_at ? new Date(campaign.created_at).toLocaleDateString() : "Recently"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getWorkflowStepStatus(2) === "completed" ? "bg-purple-100" : "bg-blue-100"}`}>
                        {getStepIcon(2, getWorkflowStepStatus(2))}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">Input Source URL</h3>
                        <p className="text-gray-600 mt-1">
                          Provide your sales page URL for AI analysis and intelligence extraction.
                        </p>

                        {getWorkflowStepStatus(2) === "pending" && (
                          <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-5 w-5 text-amber-600" />
                              <span className="text-sm text-amber-700 font-medium">
                                Please provide a URL to continue
                              </span>
                            </div>
                            <p className="text-xs text-amber-600 mt-2">
                              The URL should point to your sales page, landing page, or product page for analysis.
                            </p>
                          </div>
                        )}

                        {getWorkflowStepStatus(2) === "completed" && (
                          <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="h-5 w-5 text-purple-600" />
                              <span className="text-sm text-purple-700 font-medium">
                                URL submitted successfully
                              </span>
                            </div>
                            {campaign?.salespage_url && (
                              <div className="mt-2 text-xs text-gray-600">
                                Source: {campaign.salespage_url}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 3 && (
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getWorkflowStepStatus(3) === "completed" ? "bg-purple-100" : getWorkflowStepStatus(3) === "active" ? "bg-blue-100" : "bg-gray-100"}`}>
                        {getStepIcon(3, getWorkflowStepStatus(3))}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">AI Analysis</h3>
                        <p className="text-gray-600 mt-1">
                          Advanced AI analysis extracts sales intelligence from your source URL automatically.
                        </p>

                        {getWorkflowStepStatus(2) !== "completed" && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-5 w-5 text-gray-500" />
                              <span className="text-sm text-gray-600">
                                Waiting for URL input to start analysis
                              </span>
                            </div>
                          </div>
                        )}

                        {workflowState?.auto_analysis.enabled && workflowState.auto_analysis.status === "processing" && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center space-x-2">
                              <Brain className="h-5 w-5 text-blue-600" />
                              <span className="text-sm text-blue-700 font-medium">
                                Analyzing content...
                              </span>
                            </div>
                            <div className="mt-3">
                              <div className="bg-blue-200 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                              </div>
                              <p className="text-xs text-blue-600 mt-2">
                                Extracting sales intelligence, product details, target audience, and conversion strategies...
                              </p>
                            </div>
                          </div>
                        )}

                        {getWorkflowStepStatus(3) === "completed" && (
                          <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="h-5 w-5 text-purple-600" />
                              <span className="text-sm text-purple-700 font-medium">
                                Analysis completed successfully
                              </span>
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                              {workflowState?.metrics.intelligence_count || intelligenceCount} intelligence insights extracted
                              {workflowState?.auto_analysis.enabled && workflowState.auto_analysis.confidence_score && (
                                <span className="ml-2">
                                  (Confidence: {Math.round(workflowState.auto_analysis.confidence_score * 100)}%)
                                </span>
                              )}
                            </div>
                            <div className="mt-3 text-xs text-blue-600">
                              💡 Tip: Download the comprehensive intelligence report from the sidebar to get detailed marketing strategies and actionable insights.
                            </div>
                          </div>
                        )}

                        {workflowState?.auto_analysis.enabled && workflowState.auto_analysis.status === "failed" && (
                          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-red-700">
                                {workflowState.auto_analysis.error_message || "Analysis failed"}
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
                  </div>
                )}

                {activeTab === 4 && (
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getWorkflowStepStatus(4) === "completed" ? "bg-purple-100" : getWorkflowStepStatus(4) === "ready" ? "bg-green-100" : "bg-gray-100"}`}>
                        {getStepIcon(4, getWorkflowStepStatus(4))}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Universal Sales Content Generation
                          {getWorkflowStepStatus(3) === "completed" && getWorkflowStepStatus(4) !== "completed" && (
                            <span className="ml-2 px-2 py-1 text-xs bg-green-600 text-white rounded-full">
                              READY
                            </span>
                          )}
                        </h3>
                        <p className="text-gray-600 mt-1">
                          Generate sales-focused emails, social posts, ads, videos, and more using the Universal Sales Engine with advanced psychology principles.
                        </p>

                        {getWorkflowStepStatus(3) !== "completed" && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-5 w-5 text-gray-500" />
                              <span className="text-sm text-gray-600">
                                Complete analysis first to enable content generation
                              </span>
                            </div>
                          </div>
                        )}

                        {getWorkflowStepStatus(3) === "completed" && (
                          <div className="mt-4">
                            {workflowState?.metrics.content_count === 0 ? (
                              <div className="space-y-4">
                                <div className="p-4 bg-gradient-to-r from-green-50 to-purple-50 rounded-lg border border-green-200">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <Sparkles className="h-5 w-5 text-green-600" />
                                    <span className="text-sm text-green-700 font-medium">
                                      Ready to generate content!
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600">
                                    Generate emails, videos, images, social posts, ads & more with sales psychology
                                  </p>
                                </div>
                                <button
                                  onClick={handleGenerateContent}
                                  disabled={isGeneratingContent}
                                  className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-purple-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg transition-all"
                                >
                                  {isGeneratingContent ? (
                                    <>
                                      <Loader2 className="h-5 w-5 animate-spin" />
                                      <span>Generating Universal Sales Content...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="h-5 w-5" />
                                      <span>Generate Universal Sales Content</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                  <div className="flex items-center space-x-2">
                                    <CheckCircle className="h-5 w-5 text-purple-600" />
                                    <span className="text-sm text-purple-700 font-medium">
                                      {workflowState?.metrics.content_count || 0} content pieces generated
                                    </span>
                                  </div>
                                </div>
                                <button
                                  onClick={handleGenerateContent}
                                  disabled={isGeneratingContent}
                                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                >
                                  {isGeneratingContent ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      <span>Generating...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="h-4 w-4" />
                                      <span>Generate More Content</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
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

                {/* Intelligence Report Download */}
                {getWorkflowStepStatus(3) === "completed" && (
                  <button
                    onClick={handleGenerateReport}
                    disabled={isGeneratingReport}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                  >
                    {isGeneratingReport ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <FileDown className="h-4 w-4" />
                        <span>Download Report</span>
                      </>
                    )}
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
