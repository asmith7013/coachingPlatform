/**
 * Form Field Configuration Exports
 * Domain-organized barrel exports for all form field configurations
 *
 * Architecture:
 * - Domain-based organization (coaching, observations, staff, integrations)
 * - Schema-derived field configurations using createFormFields factory
 * - Legacy compatibility exports during migration
 */

// Domain exports
export * from "./coaching";
export * from "./observations";
export * from "./staff";
export * from "./integrations";
export * from "./school";
export * from "./school";
