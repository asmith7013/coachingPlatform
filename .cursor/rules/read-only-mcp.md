# MCP Read-Only Access Rule

## CRITICAL CONSTRAINT: NO FILE MODIFICATIONS

Claude has MCP (Model Context Protocol) access to this project for **READ-ONLY** purposes only.

### ALLOWED OPERATIONS
✅ **Read any file** - Use freely to understand codebase, analyze issues, examine implementations
✅ **List directories** - Explore project structure and find relevant files  
✅ **Search files** - Find specific code patterns or implementations
✅ **Get file info** - Check file metadata, sizes, timestamps

### FORBIDDEN OPERATIONS  
❌ **NEVER write_file** - Do not create new files
❌ **NEVER edit_file** - Do not modify existing files
❌ **NEVER create_directory** - Do not create new directories
❌ **NEVER move_file** - Do not rename or move files
❌ **NEVER delete files** - Do not remove any files

## PROPER WORKFLOW

When Claude identifies issues or improvements:

1. **Read and analyze** relevant files to understand the problem
2. **Provide detailed analysis** of root causes and solutions
3. **Format response as Cursor prompt** following our established patterns
4. **Include specific code changes** that the human can copy-paste
5. **Never attempt to implement changes directly**

## EXAMPLE CORRECT RESPONSE FORMAT

```markdown
# Fix Component Issue

## SCOPE
- IN SCOPE: Fix the specific component behavior
- OUT OF SCOPE: Refactoring other components

## FILES REQUIRING UPDATES (2 total)
1. `src/components/MyComponent.tsx` (UPDATE - specific changes)
2. `src/styles/component.css` (UPDATE - style fixes)

## STEP-BY-STEP IMPLEMENTATION

### STEP 1: Update Component Logic
In `src/components/MyComponent.tsx`, replace line 45:

```typescript
// Replace this:
const [state, setState] = useState(false);

// With this:
const [state, setState] = useState(true);
```

### STEP 2: Fix Styles
In `src/styles/component.css`, add:

```css
.component {
  overflow-y: auto;
}
```
```

## RATIONALE

This read-only constraint ensures:
- **Human retains control** over all code changes
- **Version control integrity** - all changes go through proper git workflow  
- **Code review process** - human can evaluate