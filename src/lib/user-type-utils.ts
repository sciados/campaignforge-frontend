// src/lib/user-type-utils.ts
/**
 * Utility functions for user type management
 * 🛠️ Helper functions for user type operations
 */

export type UserType = 'AFFILIATE_MARKETER' | 'CONTENT_CREATOR' | 'BUSINESS_OWNER';

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
    available_features: string[];
    usage_summary: {
        campaigns: {
            used: number;
            limit: number;
            available: number;
            percentage: number;
        };
        analysis: {
            used: number;
            limit: number;
            available: number;
            percentage: number;
        };
    };
    user_goals: string[];
    experience_level: string;
}

export const getUserDashboardRoute = (userType: UserType | null): string => {
    if (!userType) return '/user-selection';

    const routes = {
        AFFILIATE_MARKETER: '/dashboard/affiliate',
        CONTENT_CREATOR: '/dashboard/creator',
        BUSINESS_OWNER: '/dashboard/business'
    };

    return routes[userType] || '/dashboard';
};

export const getUserTypeDisplayName = (userType: UserType | null): string => {
    if (!userType) return 'User';

    const displayNames = {
        AFFILIATE_MARKETER: '💰 Affiliate Marketer',
        CONTENT_CREATOR: '🎬 Content Creator',
        BUSINESS_OWNER: '🏢 Business Owner'
    };

    return displayNames[userType] || 'User';
};

export const getUserTypeThemeColor = (userType: UserType | null): string => {
    if (!userType) return 'blue';

    const themeColors = {
        AFFILIATE_MARKETER: 'green',
        CONTENT_CREATOR: 'purple',
        BUSINESS_OWNER: 'blue'
    };

    return themeColors[userType] || 'blue';
};

export const checkUserTypeAccess = (userType: UserType | null, requiredType: UserType): boolean => {
    return userType === requiredType;
};

export const getUserTypeFeatures = (userType: UserType | null): string[] => {
    if (!userType) return [];

    const features = {
        AFFILIATE_MARKETER: [
            'competitor_tracking', 'commission_analysis', 'compliance_check',
            'ad_creative_generator', 'email_sequences', 'traffic_analysis'
        ],
        CONTENT_CREATOR: [
            'viral_analysis', 'trend_detection', 'content_optimization',
            'audience_insights', 'brand_partnerships', 'cross_platform'
        ],
        BUSINESS_OWNER: [
            'market_research', 'lead_generation', 'competitor_analysis',
            'customer_insights', 'sales_optimization', 'roi_tracking'
        ]
    };

    return features[userType] || [];
};

export const getUserTypeLimits = (userType: UserType | null, tier: string = 'free') => {
    const baseLimits = {
        AFFILIATE_MARKETER: { campaigns: 10, analysis: 25 },
        CONTENT_CREATOR: { campaigns: 15, analysis: 20 },
        BUSINESS_OWNER: { campaigns: 8, analysis: 15 }
    };

    const base = baseLimits[userType || 'BUSINESS_OWNER'];

    // Adjust based on tier
    const multipliers = {
        free: 1,
        starter: 2,
        pro: 5,
        elite: 10
    };

    const multiplier = multipliers[tier as keyof typeof multipliers] || 1;

    return {
        campaigns: base.campaigns * multiplier,
        analysis: base.analysis * multiplier
    };
};