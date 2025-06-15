import React from 'react';
import { 
  Search, 
  Bell, 
  Settings,
  Shield,
  Sparkles,
  Crown,
  Star,
  Zap
} from 'lucide-react';

const Header = ({ 
  user, 
  isAdmin = false, 
  searchPlaceholder = "Search...",
  onSearch,
  onNotificationClick,
  onProfileClick 
}) => {
  const getTierConfig = (tier) => {
    const configs = {
      'Free': {
        gradient: 'from-gray-400 to-gray-600',
        badge: 'bg-gray-100 text-gray-800'
      },
      'Starter': {
        gradient: 'from-blue-400 to-blue-600',
        badge: 'bg-blue-100 text-blue-800'
      },
      'Professional': {
        gradient: 'from-purple-400 to-purple-600',
        badge: 'bg-purple-100 text-purple-800'
      },
      'Agency': {
        gradient: 'from-orange-400 to-orange-600',
        badge: 'bg-orange-100 text-orange-800'
      },
      'Enterprise': {
        gradient: 'from-emerald-400 to-emerald-600',
        badge: 'bg-emerald-100 text-emerald-800'
      }
    };
    return configs[tier] || configs['Free'];
  };

  const tierConfig = getTierConfig(user?.tier);

  const getTierIcon = (tier) => {
    switch(tier) {
      case 'Enterprise': return Crown;
      case 'Agency': return Star;
      case 'Professional': return Zap;
      default: return null;
    }
  };

  const TierIcon = getTierIcon(user?.tier);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 bg-gradient-to-r ${isAdmin ? 'from-blue-600 to-purple-600' : tierConfig.gradient} rounded-lg flex items-center justify-center`}>
              {isAdmin ? (
                <Shield className="w-5 h-5 text-white" />
              ) : (
                <Sparkles className="w-5 h-5 text-white" />
              )}
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              {isAdmin ? 'Admin Portal' : 'CampaignForge'}
            </h1>
          </div>
          <div className="hidden md:flex items-center space-x-1 text-sm text-gray-500">
            <span>{isAdmin ? 'CampaignForge' : 'Dashboard'}</span>
            <span>/</span>
            <span className="text-gray-900">
              {isAdmin ? 'Administration' : 'Campaign Studio'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Tier Badge - Only for users, not admin */}
          {!isAdmin && user?.tier && (
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${tierConfig.badge}`}>
              {TierIcon && <TierIcon className="w-4 h-4" />}
              <span className="text-sm font-medium">{user.tier}</span>
            </div>
          )}
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              className={`pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent w-64 ${
                isAdmin 
                  ? 'focus:ring-blue-500' 
                  : 'focus:ring-purple-500'
              }`}
              onChange={onSearch}
            />
          </div>
          
          {/* Notifications */}
          <button 
            className="relative p-2 text-gray-400 hover:text-gray-600"
            onClick={onNotificationClick}
          >
            <Bell className="w-5 h-5" />
            <span className={`absolute -top-1 -right-1 w-3 h-3 ${isAdmin ? 'bg-red-500' : 'bg-purple-500'} rounded-full`}></span>
          </button>
          
          {/* Profile */}
          <button 
            className={`w-8 h-8 bg-gradient-to-r ${isAdmin ? 'from-gray-400 to-gray-600' : tierConfig.gradient} rounded-full flex items-center justify-center text-white font-medium text-sm`}
            onClick={onProfileClick}
          >
            {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;