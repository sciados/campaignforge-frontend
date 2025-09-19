// src/components/onboarding/OnboardingFlow.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  ctaText: string;
  ctaAction?: () => void;
  skipAllowed?: boolean;
}

interface OnboardingFlowProps {
  userType: string;
  onComplete: () => void;
  onSkip?: () => void;
}

export default function OnboardingFlow({
  userType,
  onComplete,
  onSkip,
}: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const router = useRouter();

  const getOnboardingSteps = (userType: string): OnboardingStep[] => {
    switch (userType) {
      case "PRODUCT_CREATOR":
      case "product_creator":
        return [
          {
            id: "welcome",
            title: "🎯 Welcome, Product Creator!",
            description:
              "You have been invited to supercharge your product promotion with AI-powered marketing intelligence.",
            content: (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">🎯</span>
                </div>
                <p className="text-lg text-gray-700">
                  Submit your sales page URL and unlock a world of marketing
                  opportunities. Our AI creates comprehensive marketing assets
                  that help affiliates promote your product more effectively.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl mb-2">🔍</div>
                    <h4 className="font-semibold text-blue-800">
                      Deep Analysis
                    </h4>
                    <p className="text-sm text-blue-700">
                      AI analyzes your sales page for marketing insights
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl mb-2">📚</div>
                    <h4 className="font-semibold text-purple-800">
                      Content Library
                    </h4>
                    <p className="text-sm text-purple-700">
                      Ready-made content for affiliates to use
                    </p>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✨ You have <strong>5,000 analysis credits</strong> to get
                    started!
                  </p>
                </div>
              </div>
            ),
            ctaText: "Lets Get Started",
            skipAllowed: true,
          },
          {
            id: "dashboard_tour",
            title: "🖥️ Your Product Creator Dashboard",
            description:
              "Discover how your sales page analysis creates marketing assets that drive affiliate success.",
            content: (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                    <h4 className="font-semibold text-blue-600">
                      📝 Sales Page Submission
                    </h4>
                    <p className="text-sm text-gray-600">
                      Submit your product sales page URL for comprehensive AI
                      analysis
                    </p>
                  </div>
                  <div className="p-4 border-2 border-green-200 rounded-lg bg-green-50">
                    <h4 className="font-semibold text-green-600">
                      📊 Marketing Intelligence
                    </h4>
                    <p className="text-sm text-gray-600">
                      Get detailed insights, angles, and positioning strategies
                    </p>
                  </div>
                  <div className="p-4 border-2 border-purple-200 rounded-lg bg-purple-50">
                    <h4 className="font-semibold text-purple-600">
                      📚 Content Library Creation
                    </h4>
                    <p className="text-sm text-gray-600">
                      <strong>Automatically generates</strong> promotional
                      content for affiliates
                    </p>
                  </div>
                  <div className="p-4 border-2 border-orange-200 rounded-lg bg-orange-50">
                    <h4 className="font-semibold text-orange-600">
                      🚀 Affiliate Distribution
                    </h4>
                    <p className="text-sm text-gray-600">
                      Ready-made campaigns that affiliates can use immediately
                    </p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-lg border-2 border-purple-200">
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">💎</div>
                    <div>
                      <h4 className="font-bold text-purple-800">
                        The Content Library Advantage
                      </h4>
                      <p className="text-sm text-purple-700 mt-2">
                        When you submit your sales page, our AI does more than
                        just analyze it—it creates a complete promotional
                        toolkit. Affiliates get ready-made email sequences,
                        social media posts, ad copy, and marketing angles.{" "}
                        <strong>More affiliates = more sales for you!</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ),
            ctaText: "Show Me the Content Library",
            skipAllowed: true,
          },
          {
            id: "first_action",
            title: "🚀 Launch Your Affiliate Army!",
            description:
              "Submit your sales page URL and watch the Content Library create promotional assets that affiliates love.",
            content: (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">🚀</span>
                </div>
                <p className="text-lg text-gray-700">
                  You are about to unlock the power of automated affiliate
                  marketing. Submit your sales page and watch our AI create
                  everything affiliates need to promote your product
                  successfully.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      📋 <strong>What happens next:</strong>
                    </p>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1 text-left">
                      <li>• Paste your sales page URL</li>
                      <li>• AI analyzes your product</li>
                      <li>• Content Library generates assets</li>
                      <li>• Affiliates get ready-made campaigns</li>
                    </ul>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-800">
                      💎 <strong>You will get:</strong>
                    </p>
                    <ul className="text-sm text-purple-700 mt-2 space-y-1 text-left">
                      <li>• Email sequences for affiliates</li>
                      <li>• Social media post templates</li>
                      <li>• Ad copy variations</li>
                      <li>• Marketing angle suggestions</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-lg border-2 border-green-200">
                  <p className="text-green-800 font-semibold">
                    🎯 <strong>Result:</strong> More affiliates promoting your
                    product = More sales for you!
                  </p>
                </div>
              </div>
            ),
            ctaText: "Create My Content Library",
            ctaAction: () => router.push("/dashboard/product-creator"),
            skipAllowed: false,
          },
        ];

      case "AFFILIATE_MARKETER":
      case "affiliate_marketer":
        return [
          {
            id: "welcome",
            title: "💰 Welcome, Affiliate Marketer!",
            description: "Turn any product into a winning affiliate campaign.",
            content: (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">💰</span>
                </div>
                <p className="text-lg text-gray-700">
                  Discover high-converting products, create compelling
                  campaigns, and maximize your affiliate earnings.
                </p>
              </div>
            ),
            ctaText: "Lets Build Campaigns",
            skipAllowed: true,
          },
          // Add more affiliate-specific steps...
        ];

      case "BUSINESS_OWNER":
      case "business_owner":
        return [
          {
            id: "welcome",
            title: "🏢 Welcome, Business Owner!",
            description:
              "Scale your business with AI-powered marketing intelligence.",
            content: (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">🏢</span>
                </div>
                <p className="text-lg text-gray-700">
                  Get market insights, optimize your products, and create
                  data-driven marketing strategies.
                </p>
              </div>
            ),
            ctaText: "Explore Business Tools",
            skipAllowed: true,
          },
          // Add more business-specific steps...
        ];

      default:
        return [
          {
            id: "welcome",
            title: "👋 Welcome to CampaignForge!",
            description:
              "Lets get you started with the right tools for your needs.",
            content: (
              <div className="text-center space-y-4">
                <p className="text-lg text-gray-700">
                  We will help you navigate to the right dashboard for your user
                  type.
                </p>
              </div>
            ),
            ctaText: "Continue",
            skipAllowed: true,
          },
        ];
    }
  };

  const steps = getOnboardingSteps(userType);
  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStepData.ctaAction) {
      currentStepData.ctaAction();
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await onComplete();
    } finally {
      setIsCompleting(false);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      handleComplete();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">
                  Step {currentStep + 1} of {steps.length}
                </span>
                {currentStepData.skipAllowed && (
                  <button
                    onClick={handleSkip}
                    className="text-sm text-gray-400 hover:text-gray-600"
                  >
                    Skip All
                  </button>
                )}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentStep + 1) / steps.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Step Content */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {currentStepData.title}
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                {currentStepData.description}
              </p>
              {currentStepData.content}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>

              <button
                onClick={handleNext}
                disabled={isCompleting}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 font-semibold disabled:opacity-50"
              >
                {isCompleting ? "Completing..." : currentStepData.ctaText}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
