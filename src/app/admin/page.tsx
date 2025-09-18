// /src/app/admin/page.tsx - ENHANCED VERSION WITH TWO-TABLE AI DISCOVERY SYSTEM
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Building2,
  Target,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  BarChart3,
  Settings,
  Activity,
  Shield,
  Sparkles,
  ListChecks,
  Bot,
  Zap,
  RefreshCw,
  Globe,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Clock,
  Star,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  TestTube,
  Eye,
  ChevronRight,
  Brain,
  FileText,
  ImageIcon,
  Video,
  Mic,
  Cpu,
  Database,
} from "lucide-react";
import UserEditModal from "@/components/admin/UserEditModal";
import CompanyEditModal from "@/components/admin/CompanyEditModal";
import { waitlistApi, waitlistUtils } from "@/lib/waitlist-api";
import { useEnhancedAiDiscoveryService } from "@/lib/ai-discovery-service";

// Import your existing components
import UserManagement from "./components/UserManagement";
import CompanyManagement from "./components/CompanyManagement";
import WaitlistManagement from "./components/WaitlistManagement";

// Import the AI Platform Discovery Dashboard component
import AIPlatformDiscoveryDashboard from "@/components/admin/AIPlatformDiscoveryDashboard";

// Force this page to never be statically rendered
export const dynamic = "force-dynamic";
export const runtime = "edge";

// Type definitions
interface AdminStats {
  total_users: number;
  total_companies: number;
  total_campaigns_created: number;
  monthly_recurring_revenue: number;
  subscription_breakdown: Record<string, number>;
}

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  company_name: string;
  subscription_tier: string;
  monthly_credits_used: number;
  monthly_credits_limit: number;
  is_active: boolean;
  is_verified: boolean;
}

interface Company {
  id: string;
  company_name: string;
  company_slug: string;
  company_size: string;
  industry: string;
  subscription_tier: string;
  monthly_credits_used: number;
  monthly_credits_limit: number;
  user_count: number;
  campaign_count: number;
}

// Tab interface with enhanced AI Discovery tabs
interface TabConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  component?: React.ComponentType;
  highlight?: boolean;
  badge?: string;
}

// Enhanced tabs configuration with two-table AI Discovery system
const tabs: Record<string, TabConfig> = {
  overview: {
    label: "Platform Overview",
    icon: BarChart3,
    description: "Monitor and manage your entire platform",
  },
  users: {
    label: "User Management",
    icon: Users,
    description: "Manage user accounts and permissions",
  },
  companies: {
    label: "Company Management",
    icon: Building2,
    description: "Manage company accounts and settings",
  },
  waitlist: {
    label: "Waitlist Management",
    icon: ListChecks,
    description: "Manage waitlist entries and approvals",
  },
  "product-creator-invites": {
    label: "Product Creator Invites",
    icon: Star,
    description: "Manage admin-controlled product creator invitations",
    highlight: true,
    badge: "NEW",
  },
  "ai-discovery": {
    label: "AI Platform Discovery",
    icon: Bot,
    component: AIPlatformDiscoveryDashboard,
    description: "Two-table AI provider management & discovery system",
    highlight: true,
    badge: "v3.3.0",
  },
  revenue: {
    label: "Revenue Analytics",
    icon: DollarSign,
    description: "Track revenue and financial metrics",
  },
  settings: {
    label: "Platform Settings",
    icon: Settings,
    description: "Manage platform configurations",
  },
};

