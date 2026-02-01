# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start development server
pnpm build        # Production build
pnpm lint         # Run ESLint
pnpm build:css    # Watch and rebuild Tailwind CSS (public/app.css -> public/output.css)
```

## Tech Stack

- **Framework**: Next.js 15.5 with App Router
- **Styling**: Tailwind CSS v4 + DaisyUI (component classes like `btn`, `card`, `navbar`, `menu`)
- **UI Components**: Radix UI primitives, custom components in `components/ui/`
- **State/Forms**: Zod for validation, React hooks for state
- **API**: Axios with JWT auth (access/refresh tokens in localStorage)
- **Charts**: Recharts

## Architecture

### Route Structure (App Router)
Each user role has its own route group with dedicated layout:
- `/student/*` - Student portal (dashboard, profile, drives, offers, events, policy)
- `/placement/*` - Placement cell admin (dashboard, students, alumni, drives, companies, job-offers, calendar, reports)
- `/alumni/*` - Alumni section (dashboard, directory, projects, referral, profile)
- `/dean/*` - Dean dashboard
- `/management/*` - Management dashboard

### Authentication Flow
1. Login via `/login` stores tokens in localStorage (`access_token`, `refresh_token`, `role_type`, `user_id`)
2. Route layouts check `isLoggedIn` flag and redirect to `/login` if missing
3. `RoleGuard` component verifies role via `/auth/role` endpoint for protected pages
4. `api.ts` interceptors handle automatic token refresh on 401

### User Data System (Students)
- `userCache.ts` - Singleton cache with pub/sub pattern for user data
- `userService.ts` - Fetches from `/student/user/{id}`, validates with Zod schema
- `useUser.ts` - React hook subscribing to cache, auto-fetches if empty
- `schema.ts` - Zod schemas defining `UserData` type with nested objects (personal_details, education_history, projects, internships, etc.)

### Component Organization
- `components/ui/` - Reusable primitives (button, card, table, tabs, etc.)
- `components/student/` - Student profile form components
- `components/placement/` - Placement admin components (Navbar with MegaMenu)
- `app/student/profile/components/` - Page-specific profile section forms

### Environment
Requires `NEXT_PUBLIC_BACKEND_URL` for API base URL.
