# Podsie Queries

## Podsie Completions

```bash
# Recent Podsie completions
/usr/local/bin/mongosh "$DATABASE_URL" --eval "
db['podsie-completions'].find({}).sort({ createdAt: -1 }).limit(10).forEach(printjson);
"

# Completions for a student
/usr/local/bin/mongosh "$DATABASE_URL" --eval "
db['podsie-completions'].find({ podsieStudentId: 'student-slug' }).forEach(printjson);
"

# Completions by assignment
/usr/local/bin/mongosh "$DATABASE_URL" --eval "
db['podsie-completions'].find({ podsieAssignmentId: 'assignment-id' }).forEach(printjson);
"

# Completions in date range
/usr/local/bin/mongosh "$DATABASE_URL" --eval "
const startDate = new Date('2024-01-01');
const endDate = new Date('2024-01-31');
db['podsie-completions'].find({
  createdAt: { \$gte: startDate, \$lte: endDate }
}).forEach(printjson);
"
```

## Aggregations

```bash
# Count completions per assignment
/usr/local/bin/mongosh "$DATABASE_URL" --eval "
db['podsie-completions'].aggregate([
  { \$group: { _id: '\$assignmentName', count: { \$sum: 1 } } },
  { \$sort: { count: -1 } }
]).limit(20).forEach(printjson);
"

# Completions by date
/usr/local/bin/mongosh "$DATABASE_URL" --eval "
db['podsie-completions'].aggregate([
  { \$group: {
    _id: { \$dateToString: { format: '%Y-%m-%d', date: '\$createdAt' } },
    count: { \$sum: 1 }
  }},
  { \$sort: { _id: -1 } },
  { \$limit: 14 }
]).forEach(printjson);
"
```

## Podsie Question Maps

```bash
# List question mappings
/usr/local/bin/mongosh "$DATABASE_URL" --eval "
db['podsie-question-maps'].find({}).limit(10).forEach(printjson);
"

# Questions for a skill
/usr/local/bin/mongosh "$DATABASE_URL" --eval "
db['podsie-question-maps'].find({ skillNumber: 'G8.01' }).forEach(printjson);
"
```

## Key Fields - Completions

| Field | Type | Description |
|-------|------|-------------|
| `podsieStudentId` | string | Podsie student identifier |
| `podsieAssignmentId` | string | Podsie assignment ID |
| `assignmentName` | string | Assignment name |
| `createdAt` | Date | Completion timestamp |
| `score` | number | Score achieved |
| `totalQuestions` | number | Total questions |
| `correctAnswers` | number | Correct answers |
