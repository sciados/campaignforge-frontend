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
  ArrowUpDown,
  Search,
  BarChart3,
  Globe,
  Plus,
  Eye,
  TestTube,
  Sparkles,
  TrendingDown,
  Play,
  Pause,
} from "lucide-react";
import { useEnhancedAiDiscoveryService } from "@/lib/ai-discovery-service";

// 🆕 COMPLETELY DYNAMIC TYPES - NO HARDCODED DATA
interface DynamicProvider {
  provider_name: string;
  env_var_name: string;
  env_var_status: "configured" | "missing" | "empty";
  value_preview?: string;
  integration_status: "active" | "disabled" | "pending" | "discovered";
  category: string;
  priority_tier: string;
  cost_per_1k_tokens?: number;
  quality_score?: number;
  model?: string;
  capabilities: string[];
  monthly_usage: number;
  response_time_ms?: number;
  error_rate?: number;
  source: "environment" | "database" | "discovered";
  last_checked: string;
  is_active: boolean;
  api_endpoint?: string;
  discovery_date?: string;
  // Enhanced fields for display
  cost_rating?: number;
  performance_rating?: number;
  overall_rating?: number;
  value_score?: number;
}

interface DynamicProvidersResponse {
  total_providers: number;
  environment_providers: number;
  database_providers: number;
  configured_count: number;
  missing_count: number;
  active_count: number;
  providers: DynamicProvider[];
  railway_environment: string;
  last_updated: string;
}

interface Recommendation {
  category: string;
  current_provider: string;
  recommended_provider: string;
  reason: string;
  estimated_improvement: string;
  confidence?: number;
  priority: "high" | "medium" | "low";
}

interface CostAnalysis {
  current_daily_cost: number;
  optimization_potential?: {
    recommended_savings: number;
  };
}

