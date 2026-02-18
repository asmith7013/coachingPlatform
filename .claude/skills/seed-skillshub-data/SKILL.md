---
name: seed-skillshub-data
description: Populates Skills Hub mock data for teacher ccardona. Creates skill statuses, action plans, observations, and notes in the LOCAL MongoDB database.
allowed-tools: Read, Bash, Grep, Glob
allowedCommands:
  - "~/solves-coaching/.claude/skills/seed-skillshub-data/run.sh"
---

# Seed Skills Hub Data

Populates realistic mock data for the Skills Hub feature in the **local MongoDB database**. Seeds data for teacher ccardona (`ccardona@schools.nyc.gov`) with coach alex.smith (`alex.smith@teachinglab.org`).

## Usage

```bash
~/solves-coaching/.claude/skills/seed-skillshub-data/run.sh
```

## What It Creates

| Collection | Count | Details |
|---|---|---|
| `skillshub_coach_teacher_assignments` | 1 | alex.smith → ccardona |
| `skillshub_teacher_skill_statuses` | 18 | 8 proficient, 5 developing, 5 active |
| `skillshub_action_plans` | 3 | open, closed, archived |
| `skillshub_action_steps` | 7-8 | 2-3 per plan |
| `skillshub_observations` | 4 | Various types over past month |
| `skillshub_skill_notes` | 5 | Tagged to skills and plans |

### Action Plans Drive Skill Statuses

Skill statuses are aligned to action plans for realistic coaching progression:

- **Open plan** ("Small Group Facilitation") → skills set to `active`
- **Closed plan** ("Lesson Launch Routines") → skills set to `developing`
- **Archived plan** ("Classroom Culture Foundations") → skills set to `proficient`
- 3 additional Intellectual Prep skills → `proficient` (mastered independently)

### Observations

4 observations spread across the past month:
- Classroom visit with skill ratings
- Debrief session with notes
- One-on-one with domain ratings
- Quick update with brief notes

### Notes

5 coaching notes tagged to relevant skills and action plans.

## Safety

The script uses `DATABASE_URL` from `.env.local`. It will abort if the variable is missing.

## Re-running

Safe to re-run — the script deletes all existing `skillshub_*` data for ccardona before inserting fresh data.
