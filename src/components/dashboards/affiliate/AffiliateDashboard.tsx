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
  if (!token) throw new Error("Authentication required");

  const response = await fetch(`${API_BASE_URL}/api/campaigns/stats/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok)
    throw new Error(`Dashboard stats API returned ${response.status}`);
  return response.json();
};

const fetchAffiliatePerformance = async (days: number = 30) => {
  const token = localStorage.getItem("authToken");
  if (!token) throw new Error("Authentication required");

  const response = await fetch(
    `${API_BASE_URL}/api/campaigns/affiliate/performance?days=${days}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok)
    throw new Error(`Affiliate performance API returned ${response.status}`);
  return response.json();
};

const fetchRecentCampaigns = async (limit: number = 5) => {
  const token = localStorage.getItem("authToken");
  if (!token) throw new Error("Authentication required");

  const response = await fetch(
    `${API_BASE_URL}/api/affiliate/campaigns?limit=${limit}&sort=recent`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok)
    throw new Error(`Recent campaigns API returned ${response.status}`);
  return response.json();
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
      const [statsResult, performanceResult, campaignsResult] =
        await Promise.allSettled([
          fetchDashboardStats(),
          fetchAffiliatePerformance(30),
          fetchRecentCampaigns(5),
        ]);

      const statsData =
        statsResult.status === "fulfilled" ? statsResult.value : {};
      const performanceData =
        performanceResult.status === "fulfilled" ? performanceResult.value : {};
      const campaignsData =
        campaignsResult.status === "fulfilled" ? campaignsResult.value : {};

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
          topOffer:
            performanceData.commission_metrics?.topOffer || "No data available",
        },
        campaignStatus: {
          active:
            performanceData.campaign_status?.active ||
            statsData.active_campaigns ||
            0,
          paused:
            performanceData.campaign_status?.paused ||
            statsData.paused_campaigns ||
            0,
          testing:
            performanceData.campaign_status?.testing ||
            statsData.testing_campaigns ||
            0,
          winners:
            performanceData.campaign_status?.winners ||
            statsData.winning_campaigns ||
            0,
        },
        competitorFeed: performanceData.competitor_feed || [],
        recentCampaigns: (() => {
          let campaignsArray: any[] = [];
          if (
            campaignsData?.campaigns &&
            Array.isArray(campaignsData.campaigns)
          ) {
            campaignsArray = campaignsData.campaigns;
          } else if (Array.isArray(campaignsData)) {
            campaignsArray = campaignsData;
          } else if (campaignsData && typeof campaignsData === "object") {
            campaignsArray = campaignsData.data || campaignsData.results || [];
          }
          return campaignsArray.map((campaign: any) => ({
            id: campaign.id,
            name: campaign.title || campaign.name,
            type:
              campaign.content_types?.[0] || campaign.content_type || "email",
            earnings:
              campaign.estimated_revenue ||
              campaign.revenue ||
              campaign.earnings ||
              0,
            ctr_change:
              campaign.performance_metrics?.ctr_change ||
              campaign.conversion_rate ||
              0,
            status: campaign.status || "active",
          }));
        })(),
      });

      const allFailed = [statsResult, performanceResult, campaignsResult].every(
        (result) => result.status === "rejected"
      );
      if (allFailed)
        setError(
          "Unable to load dashboard data. Some features may not be available."
        );
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      setError("Failed to load dashboard data. Please try again.");
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

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <h2 className="text-red-600 text-lg font-semibold mb-2">
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl px-6 py-4 flex justify-between items-center">
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
            <div className="flex space-x-2">
              <Link
                href="/dashboard/affiliate/campaigns"
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                🚀 My Campaigns
              </Link>
              <Link
                href="/dashboard/content-library"
                className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
              >
                📚 Browse Products
              </Link>
              <Link
                href="/dashboard/affiliate/link-generator"
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                🔗 Generate Links
              </Link>
              <Link
                href="/dashboard/affiliate/commissions"
                className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
              >
                💰 Commissions
              </Link>
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
            <div className="p-6 space-y-4">
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
                        <div className="text-xs text-gray-500">{item.time}</div>
                      </div>
                    </div>
                    <Link
                      href={`/dashboard/affiliate/competitor-analysis/${item.id}`}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      Analyze →
                    </Link>
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
            <div className="p-6 space-y-4">
              {dashboardData.recentCampaigns.length > 0 ? (
                dashboardData.recentCampaigns.map((campaign) => (
                  <Link
                    key={campaign.id}
                    href={`/dashboard/affiliate/campaigns/${campaign.id}`}
                    className="flex items-center justify-between hover:bg-gray-50 p-2 rounded transition-colors"
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
                  </Link>
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
          </motion.div>
        </div>

        {/* Quick Access Section */}
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
              Everything you need to connect with product creators and maximize
              earnings
            </p>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Link
              href="/dashboard/content-library"
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-2xl mb-2">📚</div>
              <div className="font-medium text-gray-900 text-center">
                Product Library
              </div>
              <div className="text-xs text-gray-500 text-center mt-1">
                Browse products from creators
              </div>
            </Link>

            <Link
              href="/dashboard/affiliate/campaigns"
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-2xl mb-2">🚀</div>
              <div className="font-medium text-gray-900 text-center">
                My Campaigns
              </div>
              <div className="text-xs text-gray-500 text-center mt-1">
                Track campaign performance
              </div>
            </Link>

            <Link
              href="/dashboard/affiliate/commissions"
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-2xl mb-2">💰</div>
              <div className="font-medium text-gray-900 text-center">
                Commission Tracking
              </div>
              <div className="text-xs text-gray-500 text-center mt-1">
                Monitor earnings & payouts
              </div>
            </Link>

            <Link
              href="/dashboard/affiliate/link-generator"
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-2xl mb-2">🔗</div>
              <div className="font-medium text-gray-900 text-center">
                Link Generator
              </div>
              <div className="text-xs text-gray-500 text-center mt-1">
                Create trackable links
              </div>
            </Link>

            <Link
              href="/dashboard/affiliate/mockups"
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-2xl mb-2">🖼️</div>
              <div className="font-medium text-gray-900 text-center">
                Mockup Generator
              </div>
              <div className="text-xs text-gray-500 text-center mt-1">
                Create professional product mockups
              </div>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AffiliateDashboard;
