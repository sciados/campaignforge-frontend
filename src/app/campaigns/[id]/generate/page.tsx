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
  X,
  Printer,
  Video,
  Camera,
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
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

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
      let response;

      // Handle video generation differently
      if (contentType === "short_video") {
        // First generate script if needed
        const scriptResponse = await api.generateContent({
          campaign_id: params.id,
          content_type: "video_script",
          target_audience: campaign.target_audience || "",
        });

        if (!scriptResponse.success) {
          throw new Error("Failed to generate video script");
        }

        // Then generate video from script
        response = await api.post(`/api/video/generate/${params.id}`, {
          script_content: scriptResponse.generated_content.content,
          video_type: "youtube_short", // Default, could be configurable
          visual_style: "realistic",
          voice_type: "female_professional",
          brand_colors: ["#007BFF"], // Could come from campaign data
          music_style: "upbeat"
        });

        // For video, we'll treat it as successful if we get a response
        if (response.success) {
          // Create a mock content entry for video
          const videoContent = {
            id: `video-${Date.now()}`,
            content_type: "short_video",
            content_title: `Video for ${campaign.title}`,
            content_body: `Video generated successfully. Duration: ${response.duration_seconds}s, Scenes: ${response.scenes_count}`,
            created_at: new Date().toISOString(),
            is_published: false,
            video_url: response.video_url
          };

          setGeneratedContent(prev => [...prev, videoContent]);
        } else {
          throw new Error(response.error || "Video generation failed");
        }
      } else {
        // Regular content generation
        response = await api.generateContent({
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

  // Open print-friendly report
  const handleGenerateReport = async () => {
    if (!campaign) return;

    setShowReportModal(true);
    setIsGeneratingReport(true);
    setError(null);

    try {
      // Get campaign intelligence data for printing
      const intelligenceResponse = await api.getCampaignIntelligence(params.id);

      // Handle case where no intelligence data is available yet
      let intelligence = null;
      if (intelligenceResponse.success && intelligenceResponse.data) {
        intelligence = intelligenceResponse.data;
      }

      // Create print-friendly content
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${campaign.title} - Intelligence Report</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              margin: 40px;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #6366f1;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #6366f1;
              margin: 0;
              font-size: 28px;
            }
            .header p {
              color: #666;
              margin: 10px 0 0 0;
              font-size: 16px;
            }
            .section {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            .section h2 {
              color: #4f46e5;
              border-left: 4px solid #6366f1;
              padding-left: 15px;
              margin-bottom: 15px;
              font-size: 20px;
            }
            .section h3 {
              color: #374151;
              margin-top: 20px;
              margin-bottom: 10px;
              font-size: 16px;
            }
            .content {
              margin-left: 20px;
              text-align: justify;
            }
            .list-item {
              margin-bottom: 8px;
              padding-left: 15px;
            }
            .metadata {
              background: #f8fafc;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 20px;
              border-left: 4px solid #e5e7eb;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #666;
              font-size: 12px;
              border-top: 1px solid #e5e7eb;
              padding-top: 20px;
            }
            @media print {
              body { margin: 20px; }
              .no-print { display: none; }
              .page-break { page-break-before: always; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${campaign.title}</h1>
            <p>Intelligence Report - Generated on ${new Date().toLocaleDateString()}</p>
          </div>

          <div class="metadata">
            <h3>Campaign Overview</h3>
            <p><strong>Campaign Type:</strong> ${campaign.campaign_type || 'Standard'}</p>
            <p><strong>Status:</strong> ${campaign.status}</p>
            ${campaign.description ? `<p><strong>Description:</strong> ${campaign.description}</p>` : ''}
            ${campaign.product_name ? `<p><strong>Product:</strong> ${campaign.product_name}</p>` : ''}
            ${campaign.target_audience ? `<p><strong>Target Audience:</strong> ${campaign.target_audience}</p>` : ''}
          </div>

          ${intelligence && intelligence.analysis_summary ? `
          <div class="section">
            <h2>Executive Summary</h2>
            <div class="content">
              <p>${intelligence.analysis_summary}</p>
            </div>
          </div>
          ` : ''}

          ${intelligence && intelligence.key_insights && intelligence.key_insights.length > 0 ? `
          <div class="section">
            <h2>Key Insights</h2>
            <div class="content">
              ${intelligence.key_insights.map((insight: string) => `<div class="list-item">• ${insight}</div>`).join('')}
            </div>
          </div>
          ` : ''}

          ${intelligence && intelligence.target_audience_analysis ? `
          <div class="section">
            <h2>Target Audience Analysis</h2>
            <div class="content">
              <p>${intelligence.target_audience_analysis}</p>
            </div>
          </div>
          ` : ''}

          ${intelligence && intelligence.competition_analysis ? `
          <div class="section">
            <h2>Competition Analysis</h2>
            <div class="content">
              <p>${intelligence.competition_analysis}</p>
            </div>
          </div>
          ` : ''}

          ${intelligence && intelligence.marketing_angles && intelligence.marketing_angles.length > 0 ? `
          <div class="section">
            <h2>Marketing Angles</h2>
            <div class="content">
              ${intelligence.marketing_angles.map((angle: string) => `<div class="list-item">• ${angle}</div>`).join('')}
            </div>
          </div>
          ` : ''}

          ${intelligence && intelligence.content_strategy ? `
          <div class="section">
            <h2>Content Strategy</h2>
            <div class="content">
              <p>${intelligence.content_strategy}</p>
            </div>
          </div>
          ` : ''}

          ${intelligence && intelligence.sales_psychology ? `
          <div class="section">
            <h2>Sales Psychology</h2>
            <div class="content">
              <p>${intelligence.sales_psychology}</p>
            </div>
          </div>
          ` : ''}

          ${!intelligence ? `
          <div class="section">
            <h2>Intelligence Analysis</h2>
            <div class="content">
              <p>No intelligence analysis has been completed for this campaign yet. Please run the analysis first to generate insights and recommendations.</p>
              <p>To generate intelligence:</p>
              <div class="list-item">• Go to the campaign inputs page</div>
              <div class="list-item">• Add your input sources (URLs, text, files)</div>
              <div class="list-item">• Click "Analyze" to run the intelligence analysis</div>
              <div class="list-item">• Return here to view and print the full report</div>
            </div>
          </div>
          ` : ''}

          ${generatedContent.length > 0 ? `
          <div class="section page-break">
            <h2>Generated Content</h2>
            ${generatedContent.map((content: any) => `
              <div class="content">
                <h3>${content.content_title}</h3>
                <p><strong>Type:</strong> ${content.content_type.replace('_', ' ').toUpperCase()}</p>
                <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin: 10px 0;">
                  ${content.content_body.replace(/\n/g, '<br>')}
                </div>
              </div>
            `).join('')}
          </div>
          ` : ''}

          <div class="footer">
            <p>Generated by CampaignForge Intelligence System</p>
            <p>This report contains AI-generated insights and recommendations.</p>
          </div>
        </body>
        </html>
      `;

      // Open print window
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();

        // Auto-focus and print dialog
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }

      setReportGenerated(true);

    } catch (err) {
      console.error("Report generation error:", err);
      setError(`Report generation failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setShowReportModal(false);
    setReportGenerated(false);
    setError(null);
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
                  <Printer className="h-4 w-4" />
                  <span>Print Report</span>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { type: "email", icon: Mail, title: "Email Campaign", description: "Promotional emails and sequences" },
                { type: "social", icon: MessageSquare, title: "Social Media", description: "Posts and ad copy" },
                { type: "blog", icon: FileText, title: "Blog Content", description: "Articles and blog posts" },
                { type: "ad", icon: BarChart3, title: "Ad Copy", description: "Advertising campaigns" },
                { type: "video_script", icon: FileText, title: "Video Script", description: "Engaging scripts for video content" },
                { type: "short_video", icon: Video, title: "Short Videos", description: "AI-generated videos for social media" },
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

      {/* Print Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Intelligence Report
              </h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-center">
              {isGeneratingReport ? (
                <div className="py-8">
                  <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Generating Report...
                  </h4>
                  <p className="text-gray-600">
                    Preparing your intelligence report for printing or saving as PDF.
                  </p>
                </div>
              ) : reportGenerated ? (
                <div className="py-8">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Report Ready!
                  </h4>
                  <p className="text-gray-600 mb-6">
                    Your intelligence report has opened in a new window. Use your browser&apos;s print function to save as PDF or print.
                  </p>
                  <div className="flex space-x-3 justify-center">
                    <button
                      onClick={handleGenerateReport}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                    >
                      <Printer className="h-4 w-4" />
                      <span>Print Again</span>
                    </button>
                    <button
                      onClick={() => setShowReportModal(false)}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : error ? (
                <div className="py-8">
                  <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Generation Failed
                  </h4>
                  <p className="text-red-600 mb-6">
                    {error}
                  </p>
                  <div className="flex space-x-3 justify-center">
                    <button
                      onClick={handleGenerateReport}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Retry
                    </button>
                    <button
                      onClick={() => setShowReportModal(false)}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}