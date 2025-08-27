// src/components/dashboards/creator/CreatorDashboard.tsx
/**
 * Content Creator Dashboard - Creator Studio Pro
 * 🎬 Specialized dashboard for content creators and influencers
 * 🎯 Focus: Viral content analysis, trend detection, audience growth
 */

"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface DashboardConfig {
  user_profile: {
    user_type_display: string;
    usage_summary: {
      campaigns: { used: number; limit: number; percentage: number };
      analysis: { used: number; limit: number; percentage: number };
    };
  };
  primary_widgets: string[];
  dashboard_title: string;
  main_cta: string;
  theme_color: string;
}

interface CreatorDashboardProps {
  config: DashboardConfig;
}

interface CreatorMetrics {
  followers: number;
  followerGrowth: number;
  engagement: number;
  engagementGrowth: number;
  viralScore: number;
  monthlyEarnings: number;
}

interface ContentPipeline {
  published: number;
  draft: number;
  scheduled: number;
  ideas: number;
}

interface ViralOpportunity {
  id: number;
  type: string;
  title: string;
  description: string;
  urgency: "high" | "medium" | "low";
  platform: string;
  impact: string;
}

interface RecentContent {
  id: number;
  title: string;
  type: string;
  platform: string;
  views: number;
  engagement: number;
  performance: "excellent" | "good" | "average" | "poor";
  growth: number;
}

interface DashboardData {
  creatorMetrics: CreatorMetrics;
  contentPipeline: ContentPipeline;
  viralOpportunities: ViralOpportunity[];
  recentContent: RecentContent[];
}

