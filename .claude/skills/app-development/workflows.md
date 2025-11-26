# Workflows Skill

This skill provides development workflows, implementation guides, and best practices for working on the AI Coaching Platform.

## Purpose

Use this skill when:
- Starting a new feature implementation
- Following development best practices
- Managing breaking changes
- Developing custom hooks
- Understanding common tasks
- Integrating with Cursor AI
- Using development utilities

## Core Documentation

### Workflows

@workflows/development-workflow.md - Daily development workflow
@workflows/implementation-workflow.md - Feature implementation guide
@workflows/common-tasks.md - Common development tasks
@workflows/breaking-changes-guide.md - Managing breaking changes safely

### Specialized Workflows

@workflows/hook-development.md - Custom React hook patterns
@workflows/dev-utilities.md - Development tools and utilities
@workflows/cursor-integration.md - Cursor AI integration patterns

### Templates

@workflow-templates/coding-session-control.md - Session management template

## Development Workflow

### Daily Workflow

1. **Pull Latest Changes**
   ```bash
   git pull origin main
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Development Cycle**
   - Write code
   - Test locally
   - Run linting: `npm run lint`
   - Check build: `npm run build`

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: description of changes"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   # Create PR via GitHub UI or gh CLI
   ```

### Commit Message Convention

Follow conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `test:` - Test additions/changes
- `chore:` - Maintenance tasks

## Implementation Workflow

### Feature Implementation Checklist

#### Phase 1: Planning
- [ ] Understand requirements
- [ ] Review existing patterns
- [ ] Identify affected components
- [ ] Plan data flow
- [ ] Design schema (if needed)

#### Phase 2: Schema & Types
- [ ] Create/update Zod schema (`@zod-schema/*`)
- [ ] Create/update Mongoose schema (`@mongoose-schema/*`)
- [ ] Export TypeScript types from Zod
- [ ] Test schema validation

#### Phase 3: Backend Implementation
- [ ] Create server actions (`@actions/*`)
- [ ] Implement database operations
- [ ] Add error handling
- [ ] Test with mongosh if needed

#### Phase 4: Frontend Implementation
- [ ] Create React Query hooks (if needed)
- [ ] Build UI components
- [ ] Implement forms/interactions
- [ ] Add loading/error states

#### Phase 5: Testing & Polish
- [ ] Test all user flows
- [ ] Check responsive design
- [ ] Verify error handling
- [ ] Run `npm run lint`
- [ ] Run `npm run build`

#### Phase 6: Code Review
- [ ] Self-review changes
- [ ] Check for console logs
- [ ] Verify no `any` types
- [ ] Create PR with description

## Common Tasks

### Adding a New Feature

1. **Create Zod Schema**
   ```typescript
   // src/lib/schema/zod-schema/my-feature.ts
   import { z } from "zod";

   export const MyFeatureSchema = z.object({
     id: z.string(),
     name: z.string(),
     // ... more fields
   });

   export type MyFeature = z.infer<typeof MyFeatureSchema>;
   ```

2. **Create Mongoose Schema**
   ```typescript
   // src/lib/schema/mongoose-schema/my-feature.ts
   import mongoose from "mongoose";

   const myFeatureSchema = new mongoose.Schema({
     name: String,
     // ... match Zod schema
   });

   export const MyFeatureModel = mongoose.models.MyFeature ||
     mongoose.model("MyFeature", myFeatureSchema);
   ```

3. **Create Server Action**
   ```typescript
   // src/app/actions/my-feature/fetch-my-feature.ts
   "use server";

   import { withDbConnection } from "@server/withDbConnection";
   import { MyFeatureModel } from "@mongoose-schema/my-feature";

   export async function fetchMyFeature(id: string) {
     return withDbConnection(async () => {
       const feature = await MyFeatureModel.findById(id);
       return { success: true, data: feature?.toJSON() };
     });
   }
   ```

4. **Create React Query Hook**
   ```typescript
   // src/query/my-feature/useMyFeatureQuery.ts
   import { useQuery } from "@tanstack/react-query";
   import { fetchMyFeature } from "@actions/my-feature/fetch-my-feature";

   export function useMyFeatureQuery(id: string) {
     return useQuery({
       queryKey: ["myFeature", id],
       queryFn: () => fetchMyFeature(id),
     });
   }
   ```

