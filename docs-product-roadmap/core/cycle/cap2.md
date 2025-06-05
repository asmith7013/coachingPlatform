# Coaching Action Plan Detailed Editing - Task List

**Epic Status:** PLANNED  
**Priority:** High  
**Effort:** Large  
**Business Value:** High

## Overview
Create a comprehensive multi-stage editing interface in a drawer layout with tabbed navigation, allowing users to access and edit all coaching action plan stages with auto-save functionality and seamless navigation between stages.

---

## Context Strategy

**Primary Context Template:** ui-component-context.md (drawer interface, tabbed navigation)
**Secondary Context Template:** data-layer-context.md (auto-save integration, server actions)
**Domain Reference:** coaching

## Relevant Files

**Pattern References:**
- `src/components/core/layout/Drawer.tsx` - WHEN: drawer implementation, WHY: established drawer component pattern
- `src/components/features/coaching/CoachingActionPlanStage1.tsx` - WHEN: stage integration, WHY: existing stage component patterns
- `src/components/features/coaching/CoachingActionPlanStage2.tsx` - WHEN: stage integration, WHY: existing stage component patterns  
- `src/components/features/coaching/CoachingActionPlanStage3.tsx` - WHEN: stage integration, WHY: existing stage component patterns
- `src/components/features/coaching/CoachingActionPlanStage4.tsx` - WHEN: stage integration, WHY: existing stage component patterns
- `src/hooks/domain/useCoachingActionPlans.ts` - WHEN: data management, WHY: existing data fetching patterns
- `src/app/dashboard/coaching-action-plans/components/CoachingActionPlanDashboard.tsx` - WHEN: navigation integration, WHY: existing dashboard patterns

**New Files to Create:**
- `src/components/features/coaching/CoachingActionPlanDetailedEditor.tsx` - PURPOSE: drawer-based multi-stage editor
- `src/components/core/navigation/TabbedStageNavigation.tsx` - PURPOSE: stage navigation tabs component
- `src/hooks/utilities/useAutoSave.ts` - PURPOSE: invisible auto-save functionality
- `src/app/actions/coaching-action-plans/update-partial.ts` - PURPOSE: partial update server action

**Created Files:**
- `src/app/dashboard/coaching-action-plans/page.tsx` - CREATED: main coaching plans dashboard page using existing CoachingActionPlanDashboard component

**Modified Files:**
- `src/lib/types/core/auth.ts` - MODIFIED: added COACHING_PLANS_VIEW, COACHING_PLANS_CREATE, COACHING_PLANS_EDIT permissions and assigned to Coach roles
- `src/app/dashboard/config.ts` - MODIFIED: added Coaching Plans navigation item with ClipboardDocumentCheckIcon and page metadata
- `src/hooks/ui/useNavigation.ts` - MODIFIED: added 'coaching-action-plans' special case for breadcrumb display

## Tasks

- [x] 1.0 Navigation Integration & Route Setup
  **Context Stack:** Dashboard navigation, routing configuration
  **Pattern Reference:** Existing dashboard navigation structure
  **Quality Gate:** Single responsibility - navigation handles routing, page handles display

  - [x] 1.1 Add coaching action plans to navigation configuration
    **Reference Files:**
    - `src/app/dashboard/config.ts` - WHEN: adding navigation item, WHY: established navigation pattern
    - `src/hooks/ui/useAuthorizedNavigation.ts` - WHEN: permissions setup, WHY: role-based access control
    **Implementation Notes:**
    - Add navigation item to `navigationItems` array with appropriate icon and permissions
    - Use `AcademicCapIcon` or similar coaching-related icon from Heroicons
    - Include `requiredPermissions: [PERMISSIONS.COACHING_PLANS_VIEW]` for access control
    - Set `href: '/dashboard/coaching-action-plans'` for routing
    **Anti-Patterns:**
    - Don't create custom navigation logic - use existing navigationItems pattern
    - Don't hardcode permissions - use PERMISSIONS constants
    **Quality Checklist:**
    - [ ] Uses existing NavigationItem interface structure
    - [ ] Includes proper permission-based access control
    - [ ] Follows established icon and naming patterns
    - [ ] Integrates with authorized navigation hook

  - [x] 1.2 Create main dashboard route and page structure
    **Reference Files:**
    - `src/app/dashboard/layout.tsx` - WHEN: understanding layout patterns, WHY: consistent page structure
    - `src/app/dashboard/schoolList/page.tsx` - WHEN: implementing page structure, WHY: established dashboard page pattern
    **Implementation Notes:**
    - Create `src/app/dashboard/coaching-action-plans/page.tsx` as main route
    - Use server component pattern for initial data loading
    - Include proper page metadata and SEO configuration
    - Follow established error boundary and loading state patterns
    **PRD Requirements:**
    - Route must be accessible from dashboard navigation
    - Must integrate with existing permission system
    - Must provide foundation for detailed editing drawer

  - [x] 1.3 Configure breadcrumb and page navigation
    **Reference Files:**
    - `src/hooks/ui/useNavigation.ts` - WHEN: breadcrumb integration, WHY: consistent navigation experience
    - `src/components/core/navigation/Breadcrumbs.tsx` - WHEN: breadcrumb display, WHY: navigation consistency
    **Implementation Notes:**
    - Update `pageMetadata` in dashboard config for coaching plans page
    - Ensure breadcrumb generation works with new route structure
    - Configure page title and description for AppShell integration
    **Quality Checklist:**
    - [ ] Breadcrumbs display correctly from dashboard home
    - [ ] Page title appears in AppShell header
    - [ ] Navigation state updates properly when on coaching plans page

- [x] 2.0 Dashboard Page & Component Creation  
  **Context Stack:** Page layout, dashboard components, data fetching
  **Pattern Reference:** Existing dashboard patterns and component hierarchy
  **Quality Gate:** DRY - reuse existing dashboard layout patterns

  - [x] 2.1 Create coaching action plans dashboard component
    **Reference Files:**
    - `src/app/dashboard/coaching-action-plans/components/CoachingActionPlanDashboard.tsx` - WHEN: implementing dashboard, WHY: existing dashboard component pattern
    - `src/components/domain/coaching/ActionPlanCard.tsx` - WHEN: displaying plan cards, WHY: established card display pattern
    **Implementation Notes:**
    - Reuse existing CoachingActionPlanDashboard component if available
    - Follow established dashboard layout with search, filters, and grid display
    - Include "Create New Plan" button prominently positioned
    - Use ActionPlanCard components for plan display
    **Anti-Patterns:**
    - Don't create custom dashboard layout - reuse existing patterns
    - Don't duplicate card display logic - use ActionPlanCard component
    **Quality Checklist:**
    - [x] Reuses existing dashboard component structure
    - [x] Integrates ActionPlanCard components properly
    - [x] Includes proper loading and error states
    - [x] Follows established grid layout patterns

  - [x] 2.2 Integrate data fetching with existing hooks
    **Reference Files:**
    - `src/hooks/domain/useCoachingActionPlans.ts` - WHEN: data fetching, WHY: established data management pattern
    - `src/app/actions/coaching/coaching-action-plans.ts` - WHEN: server actions, WHY: server-side data operations
    **Implementation Notes:**
    - Use existing `useCoachingActionPlans` hook for data fetching
    - Leverage React Query patterns for cache management
    - Include proper error handling and loading states
    - Follow established server action patterns for CRUD operations
    **PRD Requirements:**
    - Must integrate with existing coaching action plan data model
    - Must support real-time updates with React Query
    - Must handle error states gracefully

  - [x] 2.3 Add detailed editor access integration
    **Reference Files:**
    - `src/components/domain/coaching/ActionPlanCard.tsx` - WHEN: adding edit functionality, WHY: existing card action patterns
    **Implementation Notes:**
    - Add "Edit" button to action plan cards that opens detailed editor
    - Pass plan ID and data to detailed editor component
    - Ensure proper state management between dashboard and editor
    - Follow established modal/drawer opening patterns
    **Quality Checklist:**
    - [x] Edit button follows existing ActionPlanCard button patterns
    - [x] Proper data flow from dashboard to detailed editor
    - [x] Maintains existing card functionality (duplicate, archive, etc.)

