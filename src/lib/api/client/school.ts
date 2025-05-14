// src/lib/api/client/school.ts
import { apiClient } from './base';
import { School, SchoolInput } from '@/lib/data-schema/zod-schema/core/school';
import { PaginatedResponse } from '@/lib/types/core/response';
import { StandardResponse } from '@/lib/types/core/response';

export const schoolApiClient = {
  list: (params?: Record<string, any>) => 
    apiClient.getPaginated<School>('/schools', params),
  
  getById: (id: string) => 
    apiClient.get<StandardResponse<School>>(`/schools/${id}`),
  
  create: (data: SchoolInput) => 
    apiClient.post<StandardResponse<School>>('/schools', data),
  
  update: (id: string, data: Partial<SchoolInput>) => 
    apiClient.put<StandardResponse<School>>(`/schools/${id}`, data),
  
  delete: (id: string) => 
    apiClient.delete<StandardResponse>(`/schools/${id}`),
  
  bulkUpload: (data: SchoolInput[]) => 
    apiClient.post<StandardResponse>('/schools/bulk-upload', data),
};