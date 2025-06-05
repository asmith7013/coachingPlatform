<section id="1-coaching-action-plan-detailed-editing">
## 1. Coaching Action Plan Detailed Editing

**Status:** PLANNED  
**Priority:** High  
**Effort:** Large  
**Business Value:** High

### Core Definition
**Problem:** Users can currently only edit basic metadata (title, dates, status) of coaching action plans through a limited modal dialog. The rich 4-stage content (IPG focus selection, SMART goals, metrics, coaching moves, implementation tracking, monitoring, and reflection) cannot be accessed or edited, severely limiting the platform's coaching functionality.

**Solution:** Create a comprehensive multi-stage editing interface in a drawer layout with tabbed navigation, allowing users to access and edit all coaching action plan stages with auto-save functionality and seamless navigation between stages.

### Requirements Overview
- Must open detailed editing in a drawer interface (not full page)
- Must provide tabbed navigation for all 4 stages that remains visible throughout editing
- Must integrate auto-save functionality using existing enterprise auto-save system
- Must allow free navigation between stages without forced linear progression
- Must persist partially completed stage data automatically
- Must integrate with existing coaching action plan components (Stage1-4)
- Must maintain consistency with current design system and navigation patterns

### Scope & Boundaries

**In Scope:**
- Drawer-based multi-stage editing interface
- Integration of existing CoachingActionPlanStage1-4 components
- Simple auto-save implementation (2-3 day development timeline)
- Tabbed navigation between stages
- Navigation menu integration as top-level item
- Date field fixes in detailed editor
- Integration with existing CoachingActionPlanDashboard

**Out of Scope:**
- Access control and permissions (future consideration)
- Quick edit dialog modifications (focus on detailed editor)
- Complex auto-save features (conflict resolution, real-time collaboration, offline support)
- Mobile-specific optimizations (desktop-first approach)
- Save status indicators (auto-save will be invisible to users)

### UI/UX Considerations

**Key Interactions:**
- Drawer opens from "Edit" action in coaching action plan dashboard
- Persistent tab navigation at top of drawer for stages 1-4
- Invisible auto-save (2-second delay after user stops typing)
- Smooth transitions between stages without data loss
- Clear visual hierarchy with stage-specific content areas
- No save status indicators needed (auto-save is fast and reliable)

**Component Strategy:**
- Extend existing Drawer component for multi-stage layout
- Reuse existing CoachingActionPlanStage1-4 components with minimal modifications (add planId prop)
- Create new TabbedStageNavigation component
- Build simple useAutoSave hook for invisible auto-saving
- Maintain design token consistency with current patterns

### Technical Architecture

**Dependencies:**
- Simple auto-save hook (new, 30-minute implementation)
- Current CoachingActionPlanStage1-4 components
- Existing Drawer component from design system
- useCoachingActionPlans hook for data management
- MongoDB partial update capabilities
- Lodash debounce utility

**Implementation Approach:**
- Create new coaching action plans route: `/dashboard/coaching-action-plans`
- Implement drawer-based editing with stage tabs
- Build simple auto-save with 2-second debounced saving (no complex infrastructure)
- Add basic partial update server action
- Leverage existing React Query patterns for cache management

### Data Requirements

**Schema Changes:**
- Add basic stage-level data fields to CoachingActionPlan model (stage1, stage2, stage3, stage4)
- No complex versioning or metadata fields needed

**Integration Points:**
- Simple useAutoSave hook with debounced saving
- Basic server action for partial updates (updateCoachingActionPlanPartial)
- Standard React Query cache invalidation patterns

### User Journey

**Primary Flow:**
1. User navigates to Coaching Action Plans from dashboard navigation
2. User clicks "Edit" on an existing plan
3. Drawer opens with Stage 1 selected by default
4. User can freely navigate between stages using tabs
5. Auto-save occurs invisibly 2 seconds after any change (no user feedback needed)
6. User closes drawer when finished (no explicit save needed)

**Secondary Flows:**
- User can create new plan and immediately access detailed editing
- User can navigate away and return with all changes automatically preserved
- If auto-save fails, it logs error silently (user can manually save if needed)

### Success Metrics
- Increase coaching action plan completion rate by 40%
- Reduce time spent on plan creation/editing by 25%
- Achieve 99.9% data persistence reliability with auto-save
- Zero reported data loss incidents after implementation

### Dependencies
**Requires:** 
- Enterprise auto-save system implementation
- Enhanced server actions for partial updates
- Navigation menu configuration updates

**Blocks:** 
- Advanced collaboration features (builds foundation for future real-time editing)

### Implementation Strategy

**Recommended Context Templates:**
- Primary: ui-component-context.md (drawer interface, tabbed navigation)
- Secondary: data-layer-context.md (auto-save integration, server actions)
- Domain Reference: coaching

**Staging Approach:**
1. Navigation Integration (add coaching plans menu item)
2. Route & Page Creation (dashboard/coaching-action-plans)
3. Drawer Component Development (tabbed multi-stage interface)
4. Auto-Save Integration (enterprise system integration)
5. Stage Component Integration (existing Stage1-4 components)
6. Testing & Polish (edge cases, error handling)

**Quality Gates:**
- DRY: Reuse existing CoachingActionPlanStage components without duplication
- Abstraction: Drawer fits composed component layer, auto-save fits utility layer
- Separation: Single responsibility - drawer handles layout, stages handle content, auto-save handles persistence

### Open Questions
- Should stage completion status be visually indicated in the tab navigation?
- How should we handle large form data in the auto-save system (debouncing strategy)?
- Should we provide a "discard changes" option or rely entirely on auto-save?
- What's the optimal drawer width for multi-stage content display?

</section>