import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Image as ImageIcon, DollarSign, Zap, TrendingDown } from 'lucide-react';

// Type definitions
interface ProviderData {
  available: boolean;
  cost: number;
  response_time?: string;
}

interface ProviderStatus {
  provider_tests: Record<string, ProviderData>;
}

interface CostAnalysis {
  cost_analysis: {
    ultra_cheap_cost: number;
    dalle_cost: number;
    savings_percentage: number;
  };
}

const ImageGenerationMonitoring = () => {
  const [providerStatus, setProviderStatus] = useState<ProviderStatus | null>(null);
  const [costAnalysis, setCostAnalysis] = useState<CostAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImageGenerationData();
    const interval = setInterval(fetchImageGenerationData, 60000); // Every minute
    return () => clearInterval(interval);
  }, []);

  const fetchImageGenerationData = async () => {
    try {
      const [providers, costs] = await Promise.all([
        fetch('/intelligence/stability/ultra-cheap/test-providers').then(r => r.json()),
        fetch('/intelligence/stability/ultra-cheap/cost-calculator?platforms=instagram,facebook,tiktok&posts_per_platform=3').then(r => r.json())
      ]);

      setProviderStatus(providers);
      setCostAnalysis(costs);
    } catch (error) {
      console.error('Failed to fetch image generation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProviderColor = (available: boolean) => available ? 'bg-green-500' : 'bg-red-500';
  const getProviderBadge = (available: boolean): "default" | "secondary" | "destructive" | "outline" => 
    available ? 'default' : 'destructive';

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Provider Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            AI Image Generation Providers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {providerStatus?.provider_tests && Object.entries(providerStatus.provider_tests).map(([provider, data]) => (
              <div key={provider} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getProviderColor(data.available)}`} />
                  <div>
                    <p className="font-medium capitalize">{provider.replace('_', ' ')}</p>
                    <p className="text-sm text-gray-600">${data.cost}/image</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getProviderBadge(data.available)}>
                    {data.available ? 'Available' : 'Unavailable'}
                  </Badge>
                  {data.response_time && (
                    <span className="text-sm text-gray-600">{data.response_time}</span>
                  )}
                </div>
              </div>
            ))}
            {(!providerStatus?.provider_tests || Object.keys(providerStatus.provider_tests).length === 0) && (
              <div className="text-center py-4 text-gray-500">
                No provider data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cost Savings Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Cost Savings Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${costAnalysis?.cost_analysis?.ultra_cheap_cost?.toFixed(4) || '0.0000'}
              </div>
              <p className="text-sm text-gray-600">Ultra-Cheap Cost</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                ${costAnalysis?.cost_analysis?.dalle_cost?.toFixed(4) || '0.0000'}
              </div>
              <p className="text-sm text-gray-600">DALL-E Cost</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {costAnalysis?.cost_analysis?.savings_percentage?.toFixed(1) || '0.0'}%
              </div>
              <p className="text-sm text-gray-600">Savings</p>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Cost Efficiency</span>
              <span>{costAnalysis?.cost_analysis?.savings_percentage?.toFixed(1) || '0.0'}%</span>
            </div>
            <Progress value={costAnalysis?.cost_analysis?.savings_percentage || 0} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Provider Priority */}
      <Card>
        <CardHeader>
          <CardTitle>Provider Priority Order</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-green-50 rounded">
              <span className="font-medium">1. Stability AI</span>
              <span className="text-sm text-green-600">$0.002/image</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
              <span className="font-medium">2. Replicate</span>
              <span className="text-sm text-blue-600">$0.004/image</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
              <span className="font-medium">3. Together AI</span>
              <span className="text-sm text-yellow-600">$0.008/image</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-red-50 rounded">
              <span className="font-medium">4. OpenAI DALL-E</span>
              <span className="text-sm text-red-600">$0.040/image (Fallback)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageGenerationMonitoring;