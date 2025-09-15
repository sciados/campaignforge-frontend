// src/app/dashboard/affiliate/page.tsx - FIXED VERSION
"use client";

import { useCallback, useEffect, useState } from "react";
import { useApi } from "@/lib/api";
import AffiliateDashboard from "@/components/dashboards/affiliate/AffiliateDashboard";

export default function AffiliateDashboardPage() {
  const api = useApi();
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fix: Remove useCallback and api dependency to prevent infinite loop
  const fetchDashboardConfig = async () => {
    try {
      setError(null);
      console.log("Loading dashboard config...");

      // Explicitly pass the user_type to prevent undefined calls
      const configData = await api.getUserTypeConfig("affiliate_marketer");
      console.log("Dashboard config loaded:", configData);

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
  };

  // Fix: Use empty dependency array to run only once on mount
  useEffect(() => {
    // Only run if not already loaded to prevent loops
    if (!config && isLoading) {
      fetchDashboardConfig();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - runs only once

  // Manual retry function for error cases
  const handleRetry = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Retrying dashboard config...");

      // Explicitly pass the user_type to prevent undefined calls
      const configData = await api.getUserTypeConfig("affiliate_marketer");
      console.log("Dashboard config loaded:", configData);

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
  }, [api]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Loading your affiliate dashboard...
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
              onClick={handleRetry}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
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
            onClick={handleRetry}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  return <AffiliateDashboard config={config} />;
}
