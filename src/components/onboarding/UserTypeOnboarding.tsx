// src/components/onboarding/UserTypeOnboarding.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/lib/api";
import OnboardingFlow from "./OnboardingFlow";

interface UserTypeOnboardingProps {
  userType: string;
  userId: string;
}

export default function UserTypeOnboarding({ userType, userId }: UserTypeOnboardingProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const router = useRouter();
  const api = useApi();

  const handleOnboardingComplete = async () => {
    setIsCompleting(true);
    try {
      // Mark onboarding as completed in the backend using the existing API method
      await api.completeOnboarding(getDefaultGoals(userType), "beginner");

      // Route to appropriate dashboard
      const dashboardRoute = getDashboardRoute(userType);
      router.push(dashboardRoute);
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      // Still route to dashboard as fallback
      const dashboardRoute = getDashboardRoute(userType);
      router.push(dashboardRoute);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleSkipOnboarding = async () => {
    try {
      // Mark as completed but skipped using the existing API method
      await api.completeOnboarding([], "experienced");

      const dashboardRoute = getDashboardRoute(userType);
      router.push(dashboardRoute);
    } catch (error) {
      console.error("Failed to skip onboarding:", error);
      const dashboardRoute = getDashboardRoute(userType);
      router.push(dashboardRoute);
    }
  };

  const getDefaultGoals = (userType: string): string[] => {
    switch (userType) {
      case "PRODUCT_CREATOR":
      case "product_creator":
        return [
          "analyze_product_urls",
          "get_marketing_insights",
          "optimize_product_pages",
          "track_performance"
        ];
      case "AFFILIATE_MARKETER":
      case "affiliate_marketer":
        return [
          "find_profitable_products",
          "create_high_converting_campaigns",
          "maximize_commissions",
          "scale_affiliate_business"
        ];
      case "BUSINESS_OWNER":
      case "business_owner":
        return [
          "grow_business_revenue",
          "improve_marketing_roi",
          "understand_market_trends",
          "optimize_product_strategy"
        ];
      default:
        return ["explore_platform"];
    }
  };

  const getDashboardRoute = (userType: string): string => {
    const routes = {
      "PRODUCT_CREATOR": "/dashboard/product-creator",
      "product_creator": "/dashboard/product-creator",
      "AFFILIATE_MARKETER": "/dashboard/affiliate",
      "affiliate_marketer": "/dashboard/affiliate",
      "affiliate": "/dashboard/affiliate",
      "CONTENT_CREATOR": "/dashboard/creator",
      "content_creator": "/dashboard/creator",
      "creator": "/dashboard/creator",
      "BUSINESS_OWNER": "/dashboard/business",
      "business_owner": "/dashboard/business",
      "business": "/dashboard/business"
    };

    return routes[userType as keyof typeof routes] || "/dashboard";
  };

  return (
    <OnboardingFlow
      userType={userType}
      onComplete={handleOnboardingComplete}
      onSkip={handleSkipOnboarding}
    />
  );
}

// Future enhancement: Video course component
export function VideoCoursePlaceholder({ userType }: { userType: string }) {
  const getCourseTitle = (userType: string): string => {
    switch (userType) {
      case "PRODUCT_CREATOR":
      case "product_creator":
        return "Product Analysis Mastery Course";
      case "AFFILIATE_MARKETER":
      case "affiliate_marketer":
        return "Affiliate Marketing Excellence Course";
      case "BUSINESS_OWNER":
      case "business_owner":
        return "Business Growth Strategy Course";
      default:
        return "Platform Mastery Course";
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-lg">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
          <span className="text-2xl">🎥</span>
        </div>
        <div>
          <h3 className="text-xl font-bold">{getCourseTitle(userType)}</h3>
          <p className="text-purple-100">Coming Soon - Deep dive video training</p>
        </div>
      </div>
      <button className="mt-4 bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition-colors">
        Join Waitlist
      </button>
    </div>
  );
}