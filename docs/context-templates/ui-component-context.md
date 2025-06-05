# UI Component Context Template

## Always Include (Core Context):
- `/docs/components/component-system.md` - Component patterns and organization
- `/src/lib/ui/tokens/` - Design token definitions  
- `/src/lib/ui/variants/shared-variants.ts` - Shared behavior patterns

## Domain-Specific Context (Choose One Based on Feature Domain):

### School Components:
- `/src/components/domain/schools/SchoolCard.tsx` - Pattern reference
- `/src/lib/zod-schema/core/school.ts` - Data structure
- `/src/hooks/domain/useSchools.ts` - Data management pattern

### Staff Components:
- `/src/components/domain/staff/NYCPSStaffCard.tsx` - Pattern reference
- `/src/lib/zod-schema/core/staff.ts` - Data structure
- `/src/hooks/domain/useNYCPSStaff.ts` - Data management pattern

### Visit Components:  
- `/src/components/domain/visits/VisitCard.tsx` - Pattern reference
- `/src/lib/zod-schema/visits/visit.ts` - Data structure
- `/src/hooks/domain/useVisits.ts` - Data management pattern

## Conditional Context (Include Only If Needed):
- `/docs/data-flow/error-handling.md` - If error states needed
- `/src/lib/ui/forms/fieldConfig/` - If form elements needed
- `/docs/components/responsive-layout-patterns.md` - If responsive behavior needed

## Quality Gates:
- **DRY Check:** Reference existing component from same domain
- **Type Check:** Review `/src/lib/types/core/` for type consistency
- **Abstraction Check:** Compare with similar existing component

## Prompt Template:
```
Build [ComponentName] following established patterns:

Context Files: [List specific files from above]
Pattern: Follow [ExistingComponent] structure
Quality Requirements:
- Extend existing types rather than creating new ones
- Reuse design tokens and shared variants
- Follow component hierarchy: core → composed → domain
```
