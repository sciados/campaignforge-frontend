# CampaignForge AI - Frontend

Multimedia Campaign Creation Platform - Next.js Frontend

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
copy .env.local.template .env.local
```

3. Update environment variables with your API keys

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `src/app/` - Next.js 14 App Router pages and API routes
- `src/components/` - Reusable React components
- `src/lib/` - Utilities, API clients, and type definitions
- `src/styles/` - Global styles and Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand + React Query
- **Authentication**: NextAuth.js
- **Forms**: React Hook Form + Zod validation
