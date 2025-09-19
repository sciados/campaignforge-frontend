// src/app/dashboard/business/market-intel/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  DollarSign,
  Globe,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowUpRight,
  Zap
} from "lucide-react";

interface MarketData {
  id: string;
  category: string;
  trend_direction: "up" | "down" | "stable";
  growth_percentage: number;
  market_size: number;
  opportunity_score: number;
  competition_level: "low" | "medium" | "high";
  key_insights: string[];
  top_keywords: string[];
  emerging_technologies: string[];
  updated_at: string;
}

interface CompetitorAnalysis {
  id: string;
  competitor_name: string;
  market_share: number;
  strengths: string[];
  weaknesses: string[];
  recent_activities: string[];
  threat_level: "low" | "medium" | "high";
}

const mockMarketData: MarketData[] = [
  {
    id: "market_001",
    category: "AI & Machine Learning",
    trend_direction: "up",
    growth_percentage: 42.5,
    market_size: 125000000,
    opportunity_score: 95,
    competition_level: "high",
    key_insights: [
      "Rapid adoption in enterprise sector",
      "Emerging focus on ethical AI practices",
      "Integration with existing business tools trending"
    ],
    top_keywords: ["artificial intelligence", "machine learning", "automation", "predictive analytics"],
    emerging_technologies: ["GPT-4", "Computer Vision", "Natural Language Processing"],
    updated_at: "2024-01-21T10:30:00Z"
  },
  {
    id: "market_002",
    category: "E-commerce Platforms",
    trend_direction: "up",
    growth_percentage: 18.3,
    market_size: 89000000,
    opportunity_score: 78,
    competition_level: "medium",
    key_insights: [
      "Mobile commerce driving growth",
      "Social commerce integration increasing",
      "Sustainability becoming key differentiator"
    ],
    top_keywords: ["e-commerce", "online shopping", "mobile commerce", "social selling"],
    emerging_technologies: ["AR Shopping", "Voice Commerce", "Blockchain Payments"],
    updated_at: "2024-01-21T09:15:00Z"
  },
  {
    id: "market_003",
    category: "Remote Work Tools",
    trend_direction: "stable",
    growth_percentage: 8.7,
    market_size: 45000000,
    opportunity_score: 65,
    competition_level: "high",
    key_insights: [
      "Market stabilizing post-pandemic",
      "Focus shifting to hybrid solutions",
      "Security features becoming critical"
    ],
    top_keywords: ["remote work", "collaboration", "video conferencing", "project management"],
    emerging_technologies: ["VR Meetings", "AI Assistants", "Advanced Security"],
    updated_at: "2024-01-21T08:45:00Z"
  }
];

const mockCompetitors: CompetitorAnalysis[] = [
  {
    id: "comp_001",
    competitor_name: "TechGiant Corp",
    market_share: 35.2,
    strengths: ["Brand recognition", "Large user base", "Extensive resources"],
    weaknesses: ["Slow innovation", "High pricing", "Complex onboarding"],
    recent_activities: ["Launched new AI features", "Acquired startup XYZ", "Expanded to 5 new markets"],
    threat_level: "high"
  },
  {
    id: "comp_002",
    competitor_name: "InnovateSoft",
    market_share: 22.8,
    strengths: ["Cutting-edge technology", "Agile development", "Competitive pricing"],
    weaknesses: ["Limited market presence", "Small support team", "Recent funding issues"],
    recent_activities: ["Released mobile app", "Partnership with CloudCo", "Raised Series B funding"],
    threat_level: "medium"
  }
];

const MarketIntelligencePage: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData[]>(mockMarketData);
  const [competitors, setCompetitors] = useState<CompetitorAnalysis[]>(mockCompetitors);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case "up":
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case "down":
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      default:
        return <BarChart3 className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case "up":
        return "text-green-600 bg-green-100";
      case "down":
        return "text-red-600 bg-red-100";
      default:
        return "text-yellow-600 bg-yellow-100";
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

  const getThreatColor = (level: string) => {
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

  const filteredMarketData = marketData.filter(data =>
    selectedCategory === "all" || data.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Market Intelligence</h1>
            </div>
            <p className="text-gray-600">Monitor market trends, competitor activities, and growth opportunities</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={refreshData}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Market Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Market Size</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${marketData.reduce((sum, data) => sum + data.market_size, 0).toLocaleString()}M
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Growth Opportunities</p>
                <p className="text-2xl font-bold text-gray-900">
                  {marketData.filter(data => data.opportunity_score >= 80).length}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Competitors Tracked</p>
                <p className="text-2xl font-bold text-gray-900">{competitors.length}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Market Categories</p>
                <p className="text-2xl font-bold text-gray-900">{marketData.length}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Globe className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All Categories
            </button>
            {marketData.map((data) => (
              <button
                key={data.id}
                onClick={() => setSelectedCategory(data.category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === data.category
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {data.category}
              </button>
            ))}
          </div>
        </div>

        {/* Market Data Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {filteredMarketData.map((data, index) => (
            <motion.div
              key={data.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{data.category}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(data.trend_direction)}`}>
                      {getTrendIcon(data.trend_direction)}
                      {data.growth_percentage > 0 ? '+' : ''}{data.growth_percentage}%
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCompetitionColor(data.competition_level)}`}>
                      {data.competition_level} competition
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{data.opportunity_score}</p>
                  <p className="text-xs text-gray-500">Opportunity Score</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Market Size</p>
                  <p className="text-lg font-semibold text-green-600">${data.market_size.toLocaleString()}M</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Key Insights</p>
                  <ul className="space-y-1">
                    {data.key_insights.map((insight, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Top Keywords</p>
                  <div className="flex flex-wrap gap-1">
                    {data.top_keywords.map((keyword, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Emerging Technologies</p>
                  <div className="flex flex-wrap gap-1">
                    {data.emerging_technologies.map((tech, idx) => (
                      <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Updated: {new Date(data.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Competitor Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Competitor Analysis</h2>

          <div className="space-y-6">
            {competitors.map((competitor, index) => (
              <div key={competitor.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{competitor.competitor_name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-gray-600">Market Share: {competitor.market_share}%</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getThreatColor(competitor.threat_level)}`}>
                        {competitor.threat_level} threat
                      </span>
                    </div>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <ArrowUpRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Strengths</p>
                    <ul className="space-y-1">
                      {competitor.strengths.map((strength, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Weaknesses</p>
                    <ul className="space-y-1">
                      {competitor.weaknesses.map((weakness, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                          <AlertTriangle className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Recent Activities</p>
                    <ul className="space-y-1">
                      {competitor.recent_activities.map((activity, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                          <Info className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>{activity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MarketIntelligencePage;