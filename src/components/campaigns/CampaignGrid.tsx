// src/components/campaigns/CampaignGrid.tsx - Apple Design System
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Grid,
  List,
  SortAsc,
  SortDesc,
  Filter,
  Calendar,
  Star,
  Zap,
  FileText,
  Eye,
  Edit,
  Copy,
  Trash2,
  Clock,
  Play,
  TrendingUp,
  Award,
  Archive,
  FolderOpen,
} from "lucide-react";
import type { Campaign } from "@/lib/types/campaign";

interface CampaignGridProps {
  campaigns: Campaign[];
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSortChange?: (sortBy: string, order: "asc" | "desc") => void;
  onCampaignView?: (campaign: Campaign) => void;
  onCampaignEdit?: (campaign: Campaign) => void;
  onCampaignDuplicate?: (campaign: Campaign) => void;
  onCampaignDelete?: (campaign: Campaign) => void;
  isLoading?: boolean;
}

const CAMPAIGN_TYPES = {
  universal: {
    label: "Universal Campaign",
    icon: "🌟",
    color: "bg-gray-100 text-black",
  },
};

const STATUS_CONFIG = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-800", icon: Clock },
  in_progress: {
    label: "In Progress",
    color: "bg-blue-100 text-blue-800",
    icon: Play,
  },
  review: {
    label: "Review",
    color: "bg-yellow-100 text-yellow-800",
    icon: Eye,
  },
  active: {
    label: "Active",
    color: "bg-green-100 text-green-800",
    icon: TrendingUp,
  },
  completed: {
    label: "Completed",
    color: "bg-green-100 text-green-800",
    icon: Award,
  },
  archived: {
    label: "Archived",
    color: "bg-gray-100 text-gray-600",
    icon: Archive,
  },
};

const SORT_OPTIONS = [
  { value: "created_at", label: "Date Created" },
  { value: "title", label: "Title" },
  { value: "status", label: "Status" },
  { value: "campaign_type", label: "Type" },
  { value: "confidence_score", label: "Confidence Score" },
  { value: "intelligence_count", label: "Intelligence Sources" },
  { value: "generated_content_count", label: "Generated Content" },
  { value: "last_activity", label: "Last Activity" },
];

