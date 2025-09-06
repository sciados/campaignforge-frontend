// File: src/components/dashboards/enhanced/EnhancedUserDashboard.tsx
// Enhanced User Dashboard component with type safety and modern design

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Plus, Search, Filter, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserDashboardStats } from "./UserDashboardStats";
import { DemoToggle } from "./DemoToggle";
import { CampaignCard } from "./CampaignCard";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://campaign-backend-production-e2db.up.railway.app";

// Type definitions
interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  user_type?: string;
}

interface Campaign {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  completion_percentage?: number;
  content_count?: number;
  sources_count?: number;
  is_demo?: boolean;
}

interface DashboardStats {
  total_campaigns_created?: number;
  active_campaigns?: number;
  total_content?: number;
  avg_completion?: number;
}

// API Functions
const fetchDashboardStats = async (): Promise<DashboardStats | null> => {
  const token = localStorage.getItem("authToken");
  if (!token) return null;

  const response = await fetch(`${API_BASE_URL}/api/campaigns/stats/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error("Failed to fetch dashboard stats");
  return response.json();
};

const fetchCampaigns = async (): Promise<Campaign[]> => {
  const token = localStorage.getItem("authToken");
  if (!token) return [];

  const response = await fetch(`${API_BASE_URL}/api/campaigns/`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error("Failed to fetch campaigns");
  return response.json();
};

const fetchUserProfile = async (): Promise<User | null> => {
  const token = localStorage.getItem("authToken");
  if (!token) return null;

  const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error("Failed to fetch user profile");
  return response.json();
};

export const EnhancedUserDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [showDemo, setShowDemo] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const router = useRouter();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, campaignsData, userData] = await Promise.all([
          fetchDashboardStats(),
          fetchCampaigns(),
          fetchUserProfile(),
        ]);

        setStats(statsData);
        setCampaigns(campaignsData);
        setUser(userData);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const filteredCampaigns = campaigns.filter((campaign: Campaign) => {
    const matchesSearch =
      campaign.title?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
    const matchesDemo = showDemo || !campaign.is_demo;
    return matchesSearch && matchesDemo;
  });

  const handleCreateCampaign = (): void => {
    router.push("/campaigns/create-workflow");
  };

  const handleViewCampaign = (campaign: Campaign): void => {
    router.push(`/campaigns/${campaign.id}`);
  };

  const handleEditCampaign = (campaign: Campaign): void => {
    router.push(`/campaigns/${campaign.id}/settings`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-black">CampaignForge</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Bell className="w-6 h-6 text-gray-400 hover:text-gray-600 cursor-pointer" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.full_name?.charAt(0) || "U"}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user?.full_name || "User"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-black mb-2">
            Welcome back, {user?.full_name?.split(" ")[0] || "there"}!
          </h2>
          <p className="text-gray-600">
            Here is what is happening with your campaigns today.
          </p>
        </div>

        {/* Stats Grid */}
        <UserDashboardStats stats={stats} />

        {/* Campaigns Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-black">Your Campaigns</h3>
            <div className="flex items-center space-x-4">
              <DemoToggle
                showDemo={showDemo}
                onToggle={() => setShowDemo(!showDemo)}
              />
              <Button onClick={handleCreateCampaign}>
                <Plus className="w-4 h-4 mr-2" />
                New Campaign
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Campaigns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign: Campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onView={handleViewCampaign}
                onEdit={handleEditCampaign}
              />
            ))}
          </div>

          {filteredCampaigns.length === 0 && (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">
                No campaigns found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? "Try adjusting your search terms."
                  : "Get started by creating your first campaign."}
              </p>
              {!searchTerm && (
                <Button onClick={handleCreateCampaign}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Campaign
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-black">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  Campaign &quot;Summer Launch&quot; completed analysis
                </span>
                <span className="text-xs text-gray-400">2 hours ago</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  New content generated for &quot;Product Demo&quot;
                </span>
                <span className="text-xs text-gray-400">4 hours ago</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  Enhanced email sequence created
                </span>
                <span className="text-xs text-gray-400">1 day ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
