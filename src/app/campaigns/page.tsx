// src/app/campaigns/page.tsx - SSR FIX FOR LOCALSTORAGE
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Video,
  FileText,
  Globe,
  Calendar,
  Filter,
  Grid,
  List,
  FolderOpen,
  Shield,
  Search,
  Users,
  Building2,
  Target,
  BarChart3,
  Settings,
  Database,
  Activity,
  Image as ImageIcon,
  ListChecks,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useApi } from "@/lib/api";
import type { Campaign } from "@/lib/types/campaign";
import CampaignFilters from "@/components/campaigns/CampaignFilters";
import CampaignGrid from "@/components/campaigns/CampaignGrid";
import CampaignStats from "@/components/campaigns/CampaignStats";

export default function CampaignsPage() {
  const router = useRouter();
  const api = useApi();

  // State management
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showDemoToggle, setShowDemoToggle] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "checking" | "connected" | "failed"
  >("checking");
  const [mounted, setMounted] = useState(false); // SSR FIX

  // UI State
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Prevent multiple operations
  const isInitialized = useRef(false);
  const isLoadingData = useRef(false);

  // SSR FIX: Handle mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // SSR FIX: Safe localStorage access
  const getStorageItem = useCallback(
    (key: string): string | null => {
      if (typeof window === "undefined" || !mounted) return null;
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    [mounted]
  );

  const setStorageItem = useCallback(
    (key: string, value: string): void => {
      if (typeof window === "undefined" || !mounted) return;
      try {
        localStorage.setItem(key, value);
      } catch {
        // Silently fail
      }
    },
    [mounted]
  );

  const clearStorage = useCallback((): void => {
    if (typeof window === "undefined" || !mounted) return;
    try {
      localStorage.clear();
    } catch {
      // Silently fail
    }
  }, [mounted]);

  // Enhanced error handling
  const handleApiError = useCallback(
    (error: any): string => {
      console.error("API Error Details:", error);

      if (!error) return "Unknown error occurred";

      if (error.name === "TypeError" && error.message?.includes("fetch")) {
        return "Connection failed. Backend server may be down or unreachable.";
      }

      if (error.message?.includes("CORS")) {
        return "CORS error. Check backend CORS configuration.";
      }

      if (error.response?.status) {
        const status = error.response.status;
        switch (status) {
          case 401:
            setTimeout(() => {
              clearStorage();
              router.push("/login");
            }, 2000);
            return "Session expired. Redirecting to login...";
          case 403:
            return "Access denied. Check your permissions.";
          case 404:
            return "API endpoint not found. Check backend deployment.";
          case 500:
            return "Server error. Backend service may be down.";
          case 502:
          case 503:
          case 504:
            return "Backend service unavailable. Try again in a moment.";
          default:
            return `Server returned ${status}: ${
              error.response.statusText || "Unknown error"
            }`;
        }
      }

      if (error.message?.includes("Failed to fetch")) {
        return "Network error. Check internet connection and backend status.";
      }

      return error.message || "An unexpected error occurred";
    },
    [router, clearStorage]
  );

  // Connection test
  const testConnection = useCallback(async (): Promise<boolean> => {
    try {
      console.log("Testing backend connection...");
      setConnectionStatus("checking");

      const response = await fetch(
        "https://campaign-backend-production-e2db.up.railway.app/health",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(10000),
        }
      );

      if (response.ok) {
        console.log("Backend connection successful");
        setConnectionStatus("connected");
        return true;
      } else {
        console.error("Backend health check failed:", response.status);
        setConnectionStatus("failed");
        return false;
      }
    } catch (error) {
      console.error("Connection test failed:", error);
      setConnectionStatus("failed");
      return false;
    }
  }, []);

  // Demo creation for new users
  const createDemoForNewUser = useCallback(async (): Promise<void> => {
    try {
      console.log("Creating demo campaign for new user...");

      const demoPayload = {
        title: "Welcome Demo - AI Marketing Intelligence",
        description:
          "Your first campaign showcasing CampaignForge's AI-powered marketing intelligence capabilities. This demo shows how to analyze competitors, generate viral content, and optimize conversions automatically.",
        keywords: [
          "AI marketing",
          "competitor analysis",
          "viral content",
          "conversion optimization",
        ],
        target_audience:
          "Digital marketers and business owners looking to leverage AI for marketing success",
        tone: "professional",
        style: "engaging",
        settings: {
          is_demo: true,
          demo_type: "welcome_campaign",
          created_from: "onboarding_flow",
        },
      };

      const demoCampaign = await api.createCampaign(demoPayload);

      if (demoCampaign) {
        console.log("Demo campaign created:", demoCampaign);
        setCampaigns((prev) => [demoCampaign, ...prev]);
        setStorageItem("demo_campaign_created", "true");
      }
    } catch (error) {
      console.error("Demo campaign creation failed:", error);
    }
  }, [setStorageItem, api]);

  // Robust data loading
  const loadInitialData = useCallback(async (): Promise<void> => {
    if (isLoadingData.current || !mounted) {
      console.log("Load already in progress or not mounted, skipping...");
      return;
    }

    console.log("Starting loadInitialData...");
    isLoadingData.current = true;
    setError(null);

    try {
      // Test connection first
      const connectionOk = await testConnection();
      if (!connectionOk) {
        throw new Error(
          "Backend connection failed. Please check if the Railway service is running."
        );
      }

      // Check authentication - SSR SAFE
      const authToken =
        getStorageItem("access_token") || getStorageItem("authToken");
      if (!authToken) {
        throw new Error("No authentication token found. Please login again.");
      }

      console.log("Auth token found, loading user profile...");

      // Load user profile
      const userProfile = await api.getUserProfile();
      console.log("User profile loaded:", userProfile);
      setUser(userProfile);

      // Load campaigns
      console.log("Loading campaigns...");
      const campaignsResponse = await api.getCampaigns({ limit: 50 });
      console.log("Campaigns loaded:", campaignsResponse);

      // Handle both array and object response formats
      let campaignsData = [];
      if (Array.isArray(campaignsResponse)) {
        campaignsData = campaignsResponse;
      } else if (campaignsResponse && typeof campaignsResponse === 'object' && 'campaigns' in campaignsResponse && Array.isArray((campaignsResponse as any).campaigns)) {
        campaignsData = (campaignsResponse as any).campaigns;
      } else {
        console.warn("Invalid campaigns response format:", campaignsResponse);
        campaignsData = [];
      }

      // Check for global demo campaigns and user preference
      const userDemoPreference = getStorageItem('show_demo_campaign');
      const shouldShowDemo = userDemoPreference === null ? true : userDemoPreference !== 'false'; // Default to true for new users
      
      let allCampaigns = campaignsData;
      
      // Check if there are any global demo campaigns in the response
      const globalDemoCampaigns = campaignsData.filter((campaign: any) => 
        campaign.settings?.is_demo === true && campaign.settings?.is_global === true
      );
      
      if (globalDemoCampaigns.length > 0) {
        setShowDemoToggle(true);
        
        if (!shouldShowDemo) {
          // Filter out global demo campaigns if user has disabled them
          allCampaigns = campaignsData.filter((campaign: any) => 
            !(campaign.settings?.is_demo === true && campaign.settings?.is_global === true)
          );
        }
      }
      
      setCampaigns(allCampaigns);
      console.log(`Set ${campaignsData.length} campaigns`);

      // Note: Global demo system handles demo campaigns automatically
    } catch (err) {
      console.error("loadInitialData error:", err);
      const errorMessage = handleApiError(err);
      setError(errorMessage);

      if (errorMessage.includes("Session expired")) {
        return;
      }
    } finally {
      isLoadingData.current = false;
      setIsLoading(false);
      console.log("loadInitialData completed");
    }
  }, [
    testConnection,
    handleApiError,
    getStorageItem,
    mounted,
    api,
  ]);

  // Initialization effect - SSR SAFE
  useEffect(() => {
    if (!mounted || isInitialized.current) {
      return;
    }

    console.log("Initializing campaigns page...");

    // Check authentication - SSR SAFE
    const authToken =
      getStorageItem("access_token") || getStorageItem("authToken");
    if (!authToken) {
      console.log("No auth token, redirecting to login...");
      setIsLoading(false);
      router.push("/login");
      return;
    }

    isInitialized.current = true;
    loadInitialData();
  }, [mounted, router, loadInitialData, getStorageItem]);

  // Filter campaigns effect
  useEffect(() => {
    let filtered = campaigns;

    if (searchQuery) {
      filtered = filtered.filter(
        (campaign) =>
          campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          campaign.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (campaign) => campaign.status === statusFilter
      );
    }

    setFilteredCampaigns(filtered);
  }, [campaigns, searchQuery, statusFilter]);

  // Manual retry
  const handleRetry = useCallback(() => {
    console.log("Manual retry triggered");
    setError(null);
    setIsLoading(true);
    setConnectionStatus("checking");
    isInitialized.current = false;
    isLoadingData.current = false;

    setTimeout(() => {
      isInitialized.current = true;
      loadInitialData();
    }, 500);
  }, [loadInitialData]);

  // Logout handler - SSR SAFE
  const handleLogout = useCallback(() => {
    clearStorage();
    router.push("/login");
  }, [router, clearStorage]);

  // Campaign management handlers
  const handleCreateCampaign = useCallback(
    async (campaignData: {
      title: string;
      description: string;
      keywords: string[];
      target_audience: string;
    }) => {
      try {
        const payload = {
          title: campaignData.title,
          description: campaignData.description,
          keywords: campaignData.keywords,
          target_audience: campaignData.target_audience,
          tone: "conversational",
          style: "modern",
          settings: {
            created_from: "user_creation",
          },
        };

        const newCampaign = await api.createCampaign(payload);
        setCampaigns((prev) => [newCampaign, ...prev]);
        router.push(`/campaigns/${newCampaign.id}`);
      } catch (err) {
        const errorMessage = handleApiError(err);
        throw new Error(errorMessage);
      }
    },
    [router, handleApiError, api]
  );

  const handleCampaignView = useCallback(
    (campaign: Campaign) => router.push(`/campaigns/${campaign.id}`),
    [router]
  );

  const handleCampaignEdit = useCallback(
    (campaign: Campaign) => router.push(`/campaigns/${campaign.id}/settings`),
    [router]
  );

  const handleCampaignDuplicate = useCallback(
    async (campaign: Campaign) => {
      try {
        const duplicatedCampaign = await api.duplicateCampaign(campaign.id);
        setCampaigns((prev) => [duplicatedCampaign, ...prev]);
      } catch (err) {
        setError(handleApiError(err));
      }
    },
    [handleApiError, api]
  );

  const handleCampaignDelete = useCallback(
    async (campaign: Campaign) => {
      if (!confirm(`Are you sure you want to delete "${campaign.title}"?`))
        return;

      try {
        await api.deleteCampaign(campaign.id);
        setCampaigns((prev) => prev.filter((c) => c.id !== campaign.id));
      } catch (err) {
        setError(handleApiError(err));
      }
    },
    [handleApiError, api]
  );

  const debugStoragePerformance = useCallback(async () => {
    try {
      console.log("Starting storage debug test...");

      const response = await fetch(
        "https://campaign-backend-production-e2db.up.railway.app/api/intelligence/analysis/debug-storage",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${
              getStorageItem("access_token") || getStorageItem("authToken")
            }`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: "https://debug-test.com",
          }),
        }
      );

      const result = await response.json();
      console.log("Storage debug result:", result);

      // Show result in alert or you can create a modal
      if (result.status === "success") {
        alert(
          `Storage Debug Complete!\n` +
            `Create: ${result.create_time}s\n` +
            `Minimal Update: ${result.minimal_update_time}s\n` +
            `Complex Update: ${result.complex_update_time}s\n` +
            `Total: ${result.total_time}s\n\n` +
            `Check Railway logs for detailed timing.`
        );
      } else {
        alert(`Storage Debug Failed: ${result.error}`);
      }
    } catch (error: unknown) {
      console.error("Debug storage failed:", error);

      // Type-safe error handling
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "string"
          ? error
          : "Unknown error occurred";

      alert(`Debug failed: ${errorMessage}\nCheck console for details.`);
    }
  }, [getStorageItem]);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setStatusFilter("all");
  }, []);

  const toggleDemoVisibility = useCallback(async () => {
    const currentPreference = getStorageItem('show_demo_campaign');
    const newPreference = currentPreference === 'false' ? 'true' : 'false';
    setStorageItem('show_demo_campaign', newPreference);
    
    // Reload campaigns with new demo preference
    await loadInitialData();
  }, [getStorageItem, setStorageItem, loadInitialData]);

  // SSR SAFE: Don't render until mounted
  if (!mounted) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-6"></div>

          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading CampaignForge
          </h2>

          <p className="text-gray-600 mb-4">
            {connectionStatus === "checking" && "Testing backend connection..."}
            {connectionStatus === "connected" && "Loading your campaigns..."}
            {connectionStatus === "failed" && "Connection issues detected..."}
          </p>

          <div className="flex items-center justify-center space-x-2 mb-4">
            {connectionStatus === "checking" && (
              <>
                <Wifi className="h-4 w-4 text-yellow-500 animate-pulse" />
                <span className="text-sm text-yellow-600">Connecting...</span>
              </>
            )}
            {connectionStatus === "connected" && (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Connected</span>
              </>
            )}
            {connectionStatus === "failed" && (
              <>
                <WifiOff className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600">Connection Failed</span>
              </>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <p className="text-sm text-gray-500 mb-3">Debug Information:</p>
            <div className="text-xs text-gray-400 space-y-1">
              <div>
                Backend: https://campaign-backend-production-e2db.up.railway.app
              </div>
              <div>Status: {connectionStatus}</div>
              <div>Campaigns: {campaigns.length}</div>
              <div>User: {user ? "✅ Loaded" : "⏳ Loading"}</div>
              <div>
                Auth Token:{" "}
                {getStorageItem("access_token") ? "✅ Present" : "❌ Missing"}
              </div>
            </div>

            <button
              onClick={handleRetry}
              disabled={isLoadingData.current}
              className="mt-3 w-full px-4 py-2 bg-purple-100 text-purple-700 text-sm rounded-lg hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${
                  isLoadingData.current ? "animate-spin" : ""
                }`}
              />
              {isLoadingData.current ? "Retrying..." : "Force Retry"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Campaign Manager
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-1 text-sm text-gray-500">
              <span>RodgersDigital</span>
              <span>/</span>
              <span className="text-gray-900">Campaigns</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div
              className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                connectionStatus === "connected"
                  ? "bg-green-100 text-green-800"
                  : connectionStatus === "failed"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {connectionStatus === "connected" ? (
                <Wifi className="w-4 h-4" />
              ) : (
                <WifiOff className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {connectionStatus === "connected"
                  ? "Connected"
                  : connectionStatus === "failed"
                  ? "Offline"
                  : "Connecting"}
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search campaigns..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
            >
              Sign Out
            </button>

            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
              {user?.full_name?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full flex items-center space-x-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-sm border border-blue-200"
            >
              <Sparkles className="w-4 h-4" />
              <span>Switch to Dashboard</span>
            </button>
          </div>

          <nav className="p-4 space-y-2">
            {[
              {
                id: "dashboard",
                label: "Dashboard",
                icon: BarChart3,
                path: "/dashboard",
              },
              {
                id: "campaigns",
                label: "Campaigns",
                icon: Target,
                path: "/campaigns",
                active: true,
              },
              {
                id: "analytics",
                label: "Analytics",
                icon: Activity,
                path: "/dashboard/analytics",
              },
              {
                id: "content-library",
                label: "Content Library",
                icon: FileText,
                path: "/dashboard/content-library",
              },
              {
                id: "settings",
                label: "Settings",
                icon: Settings,
                path: "/dashboard/settings",
              },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
                  item.active
                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}

            {/* Admin-only section - Only show for admin users */}
            {user?.role === 'ADMIN' && (
              <div className="pt-4 border-t border-gray-200 mt-4">
                <button
                  onClick={debugStoragePerformance}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors text-orange-600 hover:bg-orange-50"
                >
                  <Database className="w-5 h-5" />
                  <span className="font-medium">Debug Storage</span>
                </button>

                <button
                  onClick={() => router.push("/admin")}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors text-gray-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Shield className="w-5 h-5" />
                  <span className="font-medium">Admin Panel</span>
                </button>
              </div>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Universal Campaigns
                </h1>
                <p className="text-gray-600 mt-2">
                  Create intelligent campaigns that work with any input and
                  generate multiple content types
                </p>
              </div>
              <button
                onClick={() => router.push("/campaigns/create-workflow")}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Campaign
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-red-800 font-medium">
                      Connection Error
                    </h3>
                    <p className="text-red-700 text-sm mt-1">{error}</p>

                    {error.includes("Connection failed") && (
                      <div className="mt-3 p-3 bg-red-100 rounded border border-red-200">
                        <h4 className="text-red-800 text-sm font-medium mb-2">
                          Troubleshooting Steps:
                        </h4>
                        <ul className="text-red-700 text-sm space-y-1 list-disc list-inside">
                          <li>Check if Railway backend service is running</li>
                          <li>
                            Verify the URL:
                            https://campaign-backend-production-e2db.up.railway.app
                          </li>
                          <li>Test the health endpoint directly in browser</li>
                          <li>
                            Check network connection and firewall settings
                          </li>
                          <li>Look for CORS issues in browser console</li>
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={handleRetry}
                      disabled={isLoadingData.current}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 flex items-center"
                    >
                      <RefreshCw
                        className={`h-3 w-3 mr-1 ${
                          isLoadingData.current ? "animate-spin" : ""
                        }`}
                      />
                      Retry
                    </button>
                    <button
                      onClick={() => setError(null)}
                      className="text-red-600 hover:text-red-800 text-sm px-3 py-1"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}

            {campaigns.length === 0 && !error ? (
              <div className="text-center py-12">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-2xl mx-auto">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Plus className="h-8 w-8 text-white" />
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Welcome to CampaignForge!
                  </h2>
                  <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                    Create your first universal campaign that accepts any input
                    source and generates multiple content types automatically.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {[
                      {
                        icon: FileText,
                        title: "1. Create Campaign",
                        desc: "Set name and basic details",
                        color: "purple",
                      },
                      {
                        icon: Globe,
                        title: "2. Add Any Sources",
                        desc: "URLs, documents, videos, text",
                        color: "blue",
                      },
                      {
                        icon: Video,
                        title: "3. AI Analysis",
                        desc: "Extract marketing intelligence",
                        color: "green",
                      },
                      {
                        icon: Plus,
                        title: "4. Generate Everything",
                        desc: "Emails, ads, posts, pages, videos",
                        color: "orange",
                      },
                    ].map(({ icon: Icon, title, desc, color }) => (
                      <div key={title} className="text-center">
                        <div
                          className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center mx-auto mb-3`}
                        >
                          <Icon className={`h-6 w-6 text-${color}-600`} />
                        </div>
                        <h3 className="font-medium text-gray-900 mb-1">
                          {title}
                        </h3>
                        <p className="text-sm text-gray-600">{desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => router.push("/campaigns/create-workflow")}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all inline-flex items-center text-lg justify-center"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Create Your First Campaign
                    </button>

                    <button
                      onClick={handleRetry}
                      disabled={isLoadingData.current}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center justify-center disabled:opacity-50"
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-2 ${
                          isLoadingData.current ? "animate-spin" : ""
                        }`}
                      />
                      Refresh Campaigns
                    </button>
                  </div>

                  {showDemoToggle && (
                    <div className="flex justify-center mt-4">
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <Target className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                          Demo Campaign Available
                        </span>
                        <button
                          onClick={toggleDemoVisibility}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          {getStorageItem('show_demo_campaign') === 'false' ? 'Show Demo' : 'Hide Demo'}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-center space-x-2 text-sm">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          connectionStatus === "connected"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      ></div>
                      <span className="text-gray-600">
                        Backend Status:{" "}
                        {connectionStatus === "connected"
                          ? "Connected"
                          : "Disconnected"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : campaigns.length > 0 ? (
              <>
                <CampaignStats campaigns={campaigns} user={user} />

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex-1 max-w-md">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search campaigns..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="all">All Status</option>
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="paused">Paused</option>
                      </select>

                      <button
                        onClick={clearFilters}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                      >
                        Clear Filters
                      </button>

                      {showDemoToggle && (
                        <button
                          onClick={toggleDemoVisibility}
                          className="px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors border border-blue-300"
                        >
                          {getStorageItem('show_demo_campaign') === 'false' ? 'Show Demo' : 'Hide Demo'}
                        </button>
                      )}

                      <span className="text-sm text-gray-500">
                        {filteredCampaigns.length} campaigns
                      </span>
                    </div>
                  </div>
                </div>

                {filteredCampaigns.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                    <p className="text-gray-500">
                      No campaigns match your current filters.
                    </p>
                    <button
                      onClick={clearFilters}
                      className="mt-2 text-purple-600 hover:text-purple-700"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <CampaignGrid
                    campaigns={filteredCampaigns}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    onCampaignView={handleCampaignView}
                    onCampaignEdit={handleCampaignEdit}
                    onCampaignDuplicate={handleCampaignDuplicate}
                    onCampaignDelete={handleCampaignDelete}
                  />
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Recent Activity
                      </h3>
                      <div className="flex items-center space-x-2">
                        <Filter className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {filteredCampaigns.length} campaigns •{" "}
                          {filteredCampaigns.reduce(
                            (acc, campaign) =>
                              acc + (campaign.generated_content_count || 0),
                            0
                          )}{" "}
                          content pieces
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {filteredCampaigns.slice(0, 3).map((campaign) => {
                        const contentCount =
                          campaign.generated_content_count || 0;
                        const hasContent = contentCount > 0;
                        const isDemo =
                          campaign.settings?.is_demo || campaign.is_demo;

                        return (
                          <div
                            key={campaign.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center">
                              <div className="bg-purple-100 p-2 rounded-lg mr-3">
                                <Target className="h-5 w-5 text-purple-600" />
                              </div>
                              <div>
                                <div className="flex items-center space-x-2 mb-1">
                                  <h4 className="font-semibold text-gray-900">
                                    {campaign.title}
                                  </h4>
                                  {hasContent && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      {contentCount} content pieces
                                    </span>
                                  )}
                                  {isDemo && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      Demo
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-600 text-sm flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {new Date(
                                    campaign.created_at
                                  ).toLocaleDateString()}
                                  <span className="mx-2">•</span>
                                  <span className="text-purple-600 font-medium">
                                    Universal Campaign
                                  </span>
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  campaign.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : campaign.status === "completed"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {campaign.status}
                              </span>

                              {hasContent && (
                                <button
                                  onClick={() =>
                                    router.push(
                                      `/campaigns/${campaign.id}/content`
                                    )
                                  }
                                  className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center space-x-1 px-3 py-1 hover:bg-green-50 rounded-lg transition-colors"
                                >
                                  <FolderOpen className="h-4 w-4" />
                                  <span>Content</span>
                                </button>
                              )}

                              <button
                                onClick={() => handleCampaignView(campaign)}
                                className="text-purple-600 hover:text-purple-700 text-sm font-medium px-3 py-1 hover:bg-purple-50 rounded-lg transition-colors"
                              >
                                View
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
