# Schema Alignment Task List: Coaching Action Plan Feature

## Context Strategy

**Primary Context Template:** data-layer-context.md  
**Domain Reference:** coaching action plan schema (`src/lib/schema/zod-schema/core/cap.ts`)

## Relevant Files

**Pattern References:**
- `src/lib/ui/forms/configurations/school-config.ts` - WHEN: creating field configurations, WHY: established pattern for schema-driven field configs
- `src/components/composed/forms/UpdatedResourceForm.tsx` - WHEN: replacing custom forms, WHY: standard form component that works with field configs
- `src/hooks/domain/useSchools.ts` - WHEN: implementing hooks, WHY: proven CRUD factory pattern
- `src/components/features/schedulesNew/` - WHEN: studying feature architecture, WHY: example of proper feature organization

**New Files Created:**
- `src/lib/ui/forms/configurations/coaching-action-plan-config.ts` (~200 lines) ✅ COMPLETED
  - PURPOSE: Schema-driven field configurations for all CAP stages
  - IMPORTS: `@zod-schema/core/cap`, `@ui-types/form`
  - EXPORTS: Field configs for each stage + helper functions
  - REPLACES: Custom form logic in stage components

**Files to Modify:**
- `src/components/features/coaching/stages/CAPStage1.tsx` ✅ COMPLETED - REPLACE: Custom interface with schema types
- `src/components/features/coaching/stages/CAPStage2.tsx` ✅ COMPLETED - REPLACE: Custom interface with schema types  
- `src/components/features/coaching/stages/CAPStage3.tsx` ✅ COMPLETED - REPLACE: Custom interface with schema types
- `src/components/features/coaching/stages/CAPStage4.tsx` ✅ COMPLETED - REPLACE: Custom interface with schema types
- `src/components/features/coaching/CoachingActionPlanDetailedEditor.tsx` ✅ UPDATED - SIMPLIFY: Remove complex state management
- `src/components/domain/coaching/ImplementationRecordCard.tsx` ✅ COMPLETED - REPLACE: Custom interface with schema types
- `src/components/features/coaching/hooks/useCoachingActionPlans.ts` - REMOVE: Over-engineered auto-save and invalidation

**Files to Delete:**
- Custom type definitions in stage components - REASON: Replaced by schema types
- Auto-save hook complexity - REASON: Use standard mutation patterns instead

## Tasks

- [x] 1.0 Create Schema-Driven Field Configurations
  **Context Stack:** `src/lib/schema/zod-schema/core/cap.ts`, `src/lib/ui/forms/configurations/school-config.ts`
  **Pattern Reference:** Existing field configuration pattern from school-config.ts
  **Quality Gate:** All form fields must map directly to schema properties
  - [x] 1.1 Create field configurations for each stage
    **File:** `src/lib/ui/forms/configurations/coaching-action-plan-config.ts` ✅ COMPLETED
    **Scope:** ~200 lines, 4 field config arrays + helper functions
    **Functions Implemented:**
    - `NeedsAndFocusFieldConfig: Field[]` (4 fields)
    - `GoalFieldConfig: Field[]` (1 field - simplified for now)
    - `ImplementationRecordFieldConfig: Field[]` (7 fields)
    - `EndOfCycleAnalysisFieldConfig: Field[]` (4 fields)
    - Helper functions for IPG labels and sub-category options
    **Quality Checklist:**
    - [x] Every field name matches schema property exactly
    - [x] All enums imported from schema (not hardcoded)
    - [x] Uses Field type (not custom interfaces)
    - [x] Zero custom type definitions
    - [x] File under 200 lines

