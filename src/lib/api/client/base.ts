// src/lib/api/client/base.ts
import { StandardResponse } from '@core-types/response';
import { PaginatedResponse } from '@core-types/response';
import { handleClientError } from '@error';

export interface ApiClientOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
}

/**
 * Base API client for making requests to our API routes
 * This is used by React Query hooks to communicate with the backend
 */
export class ApiClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl || '/api';
    this.headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: `HTTP Error ${response.status}: ${response.statusText}`,
        }));
        throw new Error(error.message || error.error || 'API request failed');
      }

      const data = await response.json();
      
      // Handle standardized response format
      if (data && typeof data === 'object' && 'success' in data) {
        if (!data.success) {
          throw new Error(data.message || data.error || 'Operation failed');
        }
        // Return the items or data from standardized response
        return data as T;
      }
      
      return data;
    } catch (error) {
      throw new Error(handleClientError(error, 'API Request'));
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const queryString = params 
      ? '?' + new URLSearchParams(params).toString() 
      : '';
    return this.request<T>(`${endpoint}${queryString}`, {
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // Helper method for paginated endpoints
  async getPaginated<T>(
    endpoint: string, 
    params: Record<string, any> = {}
  ): Promise<PaginatedResponse<T>> {
    return this.get<PaginatedResponse<T>>(endpoint, params);
  }
}

// Create a default instance
export const apiClient = new ApiClient();