// src/components/dashboards/business/BusinessDashboard.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

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

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // fake API delay

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
        marketingROI: { adSpend: 3247, revenue: 12891, roi: 297 },
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
        ],
      });
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
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
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            🏢 {config.dashboard_title}
          </h1>
          <Link
            href="/campaigns/create-workflow?type=lead_generation"
            legacyBehavior
          >
            <a className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              🎯 {config.main_cta}
            </a>
          </Link>
        </div>
      </div>
      {/* ...rest of your JSX... */}
    </div>
  );
};

export default BusinessDashboard;
