# Podsie Queries

## Podsie Completions

```bash
# Recent Podsie completions
mongosh "$DATABASE_URL" --eval "
db['podsie-completions'].find({}).sort({ createdAt: -1 }).limit(10).forEach(printjson);
"

# Completions for a student
mongosh "$DATABASE_URL" --eval "
db['podsie-completions'].find({ podsieStudentId: 'student-slug' }).forEach(printjson);
"

# Completions by assignment
mongosh "$DATABASE_URL" --eval "
db['podsie-completions'].find({ podsieAssignmentId: 'assignment-id' }).forEach(printjson);
"

# Completions in date range
mongosh "$DATABASE_URL" --eval "
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
mongosh "$DATABASE_URL" --eval "
db['podsie-completions'].aggregate([
  { \$group: { _id: '\$assignmentName', count: { \$sum: 1 } } },
  { \$sort: { count: -1 } }
]).limit(20).forEach(printjson);
"

# Completions by date
mongosh "$DATABASE_URL" --eval "
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
mongosh "$DATABASE_URL" --eval "
db['podsie-question-maps'].find({}).limit(10).forEach(printjson);
"

# Questions for a skill
mongosh "$DATABASE_URL" --eval "
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

---

## Podsie SCM Groups

```bash
# List all SCM groups
mongosh "$DATABASE_URL" --eval "
db['podsie-scm-groups'].find({}).limit(10).forEach(printjson);
"

# Find group by Podsie group ID
mongosh "$DATABASE_URL" --eval "
db['podsie-scm-groups'].findOne({ podsieGroupId: 349 });
"

# Groups by school
mongosh "$DATABASE_URL" --eval "
db['podsie-scm-groups'].find({ school: 'IS313' }).forEach(printjson);
"
```

### Key Fields - SCM Groups

| Field | Type | Description |
|-------|------|-------------|
| `podsieGroupId` | number | Unique Podsie group identifier |
| `groupName` | string | Display name |
| `gradeLevel` | string | Grade level (e.g., "8") |
| `school` | string | School code |

## Podsie SCM Modules (Pacing Config)

```bash
# List all module configs
mongosh "$DATABASE_URL" --eval "
db['podsie-scm-modules'].find({}).limit(10).forEach(printjson);
"

# Config for specific group + module
mongosh "$DATABASE_URL" --eval "
db['podsie-scm-modules'].findOne({ podsieGroupId: 349, podsieModuleId: 294 });
"

# Assignments with Zearn codes
mongosh "$DATABASE_URL" --eval "
db['podsie-scm-modules'].aggregate([
  { \$unwind: '\$assignments' },
  { \$match: { 'assignments.zearnLessonCode': { \$ne: null } } },
  { \$project: { podsieGroupId: 1, 'assignments.assignmentTitle': 1, 'assignments.zearnLessonCode': 1 } }
]).forEach(printjson);
"
```

### Key Fields - SCM Modules

| Field | Type | Description |
|-------|------|-------------|
| `podsieGroupId` | number | Group identifier |
| `podsieModuleId` | number | Module identifier |
| `moduleStartDate` | string | Start date (YYYY-MM-DD) |
| `unitNumber` | number | Unit number |
| `assignments` | array | Pacing entries with `podsieAssignmentId`, `dueDate`, `groupNumber`, `groupLabel`, `orderIndex`, `assignmentTitle`, `zearnLessonCode`, `state` |
| `completedSections` | number[] | Completed group numbers |
| `pointsRewardGoal` | number | Points goal |

## Ramp-Up Progress

```bash
# Progress for a student
mongosh "$DATABASE_URL" --eval "
db['ramp-up-progress'].find({ studentId: 'student-slug' }).forEach(printjson);
"

# Completed ramp-ups
mongosh "$DATABASE_URL" --eval "
db['ramp-up-progress'].find({ isFullyComplete: true }).limit(10).forEach(printjson);
"
```

### Key Fields - Ramp-Up Progress

| Field | Type | Description |
|-------|------|-------------|
| `studentId` | string | Student reference |
| `unitCode` | string | Ramp-up unit code |
| `totalQuestions` | number | Total questions |
| `completedCount` | number | Completed questions |
| `percentComplete` | number | Percent complete |
| `isFullyComplete` | boolean | Fully completed flag |
