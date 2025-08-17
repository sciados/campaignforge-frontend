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
} from "lucide-react";

// Types
interface AITool {
  id: string;
  name: string;
  provider_name: string;
  quality_rating: number;
  cost_rating: number;
  overall_rating: number;
  is_currently_used: boolean;
  capabilities: string[];
  pricing_model: Record<string, any>;
  last_checked?: string;
  performance_metrics: Record<string, any>;
}

interface AIToolsDashboardData {
  success: boolean;
  top_tools_by_category: Record<string, AITool[]>;
  summary: {
    total_active_tools: number;
    currently_used_tools: number;
    average_rating: number;
    categories: string[];
    last_updated: string;
  };
  monitoring_status: {
    is_running: boolean;
    last_check: string;
  };
}

interface AIMonitoringStatus {
  success: boolean;
  is_running: boolean;
  configuration: {
    test_interval_minutes: number;
    rating_update_interval_minutes: number;
    discovery_interval_hours: number;
  };
  last_check: string;
}

const LiveAIToolsDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] =
    useState<AIToolsDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [monitoringStatus, setMonitoringStatus] =
    useState<AIMonitoringStatus | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // API base URL for AI Discovery Service
  const AI_DISCOVERY_URL =
    "https://ai-discovery-service-production.up.railway.app";

  // Fetch dashboard data
  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${AI_DISCOVERY_URL}/api/v1/ai-tools/dashboard`
      );
      if (!response.ok) throw new Error("Failed to fetch dashboard data");

      const data: AIToolsDashboardData = await response.json();
      setDashboardData(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [AI_DISCOVERY_URL]);

  // Fetch monitoring status
  const fetchMonitoringStatus = useCallback(async () => {
    try {
      const response = await fetch(
        `${AI_DISCOVERY_URL}/api/v1/ai-tools/monitoring/status`
      );
      if (!response.ok) throw new Error("Failed to fetch monitoring status");

      const data: AIMonitoringStatus = await response.json();
      setMonitoringStatus(data);
    } catch (err) {
      console.error("Monitoring status error:", err);
    }
  }, [AI_DISCOVERY_URL]);

  // Start monitoring
  const startMonitoring = useCallback(async () => {
    try {
      const response = await fetch(
        `${AI_DISCOVERY_URL}/api/v1/ai-tools/monitoring/start`,
        {
          method: "POST",
        }
      );
      if (!response.ok) throw new Error("Failed to start monitoring");

      await fetchMonitoringStatus();
    } catch (err) {
      console.error("Start monitoring error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to start monitoring";
      setError(errorMessage);
    }
  }, [AI_DISCOVERY_URL, fetchMonitoringStatus]);

  // Initialize system
  const initializeSystem = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${AI_DISCOVERY_URL}/api/v1/ai-tools/setup/full-initialization`,
        {
          method: "POST",
        }
      );
      if (!response.ok) throw new Error("Failed to initialize system");

      const result = await response.json();
      console.log("System initialized:", result);

      // Refresh dashboard after initialization
      await fetchDashboard();
      await fetchMonitoringStatus();
    } catch (err) {
      console.error("Initialize error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to initialize system";
      setError(errorMessage);
    }
  }, [AI_DISCOVERY_URL, fetchDashboard, fetchMonitoringStatus]);

  // Auto-refresh dashboard
  useEffect(() => {
    fetchDashboard();
    fetchMonitoringStatus();

    const interval = setInterval(() => {
      fetchDashboard();
      fetchMonitoringStatus();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [fetchDashboard, fetchMonitoringStatus]);

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

  // Tool card component
  const ToolCard: React.FC<{ tool: AITool; rank: number }> = ({
    tool,
    rank,
  }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
            {rank}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{tool.name}</h3>
            <p className="text-sm text-gray-500">{tool.provider_name}</p>
          </div>
        </div>
        {tool.is_currently_used && (
          <CheckCircle
            className="w-5 h-5 text-green-500"
            aria-label="Currently Used"
          />
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Overall Rating</span>
          <StarRating rating={tool.overall_rating} />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Quality</span>
          <StarRating rating={tool.quality_rating} size="w-3 h-3" />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Cost</span>
          <StarRating rating={tool.cost_rating} size="w-3 h-3" />
        </div>
      </div>

      {tool.capabilities && tool.capabilities.length > 0 && (
        <div className="mt-3">
          <div className="flex flex-wrap gap-1">
            {tool.capabilities
              .slice(0, 3)
              .map((capability: string, idx: number) => (
                <span
                  key={idx}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                >
                  {capability.replace("_", " ")}
                </span>
              ))}
            {tool.capabilities.length > 3 && (
              <span className="text-xs text-gray-500">
                +{tool.capabilities.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Category section component
  const CategorySection: React.FC<{
    categoryName: string;
    tools: AITool[];
  }> = ({ categoryName, tools }) => {
    const displayName = categoryName
      .replace("_", " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-bold text-gray-900">{displayName}</h2>
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            Top {tools.length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool, index) => (
            <ToolCard key={tool.id} tool={tool} rank={index + 1} />
          ))}
        </div>
      </div>
    );
  };

  // Status indicator component
  const StatusIndicator: React.FC<{
    status: boolean | string;
    label: string;
  }> = ({ status, label }) => {
    const getStatusColor = (status: boolean | string): string => {
      switch (status) {
        case "healthy":
        case "active":
        case true:
          return "text-green-600 bg-green-100";
        case "degraded":
        case "warning":
          return "text-yellow-600 bg-yellow-100";
        case "error":
        case "critical":
        case false:
          return "text-red-600 bg-red-100";
        default:
          return "text-gray-600 bg-gray-100";
      }
    };

    return (
      <div
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
          status
        )}`}
      >
        <div
          className={`w-2 h-2 rounded-full mr-1 ${
            status ? "bg-current" : "bg-gray-400"
          }`}
        ></div>
        {label}
      </div>
    );
  };

  if (isLoading && !dashboardData) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-lg">Loading AI Tools Dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h2 className="text-lg font-semibold text-red-900">
              Dashboard Error
            </h2>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={initializeSystem}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Initialize System
            </button>
            <button
              onClick={fetchDashboard}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Live AI Tools Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Real-time monitoring and ratings for your AI providers
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
            onClick={fetchDashboard}
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
              <p className="text-sm text-gray-600">Total Tools</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.summary?.total_active_tools || 0}
              </p>
            </div>
            <Activity className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Currently Used</p>
              <p className="text-2xl font-bold text-green-600">
                {dashboardData?.summary?.currently_used_tools || 0}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-yellow-600">
                {dashboardData?.summary?.average_rating?.toFixed(1) || "0.0"}★
              </p>
            </div>
            <Star className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monitoring</p>
              <div className="mt-1">
                <StatusIndicator
                  status={monitoringStatus?.is_running || false}
                  label={monitoringStatus?.is_running ? "Active" : "Stopped"}
                />
              </div>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* System Status */}
      {(!monitoringStatus?.is_running ||
        !dashboardData?.summary?.total_active_tools) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900">
                System Setup Required
              </h3>
              <p className="text-yellow-700 mt-1">
                {!dashboardData?.summary?.total_active_tools
                  ? "No AI tools found. Initialize the system to seed your current tools."
                  : "Monitoring is not running. Start monitoring to get live performance data."}
              </p>
              <div className="flex gap-3 mt-4">
                {!dashboardData?.summary?.total_active_tools && (
                  <button
                    onClick={initializeSystem}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Initialize System
                  </button>
                )}
                {!monitoringStatus?.is_running && (
                  <button
                    onClick={startMonitoring}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Start Monitoring
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tools by Category */}
      {dashboardData?.top_tools_by_category &&
      Object.keys(dashboardData.top_tools_by_category).length > 0 ? (
        <div>
          {Object.entries(dashboardData.top_tools_by_category).map(
            ([category, tools]) => (
              <CategorySection
                key={category}
                categoryName={category}
                tools={tools}
              />
            )
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Tools Data Available
          </h3>
          <p className="text-gray-600 mb-6">
            Initialize the system to start tracking your AI tools.
          </p>
          <button
            onClick={initializeSystem}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Initialize AI Tools System
          </button>
        </div>
      )}

      {/* Footer with system info */}
      {dashboardData && (
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                System Status
              </h4>
              <ul className="space-y-1">
                <li>
                  Last Updated:{" "}
                  {dashboardData.summary?.last_updated
                    ? new Date(
                        dashboardData.summary.last_updated
                      ).toLocaleString()
                    : "Never"}
                </li>
                <li>
                  Categories: {dashboardData.summary?.categories?.length || 0}
                </li>
                <li>
                  Monitoring:{" "}
                  {monitoringStatus?.is_running ? "✅ Active" : "❌ Stopped"}
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Performance Tracking
              </h4>
              <ul className="space-y-1">
                <li>Response Time: Every 5 minutes</li>
                <li>Rating Updates: Every hour</li>
                <li>Market Scan: Every 24 hours</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Rating Algorithm
              </h4>
              <ul className="space-y-1">
                <li>Quality Weight: 70%</li>
                <li>Cost Weight: 30%</li>
                <li>Scale: 0-5 stars</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveAIToolsDashboard;
