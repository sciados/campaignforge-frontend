// src/app/onboarding/page.tsx
/**
 * Onboarding Completion Page
 * ✅ Complete user setup after type selection
 */

"use client";

import { useState } from "react";
import { useUserType } from "@/lib/hooks/useUserType";
import { motion } from "framer-motion";

export default function OnboardingPage() {
  const { userProfile, completeOnboarding, isLoading } = useUserType();
  const [goals, setGoals] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState("beginner");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getAvailableGoals = () => {
    const goalsByType = {
      AFFILIATE_MARKETER: [
        "Increase commission rates",
        "Track top competitors",
        "Improve conversion rates",
        "Find new profitable offers",
        "Automate campaign optimization",
        "Scale traffic sources",
      ],
      CONTENT_CREATOR: [
        "Go viral more often",
        "Grow follower count",
        "Increase engagement rates",
        "Secure brand partnerships",
        "Create better content",
        "Cross-platform growth",
      ],
      BUSINESS_OWNER: [
        "Generate more leads",
        "Increase sales revenue",
        "Understand market trends",
        "Outpace competitors",
        "Improve marketing ROI",
        "Expand market share",
      ],
    };

    return (
      goalsByType[userProfile?.user_type as keyof typeof goalsByType] || []
    );
  };

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

    setIsSubmitting(true);
    const success = await completeOnboarding(goals, experienceLevel);

    if (!success) {
      setIsSubmitting(false);
      alert("Failed to complete onboarding. Please try again.");
    }
  };

  if (isLoading || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome, {userProfile.user_type_display}! 👋
            </h1>
            <p className="text-gray-600">
              Let us personalize your experience with a few quick questions.
            </p>
          </div>

          {/* Goals Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              What are your main goals?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {getAvailableGoals().map((goal) => (
                <button
                  key={goal}
                  onClick={() => toggleGoal(goal)}
                  className={`p-4 text-left rounded-lg border transition-all ${
                    goals.includes(goal)
                      ? "bg-blue-100 border-blue-300 text-blue-800"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="flex items-center">
                    <span
                      className={`mr-3 text-lg ${
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
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              What is your experience level?
            </h2>
            <div className="flex space-x-4">
              {["beginner", "intermediate", "advanced"].map((level) => (
                <button
                  key={level}
                  onClick={() => setExperienceLevel(level)}
                  className={`flex-1 py-3 px-4 rounded-lg text-center font-medium transition-colors ${
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
            disabled={isSubmitting || goals.length === 0}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Setting up your dashboard...
              </span>
            ) : (
              "Complete Setup & Go to Dashboard →"
            )}
          </button>

          <p className="text-sm text-gray-500 text-center mt-4">
            You can change these preferences later in your account settings.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
