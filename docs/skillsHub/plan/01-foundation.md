# 01 - Foundation

## Overview

Set up the base infrastructure for SkillsHub: Mantine UI library, layout with auth, navigation, and hub landing page. This is the shell that all other pages render inside.

## Mantine Setup

### Packages to install

```
npm install @mantine/core @mantine/hooks @mantine/dates @mantine/notifications
npm install -D postcss-preset-mantine postcss-simple-vars
```

### PostCSS Configuration

File: `postcss.config.mjs`

- Add `postcss-preset-mantine` and `postcss-simple-vars` plugins alongside the existing `@tailwindcss/postcss`
- The postcss-simple-vars plugin needs Mantine breakpoint variables defined

### MantineShell Component

File: `src/app/skillsHub/_components/MantineShell.tsx`

- `"use client"` component
- Imports Mantine CSS: `@mantine/core/styles.css`, `@mantine/dates/styles.css`, `@mantine/notifications/styles.css`
- Wraps children in `MantineProvider` with custom theme
- Includes `Notifications` component from `@mantine/notifications`
- Scoped to SkillsHub only — the root app layout does NOT get MantineProvider
- Reference implementation: podsie's `app/root.tsx` for how Mantine coexists with Tailwind

### Theme Configuration

File: `src/app/skillsHub/_lib/mantine-theme.ts`

- Use `createTheme()` from `@mantine/core`
- Define primary color palette (align with existing solves-coaching design tokens)
- Set default font to match existing app fonts
- Component overrides for Button, Badge, Card if needed

## Auth: Clerk Magic Link

### Current state

- Sign-in is Google OAuth only via `src/components/auth/GoogleSignInButton.tsx`
- Uses Clerk's `useSignIn()` hook with `strategy: "oauth_google"`
- Default redirect: `/scm`

### What to build

#### Clerk Dashboard

- Enable "Email link" (magic link) as a first-factor authentication method
- Keep Google OAuth enabled (existing SCM users still use it)

#### Magic Link Sign-In Page

File: `src/app/skillsHub/(auth)/sign-in/page.tsx`

- `"use client"` component using Mantine UI
- Uses Clerk's `useSignIn()` hook with `strategy: "email_link"`
- Flow:
  1. User enters email in Mantine `TextInput`
  2. Clicks "Send Magic Link" `Button`
  3. Call `signIn.create({ strategy: "email_link", identifier: email, redirectUrl: "/skillsHub" })`
  4. Show success message: "Check your email for a sign-in link"
  5. User clicks link in email -> authenticated -> redirected to `/skillsHub`
- Also show Google OAuth as secondary option below a divider ("Or sign in with Google")
- Style: centered card, clean Mantine layout

#### Middleware Update

File: `src/middleware.ts`

- Add to `isPublicRoute` matcher: `"/skillsHub/(auth)/(.*)"` or `"/skillsHub/sign-in(.*)"`

#### Teacher Onboarding Flow

- Admin creates teacher in assignment page -> staff record created with email
- Teacher receives link to `/skillsHub/sign-in`
- Teacher enters email -> receives magic link -> signs in
- Clerk webhook auto-links to staff record (existing `handleUserCreation()` in `src/lib/server/api/handlers/clerk-webhook.ts`)

## Layout

File: `src/app/skillsHub/layout.tsx`

Server component that provides the outer shell for all SkillsHub pages.

### Auth check pattern (from SCM layout)

```typescript
import { getAuthenticatedUser } from "@/lib/server/auth";

export default async function SkillsHubLayout({ children }) {
  const authResult = await getAuthenticatedUser();

  if (!authResult.success) {
    // Redirect to SkillsHub sign-in
    redirect("/skillsHub/sign-in");
  }

  const { email } = authResult.data;

  // Domain/email allowlist (same pattern as SCM)
  if (!isAllowedEmail(email)) {
    return <AccessDeniedPage email={email} />;
  }

  return (
    <MantineShell>
      <SkillsHubNav />
      <main>{children}</main>
    </MantineShell>
  );
}
```

### Access control

- Allowlist: same domains as SCM (`schools.nyc.gov`, `teachinglab.org`, etc.) plus any new teacher emails
- Access denied page: Mantine styled (centered card with message + sign out link)

## Navigation

File: `src/app/skillsHub/_components/SkillsHubNav.tsx`

Mantine port of `src/app/scm/SCMNav.tsx`. Recreates the same UX with Mantine components.

### Mantine components to use

- `AppShell.Header` or custom sticky header div
- `Group` for horizontal layout
- `Menu` with `Menu.Target` + `Menu.Dropdown` for category dropdowns
- `Burger` + `Drawer` for mobile menu
- `UnstyledButton` or `Button variant="subtle"` for nav items
- `NavLink` or custom active-state links

### Behavior

- Dark background (`bg-gray-900` or Mantine dark theme)
- Sticky top, scroll hide/show (same scroll logic as SCMNav)
- Active state: highlight current category/page based on `usePathname()`
- Role-gated: Admin section only visible to super_admin/director roles

### Nav categories

```typescript
const categories = [
  {
    label: "Skills",
    items: [
      { href: "/skillsHub", label: "Hub" },
      // Teacher's own skill map (for teacher role)
    ],
  },
  {
    label: "Coaching",
    items: [
      { href: "/skillsHub/caseload", label: "My Caseload" }, // coach only
    ],
  },
  // Admin section (role-gated)
  {
    label: "Admin",
    items: [
      { href: "/skillsHub/admin/assignments", label: "Assignments" },
    ],
  },
];
```

- Sign out link on right side

## Hub Page

File: `src/app/skillsHub/page.tsx`

Mantine port of `src/app/scm/page.tsx`. Role-based landing page.

### For coaches

- Title: "Skills Hub"
- Description: "Manage teacher skill development, action plans, and observations"
- Category grid (Mantine `SimpleGrid cols={2}` with `Card` components):
  - **My Caseload**: "View and manage your assigned teachers" -> `/skillsHub/caseload`
  - **Observations**: "Record and review classroom observations" -> relevant observation pages
  - **Admin** (if admin role): "Manage coach-teacher assignments" -> `/skillsHub/admin/assignments`

### For teachers

- Title: "Skills Hub"
- Description: "View your skill progression and coaching feedback"
- Simplified grid:
  - **My Skills**: "View your skill map and progress" -> `/skillsHub/teacher/[ownId]`
- Redirect: if teacher has only one relevant page, consider auto-redirecting to their skill map

### Card component pattern

Each card has:

- Icon (Mantine `ThemeIcon` or Lucide icon)
- Title + description
- List of sub-page links with `Anchor` or `NavLink`
- Hover effect on the card

## Files Summary

| File                                              | Type   | Description                          |
| ------------------------------------------------- | ------ | ------------------------------------ |
| `postcss.config.mjs`                              | Modify | Add Mantine PostCSS plugins          |
| `src/app/skillsHub/_components/MantineShell.tsx`   | Create | Mantine provider wrapper             |
| `src/app/skillsHub/_lib/mantine-theme.ts`          | Create | Custom Mantine theme                 |
| `src/app/skillsHub/(auth)/sign-in/page.tsx`        | Create | Magic link sign-in page              |
| `src/middleware.ts`                                | Modify | Add SkillsHub auth routes to public  |
| `src/app/skillsHub/layout.tsx`                     | Create | Server layout with auth + MantineShell |
| `src/app/skillsHub/_components/SkillsHubNav.tsx`   | Create | Navigation bar                       |
| `src/app/skillsHub/page.tsx`                       | Create | Hub landing page                     |