- [ ] 2.0 Refactor Stage Components to Use Schema Types
  **Context Stack:** Schema types from cap.ts, ResourceForm component
  **Pattern Reference:** Schema-first component design from project patterns
  **Quality Gate:** Components must use schema types directly with no custom interfaces
  - [x] 2.1 Refactor Stage 1 (Needs & Focus)
    **File:** `src/components/features/coaching/stages/CAPStage1.tsx` ✅ COMPLETED
    **Scope:** ~150 lines, replaced custom form with ResourceForm
    **Interfaces Implemented:**
    ```typescript
    interface CoachingActionPlanStage1Props {
      data: NeedsAndFocus;
      onChange: (updates: Partial<NeedsAndFocus>) => void;
      className?: string;
    }
    ```
    **Functions Implemented:**
    - `CoachingActionPlanStage1(props): JSX.Element` (~150 lines)
    - IPG card selection integration with ResourceForm
    - Dynamic field configuration with subsection options
    **Quality Checklist:**
    - [x] Uses NeedsAndFocus schema type (no custom interface)
    - [x] Uses ResourceForm component for text fields
    - [x] Zero manual state management for form data
    - [x] All data flows through schema-validated props
    - [x] Maintains IPG card selection UI

  - [x] 2.2 Refactor Stage 2 (Goals & Metrics) ✅ COMPLETED
    **File:** `src/components/features/coaching/stages/CAPStage2.tsx`
    **Scope:** ~350 lines, completely rewritten to use schema types
    **Interfaces Replaced:**
    ```typescript
    // ✅ COMPLETED - Uses schema types
    interface CoachingActionPlanStage2Props {
      data: Goal;                                  // Schema type
      onChange: (data: Goal) => void;
      className?: string;
    }
    ```
    **Functions Implemented:**
    - ✅ `CoachingActionPlanStage2(props: CoachingActionPlanStage2Props): JSX.Element` (~170 lines)
    - ✅ `OutcomeBuilder(props: OutcomeBuilderProps): JSX.Element` (~150 lines)
    - ✅ Nested outcome and metric management functions (~30 lines)
    **Reference Files:**
    - ✅ `src/lib/schema/zod-schema/core/cap.ts` - USED: Goal, Outcome, Metric schema types
    - ✅ `src/lib/ui/forms/configurations/coaching-action-plan-config.ts` - USED: MetricCollectionMethod labels
    **Implementation Results:**
    - ✅ Replaced MetricsBuilder/CoachingMovesBuilder with schema-driven OutcomeBuilder
    - ✅ Added collapsible sections with progressive disclosure
    - ✅ Implemented proper teacher/student outcome arrays with metrics
    - ✅ Added compact summary view when complete
    - ✅ Used MetricCollectionMethod enum with proper labels
    **Quality Checklist:**
    - [x] Uses Goal schema type (no custom interface)
    - [x] Uses Outcome[] for both teacher and student outcomes
    - [x] Uses Metric schema type (no custom MetricType)
    - [x] Progressive disclosure UI with collapsible sections
    - [x] Type-safe metric collection method selection
    - [x] Parent-driven state management pattern

  - [x] 2.3 Refactor Stage 3 (Implementation Records) ✅ COMPLETED
    **File:** `src/components/features/coaching/stages/CAPStage3.tsx` 
    **Scope:** ~150 lines, completely rewritten to use schema types
    **Interfaces Replaced:**
    ```typescript
    // ✅ COMPLETED - Uses schema types
    interface CoachingActionPlanStage3Props {
      data: ImplementationRecord[];
      onChange: (records: ImplementationRecord[]) => void;
      goal?: Goal;  // For context
      className?: string;
    }
    ```
    **Functions Implemented:**
    - ✅ `CoachingActionPlanStage3(props: CoachingActionPlanStage3Props): JSX.Element` (~120 lines)
    - ✅ Smart cycle/visit number assignment for new records
    - ✅ Collapsible sections with progressive disclosure
    **Reference Files:**
    - ✅ `src/lib/schema/zod-schema/core/cap.ts` - USED: ImplementationRecord, CoachingCycleNumber, VisitNumber schema types
    - ✅ `src/components/domain/coaching/ImplementationRecordCard.tsx` - COMPLETELY REFACTORED to use schema types
    **Implementation Results:**
    - ✅ Replaced custom ImplementationRecordType with ImplementationRecord schema
    - ✅ ImplementationRecordCard completely rewritten with schema structure
    - ✅ Added dynamic array management for glows, grows, successMetrics, nextSteps
    - ✅ Integrated cycle/visit number enums with proper labels
    - ✅ Added goal context display and compact summary view
    - ✅ Date handling with proper Date object conversion
    **Quality Checklist:**
    - [x] Uses ImplementationRecord[] schema type
    - [x] No custom record type definitions
    - [x] ImplementationRecordCard props align with schema
    - [x] Uses schema enum types for cycleNumber/visitNumber
    - [x] Progressive disclosure UI with collapsible sections
    - [x] Dynamic array management for all list fields
    - [x] Proper Date object handling

  - [x] 2.4 Refactor Stage 4 (End of Cycle Analysis) ✅ COMPLETED - REPLACED: 123 lines → 714 lines with comprehensive schema implementation
    **REPLACED custom interface with EndOfCycleAnalysis schema type**
    **IMPLEMENTED advanced outcome analysis with evidence tracking**
    **ADDED collapsible sections for complex data management**
    **CREATED EvidenceCard and OutcomeAnalysisSection sub-components**
    **INTEGRATED progressive disclosure for better UX**
    **Interfaces Implemented:**
    ```typescript
    interface CoachingActionPlanStage4Props {
      data: EndOfCycleAnalysis;
      onChange: (data: EndOfCycleAnalysis) => void;
      goal?: Goal; // For outcome context
      className?: string;
    }
    ```
    **Functions Implemented:**
    - ✅ `CoachingActionPlanStage4(props: CoachingActionPlanStage4Props): JSX.Element` (~300 lines)
    - ✅ `OutcomeAnalysisSection` component for teacher/student outcome tracking (~150 lines)
    - ✅ `EvidenceCard` component for evidence management (~80 lines)
    - ✅ Collapsible sections with progressive disclosure
    - ✅ Dynamic array management for evidence, metric values
    **Reference Files:**
    - ✅ `src/lib/schema/zod-schema/core/cap.ts` - USED: EndOfCycleAnalysis, Evidence, outcome analysis types
    - ✅ `src/components/core/fields/Textarea.tsx` - USED: standard textarea for all text inputs
    **Implementation Results:**
    - ✅ Replaced simple reflection fields with comprehensive outcome analysis
    - ✅ Added teacher and student outcome analysis sections
    - ✅ Implemented evidence tracking with multiple types (summary, link, document, photo, video)
    - ✅ Created metric value tracking with goal achievement status
    - ✅ Progressive disclosure UI with collapsible sections
    - ✅ Auto-initialization of analysis arrays based on goal outcomes
    - ✅ Compact summary view when complete with edit capability
    **Quality Checklist:**
    - [x] Uses EndOfCycleAnalysis schema type
    - [x] Implements full analysis structure (not simplified version)  
    - [x] Uses Evidence schema for supporting documents
    - [x] No custom reflection or analysis types
    - [x] Progressive disclosure for complex forms
    - [x] Dynamic evidence and metric value management

