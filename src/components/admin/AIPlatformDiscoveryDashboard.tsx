// src/components/admin/AIPlatformDiscoveryDashboard.tsx
/**
 * AI Platform Discovery Dashboard v2.0
 * 🎯 Two-table system: Active Providers (Table 1) & Suggestions (Table 2)
 * 🔍 AI-powered provider discovery with review workflow
 * 📊 Category-based organization with top 3 rankings
 * ⚡ Suggestion promotion workflow (Table 2 → Table 1)
 */

import React, { useState } from "react";
import {
  Star,
  RefreshCw,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Clock,
  Bot,
  Globe,
  Search,
  Eye,
  TestTube,
  Lightbulb,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  FileText,
  Image,
  Video,
  Mic,
  Brain,
  Cpu,
  Filter,
  ImageIcon,
} from "lucide-react";
import { useEnhancedAiDiscoveryService } from "@/lib/ai-discovery-service";
import type {
  ActiveAIProvider,
  DiscoveredAIProvider,
  CategoryStats,
  AIProviderCategory,
  RecommendationPriority,
} from "@/lib/types/ai-discovery";

const AIPlatformDiscoveryDashboard: React.FC = () => {
  // Use the enhanced service hook instead of local state
  const {
    dashboardData,
    isLoading,
    error,
    lastUpdated,
    loadDashboardData,
    reviewSuggestion,
    promoteSuggestion,
    runDiscoveryScan,
    activeProviders,
    discoveredSuggestions,
    categoryStats,
    summaryStats,
    pendingSuggestions,
    hasData,
  } = useEnhancedAiDiscoveryService();

  // Local UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"active" | "suggestions">(
    "active"
  );

  // Handle review suggestion
  const handleReviewSuggestion = async (
    suggestionId: string,
    action: "approve" | "reject",
    notes?: string
  ) => {
    try {
      await reviewSuggestion(suggestionId, action, notes);
    } catch (err) {
      console.error("Failed to review suggestion:", err);
    }
  };

  // Handle promote suggestion
  const handlePromoteSuggestion = async (
    suggestionId: string,
    apiKey?: string
  ) => {
    try {
      await promoteSuggestion(suggestionId, { api_key: apiKey });
    } catch (err) {
      console.error("Failed to promote suggestion:", err);
    }
  };

  // Handle discovery scan
  const handleDiscoveryScan = async () => {
    try {
      await runDiscoveryScan();
    } catch (err) {
      console.error("Failed to run discovery scan:", err);
    }
  };

  // Helper functions
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "text_generation":
        return <FileText className="w-4 h-4" />;
      case "image_generation":
        return <ImageIcon className="w-4 h-4" />;
      case "video_generation":
        return <Video className="w-4 h-4" />;
      case "audio_generation":
        return <Mic className="w-4 h-4" />;
      case "multimodal":
        return <Brain className="w-4 h-4" />;
      default:
        return <Cpu className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "text_generation":
        return "blue";
      case "image_generation":
        return "green";
      case "video_generation":
        return "purple";
      case "audio_generation":
        return "orange";
      case "multimodal":
        return "indigo";
      default:
        return "gray";
    }
  };

  const getRankBadge = (rank: number) => {
    const badges = ["🥇", "🥈", "🥉"];
    return badges[rank - 1] || `#${rank}`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCost = (cost: number) => {
    if (cost < 0.001) return `$${(cost * 1000000).toFixed(1)}µ`;
    if (cost < 1) return `$${(cost * 1000).toFixed(3)}m`;
    return `$${cost.toFixed(3)}`;
  };

  // Filter providers based on search and category
  const filteredActiveProviders = activeProviders.filter((provider) => {
    const matchesSearch = provider.provider_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || provider.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredSuggestions = discoveredSuggestions.filter((suggestion) => {
    const matchesSearch = suggestion.provider_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || suggestion.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-full mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bot className="w-8 h-8 text-blue-600" />
            AI Platform Discovery Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Manage active AI providers and review new platform suggestions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Updated{" "}
            {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : "Never"}
          </div>
          <button
            onClick={handleDiscoveryScan}
            disabled={isLoading}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Globe className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Scanning..." : "Run Discovery"}
          </button>
          <button
            onClick={loadDashboardData}
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Providers</p>
              <p className="text-2xl font-bold text-blue-600">
                {summaryStats.total_active}
              </p>
              <p className="text-xs text-gray-500">
                Across {categoryStats.filter((c) => c.active_count > 0).length}{" "}
                categories
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Suggestions</p>
              <p className="text-2xl font-bold text-orange-600">
                {summaryStats.pending_suggestions}
              </p>
              <p className="text-xs text-gray-500">
                {summaryStats.high_priority_suggestions} high priority
              </p>
            </div>
            <Lightbulb className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Cost</p>
              <p className="text-2xl font-bold text-green-600">
                ${summaryStats.monthly_cost.toFixed(0)}
              </p>
              <p className="text-xs text-gray-500">Optimized spend</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Quality Score</p>
              <p className="text-2xl font-bold text-purple-600">
                {summaryStats.avg_quality_score.toFixed(1)}
              </p>
              <p className="text-xs text-gray-500">Out of 5.0</p>
            </div>
            <Star className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
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
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="">All Categories</option>
            <option value="text_generation">Text Generation</option>
            <option value="image_generation">Image Generation</option>
            <option value="video_generation">Video Generation</option>
            <option value="audio_generation">Audio Generation</option>
            <option value="multimodal">Multimodal</option>
          </select>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            Showing{" "}
            {activeTab === "active"
              ? filteredActiveProviders.length
              : filteredSuggestions.length}{" "}
            items
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "active"
                  ? "border-blue-500 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Active Providers ({summaryStats.total_active})
              </div>
            </button>
            <button
              onClick={() => setActiveTab("suggestions")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "suggestions"
                  ? "border-orange-500 text-orange-600 bg-orange-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Suggestions ({summaryStats.pending_suggestions})
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "active" ? (
            <div className="space-y-6">
              {/* Category Sections */}
              {categoryStats
                .filter((category) => category.active_count > 0)
                .map((category) => (
                  <div key={category.category} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg bg-${getCategoryColor(
                            category.category
                          )}-100`}
                        >
                          {getCategoryIcon(category.category)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 capitalize">
                            {category.category.replace("_", " ")}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {category.active_count} providers • Avg quality:{" "}
                            {category.avg_quality_score.toFixed(1)}/5
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          ${category.total_monthly_cost.toFixed(0)}/month
                        </p>
                        <p className="text-xs text-gray-500">Category cost</p>
                      </div>
                    </div>

                    {/* Top 3 Providers */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {category.top_3_providers.map((provider) => (
                        <div
                          key={provider.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-gray-900">
                                  {provider.provider_name}
                                </h4>
                                <span className="text-lg">
                                  {getRankBadge(provider.category_rank)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                {formatCost(provider.cost_per_1k_tokens)}/1K
                                tokens
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < Math.floor(provider.quality_score)
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                              <span className="text-xs text-gray-600 ml-1">
                                {provider.quality_score.toFixed(1)}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2 mb-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">
                                Response Time:
                              </span>
                              <span className="font-medium">
                                {provider.response_time_ms}ms
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">
                                Monthly Usage:
                              </span>
                              <span className="font-medium">
                                {(provider.monthly_usage / 1000).toFixed(0)}K
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                alert(`Testing ${provider.provider_name}...`)
                              }
                              className="flex-1 bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                            >
                              <TestTube className="w-3 h-3" />
                              Test
                            </button>
                            <button
                              onClick={() =>
                                alert(
                                  `Viewing details for ${provider.provider_name}`
                                )
                              }
                              className="flex-1 bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Additional Providers in Category */}
                    {filteredActiveProviders.filter(
                      (p) => p.category === category.category && !p.is_top_3
                    ).length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">
                          Other Providers
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {filteredActiveProviders
                            .filter(
                              (p) =>
                                p.category === category.category && !p.is_top_3
                            )
                            .map((provider) => (
                              <div
                                key={provider.id}
                                className="border border-gray-200 rounded-lg p-3 text-sm"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">
                                    {provider.provider_name}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {formatCost(provider.cost_per_1k_tokens)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                  <div className="flex items-center gap-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-2 h-2 ${
                                          i < Math.floor(provider.quality_score)
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span
                                    className={`w-2 h-2 rounded-full ${
                                      provider.is_active
                                        ? "bg-green-500"
                                        : "bg-gray-300"
                                    }`}
                                  ></span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Suggestions List */}
              {filteredSuggestions.length === 0 ? (
                <div className="text-center py-12">
                  <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Suggestions Found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || selectedCategory
                      ? "Try adjusting your filters"
                      : "Run a discovery scan to find new AI providers"}
                  </p>
                  <button
                    onClick={handleDiscoveryScan}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Run Discovery Scan
                  </button>
                </div>
              ) : (
                filteredSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-3 rounded-lg bg-${getCategoryColor(
                            suggestion.category
                          )}-100`}
                        >
                          {getCategoryIcon(suggestion.category)}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="text-xl font-semibold text-gray-900">
                              {suggestion.provider_name}
                            </h4>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                                suggestion.recommendation_priority
                              )}`}
                            >
                              {suggestion.recommendation_priority} priority
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                suggestion.integration_complexity === "easy"
                                  ? "bg-green-100 text-green-800"
                                  : suggestion.integration_complexity ===
                                    "medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {suggestion.integration_complexity} integration
                            </span>
                          </div>
                          <p className="text-gray-600 capitalize mb-2">
                            {suggestion.category.replace("_", " ")} •{" "}
                            {suggestion.market_positioning}
                          </p>
                          <p className="text-sm text-gray-500">
                            Discovered{" "}
                            {new Date(
                              suggestion.discovered_at
                            ).toLocaleDateString()}{" "}
                            via {suggestion.discovery_source}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {formatCost(suggestion.estimated_cost_per_1k)}/1K
                        </p>
                        <div className="flex items-center gap-1 justify-end">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.floor(suggestion.estimated_quality)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="text-xs text-gray-600 ml-1">
                            {suggestion.estimated_quality.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* AI Analysis */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Brain className="w-4 h-4 text-blue-600" />
                        <h5 className="font-medium text-blue-900">
                          AI Analysis
                        </h5>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-blue-800 mb-1">
                            Market Gap:
                          </p>
                          <p className="text-blue-700">
                            {suggestion.ai_analysis.market_gap}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-blue-800 mb-1">
                            Recommendation:
                          </p>
                          <p className="text-blue-700">
                            {suggestion.ai_analysis.adoption_recommendation}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-blue-800 mb-1">
                            Risk Assessment:
                          </p>
                          <p className="text-blue-700">
                            {suggestion.ai_analysis.risk_assessment}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-blue-800 mb-1">
                            Timeline:
                          </p>
                          <p className="text-blue-700">
                            {suggestion.ai_analysis.implementation_timeline}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Unique Features */}
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-900 mb-2">
                        Unique Features
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {suggestion.unique_features.map((feature, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Competitive Advantages */}
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-900 mb-2">
                        Competitive Advantages
                      </h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {suggestion.competitive_advantages.map(
                          (advantage, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <ChevronRight className="w-3 h-3 text-green-600" />
                              {advantage}
                            </li>
                          )
                        )}
                      </ul>
                    </div>

                    {/* Admin Notes */}
                    {suggestion.admin_notes && (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h5 className="font-medium text-yellow-900 mb-1">
                          Admin Notes
                        </h5>
                        <p className="text-sm text-yellow-800">
                          {suggestion.admin_notes}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          Review Status:
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            suggestion.review_status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : suggestion.review_status === "approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {suggestion.review_status}
                        </span>
                      </div>

                      {suggestion.review_status === "pending" && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleReviewSuggestion(suggestion.id, "reject")
                            }
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors flex items-center gap-1"
                          >
                            <ThumbsDown className="w-3 h-3" />
                            Reject
                          </button>
                          <button
                            onClick={() =>
                              handleReviewSuggestion(suggestion.id, "approve")
                            }
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center gap-1"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handlePromoteSuggestion(suggestion.id)
                            }
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors flex items-center gap-1"
                          >
                            <ArrowRight className="w-3 h-3" />
                            Promote to Active
                          </button>
                        </div>
                      )}

                      {suggestion.review_status === "approved" && (
                        <button
                          onClick={() => handlePromoteSuggestion(suggestion.id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <ArrowRight className="w-4 h-4" />
                          Promote to Active
                        </button>
                      )}

                      {suggestion.review_status === "rejected" && (
                        <div className="text-sm text-gray-500">
                          Rejected on{" "}
                          {suggestion.reviewed_at
                            ? new Date(
                                suggestion.reviewed_at
                              ).toLocaleDateString()
                            : "Unknown"}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="font-medium text-red-900">Error</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
          <button
            onClick={() => {}}
            className="text-red-600 hover:text-red-800 text-sm mt-2 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Footer Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">
              🎯 Active Platform Status
            </h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>
                • {activeProviders.filter((p) => p.is_top_3).length} top-tier
                providers active
              </p>
              <p>
                • {categoryStats.filter((c) => c.active_count > 0).length}/5
                categories covered
              </p>
              <p>
                • Average quality score:{" "}
                {summaryStats.avg_quality_score.toFixed(1)}/5
              </p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-purple-900 mb-2">
              🔍 Discovery Pipeline
            </h3>
            <div className="text-sm text-purple-800 space-y-1">
              <p>
                • {summaryStats.pending_suggestions} suggestions awaiting review
              </p>
              <p>
                • {summaryStats.high_priority_suggestions} high-priority
                recommendations
              </p>
              <p>
                •{" "}
                {
                  discoveredSuggestions.filter(
                    (s) => s.integration_complexity === "easy"
                  ).length
                }{" "}
                easy integration options
              </p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-green-900 mb-2">
              💰 Cost Optimization
            </h3>
            <div className="text-sm text-green-800 space-y-1">
              <p>• ${summaryStats.monthly_cost.toFixed(0)} monthly spend</p>
              <p>
                • Average cost:{" "}
                {formatCost(
                  activeProviders.reduce(
                    (sum, p) => sum + p.cost_per_1k_tokens,
                    0
                  ) / Math.max(activeProviders.length, 1)
                )}
                /1K tokens
              </p>
              <p>
                •{" "}
                {
                  discoveredSuggestions.filter(
                    (s) => s.estimated_cost_per_1k < 0.001
                  ).length
                }{" "}
                ultra-low-cost options available
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPlatformDiscoveryDashboard;
