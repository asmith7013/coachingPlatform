# Tasks - Coaching Action Plan Workflow and Interface

## Context Strategy

**Primary Context Template:** ui-component-context.md
**Domain Reference:** coaching

## Relevant Files

**Pattern References:**
- `src/components/composed/cards/ClickableCards.tsx` - WHEN: Building card-based selection interfaces, WHY: Established compound component pattern
- `src/app/examples/cap/example3/page.tsx` - WHEN: Implementing wizard flow, WHY: Working 4-stage implementation
- `src/components/core/fields/Input.tsx` - WHEN: Building form inputs, WHY: Consistent field styling
- `src/components/core/fields/Textarea.tsx` - WHEN: Building text inputs, WHY: Consistent field styling
- `src/components/core/fields/Select.tsx` - WHEN: Building selection inputs, WHY: Consistent dropdown patterns

**New Files to Create:**
- `src/components/features/coaching/CoachingActionPlanWizard.tsx` - PURPOSE: Main wizard orchestration component
- `src/components/features/coaching/ActionPlanStage.tsx` - PURPOSE: Reusable stage wrapper with numbering
- `src/components/domain/coaching/IPGFocusCards.tsx` - PURPOSE: Core action selection interface
- `src/components/domain/coaching/IPGSubsectionCards.tsx` - PURPOSE: Subsection selection with color inheritance
- `src/components/domain/coaching/MetricsBuilder.tsx` - PURPOSE: Dynamic metrics creation interface
- `src/hooks/domain/useIPGData.ts` - PURPOSE: IPG reference data management

**Created Files:**
- `src/lib/schema/mongoose-schema/core/coaching-action-plan.model.ts` - MongoDB model with 4-stage structure and nested schemas
- `src/app/actions/coaching/coaching-action-plans.ts` - Server actions with CRUD operations and stage validation
- `src/app/api/coaching-action-plans/route.ts` - API routes for collection operations (GET, POST)
- `src/app/api/coaching-action-plans/[id]/route.ts` - API routes for individual resource operations (GET, PUT, DELETE)
- `src/lib/ui/forms/configurations/coaching-action-plan-config.ts` - Field configurations for form inputs with stage-specific mappings
- `src/lib/transformers/domain/coaching-reference-transformers.ts` - Reference transformers using factory patterns with error handling and proper abstraction
- `src/hooks/domain/useIPGData.ts` - Hook for accessing IPG data with validation, caching, and search functionality
- `src/lib/types/domain/coaching-action-plan.ts` - TypeScript interfaces for components, validation, and form workflows
- `src/hooks/domain/useCoachingActionPlans.ts` - React Query hooks with stage-specific operations and unified interface
- `src/components/features/coaching/ActionPlanStage.tsx` - Reusable stage wrapper component with numbered stages
- `src/components/domain/coaching/IPGFocusCards.tsx` - Core action selection cards with dynamic color mapping
- `src/components/domain/coaching/IPGSubsectionCards.tsx` - Subsection selection cards with color inheritance
- `src/components/features/coaching/CoachingActionPlanStage1.tsx` - Complete Stage 1 implementation with state management
- `src/components/features/coaching/CoachingActionPlanStage2.tsx` - Complete Stage 2 implementation with SMART goals, MetricsBuilder, and CoachingMovesBuilder
- `src/components/domain/coaching/MetricsBuilder.tsx` - Dynamic metrics creation with type-based color schemes (IPG=primary, L&R=secondary, Project=success, Other=muted), 4-point rating scales, and minimum 3 defaults enforcement
- `src/components/domain/coaching/CoachingMovesBuilder.tsx` - Coaching moves menu planning with dynamic add/remove functionality and structured input fields
- `src/components/features/coaching/CoachingActionPlanStage3.tsx` - Complete Stage 3 implementation with implementation tracking and session management
- `src/components/domain/coaching/ImplementationRecordCard.tsx` - Individual session tracking cards with date, arc selection, moves selection, metrics scoring, notes, next steps, and evidence linking
- `src/components/features/coaching/CoachingActionPlanStage4.tsx` - Complete Stage 4 implementation with goal completion assessment, impact reflection, planning, and spotlight management
- `src/components/domain/coaching/ReflectionSection.tsx` - Structured reflection questions interface with gray background styling and spotlight opportunity suggestions
- `src/components/domain/coaching/index.ts` - Export index for domain coaching components
- `src/components/features/coaching/index.ts` - Export index for feature coaching components

### Stage 1 (Needs & Focus) - Parent Task 2.0 ✅ COMPLETE
- `src/components/features/coaching/CoachingActionPlanStage1.tsx` - Stage 1 container with IPG selection and rationale
- `src/components/domain/coaching/IPGFocusCards.tsx` - Core action selection cards (CA1, CA2, CA3)
- `src/components/domain/coaching/IPGSubsectionCards.tsx` - Subsection selection cards with color inheritance
- `src/hooks/domain/useIPGData.tsx` - IPG data management hook

### Stage 2 (Goal & Metrics) - Parent Task 3.0 ✅ COMPLETE
- `src/components/features/coaching/CoachingActionPlanStage2.tsx` - Stage 2 container with SMART goals and metrics
- `src/components/domain/coaching/MetricsBuilder.tsx` - Metric definition and management interface
- `src/components/domain/coaching/CoachingMovesBuilder.tsx` - Coaching moves selection and menu system

### Stage 3 (Implementation) - Parent Task 4.0 ✅ COMPLETE
- `src/components/features/coaching/CoachingActionPlanStage3.tsx` - Stage 3 container with session management
- `src/components/domain/coaching/ImplementationRecordCard.tsx` - Individual session tracking cards

### Stage 4 (Analysis) - Parent Task 5.0 ✅ COMPLETE
- `src/components/features/coaching/CoachingActionPlanStage4.tsx` - Stage 4 container with reflection interface
- `src/components/domain/coaching/ReflectionSection.tsx` - Structured reflection components

### Dashboard & Management - Parent Task 6.0 ✅ COMPLETE (Tasks 6.1-6.3)
- `src/components/domain/coaching/ActionPlanCard.tsx` - Plan summary card with stage completion indicators
- `src/components/features/coaching/CoachingActionPlanDashboard.tsx` - Main dashboard with filtering and search **REFACTORED**
- `src/components/domain/coaching/StatusTransitionButton.tsx` - Status transition button component for plan status management

**Dashboard Refactoring Improvements:**
- ✅ Replaced manual header with PageHeader component (15+ lines reduction)
- ✅ Implemented proper error handling with handleClientError and toast notifications
- ✅ Added navigation patterns using useRouter following StaffDetailPage patterns
- ✅ Enhanced ResourceHeader integration with proper search state management
- ✅ Implemented user-friendly feedback system with Toast component
- ✅ Added proper loading states and disabled button handling
- ✅ Following DRY principles by leveraging existing components

### Visit Integration & Quick Access - Parent Task 7.0 ✅ COMPLETE (Tasks 7.1-7.5 Complete + Phase 1 Optimization)
- `src/hooks/domain/useVisitIntegration.ts` - Hook for managing bidirectional plan-visit relationships with auto-linking and statistics **REFACTORED**
- `src/components/features/coaching/QuickAccessOverlay.tsx` - Mobile-responsive overlay for quick plan access during observations
- `src/app/actions/visits/visit-plan-integration.ts` - **NEW** Server actions for visit-plan integration following established patterns

**Phase 1 Optimization Complete - Server Actions Extraction:**
- ✅ Extracted all business logic from hook to dedicated server actions
- ✅ Implemented proper Zod validation and error handling patterns
- ✅ Used established `withDbConnection` and `handleServerError` patterns
- ✅ Added proper revalidation paths for Next.js cache management
- ✅ Created comprehensive type definitions aligned with existing patterns
- ✅ Reduced hook complexity by ~65% (845 lines → ~290 lines)
- ✅ Eliminated manual fetch calls in favor of server actions
- ✅ Separated concerns: UI state management vs business logic

**Server Actions Created:**
- `createVisitPlanLink()` - Bidirectional linking with validation
- `removeVisitPlanLink()` - Complete link removal 
- `autoPopulateVisitFromSchedule()` - Auto-population from visits
- `bulkLinkVisits()` - Bulk operations with transaction support
- Helper functions for validation and conflict detection

**Hook Improvements:**
- ✅ Leverages existing entity hooks (`useCoachingActionPlans.byId`, `useVisitsList`)
- ✅ Uses server actions instead of manual API calls
- ✅ Maintains backward compatibility with existing interface
- ✅ Improved error handling with `handleClientError`
- ✅ Simplified mutation management using established patterns

**Quality Achievements:**
- **DRY Principle**: Eliminated duplicate business logic and API calls
- **Separation of Concerns**: Clear boundary between UI and business logic
- **Consistent Patterns**: Follows established server action and hook patterns
- **Type Safety**: Comprehensive type definitions with Zod validation
- **Error Handling**: Consistent error handling throughout the system
- **Performance**: Reduced bundle size and improved cache management
- **Maintainability**: Business logic is now testable and reusable

