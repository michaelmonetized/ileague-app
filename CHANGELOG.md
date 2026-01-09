# Changelog

All notable changes to iLeague will be documented in this file.

## [1.0.1] - 2026-01-09

### Fixed
- Updated Sentry configuration for v10 API compatibility
- Replaced local font with Google Fonts (DM Sans)
- Added Convex generated stubs for initial build
- Pushed environment variables to Vercel project

### Added
- GitHub repository: https://github.com/michaelmonetized/ileague-app
- Vercel project linked: ileague-web

## [1.0.0] - 2026-01-09

### 🎉 Initial Release

#### Platform Features
- Complete monorepo setup with Bun workspaces
- Convex backend with comprehensive schema for users, leagues, posts, subscriptions
- Clerk authentication integration for web and mobile
- Stripe integration for subscriptions and tips
- Resend email integration for transactional emails
- PostHog analytics integration
- Sentry error tracking integration

#### Web Application (Next.js)
- Beautiful, modern landing page with hero, features, testimonials
- User authentication (sign-in, sign-up) with Clerk
- User onboarding flow (role selection, profile setup, interests)
- Dashboard with activity feed and quick stats
- Explore page for discovering creators by category
- Leagues page for browsing and joining leagues
- Notifications center with real-time updates
- Tailwind CSS v4 with custom theme and design system
- Dark mode support
- Responsive design for all screen sizes

#### Mobile Application (Expo/React Native)
- Cross-platform iOS/Android support
- NativeWind (Tailwind CSS) styling
- Authentication screens with Clerk
- Onboarding flow
- Tab navigation (Home, Explore, Leagues, Notifications, Profile)
- Home screen with feed and suggestions
- Explore screen with category filters
- Leagues screen with featured leagues
- Notifications screen with unread tracking
- Profile screen with settings

#### Backend (Convex)
- **Users** - User management, profiles, influencer settings
- **Posts** - Content creation, likes, comments, shares
- **Leagues** - Create, join, leave, leaderboards
- **Follows** - Follow/unfollow with counts
- **Comments** - Nested comments with replies
- **Subscriptions** - Monthly/yearly with Stripe
- **Notifications** - Real-time notifications
- **Transactions** - Payment tracking
- **HTTP Endpoints** - Clerk and Stripe webhooks

#### Integrations
- **Clerk** - Full authentication flow with webhooks
- **Stripe** - Checkout sessions, subscriptions, Connect, tips
- **Resend** - Welcome, subscription, and tip emails
- **PostHog** - Page views, user identification
- **Sentry** - Error tracking and performance monitoring

### 📁 Project Structure
```
apps/
├── mobile/     # Expo React Native app
└── web/        # Next.js web app
packages/
└── convex/     # Convex backend
```

### 🔧 Configuration
- Environment variables for all services
- TypeScript strict mode
- ESLint configuration
- Tailwind CSS v4 configuration
- Convex schema and functions

---

For more information, see the [README](README.md).
