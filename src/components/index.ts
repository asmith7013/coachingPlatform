// Core components
export * from "./core";

// Composed components
// Export specific components from composed/forms to avoid conflicts with core
export * from "./composed/tables";
export * from "./composed/cards";
export * from "./composed/dialogs";

// Domain-specific components are intentionally not re-exported here
// to avoid unnecessary imports. Import them directly from their respective folders.
// e.g.: import { StaffCard } from '@/components/domain/staff';

// Layout components
export * from "./composed/layouts";

// Shared components
