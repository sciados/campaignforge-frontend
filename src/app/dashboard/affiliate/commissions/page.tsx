"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useApi } from "@/lib/api";

interface CommissionData {
  id: string;
  campaign_name: string;
  product_creator: string;
  clicks: number;
  conversions: number;
  conversion_rate: number;
  commission_rate: number;
  earnings: number;
  status: "pending" | "paid" | "processing";
  created_at: string;
}

interface CommissionSummary {
  total_earnings: number;
  pending_commissions: number;
  paid_commissions: number;
  this_month_earnings: number;
  avg_conversion_rate: number;
  top_performing_campaign: string;
}

export default function CommissionsPage() {
  const api = useApi();
  const [commissions, setCommissions] = useState<CommissionData[]>([]);
  const [summary, setSummary] = useState<CommissionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState("30"); // days

  useEffect(() => {
    loadCommissionData();
  }, [timeFilter]);

  const loadCommissionData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      // Fetch commission data with real API calls
      const [commissionsResponse, summaryResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://campaign-backend-production-e2db.up.railway.app"}/api/affiliate/commissions?days=${timeFilter}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://campaign-backend-production-e2db.up.railway.app"}/api/affiliate/commissions/summary?days=${timeFilter}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
      ]);

      if (commissionsResponse.ok && summaryResponse.ok) {
        const commissionsData = await commissionsResponse.json();
        const summaryData = await summaryResponse.json();

        setCommissions(commissionsData.commissions || []);
        setSummary(summaryData);
      } else {
        // If API not available, show empty state instead of mock data
        setCommissions([]);
        setSummary({
          total_earnings: 0,
          pending_commissions: 0,
          paid_commissions: 0,
          this_month_earnings: 0,
          avg_conversion_rate: 0,
          top_performing_campaign: "None"
        });
      }
    } catch (error) {
      console.error("Failed to load commission data:", error);
      setError("Unable to load commission data. Please try again later.");
      setCommissions([]);
      setSummary(null);
    } finally {
      setIsLoading(false);
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
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">💰 Commission Tracking</h1>
            <p className="text-gray-600 mt-2">
              Monitor your affiliate earnings and commission performance
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            <button
              onClick={loadCommissionData}
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

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-lg shadow-sm border"
            >
              <div className="text-sm text-gray-600 mb-1">Total Earnings</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.total_earnings)}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-lg shadow-sm border"
            >
              <div className="text-sm text-gray-600 mb-1">Pending</div>
              <div className="text-2xl font-bold text-yellow-600">
                {formatCurrency(summary.pending_commissions)}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-lg shadow-sm border"
            >
              <div className="text-sm text-gray-600 mb-1">Avg Conversion Rate</div>
              <div className="text-2xl font-bold text-blue-600">
                {summary.avg_conversion_rate.toFixed(1)}%
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-lg shadow-sm border"
            >
              <div className="text-sm text-gray-600 mb-1">Top Campaign</div>
              <div className="text-sm font-bold text-purple-600 truncate">
                {summary.top_performing_campaign}
              </div>
            </motion.div>
          </div>
        )}

        {/* Commission Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm border overflow-hidden"
        >
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Commission History
            </h2>
          </div>

          {commissions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campaign & Product Creator
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commission
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Earnings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {commissions.map((commission) => (
                    <tr key={commission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {commission.campaign_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            by {commission.product_creator}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {commission.clicks} clicks • {commission.conversions} conversions
                        </div>
                        <div className="text-sm text-gray-500">
                          {commission.conversion_rate.toFixed(1)}% conversion rate
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {commission.commission_rate}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-green-600">
                          {formatCurrency(commission.earnings)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            commission.status
                          )}`}
                        >
                          {commission.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(commission.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">💸</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No commission data yet
              </h3>
              <p className="text-gray-500 mb-6">
                Start promoting products to see your commission earnings here.
              </p>
              <a
                href="/dashboard/content-library"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Browse Products to Promote
              </a>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
