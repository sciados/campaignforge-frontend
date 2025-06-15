import React from 'react';
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  Settings, 
  Activity,
  Database,
  Plus,
  Target,
  FileText,
  TrendingUp,
  Crown,
  Zap
} from 'lucide-react';

const Sidebar = ({ 
  activeTab, 
  onTabChange, 
  isAdmin = false,
  user = null,
  showUsageStats = true 
}) => {
  
  // Admin navigation items
  const adminNavItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users Management', icon: Users },
    { id: 'revenue', label: 'Revenue Analytics', icon: DollarSign },
    { id: 'campaigns', label: 'Campaign Monitor', icon: Activity },
    { id: 'system', label: 'System Health', icon: Database },
    { id: 'settings', label: 'Platform Settings', icon: Settings },
  ];

  // User navigation items
  const userNavItems = [
    { id: 'overview', label: 'Dashboard', icon: BarChart3 },
    { id: 'campaigns', label: 'My Campaigns', icon: Target },
    { id: 'create', label: 'Create Campaign', icon: Plus, highlight: true },
    { id: 'library', label: 'Content Library', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Account Settings', icon: Settings },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  const getTierConfig = (tier) => {
    const configs = {
      'Free': {
        gradient: 'from-gray-400 to-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        textColor: 'text-gray-700'
      },
      'Starter': {
        gradient: 'from-blue-400 to-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-700'
      },
      'Professional': {
        gradient: 'from-purple-400 to-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        textColor: 'text-purple-700'
      },
      'Agency': {
        gradient: 'from-orange-400 to-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-700'
      },
      'Enterprise': {
        gradient: 'from-emerald-400 to-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        textColor: 'text-emerald-700'
      }
    };
    return configs[tier] || configs['Free'];
  };

  const tierConfig = user?.tier ? getTierConfig(user.tier) : getTierConfig('Free');

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <nav className="p-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
              activeTab === item.id
                ? isAdmin 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : `${tierConfig.bgColor} ${tierConfig.textColor} border ${tierConfig.borderColor}`
                : item.highlight && !isAdmin
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Usage Stats for User Dashboard */}
      {!isAdmin && showUsageStats && user && (
        <div className="p-4 mt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Monthly Usage</h4>
          <div className="space-y-3">
            {/* AI Credits */}
            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>AI Credits</span>
                <span>{user.creditsUsed?.toLocaleString() || 0}/{user.creditsTotal?.toLocaleString() || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getProgressColor(((user.creditsUsed || 0)/(user.creditsTotal || 1))*100)}`}
                  style={{ width: `${Math.min(((user.creditsUsed || 0)/(user.creditsTotal || 1))*100, 100)}%` }}
                ></div>
              </div>
            </div>
            
            {/* Videos */}
            {user.monthlyQuota?.videos && (
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Videos</span>
                  <span>{user.monthlyQuota.videos.used}/{user.monthlyQuota.videos.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getProgressColor((user.monthlyQuota.videos.used/user.monthlyQuota.videos.total)*100)}`}
                    style={{ width: `${(user.monthlyQuota.videos.used/user.monthlyQuota.videos.total)*100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Campaigns */}
            {user.monthlyQuota?.campaigns && (
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Campaigns</span>
                  <span>{user.monthlyQuota.campaigns.used}/{user.monthlyQuota.campaigns.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getProgressColor((user.monthlyQuota.campaigns.used/user.monthlyQuota.campaigns.total)*100)}`}
                    style={{ width: `${(user.monthlyQuota.campaigns.used/user.monthlyQuota.campaigns.total)*100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Upgrade Prompt for Non-Enterprise Users */}
          {user.tier !== 'Enterprise' && (
            <div className="mt-6 p-3 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Crown className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">
                  {user.tier === 'Free' ? 'Upgrade to Pro' : 'Upgrade Plan'}
                </span>
              </div>
              <p className="text-xs text-purple-700 mb-3">
                {user.tier === 'Free' 
                  ? 'Unlock unlimited campaigns and AI features'
                  : 'Get more credits and advanced features'
                }
              </p>
              <button className="w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs rounded-md hover:from-purple-700 hover:to-blue-700 transition-colors">
                Upgrade Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* Admin System Status */}
      {isAdmin && (
        <div className="p-4 mt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">System Status</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">API Health</span>
              <span className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Healthy
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Database</span>
              <span className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">AI Services</span>
              <span className="flex items-center text-yellow-600">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                High Usage
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;