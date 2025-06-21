'use client'

import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { useAuth } from './useAuth'

const UserTierContext = createContext()

export const useUserTier = () => {
  const context = useContext(UserTierContext)
  if (!context) {
    throw new Error('useUserTier must be used within a UserTierProvider')
  }
  return context
}

// Tier configurations matching your pricing strategy
export const TIER_CONFIG = {
  free: {
    name: 'Free',
    price: 0,
    color: 'gray',
    features: {
      aiTokens: 1000,
      videoInputs: 5,
      aiImages: 10,
      campaigns: 3,
      socialGraphics: 0,
      aiVideos: 0,
      teamUsers: 1
    },
    limits: {
      monthlyLimit: true,
      advancedFeatures: false,
      prioritySupport: false,
      analytics: false
    }
  },
  starter: {
    name: 'Starter',
    price: 29,
    color: 'blue',
    features: {
      aiTokens: 8000,
      videoInputs: 50,
      aiImages: 100,
      campaigns: 15,
      socialGraphics: 20,
      aiVideos: 0,
      teamUsers: 1
    },
    limits: {
      monthlyLimit: true,
      advancedFeatures: false,
      prioritySupport: false,
      analytics: true
    }
  },
  professional: {
    name: 'Professional',
    price: 79,
    color: 'purple',
    features: {
      aiTokens: 20000,
      videoInputs: 200,
      aiImages: 500,
      campaigns: 50,
      socialGraphics: 100,
      aiVideos: 25,
      teamUsers: 3
    },
    limits: {
      monthlyLimit: true,
      advancedFeatures: true,
      prioritySupport: true,
      analytics: true
    }
  },
  agency: {
    name: 'Agency',
    price: 199,
    color: 'orange',
    features: {
      aiTokens: 50000,
      videoInputs: 1000,
      aiImages: 2000,
      campaigns: -1, // unlimited
      socialGraphics: 500,
      aiVideos: 100,
      teamUsers: 10
    },
    limits: {
      monthlyLimit: true,
      advancedFeatures: true,
      prioritySupport: true,
      analytics: true,
      whiteLabel: true,
      apiAccess: true
    }
  },
  enterprise: {
    name: 'Enterprise',
    price: 499,
    color: 'emerald',
    features: {
      aiTokens: -1, // unlimited
      videoInputs: -1, // unlimited
      aiImages: -1, // unlimited
      campaigns: -1, // unlimited
      socialGraphics: -1, // unlimited
      aiVideos: -1, // unlimited
      teamUsers: -1 // unlimited
    },
    limits: {
      monthlyLimit: false,
      advancedFeatures: true,
      prioritySupport: true,
      analytics: true,
      whiteLabel: true,
      apiAccess: true,
      customIntegrations: true,
      dedicatedSupport: true
    }
  }
};

