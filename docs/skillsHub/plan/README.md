# SkillsHub Implementation Plan

## Context

Teachers lack clear skill progression visibility and coaching work is scattered across tools. SkillsHub creates a centralized hub where teachers see their skill map, coaches manage development through action plans and observations, and admins get aggregate views.

**Phase 1 scope: Full vertical slice** — teacher views skill map -> coach sets focus skills -> creates action plan -> records observation.

## Key Decisions

| Decision | Choice |
|----------|--------|
| Codebase | solves-coaching (Next.js 15, MongoDB/Mongoose, Clerk) |
| Route | `/src/app/skillsHub/` — own top-level path, self-contained |
| UI | Mantine (new dependency, scoped to SkillsHub only) |
| Taxonomy | Runtime fetch from mathkcs static API with caching |
| Data layer | Server actions (same pattern as SCM), not API routes |
| Auth | Clerk magic link for teachers, Google OAuth remains for existing users |
| Notes | Text + image upload (video deferred) |
| Reuse | Follow SCM patterns, but no reuse of existing CAP/visits/observations code |

## Implementation Order

| # | Spec | Description | Depends on |
|---|------|-------------|-----------|
| 1 | [01-foundation.md](./01-foundation.md) | Mantine, layout, auth, nav, hub page | Nothing |
| 2 | [02-data-layer.md](./02-data-layer.md) | Mongoose models, Zod types, taxonomy fetcher, server actions, hooks | #1 |
| 3 | [03-skill-map.md](./03-skill-map.md) | Teacher/coach skill map view | #1, #2 |
| 4 | [04-coach-caseload.md](./04-coach-caseload.md) | Coach dashboard of assigned teachers | #1, #2 |
| 5 | [05-action-plans.md](./05-action-plans.md) | Create/manage plans + steps | #2, #3 |
| 6 | [06-observation-guide.md](./06-observation-guide.md) | Dynamic rubric form | #2, #3 |
| 7 | [07-skill-detail.md](./07-skill-detail.md) | Detail view with notes + image upload | #2, #5, #6 |
| 8 | [08-admin-assignments.md](./08-admin-assignments.md) | Coach-teacher assignment management | #2 |

## File Structure

```
src/app/skillsHub/
├── layout.tsx                          # Server: auth + MantineShell
├── page.tsx                            # Hub (role-based landing)
├── (auth)/
│   └── sign-in/
│       └── page.tsx                   # Magic link sign-in
├── _components/                        # Shared Mantine components
│   ├── MantineShell.tsx               # Mantine provider (use client)
│   ├── SkillsHubNav.tsx              # Top nav (Mantine port of SCMNav)
│   ├── SkillMap.tsx                   # Domain grid
│   ├── DomainSection.tsx
│   ├── SkillCard.tsx
│   ├── SkillStatusBadge.tsx
│   └── NoteEditor.tsx
├── _hooks/                             # React Query hooks
├── _types/                             # Zod schemas + TS types
├── _lib/                               # Taxonomy fetcher, utils
├── _actions/                           # Server actions
├── teacher/
│   └── [teacherId]/
│       ├── page.tsx                   # Skill map for teacher
│       ├── action-plans/
│       │   ├── page.tsx              # List action plans
│       │   └── new/page.tsx          # Create form
│       └── observe/
│           └── page.tsx              # Observation guide
├── skill/
│   └── [skillId]/
│       └── page.tsx                  # Skill detail
└── admin/
    └── assignments/
        └── page.tsx                  # Coach-teacher management
```

Mongoose models: `src/lib/schema/mongoose-schema/skills-hub/`

## Verification

1. **Coach flow:** Login -> see caseload -> click teacher -> see skill map -> set 3 skills Active -> create action plan with 2 steps -> record observation rating 2 skills -> view skill detail with notes
2. **Teacher flow:** Login -> see own read-only skill map -> click skill -> see detail with coach's notes
3. **Mantine isolation:** SCM and other pages render correctly without Mantine styles leaking
4. **Checks:** `npm run typecheck`, `npm run lint`, `npm run format` all pass

## Key Reference Files

| What | Path |
|------|------|
| SCM layout pattern | `src/app/scm/layout.tsx` |
| SCM nav pattern | `src/app/scm/SCMNav.tsx` |
| SCM hub page pattern | `src/app/scm/page.tsx` |
| SCM server actions pattern | `src/app/actions/scm/podsie/section-config.ts` |
| Auth utility | `src/lib/server/auth/getAuthenticatedUser.ts` |
| Auth hooks | `src/hooks/auth/useAuthenticatedUser.ts` |
| DB connection | `src/lib/server/db/connection.ts` |
| CRUD factory | `src/lib/server/crud/crud-factory.ts` |
| withDbConnection | `src/lib/server/db/ensure-connection.ts` |
| Existing staff models | `src/lib/schema/mongoose-schema/core/staff.model.ts` |
| Permission types | `src/lib/types/core/auth.ts` |
| Google sign-in (to replace) | `src/components/auth/GoogleSignInButton.tsx` |
| Clerk middleware | `src/middleware.ts` |
| Clerk webhook handler | `src/lib/server/api/handlers/clerk-webhook.ts` |
| mathkcs taxonomy schema | `mathkcs/src/lib/schemas/teacher-skills.ts` |
| mathkcs API endpoint | `<mathkcs-host>/api/teacher-skills/index.json` |
| Podsie Mantine setup | `podsie/app/root.tsx` |
| Podsie Mantine theme | `podsie/app/styles/theme.ts` |
| Podsie PostCSS config | `podsie/postcss.config.cjs` |
