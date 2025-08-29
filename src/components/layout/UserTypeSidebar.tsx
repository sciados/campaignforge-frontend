// src/components/layout/UserTypeSidebar.tsx - FIXED VERSION
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApi } from "@/lib/api";
import { UserType } from "@/lib/user-type-utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserProfile {
  user_type: UserType;
  user_type_display: string;
  dashboard_route: string;
  available_features: string[];
  full_name?: string;
  email?: string;
}

const UserTypeSidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const router = useRouter();
  const api = useApi();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Fix: Remove useCallback and api dependency to prevent infinite loop
  const loadUserProfile = async () => {
    try {
      const config = await api.getUserTypeConfig();
      setUserProfile(config.user_profile);
    } catch (error) {
      console.error("Failed to load user profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fix: Use empty dependency array to run only once on mount
  useEffect(() => {
    loadUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - runs only once

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await api.logout();
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("authToken");
      }
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getNavigationItems = () => {
    if (!userProfile) return [];

    const baseItems = [
      {
        href: userProfile.dashboard_route,
        label: "Dashboard",
        icon: "🏠",
        isActive: pathname === userProfile.dashboard_route,
      },
      {
        href: "/campaigns",
        label: "Campaigns",
        icon: "📋",
        isActive: pathname.startsWith("/campaigns"),
      },
    ];

    const typeSpecificItems = getTypeSpecificNavigation(userProfile.user_type);

    const commonItems = [
      {
        href: "/dashboard/content-library",
        label: "Content Library",
        icon: "📚",
        isActive: pathname.startsWith("/dashboard/content-library"),
      },
      {
        href: "/dashboard/analytics",
        label: "Analytics",
        icon: "📊",
        isActive: pathname.startsWith("/dashboard/analytics"), // Fixed double slash
      },
      {
        href: "/dashboard/settings",
        label: "Settings",
        icon: "⚙️",
        isActive: pathname.startsWith("/dashboard/settings"),
      },
    ];

    return [...baseItems, ...typeSpecificItems, ...commonItems];
  };

  const getTypeSpecificNavigation = (userType: UserType) => {
    switch (userType) {
      case "affiliate_marketer":
        return [
          {
            href: "/dashboard/affiliate/competitors",
            label: "Competitor Intel",
            icon: "🔍",
            isActive: pathname.startsWith("/dashboard/affiliate/competitors"),
          },
          {
            href: "/dashboard/affiliate/commissions",
            label: "Commission Tracker",
            icon: "💰",
            isActive: pathname.startsWith("/dashboard/affiliate/commissions"),
          },
        ];

      case "content_creator":
        return [
          {
            href: "/dashboard/creator/viral",
            label: "Viral Opportunities",
            icon: "🔥",
            isActive: pathname.startsWith("/dashboard/creator/viral"),
          },
          {
            href: "/dashboard/creator/content-studio",
            label: "Content Studio",
            icon: "🎬",
            isActive: pathname.startsWith("/dashboard/creator/content-studio"),
          },
        ];

      case "business_owner":
        return [
          {
            href: "/dashboard/business/leads",
            label: "Lead Generation",
            icon: "🎯",
            isActive: pathname.startsWith("/dashboard/business/leads"),
          },
          {
            href: "/dashboard/business/market-intel",
            label: "Market Intelligence",
            icon: "📊",
            isActive: pathname.startsWith("/dashboard/business/market-intel"),
          },
        ];

      default:
        return [];
    }
  };

  if (isLoading) {
    return (
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!userProfile) return null;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:inset-0`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <span className="text-xl font-bold text-gray-900">
              CampaignForge
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-sm text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        {/* User Type Badge */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="text-sm font-medium text-gray-900">
            {userProfile.user_type_display}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Specialized Dashboard
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {getNavigationItems().map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onClose()}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  item.isActive
                    ? "bg-blue-100 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <Link
            href="/user-selection"
            className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-50"
            onClick={onClose}
          >
            <span className="mr-3">🔄</span>
            Switch User Type
          </Link>
        </div>
      </div>
    </>
  );
};

export default UserTypeSidebar;
