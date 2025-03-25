# AI Coaching Platform Frontend Guide

## Build & Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code consistency
- `npm run test` - Run Jest/Playwright tests (if applicable)

## Code Style Guidelines
- **TypeScript:** Use Zod schemas as primary type definitions
   - Import types from `@/lib/zod-schema` not from models.ts
   - All functions should explicitly define their return types, e.g., `Promise<LookFor | null>`
- **Imports:** Use absolute imports with @/ alias for src directory
- **Components:** Use functional components with React hooks
- **Error Handling:** Use centralized error handling (handleServerError)
- **Naming Conventions:**
   - Components: PascalCase (ButtonGroup.tsx)
   - Functions/Variables: camelCase (handleSubmit)
   - Files: kebab-case (sidebar-layout.tsx)
- **State Management:**
   - Use SWR for data fetching with stable cache keys
   - Use React hooks (useState, useEffect) for local state
- **API Calls:**
   - Use Server Actions, no fetch() calls in client components
   - Validate data with Zod schemas in server actions
   - Use optimistic updates with SWR's mutate() function
- **Styling:** Use Tailwind CSS with component composition

## Project Structure
- Server Actions live in app/actions/ for CRUD operations
- Zod schemas in lib/zod-schema/ serve as single source of truth
- SWR hooks are inside hooks/
- Mongoose models are stored in models/
- UI schemas for forms and validation are in lib/ui-schema/
- Centralized utilities (database, error handling) are in lib/