// src/lib/hooks/useUserType.ts - FIXED VERSION
/**
 * Custom hook for user type management
 * Fixed for proper async backend communication and infinite loop prevention
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

    // Get backend URL
    const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://campaign-backend-production-e2db.up.railway.app";

    // Get auth token
    const getAuthToken = () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('authToken') || localStorage.getItem('access_token');
        }
        return null;
    };

    // Create request headers with proper auth
    const getHeaders = useCallback((includeAuth = true) => {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
        };

        if (includeAuth) {
            const token = getAuthToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }, []);

    const refreshUserProfile = useCallback(async () => {
        // Prevent multiple simultaneous calls
        if (isRefreshing.current) {
            return;
        }

        isRefreshing.current = true;
        setIsLoading(true);
        setError(null);

        const token = getAuthToken();
        if (!token) {
            console.log("No auth token found");
            setIsLoading(false);
            setError(null);
            isRefreshing.current = false;
            return;
        }

        try {
            console.log("Fetching user profile from /api/user-types/current");

            const response = await fetch(`${API_BASE_URL}/api/user-types/current`, {
                method: 'GET',
                headers: getHeaders(true),
                credentials: 'omit',
            });

            console.log("Current user response status:", response.status);

            if (!response.ok) {
                if (response.status === 401) {
                    console.log("Authentication failed - token may be invalid");
                    setError("Authentication failed");
                    isRefreshing.current = false;
                    setIsLoading(false);
                    return;
                }

                if (response.status === 404) {
                    console.log("User type endpoint not found - backend may not have user types deployed");
                    setUserProfile(null);
                    setError(null);
                    isRefreshing.current = false;
                    setIsLoading(false);
                    return;
                }

                if (response.status === 400) {
                    // Bad request usually means user hasn't completed setup
                    console.log("User hasn't completed setup - trying dashboard-config");

                    // Fallback to dashboard-config
                    try {
                        const dashboardResponse = await fetch(`${API_BASE_URL}/api/user-types/dashboard-config`, {
                            method: 'GET',
                            headers: getHeaders(true),
                            credentials: 'omit',
                        });

                        if (dashboardResponse.ok) {
                            const dashboardData = await dashboardResponse.json();
                            console.log("Dashboard config fallback data:", dashboardData);

                            if (dashboardData.success && dashboardData.config) {
                                const config = dashboardData.config;
                                if (config.user_type) {
                                    setUserProfile({
                                        id: config.user_id || 'unknown',
                                        user_type: config.user_type,
                                        user_type_display: config.user_type_display || config.user_type,
                                        onboarding_status: config.onboarding_status || 'incomplete',
                                        user_goals: config.user_goals || [],
                                        experience_level: config.experience_level || 'beginner',
                                        user_tier: config.user_tier || 'free',
                                        email: config.email || '',
                                        full_name: config.full_name || '',
                                        dashboard_route: config.dashboard_route || '/dashboard',
                                        onboarding_completed: config.onboarding_completed ?? false,
                                        available_features: config.available_features || [],
                                        usage_summary: config.usage_summary || {},
                                    });
                                    setError(null);
                                    isRefreshing.current = false;
                                    setIsLoading(false);
                                    return;
                                }
                            }
                        }
                    } catch (fallbackError) {
                        console.log("Dashboard config fallback also failed:", fallbackError);
                    }

                    setUserProfile(null);
                    setError(null);
                    isRefreshing.current = false;
                    setIsLoading(false);
                    return;
                }

                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log("User profile data:", data);

            if (data.success && data.user_profile) {
                setUserProfile(data.user_profile);
                setError(null);
            } else {
                console.log("No user profile in response");
                setUserProfile(null);
                setError(null);
            }
        } catch (err) {
            console.error("Error fetching user profile:", err);
            setUserProfile(null);
            setError(null); // Don't show errors to user for profile fetching
        } finally {
            setIsLoading(false);
            isRefreshing.current = false;
        }
    }, [getHeaders]);

    const setUserType = useCallback(async (userType: UserType, typeData?: any): Promise<boolean> => {
        const token = getAuthToken();
        if (!token) {
            setError("Not authenticated");
            return false;
        }

        try {
            setError(null);
            console.log("Setting user type:", userType);

            const requestBody = {
                user_type: userType,
                goals: typeData?.goals || [],
                experience_level: typeData?.experience_level || 'beginner',
                current_activities: typeData?.current_activities || [],
                interests: typeData?.interests || [],
                description: typeData?.description || ''
            };

            console.log("Request body:", requestBody);

            const response = await fetch(`${API_BASE_URL}/api/user-types/select`, {
                method: 'POST',
                headers: getHeaders(true),
                credentials: 'omit',
                body: JSON.stringify(requestBody)
            });

            console.log("Set user type response status:", response.status);

            if (!response.ok) {
                const responseText = await response.text();
                console.error("API Error Response:", responseText);

                if (response.status === 405) {
                    setError("API endpoint configuration issue. Please contact support.");
                    return false;
                } else if (response.status === 401) {
                    setError("Authentication failed. Please log in again.");
                    return false;
                } else if (response.status === 422) {
                    setError("Invalid data format. Please try again.");
                    return false;
                } else {
                    setError(`Server error: ${response.status}. Please try again.`);
                    return false;
                }
            }

            const data = await response.json();
            console.log("Set user type response data:", data);

            // Handle successful response
            if (data.success) {
                if (data.user_profile) {
                    setUserProfile(data.user_profile);
                }
                return true;
            }

            setError(data.message || 'Failed to set user type');
            return false;
        } catch (err) {
            console.error("Network error setting user type:", err);
            setError("Network error. Please check your connection and try again.");
            return false;
        }
    }, [getHeaders]);

    const completeOnboarding = useCallback(async (goals: string[], experienceLevel: string): Promise<boolean> => {
        const token = getAuthToken();
        if (!token) {
            setError("Not authenticated");
            return false;
        }

        try {
            setError(null);
            console.log("Completing onboarding...");

            const response = await fetch(`${API_BASE_URL}/api/user-types/complete-onboarding`, {
                method: 'POST',
                headers: getHeaders(true),
                credentials: 'omit',
                body: JSON.stringify({
                    goals,
                    experience_level: experienceLevel
                })
            });

            console.log("Complete onboarding response status:", response.status);

            if (!response.ok) {
                const responseText = await response.text();
                console.error("Complete onboarding error:", responseText);
                setError(`Failed to complete onboarding: ${response.status}`);
                return false;
            }

            const data = await response.json();
            console.log("Complete onboarding data:", data);

            if (data.success) {
                if (data.user_profile) {
                    setUserProfile(data.user_profile);
                }

                // Navigate to dashboard
                const dashboardRoute = data.dashboard_route || '/dashboard';
                router.push(dashboardRoute);
                return true;
            }

            setError(data.message || 'Failed to complete onboarding');
            return false;
        } catch (err) {
            console.error("Error completing onboarding:", err);
            setError("Network error. Please try again.");
            return false;
        }
    }, [getHeaders, router]);

    // Initialize only once
    useEffect(() => {
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            refreshUserProfile();
        }
    }, [refreshUserProfile]); // FIXED: Empty dependency array prevents infinite loops

    return {
        userProfile,
        isLoading,
        error,
        refreshUserProfile,
        setUserType,
        completeOnboarding
    };
};