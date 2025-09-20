# CampaignForge URL Shortener API Specification
## RESTful API Documentation v1.0

---

## 📋 **API Overview**

### **Base URL**
```
Production: https://api.campaignforge.ai/v1
Development: https://api-dev.campaignforge.ai/v1
Local: http://localhost:8000/v1
```

### **Authentication**
```typescript
// All requests require Bearer token authentication
Headers: {
  "Authorization": "Bearer {jwt_token}",
  "Content-Type": "application/json",
  "User-Agent": "CampaignForge-Client/1.0"
}
```

### **Rate Limiting**
```
Rate Limits by Plan:
├─ Free: 100 requests/hour
├─ Starter: 1,000 requests/hour
├─ Professional: 10,000 requests/hour
├─ Business: 50,000 requests/hour
└─ Enterprise: Unlimited

Headers Returned:
├─ X-RateLimit-Limit: 1000
├─ X-RateLimit-Remaining: 999
├─ X-RateLimit-Reset: 1640995200
└─ X-RateLimit-Window: 3600
```

---

## 🔗 **Link Management Endpoints**

### **Create Shortened Link**

#### **POST /links**

```typescript
interface CreateLinkRequest {
  // Required
  originalUrl: string;           // The URL to shorten

  // Optional metadata
  title?: string;                // Human-readable title
  description?: string;          // Description for preview pages
  tags?: string[];              // Organizational tags

  // Campaign tracking
  campaignId?: string;          // Associate with campaign
  medium?: string;              // youtube, instagram, email, etc.
  source?: string;              // organic, paid, social, etc.
  content?: string;             // ad variation, post type, etc.

  // UTM parameters (auto-appended to destination)
  utmSource?: string;           // utm_source
  utmMedium?: string;           // utm_medium
  utmCampaign?: string;         // utm_campaign
  utmTerm?: string;             // utm_term
  utmContent?: string;          // utm_content

  // Customization
  customCode?: string;          // Custom short code (if available)
  expiresAt?: string;           // ISO 8601 expiration date
  passwordProtected?: boolean;   // Require password to access
  password?: string;            // Password for protected links

  // Behavior settings
  enablePreview?: boolean;      // Show preview page before redirect
  enableAnalytics?: boolean;    // Track clicks and analytics
  allowDuplicates?: boolean;    // Allow multiple shorts for same URL
}

interface CreateLinkResponse {
  success: boolean;
  data: {
    id: string;                 // Unique link ID
    shortCode: string;          // Generated short code (e.g., "abc123")
    shortUrl: string;           // Full short URL (e.g., "https://cf.ly/abc123")
    originalUrl: string;        // The destination URL
    previewUrl: string;         // Link to preview page
    qrCode: string;            // Base64 encoded QR code image

    // Metadata
    title?: string;
    description?: string;
    tags: string[];

    // Campaign info
    campaignId?: string;
    medium?: string;
    source?: string;

    // Settings
    expiresAt?: string;
    isPasswordProtected: boolean;
    analyticsEnabled: boolean;

    // Timestamps
    createdAt: string;          // ISO 8601 timestamp
    updatedAt: string;
  };
  message?: string;
}

// Example Request
POST /links
{
  "originalUrl": "https://example.com/product/awesome-tool",
  "title": "Awesome Marketing Tool",
  "description": "Revolutionary AI-powered marketing automation tool",
  "campaignId": "camp_123456",
  "medium": "youtube",
  "source": "organic",
  "utmSource": "youtube",
  "utmMedium": "video",
  "utmCampaign": "product_launch_2024",
  "customCode": "awesome-tool",
  "enableAnalytics": true
}

// Example Response
{
  "success": true,
  "data": {
    "id": "link_7f8g9h0i",
    "shortCode": "awesome-tool",
    "shortUrl": "https://cf.ly/awesome-tool",
    "originalUrl": "https://example.com/product/awesome-tool?utm_source=youtube&utm_medium=video&utm_campaign=product_launch_2024",
    "previewUrl": "https://cf.ly/awesome-tool+",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "title": "Awesome Marketing Tool",
    "description": "Revolutionary AI-powered marketing automation tool",
    "tags": [],
    "campaignId": "camp_123456",
    "medium": "youtube",
    "source": "organic",
    "expiresAt": null,
    "isPasswordProtected": false,
    "analyticsEnabled": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### **Get Link Details**

#### **GET /links/{linkId}**

```typescript
interface GetLinkResponse {
  success: boolean;
  data: {
    // Basic info
    id: string;
    shortCode: string;
    shortUrl: string;
    originalUrl: string;
    title?: string;
    description?: string;
    tags: string[];

    // Campaign tracking
    campaignId?: string;
    medium?: string;
    source?: string;
    content?: string;

    // Settings
    expiresAt?: string;
    isPasswordProtected: boolean;
    analyticsEnabled: boolean;
    isActive: boolean;

    // Performance summary
    performance: {
      totalClicks: number;
      uniqueClicks: number;
      clicksToday: number;
      clicksThisWeek: number;
      clicksThisMonth: number;
      lastClickedAt?: string;
    };

    // Timestamps
    createdAt: string;
    updatedAt: string;
  };
}
```

### **Update Link**

#### **PUT /links/{linkId}**

```typescript
interface UpdateLinkRequest {
  // Updatable fields
  title?: string;
  description?: string;
  tags?: string[];
  originalUrl?: string;        // Change destination
  expiresAt?: string;         // Update expiration
  isActive?: boolean;         // Enable/disable link
  password?: string;          // Update password
}

