// src/lib/hooks/useUserType.ts
/**
 * Custom hook for user type management
 * 🎣 React hook for user type state management
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { UserProfile, UserType } from '@/lib/user-type-utils';

interface UseUserTypeReturn {
    userProfile: UserProfile | null;
    isLoading: boolean;
    error: string | null;
    refreshUserProfile: () => Promise<void>;
    setUserType: (userType: UserType, typeData?: any) => Promise<boolean>;
    completeOnboarding: (goals: string[], experienceLevel: string) => Promise<boolean>;
}

export const useUserType = (): UseUserTypeReturn => {
    const router = useRouter();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshUserProfile = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/user-types/current', {
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Failed to fetch user profile');
            }

            if (data.success) {
                setUserProfile(data.user_profile);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
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