# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with HTTPS support and turbopack (uses .env.dev)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks
- `npm run build:development` - Build with development environment (.env.dev)
- `npm run build:staging` - Build with staging environment (.env.staging)
- `npm run build:production` - Build with production environment (.env.prod)

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Authentication**: NextAuth.js v5 with AWS Cognito
- **State Management**: React Context API for cart and session management
- **Data Fetching**: TanStack Query (React Query) for server state
- **Styling**: Tailwind CSS with shadcn/ui components
- **UI Components**: Radix UI primitives with custom styling
- **Deployment**: AWS infrastructure with Amplify outputs

### Project Structure

```
src/
├── app/
│   ├── (home)/           # Public pages (bundles, landing)
│   ├── (shared)/         # Shared components, contexts, utils
│   ├── customer/         # Protected customer dashboard
│   ├── onboarding/       # User onboarding flow
│   └── api/              # API routes (auth, steam integration)
├── lib/
│   └── api/              # API client and type definitions
└── hooks/
    └── queries/          # React Query hooks
```

### Key Architecture Patterns

**Route Groups**: Uses Next.js route groups `(home)`, `(shared)`, `customer` to organize pages and shared layouts.

**Authentication Flow**: 
- NextAuth.js handles OAuth with AWS Cognito
- JWT tokens are automatically refreshed via custom callbacks
- Protected routes use middleware matching `/customer/:path*`
- ID tokens are managed via context for API authentication

**State Management**:
- Cart state managed via React Context (`CartProvider`)
- Session state via NextAuth SessionProvider
- Server state via TanStack Query hooks in `hooks/queries/`

**API Integration**:
- Client-side API calls use `ClientApi` class with automatic auth headers
- Type-safe API clients in `lib/api/clients/` for different domains
- Centralized error handling with toast notifications

**Component Organization**:
- Feature-based organization under each route group
- Shared UI components in `(shared)/components/ui/` using shadcn/ui
- Business logic components grouped by feature (bundles, cart, dashboard)

### Environment Configuration

The app uses environment-specific builds:
- `.env.dev` - Development environment
- `.env.staging` - Staging environment  
- `.env.prod` - Production environment

Required environment variables are loaded from AWS Amplify outputs and include Cognito configuration.

### Steam Integration

The app includes Steam OpenID integration for gaming features:
- Steam profile connection via `/api/steam/` routes
- Customer dashboard displays Steam status and game keys
- Steam key management in customer portal

### Key Context Providers

1. **CartProvider** - Manages shopping cart state and operations
2. **IdTokenProvider** - Handles JWT token management for API calls
3. **SessionProvider** - NextAuth session management
4. **QueryClientProvider** - TanStack Query configuration

Always check existing patterns in similar components before implementing new features. The codebase follows consistent patterns for API integration, error handling, and component structure.