export default function AdminPage() {
  // State management
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTier, setFilterTier] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Waitlist states
  const [waitlistStats, setWaitlistStats] = useState<any>(null);
  const [waitlistEntries, setWaitlistEntries] = useState<any[]>([]);
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Modal states
  const [userEditModal, setUserEditModal] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({
    isOpen: false,
    user: null,
  });
  const [companyEditModal, setCompanyEditModal] = useState<{
    isOpen: boolean;
    company: Company | null;
  }>({
    isOpen: false,
    company: null,
  });

  // Enhanced AI Discovery Service hook (called unconditionally at top level)
  const [hookError, setHookError] = useState<string | null>(null);
  
  // Always call the hook unconditionally, but handle errors in useEffect
  const aiDiscoveryHook = useEnhancedAiDiscoveryService();
  
  // Create fallback values if the hook fails
  const fallbackHook = {
      dashboardData: null,
      isLoading: false,
      error: null, // Don't show error if data is actually available via API
      lastUpdated: null,
      loadDashboardData: null,
      runDiscoveryScan: null,
      activeProviders: [],
      discoveredSuggestions: [],
      categoryStats: [],
      summaryStats: {
        total_active: 0,
        pending_suggestions: 0,
        high_priority_suggestions: 0,
        monthly_cost: 0,
        avg_quality_score: 0
      },
      pendingSuggestions: [],
      approvedSuggestions: [],
      highPrioritySuggestions: [],
      topProviders: [],
      hasData: false,
      hasActiveProviders: false,
      hasPendingSuggestions: false,
      isHealthy: false,
    };

  // Use the hook data or fallback values
  const {
    dashboardData,
    isLoading: aiLoading,
    error: aiError,
    lastUpdated,
    loadDashboardData,
    runDiscoveryScan,
    activeProviders,
    discoveredSuggestions,
    categoryStats,
    summaryStats,
    pendingSuggestions,
    approvedSuggestions,
    highPrioritySuggestions,
    topProviders,
    hasData,
    hasActiveProviders,
    hasPendingSuggestions,
    isHealthy,
  } = aiDiscoveryHook;

  const router = useRouter();

  // Mount check
  useEffect(() => {
    setMounted(true);
  }, []);

  // API Functions
  const fetchAdminStats = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setLoading(false);
        return;
      }

      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://campaign-backend-production-e2db.up.railway.app";
      const response = await fetch(`${API_BASE_URL}/api/dashboard/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.warn("Admin stats API returned error:", response.status);
        // Set default stats to prevent loading spinner
        setStats({
          total_users: 0,
          total_companies: 0,
          total_campaigns_created: 0,
          monthly_recurring_revenue: 0,
          subscription_breakdown: {}
        });
      }
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
      // Set default stats to prevent loading spinner
      setStats({
        total_users: 0,
        total_companies: 0,
        total_campaigns_created: 0,
        monthly_recurring_revenue: 0,
        subscription_breakdown: {}
      });
    }
    setLoading(false);
  }, []);

  const fetchWaitlistStats = useCallback(async () => {
    try {
      const data = await waitlistApi.getStats();
      setWaitlistStats(data);
    } catch (error) {
      console.error("Failed to fetch waitlist stats:", error);
    }
  }, []);

  const fetchWaitlistEntries = useCallback(async (page: number = 1) => {
    try {
      setWaitlistLoading(true);
      const skip = (page - 1) * 50;
      const data = await waitlistApi.getList(skip, 50);
      setWaitlistEntries(data);
    } catch (error) {
      console.error("Failed to fetch waitlist entries:", error);
    } finally {
      setWaitlistLoading(false);
    }
  }, []);

  const handleWaitlistExport = useCallback(async () => {
    setExporting(true);
    try {
      const data = await waitlistApi.export();
      waitlistUtils.downloadCSV(data);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  }, []);

  const handleEmailExport = useCallback(async () => {
    try {
      const data = await waitlistApi.export();
      const emailList = data.emails.map((e: any) => e.email).join(", ");

      await navigator.clipboard.writeText(emailList);
      alert(`${data.emails.length} email addresses copied to clipboard!`);
    } catch (error) {
      console.error("Email export failed:", error);
      alert("Failed to copy emails. Please try again.");
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://campaign-backend-production-e2db.up.railway.app";
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        ...(searchTerm && { search: searchTerm }),
        ...(filterTier && { subscription_tier: filterTier }),
      });

      const response = await fetch(
        `${API_BASE_URL}/api/admin/users?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterTier]);

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://campaign-backend-production-e2db.up.railway.app";
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        ...(searchTerm && { search: searchTerm }),
        ...(filterTier && { subscription_tier: filterTier }),
      });

      const response = await fetch(
        `${API_BASE_URL}/api/admin/companies?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.companies || []);
      }
    } catch (error) {
      console.error("Failed to fetch companies:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterTier]);

  // Main useEffect for tab changes with AI Discovery integration
  useEffect(() => {
    if (mounted) {
      fetchAdminStats();
      fetchWaitlistStats();

      if (activeTab === "users") {
        fetchUsers();
      } else if (activeTab === "companies") {
        fetchCompanies();
      } else if (activeTab === "waitlist") {
        fetchWaitlistEntries();
      } else if (activeTab === "ai-discovery") {
        // Note: AI Discovery data loading disabled due to 500 errors
        // Use manual "Test AI API" and "Force Reload AI" buttons instead
        console.log("AI Discovery tab selected - use manual buttons to test");
      } else {
        setLoading(false);
      }
    }
  }, [
    mounted,
    activeTab,
    fetchAdminStats,
    fetchUsers,
    fetchCompanies,
    fetchWaitlistStats,
    fetchWaitlistEntries,
    loadDashboardData,
  ]);

  // Helper functions
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
    }
    router.push("/login");
  };

  const updateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://campaign-backend-production-e2db.up.railway.app";
      const response = await fetch(
        `${API_BASE_URL}/api/admin/users/${userId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ is_active: isActive }),
        }
      );
      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  const openUserEditModal = (user: User) => {
    setUserEditModal({ isOpen: true, user });
  };

  const closeUserEditModal = () => {
    setUserEditModal({ isOpen: false, user: null });
  };

  const openCompanyEditModal = (company: Company) => {
    setCompanyEditModal({ isOpen: true, company });
  };

  const closeCompanyEditModal = () => {
    setCompanyEditModal({ isOpen: false, company: null });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      free: "bg-gray-100 text-gray-800",
      starter: "bg-blue-100 text-blue-800",
      professional: "bg-purple-100 text-purple-800",
      agency: "bg-orange-100 text-orange-800",
      enterprise: "bg-green-100 text-green-800",
    };
    return colors[tier] || "bg-gray-100 text-gray-800";
  };

  // AI Discovery handlers for quick actions (with graceful error handling)
  const handleDiscoveryScan = async () => {
    if (!runDiscoveryScan) {
      alert("❌ AI Discovery service unavailable. This feature requires backend deployment.");
      return;
    }
    
    try {
      await runDiscoveryScan();
      alert("✅ AI Discovery scan completed successfully!");
    } catch (err) {
      console.error("Discovery scan error:", err);
      alert(
        "❌ Discovery scan failed: " +
          (err instanceof Error ? err.message : "Service unavailable")
      );
    }
  };

  const handleRefreshAI = async () => {
    if (!loadDashboardData) {
      alert("❌ AI Discovery service unavailable. This feature requires backend deployment.");
      return;
    }
    
    try {
      await loadDashboardData();
      alert("✅ AI Discovery data refreshed successfully!");
    } catch (err) {
      console.error("Refresh error:", err);
      alert(
        "❌ Refresh failed: " +
          (err instanceof Error ? err.message : "Service unavailable")
      );
    }
  };

  // Enhanced render tab content with AI Discovery integration
  const renderTabContent = () => {
    const tab = tabs[activeTab];

    // Handle special component-based tabs (AI Discovery)
    if (tab?.component) {
      const TabComponent = tab.component;
      return <TabComponent />;
    }

    // Handle existing tab content
    switch (activeTab) {
      case "overview":
        return renderOverviewTab();
      case "users":
        return (
          <UserManagement
            users={users}
            loading={loading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterTier={filterTier}
            setFilterTier={setFilterTier}
            onEditUser={openUserEditModal}
            onUpdateUserStatus={updateUserStatus}
          />
        );
      case "companies":
        return (
          <CompanyManagement
            companies={companies}
            loading={loading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterTier={filterTier}
            setFilterTier={setFilterTier}
            onEditCompany={openCompanyEditModal}
          />
        );
      case "waitlist":
        return (
          <WaitlistManagement
            waitlistStats={waitlistStats}
            waitlistEntries={waitlistEntries}
            waitlistLoading={waitlistLoading}
            onExport={handleWaitlistExport}
            onEmailExport={handleEmailExport}
            exporting={exporting}
          />
        );
      case "product-creator-invites":
        return renderProductCreatorInvitesTab();
      case "revenue":
        return renderRevenueTab();
      case "settings":
        return renderSettingsTab();
      default:
        return <div>Tab not found</div>;
    }
  };

  // Product Creator Invites tab
  const renderProductCreatorInvitesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Product Creator Invites
          </h2>
          <p className="text-gray-600">
            Manage admin-controlled invitations for product creators to access special free accounts.
          </p>
        </div>
        <button
          onClick={async () => {
            const email = prompt("Enter email address for product creator invite:");
            if (!email) return;

            const name = prompt("Enter product creator name (optional):");
            const company = prompt("Enter company name (optional):");
            const maxUrls = prompt("Max URL submissions (default 20):", "20");
            const daysValid = prompt("Days valid (default 30):", "30");

            try {
              const token = localStorage.getItem("authToken");
              const response = await fetch(
                "https://campaign-backend-production-e2db.up.railway.app/api/admin/intelligence/admin/product-creator-invites/create",
                {
                  method: "POST",
                  headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    invitee_email: email,
                    invitee_name: name || null,
                    company_name: company || null,
                    max_url_submissions: parseInt(maxUrls) || 20,
                    days_valid: parseInt(daysValid) || 30,
                    admin_notes: "Created via admin dashboard"
                  }),
                }
              );

              if (response.ok) {
                const data = await response.json();
                alert(`✅ Invite created successfully!\n\nInvite Token: ${data.data.invite_token}\nRegistration URL: ${window.location.origin}/register?invite_token=${data.data.invite_token}\n\nShare this URL with the product creator.`);
                // Refresh the invites list
                window.location.reload();
              } else {
                const error = await response.json();
                alert(`❌ Failed to create invite: ${error.detail || error.message || "Unknown error"}`);
              }
            } catch (error) {
              console.error("Error creating invite:", error);
              alert("❌ Error creating invite. Check console for details.");
            }
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Star className="w-4 h-4" />
          <span>Create Invite</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Invites
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage product creator invitations and track their status
          </p>
        </div>
        <div className="p-6">
          <div className="text-center py-12">
            <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Product Creator Invite Management
            </h3>
            <p className="text-gray-500 mb-4">
              Create and manage private invitations for product creators to submit their sales page URLs for pre-analysis.
            </p>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Admin-controlled invitation system</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Configurable quotas and restrictions</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Secure token-based registration</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Pre-launch URL analysis for affiliate marketers</span>
              </div>
            </div>
            <button
              onClick={async () => {
                try {
                  const token = localStorage.getItem("authToken");
                  const response = await fetch(
                    "https://campaign-backend-production-e2db.up.railway.app/api/admin/intelligence/admin/product-creator-invites/list",
                    {
                      headers: { "Authorization": `Bearer ${token}` },
                    }
                  );

                  if (response.ok) {
                    const data = await response.json();
                    const invites = data.data || [];
                    if (invites.length > 0) {
                      const invitesList = invites.map((invite: any) =>
                        `• ${invite.invitee_email} (${invite.status}) - ${invite.company_name || 'No company'}`
                      ).join('\n');
                      alert(`📋 Found ${invites.length} invites:\n\n${invitesList}`);
                    } else {
                      alert("📋 No invites found. Create your first invite using the 'Create Invite' button above.");
                    }
                  } else {
                    const error = await response.json();
                    alert(`❌ Failed to load invites: ${error.detail || "Unknown error"}`);
                  }
                } catch (error) {
                  console.error("Error loading invites:", error);
                  alert("❌ Error loading invites. Check console for details.");
                }
              }}
              className="mt-4 inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Eye className="w-4 h-4" />
              <span>View All Invites</span>
            </button>
          </div>
        </div>
      </div>

      {/* Invite Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Lightbulb className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-800">
            How Product Creator Invites Work
          </h3>
        </div>
        <div className="space-y-3 text-blue-700">
          <div className="flex items-start space-x-3">
            <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">1</span>
            <div>
              <p className="font-medium">Admin Creates Invite</p>
              <p className="text-sm text-blue-600">Generate secure invitation with custom quotas and restrictions</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">2</span>
            <div>
              <p className="font-medium">Product Creator Registers</p>
              <p className="text-sm text-blue-600">Creator uses invite token to register for special free account</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">3</span>
            <div>
              <p className="font-medium">URL Submission & Analysis</p>
              <p className="text-sm text-blue-600">Creator submits sales page URLs which are pre-analyzed for affiliate marketers</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">4</span>
            <div>
              <p className="font-medium">Global Cache Population</p>
              <p className="text-sm text-blue-600">Analyzed URLs become available in global cache for instant affiliate access</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Enhanced overview tab with AI Discovery status
  const renderOverviewTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Platform Overview
          </h2>
          <p className="text-gray-600">
            Monitor and manage your entire platform with enhanced AI Discovery.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefreshAI}
            disabled={aiLoading}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${aiLoading ? "animate-spin" : ""}`}
            />
            <span>Refresh AI</span>
          </button>
          <button
            onClick={() => {
              alert("ℹ️ Discovery Scan Disabled\n\nThe backend doesn&apos;t have a &apos;run-discovery&apos; endpoint.\nUse &apos;Test AI API&apos; and &apos;Force Reload AI&apos; buttons instead to test the AI Discovery system.");
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed opacity-50"
            disabled
          >
            <Globe className="w-4 h-4" />
            <span>Discovery Scan (N/A)</span>
          </button>
          <button
            onClick={async () => {
              console.log('🔍 Testing AI Discovery endpoints...');
              const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');
              console.log('Token found:', !!token);
              
              try {
                const response = await fetch('https://campaign-backend-production-e2db.up.railway.app/api/admin/ai-discovery/active-providers', {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });
                
                console.log('Response status:', response.status);
                const data = await response.json();
                console.log('Response data:', data);
                
                if (response.ok) {
                  if (data.success) {
                    const providers = data.providers || [];
                    const providerNames = providers.slice(0, 5).map((p: any) => p.provider_name || 'Unknown').join(', ');
                    alert(`✅ AI Discovery data found!\n\nProviders: ${providers.length}\nSample providers: ${providerNames}\n\nTotal data keys: ${Object.keys(data).join(', ')}\n\nCheck console for full details.`);
                  } else {
                    alert(`✅ Response OK but not successful:\n${JSON.stringify(data, null, 2)}`);
                  }
                } else {
                  alert(`❌ API Error: ${response.status}\n${data.error || data.detail || JSON.stringify(data, null, 2)}`);
                }
              } catch (error) {
                console.error('Test failed:', error);
                alert(`❌ Connection failed: ${error instanceof Error ? error.message : String(error)}`);
              }
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <TestTube className="w-4 h-4" />
            <span>Test AI API</span>
          </button>
          <button
            onClick={async () => {
              console.log('🔄 Force reloading AI Discovery data...');
              if (loadDashboardData) {
                try {
                  await loadDashboardData();
                  console.log('✅ AI Discovery data reloaded');
                  alert('✅ AI Discovery data reloaded successfully! Check the dashboard.');
                } catch (error) {
                  console.error('❌ Force reload failed:', error);
                  alert('❌ Reload failed: ' + (error instanceof Error ? error.message : String(error)));
                }
              } else {
                alert('❌ AI Discovery service not available');
              }
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Force Reload AI</span>
          </button>
          <button
            onClick={async () => {
              console.log('🔍 Testing Admin Stats API...');
              const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');
              
              try {
                const response = await fetch('https://campaign-backend-production-e2db.up.railway.app/api/dashboard/admin', {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });
                
                console.log('Admin Stats Response status:', response.status);
                const data = await response.json();
                console.log('Admin Stats Response data:', data);
                
                if (response.ok) {
                  alert(`✅ Admin Stats API working!\n\nUsers: ${data.total_users || 0}\nCompanies: ${data.total_companies || 0}\nRevenue: $${data.monthly_recurring_revenue || 0}\n\nCheck console for full details.`);
                } else {
                  alert(`❌ Admin Stats Error: ${response.status}\n${JSON.stringify(data, null, 2)}`);
                }
              } catch (error) {
                console.error('Admin Stats test failed:', error);
                alert(`❌ Admin Stats failed: ${error instanceof Error ? error.message : String(error)}`);
              }
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            <Users className="w-4 h-4" />
            <span>Test Admin Stats</span>
          </button>
          <button
            onClick={async () => {
              console.log('🔍 Testing database schema...');
              const token = localStorage.getItem('authToken') || localStorage.getItem('access_token');
              
              try {
                // Test a simpler endpoint to avoid schema issues
                const response = await fetch('https://campaign-backend-production-e2db.up.railway.app/api/campaigns/', {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });
                
                console.log('Campaigns API Response status:', response.status);
                const data = await response.json();
                console.log('Campaigns API Response data:', data);
                
                if (response.ok) {
                  const campaigns = data.campaigns || data || [];
                  if (campaigns.length > 0) {
                    const firstCampaign = campaigns[0];
                    const availableFields = Object.keys(firstCampaign);
                    alert(`✅ Database Connection Working!\n\nCampaigns found: ${campaigns.length}\n\nAvailable fields in campaign:\n${availableFields.join(', ')}\n\nCheck console for full details.`);
                  } else {
                    alert(`✅ Database connection works but no campaigns found.\n\nThis suggests the schema issue is in the admin stats endpoint, not the campaigns table itself.`);
                  }
                } else {
                  alert(`❌ Campaigns API Error: ${response.status}\n${JSON.stringify(data, null, 2)}`);
                }
              } catch (error) {
                console.error('Database schema test failed:', error);
                alert(`❌ Schema test failed: ${error instanceof Error ? error.message : String(error)}`);
              }
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
          >
            <Database className="w-4 h-4" />
            <span>Test Schema</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.total_users}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">Platform growth</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <Building2 className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Companies</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.total_companies}
              </p>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">Active organizations</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-orange-100 p-3 rounded-lg">
              <ListChecks className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Waitlist</p>
              <p className="text-2xl font-bold text-gray-900">
                {waitlistStats?.total || 0}
              </p>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            {waitlistStats?.today || 0} joined today
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-emerald-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Monthly Revenue
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats ? formatCurrency(stats.monthly_recurring_revenue) : "$0"}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">Growing steadily</span>
          </div>
        </div>
      </div>

      {/* Enhanced AI Discovery Status */}
      {hasData && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Bot className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-800">
                AI Platform Discovery System v3.3.0
              </h3>
              {tabs["ai-discovery"].badge && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                  {tabs["ai-discovery"].badge}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {isHealthy ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-blue-700 font-medium">
                    System Healthy
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-red-700 font-medium">
                    System Issues
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <p className="text-blue-600 font-medium">Active Providers</p>
              <p className="text-blue-900 text-lg font-bold">
                {summaryStats.total_active}
              </p>
              <p className="text-blue-700 text-xs">Table 1</p>
            </div>
            <div>
              <p className="text-blue-600 font-medium">Pending Suggestions</p>
              <p className="text-blue-900 text-lg font-bold">
                {summaryStats.pending_suggestions}
              </p>
              <p className="text-blue-700 text-xs">Table 2</p>
            </div>
            <div>
              <p className="text-blue-600 font-medium">High Priority</p>
              <p className="text-blue-900 text-lg font-bold">
                {summaryStats.high_priority_suggestions}
              </p>
              <p className="text-blue-700 text-xs">Urgent</p>
            </div>
            <div>
              <p className="text-blue-600 font-medium">Monthly Cost</p>
              <p className="text-blue-900 text-lg font-bold">
                ${summaryStats.monthly_cost.toFixed(0)}
              </p>
              <p className="text-blue-700 text-xs">Optimized</p>
            </div>
            <div>
              <p className="text-blue-600 font-medium">Avg Quality</p>
              <p className="text-blue-900 text-lg font-bold">
                {summaryStats.avg_quality_score.toFixed(1)}
              </p>
              <p className="text-blue-700 text-xs">Out of 5.0</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => setActiveTab("ai-discovery")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Bot className="w-4 h-4" />
              Open Discovery Dashboard
            </button>
            {hasPendingSuggestions && (
              <button
                onClick={() => setActiveTab("ai-discovery")}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
              >
                <Lightbulb className="w-4 h-4" />
                Review {pendingSuggestions.length} Suggestions
              </button>
            )}
            <span className="text-blue-700 text-sm">
              Last updated:{" "}
              {lastUpdated
                ? new Date(lastUpdated).toLocaleTimeString()
                : "Never"}
            </span>
          </div>
        </div>
      )}

      {/* AI Discovery Error State */}
      {aiError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-semibold text-red-800">
              AI Discovery Service Issue
            </h3>
          </div>
          <div className="space-y-3 text-red-700">
            <p className="font-medium">
              Unable to connect to AI Platform Discovery System:
            </p>
            <p className="text-sm bg-red-100 p-3 rounded">
              {aiError?.includes("unavailable") ? 
                "Service temporarily unavailable - this is normal during development" : 
                "Failed to fetch critical data"}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleRefreshAI}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Retry Connection
              </button>
              <button
                onClick={() => setActiveTab("ai-discovery")}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                Open Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No AI Discovery Data State */}
      {!hasData && !aiError && !aiLoading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Settings className="w-6 h-6 text-yellow-600" />
            <h3 className="text-lg font-semibold text-yellow-800">
              AI Discovery System Ready
            </h3>
          </div>
          <div className="space-y-3 text-yellow-700">
            <p className="font-medium">
              Two-table AI Platform Discovery System is ready to use:
            </p>
            <div className="space-y-2 ml-4">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </span>
                <span>Table 1: Active AI Providers (Production-ready)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </span>
                <span>Table 2: Research Suggestions (AI-discovered)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </span>
                <span>Smart categorization and top-3 ranking system</span>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={handleDiscoveryScan}
                disabled={aiLoading}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Globe
                  className={`w-4 h-4 ${aiLoading ? "animate-spin" : ""}`}
                />
                Run Initial Discovery Scan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Subscription Breakdown
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(stats?.subscription_breakdown || {}).map(
              ([tier, count]) => (
                <div key={tier} className="text-center">
                  <div
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getTierColor(
                      tier
                    )}`}
                  >
                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {count}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderRevenueTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Revenue Analytics</h2>
        <p className="text-gray-600">
          Track revenue, subscriptions, and financial metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Monthly Recurring Revenue
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats ? formatCurrency(stats.monthly_recurring_revenue) : "$0"}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Campaigns
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.total_campaigns_created}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Companies
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.total_companies}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Building2 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Breakdown Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Revenue by Subscription Tier
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {Object.entries(stats?.subscription_breakdown || {}).map(
              ([tier, count]) => (
                <div key={tier} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getTierColor(
                        tier
                      )}`}
                    >
                      {tier.charAt(0).toUpperCase() + tier.slice(1)}
                    </div>
                    <span className="text-sm text-gray-600">
                      {count} subscribers
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {tier === "free"
                        ? "$0"
                        : tier === "starter"
                        ? "$29"
                        : tier === "professional"
                        ? "$99"
                        : tier === "agency"
                        ? "$299"
                        : tier === "enterprise"
                        ? "$999"
                        : "$0"}{" "}
                      /mo
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Platform Settings</h2>
        <p className="text-gray-600">
          Manage platform-wide settings and configurations.
        </p>
      </div>
      
      {/* Global Demo Campaign Management */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <Target className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Demo Campaign Management</h3>
        </div>
        <p className="text-gray-600 mb-6">
          Create a global demo campaign that will be available to all users. 
          Users can toggle this demo campaign on/off in their campaigns list.
        </p>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Global Demo Campaign</h4>
            <p className="text-sm text-gray-600">
              Create a comprehensive demo campaign with realistic data and performance metrics
            </p>
          </div>
          <button
            onClick={async () => {
              try {
                console.log('Admin: Creating global demo campaign...');
                const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') || localStorage.getItem('access_token') : null;
                
                // Create demo campaign payload
                const demoPayload = {
                  title: "🌟 CampaignForge Demo - AI Marketing Excellence",
                  description: "Experience the power of AI-driven marketing automation with this comprehensive demo campaign showcasing intelligent product analysis, automated content generation, and multi-channel orchestration.",
                  campaign_type: "product_launch",
                  status: "active",
                  target_audience: "Digital marketers and business owners seeking AI-powered marketing solutions",
                  keywords: ["AI marketing", "automation", "content generation", "multi-channel", "analytics"],
                  goals: ["Demonstrate AI product intelligence", "Showcase multi-channel content generation", "Highlight campaign optimization features"],
                  settings: {
                    is_demo: true,
                    is_global: true,
                    demo_type: "global_demo",
                    created_by: "admin"
                  }
                };
                
                const result = await fetch('https://campaign-backend-production-e2db.up.railway.app/api/campaigns/', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(demoPayload)
                });
                
                if (result.ok) {
                  const campaign = await result.json();
                  console.log('Global demo campaign created:', campaign);
                  alert('✅ Global demo campaign created successfully!\n\nThis demo campaign is now available to all users and can be toggled on/off from their campaigns page.');
                } else {
                  const error = await result.text();
                  console.error('Failed to create global demo campaign:', error);
                  alert('❌ Failed to create global demo campaign. Check console for details.');
                }
              } catch (error) {
                console.error('Error creating global demo campaign:', error);
                alert('❌ Error creating global demo campaign. Check console for details.');
              }
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center"
          >
            <Target className="w-4 h-4 mr-2" />
            Create Global Demo
          </button>
        </div>
      </div>

      {/* Other Settings */}
      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 text-center">
        <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Additional Settings
        </h3>
        <p className="text-gray-500">More platform settings coming soon.</p>
      </div>
    </div>
  );

  // Loading states
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
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
              <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                RodgersDigital Admin
              </h1>
              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium">
                v3.3.0
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-1 text-sm text-gray-500">
              <span>Platform</span>
              <span>/</span>
              <span className="text-gray-900">Administration</span>
              <span>/</span>
              <span className="text-purple-600">AI Discovery</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-red-100 text-red-800">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Admin Access</span>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search users, companies..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* AI Discovery Quick Status */}
            {hasData && (
              <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                <Bot className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {summaryStats.total_active} Active |{" "}
                  {summaryStats.pending_suggestions} Pending
                </span>
              </div>
            )}

            <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
              A
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Enhanced Sidebar with AI Discovery Status */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full flex items-center space-x-2 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors text-sm border border-purple-200"
            >
              <Sparkles className="w-4 h-4" />
              <span>Switch to User Dashboard</span>
            </button>
          </div>

          <nav className="p-4 space-y-2">
            {Object.entries(tabs).map(([key, tab]) => {
              const Icon = tab.icon;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
                    activeTab === key
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : tab.highlight
                      ? "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div className="w-5 h-5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium">{tab.label}</span>
                  {tab.highlight && (
                    <div className="ml-auto flex items-center space-x-1">
                      {key === "ai-discovery" && hasData && (
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      )}
                      {tab.badge && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-1 py-0.5 rounded">
                          {tab.badge}
                        </span>
                      )}
                      <Zap className="w-4 h-4 text-blue-500" />
                    </div>
                  )}
                  {key === "ai-discovery" && hasPendingSuggestions && (
                    <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                      {pendingSuggestions.length}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Add campaigns button separately for external navigation */}
            <button
              onClick={() => router.push("/campaigns")}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors text-purple-600 hover:bg-purple-50 border border-purple-200"
            >
              <div className="w-5 h-5">
                <Target className="w-5 h-5" />
              </div>
              <span className="font-medium">Campaign Manager</span>
              <svg
                className="w-4 h-4 ml-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </button>
          </nav>

          {/* Enhanced Platform Stats with AI Discovery */}
          <div className="p-4 mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Platform Status
            </h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Total Users</span>
                  <span>{stats.total_users}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {stats.total_companies} companies
                </div>
              </div>

              {waitlistStats && (
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Waitlist</span>
                    <span>{waitlistStats.total}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {waitlistStats.today} today
                  </div>
                </div>
              )}

              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Monthly Revenue</span>
                  <span>{formatCurrency(stats.monthly_recurring_revenue)}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {stats.total_campaigns_created} campaigns
                </div>
              </div>

              {/* Enhanced AI Discovery Status in Sidebar */}
              {hasData && (
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>AI Providers</span>
                    <span>{summaryStats.total_active}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Discovery {isHealthy ? "healthy" : "issues"}
                  </div>
                  {hasPendingSuggestions && (
                    <div className="text-xs text-orange-600 mt-1">
                      {pendingSuggestions.length} pending review
                    </div>
                  )}
                </div>
              )}

              {/* AI Discovery Quick Actions */}
              {hasData && (
                <div className="pt-2 space-y-2">
                  <button
                    onClick={handleRefreshAI}
                    disabled={aiLoading}
                    className="w-full text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {aiLoading ? "Refreshing..." : "Refresh AI"}
                  </button>
                  {hasPendingSuggestions && (
                    <button
                      onClick={() => setActiveTab("ai-discovery")}
                      className="w-full text-xs bg-orange-600 text-white px-2 py-1 rounded hover:bg-orange-700"
                    >
                      Review Suggestions
                    </button>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="w-full mt-6 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {renderTabContent()}

          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          )}
        </main>
      </div>

      {/* Edit Modals */}
      {userEditModal.user && (
        <UserEditModal
          user={userEditModal.user}
          isOpen={userEditModal.isOpen}
          onClose={closeUserEditModal}
          onSave={fetchUsers}
        />
      )}

      {companyEditModal.company && (
        <CompanyEditModal
          company={companyEditModal.company}
          isOpen={companyEditModal.isOpen}
          onClose={closeCompanyEditModal}
          onSave={fetchCompanies}
        />
      )}
    </div>
  );
}