5. **Create Component**
   ```typescript
   // src/components/domain/my-feature/MyFeatureCard.tsx
   import { useMyFeatureQuery } from "@/query/my-feature/useMyFeatureQuery";

   export function MyFeatureCard({ id }: { id: string }) {
     const { data, isLoading } = useMyFeatureQuery(id);

     if (isLoading) return <div>Loading...</div>;

     return <div>{data?.name}</div>;
   }
   ```

### Database Operations

#### Query with mongosh
```bash
mongosh "$DATABASE_URL" --eval "
db['collection-name'].find({}).forEach(printjson);
"
```

#### Update Schema
1. Update Zod schema
2. Update Mongoose schema
3. Clear model cache: `delete mongoose.models.ModelName`
4. Check for index conflicts
5. Test with sample data

### Managing Breaking Changes

#### Identify Breaking Changes
- Schema field removals/renames
- API signature changes
- Component prop changes
- Database structure changes

#### Migration Strategy
1. **Backwards Compatible First**
   - Add new fields alongside old
   - Deprecate old fields
   - Update consumers gradually

2. **Schema Migration**
   ```bash
   # Create migration script
   mongosh "$DATABASE_URL" --eval "
   db['collection'].updateMany(
     { oldField: { \$exists: true } },
     { \$rename: { oldField: 'newField' } }
   );
   "
   ```

3. **Update All References**
   - Search codebase for old field names
   - Update imports
   - Update types
   - Test thoroughly

4. **Clean Up**
   - Remove deprecated code
   - Update documentation
   - Drop old database indexes

## Hook Development

### Custom Hook Pattern

```typescript
// src/hooks/useMyHook.ts
import { useState, useEffect } from "react";

export function useMyHook(initialValue: string) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    // Side effects here
  }, [value]);

  return { value, setValue };
}
```

### Data Fetching Hook

```typescript
import { useQuery } from "@tanstack/react-query";

export function useDataHook(id: string) {
  return useQuery({
    queryKey: ["data", id],
    queryFn: () => fetchData(id),
    enabled: !!id, // Only run if id exists
  });
}
```

### Form Hook

```typescript
import { useState } from "react";
import { z } from "zod";

export function useFormHook<T extends z.ZodType>(schema: T) {
  const [values, setValues] = useState<z.infer<T>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const result = schema.safeParse(values);
    if (!result.success) {
      const newErrors = result.error.flatten().fieldErrors;
      setErrors(newErrors as Record<string, string>);
      return false;
    }
    return true;
  };

  return { values, setValues, errors, validate };
}
```

## Development Utilities

### Useful Commands

```bash
# Start dev server
npm run dev

# Build production
npm run build

# Run linter
npm run lint

# Fix lint issues
npm run lint -- --fix

# Type check
npx tsc --noEmit

# Clear Next.js cache
rm -rf .next

# Database shell
mongosh "mongodb+srv://..."
```

### Debugging Tools

1. **React DevTools** - Inspect component tree
2. **Network Tab** - Monitor API calls
3. **Console Logs** - Strategic logging (remove before commit)
4. **MongoDB Compass** - Visual database explorer
5. **VS Code Debugger** - Breakpoint debugging

### Code Quality Checks

Before committing:
```bash
# 1. Lint
npm run lint

# 2. Build
npm run build

# 3. Type check (if needed)
npx tsc --noEmit
```

## Cursor Integration

### Using Cursor with This Codebase

1. **Context Awareness**
   - Cursor can reference `CLAUDE.md`
   - Use `@docs` to reference documentation
   - Use `@architecture` for patterns

2. **Common Prompts**
   - "Create a new feature following the CRUD pattern"
   - "Add a server action for [operation]"
   - "Build a React Query hook for [feature]"

3. **Best Practices**
   - Reference existing patterns
   - Ask for schema-first implementations
   - Request error handling
   - Specify component tier (core/composed/domain)

## Best Practices

### Code Quality
- Use TypeScript strictly (no `any`)
- Validate all external data with Zod
- Follow existing patterns
- Write self-documenting code
- Add comments for complex logic

### Performance
- Use React.memo for expensive components
- Implement pagination for large datasets
- Optimize database queries
- Use React Query for caching

### Security
- Validate all user input
- Use Clerk for authentication
- Sanitize database queries
- Never expose sensitive data

### Maintainability
- Use path aliases consistently
- Follow naming conventions
- Keep components focused
- Document breaking changes
- Write clear commit messages

## Integration with Other Skills

- For architecture patterns → Use `architecture` skill
- For backend/API work → Use `data-flow` skill
- For UI components → Use `component-system` skill
- For tables → Use `tanstack-table` skill
