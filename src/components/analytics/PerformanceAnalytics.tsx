// src/components/analytics/PerformanceAnalytics.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useApi } from '@/lib/api';
import type { UsageAnalytics } from '@/lib/types/modular';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  format: 'number' | 'percentage' | 'currency' | 'time';
  description: string;
}

interface CampaignPerformance {
  campaign_id: string;
  campaign_name: string;
  reach: number;
  engagement: number;
  conversions: number;
  cost: number;
  roi: number;
  platforms: Record<string, {
    reach: number;
    engagement: number;
    cost: number;
  }>;
}

interface PerformanceAnalyticsProps {
  campaignId?: string;
  timeRange?: '7d' | '30d' | '90d' | '1y';
}

const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({
  campaignId,
  timeRange = '30d'
}) => {
  const api = useApi();
  const [analytics, setAnalytics] = useState<UsageAnalytics | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalytics();
  }, [campaignId, timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load usage analytics
      const usageData = await api.getUsageAnalytics();
      setAnalytics(usageData);

      // Mock campaign performance data (would come from backend)
      const mockCampaigns: CampaignPerformance[] = [
        {
          campaign_id: 'camp_1',
          campaign_name: 'Product Launch Q4',
          reach: 125000,
          engagement: 8500,
          conversions: 285,
          cost: 1250.00,
          roi: 3.2,
          platforms: {
            facebook: { reach: 45000, engagement: 3200, cost: 450.00 },
            instagram: { reach: 38000, engagement: 2800, cost: 380.00 },
            twitter: { reach: 25000, engagement: 1500, cost: 250.00 },
            email: { reach: 17000, engagement: 1000, cost: 170.00 }
          }
        },
        {
          campaign_id: 'camp_2',
          campaign_name: 'Nurture Sequence',
          reach: 85000,
          engagement: 6200,
          conversions: 192,
          cost: 850.00,
          roi: 2.8,
          platforms: {
            email: { reach: 50000, engagement: 4000, cost: 500.00 },
            linkedin: { reach: 35000, engagement: 2200, cost: 350.00 }
          }
        }
      ];

      setCampaigns(mockCampaigns);

    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Failed to load performance analytics');
    } finally {
      setLoading(false);
    }
  };

  const getOverviewMetrics = (): PerformanceMetric[] => {
    if (!analytics || campaigns.length === 0) return [];

    const totalReach = campaigns.reduce((sum, c) => sum + c.reach, 0);
    const totalEngagement = campaigns.reduce((sum, c) => sum + c.engagement, 0);
    const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
    const totalCost = campaigns.reduce((sum, c) => sum + c.cost, 0);
    const avgRoi = campaigns.reduce((sum, c) => sum + c.roi, 0) / campaigns.length;

    return [
      {
        id: 'total_reach',
        name: 'Total Reach',
        value: totalReach,
        change: 12.5,
        trend: 'up',
        format: 'number',
        description: 'Total audience reached across all campaigns'
      },
      {
        id: 'engagement_rate',
        name: 'Engagement Rate',
        value: (totalEngagement / totalReach) * 100,
        change: 8.2,
        trend: 'up',
        format: 'percentage',
        description: 'Average engagement rate across all platforms'
      },
      {
        id: 'conversion_rate',
        name: 'Conversion Rate',
        value: (totalConversions / totalReach) * 100,
        change: -2.1,
        trend: 'down',
        format: 'percentage',
        description: 'Percentage of reach that converted'
      },
      {
        id: 'cost_per_conversion',
        name: 'Cost per Conversion',
        value: totalCost / totalConversions,
        change: -15.3,
        trend: 'up',
        format: 'currency',
        description: 'Average cost to acquire one conversion'
      },
      {
        id: 'roi',
        name: 'Return on Investment',
        value: avgRoi,
        change: 22.7,
        trend: 'up',
        format: 'number',
        description: 'Average ROI across all campaigns'
      },
      {
        id: 'content_efficiency',
        name: 'Content Efficiency',
        value: analytics.monthly_usage.total_cost,
        change: -18.9,
        trend: 'up',
        format: 'currency',
        description: 'Total content generation costs this month'
      }
    ];
  };

  const formatValue = (value: number, format: string): string => {
    switch (format) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'currency':
        return `$${value.toFixed(2)}`;
      case 'time':
        return `${value.toFixed(1)}s`;
      case 'number':
      default:
        return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toFixed(0);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      default:
        return '➡️';
    }
  };

  const getTrendColor = (trend: string, change: number) => {
    if (trend === 'stable') return 'text-gray-600';

    // For cost metrics, down is good (green), up is bad (red)
    if (change < 0) {
      return trend === 'up' ? 'text-green-600' : 'text-gray-600';
    }

    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getOverviewMetrics().map((metric) => (
          <div key={metric.id} className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-gray-600">{metric.name}</h3>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {formatValue(metric.value, metric.format)}
                </div>
              </div>
              <span className="text-2xl">{getTrendIcon(metric.trend)}</span>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">{metric.description}</p>
              <div className={`text-sm font-medium ${getTrendColor(metric.trend, metric.change)}`}>
                {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Campaign Performance Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Campaign Performance</h3>
          <p className="text-sm text-gray-600 mt-1">Detailed performance metrics for each campaign</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reach
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Engagement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ROI
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Platforms
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {campaigns.map((campaign) => (
                <tr key={campaign.campaign_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{campaign.campaign_name}</div>
                    <div className="text-sm text-gray-500">{campaign.campaign_id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {campaign.reach.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {campaign.engagement.toLocaleString()}
                    <div className="text-xs text-gray-500">
                      {((campaign.engagement / campaign.reach) * 100).toFixed(1)}% rate
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {campaign.conversions.toLocaleString()}
                    <div className="text-xs text-gray-500">
                      {((campaign.conversions / campaign.reach) * 100).toFixed(2)}% rate
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${campaign.cost.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${
                      campaign.roi >= 3 ? 'text-green-600' :
                      campaign.roi >= 2 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {campaign.roi.toFixed(1)}x
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {Object.keys(campaign.platforms).map((platform) => (
                        <span
                          key={platform}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderContentAnalytics = () => (
    <div className="space-y-6">
      {analytics && (
        <>
          {/* Content Generation Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Text Content</h3>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {analytics.monthly_usage.text_generations}
              </div>
              <div className="text-sm text-gray-500">Generated this month</div>
              <div className="mt-3 text-sm text-blue-600">
                Cost: ${analytics.cost_breakdown.by_content_type.text?.toFixed(2) || '0.00'}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Image Content</h3>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {analytics.monthly_usage.image_generations}
              </div>
              <div className="text-sm text-gray-500">Generated this month</div>
              <div className="mt-3 text-sm text-blue-600">
                Cost: ${analytics.cost_breakdown.by_content_type.image?.toFixed(2) || '0.00'}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Video Content</h3>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {analytics.monthly_usage.video_generations}
              </div>
              <div className="text-sm text-gray-500">Generated this month</div>
              <div className="mt-3 text-sm text-blue-600">
                Cost: ${analytics.cost_breakdown.by_content_type.video?.toFixed(2) || '0.00'}
              </div>
            </div>
          </div>

          {/* Provider Performance */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Provider Performance</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Response Times</h4>
                <div className="space-y-2">
                  {Object.entries(analytics.provider_performance.response_times).map(([provider, time]) => (
                    <div key={provider} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{provider}</span>
                      <span className="text-sm font-medium">{time}s</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-3">Success Rates</h4>
                <div className="space-y-2">
                  {Object.entries(analytics.provider_performance.success_rates).map(([provider, rate]) => (
                    <div key={provider} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{provider}</span>
                      <span className={`text-sm font-medium ${
                        rate >= 0.98 ? 'text-green-600' :
                        rate >= 0.95 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {(rate * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-3">Quality Scores</h4>
                <div className="space-y-2">
                  {Object.entries(analytics.provider_performance.quality_scores).map(([provider, score]) => (
                    <div key={provider} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{provider}</span>
                      <span className={`text-sm font-medium ${
                        score >= 8 ? 'text-green-600' :
                        score >= 6 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {score.toFixed(1)}/10
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Optimization Recommendations */}
          {analytics.recommendations.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                💡 Optimization Recommendations
              </h3>
              <div className="space-y-3">
                {analytics.recommendations.map((rec) => (
                  <div key={rec.id} className="flex items-start gap-3">
                    <span className="text-blue-600 mt-1">•</span>
                    <div>
                      <p className="text-blue-800">{rec.message}</p>
                      {rec.potential_savings && (
                        <p className="text-sm text-blue-600 mt-1">
                          Potential savings: ${rec.potential_savings.toFixed(2)}/month
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading performance analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Performance Analytics
        </h2>
        <p className="text-gray-600">
          Comprehensive insights into campaign performance and content generation efficiency
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="mb-6">
        <div className="flex gap-2">
          {[
            { value: '7d', label: '7 Days' },
            { value: '30d', label: '30 Days' },
            { value: '90d', label: '90 Days' },
            { value: '1y', label: '1 Year' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => {
                // In a real implementation, this would update the timeRange state
                console.log(`Time range selected: ${option.value}`);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: '📊' },
            { id: 'content', name: 'Content Analytics', icon: '📝' },
            { id: 'platforms', name: 'Platform Performance', icon: '📱' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'content' && renderContentAnalytics()}
        {activeTab === 'platforms' && (
          <div className="text-center py-12 text-gray-500">
            Platform performance analytics coming soon...
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceAnalytics;