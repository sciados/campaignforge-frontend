// src/lib/hooks/useUserType.ts - FIXED VERSION
/**
 * Custom hook for user type management
 * Fixed infinite loop issue
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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

    // Use ref to prevent infinite loops
    const hasInitialized = useRef(false);
    const isRefreshing = useRef(false);

    const refreshUserProfile = useCallback(async () => {
        // Prevent multiple simultaneous calls
        if (isRefreshing.current) {
            return;
        }

        isRefreshing.current = true;
        setIsLoading(true);
        setError(null);

        try {
            console.log("🔄 Fetching user profile from /api/user-types/current");

            const response = await fetch('/api/user-types/current', {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log("📥 Response status:", response.status);

            if (!response.ok) {
                if (response.status === 404) {
                    // Endpoint doesn't exist - user likely needs to complete setup
                    console.log("⚠️ User profile endpoint not found - user needs setup");
                    setUserProfile(null);
                    setError(null); // Don't show error for missing profile
                    return;
                }

                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log("📥 User profile data:", data);

            if (data.success && data.user_profile) {
                setUserProfile(data.user_profile);
                setError(null);
            } else {
                console.log("⚠️ No user profile in response");
                setUserProfile(null);
                setError(null); // Don't show error for incomplete profile
            }
        } catch (err) {
            console.error("❌ Error fetching user profile:", err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';

            // Don't show network errors as user-facing errors
            if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
                console.log("Network error - will retry later");
                setError(null);
            } else {
                setError(errorMessage);
            }

            setUserProfile(null);
        } finally {
            setIsLoading(false);
            isRefreshing.current = false;
        }
    }, []);

    const setUserType = useCallback(async (userType: UserType, typeData?: any): Promise<boolean> => {
        try {
            setError(null);
            console.log("🔄 Setting user type:", userType);

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

            console.log("📥 Set user type response status:", response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log("📥 Set user type data:", data);

            if (data.success) {
                if (data.user_profile) {
                    setUserProfile(data.user_profile);
                }
                return true;
            }

            setError(data.detail || 'Failed to set user type');
            return false;
        } catch (err) {
            console.error("❌ Error setting user type:", err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to set user type';
            setError(errorMessage);
            return false;
        }
    }, []);

    const completeOnboarding = useCallback(async (goals: string[], experienceLevel: string): Promise<boolean> => {
        try {
            setError(null);
            console.log("🔄 Completing onboarding...");

            const response = await fetch('/api/user-types/complete-onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    goals,
                    experience_level: experienceLevel
                })
            });

            console.log("📥 Complete onboarding response status:", response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log("📥 Complete onboarding data:", data);

            if (data.success) {
                if (data.user_profile) {
                    setUserProfile(data.user_profile);
                }

                // Navigate to dashboard
                const dashboardRoute = data.dashboard_route || '/dashboard';
                router.push(dashboardRoute);
                return true;
            }

            setError(data.detail || 'Failed to complete onboarding');
            return false;
        } catch (err) {
            console.error("❌ Error completing onboarding:", err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to complete onboarding';
            setError(errorMessage);
            return false;
        }
    }, [router]);

    // Initialize only once
    useEffect(() => {
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            refreshUserProfile();
        }
    }, [refreshUserProfile]); // Empty dependency array - only run once

    return {
        userProfile,
        isLoading,
        error,
        refreshUserProfile,
        setUserType,
        completeOnboarding
    };
};