- [ ] 3.0 Drawer-Based Multi-Stage Editor Development
  **Context Stack:** Drawer component, tabbed navigation, stage integration
  **Pattern Reference:** Existing Drawer component and composed component patterns
  **Quality Gate:** Abstraction - drawer fits composed component layer

  - [ ] 3.1 Create tabbed stage navigation component
    **Reference Files:**
    - `src/components/core/navigation/Breadcrumbs.tsx` - WHEN: navigation patterns, WHY: consistent navigation UI
    - `src/components/composed/layouts/NavigationSidebar.tsx` - WHEN: tab styling, WHY: established navigation styling patterns
    **Implementation Notes:**
    - Create `TabbedStageNavigation` component with stages 1-4 as tabs
    - Use consistent styling with existing navigation components
    - Include stage completion indicators (visual badges/checkmarks)
    - Support keyboard navigation between tabs
    - Make tabs persistent and always visible during editing
    **Anti-Patterns:**
    - Don't create custom tab logic - follow established navigation patterns
    - Don't hide tabs based on completion - keep all stages accessible
    **Quality Checklist:**
    - [ ] Uses consistent styling with existing navigation components
    - [ ] Supports keyboard navigation (arrow keys, Enter)
    - [ ] Shows stage completion status visually
    - [ ] Remains visible and functional throughout editing

  - [ ] 3.2 Build detailed editor drawer container
    **Reference Files:**
    - `src/components/composed/drawers/Drawer.tsx` - WHEN: drawer implementation, WHY: established drawer component pattern
    - `src/app/demo/drawer/page.tsx` - WHEN: understanding drawer usage, WHY: implementation examples
    **Implementation Notes:**
    - Use existing Drawer component with `size="lg"` for adequate space
    - Configure drawer with `position="right"` and `background="white"`
    - Include persistent header with plan title and close functionality
    - Embed TabbedStageNavigation in drawer header
    - Set up drawer body to contain stage-specific content
    **Implementation Notes:**
    - Follow compound component pattern: Drawer.Header, Drawer.Title, Drawer.Body
    - Configure auto-focus management for accessibility
    - Include proper ARIA labels for screen readers
    **Quality Checklist:**
    - [ ] Uses existing Drawer component (not custom implementation)
    - [ ] Proper size and positioning for multi-stage content
    - [ ] Includes accessible focus management
    - [ ] Header contains both title and navigation tabs

  - [ ] 3.3 Implement stage routing and content management
    **Reference Files:**
    - `src/components/features/coaching/CoachingActionPlanStage1.tsx` - WHEN: stage integration, WHY: existing stage component patterns
    - `src/components/features/coaching/CoachingActionPlanStage2.tsx` - WHEN: stage integration, WHY: existing stage component patterns
    - `src/components/features/coaching/CoachingActionPlanStage3.tsx` - WHEN: stage integration, WHY: existing stage component patterns
    - `src/components/features/coaching/CoachingActionPlanStage4.tsx` - WHEN: stage integration, WHY: existing stage component patterns
    **Implementation Notes:**
    - Create stage state management with React useState for current stage
    - Implement stage switching without data loss (maintain all stage states)
    - Pass planId prop to each stage component for data identification
    - Ensure stage components receive proper onChange handlers for auto-save
    - Handle stage validation and completion tracking
    **Anti-Patterns:**
    - Don't modify existing stage components - extend them with planId prop
    - Don't force linear progression - allow free navigation between stages
    - Don't lose data when switching stages - maintain state properly
    **Quality Checklist:**
    - [ ] Reuses existing CoachingActionPlanStage1-4 components without modification
    - [ ] Allows free navigation between all stages
    - [ ] Maintains stage data when switching between stages
    - [ ] Passes planId to stage components for proper data binding

- [ ] 4.0 Auto-Save System Integration
  **Context Stack:** Auto-save hook, server actions, React Query patterns
  **Pattern Reference:** Enterprise auto-save system patterns
  **Quality Gate:** Separation - auto-save handles persistence, editor handles UI

  - [ ] 4.1 Create simple auto-save hook with debounced saving
    **Reference Files:**
    - `src/hooks/domain/useCoachingActionPlans.ts` - WHEN: data operations, WHY: existing data management patterns
    - `src/app/actions/coaching/coaching-action-plans.ts` - WHEN: server actions, WHY: established server action patterns
    **Implementation Notes:**
    - Create `useAutoSave` hook with 2-second debounced saving (lodash debounce)
    - Accept planId, data, and onSave callback as parameters
    - Return save status (idle, saving, saved, error) for optional UI feedback
    - Include error handling with retry logic (3 attempts)
    - Make auto-save invisible to users (no loading indicators required)
    **Implementation Notes:**
    - Use React useCallback and useRef for stable function references
    - Implement cleanup on unmount to prevent memory leaks
    - Log errors silently without interrupting user workflow
    **Anti-Patterns:**
    - Don't show save status to users - auto-save should be invisible
    - Don't implement complex conflict resolution - simple last-write-wins
    - Don't save on every keystroke - use 2-second debounce
    **Quality Checklist:**
    - [ ] Uses lodash debounce with 2-second delay
    - [ ] Handles errors gracefully without user interruption
    - [ ] Cleans up properly on component unmount
    - [ ] Remains invisible to users (no save indicators needed)

  - [ ] 4.2 Create partial update server action
    **Reference Files:**
    - `src/app/actions/coaching/coaching-action-plans.ts` - WHEN: server action patterns, WHY: established CRUD operations
    **Implementation Notes:**
    - Create `updateCoachingActionPlanPartial` server action
    - Accept planId and partial data (single stage or field updates)
    - Use MongoDB partial update operations ($set) for efficiency
    - Include proper error handling and validation
    - Return success/error status for auto-save hook consumption
    **PRD Requirements:**
    - Must support stage-level partial updates
    - Must maintain data integrity during partial saves
    - Must integrate with existing server action patterns
    **Quality Checklist:**
    - [ ] Uses MongoDB $set operations for efficient partial updates
    - [ ] Includes proper input validation and sanitization
    - [ ] Follows existing server action error handling patterns
    - [ ] Returns consistent response format for hook consumption

  - [ ] 4.3 Integrate auto-save with stage components
    **Reference Files:**
    - `src/components/features/coaching/CoachingActionPlanStage1.tsx` - WHEN: integration points, WHY: understanding existing onChange patterns
    **Implementation Notes:**
    - Add auto-save hook to main detailed editor component
    - Pass auto-save enabled onChange handlers to each stage component
    - Ensure stage data changes trigger auto-save after 2-second delay
    - Handle stage switching without triggering unnecessary saves
    - Include error recovery (retry on failure, log errors silently)
    **Implementation Notes:**
    - Create wrapper functions that combine stage onChange with auto-save
    - Use stage-specific data keys (stage1, stage2, stage3, stage4) for partial updates
    - Maintain React Query cache consistency after auto-save operations
    **Quality Checklist:**
    - [ ] Stage components trigger auto-save through provided onChange handlers
    - [ ] Auto-save operates independently of stage navigation
    - [ ] React Query cache stays synchronized with auto-saved data
    - [ ] Error states don't interrupt user workflow

