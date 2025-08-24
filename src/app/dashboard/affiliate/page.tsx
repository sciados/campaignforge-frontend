// src/app/dashboard/affiliate/page.tsx
/**
 * Affiliate Marketer Dashboard Page
 * 💰 Commission Command Center
 */

'use client';

import { useEffect, useState } from 'react';
import AffiliateDashboard from '@/components/dashboards/affiliate/AffiliateDashboard';

export default function AffiliateDashboardPage() {
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardConfig();
  }, []);

  const fetchDashboardConfig = async () => {
    try {
      const response = await fetch('/api/user-types/dashboard-config', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setConfig(data.config);
      }
    } catch (error) {
      console.error('Failed to load dashboard config:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setUserType = useCallback(async (userType: UserType, typeData?: any): Promise<boolean> => {
    try {
      const response = await fetch('/api/user-types/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          user_type: userType,
          goals: typeData?.goals || [],
          experience_level: typeData?.experience_level || 'beginner',
          current_activities: typeData?.current_activities || [],
          interests: typeData?.interests || [],
          description: typeData?.description || ''
        })
      });

      const data = await response.json();

      if (data.success) {
        setUserProfile(data.user_profile);
        return true;
      }

      setError(data.detail || 'Failed to set user type');
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set user type');
      return false;
    }
  }, []);

  const completeOnboarding = useCallback(async (goals: string[], experienceLevel: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/user-types/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          goals,
          experience_level: experienceLevel
        })
      });

      const data = await response.json();

      if (data.success) {
        setUserProfile(data.user_profile);
        // Redirect to dashboard
        router.push(data.dashboard_route);
        return true;
      }

      setError(data.detail || 'Failed to complete onboarding');
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete onboarding');
      return false;
    }
  }, [router]);

  useEffect(() => {
    refreshUserProfile();
  }, [refreshUserProfile]);

  return {
    userProfile,
    isLoading,
    error,
    refreshUserProfile,
    setUserType,
    completeOnboarding
  };
};