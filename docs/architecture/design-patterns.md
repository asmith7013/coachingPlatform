<doc id="core-principles">

# Core Architecture Principles

<section id="architecture-overview">

## Overview

Our AI Coaching Platform is built on a set of foundational architectural principles that guide all development decisions. These high-level principles establish the "why" behind our technical choices and ensure the application remains maintainable, scalable, and aligned with our goals.

[RULE] All development decisions should align with these core principles.

</section>

<section id="schema-driven-philosophy">

## Schema-Driven Philosophy

We adopt a schema-first approach where data definitions precede implementation. This philosophy:

- Establishes a **single source of truth** for all data structures
- Ensures **consistency** across frontend, backend, and database
- Drives **automated code generation** and validation
- Provides a **clear contract** between system components

See `data-flow/schema-system.md` for detailed implementation guidelines.

[RULE] Data structures should be defined abstractly before specific implementations.

</section>

<section id="atomic-composition">

## Atomic Composition

We build complex interfaces from simple, composable parts following progressive levels of complexity. This principle:

- Promotes **reusability** through composition over inheritance
- Establishes **clear boundaries** between layers of abstraction
- Enables **independent testing** of isolated components
- Creates a **shared vocabulary** for UI elements

See `components/component-system.md` for the component hierarchy implementation.

[RULE] Build complex systems from simple, composable parts with clear boundaries.

</section>

<section id="design-token-centralization">

## Design Token Centralization

We centralize design decisions in tokens rather than distributing them throughout the codebase. This principle:

- Creates a **unified design language** across the application
- Simplifies **theme customization** and brand adjustments
- Enforces **consistency** in the user experience
- Reduces **design drift** over time

See `components/styling-patterns.md` for token implementation details.

[RULE] Centralize design decisions in a single source of truth.

</section>

<section id="standardized-interfaces">

## Standardized Interfaces

We establish consistent patterns for communication between system components. This principle:

- Creates **predictable contracts** between modules
- Enables **interchangeable implementations**
- Simplifies **testing and debugging**
- Reduces **cognitive load** for developers

See `data-flow/api-patterns.md` for API standardization guidelines.

[RULE] Define clear, consistent interfaces between system components.

</section>

<section id="server-client-separation">
Server/Client Separation Patterns
API-Safe Fetchers Pattern
To maintain a clean separation between server actions and API routes, we use the API-Safe Fetchers pattern. This pattern prevents "use server" directive conflicts and creates a clear architectural boundary between these components.
See data-flow/api-patterns.md#api-safe-fetchers for detailed implementation guidelines.
[RULE] Maintain clear separation between server actions and API routes through the API-Safe Fetchers pattern.
</section>

<section id="developer-efficiency">

## Developer Efficiency

We optimize for developer productivity and code maintainability. This principle:

- Reduces **repetitive tasks** through automation
- Improves **code comprehension** through consistent patterns
- Accelerates **onboarding** of new developers
- Enables **rapid iteration** on features

See `workflows/development-workflow.md` for developer experience best practices.

[RULE] Value developer efficiency as a foundation for product quality.

</section>

</doc>
design-patterns.md (Revised)
markdown<doc id="design-patterns">

# Cross-Cutting Design Patterns

<section id="patterns-overview">

## Overview

This document describes cross-cutting patterns that apply across multiple domains in our application. It focuses on general approaches rather than specific implementation details, which are covered in domain-specific documentation.

[RULE] Apply these patterns consistently across different application domains.

</section>

<section id="boundary-patterns">

## Component Boundary Patterns

### Single Responsibility

Components should have a single responsibility and minimal dependencies:

```typescript
// Good: Single responsibility
function UserAvatar({ src, alt }) {
  return <img src={src} alt={alt} className="rounded-full" />;
}

// Bad: Mixed concerns
function UserCard({ user, onEdit, onDelete }) {
  // Combines display, editing, and data fetching
}
```
Prop Forwarding
Use destructuring and prop forwarding for component flexibility:

```typescript
function Button({ variant, size, className, ...props }) {
  return (
    <button 
      className={getButtonClasses(variant, size, className)}
      {...props} 
    />
  );
}
```
See components/component-system.md for detailed component implementation guidelines.
[RULE] Establish clear boundaries between components with minimal coupling.
</section>
<section id="composition-patterns">
Component Composition Patterns
Feature Component Structure
Feature components should compose domain components rather than implementing business logic directly:

