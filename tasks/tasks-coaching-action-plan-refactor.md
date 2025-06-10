# Coaching Action Plan Feature Refactoring Tasks

## Context Strategy

**Primary Context Template:** UI Component Context + Data Layer Context
**Domain Reference:** Coaching Action Plans (CAP) with schema-driven forms and CRUD factory patterns

## Relevant Files

**Pattern References:**
- `src/components/domain/schools/SchoolCard.tsx` - WHEN: domain component patterns, WHY: established card layout and interaction patterns
- `src/hooks/domain/useSchools.ts` - WHEN: hook implementation, WHY: established CRUD factory usage pattern
- `src/components/composed/forms/UpdatedResourceForm.tsx` - WHEN: form implementation, WHY: schema-driven form pattern
- `src/query/client/factories/crud-factory.ts` - WHEN: hook creation, WHY: standardized CRUD operations pattern

**New Files to Create:**
- `src/hooks/domain/useCoachingActionPlans.ts` (~80 lines)
  - PURPOSE: Simplified domain hook following established CRUD factory pattern
  - IMPORTS: `@query/client/factories/crud-factory`, `@zod-schema/core/cap`, coaching action plan server actions
  - EXPORTS: `useCoachingActionPlans` unified interface
  - REPLACES: Current hook implementation in `src/components/features/coaching/hooks/useCoachingActionPlans.ts`

- `src/components/domain/coaching/ActionPlanCard.tsx` (~120 lines)
  - PURPOSE: Reusable coaching action plan card component
  - IMPORTS: `@components/core`, `@components/composed/cards`, `@domain-types/coaching-action-plan`
  - EXPORTS: `ActionPlanCard` component with `ActionPlanCardProps` interface
  - REPLACES: Card logic scattered in `CoachingActionPlanDashboard.tsx`

- `src/components/domain/coaching/ActionPlanStageForm.tsx` (~150 lines)
  - PURPOSE: Schema-driven stage form component using ResourceForm
  - IMPORTS: `@components/composed/forms/UpdatedResourceForm`, stage field configurations
  - EXPORTS: `ActionPlanStageForm` component
  - REPLACES: Custom form logic in individual stage components

**Files to Modify:**
- `src/components/features/coaching/CoachingActionPlanDashboard.tsx` - UPDATE: Use domain components and simplified hooks
- `src/components/features/coaching/CoachingActionPlanDetailedEditor.tsx` - UPDATE: Use schema-driven forms
- `src/components/features/coaching/stages/CAPStage1.tsx` - UPDATE: Use ActionPlanStageForm component
- `src/components/features/coaching/stages/CAPStage2.tsx` - UPDATE: Use ActionPlanStageForm component
- `src/components/features/coaching/stages/CAPStage3.tsx` - UPDATE: Use ActionPlanStageForm component
- `src/components/features/coaching/stages/CAPStage4.tsx` - UPDATE: Use ActionPlanStageForm component

**Files to Delete:**
- `src/components/features/coaching/hooks/useCoachingActionPlans.ts` - REASON: Replaced by simplified domain hook
- Complex custom form logic in stage components - REASON: Replaced by schema-driven forms

## Tasks

- [ ] 1.0 **Consolidate and Simplify Hook Architecture**
  **Context Stack:** `src/query/client/factories/crud-factory.ts`, `src/hooks/domain/useSchools.ts`
  **Pattern Reference:** Established CRUD factory usage pattern from schools domain
  **Quality Gate:** Single manager hook interface, no duplicate state management

- [ ] 2.0 **Create Reusable Domain Components**
  **Context Stack:** `src/components/domain/schools/SchoolCard.tsx`, `src/components/composed/cards/Card.tsx`
  **Pattern Reference:** Domain card component pattern with consistent interaction model
  **Quality Gate:** DRY component architecture, proper separation of concerns

- [ ] 3.0 **Implement Schema-Driven Form System**
  **Context Stack:** `src/components/composed/forms/UpdatedResourceForm.tsx`, `src/lib/ui/forms/configurations/coaching-action-plan-config.ts`
  **Pattern Reference:** ResourceForm pattern with field configurations
  **Quality Gate:** Eliminate custom form logic, use established form patterns

- [ ] 4.0 **Refactor Feature Components for Consistency**
  **Context Stack:** Domain components, schema-driven forms, simplified hooks
  **Pattern Reference:** Established feature component patterns from other domains
  **Quality Gate:** Consistent error handling, standardized state management

- [ ] 5.0 **Implement Comprehensive Testing and Documentation**
  **Context Stack:** Refactored components and hooks
  **Pattern Reference:** Established testing patterns in codebase
  **Quality Gate:** Working feature with improved maintainability and consistency

