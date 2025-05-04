```markdown
<doc id="core-components">
Core Components
<section id="core-components-overview">
Overview
Core components form the foundation of our UI system, implementing primitive elements with minimal dependencies that follow our design token system and consistent patterns.
[RULE] Core components should use design tokens directly and implement consistent patterns for variants and state.
</section>
<section id="core-component-principles">
Core Component Principles
Core components follow these key principles:

Token-First Design: Use design tokens directly for all styling
Tailwind Variants: Use tv() for consistent variant patterns
Clean Typings: Export variant types and prop interfaces
Minimal Dependencies: Only depend on tokens and utility functions
Composable API: Design for easy composition in higher-level components

</section>
<section id="core-component-patterns">
Core Component Patterns
Component Variant Pattern
Use Tailwind Variants (tv()) to define component styling:

```typescript
const button = tv({
  base: "inline-flex items-center justify-center transition-colors",
  variants: {
    variant: {
      primary: `bg-blue-600 ${textColors.white} hover:bg-blue-700`,
      secondary: `bg-gray-200 ${textColors.dark} hover:bg-gray-300`,
    },
    size: {
      sm: "text-sm px-2 py-1",
      md: "text-base px-4 py-2",
    },
    disabled: {
      true: "opacity-50 pointer-events-none cursor-not-allowed",
    }
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

export type ButtonVariants = VariantProps<typeof button>;
```
Compound Component Pattern
For components with multiple parts, use the Context API:

```typescript
// Define variants with slots
const alertVariants = tv({
  slots: {
    root: "relative w-full p-4 rounded-md border",
    title: "text-lg font-semibold mb-1",
    description: "text-sm",
  },
  variants: {
    variant: {
      default: { root: "bg-background text-foreground" },
      primary: { root: "bg-blue-50 text-blue-900" },
    }
  }
});

// Create context and components
const AlertContext = createContext<AlertContextValue>(/* default */);

const AlertRoot = ({ variant, children, ...props }) => (
  <AlertContext.Provider value={{ variant, /* other values */ }}>
    <div role="alert" className={/* styles */}>
      {children}
    </div>
  </AlertContext.Provider>
);

// Export as compound component
export const Alert = Object.assign(AlertRoot, {
  Title: AlertTitle,
  Description: AlertDescription,
});
```
[RULE] Use these patterns based on component complexity.
</section>
<section id="core-implementation-examples">
Key Implementation Examples
Button Component
The Button component demonstrates compound variants and state handling:

```typescript
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant, size, disabled, loading, className, children, ...props }, 
    ref
  ) {
    return (
      <button
        ref={ref}
        className={cn(button({ variant, size, disabled: disabled || loading }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full border-2 border-t-transparent" />
            <span className="sr-only">Loading</span>
          </div>
        ) : (
          children
        )}
      </button>
    );
  }
);
```
Alert Component
The Alert component demonstrates the compound component pattern:

```typescript
// Root component with context
const AlertRoot = ({ variant, children, icon, ...props }) => (
  <AlertContext.Provider value={/* context value */}>
    <div role="alert" className={/* styles */} {...props}>
      {icon && <div className={/* styles */}>{icon}</div>}
      <div>{children}</div>
    </div>
  </AlertContext.Provider>
);

// Subcomponents
const AlertTitle = ({ children, ...props }) => (
  <h5 {...props}>{children}</h5>
);

const AlertDescription = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

// Export compound component
export const Alert = Object.assign(AlertRoot, {
  Title: AlertTitle,
  Description: AlertDescription,
});
```
</section>

<section id="core-components-usage">
Usage Guidelines
Basic Components

```tsx
<Button variant="primary" size="lg">Save Changes</Button>
<Button variant="outline" disabled>Cancel</Button>
```
Compound Components

```tsx
<Alert variant="primary" icon={<InfoCircleIcon />}>
  <Alert.Title>Important Information</Alert.Title>
  <Alert.Description>Please read carefully before proceeding.</Alert.Description>
</Alert>
```
Extending Core Components

```tsx
function SaveButton({ saving, ...props }) {
  return (
    <Button 
      variant="primary"
      loading={saving}
      {...props}
    >
      {saving ? 'Saving...' : 'Save Changes'}
    </Button>
  );
}
```
[RULE] Use these patterns for consistent UI development.
</section>

</doc>
```