### Infrastructure - Parent Task 1.0 ✅ COMPLETE
- `src/lib/schema/mongoose-schema/core/coaching-action-plan.model.ts` - MongoDB model definition
- `src/lib/schema/zod-schema/core/cap.ts` - Zod schema and TypeScript types
- `src/app/actions/coaching/coaching-action-plans.ts` - Server actions for CRUD operations
- `src/app/api/coaching-action-plans/route.ts` - API route handlers
- `src/hooks/domain/useCoachingActionPlans.ts` - React Query hooks for data management
- `src/lib/transformers/utils/coaching-action-plan-utils.ts` - Progress calculation and validation utilities

## Tasks

- [ ] 1.0 Set up database foundation and schema validation
  **Context Stack:** [data-layer-context.md, mongoose schemas, server actions]
  **Pattern Reference:** [existing coaching log models, action plan examples]
  **Quality Gate:** [Schema validation consistency, proper error handling separation]
  - [x] 1.1 Create MongoDB model using CoachingActionPlanZodSchema with stage-based structure
    **PRD Requirements:**
    - Define schema for 4-stage coaching action plan workflow
    - Include proper validation for required fields per stage
    - Support state persistence across non-linear editing
  - [x] 1.2 Implement server actions for CRUD operations with stage validation
    **PRD Requirements:**
    - Create server actions following existing coaching log patterns
    - Implement proper error handling and validation
    - Support partial saves for draft plans
  - [x] 1.3 Create API routes for coaching action plan operations with proper error handling
    **PRD Requirements:**
    - Implement REST endpoints for plan management
    - Include proper authentication and authorization
    - Follow existing API patterns from coaching modules
  - [x] 1.4 Set up field configuration mapping schema fields to form inputs
    **PRD Requirements:**
    - Create field configs following existing ResourceForm patterns
    - Map schema fields to appropriate input components
    - Include validation rules and display formatting
  - [x] 1.5 Create reference transformer for IPG and coaching moves data
    **PRD Requirements:**
    - Transform IPG data to {value, label} format for dropdowns
    - Support search and filtering functionality
    - Handle nested data structures (core actions -> subsections)
  - [x] 1.6 Migrate IPG data from ipg.json with core actions and subsections structure
    **PRD Requirements:**
    - Ensure data structure matches component expectations
    - Include all necessary metadata for color coding
    - Validate data integrity for production use
  - [x] 1.7 Create TypeScript interfaces matching example component types
    **PRD Requirements:**
    - Define interfaces for all coaching action plan entities
    - Ensure type safety across form and data layers
    - Match existing component implementation patterns

- [ ] 2.0 Build IPG selection and needs assessment (Stage 1)
  **Context Stack:** [ui-component-context.md, ClickableCards patterns, IPG domain knowledge]
  **Pattern Reference:** [example IPGFocusCards, IPGSubsectionCards implementations]
  **Quality Gate:** [Dynamic color coding consistency, card selection state management]
  - [x] 2.1 Create ActionPlanStage wrapper component with stage numbering
    **Reference Files:**
    - `src/app/examples/cap/components/ActionPlanStage.tsx` - WHEN: Building stage wrapper, WHY: Established numbering and layout pattern
    - `src/components/core/typography/Heading.tsx` - WHEN: Styling stage headers, WHY: Consistent typography system
    **Implementation Notes:**
    - Use number prop for stage numbering display
    - Include title prop for stage descriptions
    - Apply consistent spacing with className prop support
    - Follow semantic HTML structure with proper headings
    **Anti-Patterns:**
    - Don't hardcode stage numbers - use dynamic numbering prop
    - Don't create custom spacing - use existing spacing tokens
    **Quality Checklist:**
    - [x] Uses number and title props for dynamic content
    - [x] Supports className prop for custom styling
    - [x] Follows semantic HTML structure
    - [x] Integrates with existing typography system
  - [x] 2.2 Build IPGFocusCards for core action selection (CA1, CA2, CA3)
    **Reference Files:**
    - `src/components/composed/cards/ClickableCards.tsx` - WHEN: Building card selection, WHY: Established selection pattern
    - `src/app/examples/cap/components/IPGFocusCards.tsx` - WHEN: Implementing color mapping, WHY: Working color scheme example
    **Implementation Notes:**
    - Use ClickableCards compound component with horizontal layout
    - Implement getColor function for dynamic color mapping (CA1=primary, CA2=secondary, CA3=success)
    - Pass options array with value, label structure
    - Support selectedValue and onSelect props for state management
    **Anti-Patterns:**
    - Don't create custom card selection UI - extend ClickableCards
    - Don't hardcode color values - use semantic color system
    - Don't duplicate selection logic - reuse established patterns
    **Quality Checklist:**
    - [x] Extends ClickableCards (not custom implementation)
    - [x] Implements proper color mapping function
    - [x] Uses horizontal layout for core action display
    - [x] Follows established prop interface patterns
  - [x] 2.3 Implement IPGSubsectionCards with dynamic color inheritance
    **Reference Files:**
    - `src/components/composed/cards/ClickableCards.tsx` - WHEN: Building card layout, WHY: Established selection pattern
    - `src/app/examples/cap/components/IPGSubsectionCards.tsx` - WHEN: Implementing color inheritance, WHY: Working color mapping example
    - `src/lib/json/ipg.json` - WHEN: Loading subsection data, WHY: Data structure reference
    **Implementation Notes:**
    - Follow getColor function pattern for consistent color mapping from parentColor
    - Use ClickableCards compound component with vertical layout
    - Pass subsection.section as value, subsection.description as description
    - Map parentColor prop to ClickableCardColor enum values
    **Anti-Patterns:**
    - Don't create custom selection UI - extend ClickableCards component
    - Don't hardcode color values - use semantic color mapping system
    - Don't duplicate card selection logic - reuse established patterns
    **Quality Checklist:**
    - [x] Extends ClickableCards (not custom card implementation)
    - [x] Implements proper color inheritance from parentColor prop
    - [x] Uses vertical layout for subsection display
    - [x] Maps subsection data structure correctly
  - [x] 2.4 Create focus selection state management with edit capability
    **Reference Files:**
    - `src/app/examples/cap/example3/page.tsx` - WHEN: Managing selection state, WHY: Working state management pattern
    - `src/hooks/ui/useMultiStepForm.ts` - WHEN: Integrating with wizard, WHY: Form state persistence pattern
    **Implementation Notes:**
    - Manage selectedCoreAction and selectedSubsection state
    - Reset subsection when core action changes
    - Preserve rationale text during selection changes
    - Show conditional UI based on selection completeness
    **Anti-Patterns:**
    - Don't clear rationale when changing selections - preserve user input
    - Don't allow subsection selection without core action - enforce hierarchy
    **Quality Checklist:**
    - [x] Manages hierarchical selection state properly
    - [x] Preserves user input during selection changes
    - [x] Enforces proper selection workflow
    - [x] Integrates with form state management
  - [x] 2.5 Add rationale textarea with conditional required validation
    **Reference Files:**
    - `src/components/core/fields/Textarea.tsx` - WHEN: Building rationale input, WHY: Consistent field styling
    - `src/app/examples/cap/example3/page.tsx` - WHEN: Implementing conditional validation, WHY: Working validation example
    **Implementation Notes:**
    - Use required prop conditionally based on selection completeness
    - Include proper placeholder text for guidance
    - Set appropriate rows for content length (4 rows recommended)
    - Connect to form validation system
    **Anti-Patterns:**
    - Don't make required when no selection made - use conditional validation
    - Don't use fixed validation - adapt to selection state
    **Quality Checklist:**
    - [x] Uses conditional required validation
    - [x] Provides helpful placeholder text
    - [x] Integrates with form validation system
    - [x] Follows consistent field styling patterns
  - [x] 2.6 Implement gray focus box display with edit button overlay
    **Reference Files:**
    - `src/app/examples/cap/example3/page.tsx` - WHEN: Building focus display, WHY: Working layout and interaction pattern
    - `src/components/core/Button.tsx` - WHEN: Adding edit button, WHY: Consistent button styling
    **Implementation Notes:**
    - Show gray box with border when selection is complete
    - Position edit button absolutely in top-right corner
    - Display formatted focus area text with proper hierarchy
    - Use Edit2 icon from lucide-react with proper sizing
    **Anti-Patterns:**
    - Don't use inline styles - use CSS classes for positioning
    - Don't create custom edit icon - use established icon library
    **Quality Checklist:**
    - [x] Shows focus box only when selection complete
    - [x] Positions edit button with absolute positioning
    - [x] Uses established button and icon components
    - [x] Formats focus text with proper hierarchy
  - [x] 2.7 Create useIPGData hook for reference data management
    **PRD Requirements:**
    - Load and cache IPG reference data from JSON
    - Provide helper functions for data transformation
    - Support filtering and search functionality
    - Handle loading and error states appropriately