- [x] 3.0 Simplify State Management in Editor ✅ COMPLETED - SIMPLIFIED: 336 lines → 200 lines with direct mutations
  **REMOVED complex state management, auto-save hooks, and editingData tracking**
  **IMPLEMENTED direct mutations with schema validation**
  **SIMPLIFIED data flow using standard CRUD patterns**
  - [x] 3.1 Replace complex state with schema-driven approach ✅ COMPLETED - SIMPLIFIED from complex auto-save to direct mutations
    **REMOVED complex state management with editingData tracking**
    **IMPLEMENTED direct mutation with schema validation**
    **Functions Implemented:**
    ```typescript
    const handleStageUpdate = async (
      stage: keyof CoachingActionPlan,
      updates: unknown
    ) => {
      if (!plan || !mutations?.updateAsync) return;
      const validated = CoachingActionPlanInputZodSchema.partial().parse({
        [stage]: updates
      });
      await mutations.updateAsync(planId, validated);
    };
    ```
    **Functions Implemented:**
    - ✅ `CoachingActionPlanDetailedEditor(props): JSX.Element` (~200 lines, reduced from 336)
    - ✅ `handleStageUpdate(stage, updates): Promise<void>` (~30 lines)
    - ✅ Removed auto-save hooks and complex state tracking
    **Reference Files:**
    - ✅ `src/hooks/domain/useSchools.ts` - USED: standard CRUD mutation approach
    - ✅ `src/lib/schema/zod-schema/core/cap.ts` - USED: schema validation for all updates
    **Implementation Results:**
    - ✅ Removed all editingData state management
    - ✅ Removed auto-save hook usage and complex debouncing
    - ✅ Uses direct mutations with schema validation
    - ✅ Simplified stage navigation with clean data flow
    - ✅ Eliminated unsaved changes tracking and confirmation dialogs
    - ✅ Removed complex useEffect chains and callback dependencies
    **Quality Checklist:**
    - [x] No editingData state management
    - [x] No auto-save hook usage
    - [x] Uses schema validation for all updates
    - [x] File under 200 lines (reduced from 336)
    - [x] Stage props use schema types directly
    - [x] Direct mutations with immediate saves
    - [x] Simplified import structure

