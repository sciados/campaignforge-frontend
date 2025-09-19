// src/app/dashboard/product-creator/quota/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw
} from "lucide-react";

interface QuotaData {
  current_period: {
    start_date: string;
    end_date: string;
    urls_submitted: number;
    max_urls_allowed: number;
    remaining_urls: number;
    usage_percentage: number;
  };
  historical_usage: Array<{
    month: string;
    urls_submitted: number;
    max_urls_allowed: number;
  }>;
  account_tier: string;
  upgrade_available: boolean;
}

const mockQuotaData: QuotaData = {
  current_period: {
    start_date: "2024-01-01",
    end_date: "2024-01-31",
    urls_submitted: 32,
    max_urls_allowed: 50,
    remaining_urls: 18,
    usage_percentage: 64
  },
  historical_usage: [
    { month: "Dec 2023", urls_submitted: 45, max_urls_allowed: 50 },
    { month: "Nov 2023", urls_submitted: 38, max_urls_allowed: 50 },
    { month: "Oct 2023", urls_submitted: 29, max_urls_allowed: 50 },
    { month: "Sep 2023", urls_submitted: 41, max_urls_allowed: 50 },
    { month: "Aug 2023", urls_submitted: 35, max_urls_allowed: 50 },
    { month: "Jul 2023", urls_submitted: 42, max_urls_allowed: 50 }
  ],
  account_tier: "Free",
  upgrade_available: true
};

const QuotaUsagePage: React.FC = () => {
  const [quotaData, setQuotaData] = useState<QuotaData>(mockQuotaData);
  const [isLoading, setIsLoading] = useState(false);

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600 bg-red-100";
    if (percentage >= 75) return "text-yellow-600 bg-yellow-100";
    return "text-green-600 bg-green-100";
  };

  const getUsageIcon = (percentage: number) => {
    if (percentage >= 90) return <AlertTriangle className="w-5 h-5" />;
    if (percentage >= 75) return <Clock className="w-5 h-5" />;
    return <CheckCircle className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quota & Usage</h1>
            <p className="text-gray-600 mt-2">Monitor your URL submission quota and usage patterns</p>
          </div>
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Current Period Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">URLs Submitted</p>
                <p className="text-2xl font-bold text-gray-900">{quotaData.current_period.urls_submitted}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Remaining Quota</p>
                <p className="text-2xl font-bold text-gray-900">{quotaData.current_period.remaining_urls}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Limit</p>
                <p className="text-2xl font-bold text-gray-900">{quotaData.current_period.max_urls_allowed}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Usage</p>
                <p className="text-2xl font-bold text-gray-900">{quotaData.current_period.usage_percentage}%</p>
              </div>
              <div className={`p-2 rounded-lg ${getUsageColor(quotaData.current_period.usage_percentage)}`}>
                {getUsageIcon(quotaData.current_period.usage_percentage)}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Usage Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Period Usage</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Progress: {quotaData.current_period.urls_submitted} of {quotaData.current_period.max_urls_allowed} URLs</span>
              <span>{quotaData.current_period.usage_percentage}% used</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  quotaData.current_period.usage_percentage >= 90
                    ? 'bg-red-500'
                    : quotaData.current_period.usage_percentage >= 75
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${quotaData.current_period.usage_percentage}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Period: {new Date(quotaData.current_period.start_date).toLocaleDateString()} - {new Date(quotaData.current_period.end_date).toLocaleDateString()}</span>
              {quotaData.current_period.usage_percentage >= 75 && (
                <span className="text-yellow-600 font-medium">⚠️ Approaching limit</span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Historical Usage Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Historical Usage</h3>
          <div className="space-y-4">
            {quotaData.historical_usage.reverse().map((month, index) => {
              const percentage = Math.round((month.urls_submitted / month.max_urls_allowed) * 100);
              return (
                <div key={month.month} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{month.month}</span>
                    <span className="text-gray-600">{month.urls_submitted}/{month.max_urls_allowed} URLs ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Account Tier & Upgrade */}
        {quotaData.upgrade_available && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Current Plan: {quotaData.account_tier}</h3>
                <p className="text-gray-600 mt-1">Upgrade to increase your monthly URL submission limit</p>
                <ul className="mt-3 space-y-1 text-sm text-gray-600">
                  <li>• Professional: 200 URLs/month</li>
                  <li>• Agency: Unlimited URLs</li>
                  <li>• Priority processing & support</li>
                </ul>
              </div>
              <div className="text-right">
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Upgrade Now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default QuotaUsagePage;