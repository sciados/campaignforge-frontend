// File: src/cemnnoopst / dashboards / enhanced / UserDashboardStats.tsx;
// Dashboard statistics component with type-safe props and color variants

("use client");

import React from "react";
import {
  BarChart3,
  Target,
  FileText,
  Activity,
  LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsData {
  total_campaigns_created?: number;
  active_campaigns?: number;
  total_content?: number;
  avg_completion?: number;
}

interface UserDashboardStatsProps {
  stats: StatsData | null;
}

// Added proper interfaces:
interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  color?: "blue" | "green" | "purple" | "orange";
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  color = "blue",
}) => {
  const colors = {
    blue: "text-blue-600 bg-blue-100",
    green: "text-green-600 bg-green-100",
    purple: "text-purple-600 bg-purple-100",
    orange: "text-orange-600 bg-orange-100",
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-black mt-2">{value}</p>
            {change && (
              <p
                className={`text-sm mt-1 ${
                  change.startsWith("+") ? "text-green-600" : "text-red-600"
                }`}
              >
                {change} from last month
              </p>
            )}
          </div>
          <div className={`p-3 rounded-2xl ${colors[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const UserDashboardStats: React.FC<UserDashboardStatsProps> = ({
  stats,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Campaigns"
        value={stats?.total_campaigns_created || 0}
        change="+12%"
        icon={BarChart3}
        color="blue"
      />
      <StatCard
        title="Active Campaigns"
        value={stats?.active_campaigns || 0}
        change="+5%"
        icon={Activity}
        color="green"
      />
      <StatCard
        title="Content Generated"
        value={stats?.total_content || 0}
        change="+23%"
        icon={FileText}
        color="purple"
      />
      <StatCard
        title="Avg Completion"
        value={`${stats?.avg_completion || 0}%`}
        change="+8%"
        icon={Target}
        color="orange"
      />
    </div>
  );
};
