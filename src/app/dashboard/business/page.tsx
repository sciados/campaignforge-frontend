// src/app/dashboard/business/page.tsx
/**
 * Business Owner Dashboard Page
 * 🏢 Business Growth Command
 */

"use client";

import { useEffect, useState } from "react";
import BusinessDashboard from "@/components/dashboards/business/BusinessDashboard";
import { useApi } from "@/lib/api";

export default function BusinessDashboardPage() {
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return <BusinessDashboard config={config} />;
}
