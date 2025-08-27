// src/components/dashboards/affiliate/AffiliateDashboard.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

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

// ---------- Component ----------
const AffiliateDashboard: React.FC<AffiliateDashboardProps> = ({ config }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    commissionMetrics: { thisMonth: 0, growth: 0, epc: 0, topOffer: "N/A" },
    campaignStatus: { active: 0, paused: 0, testing: 0, winners: 0 },
    competitorFeed: [],
    recentCampaigns: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setDashboardData({
        commissionMetrics: {
          thisMonth: 12847,
          growth: 23,
          epc: 2.14,
          topOffer: "ProductX",
        },
        campaignStatus: { active: 8, paused: 3, testing: 2, winners: 4 },
        competitorFeed: [
          {
            id: 1,
            type: "new_campaign",
            competitor: "CompetitorX",
            description: "launched email sequence",
            time: "2 hours ago",
            impact: "high",
          },
          {
            id: 2,
            type: "trending",
            description: '"Weight loss + AI" angle getting 3.2% CTR',
            time: "4 hours ago",
            impact: "medium",
          },
          {
            id: 3,
            type: "opportunity",
            description: 'Low competition on "keto for men" keyword',
            time: "6 hours ago",
            impact: "high",
          },
          {
            id: 4,
            type: "analysis",
            competitor: "TopAffiliate",
            description: "landing page updated - view analysis",
            time: "8 hours ago",
            impact: "medium",
          },
        ],
        recentCampaigns: [
          {
            id: 1,
            name: "ProductX Email Campaign",
            type: "email",
            earnings: 2847,
            ctr_change: 15,
            status: "active",
          },
          {
            id: 2,
            name: "ProductY Facebook Ads",
            type: "facebook",
            earnings: 1923,
            ctr_change: -3,
            status: "active",
          },
          {
            id: 3,
            name: "ProductZ YouTube Review",
            type: "youtube",
            earnings: 892,
            ctr_change: 28,
            status: "completed",
          },
        ],
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
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
        return "🔍";
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

  // (render stays unchanged from your original, except fixed links & currency formatting)

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
              <Link
                href="/campaigns/create-workflow?type=competitor_tracking"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                🔍 {config.main_cta}
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
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData.competitorFeed.map((item) => (
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
                    <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                      Analyze →
                    </button>
                  </div>
                ))}
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
                {dashboardData.recentCampaigns.map((campaign) => (
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
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AffiliateDashboard;
