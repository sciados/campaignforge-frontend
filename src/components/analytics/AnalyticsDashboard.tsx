"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAnalyticsDashboard, refreshAnalytics, getProductAnalytics } from "@/lib/api";
import {
  TrendingUp,
  DollarSign,
  Users,
  ShoppingCart,
  RefreshCw,
  BarChart3,
  Eye,
  AlertCircle,
  CreditCard,
  Zap,
  Shield
} from "lucide-react";

interface PlatformMetrics {
  total_sales: number;
  total_revenue: number;
  conversion_rate: number;
  refund_rate: number;
  avg_order_value: number;
  platform: string;
  period_days: number;
  last_updated: string;
}

interface PlatformData {
  metrics: PlatformMetrics;
  last_updated: string;
  status: "connected" | "no_data" | "error";
}

interface AnalyticsDashboardData {
  platforms: Record<string, PlatformData>;
  total_metrics: {
    total_sales: number;
    total_revenue: number;
    avg_conversion_rate: number;
    connected_platforms: number;
  };
}

interface ProductAnalytics {
  user_id: number;
  platform: string;
  product_id: string;
  product_name: string;
  metrics: {
    sales: number;
    revenue: number;
    conversion_rate: number;
    refunds: number;
  };
  last_updated: string;
}

export default function AnalyticsDashboard() {
  const [dashboardData, setDashboardData] = useState<AnalyticsDashboardData | null>(null);
  const [productData, setProductData] = useState<ProductAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");

  useEffect(() => {
    loadAnalyticsData();
    loadProductData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      const result = await getAnalyticsDashboard();
      if (result.success) {
        setDashboardData(result.data);
        setError(null);
      } else {
        throw new Error(result.message || 'Failed to load analytics');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadProductData = async () => {
    try {
      const result = await getProductAnalytics();
      if (result.success) {
        setProductData(result.data);
      } else {
        console.error('Error loading product data:', result.message);
      }
    } catch (err: any) {
      console.error('Error loading product data:', err);
    }
  };

  const refreshAnalyticsData = async (platform?: string) => {
    setRefreshing(true);
    try {
      const result = await refreshAnalytics(platform, 30);
      if (result.success) {
        await loadAnalyticsData();
        await loadProductData();
        setError(null);
      } else {
        throw new Error(result.message || 'Failed to refresh analytics');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (rate: number) => {
    return `${(rate * 100).toFixed(2)}%`;
  };

  const getPlatformDisplayName = (platform: string) => {
    const names: Record<string, string> = {
      'clickbank': 'ClickBank',
      'jvzoo': 'JVZoo',
      'warriorplus': 'WarriorPlus'
    };
    return names[platform] || platform;
  };

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, JSX.Element> = {
      'clickbank': <CreditCard className="h-5 w-5 text-blue-600" />,
      'jvzoo': <Zap className="h-5 w-5 text-orange-600" />,
      'warriorplus': <Shield className="h-5 w-5 text-green-600" />
    };
    return icons[platform] || <BarChart3 className="h-5 w-5 text-gray-600" />;
  };

  const getPlatformStatus = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Connected</Badge>;
      case 'no_data':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">No Data</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading analytics dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Analytics</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => loadAnalyticsData()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  const totalMetrics = dashboardData?.total_metrics;
  const platforms = dashboardData?.platforms || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your performance across all connected platforms</p>
        </div>
        <Button
          onClick={() => refreshAnalyticsData()}
          disabled={refreshing}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh All'}
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Overview Cards */}
      {totalMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMetrics.total_sales.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Across {totalMetrics.connected_platforms} platforms
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalMetrics.total_revenue)}</div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercentage(totalMetrics.avg_conversion_rate)}</div>
              <p className="text-xs text-muted-foreground">
                Across all platforms
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connected Platforms</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMetrics.connected_platforms}</div>
              <p className="text-xs text-muted-foreground">
                Active integrations
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Platform Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Platform Performance
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {Object.keys(platforms).length === 0 ? (
            <div className="text-center py-8">
              <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Connected Platforms</h3>
              <p className="text-gray-600 mb-4">Connect your platforms in Settings to view analytics here</p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Go to Settings
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(platforms).map(([platform, data]) => (
                <div key={platform} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-lg">{getPlatformDisplayName(platform)}</h3>
                      {getPlatformStatus(data.status)}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => refreshAnalyticsData(platform)}
                      disabled={refreshing}
                    >
                      <RefreshCw className={`h-3 w-3 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Sales</p>
                      <p className="text-lg font-semibold">{data.metrics.total_sales.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Revenue</p>
                      <p className="text-lg font-semibold">{formatCurrency(data.metrics.total_revenue)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Conversion Rate</p>
                      <p className="text-lg font-semibold">{formatPercentage(data.metrics.conversion_rate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Avg Order Value</p>
                      <p className="text-lg font-semibold">{formatCurrency(data.metrics.avg_order_value)}</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-3">
                    Last updated: {new Date(data.last_updated).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Performance by Platform */}
      {productData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Platform Performance
            </CardTitle>
            <p className="text-sm text-gray-600">Performance stats by Platform → Product</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Group products by platform */}
              {Object.entries(
                productData.reduce((groups: Record<string, any[]>, product) => {
                  const platform = product.platform;
                  if (!groups[platform]) groups[platform] = [];
                  groups[platform].push(product);
                  return groups;
                }, {})
              ).map(([platform, products]) => (
                <div key={platform} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg flex items-center">
                      {getPlatformIcon(platform)}
                      <span className="ml-2">{getPlatformDisplayName(platform)}</span>
                    </h3>
                    <span className="text-sm text-gray-600">
                      {products.length} product{products.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {products.slice(0, 3).map((product) => (
                      <div key={`${product.platform}-${product.product_id}`}
                           className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{product.product_name}</h4>
                          <div className="flex items-center gap-4 mt-1">
                            <p className="text-sm text-gray-600">SKU: {product.product_id}</p>
                            {product.metrics.vendor && (
                              <p className="text-sm text-gray-600">Vendor: {product.metrics.vendor}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(product.metrics.revenue)}</p>
                          <div className="text-sm text-gray-600">
                            <span>{product.metrics.sales} sales</span>
                            {product.metrics.quantity && product.metrics.quantity !== product.metrics.sales && (
                              <span> • {product.metrics.quantity} units</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {products.length > 3 && (
                      <div className="text-center py-2">
                        <span className="text-sm text-gray-500">
                          + {products.length - 3} more products
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}