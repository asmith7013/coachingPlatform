"use server";

import { debugMondayAPIIssue } from "@/lib/api/integrations/monday-debug";

/**
 * Server action that exposes the Monday.com API debug functionality
 */
export async function runMondayDebug(boardId: string) {
  return debugMondayAPIIssue(boardId);
} 