@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Code Guidelines

- **Avoid `any` types** — Use proper TypeScript types or `unknown` with type guards. When `any` is unavoidable (e.g., Mongoose `lean()` types), use `as any` directly — DO NOT use `eslint-disable` comments as they prevent the build from completing.
- **Use Zod for validation** — All external data should be validated with Zod schemas
- **Server Actions** — Use `"use server"` directive for backend operations
- **Follow existing patterns** — Look at similar features before creating new ones
- **Use existing schemas** — Extend rather than create new ones when possible
- **Handle errors gracefully** — Server actions must always return `{ success, data?, error? }`
- **Button Cursor** — Always add `cursor-pointer` class to clickable buttons and interactive elements
- At the end of large changes or before making commits, always run:
  - `npm run typecheck` — TypeScript errors (DO NOT use `npm run build` as it interferes with dev server)
  - `npm run lint` — Linting errors
  - `npm run format` — Prettier formatting (do not forget this one)

## Architecture

Backend follows **Server Actions** pattern:

- **Pages/Layouts** (`src/app/`) — Next.js App Router pages
- **Server Actions** (`src/app/actions/`) — Data mutations with `"use server"`
- **Mongoose Models** (`src/lib/schema/mongoose-schema/`) — Database models
- **Zod Schemas** (`src/lib/schema/zod-schema/`) — Validation and TypeScript types
- **Components** (`src/components/`) — Reusable React components
- **Query Hooks** (`src/query/`) — React Query hooks and providers

### Type Organization

- **Zod schemas** define validation rules and infer TypeScript types
- **Common pattern**: Define Zod schema → Infer TypeScript type → Export both
- **Mongoose schemas** define database structure and must mirror Zod schemas
- When adding a new field: update Zod schema, Mongoose schema, and any TypeScript interfaces

### Schema Organization (Dual Schema System)

1. **Zod Schemas** (`src/lib/schema/zod-schema/`) — For validation and TypeScript types
2. **Mongoose Schemas** (`src/lib/schema/mongoose-schema/`) — For database models

**Important conventions:**

- Keep both in sync manually (no automatic generation)
- Mongoose uses `_id` (ObjectId), but transforms add `id` field for client-side use
- Use `toJSON()` when returning Mongoose documents to ensure proper serialization

### Server Actions Pattern

```typescript
"use server";

export async function myAction(input: MyInputType) {
  return withDbConnection(async () => {
    try {
      // Validate input with Zod
      const validated = MyInputSchema.parse(input);

      // Database operations
      const result = await MyModel.findOne({ ... });

      // Return standardized response
      return { success: true, data: result.toJSON() };
    } catch (error) {
      return { success: false, error: handleServerError(error, "Operation failed") };
    }
  });
}
```

### Client-Side Data Fetching

- Use React Query for server state management
- Use `useQuery` for fetching, `useMutation` for mutations
- Store UI state in React hooks or localStorage
- Avoid storing server data in localStorage (use React Query cache instead)

## Performance Requirements

This is a teacher/coach-facing application. Query performance matters.

- Avoid N+1 queries — use `.populate()` or aggregation pipelines instead of looping with individual queries
- When querying large collections, always use indexed fields and `.lean()` for read-only operations
- Use `.select()` to limit returned fields when full documents aren't needed

## Database Schema Notes

### Important Collections

- **`students`** — Student records with `studentID` (number) as primary identifier
- **`roadmaps-student-data`** — Assessment data with `studentId` (string slug)
  - **Known Issue**: `studentId` format doesn't match `students.studentID`
- **`activity-type-configs`** — Incentive activity types (max 10)

### Common Pitfalls

1. **ID Format Mismatches** — Some collections use numeric IDs, others use string slugs
2. **Mongoose Model Caching** — Use `delete mongoose.models.ModelName` to clear cache during development
3. **Index Conflicts** — Old indexes may persist after schema changes; drop them manually
4. **Timezone Issues** — Always use local timezone for dates in forms (`new Date().get*()` methods)

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **UI**: React 19, Tailwind CSS
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: Clerk
- **Language**: TypeScript
- **State Management**: React Hooks, React Query, localStorage

## Dev Notes

- **Dependency APIs**: ALWAYS read node_module files rather than doing web searches to understand a dependency's API
- **Prefer existing libraries**: Use `react-icons` or existing UI libraries over writing custom SVGs
- **Investigate before modifying data**: Use `find()` and `countDocuments()` before bulk operations
- **Sample before bulk**: Test on one document before updating many

## Environment Variables

Required in `.env.local`:

- `DATABASE_URL` — MongoDB Atlas connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk auth public key
- `CLERK_SECRET_KEY` — Clerk auth secret key
