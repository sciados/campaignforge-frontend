// src/components/dashboards/product-creator/ProductCreatorDashboard.tsx
/**
 * Product Creator Dashboard - Specialized interface for product developers
 * 🎯 Focus: URL submission, quota tracking, analysis results viewing
 * 🔐 Limited toolset for free invited accounts
 */

"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Star,
  Link as LinkIcon,
  CheckCircle,
  Clock,
  AlertCircle,
  Upload,
  BarChart3,
  Users,
  TrendingUp,
  Package,
  DollarSign,
  Eye,
  Settings,
  HelpCircle,
  ExternalLink
} from "lucide-react";

// ---------- API Configuration ----------
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://campaign-backend-production-e2db.up.railway.app";

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

interface ProductCreatorDashboardProps {
  config: DashboardConfig;
}

interface DashboardData {
  account_type: string;
  restrictions: {
    max_url_submissions: number;
    usage_restrictions: string | null;
    special_permissions: any;
    invited_by_admin: string;
    invite_accepted_at: string;
    is_product_creator_account: boolean;
  };
  submission_stats: {
    total_submissions: number;
    pending_submissions: number;
    completed_submissions: number;
    rejected_submissions: number;
  };
  usage_stats: {
    urls_submitted: number;
    max_urls_allowed: number;
    remaining_urls: number;
    usage_percentage: number;
  };
  recent_activity: Array<{
    id: string;
    type: string;
    product_name: string;
    status: string;
    url_count: number;
    created_at: string;
    processed_at: string | null;
  }>;
  available_tools: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    primary: boolean;
    path: string;
  }>;
  dashboard_config: {
    dashboard_type: string;
    show_billing: boolean;
    show_analytics: boolean;
    show_campaigns: boolean;
    show_content_generation: boolean;
    show_intelligence_analysis: boolean;
    primary_actions: string[];
    restricted_features: string[];
    welcome_message: string;
    help_links: Array<{
      title: string;
      url: string;
    }>;
  };
}

const ProductCreatorDashboard: React.FC<ProductCreatorDashboardProps> = ({ config }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token");

      const response = await fetch(
        `${API_BASE_URL}/api/intelligence/product-creator/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.status}`);
      }

      const result = await response.json();
      setDashboardData(result.data);
    } catch (error) {
      console.error("Failed to load product creator dashboard data:", error);
      setError(error instanceof Error ? error.message : "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleURLSubmission = async () => {
    const productName = prompt("Enter your product name:");
    if (!productName) return;

    const category = prompt("Enter product category:");
    if (!category) return;

    const urlsInput = prompt("Enter sales page URLs (separated by commas):");
    if (!urlsInput) return;

    const urls = urlsInput.split(',').map(url => url.trim()).filter(url => url);
    const launchDate = prompt("Expected launch date (optional):");
    const notes = prompt("Additional notes about your product (optional):");

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${API_BASE_URL}/api/intelligence/product-creator/submit-urls`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product_name: productName,
            category: category,
            urls: urls,
            launch_date: launchDate || null,
            notes: notes || null,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        alert(`✅ URLs submitted successfully!\n\nSubmission ID: ${result.data.submission_id}\nProduct: ${result.data.product_name}\nURLs: ${result.data.url_count}\nRemaining quota: ${result.data.remaining_quota}`);
        loadDashboardData(); // Refresh dashboard
      } else {
        const error = await response.json();
        alert(`❌ Submission failed: ${error.detail || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error submitting URLs:", error);
      alert("❌ Error submitting URLs. Check console for details.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "pending_review":
        return "text-yellow-600 bg-yellow-100";
      case "rejected":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "pending_review":
        return <Clock className="w-4 h-4" />;
      case "rejected":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
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

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600 mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600 mb-4">{error || "No dashboard data available"}</p>
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
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Star className="w-6 h-6 text-blue-600 mr-2" />
                Product Creator Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                {dashboardData.dashboard_config.welcome_message}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">URL Quota</div>
                <div className="text-lg font-semibold text-gray-900">
                  {dashboardData.usage_stats.urls_submitted}/{dashboardData.usage_stats.max_urls_allowed}
                </div>
                <div className="text-xs text-gray-500">
                  {dashboardData.usage_stats.remaining_urls} remaining
                </div>
              </div>
              <button
                onClick={handleURLSubmission}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Submit URLs</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl px-6 py-8">
        {/* Account Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8"
        >
          <div className="flex items-center space-x-3">
            <Star className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-blue-900">
                Special Product Creator Account
              </h2>
              <p className="text-blue-700">
                You have a free invited account for pre-launch URL submission and analysis.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Usage Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <LinkIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">URLs Submitted</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.usage_stats.urls_submitted}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Usage</span>
                <span>{dashboardData.usage_stats.usage_percentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.min(100, dashboardData.usage_stats.usage_percentage)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.submission_stats.completed_submissions}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.submission_stats.pending_submissions}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.submission_stats.total_submissions}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border"
          >
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData.recent_activity.length > 0 ? (
                  dashboardData.recent_activity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between border rounded-lg p-4"
                    >
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(activity.status)}
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {activity.product_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {activity.url_count} URLs • {new Date(activity.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 text-sm rounded-full ${getStatusColor(activity.status)}`}
                      >
                        {activity.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No submissions yet.</p>
                    <button
                      onClick={handleURLSubmission}
                      className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Submit your first URLs →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Available Tools */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border"
          >
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Available Tools</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData.available_tools.map((tool) => (
                  <div
                    key={tool.id}
                    className="flex items-center justify-between border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      {tool.icon === "link" && <LinkIcon className="w-5 h-5 text-blue-600" />}
                      {tool.icon === "list" && <BarChart3 className="w-5 h-5 text-green-600" />}
                      {tool.icon === "chart" && <TrendingUp className="w-5 h-5 text-purple-600" />}
                      {tool.icon === "settings" && <Settings className="w-5 h-5 text-gray-600" />}
                      <div>
                        <h3 className="font-medium text-gray-900">{tool.name}</h3>
                        <p className="text-sm text-gray-600">{tool.description}</p>
                      </div>
                    </div>
                    {tool.id === "url_submission" && (
                      <button
                        onClick={handleURLSubmission}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Use Tool
                      </button>
                    )}
                    {tool.id === "submission_tracking" && (
                      <button
                        onClick={() => window.location.reload()}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Refresh
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white rounded-lg shadow-sm border p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <HelpCircle className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Need Help?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dashboardData.dashboard_config.help_links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900">{link.title}</span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductCreatorDashboard;