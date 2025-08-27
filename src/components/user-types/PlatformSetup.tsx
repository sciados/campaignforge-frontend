// src/components/user-types/PlatformSetup.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useApi } from "@/lib/api";
import { UserType } from "@/lib/user-type-utils";

interface Platform {
  id: string;
  name: string;
  icon: string;
  description: string;
  placeholder: string;
}

interface SocialProfile {
  platform: string;
  username: string;
  followers: number;
  engagement_rate: number;
}

const PLATFORM_INFO: Record<string, Platform> = {
  instagram: {
    id: "instagram",
    name: "Instagram",
    icon: "📷",
    description: "Photo and video content",
    placeholder: "@username",
  },
  tiktok: {
    id: "tiktok",
    name: "TikTok",
    icon: "🎵",
    description: "Short-form video content",
    placeholder: "@username",
  },
  youtube: {
    id: "youtube",
    name: "YouTube",
    icon: "🎥",
    description: "Long-form video content",
    placeholder: "channel-name",
  },
  linkedin: {
    id: "linkedin",
    name: "LinkedIn",
    icon: "💼",
    description: "Professional networking",
    placeholder: "profile-name",
  },
  twitter: {
    id: "twitter",
    name: "Twitter/X",
    icon: "🐦",
    description: "Social networking and news",
    placeholder: "@username",
  },
  pinterest: {
    id: "pinterest",
    name: "Pinterest",
    icon: "📌",
    description: "Visual discovery",
    placeholder: "username",
  },
  facebook: {
    id: "facebook",
    name: "Facebook",
    icon: "👥",
    description: "Social networking",
    placeholder: "page-name",
  },
};

interface PlatformSetupProps {
  userType: UserType;
  onComplete: (profiles: SocialProfile[]) => void;
  onSkip: () => void;
}

const PlatformSetup: React.FC<PlatformSetupProps> = ({
  userType,
  onComplete,
  onSkip,
}) => {
  const api = useApi();
  const [recommendedPlatforms, setRecommendedPlatforms] = useState<string[]>(
    []
  );
  const [profiles, setProfiles] = useState<Record<string, SocialProfile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadRecommendedPlatforms = useCallback(async () => {
    try {
      const response = await api.getRecommendedPlatforms();
      setRecommendedPlatforms(response.recommended_platforms);
    } catch (error) {
      console.error("Failed to load recommended platforms:", error);
      // Fallback to static recommendations
      const fallback = {
        affiliate_marketer: ["youtube", "instagram", "tiktok", "pinterest"],
        content_creator: ["instagram", "tiktok", "youtube", "twitter"],
        business_owner: ["linkedin", "facebook", "instagram", "youtube"],
      };
      setRecommendedPlatforms(fallback[userType] || []);
    } finally {
      setIsLoading(false);
    }
  }, [api, userType]); // Add dependencies here

  useEffect(() => {
    loadRecommendedPlatforms();
  }, [loadRecommendedPlatforms]); // Use the function in dependency array

  const updateProfile = (
    platform: string,
    field: keyof SocialProfile,
    value: string | number
  ) => {
    setProfiles((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        platform,
        [field]: value,
        // Initialize other fields if this is the first update
        username: prev[platform]?.username || "",
        followers: prev[platform]?.followers || 0,
        engagement_rate: prev[platform]?.engagement_rate || 0,
      },
    }));
  };

  const handleSaveProfiles = async () => {
    setIsSaving(true);
    try {
      const profilesArray = Object.values(profiles).filter((p) =>
        p.username.trim()
      );

      // Save each profile
      for (const profile of profilesArray) {
        await api.addSocialProfile(
          profile.platform,
          profile.username,
          profile.followers,
          profile.engagement_rate
        );
      }

      onComplete(profilesArray);
    } catch (error) {
      console.error("Failed to save profiles:", error);
      alert("Failed to save social media profiles. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getUserTypeTitle = () => {
    const titles = {
      affiliate_marketer: "Connect Your Marketing Platforms",
      content_creator: "Connect Your Content Platforms",
      business_owner: "Connect Your Business Platforms",
    };
    return titles[userType] || "Connect Your Social Media";
  };

  const getUserTypeDescription = () => {
    const descriptions = {
      affiliate_marketer:
        "Add your platforms where you promote products and drive traffic for better commission tracking.",
      content_creator:
        "Connect your content platforms to analyze performance and discover viral opportunities.",
      business_owner:
        "Link your business presence platforms to track leads and customer engagement.",
    };
    return (
      descriptions[userType] || "Connect your platforms for better insights."
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {getUserTypeTitle()}
        </h2>
        <p className="text-gray-600">{getUserTypeDescription()}</p>
        <p className="text-sm text-gray-500 mt-2">
          You can skip this step and add platforms later in your profile
          settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {recommendedPlatforms.map((platformId) => {
          const platform = PLATFORM_INFO[platformId];
          if (!platform) return null;

          const profile = profiles[platformId] || {
            platform: platformId,
            username: "",
            followers: 0,
            engagement_rate: 0,
          };

          return (
            <div key={platformId} className="bg-white border rounded-lg p-6">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">{platform.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {platform.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {platform.description}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username/Handle
                  </label>
                  <input
                    type="text"
                    placeholder={platform.placeholder}
                    value={profile.username}
                    onChange={(e) =>
                      updateProfile(platformId, "username", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Followers
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={profile.followers || ""}
                      onChange={(e) =>
                        updateProfile(
                          platformId,
                          "followers",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Engagement %
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      value={profile.engagement_rate || ""}
                      onChange={(e) =>
                        updateProfile(
                          platformId,
                          "engagement_rate",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={onSkip}
          disabled={isSaving}
          className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Skip for Now
        </button>

        <button
          onClick={handleSaveProfiles}
          disabled={isSaving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Platforms"}
        </button>
      </div>
    </div>
  );
};

export default PlatformSetup;
