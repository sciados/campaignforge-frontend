// src/app/dashboard/creator/page.tsx
/**
 * Content Creator Dashboard Page
 * 🎬 Creator Studio Pro
 */

"use client";

import { useEffect, useState } from "react";
import CreatorDashboard from "@/components/dashboards/creator/CreatorDashboard";
import { useApi } from "@/lib/api";

export default function CreatorDashboardPage() {
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const api = useApi();

  useEffect(() => {
    fetchDashboardConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardConfig = async () => {
    try {
      const response = await api.getUserTypeConfig();
      const data = await response.json();

      if (data.success) {
        setConfig(data.config);
      }
    } catch (error) {
      console.error("Failed to load dashboard config:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Unable to load dashboard
          </h2>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return <CreatorDashboard config={config} />;
}