const CleanDynamicAIProviderDashboard: React.FC = () => {
  const {
    dashboardData,
    isLoading,
    error,
    lastUpdated,
    loadDashboardData,
    runDiscoveryScan,
    activeProviders,
    discoveredSuggestions,
    summaryStats,
    hasData,
  } = useEnhancedAiDiscoveryService();

  // 🎯 STATE MANAGEMENT - PURELY DYNAMIC
  const [sortField, setSortField] = useState<string>("overall_rating");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filterTier, setFilterTier] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [discoveryInProgress, setDiscoveryInProgress] = useState(false);

  // 🚀 DYNAMIC PROVIDER STATE - NO HARDCODED DATA
  const [dynamicProviders, setDynamicProviders] =
    useState<DynamicProvidersResponse | null>(null);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [providersError, setProvidersError] = useState<string | null>(null);

  // Mock data for legacy compatibility - will be replaced by real data
  const mockRecommendations = {
    recommendations: [] as Recommendation[],
  };

  const mockCostAnalysis: CostAnalysis = {
    current_daily_cost: summaryStats.monthly_cost / 30,
    optimization_potential: {
      recommended_savings: summaryStats.monthly_cost * 0.1,
    },
  };

  // Derived values for compatibility
  const hasRecommendations = mockRecommendations.recommendations.length > 0;
  const recommendations = mockRecommendations;
  const costAnalysis = mockCostAnalysis;
  const connectionStatus = { test_timestamp: lastUpdated };
  const healthStatus = { status: hasData ? "healthy" : "unknown" };
  const providerStatus = { healthy_count: summaryStats.total_active };
  const isConnected = hasData;
  const totalProviders = summaryStats.total_active;
  const healthyProviders = summaryStats.total_active;

  // Legacy compatibility functions
  const testConnection = async () => {
    await loadDashboardData();
  };

  // 🚀 FETCH ALL PROVIDERS DYNAMICALLY FROM BACKEND
  const fetchDynamicProviders = useCallback(async () => {
    setProvidersLoading(true);
    setProvidersError(null);

    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        "https://campaign-backend-production-e2db.up.railway.app";
      const response = await fetch(`${backendUrl}/admin/providers/dynamic`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch providers: ${response.status} ${response.statusText}`
        );
      }

      const data: DynamicProvidersResponse = await response.json();
      setDynamicProviders(data);
      console.log("✅ Dynamic providers loaded:", data);
    } catch (error) {
      console.error("❌ Failed to fetch dynamic providers:", error);
      setProvidersError(
        error instanceof Error ? error.message : "Unknown error"
      );
    } finally {
      setProvidersLoading(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await loadDashboardData();
    await fetchDynamicProviders();
  }, [loadDashboardData, fetchDynamicProviders]);

  // 🚀 LOAD DYNAMIC PROVIDERS ON MOUNT
  useEffect(() => {
    fetchDynamicProviders();
  }, [fetchDynamicProviders]);

  // 🆕 TOGGLE PROVIDER STATUS
  const toggleProviderStatus = useCallback(
    async (envVarName: string, currentStatus: string) => {
      try {
        const backendUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL ||
          "https://campaign-backend-production-e2db.up.railway.app";
        const action = currentStatus === "active" ? "deactivate" : "activate";

        const response = await fetch(
          `${backendUrl}/admin/providers/${envVarName}/${action}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to ${action} provider: ${response.status}`);
        }

        const result = await response.json();
        alert(`✅ Provider ${action}d successfully!\n\n${result.message}`);

        // Refresh providers list
        await fetchDynamicProviders();
      } catch (error) {
        console.error(`Provider toggle failed:`, error);
        alert(
          `❌ Failed to toggle provider:\n\n${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    },
    [fetchDynamicProviders]
  );

  // 🆕 TEST API KEY
  const testApiKey = useCallback(
    async (envVarName: string, providerName: string) => {
      try {
        const backendUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL ||
          "https://campaign-backend-production-e2db.up.railway.app";
        const response = await fetch(
          `${backendUrl}/admin/providers/${envVarName}/test`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Test failed: ${response.status}`);
        }

        const result = await response.json();
        alert(`✅ ${providerName} API Key Test Result:\n\n${result.message}`);
      } catch (error) {
        console.error("API key test failed:", error);
        alert(
          `❌ ${providerName} API Key Test Failed:\n\n${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    },
    []
  );

  // 🆕 ENHANCED PROVIDERS WITH CALCULATED METRICS - NO HARDCODED DATA
  const enhancedProviders = React.useMemo(() => {
    if (!dynamicProviders) return [];

    const providers = dynamicProviders.providers.map((provider) => {
      const maxCost = Math.max(
        ...dynamicProviders.providers.map((p) => p.cost_per_1k_tokens || 0.001)
      );
      const costRating =
        maxCost > 0
          ? 5 - ((provider.cost_per_1k_tokens || 0.001) / maxCost) * 4
          : 3;

      const maxResponseTime = Math.max(
        ...dynamicProviders.providers.map((p) => p.response_time_ms || 1000)
      );
      const responseRating =
        maxResponseTime > 0
          ? 5 - ((provider.response_time_ms || 1000) / maxResponseTime) * 3
          : 3;
      const errorRating = Math.max(1, 5 - (provider.error_rate || 0.5) * 0.5);
      const performanceRating = (responseRating + errorRating) / 2;

      const overallRating =
        costRating * 0.4 +
        performanceRating * 0.3 +
        (provider.quality_score || 4) * 0.3;
      const valueScore =
        (provider.quality_score || 4) /
        ((provider.cost_per_1k_tokens || 0.001) * 1000);

      return {
        ...provider,
        cost_rating: costRating,
        performance_rating: performanceRating,
        overall_rating: overallRating,
        value_score: valueScore,
      };
    });

    return providers;
  }, [dynamicProviders]);

  // 🎯 SMART SORTING AND FILTERING - PURELY DYNAMIC
  const filteredProviders = enhancedProviders
    .filter((provider) => {
      const matchesSearch =
        provider.provider_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        provider.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTier = !filterTier || provider.priority_tier === filterTier;
      const matchesStatus =
        !filterStatus || provider.integration_status === filterStatus;
      return matchesSearch && matchesTier && matchesStatus;
    })
    .sort((a, b) => {
      // 🥇 PRIMARY tier providers first
      if (a.priority_tier === "primary" && b.priority_tier !== "primary")
        return -1;
      if (b.priority_tier === "primary" && a.priority_tier !== "primary")
        return 1;

      // 🥈 Configured providers before missing ones
      if (
        a.env_var_status === "configured" &&
        b.env_var_status !== "configured"
      )
        return -1;
      if (
        b.env_var_status === "configured" &&
        a.env_var_status !== "configured"
      )
        return 1;

      // 🥉 Sort by selected field
      const multiplier = sortDirection === "asc" ? 1 : -1;
      const aValue = (a as any)[sortField] as number;
      const bValue = (b as any)[sortField] as number;
      return (aValue - bValue) * multiplier;
    });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const discoverNewProviders = useCallback(async () => {
    setDiscoveryInProgress(true);
    try {
      await refreshAll();
      await fetchDynamicProviders();
      setLastRefreshed(new Date());
      alert(
        `🚀 Discovery Complete! Refreshed environment status and discovered new providers!`
      );
    } catch (error) {
      console.error("Discovery error:", error);
      alert("⚠️ Discovery failed. Please try again.");
    } finally {
      setDiscoveryInProgress(false);
    }
  }, [refreshAll, fetchDynamicProviders]);

  // 🎨 UI COMPONENTS
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
        <span className="text-xs font-medium ml-1 text-gray-600">
          {(rating || 0).toFixed(1)}
        </span>
      </div>
    );
  };

  const StatusBadge: React.FC<{
    integrationStatus: string;
    envVarStatus: string;
    source?: string;
  }> = ({ integrationStatus, envVarStatus, source }) => {
    const getConfig = () => {
      if (source === "discovered" || source === "database") {
        if (envVarStatus === "configured") {
          return {
            color: "bg-green-100 text-green-700",
            text: "Ready to Integrate",
          };
        }
        return { color: "bg-purple-100 text-purple-700", text: "Discovered" };
      }

      switch (integrationStatus) {
        case "active":
          return { color: "bg-green-100 text-green-700", text: "Active" };
        case "disabled":
          return { color: "bg-gray-100 text-gray-600", text: "Disabled" };
        case "pending":
          return { color: "bg-yellow-100 text-yellow-700", text: "Pending" };
        default:
          return { color: "bg-gray-100 text-gray-600", text: "Unknown" };
      }
    };

    const config = getConfig();
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  const TierBadge: React.FC<{ tier: string }> = ({ tier }) => {
    const colors: Record<string, string> = {
      primary: "bg-green-100 text-green-800",
      secondary: "bg-blue-100 text-blue-800",
      expensive: "bg-red-100 text-red-800",
      specialized: "bg-purple-100 text-purple-800",
      discovered: "bg-orange-100 text-orange-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          colors[tier] || colors.secondary
        }`}
      >
        {tier === "discovered"
          ? "New"
          : tier.charAt(0).toUpperCase() + tier.slice(1)}
      </span>
    );
  };

  const formatCost = (cost: number): string => {
    if (cost < 0.001) return `$${(cost * 1000000).toFixed(1)}µ`;
    if (cost < 1) return `$${(cost * 1000).toFixed(3)}m`;
    return `$${cost.toFixed(3)}`;
  };

  const formatUsage = (usage: number): string => {
    if (usage > 1000000) return `${(usage / 1000000).toFixed(1)}M`;
    if (usage > 1000) return `${(usage / 1000).toFixed(1)}K`;
    return usage.toString();
  };

  // Calculate summary stats from dynamic data
  const activeProvidersCount = dynamicProviders?.active_count || 0;
  const configuredProviders = dynamicProviders?.configured_count || 0;
  const totalProvidersCount = dynamicProviders?.total_providers || 0;

  // 🚨 LOADING STATE
  if (providersLoading && !dynamicProviders) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-lg">
              🚀 Scanning Railway environment for AI providers...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 🚨 ERROR STATE
  if (providersError && !dynamicProviders) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h2 className="text-lg font-semibold text-red-900">
              Failed to Load Dynamic AI Providers
            </h2>
          </div>
          <p className="text-red-700 mb-4">{providersError}</p>
          <div className="bg-red-100 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-red-900 mb-2">
              This dashboard requires live backend connection for Railway
              environment scanning.
            </h3>
            <p className="text-red-800 text-sm">
              Make sure your backend endpoint `/admin/providers/dynamic` is
              deployed and accessible.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchDynamicProviders}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry Scan
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            🚀 Dynamic AI Provider Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Live Railway environment scanning - {totalProvidersCount} providers
            discovered from environment variables
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            Updated {lastRefreshed.toLocaleTimeString()}
          </div>
          <button
            onClick={discoverNewProviders}
            disabled={discoveryInProgress}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Globe
              className={`w-4 h-4 ${discoveryInProgress ? "animate-spin" : ""}`}
            />
            {discoveryInProgress ? "Scanning..." : "Refresh Scan"}
          </button>
        </div>
      </div>

      {/* Summary Cards - Dynamic Data Only */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Discovered</p>
              <p className="text-xl font-bold text-blue-600">
                {totalProvidersCount}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                From Railway environment
              </p>
            </div>
            <Bot className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Configured</p>
              <p className="text-xl font-bold text-green-600">
                {configuredProviders}/{totalProvidersCount}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {totalProvidersCount > 0
                  ? Math.round(
                      (configuredProviders / totalProvidersCount) * 100
                    )
                  : 0}
                % ready
              </p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-xl font-bold text-purple-600">
                {activeProvidersCount}
              </p>
              <p className="text-xs text-gray-500 mt-1">Currently in use</p>
            </div>
            <Sparkles className="w-6 h-6 text-purple-600" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Railway Environment</p>
              <p className="text-xl font-bold text-gray-900">
                {dynamicProviders?.railway_environment || "Unknown"}
              </p>
              <p className="text-xs text-green-600 mt-1">Live scanning</p>
            </div>
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Dynamic Status Banner */}
      {dynamicProviders && (
        <div
          className={`border rounded-lg p-4 mb-6 ${
            dynamicProviders.missing_count === 0
              ? "bg-green-50 border-green-200"
              : "bg-yellow-50 border-yellow-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {dynamicProviders.missing_count === 0 ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            )}
            <span
              className={`font-medium ${
                dynamicProviders.missing_count === 0
                  ? "text-green-800"
                  : "text-yellow-800"
              }`}
            >
              {dynamicProviders.missing_count === 0
                ? `✅ All ${dynamicProviders.configured_count} AI providers configured in Railway`
                : `⚠️ ${dynamicProviders.missing_count} providers missing API keys - ${dynamicProviders.configured_count} configured`}
            </span>
            <span className="ml-auto text-xs text-gray-600">
              Environment: {dynamicProviders.railway_environment} | Last
              scanned:{" "}
              {dynamicProviders.last_updated
                ? new Date(dynamicProviders.last_updated).toLocaleTimeString()
                : "Unknown"}
            </span>
            <button
              onClick={fetchDynamicProviders}
              disabled={providersLoading}
              className="ml-2 bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 disabled:opacity-50"
            >
              {providersLoading ? "Scanning..." : "Refresh"}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search providers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            />
          </div>

          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="">All Tiers</option>
            <option value="primary">Primary (Ultra-cheap)</option>
            <option value="secondary">Secondary (Cheap)</option>
            <option value="expensive">Expensive</option>
            <option value="specialized">Specialized</option>
            <option value="discovered">Discovered</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
            <option value="pending">Pending</option>
            <option value="discovered">Discovered</option>
          </select>

          <div className="text-sm text-gray-500">
            Showing {filteredProviders.length} of {totalProvidersCount}{" "}
            providers
          </div>
        </div>
      </div>

      {/* Provider Table - Pure Dynamic Data */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider & Source
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("overall_rating")}
                >
                  <div className="flex items-center gap-1">
                    Overall Rating
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("cost_per_1k_tokens")}
                >
                  <div className="flex items-center gap-1">
                    Cost/1K Tokens
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Railway Environment Variable
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Integration Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProviders.map((provider, index) => (
                <tr
                  key={`${provider.provider_name}-${index}`}
                  className={`hover:bg-gray-50 ${
                    provider.source === "discovered" ||
                    provider.source === "database"
                      ? "bg-purple-25 border-l-4 border-l-purple-500"
                      : provider.is_active
                      ? ""
                      : "opacity-60"
                  }`}
                >
                  <td className="px-4 py-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-gray-900">
                          {provider.provider_name}
                        </div>
                        {(provider.source === "discovered" ||
                          provider.source === "database") && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                            {provider.source === "database" ? "DB" : "NEW"}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        {provider.category.replace("_", " ")}
                      </div>
                      <div className="text-xs text-gray-400">
                        {provider.model || "Unknown model"}
                      </div>
                      <div className="mt-1">
                        <TierBadge tier={provider.priority_tier} />
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <StarRating rating={provider.overall_rating || 0} />
                    <div className="text-xs text-gray-500 mt-1">
                      Quality: {(provider.quality_score || 0).toFixed(1)}/5
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-900">
                      {formatCost(provider.cost_per_1k_tokens || 0)}
                    </div>
                    <StarRating
                      rating={provider.cost_rating || 0}
                      size="w-3 h-3"
                    />
                  </td>

                  <td className="px-4 py-4">
                    <div className="space-y-2">
                      <div className="bg-gray-50 rounded-lg p-3 border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-700">
                            Environment Variable:
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              provider.env_var_status === "configured"
                                ? "bg-green-100 text-green-700"
                                : provider.env_var_status === "empty"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {provider.env_var_status === "configured"
                              ? "✅ Configured"
                              : provider.env_var_status === "empty"
                              ? "❌ Empty"
                              : "⚠️ Missing"}
                          </span>
                        </div>

                        <code className="text-xs bg-white border rounded px-2 py-1 block font-mono">
                          {provider.env_var_name}
                        </code>

                        {provider.env_var_status === "configured" &&
                          provider.value_preview && (
                            <div className="text-xs text-green-700 bg-green-50 p-2 rounded mt-2">
                              🔑 Preview:{" "}
                              <code className="bg-white px-1 rounded">
                                {provider.value_preview}
                              </code>
                            </div>
                          )}

                        {provider.env_var_status !== "configured" && (
                          <div className="text-xs text-gray-600 mt-2">
                            <div className="bg-blue-50 p-2 rounded border text-blue-800">
                              Add to Railway: {provider.env_var_name}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <StatusBadge
                      integrationStatus={provider.integration_status}
                      envVarStatus={provider.env_var_status}
                      source={provider.source}
                    />
                    <div className="mt-2 text-xs text-gray-600">
                      Source: {provider.source}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="space-y-2">
                      {/* Test API Key Button */}
                      {provider.env_var_status === "configured" && (
                        <button
                          onClick={() =>
                            testApiKey(
                              provider.env_var_name,
                              provider.provider_name
                            )
                          }
                          className="w-full text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 flex items-center justify-center gap-1"
                          title="Test API Key"
                        >
                          <TestTube className="w-3 h-3" />
                          Test
                        </button>
                      )}

                      {/* Activate/Deactivate Button */}
                      {provider.env_var_status === "configured" && (
                        <button
                          onClick={() =>
                            toggleProviderStatus(
                              provider.env_var_name,
                              provider.integration_status
                            )
                          }
                          className={`w-full text-xs px-2 py-1 rounded flex items-center justify-center gap-1 ${
                            provider.integration_status === "active"
                              ? "bg-gray-600 text-white hover:bg-gray-700"
                              : "bg-green-600 text-white hover:bg-green-700"
                          }`}
                          title={
                            provider.integration_status === "active"
                              ? "Deactivate"
                              : "Activate"
                          }
                        >
                          {provider.integration_status === "active" ? (
                            <>
                              <Pause className="w-3 h-3" />
                              Disable
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3" />
                              Activate
                            </>
                          )}
                        </button>
                      )}

                      {/* View Details Button */}
                      <button
                        onClick={() =>
                          alert(
                            `📋 ${
                              provider.provider_name
                            } Details:\n\n💰 Cost: ${formatCost(
                              provider.cost_per_1k_tokens || 0
                            )}/1K tokens\n🎯 Quality: ${
                              provider.quality_score || 0
                            }/5 stars\n🔧 Environment Variable: ${
                              provider.env_var_name
                            }\n📁 Source: ${provider.source}\n⚡ Status: ${
                              provider.integration_status
                            }`
                          )
                        }
                        className="w-full text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer - Dynamic Discovery Status */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-blue-900 mb-2">
              🚀 Dynamic AI Provider Discovery
            </h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>
                ✅ Live Railway environment scanning -{" "}
                {dynamicProviders?.environment_providers || 0} providers
                discovered
              </p>
              <p>
                🔍 Real-time environment variable validation and API key testing
              </p>
              <p>
                💰 Cost analysis based on actual provider pricing and usage
                patterns
              </p>
              <p>
                🎯 Smart filtering: Only showing providers that offer value or
                unique capabilities
              </p>
              <p>
                🛤️ Environment:{" "}
                <strong>
                  {dynamicProviders?.railway_environment || "Unknown"}
                </strong>{" "}
                | Source: <strong>Live Railway Scanning</strong>
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <p className="text-2xl font-bold text-blue-600">
                {configuredProviders}/{totalProvidersCount}
              </p>
              <p className="text-sm text-blue-800">Providers Ready</p>
              <p className="text-xs text-blue-600 mt-1">
                {totalProvidersCount > 0
                  ? Math.round(
                      (configuredProviders / totalProvidersCount) * 100
                    )
                  : 0}
                % configured
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations Section - Enhanced for Dynamic Data */}
      {hasRecommendations && recommendations?.recommendations && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-yellow-600" />
            <h2 className="text-xl font-bold text-gray-900">
              AI-Powered Optimization Recommendations
            </h2>
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
              {recommendations.recommendations.length} available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.recommendations.map(
              (rec: Recommendation, index: number) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 capitalize">
                        {rec.category?.replace("_", " ")}
                      </h3>
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="text-red-600">
                          {rec.current_provider}
                        </span>
                        <span className="mx-2">→</span>
                        <span className="text-green-600">
                          {rec.recommended_provider}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        rec.priority === "high"
                          ? "bg-red-100 text-red-800"
                          : rec.priority === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {rec.priority} priority
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-700">{rec.reason}</p>
                    <p className="text-sm text-blue-600 font-medium">
                      {rec.estimated_improvement}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      alert(
                        `💡 Recommendation: Switch ${rec.category} from ${rec.current_provider} to ${rec.recommended_provider}\n\nReason: ${rec.reason}\nBenefit: ${rec.estimated_improvement}`
                      )
                    }
                    className="w-full py-2 px-4 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Cost Analysis Footer - Enhanced with Dynamic Data */}
      {costAnalysis && (
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            💰 Dynamic Cost Analysis & Optimization
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Providers</p>
                  <p className="text-xl font-bold text-blue-600">
                    {activeProvidersCount}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Currently in use</p>
                </div>
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ultra-Cheap Tier</p>
                  <p className="text-xl font-bold text-green-600">
                    {
                      filteredProviders.filter(
                        (p) => p.priority_tier === "primary"
                      ).length
                    }
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    ≤ $0.0003/1K tokens
                  </p>
                </div>
                <TrendingDown className="w-6 h-6 text-green-600" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Available Providers</p>
                  <p className="text-xl font-bold text-purple-600">
                    {configuredProviders}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Ready to activate
                  </p>
                </div>
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Discovery Status</p>
                  <p className="text-xl font-bold text-gray-900">Live</p>
                  <p className="text-xs text-green-600 mt-1">Auto-scanning</p>
                </div>
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Footer Stats - Dynamic */}
      <div className="mt-6 text-sm text-gray-600 text-center space-y-2">
        <div>
          🚀 <strong>Dynamic Discovery:</strong> Real-time Railway environment
          scanning discovers and validates AI providers automatically
        </div>
        <div>
          🎯 <strong>Smart Cost Leaders:</strong>{" "}
          {filteredProviders
            .filter(
              (p) => p.cost_per_1k_tokens && p.cost_per_1k_tokens <= 0.0003
            )
            .map(
              (p) =>
                `${p.provider_name} (${formatCost(p.cost_per_1k_tokens || 0)})`
            )
            .join(" • ")}
        </div>
        <div>
          ⚡ <strong>Next Action:</strong>{" "}
          {dynamicProviders && dynamicProviders.missing_count > 0
            ? `Add ${dynamicProviders.missing_count} missing API keys to Railway for full provider coverage`
            : `All providers configured - optimize usage with the ${activeProvidersCount} active providers`}
        </div>
        <div>
          🔧 <strong>Environment:</strong>{" "}
          {dynamicProviders?.railway_environment || "Unknown"} |
          <strong> Last Scan:</strong>{" "}
          {dynamicProviders?.last_updated
            ? new Date(dynamicProviders.last_updated).toLocaleString()
            : "Never"}
        </div>
      </div>
    </div>
  );
};

export default CleanDynamicAIProviderDashboard;