- [x] 3.0 Create SMART goals and metrics system (Stage 2)
  **Context Stack:** [ui-component-context.md, dynamic form arrays, metrics patterns]
  **Pattern Reference:** [MetricsBuilder implementation, 4-point rating scales]
  **Quality Gate:** [Reusable metric components, type-based color coding]
  - [x] 3.1 Build SMART goal textarea with structured prompts
    **Reference Files:**
    - `src/components/core/fields/Textarea.tsx` - WHEN: Building goal input, WHY: Consistent field styling
    - `src/app/examples/cap/example3/page.tsx` - WHEN: Setting up SMART goals, WHY: Working prompt structure
    **Implementation Notes:**
    - Use label "By the end of the coaching cycle..."
    - Include structured placeholder: "the teacher will... As a result... This will be evidenced by..."
    - Set required validation and appropriate row count (4 rows)
    - Connect to form state management system
    **Anti-Patterns:**
    - Don't use generic placeholder - provide structured guidance
    - Don't skip required validation - SMART goals are essential
    **Quality Checklist:**
    - [x] Uses structured placeholder for SMART goal guidance
    - [x] Implements required validation
    - [x] Connects to form state management
    - [x] Follows consistent field styling
  - [x] 3.2 Create MetricsBuilder with type-based color schemes (IPG, L&R, Project, Other)
    **Reference Files:**
    - `src/app/examples/cap/components/MetricsBuilder.tsx` - WHEN: Building metrics interface, WHY: Complete working implementation
    - `src/lib/tokens/colors.ts` - WHEN: Applying color schemes, WHY: Consistent semantic color system
    **Implementation Notes:**
    - Initialize with 3 default metrics (IPG, L&R, Project types)
    - Use grid layout (1 col mobile, 3 col desktop) for metric cards
    - Apply color schemes: IPG=primary, L&R=secondary, Project=success, Other=muted
    - Each metric includes name, type selector, and 4-point rating scales
    **Anti-Patterns:**
    - Don't allow empty metrics array - enforce minimum of 3 defaults
    - Don't hardcode colors - use semantic color mapping system
    - Don't create custom layout - use established grid patterns
    **Quality Checklist:**
    - [x] Initializes with 3 default metrics
    - [x] Uses type-based color schemes correctly
    - [x] Implements responsive grid layout
    - [x] Includes proper metric management (add/remove)
  - [x] 3.3 Implement 4-point rating scale inputs for each metric
    **Reference Files:**
    - `src/app/examples/cap/components/MetricsBuilder.tsx` - WHEN: Building rating inputs, WHY: Working 4-point scale implementation
    - `src/components/core/fields/Input.tsx` - WHEN: Creating score inputs, WHY: Consistent field styling
    **Implementation Notes:**
    - Create 4 inputs per metric (scores 4, 3, 2, 1)
    - Use placeholder "What does a [score] look like?" for guidance
    - Store as ratings array with score and description objects
    - Support dynamic updating of individual rating descriptions
    **Anti-Patterns:**
    - Don't use different rating scales - maintain 4-point consistency
    - Don't skip placeholder guidance - provide scoring context
    **Quality Checklist:**
    - [x] Uses consistent 4-point rating scale
    - [x] Provides helpful placeholder text for each score
    - [x] Stores ratings in proper data structure
    - [x] Supports dynamic rating updates
  - [x] 3.4 Add dynamic metric addition/removal with minimum of 3 defaults
    **Reference Files:**
    - `src/app/examples/cap/components/MetricsBuilder.tsx` - WHEN: Implementing add/remove logic, WHY: Working dynamic management
    - `src/components/core/Button.tsx` - WHEN: Creating action buttons, WHY: Consistent button styling
    **Implementation Notes:**
    - Prevent removal when count <= 3 (enforce minimum defaults)
    - Use Plus and Trash2 icons from lucide-react
    - Position Add button in header, Remove buttons on individual cards
    - Initialize new metrics with empty ratings array structure
    **Anti-Patterns:**
    - Don't allow removal below 3 metrics - enforce minimum requirement
    - Don't use custom icons - use established icon library
    **Quality Checklist:**
    - [x] Enforces minimum of 3 metrics
    - [x] Uses consistent add/remove button styling
    - [x] Initializes new metrics with proper structure
    - [x] Positions action buttons appropriately
  - [x] 3.5 Create CoachingMovesBuilder for menu planning
    **Reference Files:**
    - `src/app/examples/cap/components/CoachingMovesBuilder.tsx` - WHEN: Building moves interface, WHY: Complete working implementation
    - `src/components/core/fields/Input.tsx` - WHEN: Creating move inputs, WHY: Consistent field styling
    **Implementation Notes:**
    - Use grid layout (1 col mobile, 3 col desktop) for move cards
    - Each move includes category, specificMove, and toolsResources fields
    - Support dynamic addition and removal of coaching moves
    - Use semantic surface colors for card backgrounds
    **Anti-Patterns:**
    - Don't create custom card styling - use semantic color system
    - Don't skip any of the three required fields per move
    **Quality Checklist:**
    - [ ] Uses responsive grid layout for moves
    - [ ] Includes all three required fields per move
    - [ ] Supports dynamic add/remove functionality
    - [ ] Uses semantic color system for styling
  - [ ] 3.6 Implement category-based coaching move organization
    **PRD Requirements:**
    - Organize moves by category for better navigation
    - Support filtering and search within categories
    - Load predefined categories from coaching-moves.json
    - Allow custom category creation when needed
  - [ ] 3.7 Add tools/resources linking for each coaching move
    **PRD Requirements:**
    - Include Drive Link field for each coaching move
    - Validate link format and accessibility
    - Support multiple resource types (documents, videos, etc.)
    - Integrate with existing resource management system

