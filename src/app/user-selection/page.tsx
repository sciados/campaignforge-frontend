// src/app/user-selection/page.tsx
/**
 * User Type Selection Page - Simplified version
 * 🎭 Where users choose their user type during onboarding
 */

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function UserSelectionPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const userTypes = {
    affiliate_marketer: {
      emoji: "💰",
      title: "Affiliate Marketer",
      description: "Promote products and earn commissions",
    },
    content_creator: {
      emoji: "🎬", 
      title: "Content Creator",
      description: "Create viral content and grow your audience",
    },
    business_owner: {
      emoji: "🏢",
      title: "Business Owner", 
      description: "Generate leads and grow your business",
    },
  };

  const handleSubmit = () => {
    if (!selectedType) {
      alert("Please select a user type");
      return;
    }

    setIsLoading(true);
    
    // Store selected user type in localStorage temporarily
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedUserType", selectedType);
    }

    // Navigate to registration with user type
    router.push(`/register?userType=${selectedType}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Choose Your CampaignForge Experience
          </h1>
          <p className="text-lg text-gray-600">
            Select the option that best describes you
          </p>
        </div>

        {/* User Type Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {Object.entries(userTypes).map(([key, type]) => (
            <div
              key={key}
              className={`bg-white rounded-xl border-2 p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedType === key
                  ? "border-blue-500 bg-blue-50 shadow-lg"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setSelectedType(key)}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">{type.emoji}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {type.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{type.description}</p>
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
            </div>
          ))}
        </div>

        {/* Continue Button */}
        {selectedType && (
          <div className="text-center">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                "Setting up your experience..."
              ) : (
                `Continue as ${userTypes[selectedType as keyof typeof userTypes]?.title} →`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}