- [ ] 5.0 Stage Component Integration & Testing
  **Context Stack:** Existing stage components, data flow, testing patterns
  **Pattern Reference:** Coaching action plan stage component patterns
  **Quality Gate:** DRY - reuse existing Stage1-4 components without duplication

  - [ ] 5.1 Extend stage components with planId prop support
    **Reference Files:**
    - `src/components/features/coaching/CoachingActionPlanStage1.tsx` - WHEN: prop interface updates, WHY: understanding existing prop patterns
    - `src/components/features/coaching/CoachingActionPlanStage2.tsx` - WHEN: prop interface updates, WHY: maintaining consistency
    - `src/components/features/coaching/CoachingActionPlanStage3.tsx` - WHEN: prop interface updates, WHY: maintaining consistency  
    - `src/components/features/coaching/CoachingActionPlanStage4.tsx` - WHEN: prop interface updates, WHY: maintaining consistency
    **Implementation Notes:**
    - Add optional `planId?: string` prop to each stage component interface
    - Use planId for data identification and auto-save operations
    - Maintain backward compatibility with existing usage (planId optional)
    - Update TypeScript interfaces in domain types file
    - Ensure existing functionality remains unchanged
    **Anti-Patterns:**
    - Don't break existing stage component functionality
    - Don't make planId required - maintain backward compatibility
    - Don't modify existing prop interfaces - only extend them
    **Quality Checklist:**
    - [ ] All stage components accept optional planId prop
    - [ ] Existing stage component usage continues to work
    - [ ] TypeScript interfaces updated properly
    - [ ] Backward compatibility maintained for existing implementations

  - [ ] 5.2 Implement data loading and initialization for existing plans
    **Reference Files:**
    - `src/hooks/domain/useCoachingActionPlans.ts` - WHEN: data fetching patterns, WHY: established data loading
    **Implementation Notes:**
    - Load existing plan data when planId is provided
    - Initialize stage components with existing data using initialData props
    - Handle loading states while fetching plan data
    - Provide fallback empty state for new plan creation
    - Ensure data loading doesn't block stage navigation
    **PRD Requirements:**
    - Must load existing plan data for editing
    - Must support creating new plans from scratch
    - Must handle loading states gracefully
    **Quality Checklist:**
    - [ ] Existing plan data loads properly into stage components
    - [ ] New plan creation starts with empty/default state
    - [ ] Loading states don't prevent stage navigation
    - [ ] Data initialization follows existing patterns

  - [ ] 5.3 Add end-to-end testing for complete workflow
    **Reference Files:**
    - Existing test files for guidance on testing patterns
    **Implementation Notes:**
    - Create integration tests for complete editing workflow
    - Test stage navigation and data persistence
    - Verify auto-save functionality with mock server actions
    - Test error handling and recovery scenarios
    - Include accessibility testing for drawer and tab navigation
    **Implementation Notes:**
    - Use existing testing framework (Jest, React Testing Library)
    - Mock server actions and auto-save operations
    - Test keyboard navigation and focus management
    - Verify screen reader accessibility
    **Quality Checklist:**
    - [ ] Complete workflow tests (create, edit, save, navigate)
    - [ ] Auto-save functionality tested with mocked delays
    - [ ] Accessibility tests pass for keyboard and screen reader users
    - [ ] Error scenarios handled gracefully in tests

## Success Metrics
- [ ] **40% reduction** in coaching plan completion time
- [ ] **Enhanced user satisfaction** with multi-stage editing interface  
- [ ] **99.9% data persistence reliability** with auto-save
- [ ] **Zero data loss incidents** during stage navigation
- [ ] **Improved accessibility scores** for drawer and tab navigation
