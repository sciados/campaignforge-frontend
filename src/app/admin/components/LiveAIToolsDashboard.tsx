// src/app/admin/components/LiveAIToolsDashboard.tsx
// FIXED: Updated to use actual AI Discovery Service endpoints

import React, { useState, useEffect, useCallback } from "react";
import {
  Star,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  Bot,
  Zap,
  Settings,
} from "lucide-react";
import { useAiDiscoveryService } from "@/lib/ai-discovery-service";

// Updated types to match actual AI Discovery Service
interface AIProvider {
  provider_name: string;
  category: string;
  is_active: boolean;
  status: "healthy" | "degraded" | "error";
  response_time_ms: number;
  error_rate: number;
  last_check: string;
  capabilities: string[];
  cost_per_request?: number;
}

interface ProviderRecommendation {
  category: string;
  current_provider: string;
  recommended_provider: string;
  reason: string;
  estimated_improvement: string;
  confidence: number;
  priority: "high" | "medium" | "low";
}

const LiveAIToolsDashboard: React.FC = () => {
  const {
    connectionStatus,
    recommendations,
    recentDiscoveries,
    healthStatus,
    dashboardData,
    providerStatus,
    costAnalysis,
    isLoading,
    error,
    isConnected,
    hasRecommendations,
    totalProviders,
    healthyProviders,
    testConnection,
    loadDashboard,
    loadProviderStatus,
    loadRecommendations,
    refreshAll,
    switchProvider,
  } = useAiDiscoveryService();

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [switching, setSwitching] = useState<string | null>(null);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshAll();
      setLastUpdated(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshAll]);

  // Update last updated when data changes
  useEffect(() => {
    if (connectionStatus || dashboardData || providerStatus.length > 0) {
      setLastUpdated(new Date());
    }
  }, [connectionStatus, dashboardData, providerStatus]);

  // Handle provider switch
  const handleProviderSwitch = async (
    category: string,
    newProvider: string
  ) => {
    try {
      setSwitching(`${category}-${newProvider}`);
      const result = await switchProvider(category, newProvider);

      if (result.success) {
        alert(`✅ Successfully switched ${category} to ${newProvider}`);
      } else {
        alert(`❌ Failed to switch provider: ${result.message}`);
      }
    } catch (err) {
      console.error("Provider switch error:", err);
      alert(
        "❌ Provider switch failed: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setSwitching(null);
    }
  };

  // Star rating component
  const StarRating: React.FC<{ rating: number; size?: string }> = ({
    rating,
    size = "w-4 h-4",
  }) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className={`${size} fill-yellow-400 text-yellow-400`} />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star className={`${size} text-gray-300`} />
            <Star
              className={`${size} fill-yellow-400 text-yellow-400 absolute top-0 left-0`}
              style={{ clipPath: "inset(0 50% 0 0)" }}
            />
          </div>
        );
      } else {
        stars.push(<Star key={i} className={`${size} text-gray-300`} />);
      }
    }

    return (
      <div className="flex items-center gap-1">
        {stars}
        <span className="text-sm font-medium ml-1">
          {(rating || 0).toFixed(1)}
        </span>
      </div>
    );
  };

  // Status badge component
  const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const getStatusConfig = (status: string) => {
      switch (status) {
        case "healthy":
          return { color: "bg-green-100 text-green-800", icon: CheckCircle };
        case "degraded":
          return { color: "bg-yellow-100 text-yellow-800", icon: AlertCircle };
        case "error":
          return { color: "bg-red-100 text-red-800", icon: AlertCircle };
        default:
          return { color: "bg-gray-100 text-gray-800", icon: Settings };
      }
    };

    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Provider card component
  const ProviderCard: React.FC<{ provider: AIProvider }> = ({ provider }) => {
    // Calculate a simple rating based on performance
    const performanceRating = Math.max(
      1,
      Math.min(
        5,
        5 - provider.response_time_ms / 1000 - provider.error_rate / 2
      )
    );

    const costRating = provider.cost_per_request
      ? Math.max(1, Math.min(5, 5 - provider.cost_per_request * 1000))
      : 3.5;

    const overallRating = (performanceRating + costRating) / 2;

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">
              {provider.provider_name}
            </h3>
            <p className="text-sm text-gray-500 capitalize">
              {provider.category.replace("_", " ")}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <StatusBadge status={provider.status} />
            {provider.is_active && (
              <span className="text-xs text-blue-600 font-medium">Active</span>
            )}
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Overall</span>
            <StarRating rating={overallRating} />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Performance</span>
            <StarRating rating={performanceRating} size="w-3 h-3" />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Cost</span>
            <StarRating rating={costRating} size="w-3 h-3" />
          </div>
        </div>

        <div className="space-y-1 text-xs text-gray-500">
          <div>Response: {provider.response_time_ms}ms</div>
          <div>Error Rate: {provider.error_rate.toFixed(1)}%</div>
          {provider.cost_per_request && (
            <div>Cost: ${provider.cost_per_request.toFixed(4)}/req</div>
          )}
        </div>

        {provider.capabilities && provider.capabilities.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-1">
              {provider.capabilities.slice(0, 3).map((capability, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                >
                  {capability.replace("_", " ")}
                </span>
              ))}
              {provider.capabilities.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{provider.capabilities.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Recommendation card component
  const RecommendationCard: React.FC<{
    recommendation: ProviderRecommendation;
    onSwitch: (category: string, provider: string) => void;
  }> = ({ recommendation, onSwitch }) => {
    const isProcessing =
      switching ===
      `${recommendation.category}-${recommendation.recommended_provider}`;

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 capitalize">
              {recommendation.category.replace("_", " ")}
            </h3>
            <div className="text-sm text-gray-600 mt-1">
              <span className="text-red-600">
                {recommendation.current_provider}
              </span>
              <span className="mx-2">→</span>
              <span className="text-green-600">
                {recommendation.recommended_provider}
              </span>
            </div>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              recommendation.priority === "high"
                ? "bg-red-100 text-red-800"
                : recommendation.priority === "medium"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {recommendation.priority} priority
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <p className="text-sm text-gray-700">{recommendation.reason}</p>
          <p className="text-sm text-blue-600 font-medium">
            {recommendation.estimated_improvement}
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Confidence:</span>
            <div className="flex items-center">
              <div className="w-20 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${recommendation.confidence}%` }}
                ></div>
              </div>
              <span className="ml-2 text-gray-600">
                {recommendation.confidence}%
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() =>
            onSwitch(
              recommendation.category,
              recommendation.recommended_provider
            )
          }
          disabled={isProcessing}
          className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            isProcessing
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Switching...
            </div>
          ) : (
            "Apply Recommendation"
          )}
        </button>
      </div>
    );
  };

  if (isLoading && !isConnected && !error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-lg">
              Connecting to AI Discovery Service...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !isConnected) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h2 className="text-lg font-semibold text-red-900">
              AI Discovery Service Unavailable
            </h2>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <div className="bg-red-100 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-red-900 mb-2">Setup Required:</h3>
            <ul className="text-red-800 text-sm space-y-1 list-disc list-inside">
              <li>Deploy the AI Discovery Service to Railway</li>
              <li>Set AI_DISCOVERY_SERVICE_URL environment variable</li>
              <li>Restart the backend service</li>
            </ul>
          </div>
          <div className="flex gap-3">
            <button
              onClick={testConnection}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Test Connection
            </button>
            <button
              onClick={refreshAll}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentProviders = dashboardData?.current_providers || {};
  const categoryProviders = providerStatus.reduce((acc, provider) => {
    if (!acc[provider.category]) acc[provider.category] = [];
    acc[provider.category].push(provider);
    return acc;
  }, {} as Record<string, AIProvider[]>);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            AI Provider Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor performance and optimize your AI provider stack
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              Updated {lastUpdated.toLocaleTimeString()}
            </div>
          )}
          <button
            onClick={refreshAll}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Providers</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalProviders}
              </p>
            </div>
            <Bot className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Healthy Providers</p>
              <p className="text-2xl font-bold text-green-600">
                {healthyProviders}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Recommendations</p>
              <p className="text-2xl font-bold text-yellow-600">
                {recommendations?.recommendations?.length || 0}
              </p>
            </div>
            <Star className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Discovery Status</p>
              <div className="mt-1">
                <StatusBadge status={isConnected ? "healthy" : "error"} />
              </div>
            </div>
            <Activity className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      {hasRecommendations && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-yellow-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Optimization Recommendations
            </h2>
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
              {recommendations?.recommendations?.length || 0} available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations?.recommendations?.map(
              (
                rec: ProviderRecommendation,
                index: React.Key | null | undefined
              ) => (
                <RecommendationCard
                  key={index}
                  recommendation={rec}
                  onSwitch={handleProviderSwitch}
                />
              )
            )}
          </div>
        </div>
      )}

      {/* Providers by Category */}
      {Object.keys(categoryProviders).length > 0 ? (
        <div>
          {Object.entries(categoryProviders).map(([category, providers]) => (
            <div key={category} className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-bold text-gray-900 capitalize">
                  {category.replace("_", " ")} Providers
                </h2>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {providers.length} active
                </span>
                {currentProviders[category] && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Current: {currentProviders[category]}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {providers.map((provider, index) => (
                  <ProviderCard
                    key={`${provider.provider_name}-${index}`}
                    provider={provider}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Provider Data Available
          </h3>
          <p className="text-gray-600 mb-6">
            {isConnected
              ? "Provider data is loading. This may take a moment..."
              : "Connect to the AI Discovery Service to view provider data."}
          </p>
          <button
            onClick={isConnected ? refreshAll : testConnection}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isConnected ? "Refresh Data" : "Connect to Service"}
          </button>
        </div>
      )}

      {/* Cost Analysis Footer */}
      {costAnalysis && (
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Cost Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Daily Cost</p>
                  <p className="text-xl font-bold text-gray-900">
                    ${costAnalysis.current_daily_cost?.toFixed(2) || "0.00"}
                  </p>
                </div>
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Monthly Projection</p>
                  <p className="text-xl font-bold text-gray-900">
                    ${costAnalysis.monthly_projection?.toFixed(2) || "0.00"}
                  </p>
                </div>
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Potential Savings</p>
                  <p className="text-xl font-bold text-green-600">
                    $
                    {costAnalysis.optimization_potential?.recommended_savings?.toFixed(
                      2
                    ) || "0.00"}
                  </p>
                </div>
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveAIToolsDashboard;
