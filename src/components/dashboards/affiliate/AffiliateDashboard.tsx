// src/components/dashboards/affiliate/AffiliateDashboard.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

// ---------- API Configuration ----------
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://campaign-backend-production-e2db.up.railway.app";

// ---------- Types ----------
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

interface CompetitorFeedItem {
  id: number;
  type: "new_campaign" | "trending" | "opportunity" | "analysis" | string;
  competitor?: string;
  description: string;
  time: string;
  impact: "high" | "medium" | "low";
}

interface Campaign {
  id: number;
  name: string;
  type: string;
  earnings: number;
  ctr_change: number;
  status: "active" | "completed" | "paused" | string;
}

interface DashboardData {
  commissionMetrics: {
    thisMonth: number;
    growth: number;
    epc: number;
    topOffer: string;
  };
  campaignStatus: {
    active: number;
    paused: number;
    testing: number;
    winners: number;
  };
  competitorFeed: CompetitorFeedItem[];
  recentCampaigns: Campaign[];
}

interface AffiliateDashboardProps {
  config: DashboardConfig;
}

// ---------- API Functions ----------
const fetchDashboardStats = async () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/campaigns/stats/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Dashboard stats API returned ${response.status}`);
    }
  } catch (error) {
    console.error("Dashboard stats API failed:", error);
    throw error;
  }
};

const fetchAffiliatePerformance = async (days: number = 30) => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/campaigns/affiliate/performance?days=${days}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Affiliate performance API returned ${response.status}`);
    }
  } catch (error) {
    console.error("Affiliate performance API failed:", error);
    throw error;
  }
};

const fetchRecentCampaigns = async (limit: number = 5) => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/affiliate/campaigns?limit=${limit}&sort=recent`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Recent campaigns API returned ${response.status}`);
    }
  } catch (error) {
    console.error("Recent campaigns API failed:", error);
    throw error;
  }
};


