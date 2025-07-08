# RodgersDigital Application Sitemap

*Generated: December 2024*

## Frontend Structure

### Authentication Pages
- `/login` - User login
- `/register` - User registration
- `/` - Landing page / Root

### Dashboard Pages
- `/dashboard` - Main dashboard
- `/dashboard/analytics` - Analytics overview
- `/dashboard/campaigns` - Campaign management
- `/dashboard/content-library` - Content library
- `/dashboard/settings` - User/company settings

### Campaign Management
- `/campaigns` - Campaign list/overview
- `/campaigns/[id]` - Campaign detail page
- `/campaigns/[id]/inputs` - Input sources (Step 2)
- `/campaigns/[id]/analysis` - AI analysis (Step 3)
- `/campaigns/[id]/generate` - Content generation (Step 4)
- `/campaigns/[id]/settings` - Campaign settings

### Admin Panel
- `/admin` - Admin dashboard (admin users only)

---

## Backend API Structure

### Authentication Endpoints
```
POST /api/auth/register - User registration
POST /api/auth/login - User login (JSON)
POST /api/auth/token - OAuth2 token login
GET /api/auth/profile - Get user profile
```

### Campaign Management
```
GET /api/campaigns - List campaigns
POST /api/campaigns - Create campaign
GET /api/campaigns/{id} - Get specific campaign
PUT /api/campaigns/{id} - Update campaign
DELETE /api/campaigns/{id} - Delete campaign
GET /api/campaigns/stats/overview - Campaign statistics
GET /api/campaigns/dashboard/stats - Dashboard stats
```

### Campaign Workflow
```
GET /api/campaigns/{id}/workflow-state - Get workflow status
POST /api/campaigns/{id}/workflow/set-preference - Set workflow mode
POST /api/campaigns/{id}/workflow/save-progress - Auto-save progress
GET /api/campaigns/{id}/workflow - Get workflow summary
GET /api/campaigns/{id}/intelligence - Get campaign intelligence
```

### Intelligence & Analysis
```
POST /api/intelligence/analyze-url - Analyze competitor URLs
POST /api/intelligence/upload-document - Upload and analyze documents
POST /api/intelligence/generate-content - Generate marketing content
GET /api/intelligence/campaign/{id}/intelligence - Get all intelligence
POST /api/intelligence/analyze-sales-page-enhanced - Enhanced analysis
POST /api/intelligence/vsl-analysis - Video Sales Letter analysis
POST /api/intelligence/generate-campaign-angles - Generate campaign angles
POST /api/intelligence/consolidate/{id} - Consolidate intelligence
POST /api/intelligence/batch-analyze - Batch competitor analysis
POST /api/intelligence/validate-url - URL validation
```

### Dashboard & Company
```
GET /api/dashboard/stats - Company dashboard statistics
GET /api/dashboard/company - Company details
```

### Admin Management (Admin Only)
```
GET /api/admin/stats - Platform statistics
GET /api/admin/users - List all users
GET /api/admin/companies - List all companies
GET /api/admin/users/{id} - Get user details
PUT /api/admin/users/{id} - Update user
PUT /api/admin/users/{id}/role - Update user role
PUT /api/admin/companies/{id}/subscription - Update subscription
DELETE /api/admin/users/{id} - Delete user
POST /api/admin/users/{id}/impersonate - Impersonate user
GET /api/admin/companies/{id} - Get company details
PUT /api/admin/companies/{id} - Update company details
GET /api/admin/roles - Get available roles
```

### System Endpoints
```
GET /health - Health check
GET / - Root endpoint
GET /docs - API documentation (Swagger UI)
```

---

## Database Schema Overview

### Core Tables
- `users` - User accounts
- `companies` - Company/organization data
- `campaigns` - Marketing campaigns
- `campaign_assets` - Campaign files/assets
- `campaign_intelligence` - AI analysis results
- `generated_content` - AI-generated content
- `smart_urls` - Tracking URLs
- `company_memberships` - User-company relationships
- `company_invitations` - Pending invitations

### Key Relationships
- Users belong to Companies
- Campaigns belong to Companies and Users
- Intelligence Sources belong to Campaigns
- Generated Content belongs to Campaigns and Intelligence Sources
- Smart URLs belong to Campaigns and Generated Content

---

## User Journey Flow

### New User Flow
1. `/register` - Sign up
2. `/dashboard` - Welcome dashboard
3. `/campaigns` - Campaign overview
4. `/campaigns/[id]` - Campaign workflow (Steps 1-4)

### Campaign Creation Workflow
1. **Step 1**: Basic setup (`/campaigns/[id]`)
2. **Step 2**: Add sources (`/campaigns/[id]/inputs`)
3. **Step 3**: AI analysis (`/campaigns/[id]/analysis`)
4. **Step 4**: Generate content (`/campaigns/[id]/generate`)

### Admin User Flow
1. `/login` - Admin login
2. `/admin` - Admin dashboard
3. Platform management (users, companies, stats)
4. `/campaigns` - Switch to campaign management

---

## File Structure Reference

### Frontend Components
```
/src/app/ - Next.js pages
/src/components/ - Reusable React components
/src/lib/ - Utilities and API client
/src/types/ - TypeScript type definitions
```

### Backend Structure
```
/src/auth/ - Authentication logic
/src/campaigns/ - Campaign management
/src/intelligence/ - AI analysis services
/src/dashboard/ - Dashboard endpoints
/src/admin/ - Admin functionality
/src/models/ - Database models
/src/core/ - Core utilities (database, security)
```

---

## Key Features

### Campaign Intelligence
- Competitor URL analysis
- Document upload and analysis
- Video Sales Letter (VSL) detection
- Multi-source intelligence consolidation
- Campaign angle generation

### Content Generation
- Email sequences
- Social media posts
- Ad copy
- Blog posts
- Landing pages
- Video scripts

### Admin Features
- User management
- Company management
- Subscription management
- Platform analytics
- Role management
- User impersonation

### Workflow Modes
- **Quick Mode**: Rush through steps
- **Methodical Mode**: Detailed guidance
- **Flexible Mode**: Mix of both approaches

---

*This sitemap reflects the current application structure as of December 2024.*