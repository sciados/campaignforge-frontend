// File: src/components/dashboards/enhanced/CampaignCard.tsx
// Campaign card component with type-safe status badges and modern design

"use client";

import React from "react";
import { Eye, Target, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Campaign {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  completion_percentage?: number;
  content_count?: number;
  sources_count?: number;
  is_demo?: boolean;
}

interface CampaignCardProps {
  campaign: Campaign;
  onEdit: (campaign: Campaign) => void;
  onView: (campaign: Campaign) => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onEdit,
  onView,
}) => {
  const getStatusBadge = (
    status: string
  ): "success" | "secondary" | "info" | "warning" => {
    const variants: Record<
      string,
      "success" | "secondary" | "info" | "warning"
    > = {
      active: "success",
      draft: "secondary",
      completed: "info",
      paused: "warning",
    };

    const normalizedStatus = status?.toLowerCase();
    return variants[normalizedStatus] || "secondary";
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-black mb-2">
              {campaign.title}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-2">
              {campaign.description}
            </p>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            {campaign.is_demo && <Badge variant="purple">Demo</Badge>}
            <Badge variant={getStatusBadge(campaign.status)}>
              {campaign.status}
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span>
            Created: {new Date(campaign.created_at).toLocaleDateString()}
          </span>
          <span>{campaign.completion_percentage || 0}% Complete</span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-black h-2 rounded-full transition-all duration-300"
            style={{ width: `${campaign.completion_percentage || 0}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center">
              <Target className="w-4 h-4 mr-1" />
              {campaign.content_count || 0} Content
            </span>
            <span className="flex items-center">
              <Activity className="w-4 h-4 mr-1" />
              {campaign.sources_count || 0} Sources
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onView(campaign)}
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
            <Button size="sm" onClick={() => onEdit(campaign)}>
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