interface UpdateLinkResponse {
  success: boolean;
  data: {
    // Returns updated link object (same as GetLinkResponse)
  };
  message?: string;
}
```

### **Delete Link**

#### **DELETE /links/{linkId}**

```typescript
interface DeleteLinkResponse {
  success: boolean;
  message: string;
  data: {
    deletedAt: string;
    backupId?: string;        // For potential recovery
  };
}
```

### **List User Links**

#### **GET /links**

```typescript
interface ListLinksQuery {
  // Pagination
  page?: number;              // Page number (default: 1)
  limit?: number;             // Items per page (default: 20, max: 100)

  // Filtering
  campaignId?: string;        // Filter by campaign
  medium?: string;            // Filter by medium
  source?: string;            // Filter by source
  tags?: string[];            // Filter by tags
  isActive?: boolean;         // Filter by active status

  // Date filtering
  createdAfter?: string;      // ISO 8601 date
  createdBefore?: string;     // ISO 8601 date

  // Sorting
  sortBy?: 'created' | 'updated' | 'clicks' | 'title';
  sortOrder?: 'asc' | 'desc';

  // Search
  search?: string;            // Search in title, description, tags
}

interface ListLinksResponse {
  success: boolean;
  data: {
    links: Array<{
      // Same structure as GetLinkResponse.data
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    filters: {
      // Applied filters for reference
    };
  };
}
```

---

## 📊 **Analytics Endpoints**

### **Get Link Analytics**

#### **GET /links/{linkId}/analytics**

```typescript
interface LinkAnalyticsQuery {
  // Time range
  startDate?: string;         // ISO 8601 date (default: 30 days ago)
  endDate?: string;           // ISO 8601 date (default: now)
  timezone?: string;          // Timezone for date grouping (default: UTC)

  // Granularity
  groupBy?: 'hour' | 'day' | 'week' | 'month';

