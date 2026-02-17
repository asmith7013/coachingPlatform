// Create a new file: src/types/dependency-overrides.d.ts

/**
 * Type declaration overrides for third-party dependencies
 * These declarations fix specific TypeScript errors without modifying node_modules
 */

// Fix for pg-protocol/dist/messages error
declare module "pg-protocol/dist/messages" {
  export const NoticeMessage: unknown;

  // Add other exports that might be needed
  export const parseComplete: unknown;
  export const bindComplete: unknown;
}

// Fix for unplugin/rollup error
declare module "rollup" {
  // Add the missing AcornNode interface
  export interface AcornNode {
    type: string;
    start: number;
    end: number;
    [key: string]: unknown;
  }
}
