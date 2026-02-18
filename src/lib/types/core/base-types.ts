/**
 * Core primitives used across the type system
 * These types have minimal dependencies and serve as building blocks
 */

import type { Types } from "mongoose";

/**
 * Base identity interface for all document-like types
 */
export interface Identifiable {
  _id: string | Types.ObjectId;
  id?: string;
}

/**
 * Base pagination parameters without any implementation details
 */
export interface PaginationBase {
  page?: number;
  limit?: number;
}

/**
 * Base query parameters that extend pagination
 */
export interface QueryBase extends PaginationBase {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Base response interface for all API responses
 */
export interface ResponseBase {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Base error context for error reporting
 */
export interface ErrorContextBase {
  component?: string;
  operation?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Base document interface extending identifiable
 */
export interface DocumentBase extends Identifiable {
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
