// src/components/user-types/UserTypeSelector.tsx - FIXED FOR EXISTING HOOK
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUserType } from "@/lib/hooks/useUserType";

interface UserType {
  value: string;
  emoji: string;
  title: string;
  description: string;
  features: string[];
  pricing_start: string;
}

interface UserTypeSelectorProps {
  onTypeSelect?: (userType: string) => void;
  showDetectionOption?: boolean;
  className?: string;
}

const UserTypeSelector: React.FC<UserTypeSelectorProps> = ({
  onTypeSelect,
  showDetectionOption = true,
  className = "",
}) => {
  const router = useRouter();
  const {
    setUserType,
    isLoading: hookLoading,
    error: hookError,
  } = useUserType();
  const [error, setError] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [userTypes] = useState<Record<string, UserType>>({
    affiliate_marketer: {
      value: "affiliate_marketer",
      emoji: "💰",
      title: "Affiliate Marketer",
      description: "Promote products and earn commissions",
      features: [
        "Competitor tracking",
        "Commission analysis",
        "Compliance monitoring",
      ],
      pricing_start: "$149/month",
    },
    content_creator: {
      value: "content_creator",
      emoji: "🎬",
      title: "Content Creator",
      description: "Create viral content and grow your audience",
      features: ["Viral analysis", "Trend detection", "Brand partnerships"],
      pricing_start: "$99/month",
    },
    business_owner: {
      value: "business_owner",
      emoji: "🏢",
      title: "Business Owner",
      description: "Generate leads and grow your business",
      features: ["Market research", "Lead generation", "ROI tracking"],
      pricing_start: "$199/month",
    },
  });

  // Display any hook errors
  useEffect(() => {
    if (hookError) {
      setError(hookError);
    }
  }, [hookError]);

  const handleTypeSelect = async (userType: string) => {
    // Just select the type for now, don't submit yet
    setSelectedType(userType);
    setError("");

    if (onTypeSelect) {
      onTypeSelect(userType);
    }
  };

  const handleSubmit = async () => {
    if (!selectedType) {
      setError("Please select a user type");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      console.log("🔄 Submitting user type selection:", selectedType);

      // Use the correct method name from your existing hook
      const success = await setUserType(selectedType as any, {
        goals: [],
        experience_level: "beginner",
        current_activities: [],
        interests: [],
        description: "",
      });

      if (success) {
        console.log(
          "✅ User type selected successfully, navigating to onboarding"
        );
        router.push("/onboarding");
      } else {
        setError("Failed to save user type. Please try again.");
      }
    } catch (error) {
      console.error("❌ Error in handleSubmit:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = hookLoading || isSubmitting;

  return (
    <div className={`max-w-6xl mx-auto p-6 ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Choose Your CampaignForge Experience
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Select the option that best describes you to unlock personalized
          features and insights
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-center">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* User Type Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {Object.entries(userTypes).map(([key, type]) => (
          <motion.div
            key={key}
            id={`type-card-${key}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`relative bg-white rounded-xl border-2 p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedType === key
                ? "border-blue-500 bg-blue-50 shadow-lg scale-105"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleTypeSelect(key)}
          >
            {/* Selected Indicator */}
            {selectedType === key && (
              <div className="absolute -top-2 -left-2 bg-blue-500 text-white rounded-full p-1">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
            )}

            {/* Card Content */}
            <div className="text-center mb-4">
              <div className="text-4xl mb-3">{type.emoji}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {type.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4">{type.description}</p>

              {/* Features */}
              <div className="space-y-2 mb-4">
                {type.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center text-sm text-gray-700"
                  >
                    <svg
                      className="w-4 h-4 text-green-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    {feature}
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="text-sm font-semibold text-blue-600">
                Starting at {type.pricing_start}
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-6">
              <div
                className={`w-full py-3 px-4 rounded-lg text-center font-medium transition-colors ${
                  selectedType === key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {selectedType === key ? "Selected" : "Choose This"}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Continue Button */}
      {selectedType && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <button
            onClick={handleSubmit}
            disabled={isLoading || !selectedType}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
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
                Setting up your experience...
              </span>
            ) : (
              `Continue as ${userTypes[selectedType]?.title}`
            )}
          </button>

          <p className="text-sm text-gray-500 mt-3">
            You can change this later in your account settings
          </p>
        </motion.div>
      )}

      {/* Benefits Section */}
      <div className="mt-12 bg-gray-50 rounded-xl p-8">
        <h3 className="text-2xl font-bold text-center text-gray-900 mb-6">
          Why Choose Your User Type?
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-3">🎯</div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Personalized Experience
            </h4>
            <p className="text-sm text-gray-600">
              Get features, insights, and tools tailored specifically for your
              goals and workflow.
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">🧠</div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Smart Intelligence
            </h4>
            <p className="text-sm text-gray-600">
              Our AI automatically discovers and analyzes the most relevant data
              for your user type.
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">🚀</div>
            <h4 className="font-semibold text-gray-900 mb-2">Faster Results</h4>
            <p className="text-sm text-gray-600">
              Skip generic features and jump straight to the tools that matter
              most for your success.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelector;
