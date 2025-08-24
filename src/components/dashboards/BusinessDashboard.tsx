// src/components/dashboards/business/BusinessDashboard.tsx
/**
 * Business Owner Dashboard - Business Growth Command
 * 🏢 Specialized dashboard for SME business owners
 * 🎯 Focus: Lead generation, market research, ROI tracking
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

interface BusinessDashboardProps {
  config: DashboardConfig;
}

const BusinessDashboard: React.FC<BusinessDashboardProps> = ({ config }) => {
  const [dashboardData, setDashboardData] = useState({
    businessMetrics: {
      revenue: 0,
      revenueGrowth: 0,
      leads: 0,
      leadGrowth: 0,
      conversion: 0,
      conversionGrowth: 0,
      salesCalls: 0,
    },
    marketingROI: {
      adSpend: 0,
      revenue: 0,
      roi: 0,
    },
    marketIntelligence: [],
    leadPipeline: [],
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
        businessMetrics: {
          revenue: 47293,
          revenueGrowth: 12,
          leads: 847,
          leadGrowth: 23,
          conversion: 3.2,
          conversionGrowth: 0.4,
          salesCalls: 89,
        },
        marketingROI: {
          adSpend: 3247,
          revenue: 12891,
          roi: 297,
        },
        marketIntelligence: [
          {
            id: 1,
            type: "competitor",
            title: "BusinessX launched new service offering",
            description: "New premium tier targeting enterprise customers",
            impact: "high",
            source: "competitor_analysis",
            timestamp: "2 hours ago",
          },
          {
            id: 2,
            type: "opportunity",
            title: '67% search increase for "your service"',
            description: "Growing market demand in your industry",
            impact: "high",
            source: "market_data",
            timestamp: "4 hours ago",
          },
          {
            id: 3,
            type: "insight",
            title: 'Customers asking about "premium option"',
            description: "Opportunity to introduce higher-tier service",
            impact: "medium",
            source: "customer_feedback",
            timestamp: "6 hours ago",
          },
          {
            id: 4,
            type: "performance",
            title: "LinkedIn posts generating 23% more leads",
            description: "B2B content strategy showing strong results",
            impact: "medium",
            source: "analytics",
            timestamp: "8 hours ago",
          },
        ],
        leadPipeline: [
          {
            id: 1,
            source: "Website Contact Form",
            leads: 23,
            revenue: 8947,
            conversion: 4.2,
            growth: 15,
          },
          {
            id: 2,
            source: "LinkedIn Outreach",
            leads: 14,
            revenue: 5291,
            conversion: 8.1,
            growth: 28,
          },
          {
            id: 3,
            source: "Google Ads Campaign",
            leads: 31,
            revenue: 12847,
            conversion: 2.8,
            growth: -5,
          },
        ],
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
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

  const getIntelligenceIcon = (type: string) => {
    switch (type) {
      case "competitor":
        return "🏆";
      case "opportunity":
        return "📈";
      case "insight":
        return "💡";
      case "performance":
        return "🎯";
      default:
        return "📊";
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case "competitor_analysis":
        return "bg-red-100 text-red-700";
      case "market_data":
        return "bg-blue-100 text-blue-700";
      case "customer_feedback":
        return "bg-green-100 text-green-700";
      case "analytics":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                🏢 {config.dashboard_title}
              </h1>
              <p className="text-gray-600 mt-1">
                Drive business growth with AI-powered market intelligence and
                lead generation.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Market Analyses</div>
                <div className="text-lg font-semibold text-gray-900">
                  {config.user_profile.usage_summary.analysis.used}/
                  {config.user_profile.usage_summary.analysis.limit}
                </div>
              </div>
              <Link
                href="/campaigns/create-workflow?type=lead_generation"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                🎯 {config.main_cta}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Business Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border p-6 mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Business Performance
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(dashboardData.businessMetrics.revenue)}
              </div>
              <div className="text-sm text-gray-600">Revenue</div>
              <div className="text-xs text-green-600 font-medium">
                💰 +{dashboardData.businessMetrics.revenueGrowth}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(dashboardData.businessMetrics.leads)}
              </div>
              <div className="text-sm text-gray-600">Leads</div>
              <div className="text-xs text-green-600 font-medium">
                👥 +{dashboardData.businessMetrics.leadGrowth}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {dashboardData.businessMetrics.conversion}%
              </div>
              <div className="text-sm text-gray-600">Conversion</div>
              <div className="text-xs text-green-600 font-medium">
                🎯 +{dashboardData.businessMetrics.conversionGrowth}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {dashboardData.businessMetrics.salesCalls}
              </div>
              <div className="text-sm text-gray-600">Sales Calls</div>
              <div className="text-xs text-gray-500">Booked</div>
            </div>
          </div>
        </motion.div>

        {/* Marketing ROI */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border p-6 mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Marketing ROI
          </h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(dashboardData.marketingROI.adSpend)}
              </div>
              <div className="text-sm text-gray-600">💸 Ad Spend</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(dashboardData.marketingROI.revenue)}
              </div>
              <div className="text-sm text-gray-600">💰 Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {dashboardData.marketingROI.roi}%
              </div>
              <div className="text-sm text-gray-600">📊 ROI</div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Market Intelligence Feed */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border"
          >
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Market Intelligence Feed
                </h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All →
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData.marketIntelligence.map((intel) => (
                  <div
                    key={intel.id}
                    className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-xl">
                      {getIntelligenceIcon(intel.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-gray-900">
                          {intel.title}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getImpactColor(
                            intel.impact
                          )}`}
                        >
                          {intel.impact}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {intel.description}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {intel.timestamp}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getSourceColor(
                            intel.source
                          )}`}
                        >
                          {intel.source.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Lead Generation Pipeline */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border"
          >
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Lead Generation Pipeline
                </h2>
                <Link
                  href="/dashboard/business/lead-generation"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All →
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData.leadPipeline.map((pipeline) => (
                  <div key={pipeline.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">
                        {pipeline.source}
                      </h3>
                      <span
                        className={`text-sm font-medium ${
                          pipeline.growth >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {pipeline.growth >= 0 ? "📈" : "📉"}{" "}
                        {pipeline.growth >= 0 ? "+" : ""}
                        {pipeline.growth}%
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-blue-600">
                          📧 {pipeline.leads}
                        </div>
                        <div className="text-xs text-gray-500">
                          leads this week
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-green-600">
                          💰 {formatCurrency(pipeline.revenue)}
                        </div>
                        <div className="text-xs text-gray-500">revenue</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-purple-600">
                          {pipeline.conversion}%
                        </div>
                        <div className="text-xs text-gray-500">conversion</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Business Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Business Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Link
                href="/campaigns/create-workflow?input_type=market_research"
                className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  📊
                </div>
                <div className="text-sm font-medium text-gray-900">
                  Market Analysis
                </div>
              </Link>
              <Link
                href="/campaigns/create-workflow?input_type=lead_magnet"
                className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  🎯
                </div>
                <div className="text-sm font-medium text-gray-900">
                  Lead Magnet
                </div>
              </Link>
              <Link
                href="/campaigns/create-workflow?input_type=email_campaign"
                className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  📧
                </div>
                <div className="text-sm font-medium text-gray-900">
                  Email Campaign
                </div>
              </Link>
              <Link
                href="/dashboard/business/competitor-watch"
                className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  🏆
                </div>
                <div className="text-sm font-medium text-gray-900">
                  Competitor Intel
                </div>
              </Link>
              <Link
                href="/dashboard/business/market-research"
                className="flex flex-col items-center p-4 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  📱
                </div>
                <div className="text-sm font-medium text-gray-900">
                  Social Strategy
                </div>
              </Link>
              <Link
                href="/campaigns/create-workflow?input_type=sales_material"
                className="flex flex-col items-center p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors group"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  💰
                </div>
                <div className="text-sm font-medium text-gray-900">
                  Sales Material
                </div>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BusinessDashboard;
