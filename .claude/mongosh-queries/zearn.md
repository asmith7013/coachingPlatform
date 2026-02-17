# Zearn Import Records

## Basic Queries

```bash
# Recent imports
mongosh "$DATABASE_URL" --eval "
db.zearn_import_records.find({}).sort({ date: -1 }).limit(10).forEach(printjson);
"

# Imports for a student
mongosh "$DATABASE_URL" --eval "
db.zearn_import_records.find({ studentID: 12345 }).forEach(printjson);
"

# Imports by section
mongosh "$DATABASE_URL" --eval "
db.zearn_import_records.find({ section: '803' }).limit(10).forEach(printjson);
"
```

## Aggregations

```bash
# Count imports per section
mongosh "$DATABASE_URL" --eval "
db.zearn_import_records.aggregate([
  { \$group: { _id: '\$section', count: { \$sum: 1 } } },
  { \$sort: { count: -1 } }
]).forEach(printjson);
"

# Unique lessons per student
mongosh "$DATABASE_URL" --eval "
db.zearn_import_records.aggregate([
  { \$group: { _id: '\$studentID', lessons: { \$addToSet: '\$lessonTitle' } } },
  { \$project: { studentID: '\$_id', lessonCount: { \$size: '\$lessons' } } },
  { \$sort: { lessonCount: -1 } }
]).limit(10).forEach(printjson);
"
```

## Key Fields

| Field | Type | Description |
|-------|------|-------------|
| `date` | string | Import date |
| `section` | string | Class section |
| `teacher` | string | Teacher name |
| `studentID` | number | SIS student ID |
| `firstName` | string | First name |
| `lastName` | string | Last name |
| `lessonTitle` | string | Zearn lesson name |
| `lessonCompletionDate` | string | Completion date |
| `weekRange` | string | Week range |
| `weeklyMinutes` | string | Weekly minutes |
| `importedAt` | string | Import timestamp |
| `importedBy` | string | Importing user |
