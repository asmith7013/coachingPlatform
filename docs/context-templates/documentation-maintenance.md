# Documentation Maintenance Workflow

## The Challenge
In sophisticated, rapidly-evolving codebases, documentation becomes stale quickly. Your high-quality codebase requires up-to-date documentation to maintain its value.

## Documentation Update Triggers

### 1. **Pattern Evolution Triggers**
Update docs when these patterns change:

**Component Patterns:**
- New component variant patterns emerge
- Design token usage patterns evolve  
- Responsive layout patterns change
- Form field patterns are modified

**Data Patterns:**
- Schema validation patterns change
- Server action error handling evolves
- Database query patterns are updated
- Type transformation patterns change

**Integration Patterns:**
- API response format standards change
- External service integration patterns evolve
- Authentication patterns are updated

### 2. **New Abstraction Triggers**
Update docs when new abstraction layers are added:

- New shared variants are created
- New utility functions become standard
- New error handling patterns emerge
- New architectural patterns are established

### 3. **Quality Standard Triggers**
Update docs when quality standards evolve:

- DRY principles are applied in new ways
- Separation of concerns boundaries change
- Type safety patterns are enhanced
- Performance optimization patterns emerge

## Documentation Update Checklist

Add this checklist to every task template:

```markdown
## Documentation Impact Assessment
- [ ] Does this change affect documented patterns?
- [ ] Are there new patterns that should be documented?
- [ ] Do existing docs need updates?
- [ ] Should this be added as an example?
- [ ] Do context templates need updates?

## Documentation Update Requirements
If any above items are checked:
- [ ] Update relevant documentation sections
- [ ] Add/update code examples
- [ ] Update context templates if needed
- [ ] Verify example references are still valid
```

## Automatic Documentation Validation

### Context Template Validation
Regularly verify context templates are current:

```markdown
# Monthly Context Template Review
1. Check that referenced files still exist
2. Verify patterns haven't evolved
3. Update examples to reflect current best practices
4. Remove deprecated pattern references
```

### Documentation Example Validation
Ensure examples in docs match current code:

```markdown
# Documentation Example Audit
1. Verify code examples compile and run
2. Check that referenced files exist and are current
3. Validate that patterns shown are still recommended
4. Update examples to use latest established patterns
```

## Integration with Your Workflow

### In PRD Generation:
```markdown
## Documentation Requirements
- [ ] Identify which documentation sections apply
- [ ] Note any new patterns this feature introduces
- [ ] Plan documentation updates needed
```

### In Task Generation:
```markdown
## Documentation Tasks (Include when patterns change)
- [ ] X.0 Update Documentation
  **Context:** Relevant documentation files
  **Pattern:** Follow existing documentation structure
  **Quality Gate:** Ensure examples are current and accurate
  - [ ] X.1 Update pattern documentation
  - [ ] X.2 Add/update code examples
  - [ ] X.3 Update context templates
```

### In Task Processing:
```markdown
## Documentation Verification Step
Before marking any task complete:
1. Check if this task introduced new patterns
2. Verify existing documentation is still accurate
3. Update context templates if needed
4. Add new examples if pattern is worth documenting
```

## Benefits

1. **Prevents Documentation Debt:** Regular updates prevent massive documentation overhauls
2. **Maintains Context Quality:** Context templates stay current and useful
3. **Preserves Architectural Knowledge:** New patterns are captured before they become undocumented tribal knowledge
4. **Improves AI Assistance:** Current documentation leads to better AI-generated code
5. **Supports Team Growth:** New developers have accurate, current documentation

## Implementation Priority

**High Priority Updates:**
- Component system changes (affects all UI work)
- Schema system changes (affects all data work)
- Error handling changes (affects all operations)

**Medium Priority Updates:**
- New utility patterns
- Performance optimization patterns
- Integration pattern changes

**Low Priority Updates:**
- Style guide updates
- Non-functional requirement changes
- Process documentation updates
