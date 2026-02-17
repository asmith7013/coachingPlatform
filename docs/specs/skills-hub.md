# Skills Hub

## Result
- Teachers see a visual skill map showing their progression across all teaching domains
- Coaches manage teacher development through action plans, action steps, observations, and rich notes — all tied to specific skills
- Centralized hub replaces scattered coaching notes, making the connection between daily coaching and skill development explicit
- Admins get aggregate summary with drill-down to any teacher's full view
- Skill taxonomy stored in mathkcs (JSON), imported into solves-coaching
- Auth switches from Google OAuth to Clerk magic link

## Purpose
- Teachers lack clear progression — goals feel unclear, no visible path forward
- Coaching conversations, action steps, and notes are scattered across tools
- No centralized place to track coaching goals over time
- Connection between daily coaching work (debriefs, 1:1s, observations) and skill development is not explicit

## Assumptions
- 3 schools — must account for multi-school context
- Existing platform roles (Teacher, Coach, Admin) are reused
- Coach-teacher relationship is many-to-many (teachers can have multiple coaches, coaches manage multiple teachers)
- Any assigned coach can set action steps and mark skills for a teacher (no "primary coach" concept)
- Skill taxonomy is the same for all teachers across all schools
- Teachers can view their own data but cannot change skill statuses
- Skill taxonomy editing approach TBD — start with code-only (JSON in mathkcs), design schema to support future UI editor
- Notes/media between coach and teacher are private to that pair; admins can see all

## Data Model

### Skill Taxonomy (source of truth: mathkcs)
- Structure: Domain → Subdomain → Skill
- 6 domains: Intellectual Preparation, Lesson Launch, 1:1 Coaching, Small Group Instruction, Inquiry Groups, Lesson Closing, Culture
- Each skill has a level: Level 1 (foundational) or Level 2 (advanced)
- Skill names + descriptions double as the "look fors" in the observation guide — no separate rubric data needed
- Stored as JSON in mathkcs repo, deployed via static API (same pattern as curriculum content)
- Imported into solves-coaching at build/runtime

### Teacher Skill Status
- Per teacher, per skill
- States: Not Started → Active → Developing → Proficient
- All skills visible to teacher at all times (no hard locking)
- Coach sets which skills are "Active" (in focus)
- Coach unlocks Level 2 skills per domain independently (no global gate)
- UI optimizes for displaying ~3 active/focus skills, but no hard cap in data model

### Action Plans
- Coach creates for a specific teacher
- Links to 1+ skills
- Teacher can have multiple open action plans simultaneously
- Lifecycle: Open → Closed (coach-controlled)
- No auto-cascading — closing a plan does not force linked skills to Proficient
- Mental model: like an open GitHub PR

### Action Steps (within action plans)
- Fields:
  - What to do (text)
  - Due date (flexible — could be next check-in or literal deadline)
  - Evidence of completion
  - Linked skills (1+)
- Can be individually marked complete by coach
- Closing the action plan does not auto-close action steps (coach decides)

### Observations
- Required fields:
  - Date
  - Teacher
  - At least one skill rating
- Optional metadata:
  - Observation type (classroom visit, debrief, 1:1)
  - Notes
  - Media (images, video)
  - Duration, class period, etc.
- Two entry paths:
  - Quick: update a single skill from the skill detail page
  - Batch: observation guide form (see below)

### Observation Guide (dynamic rubric)
- Form auto-generates directly from the skill taxonomy JSON — skill names and descriptions become the rubric rows
- No separate "look fors" or rubric data — single source of truth
- Organized by domain — each domain section shows its relevant focus skills
- Active action steps appear within their tagged domain/skill section alongside the rubric items
- "Show more" expands to reveal the full domain rubric (all skills, not just focus)
- Rating scale per look-for: Not Observed, Partial, Mostly, Fully
- Evidence field (free text) per look-for
- Overall rating + evidence per domain
- Only rated items get saved — unrated items don't clutter the observation record
- Form header: teacher, school, class, date

### Notes/Media
- Rich content: text, images, video
- Flexible tagging — can be tagged to any combination of:
  - Skill
  - Action plan
  - Action step
- Many-to-many tagging (a single note can be tagged to multiple entities)
- Private to teacher + assigned coach(es); admins can see all