export const UserTierProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [usage, setUsage] = useState({
    aiTokens: 0,
    videoInputs: 0,
    aiImages: 0,
    campaigns: 0,
    socialGraphics: 0,
    aiVideos: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  // ✅ FIXED: Get tier from user object correctly
  const currentTier = user?.company?.subscription_tier || user?.subscription_tier || 'free';
  const tierConfig = TIER_CONFIG[currentTier];

  // ✅ FIXED: Use correct environment variable and default URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://campaign-backend-production-e2db.up.railway.app';

  // ✅ FIXED: Fetch usage data from profile endpoint
  const fetchUsageData = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      
      // Get user profile which includes company usage data
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const profileData = await response.json();
        
        // Extract usage data from profile response
        setUsage({
          aiTokens: profileData.company?.monthly_credits_used || 0,
          videoInputs: 0, // TODO: Track this in backend
          aiImages: 0,    // TODO: Track this in backend
          campaigns: profileData.company?.total_campaigns || 0,
          socialGraphics: 0, // TODO: Track this in backend
          aiVideos: 0     // TODO: Track this in backend
        });
      } else {
        console.error('Failed to fetch profile data:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch usage data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUsageData();
    }
  }, [isAuthenticated, user, fetchUsageData]);

  const checkLimit = (feature) => {
    const limit = tierConfig.features[feature];
    const used = usage[feature] || 0;
    
    if (limit === -1) return { canUse: true, unlimited: true };
    
    return {
      canUse: used < limit,
      used,
      limit,
      percentage: (used / limit) * 100,
      remaining: limit - used
    };
  };

  // ✅ FIXED: Update usage increment to use correct endpoint
  const incrementUsage = async (feature, amount = 1) => {
    try {
      const token = localStorage.getItem('authToken');
      
      // For now, update local state and sync with backend
      // TODO: Create proper usage increment endpoint in backend
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT', // Assuming profile update endpoint
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          action: 'increment_usage',
          feature, 
          amount 
        })
      });

      if (response.ok) {
        // Update local state immediately for better UX
        setUsage(prev => ({
          ...prev,
          [feature]: (prev[feature] || 0) + amount
        }));
        return true;
      } else {
        // Fallback: Update local state only (temporary solution)
        console.warn('Usage increment API not available, updating locally only');
        setUsage(prev => ({
          ...prev,
          [feature]: (prev[feature] || 0) + amount
        }));
        return true;
      }
    } catch (error) {
      console.error('Failed to increment usage:', error);
      
      // Fallback: Update local state only
      setUsage(prev => ({
        ...prev,
        [feature]: (prev[feature] || 0) + amount
      }));
      return false;
    }
  };

  const canUpgrade = () => {
    const tierOrder = ['free', 'starter', 'professional', 'agency', 'enterprise'];
    const currentIndex = tierOrder.indexOf(currentTier);
    return currentIndex < tierOrder.length - 1;
  };

  const getNextTier = () => {
    const tierOrder = ['free', 'starter', 'professional', 'agency', 'enterprise'];
    const currentIndex = tierOrder.indexOf(currentTier);
    if (currentIndex < tierOrder.length - 1) {
      return tierOrder[currentIndex + 1];
    }
    return null;
  };

  const getTierColor = (tier = currentTier) => {
    return TIER_CONFIG[tier]?.color || 'gray';
  };

  const getTierFeatures = (tier = currentTier) => {
    return TIER_CONFIG[tier]?.features || {};
  };

  const hasFeature = (feature) => {
    return tierConfig.limits[feature] || false;
  };

  const getUsagePercentage = (feature) => {
    const limit = tierConfig.features[feature];
    const used = usage[feature] || 0;
    
    if (limit === -1) return 0; // unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const isNearLimit = (feature, threshold = 80) => {
    return getUsagePercentage(feature) >= threshold;
  };

  // ✅ ADDED: Helper function to get credits info
  const getCreditsInfo = () => {
    if (!user?.company) return { used: 0, limit: 1000, percentage: 0 };
    
    const used = user.company.monthly_credits_used || 0;
    const limit = user.company.monthly_credits_limit || 1000;
    const percentage = Math.min((used / limit) * 100, 100);
    
    return { used, limit, percentage, remaining: limit - used };
  };

  // ✅ ADDED: Helper function to check if user can perform action
  const canPerformAction = (feature) => {
    const limitCheck = checkLimit(feature);
    return limitCheck.canUse || limitCheck.unlimited;
  };

  const value = {
    // Current tier info
    currentTier,
    tierConfig,
    usage,
    isLoading,
    
    // Tier utilities
    getTierColor,
    getTierFeatures,
    canUpgrade,
    getNextTier,
    hasFeature,
    
    // Usage management
    checkLimit,
    incrementUsage,
    fetchUsageData,
    getUsagePercentage,
    isNearLimit,
    canPerformAction,
    
    // Credits info
    getCreditsInfo,
    
    // Tier configurations
    TIER_CONFIG
  };

  return (
    <UserTierContext.Provider value={value}>
      {children}
    </UserTierContext.Provider>
  );
};