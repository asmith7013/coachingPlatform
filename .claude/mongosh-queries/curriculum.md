# Curriculum Queries

## Scope and Sequence

```bash
# List all entries
mongosh "$DATABASE_URL" --eval "
db['scope-and-sequence'].find({}).limit(20).forEach(printjson);
"

# Entries by tag (grade level)
mongosh "$DATABASE_URL" --eval "
db['scope-and-sequence'].find({ scopeSequenceTag: 'Grade 8' }).forEach(printjson);
"

# Entries by unit number
mongosh "$DATABASE_URL" --eval "
db['scope-and-sequence'].find({ unitNumber: 1 }).forEach(printjson);
"

# Count entries per tag
mongosh "$DATABASE_URL" --eval "
db['scope-and-sequence'].aggregate([
  { \$group: { _id: '\$scopeSequenceTag', count: { \$sum: 1 } } },
  { \$sort: { _id: 1 } }
]).forEach(printjson);
"

# Get lesson sequence for a unit
mongosh "$DATABASE_URL" --eval "
db['scope-and-sequence'].find({
  scopeSequenceTag: 'Grade 8',
  unitNumber: 1
}).sort({ lessonNumber: 1 }).forEach(printjson);
"
```

## Learning Content

```bash
# List all learning content
mongosh "$DATABASE_URL" --eval "
db['learning-content'].find({}).limit(10).forEach(printjson);
"

# Content by skill
mongosh "$DATABASE_URL" --eval "
db['learning-content'].find({ skillNumber: 'G8.01' }).forEach(printjson);
"

# Content by type
mongosh "$DATABASE_URL" --eval "
db['learning-content'].find({ contentType: 'worked-example' }).forEach(printjson);
"

# Recently updated
mongosh "$DATABASE_URL" --eval "
db['learning-content'].find({}).sort({ updatedAt: -1 }).limit(10).forEach(printjson);
"
```

## Key Fields

| Field | Type | Description |
|-------|------|-------------|
| `scopeSequenceTag` | string | Grade level tag |
| `unitNumber` | number | Unit number |
| `lessonNumber` | number | Lesson sequence |
| `skillNumber` | string | Associated skill |
| `contentType` | string | Type (e.g., "worked-example") |

## Assignment Variations

```bash
# List variations
mongosh "$DATABASE_URL" --eval "
db['assignment-variations'].find({}).limit(5).forEach(printjson);
"

# Variations by unit
mongosh "$DATABASE_URL" --eval "
db['assignment-variations'].find({ grade: '8', unitNumber: 4 }).forEach(printjson);
"
```

### Key Fields - Assignment Variations

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Assignment title |
| `slug` | string | URL-friendly identifier |
| `grade` | string | Grade level |
| `unitNumber` | number | Unit number |
| `lessonNumber` | number | Lesson number |
| `section` | string | Lesson section |
| `questions` | array | Question variations with `questionText`, `correctAnswer`, `explanation` |
| `generatedBy` | string | "ai" or "manual" |

## Worked Example Requests

```bash
# Pending requests
mongosh "$DATABASE_URL" --eval "
db['worked-example-requests'].find({ status: 'pending' }).forEach(printjson);
"

# Requests by status
mongosh "$DATABASE_URL" --eval "
db['worked-example-requests'].aggregate([
  { \$group: { _id: '\$status', count: { \$sum: 1 } } }
]).forEach(printjson);
"
```

### Key Fields - Worked Example Requests

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | pending, in_progress, completed, cancelled |
| `lessonName` | string | Full lesson name |
| `grade` | string | Grade level |
| `unitNumber` | number | Unit number |
| `lessonNumber` | number | Lesson number |
| `strugglingSkillNumbers` | string[] | Skills student struggles with |
| `strugglingDescription` | string | Misconception description |
| `requestedBy` | string | User ID |
| `requestedByEmail` | string | User email |