const CreatorDashboard: React.FC<CreatorDashboardProps> = ({ config }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    creatorMetrics: {
      followers: 0,
      followerGrowth: 0,
      engagement: 0,
      engagementGrowth: 0,
      viralScore: 0,
      monthlyEarnings: 0,
    },
    contentPipeline: {
      published: 0,
      draft: 0,
      scheduled: 0,
      ideas: 0,
    },
    viralOpportunities: [],
    recentContent: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Simulate API calls - replace with actual API endpoints
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setDashboardData({
        creatorMetrics: {
          followers: 47200,
          followerGrowth: 2100,
          engagement: 4.2,
          engagementGrowth: 0.3,
          viralScore: 8.7,
          monthlyEarnings: 3247,
        },
        contentPipeline: {
          published: 12,
          draft: 5,
          scheduled: 8,
          ideas: 23,
        },
        viralOpportunities: [
          {
            id: 1,
            type: "trending_format",
            title: '"Day in my life as..." format',
            description: "+340% engagement boost",
            urgency: "high",
            platform: "TikTok",
            impact: "Viral potential: 92%",
          },
          {
            id: 2,
            type: "niche_opportunity",
            title: "Behind the scenes content",
            description: "Your audience loves authentic moments",
            urgency: "medium",
            platform: "Instagram",
            impact: "Engagement boost: 67%",
          },
          {
            id: 3,
            type: "hashtag_trending",
            title: "#MondayMotivation peaking",
            description: "Perfect timing to post motivational content",
            urgency: "high",
            platform: "LinkedIn",
            impact: "Reach boost: 234%",
          },
          {
            id: 4,
            type: "audio_viral",
            title: '"That girl aesthetic" audio',
            description: "Trending sound with 2M+ uses",
            urgency: "high",
            platform: "TikTok",
            impact: "Viral potential: 78%",
          },
        ],
        recentContent: [
          {
            id: 1,
            title: "Morning Routine 2024",
            type: "video",
            platform: "TikTok",
            views: 23100,
            engagement: 847,
            performance: "excellent",
            growth: 15,
          },
          {
            id: 2,
            title: "Workspace Setup Tour",
            type: "photo",
            platform: "Instagram",
            views: 18700,
            engagement: 1200,
            performance: "good",
            growth: 8,
          },
          {
            id: 3,
            title: "Productivity Hacks Thread",
            type: "text",
            platform: "Twitter",
            views: 12300,
            engagement: 234,
            performance: "average",
            growth: -2,
          },
        ],
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getUrgencyColor = (urgency: "high" | "medium" | "low") => {
    switch (urgency) {
      case "high":
        return "text-red-600 bg-red-100 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-100 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-100 border-green-200";
      default:
        return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "tiktok":
        return "bg-black text-white";
      case "instagram":
        return "bg-gradient-to-r from-purple-500 to-pink-500 text-white";
      case "twitter":
        return "bg-blue-500 text-white";
      case "linkedin":
        return "bg-blue-700 text-white";
      case "youtube":
        return "bg-red-600 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getPerformanceIcon = (
    performance: "excellent" | "good" | "average" | "poor"
  ) => {
    switch (performance) {
      case "excellent":
        return "🔥";
      case "good":
        return "👍";
      case "average":
        return "📊";
      case "poor":
        return "📉";
      default:
        return "📊";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                🎬 {config.dashboard_title}
              </h1>
              <p className="text-gray-600 mt-1">
                Create viral content and grow your audience with AI-powered
                insights.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Content Analyses</div>
                <div className="text-lg font-semibold text-gray-900">
                  {config.user_profile.usage_summary.analysis.used}/
                  {config.user_profile.usage_summary.analysis.limit}
                </div>
              </div>
              <Link
                href="/campaigns/create-workflow?type=viral_analysis"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                🔥 {config.main_cta}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl px-6 py-8">
        {/* Creator Scorecard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border p-6 mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Creator Scorecard
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatNumber(dashboardData.creatorMetrics.followers)}
              </div>
              <div className="text-sm text-gray-600">Followers</div>
              <div className="text-xs text-green-600 font-medium">
                👥 +{formatNumber(dashboardData.creatorMetrics.followerGrowth)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {dashboardData.creatorMetrics.engagement}%
              </div>
              <div className="text-sm text-gray-600">Engagement</div>
              <div className="text-xs text-green-600 font-medium">
                📈 +{dashboardData.creatorMetrics.engagementGrowth}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {dashboardData.creatorMetrics.viralScore}/10
              </div>
              <div className="text-sm text-gray-600">Viral Score</div>
              <div className="text-xs text-gray-500">Content potential</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(dashboardData.creatorMetrics.monthlyEarnings)}
              </div>
              <div className="text-sm text-gray-600">Monthly Revenue</div>
              <div className="text-xs text-gray-500">Estimated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {dashboardData.contentPipeline.published}
              </div>
              <div className="text-sm text-gray-600">Published</div>
              <div className="text-xs text-gray-500">This month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">
                {dashboardData.contentPipeline.ideas}
              </div>
              <div className="text-sm text-gray-600">Ideas</div>
              <div className="text-xs text-gray-500">In pipeline</div>
            </div>
          </div>
        </motion.div>

        {/* Content Pipeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border p-6 mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Content Pipeline
          </h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {dashboardData.contentPipeline.published}
              </div>
              <div className="text-sm text-gray-600">✅ Published</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {dashboardData.contentPipeline.draft}
              </div>
              <div className="text-sm text-gray-600">📝 Draft</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {dashboardData.contentPipeline.scheduled}
              </div>
              <div className="text-sm text-gray-600">🎬 Scheduled</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {dashboardData.contentPipeline.ideas}
              </div>
              <div className="text-sm text-gray-600">💡 Ideas</div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Viral Opportunity Feed */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border"
          >
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  🔥 Viral Opportunities
                </h2>
                <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                  View All →
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData.viralOpportunities.map((opportunity) => (
                  <div
                    key={opportunity.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {opportunity.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {opportunity.description}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getUrgencyColor(
                              opportunity.urgency
                            )}`}
                          >
                            {opportunity.urgency} priority
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getPlatformColor(
                              opportunity.platform
                            )}`}
                          >
                            {opportunity.platform}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      {opportunity.impact}
                    </div>
                    <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                      Create Content →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Recent Content Performance */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border"
          >
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Content Performance
                </h2>
                <Link
                  href="/dashboard/creator/content-studio"
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  View All →
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData.recentContent.map((content) => (
                  <div
                    key={content.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {content.title}
                        </span>
                        <span className="text-xl">
                          {getPerformanceIcon(content.performance)}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getPlatformColor(
                            content.platform
                          )}`}
                        >
                          {content.platform}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-gray-600">
                          👥 {formatNumber(content.views)} views
                        </span>
                        <span className="text-gray-600">
                          💬 {content.engagement}{" "}
                          {content.type === "text"
                            ? "shares"
                            : content.type === "photo"
                            ? "likes"
                            : "comments"}
                        </span>
                        <span
                          className={`font-medium ${
                            content.growth >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {content.growth >= 0 ? "📈" : "📉"}{" "}
                          {content.growth >= 0 ? "+" : ""}
                          {content.growth}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Content Studio Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Content Studio
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Link
                href="/campaigns/create-workflow?input_type=viral_content"
                className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  🔥
                </div>
                <div className="text-sm font-medium text-gray-900">
                  Analyze Viral
                </div>
              </Link>
              <Link
                href="/dashboard/creator/trending"
                className="flex flex-col items-center p-4 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  📈
                </div>
                <div className="text-sm font-medium text-gray-900">
                  Trending Intel
                </div>
              </Link>
              <Link
                href="/dashboard/creator/content-studio"
                className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  📱
                </div>
                <div className="text-sm font-medium text-gray-900">
                  Multi-Platform
                </div>
              </Link>
              <Link
                href="/dashboard/creator/growth"
                className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  👥
                </div>
                <div className="text-sm font-medium text-gray-900">
                  Audience Insights
                </div>
              </Link>
              <Link
                href="/dashboard/creator/monetization"
                className="flex flex-col items-center p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  💰
                </div>
                <div className="text-sm font-medium text-gray-900">
                  Brand Deals
                </div>
              </Link>
              <Link
                href="/campaigns/create-workflow?input_type=content_ideas"
                className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  💡
                </div>
                <div className="text-sm font-medium text-gray-900">
                  Idea Generator
                </div>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CreatorDashboard;
