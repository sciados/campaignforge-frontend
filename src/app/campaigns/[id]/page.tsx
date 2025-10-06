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

export default function CampaignDetailPage({
  params,
}: CampaignDetailPageProps) {
  const router = useRouter();
  const api = useApi();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

          // Handle the actual database structure with multiple intelligence columns
          let intelligenceRecord = null;

          if (intelligenceResponse?.success && intelligenceResponse?.data) {
            // StandardResponse format
            const data = intelligenceResponse.data;
            if (Array.isArray(data)) {
              // Array of intelligence records
              intelligenceRecord = data[0]; // Get first record
              analysisComplete = data.some(item =>
                (item.full_analysis_data || item.product_data || item.market_data) &&
                item.confidence_score > 0
              );
            } else if (data && (data.full_analysis_data || data.product_data || data.market_data)) {
              // Single intelligence record
              intelligenceRecord = data;
              analysisComplete = data.confidence_score > 0;
            }
          } else if (Array.isArray(intelligenceResponse)) {
            // Direct array response
            intelligenceRecord = intelligenceResponse[0];
            analysisComplete = intelligenceResponse.some(item =>
              (item.full_analysis_data || item.product_data || item.market_data) &&
              item.confidence_score > 0
            );
          } else if (intelligenceResponse && (intelligenceResponse.full_analysis_data || intelligenceResponse.product_data || intelligenceResponse.market_data)) {
            // Single intelligence object
            intelligenceRecord = intelligenceResponse;
            analysisComplete = intelligenceResponse.confidence_score > 0;
          } else if (intelligenceResponse && typeof intelligenceResponse === 'object') {
            // Any other object response - assume it has intelligence
            intelligenceRecord = intelligenceResponse;
            analysisComplete = true;
          }

          // Count intelligence insights from all data sources
          if (intelligenceRecord && analysisComplete) {
            let totalInsights = 0;

            // Count insights from full_analysis_data
            if (intelligenceRecord.full_analysis_data) {
              const fullData = intelligenceRecord.full_analysis_data;
              if (fullData.enhancement_summary && fullData.enhancement_summary.successful_enhancers) {
                totalInsights += fullData.enhancement_summary.successful_enhancers;
              } else {
                // Fallback: count major sections in full_analysis_data
                const sections = [
                  'brand_intelligence', 'market_enhancement', 'offer_intelligence',
                  'content_enhancement', 'authority_enhancement', 'emotional_enhancement',
                  'scientific_enhancement', 'credibility_enhancement', 'psychology_intelligence',
                  'competitive_intelligence'
                ];
                totalInsights += sections.filter(section => fullData[section]).length;
              }
            }

            // Count insights from product_data
            if (intelligenceRecord.product_data) {
              if (Array.isArray(intelligenceRecord.product_data)) {
                totalInsights += intelligenceRecord.product_data.length;
              } else {
                totalInsights += 1; // Single product data object
              }
            }

            // Count insights from market_data
            if (intelligenceRecord.market_data) {
              if (Array.isArray(intelligenceRecord.market_data)) {
                totalInsights += intelligenceRecord.market_data.length;
              } else {
                totalInsights += 1; // Single market data object
              }
            }

            // Set the total intelligence count
            intelligenceCount = Math.max(totalInsights, 1); // At least 1 if analysis exists
          }
        } catch (err) {
          console.log("No intelligence analysis found:", err);
          intelligenceCount = 0;
          analysisComplete = false;
        }

        // Load generated content
        try {
          const contentResponse = await api.getGeneratedContent(params.id);
          contentCount = Array.isArray(contentResponse) ? contentResponse.length : 0;
        } catch (err) {
          console.log("No generated content found:", err);
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

          {/* Content Types Available */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Content Types</h2>
            <p className="text-gray-600 mb-6">Generate any of these content types using your campaign intelligence:</p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { icon: Mail, label: "Email Sequences", color: "text-blue-600 bg-blue-50" },
                { icon: MessageSquare, label: "Social Posts", color: "text-green-600 bg-green-50" },
                { icon: FileText, label: "Blog Articles", color: "text-purple-600 bg-purple-50" },
                { icon: BarChart3, label: "Ad Copy", color: "text-orange-600 bg-orange-50" },
                { icon: Edit3, label: "Video Scripts", color: "text-indigo-600 bg-indigo-50" },
                { icon: Video, label: "Short Videos", color: "text-red-600 bg-red-50" },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                    <item.icon className={`h-6 w-6 ${item.color.split(' ')[0]}`} />
                  </div>
                  <div className="text-sm font-medium text-gray-900">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => router.push(`/campaigns/${params.id}/generate`)}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center space-x-2"
              >
                <Sparkles className="h-5 w-5" />
                <span>Generate Content Now</span>
              </button>
            </div>
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