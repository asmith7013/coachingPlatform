# Migration Example: What Will Happen

## Example Skill: #660 "Translations"

### BEFORE Migration
```javascript
{
  _id: ObjectId("..."),
  skillNumber: "660",
  title: "Translations",
  essentialSkills: [...],
  helpfulSkills: [...],
  units: [
    { grade: "Grade 8", unitTitle: "Unit 5 - Functions", unitNumber: 5 }
  ],
  // ... other fields ...
  // NO appearsIn field yet
}
```

### AFTER Migration (What Gets Added)
```javascript
{
  _id: ObjectId("..."),
  skillNumber: "660",
  title: "Translations",
  essentialSkills: [...],
  helpfulSkills: [...],
  units: [
    { grade: "Grade 8", unitTitle: "Unit 5 - Functions", unitNumber: 5 }
  ],
  // ... other fields ...

  // NEW FIELD ADDED:
  appearsIn: {
    // Units where 660 is listed as a target skill
    asTarget: [
      { grade: "Grade 8", unitTitle: "Unit 3 - Geometry", unitNumber: 3 }
    ],

    // Other skills that need 660 as an essential prerequisite
    asEssential: [
      {
        skillNumber: "680",
        title: "Understand Rotations",
        units: [
          { grade: "Grade 8", unitTitle: "Unit 4 - Transformations", unitNumber: 4 }
        ]
      }
    ],

    // Other skills that list 660 as helpful
    asHelpful: [
      {
        skillNumber: "650",
        title: "Coordinate Plane",
        units: [
          { grade: "Grade 7", unitTitle: "Unit 6 - Graphs", unitNumber: 6 }
        ]
      }
    ],

    // Units where 660 is listed as a support skill
    asSupport: [
      { grade: "Grade 6", unitTitle: "Unit 2 - Shapes", unitNumber: 2 }
    ]
  }
}
```

## What This Means

### User Experience
When viewing Skill #660 in the UI, students/teachers will see:

**Appears In**
- **As Target Skill**
  - Grade 8 • Unit 3 - Geometry

- **As Essential Skill**
  - [680] Understand Rotations
    - Grade 8 • Unit 4 - Transformations

- **As Helpful Skill**
  - [650] Coordinate Plane
    - Grade 7 • Unit 6 - Graphs

- **As Support Skill**
  - Grade 6 • Unit 2 - Shapes

### Performance Impact
- **Before**: 3+ database queries every time someone views a skill page
- **After**: 0 extra queries (data is pre-computed)
- **Result**: Instant page loads

## Safety Guarantees

1. ✅ **Only adds data** - Never deletes or modifies existing fields
2. ✅ **Optional field** - Old code continues to work without it
3. ✅ **Idempotent** - Can run multiple times safely (just updates the field)
4. ✅ **Read-only queries** - Only reads from units/skills collections
5. ✅ **Single update per skill** - Uses `$set` operator for the one field

## MongoDB Operation
```javascript
// For each skill, the migration runs:
await RoadmapsSkillModel.updateOne(
  { skillNumber: "660" },
  { $set: { appearsIn: computedData } }
);
```

This is equivalent to:
```sql
UPDATE roadmaps_skills
SET appears_in = <computed_data>
WHERE skill_number = '660';
```

## Test First (Recommended)
Query one skill before migration:
```javascript
db.getCollection('roadmaps-skills').findOne({ skillNumber: "660" })
```

Run the migration, then query again to see the new field.

## Rollback (If Needed)
If you want to undo the migration:
```javascript
db.getCollection('roadmaps-skills').updateMany(
  {},
  { $unset: { appearsIn: "" } }
);
```

This removes the `appearsIn` field from all skills, returning to the original state.
