// src/app/dashboard/creator/viral/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Flame,
  TrendingUp,
  Eye,
  Heart,
  Share2,
  Clock,
  Target,
  Zap,
  Calendar,
  ArrowUpRight
} from "lucide-react";

interface ViralOpportunity {
  id: string;
  trend_topic: string;
  platform: string;
  virality_score: number;
  engagement_potential: "high" | "medium" | "low";
  time_sensitive: boolean;
  expires_at?: string;
  suggested_content_types: string[];
  hashtags: string[];
  estimated_reach: number;
  competition_level: "low" | "medium" | "high";
}

const mockOpportunities: ViralOpportunity[] = [
  {
    id: "viral_001",
    trend_topic: "AI Productivity Hacks",
    platform: "TikTok",
    virality_score: 95,
    engagement_potential: "high",
    time_sensitive: true,
    expires_at: "2024-01-25T23:59:59Z",
    suggested_content_types: ["Tutorial", "Quick Tips", "Before/After"],
    hashtags: ["#AIHacks", "#ProductivityTips", "#TechTrends", "#LifeHack"],
    estimated_reach: 250000,
    competition_level: "medium"
  },
  {
    id: "viral_002",
    trend_topic: "Minimalist Morning Routine",
    platform: "Instagram",
    virality_score: 87,
    engagement_potential: "high",
    time_sensitive: false,
    suggested_content_types: ["Reel", "Carousel", "Story Series"],
    hashtags: ["#MorningRoutine", "#Minimalism", "#SelfCare", "#Productivity"],
    estimated_reach: 180000,
    competition_level: "high"
  },
  {
    id: "viral_003",
    trend_topic: "Budget-Friendly Home Workouts",
    platform: "YouTube",
    virality_score: 82,
    engagement_potential: "medium",
    time_sensitive: false,
    suggested_content_types: ["Tutorial", "Challenge", "Equipment Review"],
    hashtags: ["#HomeWorkout", "#BudgetFitness", "#NoGymNeeded", "#FitnessMotivation"],
    estimated_reach: 120000,
    competition_level: "low"
  }
];

const ViralOpportunitiesPage: React.FC = () => {
  const [opportunities, setOpportunities] = useState<ViralOpportunity[]>(mockOpportunities);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "tiktok":
        return "bg-black text-white";
      case "instagram":
        return "bg-gradient-to-r from-purple-500 to-pink-500 text-white";
      case "youtube":
        return "bg-red-600 text-white";
      case "twitter":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  const getEngagementColor = (potential: string) => {
    switch (potential) {
      case "high":
        return "text-green-600 bg-green-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getCompetitionColor = (level: string) => {
    switch (level) {
      case "low":
        return "text-green-600 bg-green-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "high":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const filteredOpportunities = opportunities.filter(opp =>
    selectedPlatform === "all" || opp.platform.toLowerCase() === selectedPlatform.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Flame className="w-6 h-6 text-orange-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Viral Opportunities</h1>
          </div>
          <p className="text-gray-600">Discover trending topics and viral content opportunities across platforms</p>
        </div>

        {/* Platform Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedPlatform("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedPlatform === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All Platforms
            </button>
            {["TikTok", "Instagram", "YouTube", "Twitter"].map((platform) => (
              <button
                key={platform}
                onClick={() => setSelectedPlatform(platform)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedPlatform === platform
                    ? getPlatformColor(platform)
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>

        {/* Opportunities Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOpportunities.map((opportunity, index) => (
            <motion.div
              key={opportunity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getPlatformColor(opportunity.platform)}`}>
                    {opportunity.platform}
                  </span>
                  {opportunity.time_sensitive && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-600 rounded text-xs font-medium">
                      <Clock className="w-3 h-3" />
                      Urgent
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-bold text-orange-600">{opportunity.virality_score}</span>
                </div>
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{opportunity.trend_topic}</h3>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Est. Reach</p>
                    <p className="text-sm font-medium">{opportunity.estimated_reach.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Engagement</p>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getEngagementColor(opportunity.engagement_potential)}`}>
                      {opportunity.engagement_potential}
                    </span>
                  </div>
                </div>
              </div>

              {/* Competition Level */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Competition</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCompetitionColor(opportunity.competition_level)}`}>
                    {opportunity.competition_level}
                  </span>
                </div>
              </div>

              {/* Suggested Content Types */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Suggested Content</p>
                <div className="flex flex-wrap gap-1">
                  {opportunity.suggested_content_types.map((type, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              {/* Hashtags */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Trending Hashtags</p>
                <div className="flex flex-wrap gap-1">
                  {opportunity.hashtags.slice(0, 3).map((hashtag, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {hashtag}
                    </span>
                  ))}
                  {opportunity.hashtags.length > 3 && (
                    <span className="text-xs text-gray-500">+{opportunity.hashtags.length - 3} more</span>
                  )}
                </div>
              </div>

              {/* Expiration */}
              {opportunity.expires_at && (
                <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded">
                  <div className="flex items-center gap-2 text-red-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs">
                      Expires: {new Date(opportunity.expires_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Zap className="w-4 h-4" />
                Create Content
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredOpportunities.length === 0 && (
          <div className="text-center py-12">
            <Flame className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No viral opportunities found</h3>
            <p className="text-gray-600">Try selecting a different platform or check back later for new trends.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViralOpportunitiesPage;