import React, { useState } from 'react';
import { 
  Plus, 
  Video, 
  FileText, 
  Image, 
  BarChart3, 
  Settings, 
  Bell, 
  Search,
  TrendingUp,
  Play,
  Eye,
  Heart,
  Share2,
  Download,
  Calendar,
  Clock,
  Target,
  Zap,
  Crown,
  Star,
  ChevronRight,
  Sparkles,
  Users,
  DollarSign
} from 'lucide-react';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userTier, setUserTier] = useState('Professional'); // Demo: can be Free, Starter, Professional, Agency, Enterprise
  
  // Mock user data
  const userData = {
    name: 'Sarah Johnson',
    email: 'sarah@company.com',
    tier: userTier,
    creditsUsed: 12500,
    creditsTotal: 20000,
    campaignsCreated: 24,
    monthlyQuota: {
      videos: { used: 45, total: 200 },
      images: { used: 234, total: 500 },
      campaigns: { used: 12, total: 50 }
    }
  };

  const recentCampaigns = [
    {
      id: 1,
      name: 'Summer Product Launch',
      type: 'Product Launch',
      status: 'Active',
      progress: 85,
      created: '2 days ago',
      performance: { views: 2400, engagement: 18.5, conversions: 124 }
    },
    {
      id: 2,
      name: 'Email Newsletter Series',
      type: 'Email Marketing',
      status: 'Completed',
      progress: 100,
      created: '1 week ago',
      performance: { views: 5200, engagement: 24.2, conversions: 312 }
    },
    {
      id: 3,
      name: 'Social Media Blitz',
      type: 'Social Media',
      status: 'In Progress',
      progress: 60,
      created: '3 days ago',
      performance: { views: 1800, engagement: 12.8, conversions: 89 }
    }
  ];

  const getTierConfig = (tier) => {
    const configs = {
      'Free': {
        gradient: 'from-gray-400 to-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        textColor: 'text-gray-700',
        badge: 'bg-gray-100 text-gray-800'
      },
      'Starter': {
        gradient: 'from-blue-400 to-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-700',
        badge: 'bg-blue-100 text-blue-800'
      },
      'Professional': {
        gradient: 'from-purple-400 to-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        textColor: 'text-purple-700',
        badge: 'bg-purple-100 text-purple-800'
      },
      'Agency': {
        gradient: 'from-orange-400 to-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-700',
        badge: 'bg-orange-100 text-orange-800'
      },
      'Enterprise': {
        gradient: 'from-emerald-400 to-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        textColor: 'text-emerald-700',
        badge: 'bg-emerald-100 text-emerald-800'
      }
    };
    return configs[tier] || configs['Free'];
  };

  const tierConfig = getTierConfig(userTier);

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 bg-gradient-to-r ${tierConfig.gradient} rounded-lg flex items-center justify-center`}>
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">CampaignForge</h1>
            </div>
            <div className="hidden md:flex items-center space-x-1 text-sm text-gray-500">
              <span>Dashboard</span>
              <span>/</span>
              <span className="text-gray-900">Campaign Studio</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Tier Badge */}
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${tierConfig.badge}`}>
              {userTier === 'Enterprise' && <Crown className="w-4 h-4" />}
              {userTier === 'Agency' && <Star className="w-4 h-4" />}
              {userTier === 'Professional' && <Zap className="w-4 h-4" />}
              <span className="text-sm font-medium">{userTier}</span>
            </div>
            
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
              />
            </div>
            <button className="relative p-2 text-gray-400 hover:text-gray-600">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full"></span>
            </button>
            <div className={`w-8 h-8 bg-gradient-to-r ${tierConfig.gradient} rounded-full flex items-center justify-center text-white font-medium text-sm`}>
              {userData.name.split(' ').map(n => n[0]).join('')}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-4 space-y-2">
            {[
              { id: 'overview', label: 'Dashboard', icon: BarChart3 },
              { id: 'campaigns', label: 'My Campaigns', icon: Target },
              { id: 'create', label: 'Create Campaign', icon: Plus, highlight: true },
              { id: 'library', label: 'Content Library', icon: FileText },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'settings', label: 'Account Settings', icon: Settings },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
                  activeTab === item.id
                    ? `${tierConfig.bgColor} ${tierConfig.textColor} border ${tierConfig.borderColor}`
                    : item.highlight
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Usage Stats in Sidebar */}
          <div className="p-4 mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Monthly Usage</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>AI Credits</span>
                  <span>{userData.creditsUsed.toLocaleString()}/{userData.creditsTotal.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getProgressColor((userData.creditsUsed/userData.creditsTotal)*100)}`}
                    style={{ width: `${(userData.creditsUsed/userData.creditsTotal)*100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Videos</span>
                  <span>{userData.monthlyQuota.videos.used}/{userData.monthlyQuota.videos.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getProgressColor((userData.monthlyQuota.videos.used/userData.monthlyQuota.videos.total)*100)}`}
                    style={{ width: `${(userData.monthlyQuota.videos.used/userData.monthlyQuota.videos.total)*100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Welcome back, {userData.name}!</h2>
                  <p className="text-gray-600">Here is what is happening with your campaigns today.</p>
                </div>
                <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 shadow-lg">
                  <Plus className="w-5 h-5" />
                  <span>New Campaign</span>
                </button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                      <p className="text-2xl font-bold text-gray-900">{userData.campaignsCreated}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Target className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600 font-medium">+3</span>
                    <span className="text-gray-500 ml-1">this month</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Views</p>
                      <p className="text-2xl font-bold text-gray-900">24.3K</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Eye className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600 font-medium">+18%</span>
                    <span className="text-gray-500 ml-1">from last month</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
                      <p className="text-2xl font-bold text-gray-900">18.5%</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Heart className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600 font-medium">+2.4%</span>
                    <span className="text-gray-500 ml-1">from last month</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Conversions</p>
                      <p className="text-2xl font-bold text-gray-900">525</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-emerald-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600 font-medium">+12%</span>
                    <span className="text-gray-500 ml-1">from last month</span>
                  </div>
                </div>
              </div>

              {/* Recent Campaigns */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Campaigns</h3>
                    <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">View All</button>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {recentCampaigns.map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${tierConfig.gradient} rounded-lg flex items-center justify-center`}>
                          <Target className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{campaign.name}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{campaign.type}</span>
                            <span>•</span>
                            <span>{campaign.created}</span>
                            <span>•</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              campaign.status === 'Active' ? 'bg-green-100 text-green-800' :
                              campaign.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {campaign.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{campaign.performance.views.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Heart className="w-4 h-4" />
                              <span>{campaign.performance.engagement}%</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <DollarSign className="w-4 h-4" />
                              <span>{campaign.performance.conversions}</span>
                            </div>
                          </div>
                          <div className="mt-2 w-32">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Progress</span>
                              <span>{campaign.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-purple-500 h-2 rounded-full"
                                style={{ width: `${campaign.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-6 rounded-xl text-white">
                  <div className="flex items-center justify-between mb-4">
                    <Video className="w-8 h-8" />
                    <Plus className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Video Campaign</h3>
                  <p className="text-purple-100 text-sm mb-4">Transform videos into complete marketing campaigns</p>
                  <button className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 px-4 rounded-lg transition-colors">
                    Get Started
                  </button>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-xl text-white">
                  <div className="flex items-center justify-between mb-4">
                    <Image className="w-8 h-8" alt="" />
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">AI Visual Content</h3>
                  <p className="text-emerald-100 text-sm mb-4">Generate stunning visuals with AI technology</p>
                  <button className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 px-4 rounded-lg transition-colors">
                    Create Images
                  </button>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 rounded-xl text-white">
                  <div className="flex items-center justify-between mb-4">
                    <FileText className="w-8 h-8" />
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Content Suite</h3>
                  <p className="text-orange-100 text-sm mb-4">Upload documents and create comprehensive campaigns</p>
                  <button className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 px-4 rounded-lg transition-colors">
                    Upload Content
                  </button>
                </div>
              </div>

              {/* Tier-Specific Upgrade Banner */}
              {userTier !== 'Enterprise' && (
                <div className={`${tierConfig.bgColor} border ${tierConfig.borderColor} rounded-xl p-6`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${tierConfig.gradient} rounded-lg flex items-center justify-center`}>
                        <Crown className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className={`text-lg font-semibold ${tierConfig.textColor}`}>
                          {userTier === 'Free' ? 'Upgrade to unlock more features' :
                           userTier === 'Starter' ? 'Upgrade to Professional for advanced AI' :
                           userTier === 'Professional' ? 'Upgrade to Agency for team features' :
                           'Upgrade to Enterprise for unlimited access'}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {userTier === 'Free' ? 'Get unlimited campaigns, AI generation, and priority support' :
                           userTier === 'Starter' ? 'Access advanced AI models and unlimited campaigns' :
                           userTier === 'Professional' ? 'Add team collaboration and white-label features' :
                           'Get unlimited everything plus enterprise security'}
                        </p>
                      </div>
                    </div>
                    <button className={`px-6 py-2 bg-gradient-to-r ${tierConfig.gradient} text-white rounded-lg hover:shadow-lg transition-shadow`}>
                      Upgrade Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'create' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Create New Campaign</h2>
                <p className="text-gray-600">Choose your input source to get started</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Video Input */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <Video className="w-6 h-6 text-purple-600" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Video Content</h3>
                  <p className="text-gray-600 text-sm mb-4">Import from YouTube, Vimeo, TikTok, or upload directly</p>
                  <div className="flex items-center text-sm text-purple-600">
                    <Play className="w-4 h-4 mr-1" />
                    <span>8+ platforms supported</span>
                  </div>
                </div>

                {/* Document Input */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Documents</h3>
                  <p className="text-gray-600 text-sm mb-4">Upload PDFs, Word docs, presentations, or spreadsheets</p>
                  <div className="flex items-center text-sm text-blue-600">
                    <FileText className="w-4 h-4 mr-1" />
                    <span>All formats supported</span>
                  </div>
                </div>

                {/* Web Content Input */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                      <Search className="w-6 h-6 text-emerald-600" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Web Content</h3>
                  <p className="text-gray-600 text-sm mb-4">Extract content from any website or landing page</p>
                  <div className="flex items-center text-sm text-emerald-600">
                    <Search className="w-4 h-4 mr-1" />
                    <span>URL-based extraction</span>
                  </div>
                </div>

                {/* AI Generation */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                      <Sparkles className="w-6 h-6 text-orange-600" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Generation</h3>
                  <p className="text-gray-600 text-sm mb-4">Start from scratch with AI-powered content creation</p>
                  <div className="flex items-center text-sm text-orange-600">
                    <Sparkles className="w-4 h-4 mr-1" />
                    <span>Powered by GPT-4</span>
                  </div>
                </div>

                {/* Image Content */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                      <Image className="w-6 h-6 text-pink-600" alt="" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Images & Graphics</h3>
                  <p className="text-gray-600 text-sm mb-4">Upload visual assets and create campaigns around them</p>
                  <div className="flex items-center text-sm text-pink-600">
                    <Image className="w-4 h-4 mr-1" alt="" />
                    <span>Visual analysis included</span>
                  </div>
                </div>

                {/* Audio Content */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                      <Play className="w-6 h-6 text-indigo-600" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Audio Content</h3>
                  <p className="text-gray-600 text-sm mb-4">Upload podcasts, recordings, or audio files</p>
                  <div className="flex items-center text-sm text-indigo-600">
                    <Play className="w-4 h-4 mr-1" />
                    <span>Auto-transcription</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Demo Tier Switcher (for testing purposes) */}
      <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
        <p className="text-sm font-medium text-gray-900 mb-2">Demo: Switch Tier</p>
        <select 
          value={userTier} 
          onChange={(e) => setUserTier(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="Free">Free</option>
          <option value="Starter">Starter ($29/mo)</option>
          <option value="Professional">Professional ($79/mo)</option>
          <option value="Agency">Agency ($199/mo)</option>
          <option value="Enterprise">Enterprise ($499/mo)</option>
        </select>
      </div>
    </div>
  );
};

export default UserDashboard;