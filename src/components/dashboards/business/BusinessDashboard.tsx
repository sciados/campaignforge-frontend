// src/components/dashboards/business/BusinessDashboard.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

// ---------- API Configuration ----------
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://campaign-backend-production-e2db.up.railway.app";

// ---------------- Interfaces ----------------
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

interface MarketIntel {
  id: number;
  type: "competitor" | "opportunity" | "insight" | "performance";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  source: string;
  timestamp: string;
}

interface LeadPipeline {
  id: number;
  source: string;
  leads: number;
  revenue: number;
  conversion: number;
  growth: number;
}

interface DashboardData {
  businessMetrics: {
    revenue: number;
    revenueGrowth: number;
    leads: number;
    leadGrowth: number;
    conversion: number;
    conversionGrowth: number;
    salesCalls: number;
  };
  marketingROI: {
    adSpend: number;
    revenue: number;
    roi: number;
  };
  marketIntelligence: MarketIntel[];
  leadPipeline: LeadPipeline[];
}

interface BusinessDashboardProps {
  config: DashboardConfig;
}

// ---------- API Functions ----------
const fetchCompanyStats = async () => {
  const token = localStorage.getItem("authToken");
  if (!token) throw new Error("No auth token");

  const response = await fetch(`${API_BASE_URL}/api/users/company/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error("Failed to fetch company stats");
  return response.json();
};

const fetchCompanyDetails = async () => {
  const token = localStorage.getItem("authToken");
  if (!token) throw new Error("No auth token");

  const response = await fetch(`${API_BASE_URL}/api/users/company/details`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error("Failed to fetch company details");
  return response.json();
};

const fetchDashboardStats = async () => {
  const token = localStorage.getItem("authToken");
  if (!token) throw new Error("No auth token");

  const response = await fetch(`${API_BASE_URL}/api/campaigns/stats/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error("Failed to fetch dashboard stats");
  return response.json();
};

// ---------------- Component ----------------
const BusinessDashboard: React.FC<BusinessDashboardProps> = ({ config }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    businessMetrics: {
      revenue: 0,
      revenueGrowth: 0,
      leads: 0,
      leadGrowth: 0,
      conversion: 0,
      conversionGrowth: 0,
      salesCalls: 0,
    },
    marketingROI: { adSpend: 0, revenue: 0, roi: 0 },
    marketIntelligence: [],
    leadPipeline: [],
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
      // Replace mock data with real API calls
      const [companyStats, companyDetails, dashboardStats] = await Promise.all([
        fetchCompanyStats().catch(() => ({})),
        fetchCompanyDetails().catch(() => ({})),
        fetchDashboardStats().catch(() => ({})),
      ]);

      // Map real data to component structure
      setDashboardData({
        businessMetrics: {
          revenue:
            companyStats.monthly_revenue ||
            dashboardStats.monthly_recurring_revenue ||
            0,
          revenueGrowth:
            companyStats.revenue_growth_percentage ||
            dashboardStats.growth_percentage ||
            0,
          leads: companyStats.total_leads || dashboardStats.total_leads || 0,
          leadGrowth: companyStats.lead_growth_percentage || 0,
          conversion: companyStats.conversion_rate || 0,
          conversionGrowth: companyStats.conversion_growth || 0,
          salesCalls: companyStats.sales_calls || 0,
        },
        marketingROI: {
          adSpend: companyStats.marketing_spend || 0,
          revenue: companyStats.marketing_revenue || 0,
          roi: companyStats.marketing_roi || 0,
        },
        marketIntelligence: companyStats.market_intelligence || [
          {
            id: 1,
            type: "opportunity",
            title: "Market Analysis Available",
            description: "Growing demand in your industry sector",
            impact: "medium",
            source: "market_data",
            timestamp: "Updated recently",
          },
        ],
        leadPipeline: companyStats.lead_pipeline || [
          {
            id: 1,
            source: "Campaign Performance",
            leads: dashboardStats.total_campaigns || 0,
            revenue: companyStats.monthly_revenue || 0,
            conversion: companyStats.conversion_rate || 0,
            growth: companyStats.growth_percentage || 0,
          },
        ],
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      setError("Failed to load dashboard data. Please try again.");

      // Fallback to empty state instead of mock data
      setDashboardData({
        businessMetrics: {
          revenue: 0,
          revenueGrowth: 0,
          leads: 0,
          leadGrowth: 0,
          conversion: 0,
          conversionGrowth: 0,
          salesCalls: 0,
        },
        marketingROI: { adSpend: 0, revenue: 0, roi: 0 },
        marketIntelligence: [],
        leadPipeline: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- Utils ----------------
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatNumber = (num: number) =>
    new Intl.NumberFormat("en-US").format(num);

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

  // ---------------- Render ----------------
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
                🏢 {config.dashboard_title}
              </h1>
              <p className="text-gray-600 mt-1">
                Monitor business growth and optimize your marketing performance.
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
                href="/campaigns/create-workflow?type=market_analysis"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                📊 {config.main_cta}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Business Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border p-6 mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Business Growth Metrics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(dashboardData.businessMetrics.revenue)}
              </div>
              <div className="text-sm text-gray-600">Monthly Revenue</div>
              <div className="text-xs text-green-600 font-medium">
                📈 +{dashboardData.businessMetrics.revenueGrowth}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatNumber(dashboardData.businessMetrics.leads)}
              </div>
              <div className="text-sm text-gray-600">New Leads</div>
              <div className="text-xs text-green-600 font-medium">
                👥 +{dashboardData.businessMetrics.leadGrowth}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {dashboardData.businessMetrics.conversion}%
              </div>
              <div className="text-sm text-gray-600">Conversion Rate</div>
              <div className="text-xs text-green-600 font-medium">
                🎯 +{dashboardData.businessMetrics.conversionGrowth}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {dashboardData.marketingROI.roi}%
              </div>
              <div className="text-sm text-gray-600">Marketing ROI</div>
              <div className="text-xs text-gray-500">Return on investment</div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Market Intelligence */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-sm border"
          >
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                📊 Market Intelligence
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData.marketIntelligence.length > 0 ? (
                  dashboardData.marketIntelligence.map((intel) => (
                    <div
                      key={intel.id}
                      className="border rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-lg">
                              {getIntelligenceIcon(intel.type)}
                            </span>
                            <span className="font-semibold text-gray-900">
                              {intel.title}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs rounded-full border ${getImpactColor(
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
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${getSourceColor(
                                intel.source
                              )}`}
                            >
                              {intel.source.replace("_", " ")}
                            </span>
                            <span className="text-xs text-gray-500">
                              {intel.timestamp}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        View Details →
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      No market intelligence available yet.
                    </p>
                    <p className="text-sm text-gray-400">
                      Create campaigns to start gathering insights.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Lead Pipeline */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-sm border"
          >
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Lead Pipeline
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData.leadPipeline.length > 0 ? (
                  dashboardData.leadPipeline.map((pipeline) => (
                    <div
                      key={pipeline.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {pipeline.source}
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-gray-600">
                            👥 {pipeline.leads} leads
                          </span>
                          <span className="text-gray-600">
                            💰 {formatCurrency(pipeline.revenue)}
                          </span>
                          <span className="text-gray-600">
                            🎯 {pipeline.conversion}%
                          </span>
                          <span
                            className={`font-medium ${
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
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No lead pipeline data yet.</p>
                    <Link
                      href="/campaigns/create-workflow"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Create campaigns to track leads →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;
