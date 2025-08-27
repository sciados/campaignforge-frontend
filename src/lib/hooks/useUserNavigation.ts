// src/lib/hooks/useUserNavigation.ts
import { useApi } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';

export const useUserNavigation = () => {
    const api = useApi();
    const [dashboardRoute, setDashboardRoute] = useState('/dashboard');
    const [userType, setUserType] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadUserInfo = useCallback(async () => {
        try {
            setIsLoading(true);
            const config = await api.getUserTypeConfig();
            setDashboardRoute(config.user_profile.dashboard_route);
            setUserType(config.user_profile.user_type);
        } catch (error) {
            console.error('Failed to load user navigation info:', error);
        } finally {
            setIsLoading(false);
        }
    }, [api]);

    useEffect(() => {
        loadUserInfo();
    }, [loadUserInfo]);

    const navigateToDashboard = useCallback(() => {
        if (dashboardRoute !== '/dashboard') {
            window.location.href = dashboardRoute;
        }
    }, [dashboardRoute]);

    const getBackToDashboardUrl = useCallback(() => {
        return dashboardRoute;
    }, [dashboardRoute]);

    return {
        dashboardRoute,
        userType,
        navigateToDashboard,
        getBackToDashboardUrl,
        isLoading
    };
};