  // Filters
  country?: string;           // Filter by country code
  device?: string;            // Filter by device type
  browser?: string;           // Filter by browser
  referer?: string;           // Filter by referring domain
}

interface LinkAnalyticsResponse {
  success: boolean;
  data: {
    // Summary metrics
    summary: {
      totalClicks: number;
      uniqueClicks: number;
      uniqueVisitors: number;
      averageClicksPerDay: number;
      peakDay: {
        date: string;
        clicks: number;
      };

      // Conversion tracking (if enabled)
      conversions: number;
      conversionRate: number;
      revenue: number;
      averageOrderValue: number;
    };

    // Time series data
    timeline: Array<{
      timestamp: string;        // ISO 8601 timestamp
      clicks: number;
      uniqueClicks: number;
      conversions: number;
      revenue: number;
    }>;

    // Geographic breakdown
    geography: Array<{
      country: string;          // ISO country code
      countryName: string;      // Full country name
      clicks: number;
      percentage: number;

      // Regions within country (top 5)
      regions: Array<{
        region: string;
        clicks: number;
        percentage: number;
      }>;
    }>;

    // Device breakdown
    devices: Array<{
      type: string;             // mobile, desktop, tablet
      clicks: number;
      percentage: number;

      // Operating systems for this device type
      operatingSystems: Array<{
        os: string;
        version: string;
        clicks: number;
        percentage: number;
      }>;
    }>;

    // Browser breakdown
    browsers: Array<{
      browser: string;
      version: string;
      clicks: number;
      percentage: number;
    }>;

    // Referrer breakdown
    referrers: Array<{
      domain: string;
      clicks: number;
      percentage: number;
      type: 'direct' | 'social' | 'search' | 'email' | 'other';
    }>;

    // UTM tracking (if applicable)
    utmBreakdown: {
      sources: Array<{ source: string; clicks: number; }>;
      mediums: Array<{ medium: string; clicks: number; }>;
      campaigns: Array<{ campaign: string; clicks: number; }>;
      terms: Array<{ term: string; clicks: number; }>;
      contents: Array<{ content: string; clicks: number; }>;
    };
  };
}
```

### **Get Bulk Analytics**

#### **POST /analytics/bulk**

```typescript
interface BulkAnalyticsRequest {
  linkIds: string[];          // Array of link IDs to analyze
  startDate?: string;         // Date range for analysis
  endDate?: string;
  metrics: Array<'clicks' | 'conversions' | 'revenue' | 'geography' | 'devices'>;
}

interface BulkAnalyticsResponse {
  success: boolean;
  data: Array<{
    linkId: string;
    analytics: {
      // Same structure as LinkAnalyticsResponse.data
      // but filtered to requested metrics
    };
  }>;
}
```

---

## 🎯 **Campaign Management Endpoints**

### **Create Campaign**

#### **POST /campaigns**

```typescript
interface CreateCampaignRequest {
  name: string;
  description?: string;
  type: 'product_promotion' | 'lead_generation' | 'brand_awareness' | 'content_marketing';

  // Goals and targets
  goals?: {
    targetClicks?: number;
    targetConversions?: number;
    targetRevenue?: number;
    targetROI?: number;
  };

  // Budget and dates
  budget?: number;
  currency?: string;          // ISO 4217 currency code
  startDate?: string;         // ISO 8601 date
  endDate?: string;           // ISO 8601 date

  // Default UTM parameters for campaign links
  defaultUtmSource?: string;
  defaultUtmMedium?: string;
  defaultUtmCampaign?: string;

  // Settings
  enableAutoOptimization?: boolean;
  enableReporting?: boolean;
  tags?: string[];
}

interface CreateCampaignResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    description?: string;
    type: string;
    status: 'draft' | 'active' | 'paused' | 'completed';

    // Goals
    goals: {
      targetClicks?: number;
      targetConversions?: number;
      targetRevenue?: number;
      targetROI?: number;
    };

    // Budget and dates
    budget?: number;
    currency: string;
    startDate?: string;
    endDate?: string;

    // UTM defaults
    defaultUtmSource?: string;
    defaultUtmMedium?: string;
    defaultUtmCampaign?: string;

    // Performance summary
    performance: {
      totalLinks: number;
      totalClicks: number;
      totalConversions: number;
      totalRevenue: number;
      roi: number;
    };

    // Settings
    enableAutoOptimization: boolean;
    enableReporting: boolean;
    tags: string[];

