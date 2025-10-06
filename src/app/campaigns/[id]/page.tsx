// src/app/campaigns/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Settings,
  Share2,
  Plus,
  Brain,
  Sparkles,
  FileText,
  BarChart3,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  Target,
  TrendingUp,
  Video,
  Mail,
  MessageSquare,
  Edit3,
  Play,
  Calendar,
  Globe,
  Database,
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
  status: string;
  created_at: string;
  campaign_type?: string;
  keywords?: string[];
  target_audience?: string;
  salespage_url?: string;
  product_name?: string;
}

interface CampaignStats {
  intelligence_count: number;
  content_count: number;
  sources_count: number;
  last_analysis_date?: string;
  analysis_complete: boolean;
}

interface GeneratedContent {
  content_id: string;
  content_type: string;
  title: string;
  body?: string;
  metadata?: any;
  created_at: string;
  generated_content?: any;
}

interface ContentTypeStats {
  email_sequence: GeneratedContent[];
  social_posts: GeneratedContent[];
  blog_articles: GeneratedContent[];
  ad_copy: GeneratedContent[];
  video_scripts: GeneratedContent[];
  short_videos: GeneratedContent[];
}

export default function CampaignDetailPage({
  params,
}: CampaignDetailPageProps) {
  const router = useRouter();
  const api = useApi();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [contentStats, setContentStats] = useState<ContentTypeStats>({
    email_sequence: [],
    social_posts: [],
    blog_articles: [],
    ad_copy: [],
    video_scripts: [],
    short_videos: []
  });
  const [expandedContentType, setExpandedContentType] = useState<string | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (expandedContentType) {
        setExpandedContentType(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [expandedContentType]);

  // Load campaign data
  useEffect(() => {
    const loadCampaignData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load campaign details
        const campaignResponse = await api.getCampaign(params.id);
        setCampaign(campaignResponse);

        // Load campaign statistics
        let intelligenceCount = 0;
        let contentCount = 0;
        let analysisComplete = false;

        // Load intelligence data
        try {
          const intelligenceResponse = await api.getCampaignIntelligence(params.id);
          console.log("Intelligence response:", intelligenceResponse);

          // Handle intelligence response - simplified detection for current backend format
          let intelligenceRecords = [];

          if (intelligenceResponse?.success && intelligenceResponse?.data) {
            // StandardResponse format
            const data = intelligenceResponse.data;
            if (Array.isArray(data)) {
              intelligenceRecords = data;
            } else if (data) {
              intelligenceRecords = [data];
            }
          } else if (Array.isArray(intelligenceResponse)) {
            // Direct array response
            intelligenceRecords = intelligenceResponse;
          } else if (intelligenceResponse && typeof intelligenceResponse === 'object') {
            // Single object response
            intelligenceRecords = [intelligenceResponse];
          }

          // Check if we have valid intelligence data
          analysisComplete = intelligenceRecords.length > 0 &&
            intelligenceRecords.some(item =>
              item.id && item.product_name && typeof item.confidence_score === 'number'
            );

          // Count intelligence insights - simplified for current backend format
          if (analysisComplete && intelligenceRecords.length > 0) {
            // Each valid intelligence record counts as one insight
            intelligenceCount = intelligenceRecords.filter(item =>
              item.id && item.product_name && typeof item.confidence_score === 'number'
            ).length;

            // Ensure at least 1 if we have valid data
            intelligenceCount = Math.max(intelligenceCount, 1);
          }
        } catch (err) {
          console.log("No intelligence analysis found:", err);
          intelligenceCount = 0;
          analysisComplete = false;
        }

        // Load generated content
        try {
          const contentResponse = await api.getGeneratedContent(params.id);
          console.log("Generated content response:", contentResponse);

          let rawContentList: any[] = [];

          // Handle different response formats
          if (contentResponse?.success && contentResponse?.data) {
            // StandardResponse format
            rawContentList = Array.isArray(contentResponse.data) ? contentResponse.data : [contentResponse.data];
          } else if (Array.isArray(contentResponse)) {
            // Direct array response
            rawContentList = contentResponse;
          } else if (contentResponse && typeof contentResponse === 'object') {
            // Single object response
            rawContentList = [contentResponse];
          }

          // Transform content to match our interface
          const transformedContent: GeneratedContent[] = rawContentList.map((item: any) => ({
            content_id: item.id || item.content_id || '',
            content_type: item.content_type || '',
            title: item.title || item.content_title || '',
            body: item.body || item.content || '',
            metadata: item.metadata,
            created_at: item.created_at || new Date().toISOString(),
            generated_content: item.generated_content
          })).filter(item => item.content_id && item.content_type);

          setGeneratedContent(transformedContent);
          contentCount = transformedContent.length;
        } catch (err) {
          console.log("No generated content found:", err);
          setGeneratedContent([]);
          contentCount = 0;
        }

        setStats({
          intelligence_count: intelligenceCount,
          content_count: contentCount,
          sources_count: 1, // Assuming one source per campaign for now
          analysis_complete: analysisComplete,
          last_analysis_date: campaignResponse.created_at
        });

      } catch (err) {
        console.error("Failed to load campaign:", err);
        setError("Failed to load campaign information");
      } finally {
        setIsLoading(false);
      }
    };

    loadCampaignData();
  }, [params.id, api]);

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

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Campaign Not Found</h2>
          <p className="text-gray-600 mb-4">{error || "This campaign could not be loaded"}</p>
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'draft': return 'text-yellow-600 bg-yellow-100';
      case 'paused': return 'text-gray-600 bg-gray-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/campaigns")}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{campaign.title}</h1>
                <div className="flex items-center space-x-3 mt-1">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    Created {new Date(campaign.created_at).toLocaleDateString()}
                  </span>
                </div>
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
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Campaign Overview */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Campaign Overview</h2>

            {campaign.description && (
              <p className="text-gray-600 mb-4">{campaign.description}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Database className="h-8 w-8 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold text-blue-900">{stats?.intelligence_count || 0}</div>
                    <div className="text-sm text-blue-700">Intelligence Insights</div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-green-900">{stats?.content_count || 0}</div>
                    <div className="text-sm text-green-700">Generated Content</div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Globe className="h-8 w-8 text-purple-600" />
                  <div>
                    <div className="text-2xl font-bold text-purple-900">{stats?.sources_count || 0}</div>
                    <div className="text-sm text-purple-700">Sources Analyzed</div>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  {stats?.analysis_complete ? (
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  ) : (
                    <Clock className="h-8 w-8 text-orange-600" />
                  )}
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {stats?.analysis_complete ? "Complete" : "Pending"}
                    </div>
                    <div className="text-sm text-gray-600">Analysis Status</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Status Notification */}
          {stats?.analysis_complete && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-green-800 font-medium">
                    Intelligence analysis complete! You can now generate content.
                  </p>
                  <p className="text-green-700 text-sm">
                    {stats.intelligence_count} insights extracted and ready for content generation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">What would you like to do?</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Generate Content - Primary Action */}
              <button
                onClick={() => router.push(`/campaigns/${params.id}/generate`)}
                disabled={!stats?.analysis_complete}
                className={`p-6 rounded-xl transition-all duration-200 text-left group ${
                  stats?.analysis_complete
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    stats?.analysis_complete ? "bg-white bg-opacity-20" : "bg-gray-200"
                  }`}>
                    <Sparkles className={`h-6 w-6 ${
                      stats?.analysis_complete ? "text-white" : "text-gray-400"
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold mb-2 ${
                      stats?.analysis_complete ? "text-white" : "text-gray-500"
                    }`}>
                      Generate Content
                    </h3>
                    <p className={`text-sm mb-3 ${
                      stats?.analysis_complete ? "text-purple-100" : "text-gray-500"
                    }`}>
                      {stats?.analysis_complete
                        ? "Create emails, social posts, blog articles, video scripts, and short videos from your campaign intelligence"
                        : "Complete intelligence analysis first to unlock content generation"
                      }
                    </p>
                    <div className={`flex items-center text-sm font-medium ${
                      stats?.analysis_complete ? "text-white" : "text-gray-500"
                    }`}>
                      <span>{stats?.analysis_complete ? "Start Generating" : "Analysis Required"}</span>
                      <Play className="h-4 w-4 ml-2" />
                    </div>
                  </div>
                </div>
              </button>

              {/* Manage Analysis */}
              <button
                onClick={() => router.push(`/campaigns/${params.id}/inputs`)}
                className="p-6 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 text-left group"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Brain className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Intelligence</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Add sources, run analysis, and enhance your campaign intelligence data
                    </p>
                    <div className="flex items-center text-purple-600 text-sm font-medium">
                      <span>Open Analysis</span>
                      <Database className="h-4 w-4 ml-2" />
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Content Library */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Content Library</h2>
              <button
                onClick={() => router.push(`/campaigns/${params.id}/generate`)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center space-x-2 text-sm"
              >
                <Sparkles className="h-4 w-4" />
                <span>Generate More</span>
              </button>
            </div>
            <p className="text-gray-600 mb-6">Click on any content type to view your generated content:</p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { icon: Mail, label: "Email Sequences", type: "email_sequence", color: "text-blue-600 bg-blue-50" },
                { icon: MessageSquare, label: "Social Posts", type: "social_post", color: "text-green-600 bg-green-50" },
                { icon: FileText, label: "Blog Articles", type: "blog_post", color: "text-purple-600 bg-purple-50" },
                { icon: BarChart3, label: "Ad Copy", type: "ad_copy", color: "text-orange-600 bg-orange-50" },
                { icon: Edit3, label: "Video Scripts", type: "video_script", color: "text-indigo-600 bg-indigo-50" },
                { icon: Video, label: "Short Videos", type: "short_video", color: "text-red-600 bg-red-50" },
              ].map((item, index) => {
                const contentCount = generatedContent.filter(content => content.content_type === item.type).length;
                const hasContent = contentCount > 0;

                return (
                  <div key={index} className="text-center relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (hasContent) {
                          setExpandedContentType(expandedContentType === item.type ? null : item.type);
                        }
                      }}
                      className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2 transition-all duration-200 relative ${
                        hasContent
                          ? `${item.color} hover:scale-105 cursor-pointer`
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <item.icon className={`h-6 w-6 ${
                        hasContent ? item.color.split(' ')[0] : 'text-gray-400'
                      }`} />
                      {hasContent && (
                        <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                          {contentCount}
                        </div>
                      )}
                    </button>
                    <div className={`text-sm font-medium ${
                      hasContent ? 'text-gray-900' : 'text-gray-400'
                    }`}>{item.label}</div>

                    {/* Content Dropdown */}
                    {expandedContentType === item.type && hasContent && (
                      <div
                        className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-64 max-w-80 z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {generatedContent
                            .filter(content => content.content_type === item.type)
                            .slice(0, 5)
                            .map((content) => (
                              <div
                                key={content.content_id}
                                className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => {
                                  // Navigate to content view/edit page
                                  router.push(`/campaigns/${params.id}/content/${content.content_id}`);
                                }}
                              >
                                <div className="font-medium text-sm text-gray-900 truncate">
                                  {content.title || `${item.label} Content`}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {new Date(content.created_at).toLocaleDateString()}
                                </div>
                              </div>
                            ))
                          }
                          {generatedContent.filter(content => content.content_type === item.type).length > 5 && (
                            <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
                              +{generatedContent.filter(content => content.content_type === item.type).length - 5} more items
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {generatedContent.length === 0 && (
              <div className="mt-6 text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                <Sparkles className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No content generated yet</p>
                <p className="text-gray-400 text-xs">Generate your first content to see it here</p>
              </div>
            )}
          </div>

          {/* Campaign Details */}
          {(campaign.target_audience || campaign.product_name || campaign.keywords?.length) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Campaign Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {campaign.target_audience && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="h-5 w-5 text-purple-600" />
                      <h3 className="font-medium text-gray-900">Target Audience</h3>
                    </div>
                    <p className="text-gray-600">{campaign.target_audience}</p>
                  </div>
                )}

                {campaign.product_name && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Globe className="h-5 w-5 text-blue-600" />
                      <h3 className="font-medium text-gray-900">Product</h3>
                    </div>
                    <p className="text-gray-600">{campaign.product_name}</p>
                  </div>
                )}

                {campaign.keywords?.length && (
                  <div className="md:col-span-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <h3 className="font-medium text-gray-900">Keywords</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {campaign.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}