# Skill "Appears In" Migration

## Overview
This migration adds pre-computed relationship data to all skills, showing where each skill appears in the curriculum.

## What It Does
For each skill, it computes and stores:
- **As Target**: Units where this skill is a target skill
- **As Essential**: Other skills that require this skill as essential (with their units)
- **As Helpful**: Other skills that list this skill as helpful (with their units)
- **As Support**: Units where this skill is a support skill

## Benefits
- **Performance**: 1 query instead of 3+ per skill page load
- **Speed**: Instant page loads instead of slow database searches
- **Cost**: Much lower database load

## How to Run

### Prerequisites
- Database connection configured
- TypeScript/TSX installed

### Run the Migration
```bash
# From the project root
tsx scripts/migrate-skill-appears-in.ts
```

### Expected Output
```
🚀 Starting skill appearsIn migration...

📊 Found 500 skills to process

📝 Progress: 10/500 (2%)
📝 Progress: 20/500 (4%)
...
📝 Progress: 500/500 (100%)

✅ Migration complete!
   Processed: 500
   Updated: 500
   Skipped: 0
```

## What Gets Updated
Each skill document will have a new `appearsIn` field:

```javascript
{
  skillNumber: "660",
  title: "Example Skill",
  // ... other fields ...
  appearsIn: {
    asTarget: [
      { grade: "Grade 8", unitTitle: "Unit 5 - Functions", unitNumber: 5 }
    ],
    asEssential: [
      {
        skillNumber: "680",
        title: "Advanced Functions",
        units: [
          { grade: "Grade 8", unitTitle: "Unit 6 - Systems", unitNumber: 6 }
        ]
      }
    ],
    asHelpful: [
      {
        skillNumber: "650",
        title: "Basic Algebra",
        units: [
          { grade: "Grade 7", unitTitle: "Unit 4 - Expressions", unitNumber: 4 }
        ]
      }
    ],
    asSupport: [
      { grade: "Grade 6", unitTitle: "Unit 2 - Ratios", unitNumber: 2 }
    ]
  }
}
```

## Maintenance
This data should be updated whenever:
- Skills are scraped/updated
- Units are scraped/updated
- Skill relationships change

The scraper should include logic to maintain the `appearsIn` field automatically.

## Verification
After running the migration, you can verify by checking a skill document:

```javascript
// In MongoDB shell or Compass
db.getCollection('roadmaps-skills').findOne({ skillNumber: "660" })
```

Check that the `appearsIn` field exists and contains the expected data.
