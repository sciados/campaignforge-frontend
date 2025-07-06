// src/components/campaigns/CampaignStats.tsx - Apple Design System
import React from 'react'
import { Target, Play, Zap, BarChart3, TrendingUp } from 'lucide-react'
import { Campaign, User } from '@/lib/api'

interface CampaignStatsProps {
  campaigns: Campaign[]
  user?: User | null
}

export default function AppleCampaignStats({ campaigns, user }: CampaignStatsProps) {
  const safeCampaigns = campaigns || []
  
  // Calculate stats from campaigns
  const totalCampaigns = safeCampaigns.length
  const activeCampaigns = safeCampaigns.filter(c => c.status === 'active').length
  const inProgressCampaigns = safeCampaigns.filter(c => c.status === 'in_progress').length
  const totalIntelligenceSources = safeCampaigns.reduce((sum, c) => sum + (c.intelligence_count || 0), 0)
  const totalGeneratedContent = safeCampaigns.reduce((sum, c) => sum + (c.generated_content_count || 0), 0)
  const avgConfidenceScore = safeCampaigns.length > 0 
    ? safeCampaigns.reduce((sum, c) => sum + (c.confidence_score || 0), 0) / safeCampaigns.length 
    : 0

  // Calculate campaigns created this month
  const campaignsThisMonth = safeCampaigns.filter(c => {
    const created = new Date(c.created_at)
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    return created > monthAgo
  }).length

  // Credit usage calculations
  const creditsUsed = user?.company?.monthly_credits_used || 0
  const creditsLimit = user?.company?.monthly_credits_limit || 1000
  const creditsRemaining = Math.max(0, creditsLimit - creditsUsed)
  const usagePercentage = creditsLimit > 0 ? (creditsUsed / creditsLimit) * 100 : 0

  const stats = [
    {
      title: 'Total Campaigns',
      value: totalCampaigns,
      icon: Target,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      change: `+${campaignsThisMonth}`,
      changeLabel: 'this month',
      changePositive: true
    },
    {
      title: 'Active Campaigns',
      value: activeCampaigns,
      icon: Play,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      change: `${inProgressCampaigns}`,
      changeLabel: 'in progress',
      changePositive: null
    },
    {
      title: 'Intelligence Sources',
      value: totalIntelligenceSources,
      icon: Zap,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      change: `${(avgConfidenceScore * 100).toFixed(0)}%`,
      changeLabel: 'avg confidence',
      changePositive: null
    },
    {
      title: 'AI Credits Used',
      value: creditsUsed.toLocaleString(),
      icon: BarChart3,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      change: `${usagePercentage.toFixed(1)}%`,
      changeLabel: `${creditsRemaining.toLocaleString()} left`,
      changePositive: usagePercentage < 80
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div key={index} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-apple-gray mb-1">{stat.title}</p>
                <p className="text-3xl font-light text-black">{stat.value}</p>
              </div>
              <div className={`${stat.iconBg} w-12 h-12 rounded-xl flex items-center justify-center`}>
                <Icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              {stat.changePositive !== null && (
                <TrendingUp className={`w-4 h-4 mr-2 ${
                  stat.changePositive ? 'text-green-500' : 'text-red-500'
                }`} />
              )}
              <span className={`font-medium ${
                stat.changePositive === true ? 'text-green-600' : 
                stat.changePositive === false ? 'text-red-600' : 'text-blue-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-apple-gray ml-2">{stat.changeLabel}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}