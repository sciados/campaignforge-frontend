// src/components/dashboards/UserTypeRouter.tsx
/**
 * Multi-User Dashboard Router for CampaignForge
 * 🎭 Routes users to their appropriate dashboard based on user type
 * 🎯 Handles user type detection and dashboard configuration
 */

"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";

// Import dashboard components
import AffiliateDashboard from "./affiliate/AffiliateDashboard";
import CreatorDashboard from "./creator/CreatorDashboard";
import BusinessDashboard from "./business/BusinessDashboard";
import UserTypeSelector from "../user-types/UserTypeSelector";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  user_type: string | null;
  user_type_display: string;
  user_tier: string;
  onboarding_status: string;
  dashboard_route: string;
  onboarding_completed: boolean;
  usage_summary: {
    campaigns: {
      used: number;
      limit: number;
      available: number;
      percentage: number;
    };
    analysis: {
      used: number;
      limit: number;
      available: number;
      percentage: number;
    };
  };
}

interface DashboardConfig {
  user_profile: UserProfile;
  available_features: string[];
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

  useEffect(() => {
    checkUserTypeAndRoute();
  }, [pathname]);

  const checkUserTypeAndRoute = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/user-types/current", {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to get user information");
      }

      if (data.success) {
        setUserProfile(data.user_profile);
        setDashboardConfig(data.dashboard_config);

        // Handle routing based on user type and onboarding status
        const profile = data.user_profile;

        if (!profile.user_type) {
          // User hasn't selected type yet - show type selector
          if (pathname !== "/user-selection") {
            router.push("/user-selection");
          }
          return;
        }

        if (!profile.onboarding_completed) {
          // User has type but hasn't completed onboarding
          if (pathname !== "/onboarding") {
            router.push("/onboarding");
          }
          return;
        }

        // User is fully set up - route to appropriate dashboard
        const expectedPath = profile.dashboard_route;
        if (pathname !== expectedPath && pathname.startsWith("/dashboard")) {
          router.push(expectedPath);
          return;
        }
      }
    } catch (error) {
      console.error("Failed to check user type:", error);
      setError("Failed to load user information. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeSelection = async (userType: string) => {
    // This will be handled by the UserTypeSelector component
    // which will redirect appropriately after setting the type
    await checkUserTypeAndRoute();
  };

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
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  // Show user type selector if no user type is set
  if (!userProfile?.user_type) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <UserTypeSelector onTypeSelect={handleTypeSelection} />
      </div>
    );
  }

  // Show onboarding if not completed
  if (!userProfile.onboarding_completed) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome, {userProfile.user_type_display}! 👋
            </h1>
            <p className="text-gray-600 mb-6">
              Let's complete your setup to unlock all features.
            </p>
            <OnboardingCompleteForm userProfile={userProfile} />
          </div>
        </div>
      </div>
    );
  }

  // Route to appropriate dashboard based on user type
  const renderDashboard = () => {
    if (!dashboardConfig) return null;

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
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Unknown user type: {userProfile.user_type}
              </h2>
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

// Onboarding completion component
interface OnboardingCompleteFormProps {
  userProfile: UserProfile;
}

const OnboardingCompleteForm: React.FC<OnboardingCompleteFormProps> = ({
  userProfile,
}) => {
  const router = useRouter();
  const [goals, setGoals] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState("beginner");
  const [isLoading, setIsLoading] = useState(false);

  const availableGoals = {
    affiliate_marketer: [
      "Increase commission rates",
      "Track top competitors",
      "Improve conversion rates",
      "Find new profitable offers",
      "Automate campaign optimization",
      "Scale traffic sources",
    ],
    content_creator: [
      "Go viral more often",
      "Grow follower count",
      "Increase engagement rates",
      "Secure brand partnerships",
      "Create better content",
      "Cross-platform growth",
    ],
    business_owner: [
      "Generate more leads",
      "Increase sales revenue",
      "Understand market trends",
      "Outpace competitors",
      "Improve marketing ROI",
      "Expand market share",
    ],
  };

  const userGoals =
    availableGoals[userProfile.user_type as keyof typeof availableGoals] || [];

  const toggleGoal = (goal: string) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleComplete = async () => {
    if (goals.length === 0) {
      alert("Please select at least one goal");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/user-types/complete-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          goals,
          experience_level: experienceLevel,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push(data.dashboard_route);
      } else {
        alert("Failed to complete onboarding. Please try again.");
      }
    } catch (error) {
      console.error("Onboarding completion failed:", error);
      alert("Failed to complete onboarding. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Goals Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          What are your main goals?
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {userGoals.map((goal) => (
            <button
              key={goal}
              onClick={() => toggleGoal(goal)}
              className={`p-3 text-sm rounded-lg border text-left transition-colors ${
                goals.includes(goal)
                  ? "bg-blue-100 border-blue-300 text-blue-800"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="flex items-center">
                <span
                  className={`mr-2 ${
                    goals.includes(goal) ? "text-blue-600" : "text-gray-400"
                  }`}
                >
                  {goals.includes(goal) ? "☑️" : "☐"}
                </span>
                {goal}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Experience Level */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          What is your experience level?
        </h3>
        <div className="flex space-x-4">
          {["beginner", "intermediate", "advanced"].map((level) => (
            <button
              key={level}
              onClick={() => setExperienceLevel(level)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                experienceLevel === level
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Complete Button */}
      <button
        onClick={handleComplete}
        disabled={isLoading || goals.length === 0}
        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
      >
        {isLoading ? "Setting up your dashboard..." : "Complete Setup →"}
      </button>
    </div>
  );
};

export default UserTypeRouter;
