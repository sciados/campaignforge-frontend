"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Product {
  id: string;
  product_name: string;
  category: string;
  product_creator: string;
  commission_rate: number;
  product_price: number;
  platform: string;
}

interface Campaign {
  id: string;
  name: string;
  product_id: string;
  product_name: string;
  product_creator: string;
  affiliate_link: string;
  shortened_link?: string;
  content_type: string;
  target_audience: string;
  clicks: number;
  conversions: number;
  earnings: number;
  status: "active" | "paused" | "completed" | "draft";
  created_at: string;
  last_updated: string;
}

export default function AffiliateCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>("");

  // New campaign form data
  const [formData, setFormData] = useState({
    name: "",
    product_id: "",
    content_type: "email",
    target_audience: "",
    affiliate_link: "",
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

      // Load both campaigns and available products
      const [campaignsResponse, productsResponse] = await Promise.all([
        fetch(`${apiUrl}/api/affiliate/campaigns`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch(`${apiUrl}/api/admin/intelligence/creator-submissions?status=approved&limit=100`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
      ]);

      if (campaignsResponse.ok) {
        const campaignsData = await campaignsResponse.json();
        setCampaigns(campaignsData.campaigns || []);
      }

      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        // Transform creator submissions to product format
        const formattedProducts = (productsData.submissions || []).map((submission: any) => ({
          id: submission.id,
          product_name: submission.product_name || "Unknown Product",
          category: submission.category || "Uncategorized",
          product_creator: submission.created_by || "Unknown Creator",
          commission_rate: parseFloat(submission.commission_rate) || 30,
          product_price: parseFloat(submission.product_price) || 0,
          platform: submission.platform || "Direct",
        }));
        setProducts(formattedProducts);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      setError("Unable to load campaign data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const createCampaign = async () => {
    if (!formData.name || !formData.product_id || !formData.affiliate_link) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://campaign-backend-production-e2db.up.railway.app";

      const response = await fetch(`${apiUrl}/api/affiliate/campaigns`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newCampaign = await response.json();
        setCampaigns(prev => [newCampaign, ...prev]);
        setShowCreateForm(false);
        setFormData({
          name: "",
          product_id: "",
          content_type: "email",
          target_audience: "",
          affiliate_link: "",
        });
        setError(null);
      } else {
        throw new Error("Failed to create campaign");
      }
    } catch (error) {
      console.error("Failed to create campaign:", error);
      setError("Failed to create campaign. Please try again.");
    }
  };

  const toggleCampaignStatus = async (campaignId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "paused" : "active";

    try {
      const token = localStorage.getItem("authToken");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://campaign-backend-production-e2db.up.railway.app";

      const response = await fetch(`${apiUrl}/api/affiliate/campaigns/${campaignId}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setCampaigns(prev => prev.map(campaign =>
          campaign.id === campaignId
            ? { ...campaign, status: newStatus as any }
            : campaign
        ));
      }
    } catch (error) {
      console.error("Failed to update campaign status:", error);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
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
            <h1 className="text-3xl font-bold text-gray-900">🚀 My Campaigns</h1>
            <p className="text-gray-600 mt-2">
              Manage your affiliate marketing campaigns and track performance
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            + Create Campaign
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Create Campaign Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Create New Campaign
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter campaign name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product to Promote *
                  </label>
                  <select
                    value={formData.product_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, product_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select a product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.product_name} - {product.commission_rate}% commission ({product.product_creator})
                      </option>
                    ))}
                  </select>
                  {products.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      No approved products available. Check the{" "}
                      <Link href="/dashboard/content-library" className="text-green-600 hover:text-green-700">
                        Content Library
                      </Link>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Affiliate Link *
                  </label>
                  <input
                    type="url"
                    value={formData.affiliate_link}
                    onChange={(e) => setFormData(prev => ({ ...prev, affiliate_link: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="https://affiliate-platform.com/track/your-link"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                      <option value="social">Social Media</option>
                      <option value="blog">Blog Content</option>
                      <option value="video">Video Content</option>
                      <option value="ads">Paid Advertising</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Audience
                    </label>
                    <input
                      type="text"
                      value={formData.target_audience}
                      onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., Health enthusiasts, 25-45"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createCampaign}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Create Campaign
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Campaigns List */}
        <div className="space-y-6">
          {campaigns.length > 0 ? (
            campaigns.map((campaign) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {campaign.name}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          campaign.status
                        )}`}
                      >
                        {campaign.status}
                      </span>
                    </div>
                    <p className="text-gray-600">
                      Promoting: <span className="font-medium">{campaign.product_name}</span> by {campaign.product_creator}
                    </p>
                    <p className="text-sm text-gray-500">
                      {campaign.content_type} • Target: {campaign.target_audience || "General"}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleCampaignStatus(campaign.id, campaign.status)}
                      className={`px-3 py-1 text-sm rounded-lg ${
                        campaign.status === "active"
                          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                          : "bg-green-100 text-green-800 hover:bg-green-200"
                      }`}
                    >
                      {campaign.status === "active" ? "Pause" : "Activate"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-6 mb-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">
                      {campaign.clicks.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Clicks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-600">
                      {campaign.conversions}
                    </div>
                    <div className="text-sm text-gray-600">Conversions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">
                      {formatCurrency(campaign.earnings)}
                    </div>
                    <div className="text-sm text-gray-600">Earnings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-orange-600">
                      {campaign.clicks > 0 ? ((campaign.conversions / campaign.clicks) * 100).toFixed(1) : "0.0"}%
                    </div>
                    <div className="text-sm text-gray-600">Conversion Rate</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Created: {new Date(campaign.created_at).toLocaleDateString()}</span>
                    <span>Updated: {new Date(campaign.last_updated).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <a
                      href={campaign.affiliate_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      View Link →
                    </a>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
              <div className="text-gray-400 text-6xl mb-4">🚀</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No campaigns yet
              </h3>
              <p className="text-gray-500 mb-6">
                Create your first affiliate campaign to start earning commissions.
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 mr-4"
                >
                  Create Your First Campaign
                </button>
                <Link
                  href="/dashboard/content-library"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Browse Products to Promote
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}