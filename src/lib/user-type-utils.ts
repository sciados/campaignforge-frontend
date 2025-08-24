// src/lib/user-type-utils.ts
/**
 * Utility functions for user type management
 * 🛠️ Helper functions for user type operations
 */

export type UserType = 'affiliate_marketer' | 'content_creator' | 'business_owner';

export interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    user_type: UserType | null;
    user_type_display: string;
    user_tier: string;
    onboarding_status: string;
    dashboard_route: string;
    onboarding_completed: boolean;
}

export const getUserDashboardRoute = (userType: UserType | null): string => {
    if (!userType) return '/user-selection';

    const routes = {
        affiliate_marketer: '/dashboard/affiliate',
        content_creator: '/dashboard/creator',
        business_owner: '/dashboard/business'
    };

    return routes[userType] || '/dashboard';
};

export const getUserTypeDisplayName = (userType: UserType | null): string => {
    if (!userType) return 'User';

    const displayNames = {
        affiliate_marketer: '💰 Affiliate Marketer',
        content_creator: '🎬 Content Creator',
        business_owner: '🏢 Business Owner'
    };

    return displayNames[userType] || 'User';
};

export const getUserTypeThemeColor = (userType: UserType | null): string => {
    if (!userType) return 'blue';

    const themeColors = {
        affiliate_marketer: 'green',
        content_creator: 'purple',
        business_owner: 'blue'
    };

    return themeColors[userType] || 'blue';
};

export const checkUserTypeAccess = (userType: UserType | null, requiredType: UserType): boolean => {
    return userType === requiredType;
};