import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, CheckCircle, TrendingUp, DollarSign } from 'lucide-react';

// Type definitions
interface SystemHealth {
  overall_status: 'healthy' | 'degraded' | 'unhealthy';
}

interface ProviderStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
}

interface ProviderDetails {
  cloudflare_r2: ProviderStatus;
  backblaze_b2: ProviderStatus;
}

interface HealthData {
  system_health: SystemHealth;
  provider_details: ProviderDetails;
}

interface FailoverStatistics {
  uptime_percentage: number;
  total_assets: number;
  total_failover_events: number;
  reliability_score: number;
}

interface FailoverData {
  failover_statistics: FailoverStatistics;
}

interface CostAnalysis {
  current_storage_cost_monthly: number;
  savings_vs_aws_s3: number;
}

interface UsageStats {
  total_size_gb: number;
}

interface ContentDistribution {
  by_count: Record<string, number>;
  by_size_mb: Record<string, number>;
}

interface UsageStatistics {
  stats: UsageStats;
  cost_analysis: CostAnalysis;
  content_distribution: ContentDistribution;
}

interface UsageData {
  usage_statistics: UsageStatistics;
}

const StorageMonitoring = () => {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [failoverStats, setFailoverStats] = useState<FailoverData | null>(null);
  const [usageStats, setUsageStats] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonitoringData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchMonitoringData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMonitoringData = async () => {
    try {
      const [health, failover, usage] = await Promise.all([
        fetch('/storage/health?detailed=true').then(r => r.json()),
        fetch('/storage/failover-stats?time_period=7d').then(r => r.json()),
        fetch('/storage/usage-stats?time_period=30d').then(r => r.json())
      ]);

      setHealthData(health);
      setFailoverStats(failover);
      setUsageStats(usage);
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'unhealthy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Storage System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(healthData?.system_health?.overall_status)}`} />
                <span className="font-medium">Overall Status</span>
              </div>
              <Badge variant={healthData?.system_health?.overall_status === 'healthy' ? 'success' : 'destructive'}>
                {healthData?.system_health?.overall_status?.toUpperCase() || 'UNKNOWN'}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(healthData?.provider_details?.cloudflare_r2?.status)}`} />
                <span className="font-medium">Cloudflare R2</span>
              </div>
              <p className="text-sm text-gray-600">Primary Storage</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(healthData?.provider_details?.backblaze_b2?.status)}`} />
                <span className="font-medium">Backblaze B2</span>
              </div>
              <p className="text-sm text-gray-600">Backup Storage</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uptime & Reliability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Uptime & Reliability (7 days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {failoverStats?.failover_statistics?.uptime_percentage?.toFixed(2) || '0.00'}%
              </div>
              <p className="text-sm text-gray-600">Uptime</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {failoverStats?.failover_statistics?.total_assets || 0}
              </div>
              <p className="text-sm text-gray-600">Total Assets</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {failoverStats?.failover_statistics?.total_failover_events || 0}
              </div>
              <p className="text-sm text-gray-600">Failover Events</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {failoverStats?.failover_statistics?.reliability_score?.toFixed(1) || '0.0'}
              </div>
              <p className="text-sm text-gray-600">Reliability Score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Storage Usage & Costs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Storage Usage & Costs (30 days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="text-lg font-semibold">
                {usageStats?.usage_statistics?.stats?.total_size_gb || 0} GB
              </div>
              <p className="text-sm text-gray-600">Total Storage Used</p>
            </div>
            <div className="space-y-2">
              <div className="text-lg font-semibold text-green-600">
                ${usageStats?.usage_statistics?.cost_analysis?.current_storage_cost_monthly?.toFixed(4) || '0.0000'}
              </div>
              <p className="text-sm text-gray-600">Monthly Cost</p>
            </div>
            <div className="space-y-2">
              <div className="text-lg font-semibold text-blue-600">
                ${usageStats?.usage_statistics?.cost_analysis?.savings_vs_aws_s3?.toFixed(4) || '0.0000'}
              </div>
              <p className="text-sm text-gray-600">Savings vs AWS S3</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Content Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {usageStats?.usage_statistics?.content_distribution?.by_count && 
              Object.entries(usageStats.usage_statistics.content_distribution.by_count).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="capitalize">{type}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{count} files</Badge>
                    <span className="text-sm text-gray-600">
                      {usageStats?.usage_statistics?.content_distribution?.by_size_mb?.[type] || 0} MB
                    </span>
                  </div>
                </div>
              ))
            }
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {failoverStats?.failover_statistics?.total_failover_events && failoverStats.failover_statistics.total_failover_events > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {failoverStats.failover_statistics.total_failover_events} failover events detected in the last 7 days. 
            System is automatically switching to backup storage when needed.
          </AlertDescription>
        </Alert>
      )}

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button onClick={fetchMonitoringData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>
    </div>
  );
};

export default StorageMonitoring;