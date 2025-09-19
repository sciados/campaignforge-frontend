// src/lib/user-type-utils.ts
/**
 * Utility functions for user type management
 * 🛠️ Helper functions for user type operations
 */

export type UserType = 'affiliate_marketer' | 'content_creator' | 'business_owner' | 'product_creator';

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
        affiliate_marketer: '/dashboard/affiliate',
        content_creator: '/dashboard/creator',
        business_owner: '/dashboard/business',
        product_creator: '/dashboard/product-creator'
    };

    return routes[userType] || '/dashboard';
};

export const getUserTypeDisplayName = (userType: UserType | null): string => {
    if (!userType) return 'User';

    const displayNames = {
        affiliate_marketer: '💰 Affiliate Marketer',
        content_creator: '🎬 Content Creator',
        business_owner: '🏢 Business Owner',
        product_creator: '🎯 Product Creator'
    };

    return displayNames[userType] || 'User';
};

export const getUserTypeThemeColor = (userType: UserType | null): string => {
    if (!userType) return 'blue';

    const themeColors = {
        affiliate_marketer: 'green',
        content_creator: 'purple',
        business_owner: 'blue',
        product_creator: 'emerald'
    };

    return themeColors[userType] || 'blue';
};

export const checkUserTypeAccess = (userType: UserType | null, requiredType: UserType): boolean => {
    return userType === requiredType;
};

export const getUserTypeFeatures = (userType: UserType | null): string[] => {
    if (!userType) return [];

    const features = {
        affiliate_marketer: [
            'competitor_tracking', 'commission_analysis', 'compliance_check',
            'ad_creative_generator', 'email_sequences', 'traffic_analysis'
        ],
        content_creator: [
            'viral_analysis', 'trend_detection', 'content_optimization',
            'audience_insights', 'brand_partnerships', 'cross_platform'
        ],
        business_owner: [
            'market_research', 'lead_generation', 'competitor_analysis',
            'customer_insights', 'sales_optimization', 'roi_tracking'
        ],
        product_creator: [
            'url_submission', 'content_library', 'marketing_intelligence',
            'affiliate_distribution', 'submission_tracking', 'quota_management'
        ]
    };

    return features[userType] || [];
};

export const getUserTypeLimits = (userType: UserType | null, tier: string = 'free') => {
    const baseLimits = {
        affiliate_marketer: { campaigns: 10, analysis: 25 },
        content_creator: { campaigns: 15, analysis: 20 },
        business_owner: { campaigns: 8, analysis: 15 },
        product_creator: { campaigns: 50, analysis: 5000 }
    };

    const base = baseLimits[userType || 'business_owner'];

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