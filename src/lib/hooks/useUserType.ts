// src/hooks/useUserType.ts
/**
 * Custom hook for user type management
 * 🎣 React hook for user type state management
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { UserProfile, UserType } from '../user-type-utils';

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
}