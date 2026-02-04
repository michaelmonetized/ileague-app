# iLeague Roadmap

## Current Status (Audited: 2026-02-04)

### ✅ What's Working

**Convex Backend**
- [x] Schema defined with all core tables (users, leagues, posts, follows, subscriptions, etc.)
- [x] Backend deployed: `kindred-gnu-699.convex.cloud`
- [x] User management (create, get, update, onboarding)
- [x] League CRUD operations (create, update, join, leave, leaderboard)
- [x] Posts & comments with pagination
- [x] Follow/subscription system
- [x] Notifications with read/unread tracking
- [x] Stripe integration (Connect, subscriptions)
- [x] Email via Resend

**Web App (Next.js)**
- [x] Deployed on Vercel
- [x] Clerk authentication integrated
- [x] Convex connected with working queries
- [x] Dashboard, explore, leagues, notifications pages
- [x] PostHog analytics
- [x] Sentry error tracking
- [x] Onboarding flow

**Mobile App (Expo)**
- [x] Expo Router with tab navigation
- [x] Clerk auth integration
- [x] Convex provider setup
- [x] NativeWind styling
- [x] Basic screens: Home, Explore, Leagues, Notifications, Profile
- [x] Onboarding flow with `completeOnboarding` mutation

### ⚠️ Partially Working

**Mobile Leagues Screen**
- UI renders beautifully but uses **hardcoded data**
- NOT wired to `api.leagues.*` queries/mutations
- Create/Join buttons are non-functional

**Mobile Explore Screen**
- Uses `api.users.getInfluencers` ✅
- But creator cards are partially hardcoded

### ❌ Missing / Incomplete

**Mobile App**
- [ ] No `eas.json` - EAS Build not configured
- [ ] No app icons (assets/images is empty)
- [ ] No splash screen images
- [ ] No `.env` file for mobile (needs EXPO_PUBLIC_* vars)
- [ ] Leagues not wired to Convex
- [ ] Create league flow missing
- [ ] Join league mutation not connected
- [ ] Score tracking UI
- [ ] Push notifications not configured

**TestFlight Blockers**
- [ ] Missing `eas.json` configuration
- [ ] Missing Apple Developer Team ID
- [ ] Missing app icons (1024x1024 required)
- [ ] Missing splash screen assets
- [ ] Need to configure Sentry org/project in app.json

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | Bun workspaces |
| Web | Next.js 15, Tailwind CSS v4 |
| Mobile | Expo 52, NativeWind 4 |
| Backend | Convex |
| Auth | Clerk |
| Payments | Stripe Connect |
| Email | Resend |
| Analytics | PostHog |
| Errors | Sentry |

---

## Short-term Goals (This Week)

### 1. Mobile: Wire Up Leagues
- [ ] Connect leagues.tsx to `api.leagues.getLeagues`
- [ ] Connect to `api.leagues.getFeaturedLeagues`
- [ ] Connect to `api.leagues.getUserLeagues`
- [ ] Implement "Join League" with `api.leagues.joinLeague`
- [ ] Create league flow with form + `api.leagues.createLeague`

### 2. Mobile: TestFlight Prep
- [ ] Create `eas.json` with build profiles
- [ ] Generate app icons (1024x1024)
- [ ] Create splash screen
- [ ] Set up `apps/mobile/.env` with:
  ```
  EXPO_PUBLIC_CONVEX_URL=https://kindred-gnu-699.convex.cloud
  EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=<from web .env>
  EXPO_PUBLIC_POSTHOG_KEY=<from web .env>
  EXPO_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
  ```
- [ ] Update app.json with real Sentry org/project
- [ ] Configure EAS project ID

### 3. Score Tracking
- [ ] Add score entry UI in mobile app
- [ ] Wire up `api.leagues.updateMemberScore`
- [ ] Display leaderboard in league detail screen

---

## Medium-term Goals (1-2 Weeks)

- [ ] League detail screen (mobile + web)
- [ ] Tournament brackets
- [ ] Push notifications via Expo
- [ ] Live scoring updates
- [ ] Improved creator profiles

---

## Long-term Goals (1 Month+)

- [ ] League discovery/directory
- [ ] Payment integration for entry fees
- [ ] Social features (share, invite)
- [ ] App Store submission
- [ ] Public launch marketing

---

## Path to TestFlight

```
1. [x] Monorepo structure
2. [x] Convex backend deployed
3. [x] Web app live on Vercel
4. [ ] Wire mobile leagues to backend
5. [ ] Create app assets (icons, splash)
6. [ ] Configure EAS Build
7. [ ] Run `eas build --platform ios`
8. [ ] Submit to TestFlight
9. [ ] Internal testing
10. [ ] App Store review
```

---

## Environment Variables Needed (Mobile)

Create `apps/mobile/.env`:
```bash
EXPO_PUBLIC_CONVEX_URL=https://kindred-gnu-699.convex.cloud
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_bG92aW5nLW9yY2EtMjkuY2xlcmsuYWNjb3VudHMuZGV2JA
EXPO_PUBLIC_POSTHOG_KEY=phc_VlviX0rixijJS3cBKuMri8tRiVDaG38gOoA4Q79vNQB
EXPO_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

---

## Notes

**Revenue Potential: MEDIUM**
- Target: Amateur golf leagues, country clubs, golf groups
- Can expand to other sports (bowling, darts, fantasy)
- Subscription model for premium features
- Entry fee processing for tournaments

**Last Updated:** 2026-02-04
