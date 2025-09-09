// src/lib/config.ts
/**
 * Centralized configuration for CampaignForge
 * Environment variables are set on Vercel/Railway for security
 * Fallbacks provided for development
 */

export const config = {
    // API Configuration
    api: {
        baseUrl: process.env.NEXT_PUBLIC_API_URL ||
            "https://campaign-backend-production-e2db.up.railway.app",
        timeout: 30000, // 30 seconds
        retries: 3,
    },

    // App Configuration
    app: {
        name: "CampaignForge",
        version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
        environment: process.env.NODE_ENV || "development",
    },

    // Feature Flags (can be hardcoded for now)
    features: {
        enhancedEmailGeneration: true,
        aiProviderOptimization: true,
        fileStorageEnabled: true,
        demoModeEnabled: true,
        adminPanelEnabled: true,
    },

    // UI Configuration
    ui: {
        defaultPagination: 20,
        maxFileSize: 50 * 1024 * 1024, // 50MB
        supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
        supportedDocumentTypes: ['application/pdf', 'application/msword', 'text/plain'],
    },

    // Storage Configuration
    storage: {
        maxQuotaMB: 1000, // Default quota
        cleanupIntervalDays: 30,
        tierLimits: {
            free: 100,
            pro: 1000,
            enterprise: 10000,
        },
    },

    // Content Generation Limits
    generation: {
        maxCampaignsPerUser: {
            free: 10,
            pro: 100,
            enterprise: -1, // unlimited
        },
        maxContentPerCampaign: 50,
        estimatedTimes: {
            email: 60,
            social_post: 45,
            blog_post: 90,
            ad_copy: 30,
        },
    },
} as const;

// Type for configuration
export type Config = typeof config;

// Helper function to check if we're in development
export const isDevelopment = config.app.environment === 'development';
export const isProduction = config.app.environment === 'production';

// Helper function to get API URL with endpoint
export const getApiUrl = (endpoint: string = ''): string => {
    const baseUrl = config.api.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    const cleanEndpoint = endpoint.replace(/^\//, ''); // Remove leading slash
    return cleanEndpoint ? `${baseUrl}/${cleanEndpoint}` : baseUrl;
};

// Helper function for feature flags
export const isFeatureEnabled = (feature: keyof typeof config.features): boolean => {
    return config.features[feature];
};

// Helper function to get user tier limits
export const getTierLimit = (tier: 'free' | 'pro' | 'enterprise', type: 'campaigns' | 'storage'): number => {
    switch (type) {
        case 'campaigns':
            return config.generation.maxCampaignsPerUser[tier];
        case 'storage':
            return config.storage.tierLimits[tier];
        default:
            return 0;
    }
};