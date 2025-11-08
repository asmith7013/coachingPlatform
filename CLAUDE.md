# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Database Operations with MongoDB

### Connecting to MongoDB Atlas

This project uses MongoDB Atlas. The connection string is in `.env.local`:

```bash
DATABASE_URL="mongodb+srv://asmith7013:pnz0uvb5ztj_qxj0EXQ@coaching.go309.mongodb.net/ai-coaching-platform"
```

### Using mongosh for Database Operations

Claude Code CAN and SHOULD use `mongosh` for database operations. Here are common patterns:

#### Find Documents

```bash
mongosh "mongodb+srv://asmith7013:pnz0uvb5ztj_qxj0EXQ@coaching.go309.mongodb.net/ai-coaching-platform" --eval "
db['collection-name'].find({ field: 'value' }).forEach(printjson);
"
```

#### Count Documents

```bash
mongosh "mongodb+srv://..." --eval "
print('Total documents:', db['collection-name'].countDocuments());
"
```

#### Update Documents

```bash
mongosh "mongodb+srv://..." --eval "
const result = db['collection-name'].updateOne(
  { _id: ObjectId('...') },
  { \$set: { field: 'new value' } }
);
printjson(result);
"
```

#### Delete Documents

```bash
mongosh "mongodb+srv://..." --eval "
const result = db['collection-name'].deleteOne({ _id: ObjectId('...') });
printjson(result);
print('Deleted:', result.deletedCount, 'documents');
"
```

#### Aggregation Pipelines

```bash
mongosh "mongodb+srv://..." --eval "
const pipeline = [
  { \$group: { _id: '\$field', count: { \$sum: 1 } } },
  { \$sort: { count: -1 } }
];
db['collection-name'].aggregate(pipeline).forEach(printjson);
"
```

#### Managing Indexes

```bash
# List indexes
mongosh "mongodb+srv://..." --eval "
printjson(db['collection-name'].getIndexes());
"

# Drop an index
mongosh "mongodb+srv://..." --eval "
db['collection-name'].dropIndex('index_name');
"
```

### Important Notes

- Always use the full connection string with database name
- Use `printjson()` for formatted output
- Escape special characters in shell commands (e.g., `\$` for MongoDB operators)
- Use `--eval` for single commands, or create a `.js` file for complex scripts

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **UI**: React 18, Tailwind CSS
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: Clerk
- **Language**: TypeScript
- **State Management**: React Hooks, localStorage for client-side persistence

## Code Guidelines

- **Avoid `any` types** - Use proper TypeScript types or `unknown` with type guards
- **Use Zod for validation** - All external data should be validated with Zod schemas
- **Server Actions** - Use "use server" directive for backend operations
- Before making commits, run:
  - `npm run build` - Check for build errors
  - `npm run lint` - Fix linting issues

## Architecture

### File Structure

- **`src/app/`** - Next.js app router pages and layouts
- **`src/app/actions/`** - Server actions for data mutations
- **`src/lib/schema/mongoose-schema/`** - Mongoose models
- **`src/lib/schema/zod-schema/`** - Zod validation schemas
- **`src/components/`** - Reusable React components
- **`src/query/`** - React Query hooks and providers

### Schema Organization

This project uses a **dual schema system**:

1. **Zod Schemas** (`src/lib/schema/zod-schema/`) - For validation and TypeScript types
2. **Mongoose Schemas** (`src/lib/schema/mongoose-schema/`) - For database models

**Important conventions:**

- Zod schemas define the validation rules and infer TypeScript types
- Mongoose schemas define the database structure
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
- Use `useQuery` for fetching data
- Use `useMutation` for mutations
- Store UI state in React hooks or localStorage
- Avoid storing server data in localStorage (use React Query cache instead)

## Database Schema Notes

### Important Collections

- **`students`** - Student records with `studentID` (number) as primary identifier
- **`roadmaps-student-data`** - Assessment data with `studentId` (string slug)
  - ⚠️ **Known Issue**: `studentId` format doesn't match `students.studentID`
- **`activity-type-configs`** - Incentive activity types (max 10)

### Common Pitfalls

1. **ID Format Mismatches** - Some collections use numeric IDs, others use string slugs
2. **Mongoose Model Caching** - Use `delete mongoose.models.ModelName` to clear cache during development
3. **Index Conflicts** - Old indexes may persist after schema changes; drop them manually
4. **Timezone Issues** - Always use local timezone for dates in forms (`new Date().get*()` methods)

## Environment Variables

Required in `.env.local`:

- `DATABASE_URL` - MongoDB Atlas connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk auth public key
- `CLERK_SECRET_KEY` - Clerk auth secret key
