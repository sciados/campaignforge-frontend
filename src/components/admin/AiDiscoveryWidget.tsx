// src/components/admin/AiDiscoveryWidget.tsx
"use client";
import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  TrendingUp,
  Zap,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  Clock,
  Brain,
  Wifi,
  WifiOff,
} from "lucide-react";

import {
  useAiDiscoveryService,
  aiDiscoveryUtils,
} from "@/lib/ai-discovery-service";

interface Discovery {
  id: string;
  company_name: string;
  ai_type: string;
  announcement: string;
  priority: "high" | "medium" | "low";
  api_available: boolean;
  cost_advantage?: number;
  discovered_date: string;
}

interface DiscoveryWidgetData {
  discoveries: Discovery[];
  summary: {
    total_found: number;
    high_priority: number;
    integration_ready: number;
    cost_savings_potential: number;
  };
  service_status: "connected" | "disconnected" | "degraded";
}

export default function AiDiscoveryWidget() {
  // Use the AI Discovery Service hook
  const {
    dashboardData,
    providerStatus,
    connectionStatus,
    recommendations,
    costAnalysis,
    isLoading,
    error,
    isConnected,
    hasRecommendations,
    totalProviders,
    healthyProviders,
    testConnection,
    loadDashboard,
    refreshAll,
  } = useAiDiscoveryService();

  const [data, setData] = useState<DiscoveryWidgetData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Transform hook data into widget format
  useEffect(() => {
    if (dashboardData || recommendations || !isLoading) {
      // Create mock discoveries from recommendations data
      const discoveries: Discovery[] = [];

      if (recommendations?.recommendations) {
        recommendations.recommendations.forEach(
          (
            rec: {
              recommended_provider: string;
              category: string;
              reason: any;
              confidence: number;
            },
            index: any
          ) => {
            discoveries.push({
              id: `discovery-${index}`,
              company_name: rec.recommended_provider
                .replace("_", " ")
                .toUpperCase(),
              ai_type: aiDiscoveryUtils.getCategoryDisplayName(rec.category),
              announcement: rec.reason,
              priority:
                rec.confidence > 0.8
                  ? "high"
                  : rec.confidence > 0.5
                  ? "medium"
                  : "low",
              api_available: true,
              cost_advantage: Math.round(rec.confidence * 50), // Mock cost advantage
              discovered_date: new Date().toISOString(),
            });
          }
        );
      }

      // Create summary from available data
      const summary = {
        total_found: discoveries.length,
        high_priority: discoveries.filter((d) => d.priority === "high").length,
        integration_ready: discoveries.filter((d) => d.api_available).length,
        cost_savings_potential: costAnalysis?.potential_savings || 0,
      };

      setData({
        discoveries,
        summary,
        service_status: isConnected ? "connected" : "disconnected",
      });

      if (discoveries.length > 0 || isConnected) {
        setLastUpdated(new Date());
      }
    }
  }, [dashboardData, recommendations, costAnalysis, isConnected, isLoading]);

  const handleRefresh = async () => {
    try {
      await refreshAll();
    } catch (error) {
      console.error("Refresh failed:", error);
    }
  };

  const handleTestConnection = async () => {
    try {
      await testConnection();
    } catch (error) {
      console.error("Connection test failed:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error || !data || data.service_status === "disconnected") {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-center mb-3">
          <WifiOff className="h-5 w-5 text-yellow-600 mr-2" />
          <h3 className="text-yellow-800 font-medium">AI Discovery Service</h3>
        </div>
        <p className="text-yellow-700 text-sm mb-3">
          {error || "Service unavailable - running in offline mode"}
        </p>
        <div className="flex space-x-2">
          <button
            onClick={handleRefresh}
            className="text-yellow-800 text-sm font-medium hover:text-yellow-900 flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </button>
          <button
            onClick={handleTestConnection}
            className="text-yellow-800 text-sm font-medium hover:text-yellow-900 flex items-center"
          >
            <Wifi className="h-4 w-4 mr-1" />
            Test Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          🔍 AI Discovery Intelligence
          {data.service_status === "connected" && (
            <Wifi className="h-4 w-4 ml-2 text-green-500" />
          )}
          {data.service_status === "degraded" && (
            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              Limited
            </span>
          )}
        </h3>
        <button
          onClick={handleRefresh}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {data.summary.total_found}
          </div>
          <div className="text-xs text-blue-700">Optimizations Found</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {data.summary.high_priority}
          </div>
          <div className="text-xs text-green-700">High Priority</div>
        </div>
      </div>

      {/* System Health Status */}
      {totalProviders > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-medium text-gray-900">System Health</h5>
              <p className="text-sm text-gray-600">
                {healthyProviders}/{totalProviders} providers healthy
              </p>
            </div>
            <div
              className={`h-3 w-3 rounded-full ${
                healthyProviders === totalProviders
                  ? "bg-green-500"
                  : healthyProviders > totalProviders * 0.7
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
            />
          </div>
        </div>
      )}

      {/* Recent Discoveries */}
      <div className="space-y-3 mb-4">
        {data.discoveries.length > 0 ? (
          data.discoveries.slice(0, 3).map((discovery) => (
            <div
              key={discovery.id}
              className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {discovery.company_name}
                  </h4>
                  <p className="text-sm text-gray-600">{discovery.ai_type}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {discovery.api_available && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      Available
                    </span>
                  )}
                  <span
                    className={`text-xs px-2 py-1 rounded font-medium ${
                      discovery.priority === "high"
                        ? "bg-red-100 text-red-800"
                        : discovery.priority === "medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {discovery.priority.toUpperCase()}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-2">
                {discovery.announcement}
              </p>

              {discovery.cost_advantage && discovery.cost_advantage > 0 && (
                <div className="flex items-center text-sm text-green-700">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>{discovery.cost_advantage}% potential improvement</span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">
              {isConnected
                ? "No optimizations available"
                : "No discovery data available"}
            </p>
            <p className="text-gray-400 text-xs">
              {isConnected
                ? "Your AI providers are already optimal"
                : "Connect to discovery service for insights"}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        {hasRecommendations && (
          <button
            onClick={() => (window.location.href = "/admin/ai-optimization")}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            View All Recommendations ({data.summary.total_found})
          </button>
        )}

        {data.summary.cost_savings_potential > 0 && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-green-900">
                  Savings Available
                </h5>
                <p className="text-sm text-green-700">
                  ${data.summary.cost_savings_potential}/month potential
                </p>
              </div>
              <Zap className="h-5 w-5 text-green-600" />
            </div>
          </div>
        )}

        {!isConnected && (
          <button
            onClick={handleTestConnection}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium flex items-center justify-center"
          >
            <Wifi className="h-4 w-4 mr-2" />
            Connect to Discovery Service
          </button>
        )}
      </div>

      {lastUpdated && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
}
