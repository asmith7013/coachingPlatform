# Claude Skills for AI Coaching Platform

This directory contains specialized Claude skills that provide comprehensive documentation and patterns for working on the AI Coaching Platform.

## Skills Structure

```
.claude/skills/
├── README.md                    # This file
├── app-development/             # General app/page development
│   ├── SKILL.md                # Main reference
│   ├── architecture.md         # Core architecture & patterns
│   ├── component-system.md     # UI components & design
│   ├── data-flow.md            # Backend, APIs & database
│   ├── tanstack-table.md       # Data tables
│   └── workflows.md            # Development processes
└── create-p5-animation/         # Math animation creation
    ├── SKILL.md                # Main reference
    ├── AUTO-MANUAL-TOGGLE-PATTERN.md
    ├── QUICK-REFERENCE.md
    ├── examples/               # Animation type guides
    ├── primitives/             # Building blocks (colors, shapes)
    └── scenarios/              # Math concept templates
```

## Available Skills

### 1. `app-development` - General App Development
**Use when**: Building pages, components, server actions, and features

**Location**: `.claude/skills/app-development/SKILL.md`

**Includes**:
- `architecture.md` - Core architecture & patterns
- `component-system.md` - UI components & design
- `data-flow.md` - Backend, APIs & database
- `tanstack-table.md` - Data tables
- `workflows.md` - Development processes

**Invoke with**: `/skill app-development` or reference in Cursor with `@app-development`

---

### 2. `create-p5-animation` - Math Manipulative Animations
**Use when**: Creating p5.js animations for math education

**Location**: `.claude/skills/create-p5-animation/SKILL.md`

**Includes**:
- p5.js code structure and 600x600 canvas requirements
- Color palette (orange, purple, red, yellow, etc.)
- Auto/Manual toggle pattern for multi-phase animations
- Animation type guides (fractions, ratios, multiplication, tape diagrams, coordinate plane, geometry)
- Animation techniques (sequential fill, easing, fade)
- Primitives and scenario templates

**Invoke with**: `/skill create-p5-animation` or reference in Cursor with `@create-p5-animation`

---

## Usage Guide

### In Claude Code CLI

```bash
# Invoke a skill
/skill app-development
/skill create-p5-animation

# Or ask Claude to use a specific skill
"Use the app-development skill to help me create a new server action"
"Use the create-p5-animation skill to create a fractions visualization"
```

### In Cursor AI

Skills can be referenced in Cursor using the `@` syntax:

```
@app-development help me understand the import patterns

@app-development show me how to create a server action for fetching students

@create-p5-animation create a ratio animation for 3:4

@create-p5-animation build a tape diagram for solving equations
```

## When to Use Which Skill

### Building App Features
Use **`app-development`** for:
- New pages and routes
- Server actions and database operations
- UI components and layouts
- Data tables with TanStack Table
- Forms and validation
- React Query patterns

### Creating Math Visualizations
Use **`create-p5-animation`** for:
- p5.js canvas animations
- Math manipulatives (fractions, ratios, multiplication)
- Tape diagrams and algebra visualizations
- Coordinate plane graphing
- Geometry animations

## Quick Reference

| Task | Skill |
|------|-------|
| New page/feature | `app-development` |
| Server action | `app-development` |
| UI component | `app-development` |
| Data table | `app-development` |
| Math animation | `create-p5-animation` |
| p5.js visualization | `create-p5-animation` |

## Maintenance

### Adding New Skills

1. Create a new folder in `.claude/skills/`
2. Add a `SKILL.md` as the main reference
3. Include supporting documentation files
4. **IMPORTANT: Add the skill to `.claude/settings.local.json`**
   - Open `.claude/settings.local.json`
   - Add `Skill(your-skill-name)` to the `permissions.allow` array
   - Example: `"Skill(create-new-feature)"`
   - This allows the skill to be auto-approved and used without prompts
5. Update this README with skill details

### Example: Adding a New Skill

```bash
# 1. Create skill folder and files
mkdir .claude/skills/my-new-skill
echo "# My New Skill" > .claude/skills/my-new-skill/SKILL.md

# 2. Add to settings.local.json
# Open .claude/settings.local.json and add to the "allow" array:
"Skill(my-new-skill)"

# 3. Test the skill
/skill my-new-skill
```

### Updating Existing Skills

1. Edit files in the skill folder
2. Update `SKILL.md` if structure changes
3. Test by invoking the skill

### Currently Registered Skills

Skills in `.claude/settings.local.json`:
- `Skill(app-development)` - General app/page development
- `Skill(create-p5-animation)` - Math animation creation
- `Skill(create-worked-example-sg)` - Worked example study guides
- `Skill(question-types)` - Question type patterns

---

**Last Updated**: December 2024
**Maintained By**: AI Coaching Platform Team