- [x] 4.0 Build implementation tracking system (Stage 3)
  **Context Stack:** [ui-component-context.md, card-based interfaces, session tracking]
  **Pattern Reference:** [ImplementationRecordCard, session-based tracking patterns]
  **Quality Gate:** [Clean session state management, metric integration consistency]
  - [x] 4.1 Create ImplementationRecordCard for individual session tracking
    **Reference Files:**
    - `src/app/examples/cap/components/ImplementationRecordCard.tsx` - WHEN: Building session cards, WHY: Complete working card implementation
    - `src/components/core/fields/Select.tsx` - WHEN: Creating selection inputs, WHY: Consistent dropdown styling
    **Implementation Notes:**
    - Use card layout with session numbering in header
    - Include date, proposedArc, movesSelected, and metrics fields
    - Support multiple selections for arc and moves (Pre-Brief, Observation, Debrief)
    - Integrate with metrics from Stage 2 for scoring interface
    **Anti-Patterns:**
    - Don't create custom card layout - follow established card patterns
    - Don't duplicate metrics definitions - reference Stage 2 metrics
    **Quality Checklist:**
    - [x] Uses consistent card layout with proper numbering
    - [x] Integrates with existing metrics from Stage 2
    - [x] Supports multiple selections for arc and moves
    - [x] Includes proper session management (add/remove)
  - [x] 4.2 Implement session date and arc selection (Pre-Brief, Observation, Debrief)
    **Reference Files:**
    - `src/components/core/fields/Input.tsx` - WHEN: Creating date inputs, WHY: Consistent date field styling
    - `src/components/core/fields/Select.tsx` - WHEN: Creating arc selection, WHY: Multi-select dropdown pattern
    **Implementation Notes:**
    - Use type="date" for session date input
    - Support multiple arc selection with checkboxes or multi-select
    - Initialize with current date for new sessions
    - Validate arc selections for session completeness
    **Anti-Patterns:**
    - Don't use custom date picker - use native date input
    - Don't limit to single arc selection - support multiple phases
    **Quality Checklist:**
    - [x] Uses native date input for consistency
    - [x] Supports multiple arc phase selection
    - [x] Initializes new sessions with current date
    - [x] Validates session completeness
  - [x] 4.3 Add coaching moves selection from defined menu
    **Reference Files:**
    - `src/app/examples/cap/components/ImplementationRecordCard.tsx` - WHEN: Implementing move selection, WHY: Working dropdown with coaching moves
    - `src/components/core/fields/Select.tsx` - WHEN: Creating move dropdown, WHY: Multi-select pattern
    **Implementation Notes:**
    - Populate dropdown options from Stage 2 coaching moves
    - Format options as "category: specificMove" for clarity
    - Support multiple move selection per session
    - Connect to existing coaching moves data structure
    **Anti-Patterns:**
    - Don't create separate move definitions - reference Stage 2 data
    - Don't limit to single move selection - support multiple moves per session
    **Quality Checklist:**
    - [x] References coaching moves from Stage 2
    - [x] Formats move options with category context
    - [x] Supports multiple move selection
    - [x] Maintains data consistency across stages
  - [x] 4.4 Build metric scoring interface for each session
    **Reference Files:**
    - `src/app/examples/cap/components/ImplementationRecordCard.tsx` - WHEN: Building metric scoring, WHY: Working metric integration pattern
    - `src/components/core/fields/Select.tsx` - WHEN: Creating score dropdowns, WHY: Consistent selection styling
    **Implementation Notes:**
    - Create dropdown for each metric defined in Stage 2
    - Options formatted as "score: description" for context
    - Store scores in metrics object keyed by metric name
    - Support partial scoring (not all metrics required per session)
    **Anti-Patterns:**
    - Don't create separate scoring system - use Stage 2 metric definitions
    - Don't require all metrics per session - support partial scoring
    **Quality Checklist:**
    - [x] Uses metric definitions from Stage 2
    - [x] Formats score options with descriptions
    - [x] Stores scores in proper data structure
    - [x] Supports partial metric scoring
  - [x] 4.5 Create teacher and student notes text areas
    **PRD Requirements:**
    - Include separate text areas for teacher and student observations
    - Support rich text formatting for detailed notes
    - Auto-save notes to prevent data loss
    - Connect to session record for proper data storage
  - [x] 4.6 Implement next steps tracking with completion checkbox
    **PRD Requirements:**
    - Include next step text input for action planning
    - Add completion checkbox for follow-up tracking
    - Support multiple next steps per session if needed
    - Integrate with session workflow for progress tracking
  - [x] 4.7 Add between-session support documentation
    **PRD Requirements:**
    - Include textarea for between-session support notes
    - Support resource linking and documentation
    - Track support provided and impact
    - Connect to overall implementation record
  - [x] 4.8 Create evidence link management for session documentation
    **PRD Requirements:**
    - Include Drive Link field for session evidence
    - Validate link accessibility and format
    - Support multiple evidence types per session
    - Integrate with existing document management system