```typescript
function CoachingDashboard() {
  return (
    <DashboardLayout>
      <SchoolSummaryCard />
      <CoachingMetricsDisplay />
      <UpcomingVisitsList />
    </DashboardLayout>
  );
}
```
Content vs. Container Separation
Separate data-fetching containers from presentational components:

```typescript
// Container with data concerns
function SchoolListContainer() {
  const { schools, loading, error } = useSchools();
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;
  
  return <SchoolList schools={schools} />;
}

// Presentation with no data concerns
function SchoolList({ schools }) {
  return (
    <div>
      {schools.map(school => (
        <SchoolCard key={school.id} school={school} />
      ))}
    </div>
  );
}
```
See components/composed-components.md for detailed composition patterns.
[RULE] Compose feature components from domain-specific building blocks.
</section>

<section id="data-flow-patterns">
Data Flow Patterns
Unidirectional Data Flow
Data should flow down through props, with changes flowing up through callbacks:

```typescript
function ParentComponent() {
  const [value, setValue] = useState('');
  
  return (
    <ChildComponent 
      value={value}
      onChange={(newValue) => setValue(newValue)}
    />
  );
}
```
Prop Drilling Avoidance
Use composition to avoid excessive prop drilling:

```typescript
// Instead of drilling props through multiple levels
function Toolbar({ onSave, onDelete, onPublish }) {
  return (
    <div>
      <SaveButton onClick={onSave} />
      <DeleteButton onClick={onDelete} />
      <PublishButton onClick={onPublish} />
    </div>
  );
}

// Compose the buttons directly in the parent
function Editor() {
  const { save, delete, publish } = useActions();
  
  return (
    <Toolbar>
      <SaveButton onClick={save} />
      <DeleteButton onClick={delete} />
      <PublishButton onClick={publish} />
    </Toolbar>
  );
}
```
See data-flow/schema-system.md for detailed data flow guidelines.
[RULE] Maintain clear, unidirectional data flow throughout the application.
</section>
<section id="state-management-patterns">
State Management Patterns
Local vs. Global State
Keep state as local as possible, lifting it only when necessary:

```typescript
// Local state for component-specific concerns
function Accordion() {
  const [isOpen, setIsOpen] = useState(false);
  // ...
}

// Lifted state for shared concerns
function Form() {
  const [values, setValues] = useState({});
  
  return (
    <>
      <FormInput 
        value={values.name}
        onChange={(name) => setValues({...values, name})}
      />
      <FormInput 
        value={values.email}
        onChange={(email) => setValues({...values, email})}
      />
    </>
  );
}
```
State Derivation
Derive state from props when possible instead of duplicating:

```typescript
// Deriving state from props
function FilteredList({ items, filter }) {
  // Derive filtered items instead of storing in state
  const filteredItems = useMemo(() => {
    return items.filter(item => item.matches(filter));
  }, [items, filter]);
  
  return <List items={filteredItems} />;
}
```
See data-flow/schema-system.md for state management guidelines.
[RULE] Keep state as local as possible and derive computed values.
</section>
<section id="optimization-patterns">
Optimization Patterns
Memoization Boundaries
Use memoization strategically at component boundaries:

```typescript
// Memoize expensive component
const ExpensiveList = memo(function ExpensiveList({ items }) {
  return (
    <div>
      {items.map(item => (
        <ExpensiveItem key={item.id} item={item} />
      ))}
    </div>
  );
});

// Memoize callback to prevent unnecessary rerenders
function Parent() {
  const handleClick = useCallback(() => {
    // Handler implementation
  }, [/* dependencies */]);
  
  return <Child onClick={handleClick} />;
}
```

Code-Splitting
Split code at feature boundaries for optimized loading:

```typescript
// Lazy-load feature components
const Settings = lazy(() => import('./pages/Settings'));
const Analytics = lazy(() => import('./pages/Analytics'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/settings" element={<Settings />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </Suspense>
  );
}
```
See workflows/performance-optimization.md for detailed optimization strategies.
[RULE] Apply optimization techniques thoughtfully at appropriate boundaries.
</section>
</doc>
