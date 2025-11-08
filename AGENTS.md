# AGENTS.md

This file contains specialized prompts and workflows for Claude Code agents working on this codebase.

## Available Agents

### Database Investigation Agent

**When to use:** Investigating data issues, checking document structure, finding missing records

**Workflow:**

1. Connect to MongoDB Atlas using the connection string from `.env.local`
2. Use `mongosh` to query and inspect data
3. Check for data inconsistencies (e.g., ID format mismatches)
4. Report findings with sample documents and counts
5. Suggest fixes based on discovered issues

**Example commands:**

```bash
# Find all documents in a collection
mongosh "mongodb+srv://..." --eval "db['collection-name'].find().limit(5).forEach(printjson);"

# Check for ID format issues
mongosh "mongodb+srv://..." --eval "
db.students.findOne({}, { studentID: 1 });
db['other-collection'].findOne({}, { studentId: 1 });
"

# Count documents by field
mongosh "mongodb+srv://..." --eval "
db['collection-name'].aggregate([
  { \$group: { _id: '\$field', count: { \$sum: 1 } } },
  { \$sort: { count: -1 } }
]).forEach(printjson);
"
```

### Schema Sync Agent

**When to use:** After changing Mongoose or Zod schemas

**Workflow:**

1. Verify Mongoose schema changes in `src/lib/schema/mongoose-schema/`
2. Verify corresponding Zod schema changes in `src/lib/schema/zod-schema/`
3. Check for any existing indexes that need to be dropped
4. Test with a sample query to ensure schema is correct
5. Document any breaking changes

**Important notes:**

- Always use `delete mongoose.models.ModelName` when changing schemas
- Set `autoIndex: false` to prevent automatic index creation
- Drop old indexes manually with `db['collection'].dropIndex('index_name')`

### Data Migration Agent

**When to use:** Migrating data between formats, fixing data inconsistencies

**Workflow:**

1. Analyze current data structure and target structure
2. Write and test migration script (don't execute without user approval)
3. Create backup strategy
4. Provide rollback plan
5. Execute migration only after user confirms

**Example migration pattern:**

```javascript
// migration-script.js
// DO NOT RUN WITHOUT USER APPROVAL

db['collection-name'].find({ /* old format */ }).forEach(doc => {
  db['collection-name'].updateOne(
    { _id: doc._id },
    { $set: { /* new format */ } }
  );
});
```

### Frontend Debugging Agent

**When to use:** Investigating client-side issues, data display problems

**Workflow:**

1. Check React component for data fetching logic
2. Verify server action responses
3. Check for data transformation issues
4. Look for type mismatches between frontend and backend
5. Test with browser dev tools

**Common issues to check:**

- Are IDs being compared correctly? (string vs number)
- Is data being serialized properly? (using `toJSON()`)
- Are Zod schemas validating correctly?
- Are error states being handled?

## Agent Best Practices

### When Working with Database

1. **Always investigate before modifying** - Use `find()` and `countDocuments()` first
2. **Sample before bulk operations** - Test on one document before updating many
3. **Check related collections** - ID mismatches often span multiple collections
4. **Document schema changes** - Update both CLAUDE.md and inline comments

### When Fixing Bugs

1. **Reproduce the issue** - Understand what the user is seeing
2. **Check the data** - Use mongosh to inspect actual database records
3. **Trace the flow** - Follow data from database → server action → component
4. **Verify the fix** - Test with actual data, not just types

### When Creating New Features

1. **Follow existing patterns** - Look at similar features first
2. **Use existing schemas** - Extend rather than create new ones when possible
3. **Handle errors gracefully** - Always return `{ success, data?, error? }`
4. **Test with real data** - Don't rely on mocked data alone

## Common Debugging Commands

### Check Active Students

```bash
mongosh "mongodb+srv://..." --eval "
db.students.find({ active: true }).count();
db.students.find({ active: true }).limit(3).forEach(s => print(s.studentID, s.firstName, s.lastName));
"
```

### Find Orphaned Records

```bash
mongosh "mongodb+srv://..." --eval "
// Find assessment records without matching students
const assessmentIds = db['roadmaps-student-data'].distinct('studentId');
print('Assessment student IDs:', assessmentIds);

assessmentIds.forEach(id => {
  const student = db.students.findOne({ studentID: id });
  if (!student) {
    print('⚠️  No student found for ID:', id);
  }
});
"
```

### Check Collection Indexes

```bash
mongosh "mongodb+srv://..." --eval "
db['collection-name'].getIndexes().forEach(idx => {
  print(idx.name, ':', JSON.stringify(idx.key));
});
"
```

## Emergency Procedures

### Rollback a Bad Migration

1. Never delete data immediately - mark as deleted instead
2. Keep backups in a separate collection: `db['collection-backup-YYYYMMDD']`
3. Use transactions when possible (though not all MongoDB versions support them)

### Fix Index Issues

If you see `E11000 duplicate key error`:

1. Check what indexes exist: `db['collection'].getIndexes()`
2. Drop the problematic index: `db['collection'].dropIndex('index_name')`
3. Verify schema doesn't recreate it: Check for `unique: true` or `index: true`
4. Set `autoIndex: false` in schema options if needed
