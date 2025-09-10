# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `npm run dev` - Start development server on localhost:3000
- `npm run build` - Build production application
- `npm start` - Start production server
- `npm run lint` - Run ESLint for code quality

### Environment Setup
1. Install dependencies: `npm install`
2. For local development:
   - Copy environment template: `copy .env.local.template .env.local`
   - Configure API keys and environment variables in `.env.local`
3. **Production Environment**: Environment variables are managed on:
   - **Frontend (Vercel)**: All frontend environment variables configured in Vercel dashboard
   - **Backend (Railway)**: All backend environment variables configured in Railway dashboard

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript with strict typing
- **UI Components**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand for global state + React Query for server state
- **Authentication**: NextAuth.js with JWT tokens
- **Forms**: React Hook Form with Zod validation
- **Animation**: Framer Motion

### Key Architecture Patterns

#### App Router Structure
- `src/app/` contains all pages using Next.js 14 App Router
- Pages are organized by feature (dashboard, campaigns, admin)
- Layout files control sidebar visibility based on route patterns
- Dynamic routing prevents static generation (see middleware.ts)

#### Component Organization
- `src/components/ui/` - Base UI components (buttons, inputs, cards)
- `src/components/dashboards/` - Dashboard-specific components with role-based variants
- `src/components/campaigns/` - Campaign management components
- `src/components/intelligence/` - AI analysis and content generation
- `src/components/layout/` - Layout components with conditional sidebar logic

#### API Integration
- `src/lib/api.ts` - Centralized API client with robust error handling
- Backend URL: `https://campaign-backend-production-e2db.up.railway.app`
- Handles multiple response formats (StandardResponse, LegacyResponse, plain JSON)
- Built-in retry logic and authentication token management

#### State Management Architecture
- Zustand stores in `src/lib/stores/` for campaign and intelligence data
- React Query for server state caching and synchronization
- Local storage for auth tokens and user preferences

### User Type System
The application supports multiple user types (affiliate, business, creator) with:
- Dynamic sidebar navigation based on user type
- Role-based dashboard customization
- Conditional feature access and UI elements

### Campaign Workflow
2-step streamlined workflow:
1. **Analysis**: Auto-analyze sales pages/URLs for intelligence
2. **Content Generation**: Generate marketing content from analyzed intelligence

Key workflow components:
- Auto-analysis with confidence scoring
- Intelligence extraction and processing
- Content generation with performance predictions
- Enhanced email generation with AI learning system

### API Response Handling
The API client handles three response formats:
- **StandardResponse**: `{success: boolean, data: T, message?: string}`
- **LegacyResponse**: Direct content objects
- **Plain JSON**: Raw response objects

Always use the centralized error handling and response transformation in `src/lib/api.ts`.

### Demo System
Built-in demo campaign system for user onboarding:
- Toggle visibility based on user preference
- Smart defaults for new vs experienced users
- Separate demo and real campaign management

## Important Implementation Notes

### Authentication
- Tokens stored in localStorage as `access_token` and `authToken`
- Auto-redirect to login on 401 responses
- NextAuth.js integration for session management

### Routing & Navigation
- Hide sidebar on auth pages and campaign creation flows
- Show sidebar for all dashboard routes (`/dashboard/*`)
- UserTypeSidebar adapts to user role and preferences

### Content Generation
Always use the robust content generation handler that supports multiple backend response formats. The system handles both legacy and standardized API responses automatically.

### Error Handling
Use the built-in ApiError and CreditError classes for consistent error handling across the application. The API client automatically handles authentication errors and credit limit exceeded scenarios.

## Testing & Quality
- ESLint configuration for Next.js and TypeScript
- Strict TypeScript configuration with proper type definitions
- Component props properly typed with TypeScript interfaces
- Form validation using Zod schemas