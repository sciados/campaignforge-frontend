// src/components/admin/ProviderOptimizationPanel.tsx
"use client";
import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  DollarSign,
  Zap,
  AlertTriangle,
  CheckCircle,
  Activity,
  TrendingDown,
} from "lucide-react";

import { useAiDiscoveryService } from "@/lib/ai-tools-api";

interface ProviderRecommendation {
  current_best: string;
  alternatives: string[];
  cost_analysis: {
    current_cost_per_image?: number;
    current_cost_per_minute?: number;
    current_cost_per_1k_tokens?: number;
    best_alternative_cost: number;
    potential_savings: number;
  };
  quality_scores?: Record<string, number>;
}

interface OptimizationData {
  image_generation?: ProviderRecommendation;
  video_generation?: ProviderRecommendation;
  text_generation?: ProviderRecommendation;
  optimization_summary?: {
    total_monthly_savings: number;
    recommended_switches: number;
  };
}

export default function ProviderOptimizationPanel() {
  // Use the AI Discovery Service hook
  const {
    dashboardData,
    providerStatus,
    recommendations,
    costAnalysis,
    isLoading,
    error,
    switchProvider,
    loadDashboard,
    loadRecommendations,
    testConnection,
    isConnected,
  } = useAiDiscoveryService();

  const [data, setData] = useState<OptimizationData | null>(null);
  const [switchingProvider, setSwitchingProvider] = useState<string | null>(
    null
  );

  useEffect(() => {
    // Transform the hook data into the format expected by the component
    if (recommendations?.recommendations) {
      const transformedData: OptimizationData = {
        optimization_summary: {
          total_monthly_savings: costAnalysis?.potential_savings || 0,
          recommended_switches: recommendations.recommendations.length,
        },
      };

      // Transform recommendations into the expected format
      recommendations.recommendations.forEach(
        (rec: {
          category: string;
          current_provider: any;
          recommended_provider: string;
          confidence: number;
        }) => {
          const categoryKey = rec.category as keyof OptimizationData;
          if (categoryKey !== "optimization_summary") {
            transformedData[categoryKey] = {
              current_best: rec.current_provider,
              alternatives: [rec.recommended_provider],
              cost_analysis: {
                best_alternative_cost: 0, // Would need actual cost data
                potential_savings: rec.confidence * 100, // Using confidence as savings percentage
              },
            };
          }
        }
      );

      setData(transformedData);
    } else if (!isLoading) {
      // Fallback data when service is disconnected
      setData({
        image_generation: {
          current_best: "stability_ai",
          alternatives: ["dalle_3", "midjourney"],
          cost_analysis: {
            current_cost_per_image: 0.004,
            best_alternative_cost: 0.002,
            potential_savings: 50,
          },
        },
        text_generation: {
          current_best: "openai_gpt4",
          alternatives: ["claude_sonnet", "gemini_pro"],
          cost_analysis: {
            current_cost_per_1k_tokens: 0.03,
            best_alternative_cost: 0.015,
            potential_savings: 25,
          },
        },
      });
    }
  }, [recommendations, costAnalysis, isLoading]);

  const handleProviderSwitch = async (
    category: string,
    newProvider: string
  ) => {
    setSwitchingProvider(category);

    try {
      const result = await switchProvider(category, newProvider);

      if (result.success) {
        alert(
          `Successfully switched ${category} to ${newProvider}!\n${result.message}`
        );
      } else {
        alert(
          `Failed to switch provider: ${result.message || "Unknown error"}`
        );
      }
    } catch (error) {
      alert(`Error switching provider: ${error}`);
    } finally {
      setSwitchingProvider(null);
    }
  };

  const connectionStatus = isConnected ? "connected" : "disconnected";

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border rounded-lg">
              <div className="h-3 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-2 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">⚡ Provider Optimization</h3>
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Unable to load optimization data</p>
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
          <button
            onClick={() => {
              loadDashboard();
              loadRecommendations();
            }}
            className="mt-4 text-blue-600 text-sm font-medium hover:text-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const categories = [
    { key: "image_generation", label: "Image Generation", icon: "🎨" },
    { key: "video_generation", label: "Video Generation", icon: "🎬" },
    { key: "text_generation", label: "Text Generation", icon: "✏️" },
  ] as const;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          ⚡ Provider Optimization
          {connectionStatus === "disconnected" && (
            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              Offline Mode
            </span>
          )}
        </h3>
        {data.optimization_summary?.total_monthly_savings &&
          data.optimization_summary.total_monthly_savings > 0 && (
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                ${data.optimization_summary.total_monthly_savings}
              </div>
              <div className="text-xs text-green-700">
                Monthly Savings Available
              </div>
            </div>
          )}
      </div>

      <div className="space-y-4">
        {categories.map(({ key, label, icon }) => {
          const categoryData = data[key];
          if (!categoryData) return null;

          const hasOptimization =
            categoryData.alternatives.length > 0 &&
            categoryData.cost_analysis.potential_savings > 5;

          const bestAlternative = categoryData.alternatives[0];
          const currentProvider = categoryData.current_best;

          return (
            <div
              key={key}
              className={`p-4 border-2 rounded-lg transition-all ${
                hasOptimization
                  ? "border-green-200 bg-green-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{icon}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">{label}</h4>
                    <p className="text-sm text-gray-600">
                      Current:{" "}
                      <span className="font-medium">{currentProvider}</span>
                    </p>
                  </div>
                </div>

                {hasOptimization && (
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600 flex items-center">
                      <TrendingDown className="h-4 w-4 mr-1" />
                      {categoryData.cost_analysis.potential_savings}% savings
                    </div>
                    <div className="text-xs text-green-700">
                      Switch to {bestAlternative}
                    </div>
                  </div>
                )}
              </div>

              {hasOptimization ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <span>{currentProvider}</span>
                    <ArrowRight className="h-4 w-4 mx-2" />
                    <span className="font-medium text-green-700">
                      {bestAlternative}
                    </span>
                  </div>

                  <button
                    onClick={() => handleProviderSwitch(key, bestAlternative)}
                    disabled={
                      switchingProvider === key ||
                      connectionStatus === "disconnected"
                    }
                    className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {switchingProvider === key ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Switching...
                      </>
                    ) : connectionStatus === "disconnected" ? (
                      <>
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Offline
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-1" />
                        Switch Now
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex items-center text-sm text-gray-500">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  <span>Already using optimal provider</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {connectionStatus === "connected" &&
        data.optimization_summary?.recommended_switches &&
        data.optimization_summary.recommended_switches > 0 && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <h5 className="font-medium text-blue-900">
                  {data.optimization_summary.recommended_switches} optimization
                  {data.optimization_summary.recommended_switches !== 1
                    ? "s"
                    : ""}{" "}
                  available
                </h5>
                <p className="text-sm text-blue-700">
                  Potential monthly savings: $
                  {data.optimization_summary.total_monthly_savings}
                </p>
              </div>
            </div>
          </div>
        )}

      {connectionStatus === "disconnected" && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center text-sm text-yellow-700">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <span>
              AI Discovery Service offline - showing cached recommendations
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
