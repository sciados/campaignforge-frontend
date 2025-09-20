"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface CompetitorData {
  id: string;
  competitor_name: string;
  product_category: string;
  detected_offer: string;
  commission_rate: number;
  estimated_volume: string;
  last_seen_promoting: string;
  ad_spend_trend: "increasing" | "stable" | "decreasing";
  landing_page_url: string;
  detected_at: string;
}

interface CompetitorAlert {
  id: string;
  type: "new_campaign" | "price_change" | "new_competitor" | "volume_spike";
  competitor_name: string;
  message: string;
  severity: "high" | "medium" | "low";
  timestamp: string;
}

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [alerts, setAlerts] = useState<CompetitorAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", "health", "make-money", "technology", "fitness", "education"];

  useEffect(() => {
    loadCompetitorData();
  }, [selectedCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadCompetitorData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://campaign-backend-production-e2db.up.railway.app";

      // Load competitor data and alerts
      const [competitorsResponse, alertsResponse] = await Promise.all([
        fetch(`${apiUrl}/api/affiliate/competitors${selectedCategory !== "all" ? `?category=${selectedCategory}` : ""}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch(`${apiUrl}/api/affiliate/competitors/alerts`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
      ]);

      if (competitorsResponse.ok) {
        const competitorsData = await competitorsResponse.json();
        setCompetitors(competitorsData.competitors || []);
      } else {
        // Show empty state instead of mock data
        setCompetitors([]);
      }

      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData.alerts || []);
      } else {
        setAlerts([]);
      }
    } catch (error) {
      console.error("Failed to load competitor data:", error);
      setError("Unable to load competitor data. Please try again later.");
      setCompetitors([]);
      setAlerts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeCompetitor = async (competitorId: string) => {
    try {
      const token = localStorage.getItem("authToken");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://campaign-backend-production-e2db.up.railway.app";

      const response = await fetch(`${apiUrl}/api/affiliate/competitors/${competitorId}/analyze`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Trigger analysis - could show a toast notification
        console.log("Analysis started for competitor:", competitorId);
      }
    } catch (error) {
      console.error("Failed to analyze competitor:", error);
    }
  };

  const getVolumeColor = (volume: string) => {
    switch (volume.toLowerCase()) {
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return "📈";
      case "decreasing":
        return "📉";
      case "stable":
        return "➡️";
      default:
        return "➡️";
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "new_campaign":
        return "🚨";
      case "price_change":
        return "💰";
      case "new_competitor":
        return "👤";
      case "volume_spike":
        return "📊";
      default:
        return "🔔";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "border-l-red-500 bg-red-50";
      case "medium":
        return "border-l-yellow-500 bg-yellow-50";
      case "low":
        return "border-l-green-500 bg-green-50";
      default:
        return "border-l-gray-500 bg-gray-50";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🔍 Competitor Intelligence</h1>
            <p className="text-gray-600 mt-2">
              Monitor competitor activity and discover new opportunities in your niche
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            <button
              onClick={loadCompetitorData}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Competitor Analysis */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-sm border"
            >
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  Active Competitors
                </h2>
              </div>

              <div className="p-6">
                {competitors.length > 0 ? (
                  <div className="space-y-4">
                    {competitors.map((competitor) => (
                      <div
                        key={competitor.id}
                        className="border rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-medium text-gray-900">
                                {competitor.competitor_name}
                              </h3>
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                {competitor.product_category}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded ${getVolumeColor(
                                  competitor.estimated_volume
                                )}`}
                              >
                                {competitor.estimated_volume} volume
                              </span>
                            </div>

                            <p className="text-sm text-gray-600 mb-2">
                              Promoting: <span className="font-medium">{competitor.detected_offer}</span>
                            </p>

                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Commission:</span>
                                <span className="font-medium ml-1 text-green-600">
                                  {competitor.commission_rate}%
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Ad Spend:</span>
                                <span className="font-medium ml-1">
                                  {getTrendIcon(competitor.ad_spend_trend)} {competitor.ad_spend_trend}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Last Active:</span>
                                <span className="font-medium ml-1 text-gray-600">
                                  {competitor.last_seen_promoting}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <a
                              href={competitor.landing_page_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 text-xs text-blue-600 border border-blue-300 rounded hover:bg-blue-50"
                            >
                              View Page
                            </a>
                            <button
                              onClick={() => analyzeCompetitor(competitor.id)}
                              className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                            >
                              Analyze
                            </button>
                          </div>
                        </div>

                        <div className="text-xs text-gray-400">
                          First detected: {new Date(competitor.detected_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-6xl mb-4">🔍</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No competitor data available
                    </h3>
                    <p className="text-gray-500 mb-6">
                      We&apos;re continuously monitoring the market for competitor activity.
                      Check back soon for insights.
                    </p>
                    <button
                      onClick={loadCompetitorData}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Refresh Analysis
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Real-time Alerts */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm border"
            >
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  Intelligence Alerts
                </h2>
              </div>

              <div className="p-6">
                {alerts.length > 0 ? (
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`border-l-4 rounded-r-lg p-3 ${getSeverityColor(
                          alert.severity
                        )}`}
                      >
                        <div className="flex items-start space-x-2">
                          <span className="text-lg">{getAlertIcon(alert.type)}</span>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {alert.competitor_name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {alert.message}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {new Date(alert.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-2">🔔</div>
                    <p className="text-sm text-gray-500">
                      No recent alerts
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border mt-6"
            >
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  Quick Actions
                </h2>
              </div>

              <div className="p-6 space-y-3">
                <a
                  href="/dashboard/content-library"
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg border"
                >
                  📚 Browse Available Products
                </a>
                <a
                  href="/dashboard/affiliate/campaigns"
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg border"
                >
                  🚀 Create New Campaign
                </a>
                <a
                  href="/dashboard/affiliate/link-generator"
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg border"
                >
                  🔗 Generate Tracking Link
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
