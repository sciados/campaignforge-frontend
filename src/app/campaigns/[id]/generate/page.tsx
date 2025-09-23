// src/app/campaigns/[id]/generate/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Settings,
  Share2,
  CheckCircle,
  Sparkles,
  FileText,
  Mail,
  MessageSquare,
  BarChart3,
  AlertCircle,
  RefreshCw,
  Plus,
  Loader2,
  FileDown,
  Brain,
} from "lucide-react";
import { useApi } from "@/lib/api";
import { useRightSidebar } from "@/contexts/RightSidebarContext";

interface ContentGenerationPageProps {
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

export default function ContentGenerationPage({ params }: ContentGenerationPageProps) {
  const router = useRouter();
  const api = useApi();
  const { setContent, setIsVisible } = useRightSidebar();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [workflowState, setWorkflowState] = useState<WorkflowState | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [intelligenceCount, setIntelligenceCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Load campaign data
  useEffect(() => {
    const loadCampaignData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load campaign and workflow data
        const [campaignResponse, workflowResponse] = await Promise.all([
          api.getCampaign(params.id),
          api.getWorkflowState(params.id)
        ]);

        setCampaign(campaignResponse);
        setWorkflowState(workflowResponse);

        // Load generated content
        try {
          const contentResponse = await api.getGeneratedContent(params.id);
          setGeneratedContent(Array.isArray(contentResponse) ? contentResponse : []);
        } catch (err) {
          console.log("No generated content found yet");
          setGeneratedContent([]);
        }

        // Load intelligence count
        try {
          const intelligenceResponse = await api.getCampaignIntelligence(params.id);
          setIntelligenceCount(intelligenceResponse?.length || 0);
        } catch (err) {
          console.log("No intelligence analysis found");
          setIntelligenceCount(0);
        }

      } catch (err) {
        console.error("Failed to load campaign data:", err);
        setError("Failed to load campaign information");
      } finally {
        setIsLoading(false);
      }
    };

    loadCampaignData();
  }, [params.id, api]);

  // Set right sidebar content
  useEffect(() => {
    const sidebarContent = (
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Generated Content</h3>
            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {generatedContent.length} items
            </span>
          </div>

          {generatedContent.length > 0 ? (
            <div className="space-y-3">
              {generatedContent.slice(0, 5).map((content) => (
                <div
                  key={content.id}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {content.content_title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {content.content_type} • {new Date(content.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {content.is_published && (
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
              {generatedContent.length > 5 && (
                <button className="w-full text-center text-purple-600 hover:text-purple-700 text-sm font-medium py-2">
                  View All ({generatedContent.length})
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No content generated yet</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => router.push(`/campaigns/${params.id}/inputs`)}
              className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              ← Back to Analysis
            </button>
            <button
              onClick={() => router.push("/campaigns")}
              className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              All Campaigns
            </button>
          </div>
        </div>
      </div>
    );

    setContent(sidebarContent);
    setIsVisible(true);

    return () => {
      setIsVisible(false);
    };
  }, [generatedContent, setContent, setIsVisible, router, params.id]);

  // Generate content
  const handleGenerateContent = async (contentType: string) => {
    if (!campaign || !workflowState?.can_generate_content) return;

    setIsGeneratingContent(true);
    setError(null);

    try {
      const response = await api.generateContent({
        campaign_id: params.id,
        content_type: contentType,
        target_audience: campaign.target_audience || "",
      });

      if (response.success) {
        // Refresh generated content
        const contentResponse = await api.getGeneratedContent(params.id);
        setGeneratedContent(Array.isArray(contentResponse) ? contentResponse : []);
      } else {
        throw new Error(response.error || "Content generation failed");
      }
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

  // Generate PDF report
  const handleGenerateReport = async () => {
    if (!campaign) return;

    setIsGeneratingReport(true);
    setError(null);

    try {
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
        window.open(response.data.download_url, '_blank');
      } else if (response.data && response.data.pdf_data) {
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
      setError(`Report generation failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const canGenerateContent = workflowState?.can_generate_content || intelligenceCount > 0;

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push(`/campaigns/${params.id}/inputs`)}
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {campaign?.title || "Campaign"} - Content Generation
              </h1>
              <p className="text-gray-600">
                Generate marketing content from your campaign intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
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

            <button
              onClick={() => router.push(`/campaigns/${params.id}/settings`)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

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

      <div className="space-y-6">
        {/* Analysis Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Brain className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">Analysis Complete</h3>
              <p className="text-gray-600">
                Intelligence analysis has been completed. You can now generate content.
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{intelligenceCount}</div>
              <div className="text-sm text-gray-500">Insights</div>
            </div>
          </div>
        </div>

        {/* Content Generation Options */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Generate Marketing Content
          </h2>

          {canGenerateContent ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { type: "email", icon: Mail, title: "Email Campaign", description: "Promotional emails and sequences" },
                { type: "social", icon: MessageSquare, title: "Social Media", description: "Posts and ad copy" },
                { type: "blog", icon: FileText, title: "Blog Content", description: "Articles and blog posts" },
                { type: "ad", icon: BarChart3, title: "Ad Copy", description: "Advertising campaigns" },
              ].map((contentType) => (
                <button
                  key={contentType.type}
                  onClick={() => handleGenerateContent(contentType.type)}
                  disabled={isGeneratingContent}
                  className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <contentType.icon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 group-hover:text-purple-900">
                        {contentType.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {contentType.description}
                      </p>
                    </div>
                    {isGeneratingContent && (
                      <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Analysis Required
              </h3>
              <p className="text-gray-600 mb-4">
                Complete intelligence analysis first before generating content.
              </p>
              <button
                onClick={() => router.push(`/campaigns/${params.id}/inputs`)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Go to Analysis
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}