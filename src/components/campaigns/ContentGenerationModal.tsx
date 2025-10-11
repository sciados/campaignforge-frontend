"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Mail,
  MessageSquare,
  FileText,
  BarChart3,
  Image,
  Edit3,
  Video,
  Sparkles,
  Loader2,
  BookOpen,
  Grid,
  Layers,
} from "lucide-react";
import { useApi } from "@/lib/api";

interface ContentGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  targetAudience?: string;
  onContentGenerated?: () => void;
}

export default function ContentGenerationModal({
  isOpen,
  onClose,
  campaignId,
  targetAudience,
  onContentGenerated,
}: ContentGenerationModalProps) {
  const api = useApi();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<string>("conversational");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("google");
  const [selectedAdFormat, setSelectedAdFormat] =
    useState<string>("responsive");
  const [variationCount, setVariationCount] = useState<number>(3);
  const [selectedSocialPlatform, setSelectedSocialPlatform] =
    useState<string>("instagram");
  const [postCount, setPostCount] = useState<number>(5);
  const [wordCount, setWordCount] = useState<number>(1500);
  const [longFormWordCount, setLongFormWordCount] = useState<number>(5000);
  const [articleType, setArticleType] = useState<string>("ultimate_guide");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSuccess, setGenerationSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ENHANCED: Platform image generation state
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [platformSpecs, setPlatformSpecs] = useState<Record<string, any>>({});
  const [imageType, setImageType] = useState<string>("marketing");
  const [stylePreferences, setStylePreferences] = useState<Record<string, any>>(
    {}
  );
  const [estimatedCost, setEstimatedCost] = useState<number>(0);

  // FIXED: Move all useCallback hooks to top level
  const loadPlatformSpecs = useCallback(async () => {
    try {
      // Use existing API method - adjust based on your actual API interface
      const response = await fetch(
        "/api/content/enhanced-images/platform-specs",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        setPlatformSpecs(data.platform_specs);
      }
    } catch (error) {
      console.error("Failed to load platform specs:", error);
      setError("Failed to load platform specifications");
    }
  }, []);

  const calculateCost = useCallback(async () => {
    if (selectedPlatforms.length === 0) return;

    try {
      const platformsQuery = selectedPlatforms.join(",");
      const response = await fetch(
        `/api/content/enhanced-images/cost-calculator?platforms=${platformsQuery}&user_tier=professional`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        setEstimatedCost(data.cost_calculation.total_cost);
      }
    } catch (error) {
      console.error("Cost calculation failed:", error);
    }
  }, [selectedPlatforms]);

  // FIXED: Move all useEffect hooks to top level
  useEffect(() => {
    const shouldLoadSpecs =
      selectedType === "platform_image" ||
      selectedType === "multi_platform_image";

    if (shouldLoadSpecs && Object.keys(platformSpecs).length === 0) {
      loadPlatformSpecs();
    }
  }, [selectedType, platformSpecs, loadPlatformSpecs]);

  useEffect(() => {
    const shouldCalculateCost =
      (selectedType === "platform_image" ||
        selectedType === "multi_platform_image") &&
      selectedPlatforms.length > 0;

    if (shouldCalculateCost) {
      calculateCost();
    }
  }, [selectedPlatforms, selectedType, calculateCost]);

  // FIXED: Move early return after all hooks
  if (!isOpen) return null;

  const toneOptions = [
    {
      value: "conversational",
      label: "Conversational",
      description: "Friendly and approachable",
    },
    {
      value: "professional",
      label: "Professional",
      description: "Formal and authoritative",
    },
    {
      value: "persuasive",
      label: "Persuasive",
      description: "Compelling and action-oriented",
    },
    {
      value: "engaging",
      label: "Engaging",
      description: "Exciting and energetic",
    },
    {
      value: "informative",
      label: "Informative",
      description: "Educational and clear",
    },
    {
      value: "empathetic",
      label: "Empathetic",
      description: "Understanding and supportive",
    },
    {
      value: "urgent",
      label: "Urgent",
      description: "Time-sensitive and direct",
    },
    { value: "casual", label: "Casual", description: "Relaxed and informal" },
  ];

  const articleTypeOptions = [
    {
      value: "ultimate_guide",
      label: "Ultimate Guide",
      description: "Comprehensive deep-dive guide",
    },
    {
      value: "pillar_article",
      label: "Pillar Article",
      description: "Core content foundation",
    },
    {
      value: "deep_dive",
      label: "Deep Dive",
      description: "In-depth analysis",
    },
    {
      value: "research_report",
      label: "Research Report",
      description: "Data-driven insights",
    },
  ];

  const adPlatformOptions = [
    {
      value: "google",
      label: "Google Ads",
      description: "Search & Display ads",
      limits: { headline: 30, description: 90 },
    },
    {
      value: "facebook",
      label: "Facebook Ads",
      description: "News Feed & Stories",
      limits: { headline: 40, primary_text: 125 },
    },
    {
      value: "instagram",
      label: "Instagram Ads",
      description: "Feed, Stories & Reels",
      limits: { headline: 40, primary_text: 125 },
    },
    {
      value: "linkedin",
      label: "LinkedIn Ads",
      description: "Sponsored Content",
      limits: { headline: 70, introductory_text: 150 },
    },
  ];

  const adFormatOptions: Record<
    string,
    Array<{ value: string; label: string; description: string }>
  > = {
    google: [
      {
        value: "responsive",
        label: "Responsive Search",
        description: "15 headlines, 4 descriptions",
      },
      {
        value: "search",
        label: "Standard Search",
        description: "3 headlines, 2 descriptions",
      },
      {
        value: "display",
        label: "Display Ad",
        description: "Visual banner ads",
      },
    ],
    facebook: [
      {
        value: "single_image",
        label: "Single Image",
        description: "Classic feed post",
      },
      { value: "carousel", label: "Carousel", description: "Multiple images" },
      { value: "video", label: "Video Ad", description: "Video content" },
    ],
    instagram: [
      { value: "feed", label: "Feed Post", description: "Main feed placement" },
      {
        value: "story",
        label: "Story Ad",
        description: "Full-screen vertical",
      },
      { value: "reel", label: "Reel Ad", description: "Short-form video" },
    ],
    linkedin: [
      {
        value: "single_image",
        label: "Single Image",
        description: "Sponsored content",
      },
      { value: "carousel", label: "Carousel", description: "Multiple images" },
      { value: "video", label: "Video Ad", description: "Video content" },
    ],
  };

  const socialPlatformOptions = [
    {
      value: "instagram",
      label: "Instagram",
      description: "Visual storytelling, 2200 char limit",
      icon: "📸",
    },
    {
      value: "facebook",
      label: "Facebook",
      description: "Community engagement",
      icon: "👥",
    },
    {
      value: "linkedin",
      label: "LinkedIn",
      description: "Professional thought leadership",
      icon: "💼",
    },
    {
      value: "twitter",
      label: "Twitter/X",
      description: "Concise, trending content",
      icon: "🐦",
    },
    {
      value: "tiktok",
      label: "TikTok",
      description: "Trend-aware, entertainment-first",
      icon: "🎵",
    },
  ];

  // ENHANCED: Platform categories for image generation
  const platformCategories = {
    Instagram: {
      color: "bg-pink-100 text-pink-800",
      platforms: ["instagram_feed", "instagram_story", "instagram_reel_cover"],
    },
    Facebook: {
      color: "bg-blue-100 text-blue-800",
      platforms: ["facebook_feed", "facebook_story"],
    },
    LinkedIn: {
      color: "bg-indigo-100 text-indigo-800",
      platforms: ["linkedin_feed", "linkedin_article"],
    },
    "Twitter/X": {
      color: "bg-gray-100 text-gray-800",
      platforms: ["twitter_feed"],
    },
    TikTok: {
      color: "bg-purple-100 text-purple-800",
      platforms: ["tiktok_cover"],
    },
    YouTube: {
      color: "bg-red-100 text-red-800",
      platforms: ["youtube_thumbnail"],
    },
    Pinterest: {
      color: "bg-green-100 text-green-800",
      platforms: ["pinterest_pin"],
    },
    General: {
      color: "bg-gray-100 text-gray-800",
      platforms: ["square", "landscape"],
    },
  };

  const contentTypes = [
    {
      id: "email_sequence",
      icon: Mail,
      label: "Email Sequence",
      description: "7-email sales psychology sequence",
      color: "text-blue-600 bg-blue-50 hover:bg-blue-100",
    },
    {
      id: "social_post",
      icon: MessageSquare,
      label: "Social Posts",
      description: "Engaging social media content",
      color: "text-green-600 bg-green-50 hover:bg-green-100",
    },
    {
      id: "blog_article",
      icon: FileText,
      label: "Blog Article",
      description: "SEO-optimized blog content (500-3000 words)",
      color: "text-purple-600 bg-purple-50 hover:bg-purple-100",
    },
    {
      id: "long_form_article",
      icon: BookOpen,
      label: "Long-Form Article",
      description: "Comprehensive guides (2000-10000 words)",
      color: "text-cyan-600 bg-cyan-50 hover:bg-cyan-100",
    },
    {
      id: "ad_copy",
      icon: BarChart3,
      label: "Ad Copy",
      description: "Conversion-focused advertisements",
      color: "text-orange-600 bg-orange-50 hover:bg-orange-100",
    },
    {
      id: "image",
      icon: Image,
      label: "Marketing Image",
      description: "AI-generated promotional images",
      color: "text-pink-600 bg-pink-50 hover:bg-pink-100",
    },
    {
      id: "platform_image",
      icon: Layers,
      label: "Platform Images",
      description: "AI images optimized for social platforms",
      color: "text-purple-600 bg-purple-50 hover:bg-purple-100",
    },
    {
      id: "multi_platform_image",
      icon: Grid,
      label: "Multi-Platform Batch",
      description: "Generate images for multiple platforms at once",
      color: "text-indigo-600 bg-indigo-50 hover:bg-indigo-100",
    },
    {
      id: "video_script",
      icon: Edit3,
      label: "Video Script",
      description: "Professional video scripts",
      color: "text-indigo-600 bg-indigo-50 hover:bg-indigo-100",
    },
  ];

  const handlePlatformToggle = (platformKey: string) => {
    if (selectedType === "platform_image") {
      // Single selection for platform_image
      setSelectedPlatforms([platformKey]);
    } else {
      // Multi-selection for multi_platform_image
      setSelectedPlatforms((prev) =>
        prev.includes(platformKey)
          ? prev.filter((p) => p !== platformKey)
          : [...prev, platformKey]
      );
    }
  };

  const handleSelectCategory = (categoryPlatforms: string[]) => {
    const allSelected = categoryPlatforms.every((p) =>
      selectedPlatforms.includes(p)
    );

    if (allSelected) {
      // Deselect all in category
      setSelectedPlatforms((prev) =>
        prev.filter((p) => !categoryPlatforms.includes(p))
      );
    } else {
      // Select all in category
      if (selectedType === "platform_image") {
        // For single selection, just select the first one
        setSelectedPlatforms([categoryPlatforms[0]]);
      } else {
        // For multi-selection, add all
        setSelectedPlatforms((prev) => [
          ...prev.filter((p) => !categoryPlatforms.includes(p)),
          ...categoryPlatforms,
        ]);
      }
    }
  };

  const handleGenerate = async () => {
    if (!selectedType) return;

    setIsGenerating(true);
    setGenerationSuccess(false);
    setError(null);

    try {
      // Build preferences based on content type
      const preferences: any = {
        tone: selectedTone,
      };

      // Add content-type-specific preferences
      if (selectedType === "ad_copy") {
        preferences.platform = selectedPlatform;
        preferences.ad_format = selectedAdFormat;
        preferences.variation_count = variationCount;
      } else if (selectedType === "social_post") {
        preferences.platform = selectedSocialPlatform;
        preferences.post_count = postCount;
      } else if (selectedType === "blog_article") {
        preferences.word_count = wordCount;
      } else if (selectedType === "long_form_article") {
        preferences.word_count = longFormWordCount;
        preferences.article_type = articleType;
      } else if (selectedType === "platform_image") {
        // ENHANCED: Platform image preferences
        if (selectedPlatforms.length === 0) {
          setError("Please select a platform for image generation");
          setIsGenerating(false);
          return;
        }
        preferences.platform_format = selectedPlatforms[0];
        preferences.image_type = imageType;
        preferences.style_preferences = stylePreferences;
        preferences.user_tier = "professional"; // TODO: Get from user context
      } else if (selectedType === "multi_platform_image") {
        // ENHANCED: Multi-platform batch preferences
        if (selectedPlatforms.length === 0) {
          setError("Please select at least one platform for batch generation");
          setIsGenerating(false);
          return;
        }
        preferences.platforms = selectedPlatforms;
        preferences.image_type = imageType;
        preferences.batch_style = stylePreferences;
        preferences.user_tier = "professional"; // TODO: Get from user context
      }

      // Match the working generate page - let backend fetch user_id/company_id from campaign
      const requestData = {
        campaign_id: campaignId,
        content_type: selectedType,
        target_audience: targetAudience || "",
        preferences,
      };

      console.log("🚀 Generating content with:", requestData);

      // Call integrated content generation API
      const response = await api.generateContent(requestData);

      console.log("✅ Generation response:", response);

      if (!response.success) {
        throw new Error(response.error || "Generation failed");
      }

      setGenerationSuccess(true);

      // Wait a moment to show success, then close
      setTimeout(() => {
        if (onContentGenerated) {
          onContentGenerated();
        }
        onClose();
        // Reset all state to defaults
        setSelectedType(null);
        setSelectedTone("conversational");
        setSelectedPlatform("google");
        setSelectedAdFormat("responsive");
        setVariationCount(3);
        setSelectedSocialPlatform("instagram");
        setPostCount(5);
        setWordCount(1500);
        setLongFormWordCount(5000);
        setArticleType("ultimate_guide");
        // ENHANCED: Reset platform image state
        setSelectedPlatforms([]);
        setImageType("marketing");
        setStylePreferences({});
        setEstimatedCost(0);
        setGenerationSuccess(false);
        setError(null);
      }, 1500);
    } catch (error) {
      console.error("Generation error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to generate content";
      setError(errorMessage);

      // Show error for a few seconds, then allow retry
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Generate Content
              </h2>
              <p className="text-sm text-gray-600">
                Choose a content type to generate
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* ENHANCED: Cost Estimate for Platform Images */}
          {(selectedType === "platform_image" ||
            selectedType === "multi_platform_image") &&
            selectedPlatforms.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">
                    Estimated cost: <strong>${estimatedCost.toFixed(3)}</strong>{" "}
                    for {selectedPlatforms.length}{" "}
                    {selectedPlatforms.length === 1 ? "image" : "images"}
                  </span>
                  <span className="text-xs text-blue-600">
                    Platform-optimized generation
                  </span>
                </div>
              </div>
            )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contentTypes.map((type) => {
              const IconComponent = type.icon;
              const isSelected = selectedType === type.id;

              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  disabled={isGenerating}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-purple-300"
                  } ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div
                    className={`w-12 h-12 ${type.color} rounded-lg flex items-center justify-center mb-3`}
                  >
                    <IconComponent
                      className={`h-6 w-6 ${type.color.split(" ")[0]}`}
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {type.label}
                  </h3>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </button>
              );
            })}
          </div>

          {/* Tone Selection */}
          {selectedType &&
            !["platform_image", "multi_platform_image"].includes(
              selectedType
            ) && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Choose Tone
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {toneOptions.map((tone) => (
                    <button
                      key={tone.value}
                      onClick={() => setSelectedTone(tone.value)}
                      disabled={isGenerating}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        selectedTone === tone.value
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-purple-300"
                      } ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="font-semibold text-sm text-gray-900">
                        {tone.label}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {tone.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

          {/* Ad Copy Platform Selection */}
          {selectedType === "ad_copy" && (
            <div className="mt-6 space-y-6">
              {/* Platform Selection */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Ad Platform
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {adPlatformOptions.map((platform) => (
                    <button
                      key={platform.value}
                      onClick={() => {
                        setSelectedPlatform(platform.value);
                        // Reset ad format to first option for new platform
                        setSelectedAdFormat(
                          adFormatOptions[platform.value][0].value
                        );
                      }}
                      disabled={isGenerating}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        selectedPlatform === platform.value
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-orange-300"
                      } ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="font-semibold text-sm text-gray-900">
                        {platform.label}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {platform.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ad Format Selection */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Ad Format
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {adFormatOptions[selectedPlatform]?.map((format) => (
                    <button
                      key={format.value}
                      onClick={() => setSelectedAdFormat(format.value)}
                      disabled={isGenerating}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        selectedAdFormat === format.value
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-orange-300"
                      } ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="font-semibold text-sm text-gray-900">
                        {format.label}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {format.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Variation Count */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Number of Variations
                </h3>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={variationCount}
                    onChange={(e) =>
                      setVariationCount(parseInt(e.target.value))
                    }
                    disabled={isGenerating}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                  />
                  <div className="w-12 h-10 flex items-center justify-center bg-orange-100 text-orange-800 rounded-lg font-semibold">
                    {variationCount}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Generate {variationCount} different ad{" "}
                  {variationCount === 1 ? "variation" : "variations"}
                </p>
              </div>
            </div>
          )}

          {/* Social Media Platform Selection */}
          {selectedType === "social_post" && (
            <div className="mt-6 space-y-6">
              {/* Platform Selection */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Social Media Platform
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {socialPlatformOptions.map((platform) => (
                    <button
                      key={platform.value}
                      onClick={() => setSelectedSocialPlatform(platform.value)}
                      disabled={isGenerating}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        selectedSocialPlatform === platform.value
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-green-300"
                      } ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="text-2xl mb-1">{platform.icon}</div>
                      <div className="font-semibold text-sm text-gray-900">
                        {platform.label}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {platform.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Post Count */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Number of Posts
                </h3>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="3"
                    max="10"
                    value={postCount}
                    onChange={(e) => setPostCount(parseInt(e.target.value))}
                    disabled={isGenerating}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                  />
                  <div className="w-12 h-10 flex items-center justify-center bg-green-100 text-green-800 rounded-lg font-semibold">
                    {postCount}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Generate {postCount} unique{" "}
                  {postCount === 1 ? "post" : "posts"} for{" "}
                  {
                    socialPlatformOptions.find(
                      (p) => p.value === selectedSocialPlatform
                    )?.label
                  }
                </p>
              </div>
            </div>
          )}

          {/* Blog Post Options */}
          {selectedType === "blog_article" && (
            <div className="mt-6 space-y-6">
              {/* Word Count */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Target Word Count
                </h3>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="500"
                    max="3000"
                    step="100"
                    value={wordCount}
                    onChange={(e) => setWordCount(parseInt(e.target.value))}
                    disabled={isGenerating}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                  />
                  <div className="w-20 h-10 flex items-center justify-center bg-purple-100 text-purple-800 rounded-lg font-semibold text-sm">
                    {wordCount}
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>500 words (Short)</span>
                  <span>1500 words (Medium)</span>
                  <span>3000 words (Long)</span>
                </div>
              </div>

              {/* Article Features Info */}
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-semibold text-sm text-purple-900 mb-2">
                  Article Features
                </h4>
                <ul className="text-xs text-purple-800 space-y-1">
                  <li>✓ SEO-optimized title & meta description</li>
                  <li>✓ Structured with H2/H3 subheadings</li>
                  <li>✓ Includes introduction, main content, conclusion</li>
                  <li>✓ Bullet points & actionable insights</li>
                  <li>✓ Keyword suggestions & internal link ideas</li>
                </ul>
              </div>
            </div>
          )}

          {/* Long-Form Article Options */}
          {selectedType === "long_form_article" && (
            <div className="mt-6 space-y-6">
              {/* Article Type Selection */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Article Type
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {articleTypeOptions.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setArticleType(type.value)}
                      disabled={isGenerating}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        articleType === type.value
                          ? "border-cyan-500 bg-cyan-50"
                          : "border-gray-200 hover:border-cyan-300"
                      } ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="font-semibold text-sm text-gray-900">
                        {type.label}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {type.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Word Count */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Target Word Count
                </h3>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="2000"
                    max="10000"
                    step="500"
                    value={longFormWordCount}
                    onChange={(e) =>
                      setLongFormWordCount(parseInt(e.target.value))
                    }
                    disabled={isGenerating}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                  />
                  <div className="w-20 h-10 flex items-center justify-center bg-cyan-100 text-cyan-800 rounded-lg font-semibold text-sm">
                    {longFormWordCount}
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>2000 words</span>
                  <span>5000 words</span>
                  <span>10000 words</span>
                </div>
              </div>

              {/* Long-Form Article Features Info */}
              <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
                <h4 className="font-semibold text-sm text-cyan-900 mb-2">
                  Long-Form Article Features
                </h4>
                <ul className="text-xs text-cyan-800 space-y-1">
                  <li>✓ Comprehensive 10-section structure</li>
                  <li>✓ SEO-optimized title, meta description & keywords</li>
                  <li>✓ Executive summary & table of contents</li>
                  <li>✓ 6-10 detailed main sections with H2/H3 headings</li>
                  <li>✓ Scientific backing & authority markers</li>
                  <li>✓ Key takeaways & resources section</li>
                  <li>✓ Internal/external link suggestions</li>
                  <li>✓ LSI keywords for advanced SEO</li>
                </ul>
              </div>
            </div>
          )}

          {/* ENHANCED: Platform Image Selection */}
          {(selectedType === "platform_image" ||
            selectedType === "multi_platform_image") && (
            <div className="mt-6 space-y-6">
              {/* Platform Selection */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  {selectedType === "platform_image"
                    ? "Select Platform"
                    : "Select Platforms"}
                </h3>

                <div className="space-y-4">
                  {Object.entries(platformCategories).map(
                    ([category, config]) => (
                      <div key={category} className="space-y-3">
                        {/* Category Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <h4 className="font-medium text-gray-900">
                              {category}
                            </h4>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
                            >
                              {config.platforms.length}{" "}
                              {config.platforms.length === 1
                                ? "format"
                                : "formats"}
                            </span>
                          </div>
                          {selectedType === "multi_platform_image" && (
                            <button
                              onClick={() =>
                                handleSelectCategory(config.platforms)
                              }
                              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                              disabled={isGenerating}
                            >
                              {config.platforms.every((p) =>
                                selectedPlatforms.includes(p)
                              )
                                ? "Deselect All"
                                : "Select All"}
                            </button>
                          )}
                        </div>

                        {/* Platform Options */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {config.platforms.map((platformKey) => {
                            const spec = platformSpecs[platformKey];
                            if (!spec) return null;

                            const isSelected =
                              selectedType === "platform_image"
                                ? selectedPlatforms[0] === platformKey
                                : selectedPlatforms.includes(platformKey);

                            return (
                              <button
                                key={platformKey}
                                onClick={() =>
                                  handlePlatformToggle(platformKey)
                                }
                                disabled={isGenerating}
                                className={`p-4 rounded-lg border-2 text-left transition-all ${
                                  isSelected
                                    ? "border-purple-500 bg-purple-50"
                                    : "border-gray-200 hover:border-gray-300"
                                } ${
                                  isGenerating
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-medium text-gray-900">
                                    {spec.platform}
                                  </h5>
                                  {isSelected && (
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                  )}
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm text-gray-600">
                                    {spec.dimensions}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {spec.aspect_ratio} • {spec.use_case}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Image Type Selection */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Image Type
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    "marketing",
                    "product",
                    "lifestyle",
                    "hero",
                    "comparison",
                    "infographic",
                  ].map((type) => (
                    <button
                      key={type}
                      onClick={() => setImageType(type)}
                      disabled={isGenerating}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        imageType === type
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-purple-300"
                      } ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="font-medium text-sm text-gray-900 capitalize">
                        {type}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Style Preferences */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Style Preferences (Optional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Style
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., minimalist, bold colors, modern"
                      value={stylePreferences.style || ""}
                      onChange={(e) =>
                        setStylePreferences((prev) => ({
                          ...prev,
                          style: e.target.value,
                        }))
                      }
                      disabled={isGenerating}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color Palette
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., blue and white, earth tones"
                      value={stylePreferences.color_palette || ""}
                      onChange={(e) =>
                        setStylePreferences((prev) => ({
                          ...prev,
                          color_palette: e.target.value,
                        }))
                      }
                      disabled={isGenerating}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              {/* Platform Image Features Info */}
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-semibold text-sm text-purple-900 mb-2">
                  Platform Image Features
                </h4>
                <ul className="text-xs text-purple-800 space-y-1">
                  <li>✓ Platform-specific dimensions and aspect ratios</li>
                  <li>✓ Optimized for each platforms algorithm</li>
                  <li>✓ High-resolution, professional quality</li>
                  <li>✓ Brand-consistent styling</li>
                  <li>✓ Mobile-optimized composition</li>
                  <li>✓ Cost-effective AI provider selection</li>
                  {selectedType === "multi_platform_image" && (
                    <li>✓ Batch generation with consistent styling</li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className="mt-6 flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={
                !selectedType ||
                isGenerating ||
                ((selectedType === "platform_image" ||
                  selectedType === "multi_platform_image") &&
                  selectedPlatforms.length === 0)
              }
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : generationSuccess ? (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Success!</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Content</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