// ---------- Component ----------
const AffiliateDashboard: React.FC<AffiliateDashboardProps> = ({ config }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    commissionMetrics: { thisMonth: 0, growth: 0, epc: 0, topOffer: "N/A" },
    campaignStatus: { active: 0, paused: 0, testing: 0, winners: 0 },
    competitorFeed: [],
    recentCampaigns: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use Promise.allSettled to handle partial failures gracefully
      const [statsResult, performanceResult, campaignsResult] = await Promise.allSettled([
        fetchDashboardStats(),
        fetchAffiliatePerformance(30),
        fetchRecentCampaigns(5),
      ]);

      // Extract data from successful results, default to empty for failures
      const statsData = statsResult.status === 'fulfilled' ? statsResult.value : {};
      const performanceData = performanceResult.status === 'fulfilled' ? performanceResult.value : {};
      const campaignsData = campaignsResult.status === 'fulfilled' ? campaignsResult.value : {};

      // Map real data to component structure
      setDashboardData({
        commissionMetrics: {
          thisMonth:
            statsData.monthly_recurring_revenue ||
            performanceData.commission_metrics?.thisMonth ||
            0,
          growth:
            statsData.growth_percentage ||
            performanceData.commission_metrics?.growth ||
            0,
          epc: performanceData.commission_metrics?.epc || 0,
          topOffer: performanceData.commission_metrics?.topOffer || "No data available",
        },
        campaignStatus: {
          active: performanceData.campaign_status?.active || statsData.active_campaigns || 0,
          paused: performanceData.campaign_status?.paused || statsData.paused_campaigns || 0,
          testing: performanceData.campaign_status?.testing || statsData.testing_campaigns || 0,
          winners: performanceData.campaign_status?.winners || statsData.winning_campaigns || 0,
        },
        competitorFeed: performanceData.competitor_feed || [],
        recentCampaigns: (() => {
          // Handle different possible response formats from the API
          let campaignsArray = [];

          if (campaignsData && campaignsData.campaigns && Array.isArray(campaignsData.campaigns)) {
            campaignsArray = campaignsData.campaigns;
          } else if (Array.isArray(campaignsData)) {
            campaignsArray = campaignsData;
          } else if (campaignsData && typeof campaignsData === 'object') {
            // If it's an object, try to extract campaigns from various possible properties
            campaignsArray = campaignsData.data || campaignsData.results || [];
          }

          return campaignsArray.map((campaign: any) => ({
            id: campaign.id,
            name: campaign.title || campaign.name,
            type: campaign.content_types?.[0] || campaign.content_type || "email",
            earnings: campaign.estimated_revenue || campaign.revenue || campaign.earnings || 0,
            ctr_change: campaign.performance_metrics?.ctr_change || campaign.conversion_rate || 0,
            status: campaign.status || 'active',
          }));
        })(),
      });

      // Only show error if all requests failed
      const allFailed = [statsResult, performanceResult, campaignsResult].every(result => result.status === 'rejected');
      if (allFailed) {
        setError("Unable to load dashboard data. Some features may not be available.");
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      setError("Failed to load dashboard data. Please try again.");

      // Fallback to empty state
      setDashboardData({
        commissionMetrics: { thisMonth: 0, growth: 0, epc: 0, topOffer: "No data available" },
        campaignStatus: { active: 0, paused: 0, testing: 0, winners: 0 },
        competitorFeed: [],
        recentCampaigns: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "text-red-600 bg-red-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getImpactIcon = (type: string) => {
    switch (type) {
      case "new_campaign":
        return "🚨";
      case "trending":
        return "📈";
      case "opportunity":
        return "💡";
      case "analysis":
        return "📊";
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600 mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                💰 {config.dashboard_title}
              </h1>
              <p className="text-gray-600 mt-1">
                Track competitors and optimize your affiliate campaigns for
                maximum commissions.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Campaign Analyses</div>
                <div className="text-lg font-semibold text-gray-900">
                  {config.user_profile.usage_summary.analysis.used}/
                  {config.user_profile.usage_summary.analysis.limit}
                </div>
              </div>
              <div className="flex space-x-2">
                <Link
                  href="/dashboard/affiliate/campaigns"
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  🚀 My Campaigns
                </Link>
                <Link
                  href="/dashboard/content-library"
                  className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  📚 Browse Products
                </Link>
                <Link
                  href="/dashboard/affiliate/link-generator"
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  🔗 Generate Links
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl px-6 py-8">
        {/* Commission Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border p-6 mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Commission Command Center
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(dashboardData.commissionMetrics.thisMonth)}
              </div>
              <div className="text-sm text-gray-600">This Month</div>
              <div className="text-xs text-green-600 font-medium">
                📈 +{dashboardData.commissionMetrics.growth}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                ${dashboardData.commissionMetrics.epc}
              </div>
              <div className="text-sm text-gray-600">EPC Average</div>
              <div className="text-xs text-gray-500">Earnings per click</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {dashboardData.campaignStatus.active}
              </div>
              <div className="text-sm text-gray-600">Active Campaigns</div>
              <div className="text-xs text-gray-500">Currently running</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {dashboardData.commissionMetrics.topOffer}
              </div>
              <div className="text-sm text-gray-600">Top Offer</div>
              <div className="text-xs text-gray-500">This month</div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Competitor Intelligence Feed */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm border"
          >
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                🔍 Competitor Intelligence
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData.competitorFeed.length > 0 ? (
                  dashboardData.competitorFeed.map((item) => (
                    <div
                      key={item.id}
                      className="border rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-lg">
                              {getImpactIcon(item.type)}
                            </span>
                            <span className="font-semibold text-gray-900">
                              {item.competitor && `${item.competitor} `}
                              {item.description}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${getImpactColor(
                                item.impact
                              )}`}
                            >
                              {item.impact}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.time}
                          </div>
                        </div>
                      </div>
                      <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                        Analyze →
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      No competitor intelligence available yet.
                    </p>
                    <p className="text-sm text-gray-400">
                      Check back soon for updates.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Recent Campaign Performance */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border"
          >
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Campaign Performance
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData.recentCampaigns.length > 0 ? (
                  dashboardData.recentCampaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {campaign.name}
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-gray-600">
                            💰 {formatCurrency(campaign.earnings)}
                          </span>
                          <span
                            className={`font-medium ${
                              campaign.ctr_change >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {campaign.ctr_change >= 0 ? "📈" : "📉"}{" "}
                            {campaign.ctr_change >= 0 ? "+" : ""}
                            {campaign.ctr_change}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No campaigns yet.</p>
                    <div className="space-y-2">
                      <Link
                        href="/dashboard/content-library"
                        className="block text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        📚 Browse products to promote →
                      </Link>
                      <Link
                        href="/dashboard/affiliate/campaigns"
                        className="block text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        🚀 Create your first campaign →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Access Section - Connection to Product Creators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border mt-8"
        >
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              🤝 Affiliate Marketing Toolkit
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Everything you need to connect with product creators and maximize earnings
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/dashboard/content-library"
                className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="text-2xl mb-2">📚</div>
                <div className="font-medium text-gray-900 text-center">Product Library</div>
                <div className="text-xs text-gray-500 text-center mt-1">
                  Browse products from creators
                </div>
              </Link>

              <Link
                href="/dashboard/affiliate/campaigns"
                className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="text-2xl mb-2">🚀</div>
                <div className="font-medium text-gray-900 text-center">My Campaigns</div>
                <div className="text-xs text-gray-500 text-center mt-1">
                  Track campaign performance
                </div>
              </Link>

              <Link
                href="/dashboard/affiliate/commissions"
                className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="text-2xl mb-2">💰</div>
                <div className="font-medium text-gray-900 text-center">Commission Tracking</div>
                <div className="text-xs text-gray-500 text-center mt-1">
                  Monitor earnings & payouts
                </div>
              </Link>

              <Link
                href="/dashboard/affiliate/link-generator"
                className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="text-2xl mb-2">🔗</div>
                <div className="font-medium text-gray-900 text-center">Link Generator</div>
                <div className="text-xs text-gray-500 text-center mt-1">
                  Create trackable links
                </div>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AffiliateDashboard;