- [x] 5.0 Develop analysis and reflection interface (Stage 4)
  **Context Stack:** [ui-component-context.md, reflection patterns, goal assessment]
  **Pattern Reference:** [ReflectionSection, goal completion tracking]
  **Quality Gate:** [Structured reflection prompts, evidence-based assessment]
  - [x] 5.1 Create goal completion radio button selection (Yes/No)
    **Reference Files:**
    - `src/app/examples/cap/example3/page.tsx` - WHEN: Building goal completion interface, WHY: Working radio button implementation
    **Implementation Notes:**
    - Use radio button group with Yes/No options
    - Connect to goalMet state with boolean values
    - Include proper labeling and accessibility attributes
    - Position above reflection questions for logical flow
    **Anti-Patterns:**
    - Don't use checkbox - goal completion is binary choice
    - Don't skip accessibility attributes - ensure proper labeling
    **Quality Checklist:**
    - [x] Uses radio buttons for binary choice
    - [x] Includes proper accessibility attributes
    - [x] Connects to boolean state management
    - [x] Positioned logically in reflection flow
  - [x] 5.2 Build impact on learning reflection textarea
    **Reference Files:**
    - `src/app/examples/cap/example3/page.tsx` - WHEN: Building reflection inputs, WHY: Working textarea with proper labeling
    - `src/components/core/fields/Textarea.tsx` - WHEN: Creating reflection areas, WHY: Consistent field styling
    **Implementation Notes:**
    - Use label "What impact did this goal have on student learning?"
    - Set required validation for reflection completeness
    - Use 4 rows for adequate response space
    - Connect to form state management for persistence
    **Anti-Patterns:**
    - Don't make optional - reflection is required for completion
    - Don't use generic label - provide specific reflection prompt
    **Quality Checklist:**
    - [x] Uses specific reflection prompt
    - [x] Implements required validation
    - [x] Provides adequate response space
    - [x] Connects to form state management
  - [x] 5.3 Implement "build on this" planning textarea
    **Reference Files:**
    - `src/app/examples/cap/example3/page.tsx` - WHEN: Building planning textarea, WHY: Working implementation with proper structure
    - `src/components/core/fields/Textarea.tsx` - WHEN: Creating planning input, WHY: Consistent field styling
    **Implementation Notes:**
    - Use label "How can you build on this?"
    - Set required validation for future planning
    - Use 4 rows for detailed planning responses
    - Position after impact reflection for logical flow
    **Anti-Patterns:**
    - Don't make optional - future planning is required
    - Don't use insufficient space - allow for detailed responses
    **Quality Checklist:**
    - [x] Uses specific planning prompt
    - [x] Implements required validation
    - [x] Provides adequate planning space
    - [x] Positioned logically in reflection sequence
  - [x] 5.4 Add teacher spotlight link management
    **Reference Files:**
    - `src/app/examples/cap/example3/page.tsx` - WHEN: Building spotlight input, WHY: Working Drive Link implementation
    - `src/components/core/fields/Input.tsx` - WHEN: Creating link input, WHY: Consistent field styling
    **Implementation Notes:**
    - Use label "Teacher Spotlight Slides"
    - Include placeholder "Drive Link" for guidance
    - Validate link format if value provided
    - Keep optional as not all plans result in spotlights
    **Anti-Patterns:**
    - Don't make required - spotlight creation is optional
    - Don't skip link validation - ensure accessible links when provided
    **Quality Checklist:**
    - [x] Uses descriptive label and placeholder
    - [x] Keeps optional for appropriate use cases
    - [x] Validates link format when provided
    - [x] Integrates with spotlight workflow
  - [x] 5.5 Create structured reflection questions interface
    **PRD Requirements:**
    - Define set of standard reflection questions
    - Support custom question addition
    - Structure responses for analysis and reporting
    - Connect to existing reflection patterns
  - [x] 5.6 Implement ReflectionSection with question/response pairs
    **Reference Files:**
    - `src/app/examples/cap/components/ReflectionSection.tsx` - WHEN: Building reflection display, WHY: Working question/response structure
    **Implementation Notes:**
    - Use structured reflection array with question/response objects
    - Apply gray background styling for question sections
    - Include proper typography hierarchy for readability
    - Support dynamic question addition if needed
    **Anti-Patterns:**
    - Don't use flat structure - maintain question/response pairing
    - Don't skip styling - use established reflection section patterns
    **Quality Checklist:**
    - [x] Uses structured question/response data format
    - [x] Applies consistent reflection section styling
    - [x] Maintains proper typography hierarchy
    - [x] Supports dynamic content when needed
  - [x] 5.7 Add spotlight opportunity suggestions based on progress
    **PRD Requirements:**
    - Analyze implementation progress for spotlight potential
    - Suggest spotlight creation based on success metrics
    - Connect to teacher spotlight workflow
    - Include guidance for spotlight content creation

