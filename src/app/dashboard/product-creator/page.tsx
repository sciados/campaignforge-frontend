// src/app/dashboard/product-creator/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useApi } from "@/lib/api";
import ProductCreatorDashboard from "@/components/dashboards/product-creator/ProductCreatorDashboard";

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

export default function ProductCreatorDashboardPage() {
  const api = useApi();
  const [config, setConfig] = useState<DashboardConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardConfig = useCallback(async () => {
    try {
      setError(null);
      console.log("Loading product creator dashboard config...");

      // Create a product creator specific config
      const configData = {
        user_profile: {
          user_type_display: "Product Creator",
          usage_summary: {
            campaigns: { used: 0, limit: 0, percentage: 0 },
            analysis: { used: 0, limit: 20, percentage: 0 }
          }
        },
        primary_widgets: ["url_submission", "submission_tracking", "analysis_results"],
        dashboard_title: "Product Creator Dashboard",
        main_cta: "Submit URLs",
        theme_color: "blue"
      };

      console.log("Product creator dashboard config loaded:", configData);
      setConfig(configData);
    } catch (error) {
      console.error("Failed to load dashboard config:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load dashboard configuration";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardConfig();
  }, [fetchDashboardConfig]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Loading your product creator dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Unable to load dashboard
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-4">
            <button
              onClick={fetchDashboardConfig}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
            <button
              onClick={() => (window.location.href = "/login")}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No dashboard configuration found
          </h2>
          <button
            onClick={fetchDashboardConfig}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  return <ProductCreatorDashboard config={config} />;
}