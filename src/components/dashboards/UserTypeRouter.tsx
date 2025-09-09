// src/components/dashboards/UserTypeRouter.tsx - COMPLETELY FIXED VERSION (NO HARDCODED URLS)
/**
 * Fixed User Type Router for CampaignForge
 * Uses centralized config and simplified routing logic
 */

"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { getApiUrl } from "@/lib/config";

// Import dashboard components
import AffiliateDashboard from "./affiliate/AffiliateDashboard";
import CreatorDashboard from "./creator/CreatorDashboard";
import BusinessDashboard from "./business/BusinessDashboard";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  user_type: string | null;
  role: string;
  user_type_display?: string;
  onboarding_completed?: boolean;
}

interface DashboardConfig {
  user_profile: {
    user_type_display: string;
    usage_summary: {
      campaigns: { used: number; limit: number; percentage: number };
      analysis: { used: number; limit: number; percentage: number };
    };
  };
  primary_widgets: string[];
  dashboard_title: string;
  main_cta: string;
  theme_color: string;
}

const UserTypeRouter: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dashboardConfig, setDashboardConfig] =
    useState<DashboardConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = () => {
    if (typeof window === "undefined") return null;
    return (
      localStorage.getItem("authToken") || localStorage.getItem("access_token")
    );
  };

  const checkUserAuthAndRoute = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const token = getAuthToken();
    if (!token) {
      console.log("No auth token found, redirecting to login");
      router.push("/login");
      return;
    }

    try {
      // Step 1: Get user profile from backend
      const profileResponse = await fetch(getApiUrl("/api/auth/profile"), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!profileResponse.ok) {
        if (profileResponse.status === 401) {
          // Token is invalid, clear it and redirect to login
          localStorage.removeItem("authToken");
          localStorage.removeItem("access_token");
          router.push("/login");
          return;
        }
        throw new Error(`Profile fetch failed: ${profileResponse.statusText}`);
      }

      const profile = await profileResponse.json();
      setUserProfile(profile);

      // Step 2: Handle routing based on profile
      if (profile.role === "admin") {
        router.push("/admin");
        return;
      }

      if (!profile.user_type) {
        // User hasn't selected a user type yet
        console.log("No user type found, redirecting to user selection");
        router.push("/user-selection");
        return;
      }

      // Step 3: Get dashboard config for the user type
      try {
        const configResponse = await fetch(
          getApiUrl("/api/user-types/dashboard-config"),
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (configResponse.ok) {
          const configData = await configResponse.json();
          if (configData.success && configData.config) {
            setDashboardConfig(configData.config);
          } else {
            // Create fallback config
            setDashboardConfig(createFallbackConfig(profile));
          }
        } else {
          // Create fallback config if endpoint not available
          setDashboardConfig(createFallbackConfig(profile));
        }
      } catch (configError) {
        console.warn(
          "Dashboard config fetch failed, using fallback:",
          configError
        );
        setDashboardConfig(createFallbackConfig(profile));
      }

      // Step 4: Route to correct dashboard if not already there
      const expectedPath = getDashboardPath(profile.user_type);
      if (pathname !== expectedPath && pathname.startsWith("/dashboard")) {
        console.log(`Routing from ${pathname} to ${expectedPath}`);
        router.push(expectedPath);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setError("Failed to load user information. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [router, pathname]);

  // Helper function to get dashboard path
  const getDashboardPath = (userType: string): string => {
    const routes = {
      affiliate_marketer: "/dashboard/affiliate",
      content_creator: "/dashboard/creator",
      business_owner: "/dashboard/business",
    };
    return routes[userType as keyof typeof routes] || "/dashboard/router";
  };

  // Helper function to create fallback config
  const createFallbackConfig = (profile: UserProfile): DashboardConfig => {
    const userTypeDisplays = {
      affiliate_marketer: "Affiliate Marketer",
      content_creator: "Content Creator",
      business_owner: "Business Owner",
    };

    const dashboardTitles = {
      affiliate_marketer: "Affiliate Command Center",
      content_creator: "Creator Studio Pro",
      business_owner: "Business Growth Hub",
    };

    const mainCTAs = {
      affiliate_marketer: "Track Competitors",
      content_creator: "Analyze Viral Content",
      business_owner: "Generate Leads",
    };

    return {
      user_profile: {
        user_type_display:
          userTypeDisplays[
            profile.user_type as keyof typeof userTypeDisplays
          ] || "User",
        usage_summary: {
          campaigns: { used: 0, limit: 10, percentage: 0 },
          analysis: { used: 0, limit: 5, percentage: 0 },
        },
      },
      primary_widgets: ["dashboard", "campaigns", "analytics"],
      dashboard_title:
        dashboardTitles[profile.user_type as keyof typeof dashboardTitles] ||
        "Dashboard",
      main_cta:
        mainCTAs[profile.user_type as keyof typeof mainCTAs] || "Get Started",
      theme_color: "blue",
    };
  };

  // Run auth check on mount and path changes
  useEffect(() => {
    checkUserAuthAndRoute();
  }, [checkUserAuthAndRoute]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Setting up your personalized experience...
          </p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md"
        >
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={checkUserAuthAndRoute}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push("/login")}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Login
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // If no user profile or user type, redirect (this should be handled by the auth check)
  if (!userProfile || !userProfile.user_type) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to user setup...</p>
        </motion.div>
      </div>
    );
  }

  // Render appropriate dashboard based on user type
  const renderDashboard = () => {
    if (!dashboardConfig) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Loading dashboard configuration...
            </h2>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
      );
    }

    switch (userProfile.user_type) {
      case "affiliate_marketer":
        return <AffiliateDashboard config={dashboardConfig} />;
      case "content_creator":
        return <CreatorDashboard config={dashboardConfig} />;
      case "business_owner":
        return <BusinessDashboard config={dashboardConfig} />;
      default:
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Unknown user type: {userProfile.user_type}
              </h2>
              <p className="text-gray-600 mb-4">
                Please select a valid user type to continue.
              </p>
              <button
                onClick={() => router.push("/user-selection")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Select User Type
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {renderDashboard()}
    </motion.div>
  );
};

export default UserTypeRouter;
