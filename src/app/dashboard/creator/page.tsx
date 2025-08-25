// Create this file: /src/app/dashboard/creator/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  user_type: string;
  user_tier: string;
  onboarding_status: string;
}

export default function CreatorDashboardPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          router.push("/login");
          return;
        }

        const API_BASE_URL =
          process.env.NEXT_PUBLIC_API_URL ||
          "https://campaign-backend-production-e2db.up.railway.app";

        const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setUserProfile(data);

          // Redirect user if not a content creator
          if (data.user_type !== "content_creator") {
            if (data.user_type === "business_owner") {
              router.push("/dashboard/business");
            } else if (data.user_type === "affiliate_marketer") {
              router.push("/dashboard/affiliate");
            } else if (!data.user_type) {
              router.push("/user-selection");
            }
          }
        } else {
          throw new Error("Failed to load profile");
        }
      } catch (error) {
        console.error("Profile load error:", error);
        setError("Failed to load dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your creator dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Unable to load dashboard
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                🎬 Creator Studio Pro
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {userProfile?.full_name}! Ready to create viral
                content?
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                {userProfile?.user_tier} Plan
              </span>
              <Link
                href="/campaigns/create"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                🔥 Create Campaign
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-8 mb-8">
          <h2 className="text-3xl font-bold mb-4">
            🚀 Welcome to Creator Studio Pro!
          </h2>
          <p className="text-lg opacity-90 mb-6">
            Your AI-powered content creation hub is ready. Create viral
            campaigns, analyze trends, and grow your audience.
          </p>
          <div className="flex space-x-4">
            <Link
              href="/campaigns/create?type=viral_analysis"
              className="px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              🔥 Analyze Viral Content
            </Link>
            <Link
              href="/campaigns/create?type=content_ideas"
              className="px-6 py-3 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors font-semibold"
            >
              💡 Generate Ideas
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-gray-600">Campaigns Created</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-gray-600">Content Analyzed</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-gray-600">Viral Opportunities</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-orange-600">0</div>
            <div className="text-gray-600">Ideas Generated</div>
          </div>
        </div>

        {/* Creator Tools */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Creator Tools
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Link
              href="/campaigns/create?input_type=viral_content"
              className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                🔥
              </div>
              <div className="text-sm font-medium text-gray-900">
                Viral Analysis
              </div>
            </Link>
            <Link
              href="/campaigns/create?input_type=trend_research"
              className="flex flex-col items-center p-4 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                📈
              </div>
              <div className="text-sm font-medium text-gray-900">
                Trend Intel
              </div>
            </Link>
            <Link
              href="/campaigns/create?input_type=social_media"
              className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                📱
              </div>
              <div className="text-sm font-medium text-gray-900">
                Multi-Platform
              </div>
            </Link>
            <Link
              href="/campaigns/create?input_type=content_ideas"
              className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                💡
              </div>
              <div className="text-sm font-medium text-gray-900">
                Idea Generator
              </div>
            </Link>
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🚀 Getting Started
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <h4 className="font-medium text-gray-900">
                  Create Your First Campaign
                </h4>
                <p className="text-gray-600 text-sm">
                  Start by analyzing viral content or generating fresh ideas for
                  your next post.
                </p>
                <Link
                  href="/campaigns/create"
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  Create Campaign →
                </Link>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <h4 className="font-medium text-gray-900">
                  Explore Content Intelligence
                </h4>
                <p className="text-gray-600 text-sm">
                  Discover trending topics and viral opportunities in your
                  niche.
                </p>
                <Link
                  href="/intelligence"
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  Explore Intelligence →
                </Link>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Track Your Growth</h4>
                <p className="text-gray-600 text-sm">
                  Monitor your content performance and audience growth across
                  platforms.
                </p>
                <span className="text-gray-400 text-sm">Coming soon</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