### Coach-Teacher Assignments
- Many-to-many relationship stored in database
- Assignment page for managing pairings (add/remove teachers to a coach's caseload)

## Scenarios

### Teacher: View skill progression
1. Teacher logs in via magic link
2. Lands on Skills Hub — sees skill map organized by domain
3. Each skill shows current status (Not Started / Active / Developing / Proficient)
4. Active/focus skills are visually prominent
5. Teacher clicks a skill → skill detail page

### Teacher: View skill detail
1. Sees skill description and current status
2. Sees coach notes/media attached to this skill
3. Sees active action plans and action steps linked to this skill
4. Sees placeholder sections for master teacher video and related resources (coming soon)
5. Cannot edit anything — read-only

### Coach: Set focus skills for a teacher
1. Coach navigates to a teacher on their caseload
2. Views the teacher's skill map
3. Marks skills as "Active" (in focus)
4. Can activate Level 2 skills within any domain independently

### Coach: Create action plan
1. Coach opens a teacher's profile
2. Creates new action plan, links to 1+ skills
3. Adds structured action steps (what, due date, evidence of completion, linked skills)
4. Attaches notes/media to the plan or individual steps
5. Plan appears on both coach dashboard and teacher's skill detail

### Coach: Record observation via guide
1. Coach selects a teacher and starts an observation
2. Observation guide auto-generates showing focus skills organized by domain
3. Active action steps appear inline within their tagged skill/domain sections
4. Coach rates look-fors (Not Observed / Partial / Mostly / Fully) and adds evidence
5. Coach can "Show more" to expand full domain rubric and rate additional items
6. Only rated items are saved
7. Ratings and notes flow to the relevant skill detail pages

### Coach: Quick skill update
1. From a skill detail page, coach updates status + leaves a note
2. Lighter weight than full observation guide — for quick check-ins

### Coach: Manage caseload
1. Coach sees dashboard of all their teachers
2. Per teacher: current focus skills, active action plans, recent observations
3. Can mark individual action steps complete
4. Can close action plans
5. Can mark skills as Developing or Proficient

### Admin: View aggregate data
1. Admin lands on summary view across all teachers (filterable by school)
2. Sees aggregate skill progression data
3. Clicks into any teacher → sees the same full view a coach/teacher sees

### Admin: Manage coach-teacher assignments
1. Navigate to assignment page
2. Select a coach → see their current caseload
3. Add or remove teachers from the caseload

## Acceptance Criteria
- [ ] Skill taxonomy loads from mathkcs JSON into the platform
- [ ] Teacher can view full skill map organized by domain/subdomain
- [ ] Skill status per teacher persists: Not Started → Active → Developing → Proficient
- [ ] Coach can set skills as Active (in focus) for a teacher
- [ ] Coach can unlock Level 2 skills per domain
- [ ] Coach can create action plans linked to 1+ skills
- [ ] Action steps have: what to do, due date, evidence of completion, linked skills (required — must be tagged to at least one skill)
- [ ] Coach can mark action steps complete and close action plans independently
- [ ] No auto-cascading between action plan closure and skill status
- [ ] Observation guide auto-generates from teacher's focus skills, organized by domain
- [ ] Action steps appear inline in the observation guide under their tagged skill/domain
- [ ] "Show more" expands full domain rubric beyond focus skills
- [ ] Rubric rows pulled directly from skill taxonomy (name + description) — no separate rubric data
- [ ] Rating scale: Not Observed, Partial, Mostly, Fully — per skill
- [ ] Evidence free-text field per skill and overall rating per domain
- [ ] Only rated items saved in observation record
- [ ] Quick skill update available from skill detail page (lighter than full observation)
- [ ] Notes/media support flexible many-to-many tagging to skills, action plans, and action steps
- [ ] Notes/media support text, images, and video uploads
- [ ] Coach-teacher assignment page supports many-to-many relationships
- [ ] Teachers see read-only view of their own data
- [ ] Admins see aggregate summary + can drill into any teacher's full view
- [ ] Multi-school support (3 schools)
- [ ] Auth uses Clerk magic link instead of Google OAuth
- [ ] Skill detail page includes placeholder UI + schema fields for: master teacher videos, related resources

## Edge Cases
- Teacher with no coach assigned → skill map visible but no action plans; prompt to contact admin
- Coach removed from teacher → existing action plans/notes remain visible (historical record)
- Action step linked to multiple skills → completing the step doesn't auto-change any skill status
- Action plan with all steps complete → plan stays open until coach explicitly closes it
- Multiple coaches set conflicting skill statuses for same teacher → last write wins (most recent observation/update)
- Skill taxonomy updated in mathkcs → platform picks up changes; existing teacher statuses preserved for matching skill IDs; new skills default to Not Started

## Out of Scope
- AI Practice Simulator functionality
- AI Coaching Assistant (Ask Nisa) functionality
- Master teacher video content and playback
- Related resources content and browsing
- Gamification (badges, streaks, practice session counts, levels)
- Editable skill taxonomy UI (future — JSON-only for now)
- Notifications (email/push for action step due dates, etc.)

## Resolved Questions
- Action plan history preserved indefinitely — include an `archived` property for filtering
- Skills identified by stable unique ID — taxonomy changes (renames, description edits) match by ID, preserving existing teacher statuses
- No role-based restrictions on coach-teacher assignment — show all teachers as options
- Coach default landing page is their caseload dashboard

## Open Questions
- [ ] How does the platform import the mathkcs skill taxonomy — build-time bundling or runtime API fetch?
- [ ] What does the admin aggregate summary show? (e.g., % teachers at each level, skills most/least developed, per-school breakdowns)