- [x] 6.0 Create dashboard and plan management interface
  **Context Stack:** [ui-component-context.md, dashboard patterns, list management]
  **Pattern Reference:** [existing resource dashboards, ActionPlanCard displays]
  **Quality Gate:** [Consistent card layouts, progress visualization patterns]
  - [x] 6.1 Build ActionPlanCard with stage completion indicators
    **PRD Requirements:**
    - Display plan summary with key information
    - Show progress indicators for 4 stages
    - Include action buttons for common operations
    - Follow existing card component patterns
    **Reference Files:**
    - `src/components/composed/cards/Card.tsx` - WHEN: Building card layout, WHY: Established card component patterns
    - `src/lib/transformers/utils/coaching-action-plan-utils.ts` - WHEN: Calculating progress, WHY: Progress calculation utilities
    **Implementation Notes:**
    - Created ActionPlanCard with stage completion indicators using calculatePlanProgress utility
    - Includes progress circle with percentage and stage count
    - Stage indicators show completion status with numbered badges
    - Action buttons for edit, duplicate, archive, delete, export operations
    - Status badge with proper color mapping (draft=neutral, active=primary, completed=success, archived=secondary)
    **Quality Checklist:**
    - [x] Uses Card compound component with Header, Body, Footer structure
    - [x] Integrates calculatePlanProgress for stage completion tracking
    - [x] Displays teacher names, school, core action focus
    - [x] Shows formatted creation and update dates
    - [x] Includes proper action button handlers with consistent styling
  - [x] 6.2 Create main dashboard with filtering and search
    **PRD Requirements:**
    - List all coaching action plans with pagination
    - Support filtering by status, coach, teacher, dates
    - Include search functionality across plan content
    - Follow existing dashboard layout patterns
    **Reference Files:**
    - `src/app/dashboard/schools/page.tsx` - WHEN: Building dashboard layout, WHY: Established dashboard patterns
    - `src/components/composed/layouts/ResourceHeader.tsx` - WHEN: Adding search/filter, WHY: Consistent resource management
    **Implementation Notes:**
    - Created CoachingActionPlanDashboard following existing dashboard patterns
    - Uses DashboardPage layout with header, search, and grid display
    - Integrates useCoachingActionPlans.list hook with proper pagination
    - EmptyListWrapper for empty state with create action
    - ResourceHeader for search and sorting functionality
    - Grid layout with responsive columns (1/2/3 columns)
    **Quality Checklist:**
    - [x] Uses DashboardPage layout component
    - [x] Integrates ResourceHeader for search and sorting
    - [x] Implements EmptyListWrapper for empty states
    - [x] Uses ActionPlanCard in responsive grid layout
    - [x] Includes loading states and error handling
  - [x] 6.3 Implement plan status management (draft, active, completed, archived)
    **PRD Requirements:**
    - Define status workflow and transitions
    - Include status-based permissions and visibility
    - Support bulk status operations
    - Integrate with notification system
    **Implementation Notes:**
    - Extended coaching-action-plan-utils.ts with status workflow management including transition validation, requirement checking, and business rules
    - Created StatusTransitionButton component with modal interface for status changes including validation feedback and reason tracking
    - Added status management server actions: updateCoachingActionPlanStatus, bulkUpdateCoachingActionPlanStatus, getAvailableStatusTransitions
    - Integrated status filtering in dashboard with Select dropdown for status-based filtering
    - Status transition overlay on cards with proper validation and error handling
    **Quality Checklist:**
    - [x] Implements status workflow with proper transition validation
    - [x] Creates reusable StatusTransitionButton component
    - [x] Adds server actions for status management with proper error handling
    - [x] Integrates status filtering in dashboard interface
    - [x] Includes proper validation feedback and user guidance

Ready to proceed with implementation! This task breakdown reflects the actual component architecture and interaction patterns from the working examples with enhanced guidance for complex UI components and integration points. 