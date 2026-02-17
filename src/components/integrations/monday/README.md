# Monday.com Integration Components

This folder contains all React components related to the Monday.com integration. The components are organized into logical groups for better maintainability and reusability.

## Folder Structure

- `/boards` - Components for selecting and working with Monday.com boards
- `/common` - Shared components used across Monday integration features
- `/imports` - Components for importing data from Monday.com
- `/users` - Components for searching and displaying Monday.com users
- `/types` - TypeScript interfaces and types used across components
- `/utils` - Utility functions and helpers

## Usage

Import components from the top-level export:

```tsx
import {
  MondayUserFinder,
  ConnectionTest,
} from "@/components/integrations/monday";

function MyComponent() {
  return (
    <div>
      <ConnectionTest />
      <MondayUserFinder onUserSelect={(user) => console.log(user)} />
    </div>
  );
}
```

## Development Guidelines

1. Keep components small and focused on a single responsibility
2. Place shared logic in utility functions
3. Use types from the `/types` folder for consistency
4. Add new components to the appropriate subfolder
5. Export all components through the subfolder's index.ts file
6. Update the main index.ts file to export from new subfolders
