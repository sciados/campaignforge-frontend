// src/components/user-types/UserTypeSelector.tsx - FIXED VERSION
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useApi } from "@/lib/api";

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
  const api = useApi();
  const [error, setError] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [detectedType, setDetectedType] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDetectionForm, setShowDetectionForm] = useState(false);
  const [detectionFormData, setDetectionFormData] = useState({
    description: "",
    goals: [] as string[],
    currentActivities: [] as string[],
    interests: [] as string[],
  });

  const [userTypes, setUserTypes] = useState<Record<string, UserType>>({
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

  const fetchUserTypes = useCallback(async () => {
    try {
      const response = await api.getAllUserTypes();

      if (response.success) {
        setUserTypes(response.user_types);
      }
    } catch (error) {
      console.error("Failed to fetch user types:", error);
    }
  }, [api]);

  useEffect(() => {
    fetchUserTypes();
  }, [fetchUserTypes]);

  const handleTypeDetection = async () => {
    if (!detectionFormData.description.trim()) {
      alert("Please provide a description of what you do");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.detectUserType(detectionFormData);

      if (response.success) {
        setDetectedType(response.detected_type);
        setSelectedType(response.detected_type);
        setShowDetectionForm(false);

        // Show detection result with animation
        setTimeout(() => {
          const element = document.getElementById(
            `type-card-${response.detected_type}`
          );
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 100);
      }
    } catch (error) {
      console.error("Type detection failed:", error);
      alert("Failed to detect user type. Please select manually.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeSelect = async (userType: string) => {
    setSelectedType(userType);

    if (onTypeSelect) {
      onTypeSelect(userType);
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.selectUserType({
        user_type: userType,
        goals: detectionFormData.goals,
        experience_level: "beginner",
        current_activities: detectionFormData.currentActivities,
        interests: detectionFormData.interests,
        description: detectionFormData.description,
      });

      console.log("Full API response:", response);

      // FIXED: Check for the actual success indicators in your response
      if (response.user_profile && response.next_step) {
        // The API is telling us the next step is 'complete_onboarding'
        router.push("/onboarding");
      } else {
        console.error("Unexpected response format:", response);
        setError("Failed to set user type. Please try again.");
      }
    } catch (error) {
      console.error("API call failed:", error);
      setError("Failed to set user type. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const addGoal = (goal: string) => {
    if (goal && !detectionFormData.goals.includes(goal)) {
      setDetectionFormData((prev) => ({
        ...prev,
        goals: [...prev.goals, goal],
      }));
    }
  };

  const removeGoal = (goal: string) => {
    setDetectionFormData((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g !== goal),
    }));
  };

  const commonGoals = [
    "Increase revenue",
    "Grow audience",
    "Generate leads",
    "Build brand",
    "Improve conversions",
    "Create viral content",
    "Track competitors",
    "Automate marketing",
    "Scale business",
    "Find new opportunities",
  ];

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

        {detectedType && (
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg mb-4">
            <span className="text-sm font-medium">
              🎯 We recommend: {userTypes[detectedType]?.title}
            </span>
          </div>
        )}
      </div>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-center">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      {/* Smart Detection Section */}
      {showDetectionOption && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                🧠 Smart Recommendation
              </h2>
              <button
                onClick={() => setShowDetectionForm(!showDetectionForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                {showDetectionForm ? "Hide" : "Get Recommendation"}
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              Not sure which option fits you best? Tell us what you do and we
              will recommend the perfect user type.
            </p>

            <AnimatePresence>
              {showDetectionForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {/* Description Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What do you do? (Describe your current activities)
                    </label>
                    <textarea
                      value={detectionFormData.description}
                      onChange={(e) =>
                        setDetectionFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="e.g., I promote fitness products on social media and earn commissions..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                  </div>

                  {/* Goals Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What are your main goals? (Click to add)
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {commonGoals.map((goal) => (
                        <button
                          key={goal}
                          onClick={() => addGoal(goal)}
                          disabled={detectionFormData.goals.includes(goal)}
                          className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                            detectionFormData.goals.includes(goal)
                              ? "bg-blue-100 text-blue-800 border-blue-300 cursor-not-allowed"
                              : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50 cursor-pointer"
                          }`}
                        >
                          {goal}
                        </button>
                      ))}
                    </div>

                    {/* Selected Goals */}
                    {detectionFormData.goals.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        <span className="text-sm text-gray-600">Selected:</span>
                        {detectionFormData.goals.map((goal) => (
                          <span
                            key={goal}
                            className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {goal}
                            <button
                              onClick={() => removeGoal(goal)}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleTypeDetection}
                    disabled={
                      isLoading || !detectionFormData.description.trim()
                    }
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
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
                        Analyzing...
                      </span>
                    ) : (
                      "🎯 Get My Recommendation"
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
            } ${
              detectedType === key
                ? "ring-4 ring-green-200 ring-opacity-50"
                : ""
            }`}
            onClick={() => handleTypeSelect(key)}
          >
            {/* Recommended Badge */}
            {detectedType === key && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                Recommended
              </div>
            )}

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
            onClick={() => handleTypeSelect(selectedType)}
            disabled={isLoading}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <span className="flex items-center">
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
              `Continue as ${userTypes[selectedType]?.title} →`
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
