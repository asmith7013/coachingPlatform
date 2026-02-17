// src/lib/api/client/base.ts
import { PaginatedResponse } from "@core-types/response";
import {
  CollectionResponse,
  EntityResponse,
  BaseResponse,
} from "@core-types/response";
import { handleClientError } from "@error/handlers/client";

export interface ApiClientOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
}

/**
 * Type guard to check if a response is an EntityResponse
 */
export function isEntityResponse<T>(
  response: unknown,
): response is EntityResponse<T> {
  return Boolean(
    response &&
      typeof response === "object" &&
      response !== null &&
      "data" in response &&
      "success" in response,
  );
}

/**
 * Type guard to check if a response is a CollectionResponse
 */
export function isCollectionResponse<T>(
  response: unknown,
): response is CollectionResponse<T> {
  return Boolean(
    response &&
      typeof response === "object" &&
      response !== null &&
      "items" in response &&
      "success" in response,
  );
}

/**
 * Type guard to check if a response is a PaginatedResponse
 */
export function isPaginatedResponse<T>(
  response: unknown,
): response is PaginatedResponse<T> {
  return Boolean(
    isCollectionResponse<T>(response) &&
      "page" in response &&
      "limit" in response,
  );
}

/**
 * Base API client for making requests to our API routes
 * This is used by React Query hooks to communicate with the backend
 */
export class ApiClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl || "/api";
    this.headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };
  }

  /**
   * Make a generic request to the API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.headers,
          ...(options.headers as Record<string, string>),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `HTTP Error ${response.status}: ${response.statusText}`,
        }));
        const errorMessage =
          typeof errorData === "object" && errorData !== null
            ? errorData.message || errorData.error || "API request failed"
            : "API request failed";
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Handle standardized response format
      if (
        data &&
        typeof data === "object" &&
        "success" in data &&
        typeof data.success === "boolean"
      ) {
        if (!data.success) {
          const errorMessage =
            typeof data.message === "string"
              ? data.message
              : typeof data.error === "string"
                ? data.error
                : "Operation failed";
          throw new Error(errorMessage);
        }
      }

      return data as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(handleClientError(error, "API Request"));
    }
  }

  /**
   * Send a GET request to the API
   */
  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    const queryParams: [string, string][] = [];

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.push([key, String(value)]);
        }
      });
    }

    const queryString =
      queryParams.length > 0
        ? "?" + new URLSearchParams(queryParams).toString()
        : "";

    return this.request<T>(`${endpoint}${queryString}`, {
      method: "GET",
    });
  }

  /**
   * Send a POST request to the API
   */
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Send a PUT request to the API
   */
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Send a DELETE request to the API
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    });
  }

  /**
   * Fetch and return a collection response
   */
  async getCollection<T>(
    endpoint: string,
    params: Record<string, unknown> = {},
  ): Promise<CollectionResponse<T>> {
    return this.get<CollectionResponse<T>>(endpoint, params);
  }

  /**
   * Fetch and return a paginated response
   */
  async getPaginated<T>(
    endpoint: string,
    params: Record<string, unknown> = {},
  ): Promise<PaginatedResponse<T>> {
    return this.get<PaginatedResponse<T>>(endpoint, params);
  }

  /**
   * Fetch and return an entity response
   */
  async getEntity<T>(
    endpoint: string,
    params: Record<string, unknown> = {},
  ): Promise<EntityResponse<T>> {
    return this.get<EntityResponse<T>>(endpoint, params);
  }

  /**
   * Create an entity and return an entity response
   */
  async createEntity<T>(
    endpoint: string,
    data: unknown,
  ): Promise<EntityResponse<T>> {
    return this.post<EntityResponse<T>>(endpoint, data);
  }

  /**
   * Update an entity and return an entity response
   */
  async updateEntity<T>(
    endpoint: string,
    data: unknown,
  ): Promise<EntityResponse<T>> {
    return this.put<EntityResponse<T>>(endpoint, data);
  }

  /**
   * Delete an entity and return a response indicating success
   */
  async deleteEntity(endpoint: string): Promise<BaseResponse> {
    return this.delete<BaseResponse>(endpoint);
  }
}

// Create a default instance
export const apiClient = new ApiClient();
