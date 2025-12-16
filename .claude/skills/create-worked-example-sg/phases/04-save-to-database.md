# Phase 4: Save to Database

## Purpose
Create metadata, sync slides to MongoDB, and provide the user with the presentation URL.

## Prerequisites
- Phases 1-3 complete
- All slide HTML files written to `src/app/presentations/{slug}/`

---

## Step 4.1: Create metadata.json

Create the metadata file in the same directory as the slides:

**File:** `src/app/presentations/{slug}/metadata.json`

```json
{
  "title": "[STRATEGY NAME] - [TOPIC]",
  "slug": "[slug]",
  "mathConcept": "[from PROBLEM ANALYSIS]",
  "mathStandard": "[if known, e.g., 7.RP.A.1]",
  "gradeLevel": "[6/7/8 or 'Algebra 1']",
  "unitNumber": [number],
  "lessonNumber": [number],
  "scopeAndSequenceId": "[from Phase 1 or null]",
  "strategyName": "[from STRATEGY DEFINITION]",
  "strategySteps": ["[VERB 1]", "[VERB 2]", "[VERB 3 if applicable]"],
  "learningGoals": [
    "[goal 1]",
    "[goal 2 if applicable]"
  ],
  "scenarios": [
    "[Scenario 1 name]",
    "[Scenario 2 name]",
    "[Scenario 3 name]"
  ]
}
```

**IMPORTANT:**
- `unitNumber` and `lessonNumber` are REQUIRED
- `slug` should be lowercase with hyphens (e.g., `balance-isolate-hanger-grade8`)
- `scopeAndSequenceId` can be `null` if not found in Phase 1

---

## Step 4.2: Sync to MongoDB

Use the sync script to upload to the database:

```bash
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH" && node .claude/skills/create-worked-example-sg/scripts/sync-to-db.js {slug}
```

Replace `{slug}` with the actual slug (e.g., `balance-isolate-hanger-grade8`).

**Expected output:**
```
✅ HTML Deck saved successfully!
Deck ID: [ObjectId]
Slug: [slug]
Total slides: [number]
📁 Local files: src/app/presentations/[slug]/
🔗 View at: /presentations/[slug]
```

**If you see errors:**
- Check that all slide files exist
- Verify metadata.json is valid JSON
- Ensure DATABASE_URL environment variable is set

---

## Step 4.3: Run Verification Script

Before declaring success, verify the worked example is complete:

```bash
npx tsx .claude/skills/create-worked-example-sg/scripts/verify-worked-example.ts --slug {slug} --verbose
```

**Expected output for success:**
```
============================================
  WORKED EXAMPLE VERIFICATION REPORT
============================================

STATUS: PASSED

Summary:
  Slides found: [8-11]
  Strategy name: [name]
  Strategy consistent: Yes
  Metadata valid: Yes
  Progress file exists: No (good)
```

**If verification fails:**
- Review the errors listed
- Fix missing slides or metadata issues
- Re-run verification

---

## Step 4.3.5: Check for SVG Overlaps (Quality Check)

Run the SVG overlap checker on all slides containing coordinate planes or graphs:

```bash
for slide in src/app/presentations/{slug}/slide-*.html; do
  node .claude/skills/create-worked-example-sg/scripts/check-svg-overlaps.js "$slide" 2>/dev/null || true
done
```

**This is a quality check, not a blocker.** The script detects:
- Text labels overlapping data points
- Arrow markers overlapping circles
- Annotation text overlapping axis labels
- Elements positioned too close together

**If overlaps are detected:**
1. Review the flagged elements in the output
2. Adjust positioning or sizing in the affected slide(s):
   - Move labels further from points (add 10-15px offset)
   - Use smaller markers: `markerWidth="6" markerHeight="4"`
   - Reduce font sizes for annotations: `font-size="9"`
   - Shorten lines so arrow markers don't overlap points
3. Re-run sync and verification after fixes

**Common fixes:**
| Problem | Solution |
|---------|----------|
| Point label overlaps point | Move label 15px above: `y="[point_y - 15]"` |
| Arrow overlaps point | Shorten line by 8px from endpoint |
| Rise/run labels too large | Use `font-size="9"` and shorter text |

---

## Step 4.4: Clean Up Progress File

**Only after verification passes**, delete the progress file:

```bash
rm src/app/presentations/{slug}/.worked-example-progress.json
```

The progress file should NOT be committed to the repository or synced to the database.

---

## Step 4.5: Provide Summary to User

Give the user a complete summary:

```
## Worked Example Created!

**Title:** [STRATEGY NAME] - [TOPIC]
**Grade Level:** [grade]
**Strategy:** [strategy name] ([VERB 1] → [VERB 2] → [VERB 3])
**Total Slides:** [number]

**The 3 Scenarios:**
1. [Scenario 1 name] (worked example)
2. [Scenario 2 name] (practice)
3. [Scenario 3 name] (practice)

**View at:** /presentations/[slug]

**Local files:** src/app/presentations/[slug]/
```

---

## Phase 4 Completion Checklist

- [ ] metadata.json created with all required fields
- [ ] Sync script ran successfully
- [ ] Database entry confirmed
- [ ] Verification script passed
- [ ] SVG overlap check ran (account for any warnings if present)
- [ ] Progress file deleted
- [ ] User provided with presentation URL

---

## DONE

The worked example is complete. The user can:
- View it at `/presentations/{slug}`
- Edit individual slides in `src/app/presentations/{slug}/`
- Re-sync after edits using the same sync command

---

## Troubleshooting

### Sync script fails
1. Check slide files exist: `ls src/app/presentations/{slug}/`
2. Verify metadata.json syntax: `cat src/app/presentations/{slug}/metadata.json | jq .`
3. Check DATABASE_URL: `echo $DATABASE_URL | head -c 50`

### "Deck already exists" message
This is normal - the script automatically deletes and replaces existing decks with the same slug.

### Missing slides in database
Re-run the sync script. Ensure all `slide-*.html` files follow the naming pattern.
