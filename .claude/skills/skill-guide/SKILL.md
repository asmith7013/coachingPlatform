# Skill Guide

This skill helps you understand how to create and use Claude skills in this project.

## Quick Start: Creating a New Skill

1. **Create the skill folder**:
   ```bash
   mkdir .claude/skills/your-skill-name
   ```

2. **Create SKILL.md** (required entry point):
   ```bash
   # Create .claude/skills/your-skill-name/SKILL.md
   ```

3. **Register in settings.local.json**:
   Add `"Skill(your-skill-name)"` to `.claude/settings.local.json` → `permissions.allow` array

4. **Test**: `/skill your-skill-name`

## Full Documentation

For comprehensive documentation on skills, read the main README:

**ACTION**: Read `.claude/skills/README.md` for:
- Complete skills structure
- All available skills and their purposes
- Detailed usage examples for CLI and Cursor
- When to use which skill
- Maintenance guidelines

## Currently Available Skills

| Skill | Purpose |
|-------|---------|
| `app-development` | Building pages, components, server actions |
| `create-p5-animation` | Math visualizations with p5.js |
| `create-worked-example-sg` | Worked example study guides |
| `question-types` | Question type patterns |
| `skill-guide` | This guide - skill creation reference |

## Skill Structure Pattern

```
.claude/skills/your-skill/
├── SKILL.md           # Required: Main entry point
├── topic-1.md         # Optional: Supporting docs
├── topic-2.md         # Optional: More docs
└── examples/          # Optional: Example files
```

## Invocation Methods

- **CLI**: `/skill skill-name`
- **Cursor**: `@skill-name`
- **Natural language**: "Use the skill-name skill to help me..."
