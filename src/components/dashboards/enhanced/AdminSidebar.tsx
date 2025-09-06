"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Users,
  Building2,
  ListChecks,
  Bot,
  DollarSign,
  Settings,
  Target,
  Sparkles,
  Zap,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface TabConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  highlight?: boolean;
  badge?: string;
}

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
  "ai-discovery": {
    label: "AI Platform Discovery",
    icon: Bot,
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

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  stats: any;
  aiDiscoveryData?: any;
  onLogout: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  stats,
  aiDiscoveryData,
  onLogout,
}) => {
  const router = useRouter();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-4 border-b border-gray-200">
        <Button
          onClick={() => router.push("/dashboard")}
          variant="outline"
          className="w-full"
          size="sm"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Switch to User Dashboard
        </Button>
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
                  {key === "ai-discovery" && aiDiscoveryData?.hasData && (
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
              {key === "ai-discovery" &&
                aiDiscoveryData?.hasPendingSuggestions && (
                  <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    {aiDiscoveryData.pendingSuggestions?.length || 0}
                  </span>
                )}
            </button>
          );
        })}

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

      {/* Platform Stats */}
      <div className="p-4 mt-6">
        <h4 className="text-sm font-medium text-black mb-3">Platform Status</h4>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Total Users</span>
              <span>{stats?.total_users || 0}</span>
            </div>
            <div className="text-xs text-gray-500">
              {stats?.total_companies || 0} companies
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Monthly Revenue</span>
              <span>
                {formatCurrency(stats?.monthly_recurring_revenue || 0)}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {stats?.total_campaigns_created || 0} campaigns
            </div>
          </div>

          {aiDiscoveryData?.hasData && (
            <div className="pt-3 border-t border-gray-200">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>AI Providers</span>
                <span>{aiDiscoveryData.summaryStats?.total_active || 0}</span>
              </div>
              <div className="text-xs text-gray-500">
                Discovery {aiDiscoveryData.isHealthy ? "healthy" : "issues"}
              </div>
              {aiDiscoveryData.hasPendingSuggestions && (
                <div className="text-xs text-orange-600 mt-1">
                  {aiDiscoveryData.pendingSuggestions?.length || 0} pending
                  review
                </div>
              )}
            </div>
          )}
        </div>

        <Button
          onClick={onLogout}
          variant="ghost"
          className="w-full mt-6 text-sm text-gray-600 hover:text-gray-800"
        >
          Sign Out
        </Button>
      </div>
    </aside>
  );
};