    // Timestamps
    createdAt: string;
    updatedAt: string;
  };
}
```

### **Get Campaign Analytics**

#### **GET /campaigns/{campaignId}/analytics**

```typescript
interface CampaignAnalyticsResponse {
  success: boolean;
  data: {
    campaign: {
      id: string;
      name: string;
      type: string;
      status: string;
      startDate?: string;
      endDate?: string;
    };

    // Performance overview
    performance: {
      totalLinks: number;
      totalClicks: number;
      uniqueVisitors: number;
      conversions: number;
      conversionRate: number;
      revenue: number;
      roi: number;
      averageCPC: number;        // Cost per click
      averageCPA: number;        // Cost per acquisition
    };

    // Goal progress
    goalProgress: {
      clicksProgress: number;    // Percentage towards goal
      conversionsProgress: number;
      revenueProgress: number;
      roiProgress: number;
    };

    // Top performing links
    topLinks: Array<{
      id: string;
      shortCode: string;
      title: string;
      clicks: number;
      conversions: number;
      revenue: number;
      performance: 'excellent' | 'good' | 'average' | 'poor';
    }>;

    // Performance by medium
    mediumBreakdown: Array<{
      medium: string;
      clicks: number;
      conversions: number;
      revenue: number;
      roi: number;
    }>;

    // Time series performance
    timeline: Array<{
      date: string;
      clicks: number;
      conversions: number;
      revenue: number;
      spend: number;
    }>;

    // Optimization recommendations
    recommendations: Array<{
      type: 'improve_ctr' | 'optimize_timing' | 'adjust_targeting' | 'increase_budget';
      priority: 'high' | 'medium' | 'low';
      description: string;
      expectedImpact: string;
      effort: 'low' | 'medium' | 'high';
    }>;
  };
}
```

---

## 🔍 **Link Resolution & Redirect**

### **Link Resolution**

#### **GET /{shortCode}**

```typescript
// This is the actual redirect endpoint
// Handles the shortened URL resolution and redirect

Query Parameters:
- preview=true          // Show preview page instead of redirect
- password=string       // Password for protected links
- utm_*=string         // Additional UTM parameters

Response Behaviors:
├─ 302 Redirect (normal operation)
├─ 200 HTML (preview page)
├─ 401 Unauthorized (password required)
├─ 404 Not Found (invalid/expired link)
├─ 410 Gone (deleted link)
└─ 429 Too Many Requests (rate limited)

Headers Set:
├─ Location: {originalUrl} (for redirects)
├─ Cache-Control: no-cache, no-store
├─ X-CF-Link-ID: {linkId}
└─ X-CF-Campaign-ID: {campaignId}
```

### **Preview Page Data**

#### **GET /api/preview/{shortCode}**

```typescript
interface PreviewDataResponse {
  success: boolean;
  data: {
    link: {
      shortCode: string;
      shortUrl: string;
      originalUrl: string;
      title?: string;
      description?: string;
      isPasswordProtected: boolean;
      expiresAt?: string;
    };

    // Open Graph data from destination
    openGraph: {
      title?: string;
      description?: string;
      image?: string;
      siteName?: string;
      type?: string;
    };

    // Safety information
    safety: {
      isSecure: boolean;        // HTTPS check
      isSafe: boolean;          // Malware/phishing check
      riskLevel: 'low' | 'medium' | 'high';
      warnings: string[];
    };

    // Performance hint
    performance: {
      totalClicks: number;
      clicksToday: number;
      trending: boolean;
    };
  };
}
```

---

## 📈 **Conversion Tracking**

### **Record Conversion**

#### **POST /conversions**

```typescript
interface RecordConversionRequest {
  // Link identification
  shortCode?: string;         // Either shortCode or linkId required
  linkId?: string;
  clickId?: string;           // If available from click tracking

  // Conversion details
  conversionType: 'sale' | 'lead' | 'signup' | 'download' | 'custom';
  conversionValue: number;    // Monetary value
  currency: string;           // ISO 4217 currency code

  // Attribution
  attributionWindow?: number; // Hours (default: 30 days)

  // Additional data
  orderId?: string;           // External order/transaction ID
  customData?: Record<string, any>; // Additional conversion data

  // User identification (for deduplication)
  userId?: string;
  email?: string;
  sessionId?: string;
}

