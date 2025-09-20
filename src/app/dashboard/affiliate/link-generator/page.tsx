"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useApi } from "@/lib/api";

interface GeneratedLink {
  id: string;
  original_url: string;
  shortened_url: string;
  custom_slug?: string;
  campaign_name: string;
  content_type: string;
  clicks: number;
  conversions: number;
  created_at: string;
  expires_at?: string;
  is_active: boolean;
}

interface LinkStats {
  total_clicks: number;
  total_conversions: number;
  conversion_rate: number;
  top_performing_link: string;
  links_this_month: number;
}

export default function LinkGeneratorPage() {
  const api = useApi();
  const [generatedLinks, setGeneratedLinks] = useState<GeneratedLink[]>([]);
  const [stats, setStats] = useState<LinkStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form data for new link generation
  const [formData, setFormData] = useState({
    original_url: "",
    campaign_name: "",
    content_type: "email",
    custom_slug: "",
    expires_in_days: "30",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://campaign-backend-production-e2db.up.railway.app";

      // Load generated links and stats
      const [linksResponse, statsResponse] = await Promise.all([
        fetch(`${apiUrl}/api/affiliate/links`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch(`${apiUrl}/api/affiliate/links/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
      ]);

      if (linksResponse.ok) {
        const linksData = await linksResponse.json();
        setGeneratedLinks(linksData.links || []);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      } else {
        // Empty state if API not available
        setStats({
          total_clicks: 0,
          total_conversions: 0,
          conversion_rate: 0,
          top_performing_link: "None",
          links_this_month: 0
        });
      }
    } catch (error) {
      console.error("Failed to load link data:", error);
      setError("Unable to load link data. Please try again later.");
      setGeneratedLinks([]);
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  const generateLink = async () => {
    if (!formData.original_url || !formData.campaign_name) {
      setError("Please fill in all required fields");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://campaign-backend-production-e2db.up.railway.app";

      const response = await fetch(`${apiUrl}/api/affiliate/links/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          expires_in_days: parseInt(formData.expires_in_days) || null,
        }),
      });

      if (response.ok) {
        const newLink = await response.json();
        setGeneratedLinks(prev => [newLink, ...prev]);

        // Reset form
        setFormData({
          original_url: "",
          campaign_name: "",
          content_type: "email",
          custom_slug: "",
          expires_in_days: "30",
        });

        // Refresh stats
        loadData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate link");
      }
    } catch (error) {
      console.error("Failed to generate link:", error);
      setError(error instanceof Error ? error.message : "Failed to generate link. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleLinkStatus = async (linkId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem("authToken");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://campaign-backend-production-e2db.up.railway.app";

      const response = await fetch(`${apiUrl}/api/affiliate/links/${linkId}/toggle`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setGeneratedLinks(prev => prev.map(link =>
          link.id === linkId
            ? { ...link, is_active: !currentStatus }
            : link
        ));
      }
    } catch (error) {
      console.error("Failed to toggle link status:", error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🔗 Link Generator & Tracker</h1>
          <p className="text-gray-600 mt-2">
            Create trackable affiliate links and monitor their performance across different marketing channels
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-lg shadow-sm border"
            >
              <div className="text-sm text-gray-600 mb-1">Total Clicks</div>
              <div className="text-2xl font-bold text-blue-600">
                {stats.total_clicks.toLocaleString()}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-lg shadow-sm border"
            >
              <div className="text-sm text-gray-600 mb-1">Conversions</div>
              <div className="text-2xl font-bold text-green-600">
                {stats.total_conversions}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-lg shadow-sm border"
            >
              <div className="text-sm text-gray-600 mb-1">Conversion Rate</div>
              <div className="text-2xl font-bold text-purple-600">
                {stats.conversion_rate.toFixed(1)}%
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-lg shadow-sm border"
            >
              <div className="text-sm text-gray-600 mb-1">Links This Month</div>
              <div className="text-2xl font-bold text-orange-600">
                {stats.links_this_month}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white p-6 rounded-lg shadow-sm border"
            >
              <div className="text-sm text-gray-600 mb-1">Top Performer</div>
              <div className="text-xs font-bold text-pink-600 truncate">
                {stats.top_performing_link}
              </div>
            </motion.div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Link Generator Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-sm border p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Generate New Link
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Original Affiliate URL *
                </label>
                <input
                  type="url"
                  value={formData.original_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, original_url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="https://affiliate-platform.com/your-link"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  value={formData.campaign_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, campaign_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Health Supplement Q4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content Type
                </label>
                <select
                  value={formData.content_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, content_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="email">Email Marketing</option>
                  <option value="social-facebook">Facebook</option>
                  <option value="social-instagram">Instagram</option>
                  <option value="social-twitter">Twitter</option>
                  <option value="blog">Blog Post</option>
                  <option value="video-youtube">YouTube</option>
                  <option value="ads-google">Google Ads</option>
                  <option value="ads-facebook">Facebook Ads</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Slug (Optional)
                </label>
                <input
                  type="text"
                  value={formData.custom_slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, custom_slug: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="health-supplement-promo"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Creates: cf.link/health-supplement-promo
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expires In (Days)
                </label>
                <select
                  value={formData.expires_in_days}
                  onChange={(e) => setFormData(prev => ({ ...prev, expires_in_days: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Never expires</option>
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="365">1 year</option>
                </select>
              </div>

              <button
                onClick={generateLink}
                disabled={isGenerating}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? "Generating..." : "Generate Trackable Link"}
              </button>
            </div>
          </motion.div>

          {/* Generated Links List */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-sm border"
            >
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  Your Generated Links
                </h2>
              </div>

              <div className="p-6">
                {generatedLinks.length > 0 ? (
                  <div className="space-y-4">
                    {generatedLinks.map((link) => (
                      <div
                        key={link.id}
                        className="border rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-medium text-gray-900">
                                {link.campaign_name}
                              </h3>
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                {link.content_type}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  link.is_active
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {link.is_active ? "Active" : "Disabled"}
                              </span>
                            </div>

                            <div className="text-sm text-gray-600 mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="font-mono bg-gray-100 px-2 py-1 rounded text-green-600">
                                  {link.shortened_url}
                                </span>
                                <button
                                  onClick={() => copyToClipboard(link.shortened_url)}
                                  className="text-gray-400 hover:text-gray-600"
                                  title="Copy to clipboard"
                                >
                                  📋
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Clicks:</span>
                                <span className="font-medium ml-1 text-blue-600">
                                  {link.clicks}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Conversions:</span>
                                <span className="font-medium ml-1 text-green-600">
                                  {link.conversions}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Rate:</span>
                                <span className="font-medium ml-1 text-purple-600">
                                  {link.clicks > 0 ? ((link.conversions / link.clicks) * 100).toFixed(1) : "0.0"}%
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleLinkStatus(link.id, link.is_active)}
                              className={`px-3 py-1 text-xs rounded ${
                                link.is_active
                                  ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                  : "bg-green-100 text-green-800 hover:bg-green-200"
                              }`}
                            >
                              {link.is_active ? "Disable" : "Enable"}
                            </button>
                          </div>
                        </div>

                        <div className="text-xs text-gray-400">
                          Created: {new Date(link.created_at).toLocaleDateString()}
                          {link.expires_at && (
                            <span className="ml-4">
                              Expires: {new Date(link.expires_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-6xl mb-4">🔗</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No links generated yet
                    </h3>
                    <p className="text-gray-500">
                      Create your first trackable affiliate link to start monitoring performance.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}