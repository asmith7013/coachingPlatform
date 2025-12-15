# Data Fixes & Maintenance

## Update Operations

```bash
# Update a single field
/usr/local/bin/mongosh "$DATABASE_URL" --eval "
const result = db.students.updateOne(
  { studentID: 12345 },
  { \$set: { section: '803' } }
);
printjson(result);
"

# Update multiple fields
/usr/local/bin/mongosh "$DATABASE_URL" --eval "
const result = db.students.updateOne(
  { studentID: 12345 },
  { \$set: { section: '803', gradeLevel: '8', active: true } }
);
printjson(result);
"

# Bulk update
/usr/local/bin/mongosh "$DATABASE_URL" --eval "
const result = db.students.updateMany(
  { section: '802', school: 'IS313' },
  { \$set: { gradeLevel: '8' } }
);
print('Modified:', result.modifiedCount, 'documents');
"
```

## Array Operations

```bash
# Add to array
/usr/local/bin/mongosh "$DATABASE_URL" --eval "
const result = db.students.updateOne(
  { studentID: 12345 },
  { \$push: { masteredSkills: 'G8.05' } }
);
printjson(result);
"

# Remove from array
/usr/local/bin/mongosh "$DATABASE_URL" --eval "
const result = db.students.updateOne(
  { studentID: 12345 },
  { \$pull: { masteredSkills: 'G8.05' } }
);
printjson(result);
"

# Add only if not exists
/usr/local/bin/mongosh "$DATABASE_URL" --eval "
const result = db.students.updateOne(
  { studentID: 12345 },
  { \$addToSet: { masteredSkills: 'G8.05' } }
);
printjson(result);
"
```

## Delete Operations

```bash
# Delete single document
/usr/local/bin/mongosh "$DATABASE_URL" --eval "
const result = db['podsie-completions'].deleteOne({ _id: ObjectId('...') });
print('Deleted:', result.deletedCount);
"

# Delete old records
/usr/local/bin/mongosh "$DATABASE_URL" --eval "
const cutoffDate = new Date('2023-01-01');
const result = db['page-views'].deleteMany({
  timestamp: { \$lt: cutoffDate }
});
print('Deleted:', result.deletedCount, 'old page views');
"
```

## Index Management

```bash
# List indexes
/usr/local/bin/mongosh "$DATABASE_URL" --eval "
printjson(db.students.getIndexes());
"

# Create index
/usr/local/bin/mongosh "$DATABASE_URL" --eval "
db.students.createIndex({ school: 1, section: 1 });
"

# Drop index
/usr/local/bin/mongosh "$DATABASE_URL" --eval "
db.students.dropIndex('section_1_school_1');
"
```

## Data Validation

```bash
# Find documents with missing fields
/usr/local/bin/mongosh "$DATABASE_URL" --eval "
db.students.find({
  \$or: [
    { studentID: { \$exists: false } },
    { firstName: { \$exists: false } }
  ]
}).forEach(printjson);
"

# Find orphaned records
/usr/local/bin/mongosh "$DATABASE_URL" --eval "
const validSections = db['section-configs'].distinct('classSection');
db.students.find({
  active: true,
  section: { \$nin: validSections }
}).forEach(printjson);
"
```
