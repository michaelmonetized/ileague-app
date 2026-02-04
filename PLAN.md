# iLeague Development Plan

## Project Overview

iLeague is a modern influencer/fan engagement platform connecting creators with fans through leagues, competitions, exclusive content, and monetization. Built as a monorepo with Next.js 15 (web), Expo/React Native (mobile), and Convex (real-time backend).

**Tech Stack:** Next.js 15, Expo, React Native, Convex, Clerk Auth, Stripe Payments, NativeWind/Tailwind CSS, PostHog Analytics, Sentry Error Tracking

## Current State

- Monorepo structure established with `apps/web`, `apps/mobile`, `packages/convex`
- Core authentication with Clerk integrated
- Convex backend configured for real-time data
- Basic creator/fan features outlined in README
- Payment infrastructure with Stripe Connect planned

## Phase 1: Core Platform (Weeks 1-4)

### Goals
- Complete user authentication flow (web + mobile)
- Creator profile creation and customization
- Basic content posting (text, images)
- Fan follow/subscribe mechanics

### Deliverables
- [ ] Clerk auth working on both platforms
- [ ] User onboarding flow (creator vs fan)
- [ ] Profile pages with cover images, bios, social links
- [ ] Feed with basic post creation
- [ ] Follow system with real-time updates

## Phase 2: Monetization & Engagement (Weeks 5-8)

### Goals
- Subscription tiers (monthly/yearly)
- Tipping functionality
- Leagues and competitions
- Enhanced content types (video, polls)

### Deliverables
- [ ] Stripe Connect integration for creator payouts
- [ ] Subscription management (create, upgrade, cancel)
- [ ] Tip sending with payment processing
- [ ] League creation with leaderboards
- [ ] Video upload and streaming
- [ ] Interactive polls

## Phase 3: Growth & Polish (Weeks 9-12)

### Goals
- Analytics dashboard for creators
- Push notifications
- App store deployment
- Performance optimization

### Deliverables
- [ ] Creator analytics (earnings, engagement, growth)
- [ ] Push notifications for activity
- [ ] iOS/Android app store submissions
- [ ] SEO optimization for web
- [ ] Performance audit and optimization
- [ ] Beta testing with real creators

## Success Metrics

| Metric | Target |
|--------|--------|
| Creator signups | 100 in first month |
| Mobile app rating | 4.5+ stars |
| Subscription conversion | 5% of followers |
| Creator retention | 70% monthly active |
| Page load time | < 2 seconds |

## Timeline Summary

| Phase | Duration | Focus |
|-------|----------|-------|
| Phase 1 | Weeks 1-4 | Core auth, profiles, basic content |
| Phase 2 | Weeks 5-8 | Payments, subscriptions, leagues |
| Phase 3 | Weeks 9-12 | Analytics, deployment, polish |
