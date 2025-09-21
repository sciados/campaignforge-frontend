// src/components/campaigns/CampaignAccordion.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronRight,
  Target,
  Calendar,
  FolderOpen,
  Settings,
  Copy,
  Trash2,
  Play,
  Clock,
  CheckCircle,
  Pause,
  BarChart3,
  Eye,
  Users,
  TrendingUp,
  ActivityIcon,
  Package,
  Building2,
  Zap,
} from "lucide-react";
import type { Campaign } from "@/lib/types/campaign";

interface CampaignAccordionProps {
  campaigns: Campaign[];
  onCampaignView: (campaign: Campaign) => void;
  onCampaignEdit: (campaign: Campaign) => void;
  onCampaignDuplicate: (campaign: Campaign) => void;
  onCampaignDelete: (campaign: Campaign) => void;
}

interface CampaignCategory {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  campaigns: Campaign[];
  description: string;
  color: string;
}

export default function CampaignAccordion({
  campaigns,
  onCampaignView,
  onCampaignEdit,
  onCampaignDuplicate,
  onCampaignDelete,
}: CampaignAccordionProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["active", "draft"]) // Default expanded
  );

  // Categorize campaigns
  const categories: CampaignCategory[] = useMemo(() => {
    const categorized = [
      {
        id: "active",
        title: "Active Campaigns",
        icon: Play,
        campaigns: campaigns.filter((c) => c.status === "active"),
        description: "Currently running campaigns",
        color: "green",
      },
      {
        id: "draft",
        title: "Draft Campaigns",
        icon: Clock,
        campaigns: campaigns.filter((c) => c.status === "draft"),
        description: "Campaigns being prepared",
        color: "yellow",
      },
      {
        id: "completed",
        title: "Completed Campaigns",
        icon: CheckCircle,
        campaigns: campaigns.filter((c) => c.status === "completed"),
        description: "Successfully finished campaigns",
        color: "blue",
      },
      {
        id: "paused",
        title: "Paused Campaigns",
        icon: Pause,
        campaigns: campaigns.filter((c) => c.status === "paused"),
        description: "Temporarily stopped campaigns",
        color: "gray",
      },
      {
        id: "demo",
        title: "Demo Campaigns",
        icon: Target,
        campaigns: campaigns.filter((c) => c.settings?.is_demo || c.is_demo),
        description: "Example and demo campaigns",
        color: "purple",
      },
    ];

    return categorized.filter((category) => category.campaigns.length > 0);
  }, [campaigns]);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderCampaignRow = (campaign: Campaign) => {
    const contentCount = campaign.generated_content_count || 0;
    const hasContent = contentCount > 0;
    const isDemo = campaign.settings?.is_demo || campaign.is_demo;

    return (
      <div
        key={campaign.id}
        className="border-b border-gray-100 last:border-b-0 p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="font-medium text-gray-900 truncate">
                {campaign.title}
              </h4>
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  campaign.status
                )}`}
              >
                {campaign.status}
              </span>
              {isDemo && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Demo
                </span>
              )}
              {hasContent && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {contentCount} content pieces
                </span>
              )}
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Created {formatDate(campaign.created_at)}
              </span>
              {campaign.target_audience && (
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {campaign.target_audience.slice(0, 30)}
                  {campaign.target_audience.length > 30 ? "..." : ""}
                </span>
              )}
              {campaign.keywords && campaign.keywords.length > 0 && (
                <span className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  {campaign.keywords.length} keywords
                </span>
              )}
            </div>
            {campaign.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                {campaign.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-4">
            {hasContent && (
              <button
                onClick={() => onCampaignView(campaign)}
                className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors text-sm"
                title="View Content"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Content</span>
              </button>
            )}
            <button
              onClick={() => onCampaignView(campaign)}
              className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors text-sm"
              title="View Campaign"
            >
              <Eye className="w-4 h-4" />
              <span>View</span>
            </button>
            <button
              onClick={() => onCampaignEdit(campaign)}
              className="flex items-center gap-1 bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors text-sm"
              title="Edit Campaign"
            >
              <Settings className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onCampaignDuplicate(campaign)}
                className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                title="Duplicate Campaign"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => onCampaignDelete(campaign)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Campaign"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No campaigns found
        </h3>
        <p className="text-gray-500">
          Create your first campaign to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const isExpanded = expandedCategories.has(category.id);
        const IconComponent = category.icon;

        return (
          <div
            key={category.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    category.color === "green"
                      ? "bg-green-100 text-green-600"
                      : category.color === "yellow"
                      ? "bg-yellow-100 text-yellow-600"
                      : category.color === "blue"
                      ? "bg-blue-100 text-blue-600"
                      : category.color === "gray"
                      ? "bg-gray-100 text-gray-600"
                      : "bg-purple-100 text-purple-600"
                  }`}
                >
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {category.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {category.description}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <BarChart3 className="w-4 h-4" />
                    {category.campaigns.length} campaigns
                  </span>
                  <span className="flex items-center gap-1">
                    <ActivityIcon className="w-4 h-4" />
                    {category.campaigns.reduce(
                      (acc, campaign) =>
                        acc + (campaign.generated_content_count || 0),
                      0
                    )}{" "}
                    content pieces
                  </span>
                </div>
              </div>
              <div className="flex items-center">
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>

            {/* Campaign List */}
            {isExpanded && (
              <div className="border-t border-gray-100">
                {category.campaigns.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {category.campaigns.map(renderCampaignRow)}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <IconComponent className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">
                      No campaigns in this category yet.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Summary Footer */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Campaign Overview
              </h3>
              <p className="text-sm text-gray-600">
                Total campaign performance summary
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">
                {campaigns.length}
              </div>
              <div className="text-gray-500">Total Campaigns</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">
                {campaigns.filter((c) => c.status === "active").length}
              </div>
              <div className="text-gray-500">Active</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600">
                {campaigns.reduce(
                  (acc, campaign) => acc + (campaign.generated_content_count || 0),
                  0
                )}
              </div>
              <div className="text-gray-500">Content Pieces</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}