interface RecordConversionResponse {
  success: boolean;
  data: {
    conversionId: string;
    linkId: string;
    clickId?: string;
    conversionType: string;
    conversionValue: number;
    currency: string;
    attributedAt: string;
    conversionWindow: number;

    // Attribution information
    attribution: {
      isAttributed: boolean;
      attributionConfidence: number; // 0-1 score
      touchpoints: Array<{
        timestamp: string;
        medium: string;
        source: string;
      }>;
    };
  };
  message?: string;
}
```

---

## 🚨 **Error Handling**

### **Standard Error Response**

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;               // Machine-readable error code
    message: string;            // Human-readable error message
    details?: any;              // Additional error context
    timestamp: string;          // ISO 8601 timestamp
    requestId: string;          // Unique request identifier for support
  };

  // Field-specific validation errors
  validation?: Array<{
    field: string;
    code: string;
    message: string;
    value?: any;
  }>;
}
```

### **Common Error Codes**

```typescript
enum ErrorCodes {
  // Authentication & Authorization
  UNAUTHORIZED = 'auth_unauthorized',
  FORBIDDEN = 'auth_forbidden',
  TOKEN_EXPIRED = 'auth_token_expired',
  INVALID_TOKEN = 'auth_invalid_token',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  QUOTA_EXCEEDED = 'quota_exceeded',

  // Validation
  INVALID_URL = 'validation_invalid_url',
  INVALID_DATE = 'validation_invalid_date',
  REQUIRED_FIELD = 'validation_required_field',
  FIELD_TOO_LONG = 'validation_field_too_long',

  // Resource Errors
  LINK_NOT_FOUND = 'resource_link_not_found',
  CAMPAIGN_NOT_FOUND = 'resource_campaign_not_found',
  SHORTCODE_TAKEN = 'resource_shortcode_taken',
  SHORTCODE_INVALID = 'resource_shortcode_invalid',

  // Business Logic
  LINK_EXPIRED = 'business_link_expired',
  LINK_DISABLED = 'business_link_disabled',
  PASSWORD_REQUIRED = 'business_password_required',
  INVALID_PASSWORD = 'business_invalid_password',

  // System Errors
  INTERNAL_ERROR = 'system_internal_error',
  SERVICE_UNAVAILABLE = 'system_service_unavailable',
  DATABASE_ERROR = 'system_database_error'
}
```

---

## 🔧 **SDK & Integration Examples**

### **JavaScript/TypeScript SDK**

```typescript
// Example usage of CampaignForge SDK
import { CampaignForgeClient } from '@campaignforge/sdk';

const client = new CampaignForgeClient({
  apiKey: 'your_api_key_here',
  baseUrl: 'https://api.campaignforge.ai/v1'
});

// Create a shortened link
const link = await client.links.create({
  originalUrl: 'https://example.com/product',
  title: 'My Product',
  campaignId: 'camp_123',
  medium: 'email',
  utmSource: 'newsletter',
  utmMedium: 'email',
  utmCampaign: 'weekly_newsletter'
});

console.log(`Shortened URL: ${link.shortUrl}`);

// Get analytics
const analytics = await client.links.getAnalytics(link.id, {
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});

console.log(`Total clicks: ${analytics.summary.totalClicks}`);
```

### **Webhook Integration**

```typescript
// Webhook payload for real-time events
interface WebhookPayload {
  eventType: 'link.clicked' | 'link.converted' | 'campaign.goal_reached';
  timestamp: string;
  data: {
    // Event-specific data
  };
  signature: string;          // HMAC signature for verification
}

// Example webhook handler
app.post('/webhooks/campaignforge', (req, res) => {
  const payload = req.body as WebhookPayload;

  // Verify webhook signature
  const isValid = verifyWebhookSignature(
    payload,
    req.headers['x-cf-signature'],
    process.env.WEBHOOK_SECRET
  );

  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }

  switch (payload.eventType) {
    case 'link.clicked':
      // Handle link click event
      break;
    case 'link.converted':
      // Handle conversion event
      break;
    // ... other events
  }

  res.status(200).send('OK');
});
```

---

*API Version: 1.0*
*Last Updated: January 2025*
*Documentation Team: CampaignForge Engineering*