// Apple-styled Campaign Card
function AppleCampaignCard({
  campaign,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  campaign: Campaign;
  onView?: (campaign: Campaign) => void;
  onEdit?: (campaign: Campaign) => void;
  onDuplicate?: (campaign: Campaign) => void;
  onDelete?: (campaign: Campaign) => void;
}) {
  const router = useRouter();

  if (!campaign) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-12 w-12 bg-gray-200 rounded-xl mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const typeConfig = CAMPAIGN_TYPES["universal"] || {
    label: "Universal Campaign",
    icon: "🌟",
    color: "bg-gray-100 text-black",
  };

  const statusConfig = STATUS_CONFIG[
    campaign.status as keyof typeof STATUS_CONFIG
  ] || {
    label: "Unknown",
    color: "bg-gray-100 text-gray-800",
    icon: Clock,
  };

  const StatusIcon = statusConfig.icon;
  const contentCount = campaign.generated_content_count ?? 0;
  const hasContent = contentCount > 0;

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    return "Just now";
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all hover:border-gray-300 group">
      {/* Apple-style Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
          {typeConfig?.icon || "🌟"}
        </div>
        <div className="flex items-center space-x-2">
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
          >
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusConfig.label}
          </div>
        </div>
      </div>

      {/* Content */}
      <h3 className="text-lg font-medium text-black mb-2 line-clamp-1">
        {campaign.title}
      </h3>
      <p className="text-apple-gray text-sm mb-4 line-clamp-2 leading-relaxed">
        {campaign.description}
      </p>

      {/* Campaign Type Badge */}
      <div
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-4 ${typeConfig?.color}`}
      >
        {typeConfig?.label}
      </div>

      {/* Apple-style Metrics */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-apple-gray font-medium">
            Intelligence Sources
          </span>
          <span className="font-semibold text-black">
            {campaign.intelligence_count ?? 0}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-apple-gray font-medium">Generated Content</span>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-black">{contentCount}</span>
            {hasContent && (
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            )}
          </div>
        </div>
        {campaign.confidence_score && campaign.confidence_score > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-apple-gray font-medium">
              Confidence Score
            </span>
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-500 mr-1" />
              <span className="font-semibold text-black">
                {(campaign.confidence_score * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content Preview */}
      {hasContent && (
        <div className="mb-4 p-3 bg-green-50 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-700 font-medium">
              {contentCount} content piece{contentCount !== 1 ? "s" : ""} ready
            </span>
            <button
              onClick={() => router.push(`/campaigns/${campaign.id}/content`)}
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              View All →
            </button>
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="flex items-center justify-between text-xs text-apple-gray mb-4 font-medium">
        <span>Created {formatTimeAgo(campaign.created_at)}</span>
        {campaign.last_activity && (
          <span>Updated {formatTimeAgo(campaign.last_activity)}</span>
        )}
      </div>

      {/* Apple-style Actions */}
      <div className="space-y-3">
        {/* Primary Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onView?.(campaign)}
            className="flex-1 px-4 py-3 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-all flex items-center justify-center"
          >
            <Eye className="w-4 h-4 mr-2" />
            Open Campaign
          </button>

          {/* Content Library Button */}
          <button
            onClick={() => router.push(`/campaigns/${campaign.id}/content`)}
            className={`px-4 py-3 rounded-lg transition-all text-sm font-medium flex items-center space-x-2 ${
              hasContent
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-gray-100 text-apple-gray hover:bg-gray-200"
            }`}
            title={
              hasContent
                ? `View ${contentCount} content pieces`
                : "No content generated yet"
            }
          >
            <FolderOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Content</span>
            {contentCount > 0 && (
              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                {contentCount}
              </span>
            )}
          </button>
        </div>

        {/* Secondary Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit?.(campaign)}
            className="flex-1 px-4 py-2 bg-gray-100 text-black text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </button>
          <button
            onClick={() => onDuplicate?.(campaign)}
            className="px-4 py-2 bg-gray-100 text-black text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AppleCampaignGrid({
  campaigns = [],
  viewMode,
  onViewModeChange,
  sortBy = "created_at",
  sortOrder = "desc",
  onSortChange,
  onCampaignView,
  onCampaignEdit,
  onCampaignDuplicate,
  onCampaignDelete,
  isLoading = false,
}: CampaignGridProps) {
  const router = useRouter();
  const [showSortMenu, setShowSortMenu] = useState(false);

  const safeCampaigns = campaigns || [];

  const handleSort = (newSortBy: string) => {
    if (newSortBy === sortBy) {
      onSortChange?.(sortBy, sortOrder === "asc" ? "desc" : "asc");
    } else {
      onSortChange?.(newSortBy, "desc");
    }
    setShowSortMenu(false);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    return "Just now";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      in_progress: "bg-blue-100 text-blue-800",
      review: "bg-yellow-100 text-yellow-800",
      active: "bg-green-100 text-green-800",
      completed: "bg-green-100 text-green-800",
      archived: "bg-gray-100 text-gray-600",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const LoadingSkeleton = () => (
    <div className="space-y-6">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
        >
          <div className="animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="h-12 w-12 bg-gray-200 rounded-xl"></div>
              <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex space-x-2">
            <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Apple-style Controls Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <h3 className="text-lg font-semibold text-black">
            {safeCampaigns.length} Campaign
            {safeCampaigns.length !== 1 ? "s" : ""}
          </h3>

          {/* Content Summary */}
          <div className="text-sm text-apple-gray font-medium">
            {safeCampaigns.reduce(
              (acc, campaign) => acc + (campaign.generated_content_count ?? 0),
              0
            )}{" "}
            total content pieces
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center space-x-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
            >
              {sortOrder === "asc" ? (
                <SortAsc className="w-4 h-4" />
              ) : (
                <SortDesc className="w-4 h-4" />
              )}
              <span>
                Sort by{" "}
                {SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label}
              </span>
            </button>

            {showSortMenu && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                <div className="p-2">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSort(option.value)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-100 transition-colors ${
                        sortBy === option.value
                          ? "bg-gray-100 text-black font-medium"
                          : "text-apple-gray"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option.label}</span>
                        {sortBy === option.value &&
                          (sortOrder === "asc" ? (
                            <SortAsc className="w-4 h-4" />
                          ) : (
                            <SortDesc className="w-4 h-4" />
                          ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Apple-style View Mode Toggle */}
        <div className="flex items-center space-x-2">
          <div className="flex bg-gray-100 rounded-lg overflow-hidden">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`p-3 ${
                viewMode === "grid"
                  ? "bg-black text-white"
                  : "text-apple-gray hover:text-black hover:bg-gray-200"
              } transition-colors`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={`p-3 ${
                viewMode === "list"
                  ? "bg-black text-white"
                  : "text-apple-gray hover:text-black hover:bg-gray-200"
              } transition-colors`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Campaign Display */}
      {safeCampaigns.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Filter className="w-8 h-8 text-apple-gray" />
          </div>
          <h3 className="text-xl font-medium text-black mb-2">
            No campaigns found
          </h3>
          <p className="text-apple-gray">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      ) : viewMode === "grid" ? (
        /* Apple-style Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeCampaigns.map((campaign) => (
            <AppleCampaignCard
              key={campaign.id}
              campaign={campaign}
              onView={onCampaignView}
              onEdit={onCampaignEdit}
              onDuplicate={onCampaignDuplicate}
              onDelete={onCampaignDelete}
            />
          ))}
        </div>
      ) : (
        /* Apple-style List View */
        <div className="space-y-4">
          {safeCampaigns.map((campaign) => {
            const contentCount = campaign.generated_content_count ?? 0;
            const hasContent = contentCount > 0;

            return (
              <div
                key={campaign.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Campaign Icon */}
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                      🌟
                    </div>

                    {/* Campaign Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-lg font-medium text-black">
                          {campaign.title}
                        </h3>
                        <div
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            campaign.status
                          )}`}
                        >
                          {campaign.status.replace("_", " ").toUpperCase()}
                        </div>
                        {hasContent && (
                          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            📄 {contentCount} content
                          </div>
                        )}
                      </div>
                      <p className="text-apple-gray text-sm mb-2 line-clamp-1">
                        {campaign.description}
                      </p>

                      {/* Metrics */}
                      <div className="flex items-center space-x-4 text-sm text-apple-gray">
                        <span>
                          🔍 {campaign.intelligence_count ?? 0} intelligence
                        </span>
                        <span>📄 {contentCount} content pieces</span>
                        <span>📅 {formatTimeAgo(campaign.created_at)}</span>
                        {campaign.confidence_score &&
                          campaign.confidence_score > 0 && (
                            <span>
                              ⭐ {(campaign.confidence_score * 100).toFixed(0)}%
                              confidence
                            </span>
                          )}
                      </div>
                    </div>
                  </div>

                  {/* Apple-style Actions */}
                  <div className="flex items-center space-x-2">
                    {/* Content Library Button */}
                    {hasContent && (
                      <button
                        onClick={() =>
                          router.push(`/campaigns/${campaign.id}/content`)
                        }
                        className="px-4 py-2 text-sm text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors flex items-center space-x-2 font-medium"
                      >
                        <FolderOpen className="w-4 h-4" />
                        <span>Content Library</span>
                      </button>
                    )}

                    <button
                      onClick={() => onCampaignView?.(campaign)}
                      className="px-4 py-2 text-sm text-black hover:bg-gray-100 rounded-lg transition-colors font-medium"
                    >
                      Open Campaign
                    </button>
                    <button
                      onClick={() => onCampaignEdit?.(campaign)}
                      className="px-4 py-2 text-sm text-apple-gray hover:text-black hover:bg-gray-100 rounded-lg transition-colors font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onCampaignDuplicate?.(campaign)}
                      className="px-4 py-2 text-sm text-apple-gray hover:text-black hover:bg-gray-100 rounded-lg transition-colors font-medium"
                    >
                      Duplicate
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
