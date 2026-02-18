# Toast Notification Usage Guide

This project uses two different toast notification systems. This guide explains when to use each.

## Available Toast Systems

### 1. Atomic Toast Component (`useToast` hook)

**Location:** `@/components/core/feedback/Toast`

**When to use:**

- When you need **multiple simultaneous toasts** displayed at once
- When you need to show **progressive updates** or **multi-step processes**
- When you want **precise control** over when toasts appear and disappear
- When building **status dashboards** or **progress tracking UIs**

**Example use cases:**

- Multi-step import processes (fetch → process → complete)
- Bulk operations with parallel progress tracking
- Real-time status updates that need to persist
- Complex workflows where multiple statuses need to be visible simultaneously

**Usage:**

```tsx
import { useToast } from "@/components/core/feedback/Toast";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/solid";

function MyComponent() {
  // Create separate toast instances for each concurrent notification
  const fetchToast = useToast();
  const processToast = useToast();
  const resultToast = useToast();

  const handleOperation = async () => {
    // Step 1: Show fetching
    fetchToast.showToast({
      title: "Fetching data...",
      variant: "info",
      icon: InformationCircleIcon,
    });

    // ... fetch operation ...
    fetchToast.hideToast();

    // Step 2: Show processing
    processToast.showToast({
      title: "Processing records...",
      description: "This may take a moment",
      variant: "info",
      icon: InformationCircleIcon,
    });

    // ... process operation ...
    processToast.hideToast();

    // Step 3: Show result
    resultToast.showToast({
      title: "Success!",
      description: "Operation completed successfully",
      variant: "success",
      icon: CheckCircleIcon,
    });
  };

  return (
    <div>
      {/* Render all toast components */}
      <fetchToast.ToastComponent />
      <processToast.ToastComponent />
      <resultToast.ToastComponent />

      {/* Your UI */}
    </div>
  );
}
```

**Advantages:**

- Multiple toasts can be displayed simultaneously
- Full control over lifecycle (show/hide timing)
- Consistent with the existing design system
- Better for complex multi-step operations
- Visual progress indication with separate toasts

**Limitations:**

- Requires manual state management for each toast
- Must explicitly call `showToast()` and `hideToast()`
- Need to render `<ToastComponent />` for each instance
- Toasts auto-hide after 4 seconds (customizable in the hook)

---

### 2. Sonner Toast Library

**Location:** `sonner` package

**When to use:**

- For **simple, single notifications** (success/error/info messages)
- When you need **loading states** with automatic transitions
- For **quick feedback** that doesn't require multiple concurrent toasts
- When you want **minimal boilerplate** code

**Example use cases:**

- Form submission success/error messages
- Simple validation errors
- Quick user feedback ("Saved!", "Deleted", etc.)
- Single-step operations with loading → success/error flow

**Usage:**

```tsx
import { toast } from "sonner";

function MyComponent() {
  const handleSave = async () => {
    // Show loading toast (returns ID for updating)
    const toastId = toast.loading("Saving...");

    try {
      await saveData();

      // Update same toast to success
      toast.success("Saved successfully!", { id: toastId });
    } catch (error) {
      // Update same toast to error
      toast.error("Save failed", { id: toastId });
    }
  };

  // No need to render any component - sonner handles it globally

  return (
    <div>
      <button onClick={handleSave}>Save</button>
    </div>
  );
}
```

**Advantages:**

- Very simple API - just call `toast.success()`, `toast.error()`, etc.
- No need to render toast components
- Can update existing toasts by ID
- Automatic queueing and stacking of notifications
- Built-in loading → success/error transitions

**Limitations:**

- Only one toast of each type visible at a time (by default)
- Less control over positioning and styling
- May not match your design system perfectly
- Not ideal for showing multiple concurrent progress updates

---

## Decision Matrix

| Scenario                                        | Use Atomic Toast            | Use Sonner                   |
| ----------------------------------------------- | --------------------------- | ---------------------------- |
| Multi-step process with visible progress        | ✅                          | ❌                           |
| Simple success/error message                    | ⚠️ (works but overkill)     | ✅                           |
| Multiple simultaneous status updates            | ✅                          | ❌                           |
| Form validation feedback                        | ❌                          | ✅                           |
| Bulk operations with parallel tracking          | ✅                          | ❌                           |
| Quick "Saved!" confirmation                     | ❌                          | ✅                           |
| Import/sync workflows (fetch → process → done)  | ✅                          | ⚠️ (possible but less clear) |
| Loading state that transitions to success/error | ⚠️ (requires manual timing) | ✅                           |

---

## Examples from Codebase

### Atomic Toast Example

See: `/src/app/scm/podsie/import-attendance/page.tsx`

This page uses **three separate toast instances** to show:

1. Fetching data from API
2. Processing/importing records
3. Final result with statistics

```tsx
const fetchToast = useToast();
const processToast = useToast();
const resultToast = useToast();
```

### Sonner Example

For simple pages that just need success/error notifications:

```tsx
import { toast } from "sonner";

// Validation error
if (!email) {
  toast.error("Email is required");
  return;
}

// Save success
await saveData();
toast.success("Changes saved!");
```

---

## Best Practices

1. **Don't mix both systems on the same page** - Choose one approach and stick with it for consistency

2. **Use Atomic Toast for complex operations:**
   - Data imports/exports
   - Multi-step wizards
   - Bulk operations
   - Real-time status tracking

3. **Use Sonner for simple feedback:**
   - Form submissions
   - Delete confirmations
   - Save operations
   - Validation messages

4. **Consider user experience:**
   - Will users benefit from seeing multiple progress steps? → Atomic Toast
   - Do users just need to know "it worked" or "it failed"? → Sonner

5. **Remember auto-hide behavior:**
   - Atomic Toast: Auto-hides after 4 seconds
   - Sonner: Configurable duration, defaults to a few seconds

---

## Migration Tips

If you're updating an existing page that uses Sonner and need to switch to Atomic Toast:

1. Import the hook: `import { useToast } from "@/components/core/feedback/Toast";`
2. Create toast instance(s): `const myToast = useToast();`
3. Replace `toast.success()` with `myToast.showToast({ title: "...", variant: "success" })`
4. Add icons: `import { CheckCircleIcon } from "@heroicons/react/24/solid"`
5. Render component: `<myToast.ToastComponent />`

---

## Summary

- **Atomic Toast** = Multiple concurrent toasts, precise control, multi-step processes
- **Sonner** = Simple notifications, minimal code, single-step feedback

Choose based on complexity and user experience needs!