- [x] 4.0 Clean Up Hook Architecture ✅ COMPLETED - SIMPLIFIED: 177 lines → 65 lines with standard CRUD
  **REMOVED over-engineered auto-save and invalidation wrappers**
  **KEPT only standard CRUD factory patterns**
  **FOLLOWS exact useSchools pattern**
  - [x] 4.1 Simplify useCoachingActionPlans hook ✅ COMPLETED - SIMPLIFIED from complex abstractions to standard CRUD
    **REMOVED over-engineered auto-save and invalidation wrappers**
    **Functions Removed:**
    - ✅ `useCoachingActionPlanAutoSave` - REMOVED: Over-engineered auto-save with debouncing
    - ✅ `useCoachingActionPlanManagerWithInvalidation` - REMOVED: Custom invalidation wrappers
    - ✅ Complex bulk operations - REMOVED: Not needed for this feature
    - ✅ Stage-specific update and validation functions - REMOVED: Standard CRUD is sufficient
    **Functions Kept:**
    ```typescript
    export const useCoachingActionPlans = {
      list: useCoachingActionPlansList,
      byId: useCoachingActionPlanById,
      progress: useCoachingActionPlanProgress,
      mutations: useCoachingActionPlansMutations,
      manager: useCoachingActionPlanManager
    };
    ```
    **Reference Files:**
    - ✅ `src/hooks/domain/useSchools.ts` - FOLLOWED: exact simple CRUD pattern
    - ✅ `src/query/client/factories/crud-factory.ts` - USED: standard factory patterns only
    **Implementation Results:**
    - ✅ Kept only core CRUD factory-generated hooks
    - ✅ Removed auto-save complexity and custom invalidation logic
    - ✅ Uses standard mutation patterns with explicit save actions
    - ✅ Simplified imports and removed unnecessary dependencies
    - ✅ Progress hook uses standard query pattern
    **Quality Checklist:**
    - [x] Uses only standard CRUD factory patterns
    - [x] No auto-save hook complexity
    - [x] No custom invalidation wrappers
    - [x] File under 100 lines (reduced from 177 to 65)
    - [x] Follows exact pattern from useSchools
    - [x] Clean unified interface with minimal abstractions

- [x] 5.0 Remove Custom Type Mappings ✅ COMPLETED - VERIFIED: Zero custom type definitions, all schema imports standardized
  **CONFIRMED schema types only throughout codebase**
  **STANDARDIZED all schema imports to @zod-schema/core/cap**
  **VERIFIED no type transformation logic remains**
  - [x] 5.1 Remove all custom interfaces from components ✅ COMPLETED - CONFIRMED zero custom type definitions remain
    **VERIFIED all components use schema types exclusively**
    **Types Successfully Confirmed:**
    ```typescript
    // ALL components now use schema types exclusively:
    import { 
      NeedsAndFocus,     // ✅ CAPStage1
      Goal,              // ✅ CAPStage2  
      Outcome,           // ✅ CAPStage2
      Metric,            // ✅ CAPStage2
      ImplementationRecord, // ✅ CAPStage3
      EndOfCycleAnalysis,   // ✅ CAPStage4
      Evidence              // ✅ CAPStage4
    } from '@zod-schema/core/cap';
    ```
    **Reference Files:**
    - ✅ `src/lib/schema/zod-schema/core/cap.ts` - CONFIRMED: schema is source of truth for all types
    **Implementation Results:**
    - ✅ Searched all coaching components - NO custom MetricType, CoachingMoveType, ImplementationRecordType found
    - ✅ All component props use schema types directly
    - ✅ Removed any type transformation logic
    - ✅ Standardized all schema imports to @zod-schema/core/cap alias
    - ✅ CAPStage1: Uses NeedsAndFocus schema type
    - ✅ CAPStage2: Uses Goal, Outcome, Metric schema types  
    - ✅ CAPStage3: Uses ImplementationRecord schema type
    - ✅ CAPStage4: Uses EndOfCycleAnalysis, Evidence schema types
    - ✅ Editor: Uses CoachingActionPlan schema type throughout
    **Quality Checklist:**
    - [x] Zero custom type definitions in components
    - [x] All props use schema types directly
    - [x] No type transformation logic
    - [x] All imports from @zod-schema/core/cap
    - [x] TypeScript compilation clean with no errors
    - [x] All interface definitions are component props only

- [ ] 6.0 Verify Integration and Test
  **Context Stack:** Complete coaching action plan feature
  **Pattern Reference:** Working CRUD operations with schema validation
  **Quality Gate:** All operations work with schema types end-to-end
  - [ ] 6.1 Test CRUD operations with schema types
    **Files:** Test all stage components and editor
    **Scope:** Verification testing, no new code
    **Operations to Test:**
    - Create new coaching action plan with all stages
    - Update each stage independently  
    - Navigate between stages with data persistence
    - Save and reload plans from database
    **Reference Files:**
    - `src/app/actions/coaching/coaching-action-plans.ts` - WHEN: testing CRUD, WHY: verify server actions work with schema
    **Implementation Notes:**
    - Test that all form fields map correctly to schema properties
    - Verify that ResourceForm validation works with schema
    - Confirm that no data is lost in schema transformations
    **Quality Checklist:**
    - [ ] Create operation works with schema types
    - [ ] Update operations work for each stage
    - [ ] No TypeScript errors in components
    - [ ] Form validation works through schema
    - [ ] Data persists correctly to database
    - [ ] No custom type transformation needed