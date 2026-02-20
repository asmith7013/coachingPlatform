---
name: seed-skillshub-data
description: Populates Skills Hub mock data for 3 teachers (Jane Doe, Maria Santos, Marcus Williams). Creates skill statuses, action plans, observations, and notes in the LOCAL MongoDB database.
allowed-tools: Read, Bash, Grep, Glob
allowedCommands:
  - "~/solves-coaching/.claude/skills/seed-skillshub-data/run.sh"
---

# Seed Skills Hub Data

Populates realistic mock data for the Skills Hub feature in the **local MongoDB database**. Seeds data for 3 teachers with coach Alex Smith (`alex.smith@teachinglab.org`).

## Usage

```bash
~/solves-coaching/.claude/skills/seed-skillshub-data/run.sh
```

## Teachers

### 1. Jane Doe (`jane.doe@schools.nyc.gov`)

Mid-coaching teacher working on small group facilitation.

| Collection | Count | Details |
|---|---|---|
| Coaching assignments | 1 | alex.smith → Jane Doe (60 days) |
| Skill statuses | 22 | 3 active, 6 developing, 13 proficient |
| Action plans | 3 | open, closed, archived |
| Action steps | 8 | 3 + 3 + 2 |
| Observations | 4 | classroom_visit, debrief, one_on_one, quick_update |
| Skill notes | 5 | Tagged to skills and plans |

**Plans:** Small Group Facilitation (open) → Lesson Launch Routines (closed) → Classroom Culture Foundations (archived)

### 2. Maria Santos (`maria.santos@schools.nyc.gov`)

Experienced teacher transitioning to inquiry-based instruction.

| Collection | Count | Details |
|---|---|---|
| Coaching assignments | 1 | alex.smith → Maria Santos (90 days) |
| Skill statuses | 17 | 3 active, 5 developing, 9 proficient |
| Action plans | 3 | open, closed, archived |
| Action steps | 8 | 3 + 3 + 2 |
| Observations | 3 | classroom_visit, one_on_one, quick_update |
| Skill notes | 4 | Tagged to skills and plans |

**Plans:** Inquiry Group Facilitation (open) → Effective Directions & Routines (closed) → Lesson Launch Foundations (archived)

### 3. Marcus Williams (`marcus.williams@schools.nyc.gov`)

First-year teacher building classroom management foundations.

| Collection | Count | Details |
|---|---|---|
| Coaching assignments | 1 | alex.smith → Marcus Williams (30 days) |
| Skill statuses | 12 | 3 active, 4 developing, 5 proficient |
| Action plans | 2 | open, closed |
| Action steps | 6 | 3 + 3 |
| Observations | 3 | classroom_visit, debrief, one_on_one |
| Skill notes | 3 | Tagged to skills and plans |

**Plans:** Classroom Management Foundations (open) → Building Student Relationships (closed)

## How It Works

- **Action plans drive skill statuses** — skill statuses are aligned to plans with L1/L2 prereq enforcement
- **Teachers are created if missing** — if a teacher email doesn't exist in the `staff` collection, a minimal record is created
- **Per-teacher configs** live in `seed/teachers/` — one file per teacher with all plans, steps, observations, and notes

## Safety

The script uses `DATABASE_URL` from `.env.local`. It will abort if the variable is missing.

## Re-running

Safe to re-run — the script deletes all existing `skillshub_*` data for each teacher before inserting fresh data.
